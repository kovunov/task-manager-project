#!/bin/sh
set -e
echo "=== Starting Task Manager API ==="

echo "Checking postgres connection..."
RETRIES=30
DELAY=2
until [ "$RETRIES" -eq 0 ] || nc -z postgres 5432; do
  echo "Waiting for postgres, $RETRIES attempts remaining..."
  sleep "$DELAY"
  RETRIES=$((RETRIES-1))
done

if [ "$RETRIES" -eq 0 ]; then
  echo "Error: Database connection timed out"
  exit 1
fi
echo "Database is available!"

echo "Running database migrations..."
yarn workspace api prisma migrate deploy

echo "Seeding database..."
yarn workspace api prisma db seed

echo "Starting server..."
yarn workspace api start:prod
