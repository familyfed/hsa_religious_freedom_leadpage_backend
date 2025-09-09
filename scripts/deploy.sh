#!/bin/bash

# HSA Religious Freedom Petition Backend Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="hsa-petition-backend"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from env.example"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t $PROJECT_NAME:$ENVIRONMENT .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start new containers
echo "🚀 Starting new containers..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Check if application is running
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "🎉 Deployment successful!"
    echo "📊 Application is running at http://localhost:3001"
    echo "🔍 Health check: http://localhost:3001/health"
else
    echo "❌ Deployment failed - application is not healthy"
    echo "📋 Checking logs..."
    docker-compose logs api
    exit 1
fi

# Show running containers
echo "📋 Running containers:"
docker-compose ps

echo "✅ Deployment completed successfully!"
