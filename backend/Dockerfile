FROM node:20.9.0-alpine

# Install dependencies for next.js
RUN apk add --no-cache libc6-compat

# Working folder
WORKDIR /app

# Copy package.json and lock file first to leverage caching
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install --frozen-lockfile --ignore-scripts --prefer-offline

# Copy the rest of the code and build
COPY . ./

# Generate Prisma client before build
RUN yarn prisma generate

# Build the Next.js app
RUN yarn build

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

# Create log folder and give permissions to node user
RUN mkdir -p /app/data/logs && chown -R nodejs:nodejs /app/data

USER nodejs

# Expose Next.js-port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
