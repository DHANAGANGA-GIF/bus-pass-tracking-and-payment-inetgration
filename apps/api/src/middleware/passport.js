'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { prisma } = require('../config/db');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/security');
const { env } = require('../config/env');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: profile.emails?.[0]?.value },
              { googleId: profile.id }
            ]
          }
        });

        if (user) {
          // Update Google ID if not already set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id }
            });
          }
        } else {
          // Create new user with Google account
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value,
              fullName: profile.displayName,
              googleId: profile.id,
              emailVerified: true, // Google accounts are pre-verified
              role: 'USER'
            }
          });
        }

        // Generate tokens
        const crypto = require('crypto');
        const familyId = crypto.randomUUID();
        const accessToken = generateAccessToken({
          userId: user.id,
          role: user.role,
          email: user.email
        });
        const refreshToken = generateRefreshToken({
          userId: user.id,
          familyId
        });

        const { hashToken } = require('../utils/security');
        const refreshTokenHash = hashToken(refreshToken);

        // Store refresh token
        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            tokenHash: refreshTokenHash,
            familyId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        });

        // Create session
        await prisma.session.create({
          data: {
            userId: user.id,
            ipAddress: 'unknown', // In real app, get from request
            userAgent: 'google-oauth'
          }
        });

        return done(null, {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          },
          accessToken,
          refreshToken
        });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
