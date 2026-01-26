#!/bin/sh
set -e

HOST="$1"
PORT="$2"
shift 2
CMD="$@"

echo "⏳ Waiting for $HOST:$PORT..."

while ! nc -z "$HOST" "$PORT"; do
  sleep 2
done

echo "✅ $HOST:$PORT is available"
exec $CMD
