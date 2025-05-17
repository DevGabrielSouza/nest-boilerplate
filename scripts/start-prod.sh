#!/bin/sh

# 1. Aplicar as migrações
npx prisma generate
npx prisma migrate deploy

npm yarn start:prod

# 3. Iniciar a aplicação
exec "$@"
