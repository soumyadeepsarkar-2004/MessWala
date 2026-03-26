FROM node:18-alpine

# Set non-root user and secure permissions
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Install production dependencies first to leverage caching
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY . .

# Secure file permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

# Use node instead of npm for the entrypoint (better signal handling)
CMD ["node", "server.js"]
