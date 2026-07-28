# Security Design

This document outlines the security measures implemented in the Bus Pass Booking Platform to protect user data, ensure secure transactions, and maintain system integrity.

## 1. Authentication

### 1.1. Password Security
- **Hashing**: Passwords are hashed using Argon2id with a minimum memory cost of 64MB, time cost of 3 iterations, and parallelism of 2.
- **Salt**: Unique salt generated for each password.
- **Policy**: Enforce strong passwords (minimum 12 characters, mix of uppercase, lowercase, numbers, and special characters).

### 1.2. Multi-Factor Authentication (MFA)
- **Optional TOTP**: Users can enable Time-based One-Time Password (TOTP) using apps like Google Authenticator or Authy.
- **Backup Codes**: Generated during MFA setup for account recovery.
- **Recovery**: If MFA device is lost, users can use backup codes or go through account recovery process.

### 1.3. Session Management
- **JSON Web Tokens (JWT)**: Used for stateless authentication.
  - Access Token: Short-lived (15 minutes), stored in memory (not in localStorage/sessionStorage to mitigate XSS).
  - Refresh Token: Long-lived (7 days), stored in HTTP-only, Secure, SameSite cookies.
- **Refresh Token Rotation**: Upon each use, a new refresh token is issued and the old one is invalidated.
- **Session Invalidation**: On logout, password change, or security event, all sessions are invalidated by updating a token version in the database.
- **Concurrent Sessions**: Users can view and terminate active sessions from the settings page.

### 1.4. OAuth 2.0
- **Google Sign-In**: Implemented using OAuth 2.0 with PKCE for security.
- **Token Storage**: Access tokens are stored securely; refresh tokens are not used for OAuth (short-lived access tokens with silent refresh via iframe or backend exchange).

### 1.5. Brute Force Protection
- **Rate Limiting**: Login and OTP endpoints are rate-limited (e.g., 5 attempts per 15 minutes per IP).
- **Account Lockout**: After 5 failed login attempts, account is temporarily locked for 15 minutes.
- **CAPTCHA**: After repeated failures, CAPTCHA is required.

## 2. Authorization

### 2.1. Role-Based Access Control (RBAC)
- **Roles**: `USER`, `ADMIN`, `SUPER_ADMIN`.
- **Permissions**: Fine-grained permissions assigned to roles (e.g., `USER:READ_OWN_PROFILE`, `ADMIN:MANAGE_USERS`).
- **Middleware**: Express middleware checks permissions for each route.
- **Resource Ownership**: Users can only access their own resources unless they have explicit permissions (e.g., admin can view any user).

### 2.2. Attribute-Based Access Control (ABAC) (Future)
- Consider for more complex scenarios (e.g., managers can only view users in their department).

## 3. Data Protection

### 3.1. Data at Rest
- **Database**: PostgreSQL with Transparent Data Encryption (TDE) enabled at the infrastructure level (if using managed service) or via filesystem encryption.
- **Backups**: Encrypted and stored securely.
- **Secrets**: API keys, database passwords, etc., stored in environment variables or secret management services (AWS Secrets Manager, HashiCorp Vault).

### 3.2. Data in Transit
- **TLS 1.3**: Enforced for all communications (HTTPS, WSS).
- **Certificate Management**: Automated certificate renewal via Let's Encrypt or cloud provider.
- **HSTS**: HTTP Strict Transport Security header with max-age of 63072000 days (2 years) and includeSubDomains.

### 3.3. Sensitive Data Handling
- **PCI DSS**: Payment card details are never stored on our servers. All payment processing is done via PCI-compliant gateways (Razorpay, Stripe).
- **PII**: Personal data (name, email, phone) is encrypted at the application level for highly sensitive fields (if required by regulations like GDPR).
- **Data Minimization**: Only collect data necessary for the service.

## 4. API Security

### 4.1. Input Validation
- **Schema Validation**: All incoming data validated using Zod schemas before processing.
- **Sanitization**: Input sanitized to prevent XSS and SQL injection (though ORM/parameterized queries prevent SQLi).
- **Whitelisting**: For free-text fields, restrict to safe characters where possible.

### 4.2. Authentication & Authorization
- **Middleware**: All API routes require authentication (except public endpoints) and check permissions.
- **Token Validation**: JWT signature, expiration, and issuer validated.
- **Scope Checking**: For OAuth, validate scopes.

### 4.3. Rate Limiting
- **Global**: Applied to all API endpoints (e.g., 100 requests per 15 minutes per IP).
- **Per-Endpoint**: Stricter limits on sensitive endpoints (e.g., login, password reset, payment).
- **Distribution**: Redis-based rate limiting for multi-instance deployments.

### 4.4. CORS (Cross-Origin Resource Sharing)
- **Policy**: Only allow requests from trusted domains (the frontend applications).
- **Configuration**: 
  - Development: `http://localhost:3000` (and variants for admin/super admin)
  - Production: `https://user.buspass.example.com`, `https://admin.buspass.example.com`, etc.

### 4.5. Security Headers
- **Helmet.js**: Used to set security-related HTTP headers.
  - `Content-Security-Policy`: Restricts sources for scripts, styles, images, etc.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`: Restricts browser features (geolocation, microphone, etc.)
  - `Strict-Transport-Security`: Already mentioned.

### 4.6. HTTP Method Validation
- Only allow necessary HTTP methods (GET, POST, PUT, PATCH, DELETE) per endpoint.

### 4.7. Request Size Limitation
- Limit the size of request bodies to prevent DoS via large payloads (e.g., 10MB for JSON, 100MB for file uploads).

## 5. Client-Side Security

### 5.1. Cross-Site Scripting (XSS)
- **Framework**: React automatically escapes strings in JSX, preventing most XSS.
- **Dangerous HTML**: Avoid `dangerouslySetInnerHTML`; if used, sanitize with DOMPurify.
- **Content Security Policy (CSP)**: As defined above, mitigates impact of any XSS that might occur.

### 5.2. Cross-Site Request Forgery (CSRF)
- **SameSite Cookies**: Authentication cookies are set with `SameSite=Strict` or `SameSite=Lax`.
- **CSRF Tokens**: For state-changing operations (if using cookie-based auth without SameSite), but with JWT in headers and SameSite cookies, CSRF risk is low.
- **Double Submit Cookie**: Alternative if needed.

### 5.3. Dependency Management
- **Regular Updates**: Dependencies updated regularly using tools like Dependabot or Renovate.
- **Vulnerability Scanning**: Use `npm audit` or `yarn audit` in CI/CD; integrate with Snyk or similar.
- **Lockfiles**: `package-lock.json` or `yarn.lock` to ensure deterministic builds.

## 6. Infrastructure Security

### 6.1. Network Security
- **Firewalls**: Restrict incoming traffic to necessary ports (e.g., 80, 443 for web; 22 for SSH only from allowed IPs).
- **Private Networks**: Databases and caches deployed in private subnets, not exposed to the public internet.
- **DDoS Protection**: Use cloud provider's DDoS protection services (AWS Shield, Cloudflare).

### 6.2. Server Hardening
- **Minimal Images**: Use minimal base images (e.g., `node:alpine`) for containers.
- **Non-Root User**: Containers run as non-root user.
- **Read-Only Filesystem**: Where possible, mount filesystem as read-only except for specific volumes.

### 6.3. Secrets Management
- **Environment Variables**: Used for configuration, but prefer secret managers in production (AWS Secrets Manager, HashiCorp Vault).
- **Encryption at Rest**: Secrets encrypted in storage.

### 6.4. Monitoring & Logging
- **Audit Logs**: All security-relevant events (login, logout, permission changes, data access) logged.
- **Error Tracking**: Sentry for real-time error alerting.
- **Log Retention**: Logs retained for minimum 90 days (or as per compliance requirements).
- **SIEM**: Logs forwarded to a Security Information and Event Management (SIEM) system for correlation and alerting.

### 6.5. Vulnerability Management
- **Regular Scanning**: Quarterly vulnerability assessments and penetration tests.
- **Patch Management**: Critical patches applied within 48 hours.

## 7. Secure Development Lifecycle (SDLC)

### 7.1. Training
- Developers trained in secure coding practices (OWASP Top 10, CWE/SANS Top 25).

### 7.2. Threat Modeling
- Conducted during design phase for new features.

### 7.3. Code Review
- Security considerations part of pull request reviews.

### 7.4. Static Application Security Testing (SAST)
- Integrated into CI/CD pipeline (e.g., SonarQube, Checkmarx).

### 7.5. Dynamic Application Security Testing (DAST)
- Periodic scanning of running applications (e.g., OWASP ZAP, Burp Suite).

### 7.6. Dependency Scanning
- As mentioned in section 5.3.

## 8. Compliance

### 8.1. GDPR
- **Data Subject Rights**: Implement procedures for access, rectification, erasure, portability.
- **Data Processing Agreement (DPA)**: With third-party processors (payment gateways, email/SMS providers).
- **Data Protection Officer (DPO)**: Designate if required.

### 8.2. PCI DSS
- **Scope Reduction**: By using third-party payment processors, we reduce PCI scope to SAQ A-EP.
- **Third-Party Validation**: Ensure payment processors are PCI DSS compliant.

### 8.3. ISO 27001
- Align security practices with ISO 27001 standards for information security management.

## 9. Incident Response

### 9.1. Plan
- Have an incident response plan covering detection, containment, eradication, recovery, and post-incident analysis.

### 9.2. Communication
- Clear communication channels for reporting security issues (e.g., security@buspass.example.com).

### 9.3. Notification
- Procedures for notifying affected users and regulators in case of a data breach (as per GDPR, etc.).

## 10. Testing

### 10.1. Security Testing
- **Penetration Testing**: Annual third-party penetration tests.
- **Vulnerability Scanning**: Quarterly automated scans.
- **Red Team/Blue Team Exercises**: Bi-annual exercises.

### 10.2. Test Data
- Use anonymized or synthetic data for testing; never use production data in non-secure environments.

## Conclusion
Security is a continuous process. This document outlines the baseline security measures for the Bus Pass Booking Platform. Regular reviews, updates, and adaptations to emerging threats are essential to maintain a strong security posture.

---
*Last Updated: 2026-07-28*