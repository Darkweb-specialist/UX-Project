# Multi-stage Dockerfile for Smart Food Donation Node.js Backend
FROM node:24-alpine AS base

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy backend application source code
COPY backend/ ./

# Expose API port
EXPOSE 5000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
