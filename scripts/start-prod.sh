#!/bin/sh

npx prisma generate
npx prisma migrate deploy

yarn start:prod:api

exec "$@"
