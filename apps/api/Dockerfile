FROM node:22-alpine

# Install dependencies in a single layer
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package files for caching
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install dependencies
RUN yarn install

# Copy the rest of the app
COPY . .

# Generate Prisma client and build the app
RUN yarn workspace api prisma generate && \
    yarn workspace api build

# Set environment variable to indicate Docker environment
ENV DOCKER_ENV=true

# Copy startup scripts
COPY apps/api/scripts/*.sh /app/
RUN chmod +x /app/*.sh

# Expose port
EXPOSE 5002

# Use a simple command as the entry point
CMD ["/bin/sh", "/app/start.sh"]