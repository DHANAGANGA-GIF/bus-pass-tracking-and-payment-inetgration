# Folder Structure

## Root Level
```
bus-pass-platform/
├── apps/
│   ├── web/                # Next.js frontend (User Portal)
│   ├── admin/              # Next.js frontend (Admin Portal) - to be created
│   └── super-admin/        # Next.js frontend (Super Admin Portal) - to be created
├── packages/
│   ├── shared/             # Shared TypeScript types, utilities, constants
│   ├── ui/                 # Shared UI components (if using a design system across apps)
│   ├── config/             # Shared ESLint, TypeScript, etc. configs
│   └── utils/              # Shared utility functions
├── docs/                   # Documentation (this folder)
├── scripts/                # Scripts (e.g., deployment, DB migration, seeding)
├── .github/                # GitHub Actions for CI/CD
├── Dockerfile              # For Dockerizing the entire app (if using a single Dockerfile) or docker-compose
├── docker-compose.yml      # For local development (PostgreSQL, Redis, etc.)
├── turbo.json              # Turborepo configuration
├── package.json            # Root package.json (workspaces configuration)
├── pnpm-workspace.yaml     # If using pnpm (optional, if using npm/yarn workspaces)
├── .env.example            # Example environment variables
├── .eslintrc.js            # Root ESLint config (if using)
├── .prettierrc             # Root Prettier config (if using)
└── README.md               # Project README
```

## Apps Breakdown

### apps/web (User Portal)
```
apps/web/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (routes)/       # Route groups (e.g., (auth), (dashboard))
│   │   ├── api/            # API routes (if using Next.js API routes, but we have separate API app)
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   ├── layout.tsx      # Layout for route groups
│   │   └── ...             # Other pages
│   ├── components/         # React components
│   │   ├── ui/             # ShadCN UI components
│   │   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   │   └── ...             # Other components
│   ├── lib/                # Utility functions, API clients, etc.
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   ├── styles/             # Global styles, Tailwind CSS config
│   ├── types/              # TypeScript types (if not using shared package)
│   └── ...                 # Other folders (constants, utils, etc.)
├── public/                 # Static assets
├── .eslintrc.js            # ESLint config
├── .prettierrc             # Prettier config
├── postcss.config.js       # PostCSS config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config (if using Vite) or next.config.js
├── package.json            # App-specific dependencies
└── README.md               # App-specific README
```

### apps/api (Backend API)
```
apps/api/
├── src/
│   ├── controllers/        # Request handlers (Express controllers)
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer (Prisma models)
│   ├── middleware/         # Custom Express middleware
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration (environment variables)
│   ├── validators/         # Input validation (Zod schemas)
│   ├── routes/             # API route definitions
│   ├── lib/                # Library initializations (Prisma client, Redis client, etc.)
│   ├── jobs/               # Background jobs (if using BullMQ directly)
│   └── index.ts            # Entry point
├── prisma/
│   ├── schema.prisma       # Prisma schema definition
│   └── migrations/         # Database migrations
├── .eslintrc.js            # ESLint config
├── .prettierrc             # Prettier config
├── tsconfig.json           # TypeScript config
├── package.json            # App-specific dependencies
└── README.md               # App-specific README
```

### apps/admin (Admin Portal) - To be created
### apps/super-admin (Super Admin Portal) - To be created

## Packages Breakdown

### packages/shared
```
packages/shared/
├── src/
│   ├── types/              # Shared TypeScript interfaces and types
│   ├── constants/          # Shared constants (e.g., role types, status enums)
│   ├── utils/              # Shared utility functions
│   └── ...                 # Other shared code
├── package.json            # Package configuration
└── tsconfig.json           # TypeScript config
```

### packages/ui (Optional)
```
packages/ui/
├── src/
│   ├── components/         # Shared UI components (e.g., buttons, inputs, modals)
│   └── styles/             # Shared styles (if using a CSS-in-JS solution)
├── package.json
└── tsconfig.json
```

### packages/config (Optional)
```
packages/config/
├── eslint/
│   ├── base.js             # Base ESLint config
│   ├── react.js            # React-specific ESLint config
│   └── node.js             # Node.js-specific ESLint config
├── prettier/
│   └── config.js           # Shared Prettier config
├── typescript/
│   ├── base.json           # Base TypeScript config
│   ├── react.json          # React-specific TypeScript config
│   └── node.json           # Node.js-specific TypeScript config
├── package.json
└── tsconfig.json
```

## Infrastructure

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: buspass_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: buspass_redis
    restart: unless-stopped
    ports:
      - "6379:6379"

  # Optional: Adminer for database management
  adminer:
    image: adminer
    container_name: buspass_adminer
    restart: unless-stopped
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

## Environment Variables (.env.example)
```
# Node Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_change_in_production
REFRESH_TOKEN_EXPIRES_IN=7d

# Argon2
ARGON2_SALT_LENGTH=16
ARGON2_HASH_LENGTH=32
ARGON2_PARALLELISM=2
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Payment Gateways (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Payment Gateways (Stripe) - Future
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=onboarding@resend.dev

# SMS Service (MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=YOURSENDERID

# Push Notification Service (FCM)
FCM_SERVICE_ACCOUNT_KEY=path/to/firebase/serviceAccountKey.json

# Storage Service (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name

# Storage Service (Cloudinary) - Alternative
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn

# Feature Flags
ENABLE_2FA=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# App URLs
APP_URL=http://localhost:3000
ADMIN_APP_URL=http://localhost:3000/admin
SUPER_ADMIN_APP_URL=http://localhost:3000/super-admin
API_URL=http://localhost:3000/api/v1
```

## Notes
- The `apps/web` is the user portal (Next.js).
- The `apps/admin` and `apps/super-admin` are to be created similarly to `apps/web` but with different role-based access.
- The `apps/api` is the backend API (Node.js/Express).
- The `packages/shared` contains TypeScript interfaces, enums, and utilities shared between frontend and backend.
- The `packages/ui` (optional) can contain shared UI components if we want to maintain consistency across apps.
- The `packages/config` (optional) can contain shared ESLint, Prettier, and TypeScript configurations.
- The `docker-compose.yml` sets up PostgreSQL and Redis for local development.
- The `.env.example` file provides a template for environment variables.