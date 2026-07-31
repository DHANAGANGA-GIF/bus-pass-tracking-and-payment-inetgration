FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --workspaces --if-present

COPY apps/api/tsconfig.json ./
COPY apps/api/src/ ./src/
COPY apps/api/prisma/ ./prisma/
RUN npm run build --workspace=@bus-pass/api

FROM nginx:alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]