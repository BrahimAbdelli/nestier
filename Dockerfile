# =====================================
# Stage 1: Development
# =====================================
FROM node:20-alpine AS development

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =====================================
# Stage 2: Production Dependencies
# =====================================
FROM node:20-alpine AS production-deps

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# =====================================
# Stage 3: Production
# =====================================
FROM node:20-alpine AS production

# Add labels for better image management
LABEL maintainer="Brahim Abdelli"
LABEL version="2.0.1"
LABEL description="Nestier - NestJS Hexagonal Architecture Boilerplate"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy only necessary files from build stages
COPY --from=production-deps /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/templates ./templates
COPY --from=development /usr/src/app/public ./public
COPY package*.json ./

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /usr/src/app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/liveness || exit 1

# Start the application
CMD ["node", "dist/main"]

