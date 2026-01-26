#!/bin/sh
set -e

echo "🚀 Starting PROD environment"

echo "📦 Generating Prisma Client"
npx prisma generate

echo "🗄️ Applying database migrations (prod)"
npx prisma migrate deploy

echo "▶️ Starting API"
yarn start:prod:api
