FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/tsconfig.json ./
RUN npm install --workspaces --if-present

COPY apps/api/src/ ./src/
COPY apps/api/prisma/ ./prisma/
RUN npm run build --workspace=@bus-pass/api

FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev --workspaces --if-present

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --spider -q http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]