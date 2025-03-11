FROM node:18-alpine

# Install OpenSSL - required for Prisma client
RUN apk add --no-cache openssl openssl-dev

# Install SSL compatibility libraries
RUN apk add --no-cache libc6-compat

# Set up working directory
WORKDIR /app

RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.npmjs.org/

# Copy package files
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

RUN yarn install

COPY . .

# Generate Prisma client
RUN yarn workspace api prisma generate

# Build the application
RUN yarn workspace api build

# Create an init.sh script that will run migrations and seed the database
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
yarn workspace api prisma migrate deploy\n\
\n\
echo "Seeding the database..."\n\
yarn workspace api prisma db seed\n\
\n\
echo "Starting API server..."\n\
yarn workspace api dev\
' > /app/init.sh && chmod +x /app/init.sh

EXPOSE 5002

# Start initialization script which runs migrations, seed, then starts the app
CMD ["/bin/sh", "/app/init.sh"]
