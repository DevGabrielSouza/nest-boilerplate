#!/bin/sh
set -e

echo "🚀 Starting DEV environment"

echo "📦 Generating Prisma Client"
npx prisma generate

echo "🗄️ Applying database migrations (dev)"
npx prisma migrate dev --name init --skip-seed || npx prisma migrate deploy

echo "▶️ Starting API (dev mode)"
yarn start:dev api
