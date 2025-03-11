FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Set yarn to use a more reliable registry and increase network timeout
RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.npmjs.org/

# Copy package files
COPY package.json yarn.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install dependencies with retry mechanism
RUN yarn install || yarn install || yarn install

# Copy source files
COPY . .

# Build the application
RUN yarn workspace web build
# Start the application
CMD ["yarn", "workspace", "web", "dev"]
