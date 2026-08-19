#!/bin/bash

# Script to start Redis for development
# Supports both Docker and Podman

set -e

REDIS_IMAGE="redis:7-alpine"
CONTAINER_NAME="fwn-redis"
PORT="6379"

# Check if Redis is already running
if command -v podman &> /dev/null; then
    if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        echo "✅ Redis container '${CONTAINER_NAME}' is already running"
        exit 0
    fi
    CONTAINER_CMD="podman"
elif command -v docker &> /dev/null; then
    if docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        echo "✅ Redis container '${CONTAINER_NAME}' is already running"
        exit 0
    fi
    CONTAINER_CMD="docker"
else
    echo "❌ Neither Podman nor Docker is installed"
    echo "Please install Podman or Docker, or start Redis manually"
    exit 1
fi

echo "🚀 Starting Redis with ${CONTAINER_CMD}..."

# Pull image if needed
${CONTAINER_CMD} pull ${REDIS_IMAGE} 2>/dev/null || true

# Start Redis container
${CONTAINER_CMD} run -d \
  --name ${CONTAINER_NAME} \
  -p ${PORT}:6379 \
  --restart unless-stopped \
  ${REDIS_IMAGE} \
  redis-server --appendonly yes

echo "✅ Redis started successfully on port ${PORT}"
echo "   Container name: ${CONTAINER_NAME}"
echo "   To stop: ${CONTAINER_CMD} stop ${CONTAINER_NAME}"
echo "   To remove: ${CONTAINER_CMD} rm ${CONTAINER_NAME}"

