#!/bin/bash

echo "🔧 Fixing and restarting Emotion Analysis System..."

# Stop all containers
echo "Stopping existing containers..."
docker-compose down

# Clean up
echo "Cleaning up..."
docker system prune -f

# Rebuild without cache
echo "Rebuilding images (this may take a few minutes)..."
docker-compose build --no-cache

# Start services
echo "Starting services..."
docker-compose up -d

echo ""
echo "✅ Fix applied! Waiting for services to start..."
sleep 30

# Check status
echo ""
echo "Checking service status..."
docker-compose ps

echo ""
echo "🌐 Access URLs:"
echo "   • Frontend:  http://localhost"
echo "   • API:       http://localhost/api"
echo "   • API Docs:  http://localhost/api/docs"
echo ""
echo "🔑 Login: admin / admin"
echo ""
echo "📝 View logs: docker-compose logs -f [service_name]"