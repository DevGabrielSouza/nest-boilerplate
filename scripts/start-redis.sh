#!/bin/sh
set -e

echo "🚀 Starting Redis worker"
yarn start:dev redis
