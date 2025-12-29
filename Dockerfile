# Multi-stage build for Next.js + Prisma (MySQL)

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG API_PROXY_URL
ARG APP_MODE
ENV API_PROXY_URL=$API_PROXY_URL
ENV APP_MODE=$APP_MODE
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client compatible with linux-musl
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG API_PROXY_URL
ARG APP_MODE
ENV API_PROXY_URL=$API_PROXY_URL
ENV APP_MODE=$APP_MODE
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

# Copy package files and install only production deps + prisma CLI
COPY package*.json ./
RUN npm ci --only=production && npm install prisma@^6.19.0

# Copy standalone server output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma Client runtime (needed for server-side Prisma usage)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Sync DB schema and start server
CMD sh -c "if [ \"${RUN_DB_PUSH:-1}\" = \"1\" ]; then node node_modules/prisma/build/index.js db push --skip-generate; fi; node server.js"
