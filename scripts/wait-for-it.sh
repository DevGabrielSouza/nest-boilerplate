#!/bin/sh

# Script to wait for a host and port to become available
set -e

HOST="$1"
PORT="$2"
shift 2
CMD="$@"

echo "Waiting for $HOST:$PORT to be available..."

# Keep checking until the host and port are accessible
while ! nc -z "$HOST" "$PORT"; do
  sleep 2
  echo "Still waiting for $HOST:$PORT..."
done

echo "$HOST:$PORT is now available. Starting the application..."
exec $CMD
