#!/bin/sh

echo "Iniciando script start-dev.sh"

# 1. Aplicar as migrações
echo "Gerando o Prisma Client"
npx prisma generate

echo "Aplicando migrações ao banco de dados"
npx prisma db push --force-reset

# 2. Iniciar a aplicação
echo "Iniciando a aplicação com Yarn"
yarn start:dev api
