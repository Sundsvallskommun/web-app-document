FROM node:20.9.0-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Install dependencies for Next.js
RUN apk add --no-cache libc6-compat

# Set the working directory
WORKDIR /app

# Copy package.json and lock files to install dependencies
COPY package.json yarn.lock next.config.js ./

# Install all dependencies (including devDependencies)
RUN yarn install --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:20.9.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the code and build
COPY . .

ENV NEXT_TELEMTRY_DISABLED=1

# Build the Next.js app
RUN yarn build

FROM node:20.9.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system nodejs && adduser --system nextjs

# Copy only necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
