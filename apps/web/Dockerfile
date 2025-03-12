FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install dependencies with retry mechanism
RUN yarn install

# Copy source files
COPY . .

# Build the application
RUN yarn workspace web build

# Expose the port that the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "workspace", "web", "start"]
