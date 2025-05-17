#!/bin/sh
echo "Iniciando API"

# Aplicar as migrações
echo "Gerando Prisma Client"
npx prisma generate

echo "Aplicando migrações"
npx prisma db push --force-reset

# Iniciar API
echo "Iniciando API"
yarn start:dev api
