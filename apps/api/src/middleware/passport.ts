import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { generateAccessToken, generateRefreshToken, hashToken, hashPassword } from '../utils/security.js';
import { env } from '../config/env.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userEmail = profile.emails?.[0]?.value;
        if (!userEmail) {
          return done(new Error('No email found in Google profile'), false);
        }

        let user = await prisma.user.findFirst({
          where: { email: userEmail }
        });

        if (user) {
          if (!user.emailVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: true }
            });
          }
        } else {
          const dummyPasswordHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
          const dummyPhone = `+1000${Math.floor(10000000 + Math.random() * 90000000)}`;

          user = await prisma.user.create({
            data: {
              email: userEmail,
              fullName: profile.displayName || 'Google User',
              phoneNumber: dummyPhone,
              passwordHash: dummyPasswordHash,
              emailVerified: true,
              role: 'USER'
            }
          });
        }

        const familyId = crypto.randomUUID();
        const accessTok = generateAccessToken({
          userId: user.id,
          role: user.role,
          email: user.email
        });

        const refreshTok = generateRefreshToken({
          userId: user.id,
          familyId
        });

        const refreshTokenHash = hashToken(refreshTok);

        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            tokenHash: refreshTokenHash,
            familyId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

        await prisma.session.create({
          data: {
            userId: user.id,
            ipAddress: 'unknown',
            userAgent: 'google-oauth'
          }
        });

        return done(null, {
          ...user,
          accessToken: accessTok,
          refreshToken: refreshTok
        });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
