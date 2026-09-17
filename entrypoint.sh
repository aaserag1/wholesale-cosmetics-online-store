#!/bin/sh
set -e

echo "🚀 Initializing BeautyMart B2B Store..."

if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Synchronizing database schema..."
  npx drizzle-kit push --dialect=postgresql --schema=./src/db/schema.ts --url="$DATABASE_URL" || true
  
  echo "🌱 Seeding initial data..."
  npx tsx src/db/seed.ts || true
fi

echo "✨ Starting Next.js server on port 3000..."
exec node server.js