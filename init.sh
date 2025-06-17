#!/bin/bash

echo "🚀 Initializing Emotion Propagation Analysis System..."

# Check dependencies
echo "Checking system dependencies..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p frontend/{app,components,lib,hooks,store,public}
mkdir -p backend/src/{modules,common,config}
mkdir -p scraper
mkdir -p emotion-analyzer
mkdir -p nginx

# Build Docker images
echo "Building Docker images..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
docker-compose ps

echo ""
echo "✅ Initialization complete!"
echo ""
echo "Access the application:"
echo "  - Frontend: http://localhost"
echo "  - API: http://localhost/api"
echo "  - API Docs: http://localhost/api/docs"
echo ""
echo "Default credentials:"
echo "  - Username: admin"
echo "  - Password: admin"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"