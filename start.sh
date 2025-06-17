#!/bin/bash

echo "🚀 Starting Emotion Analysis System..."
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env file with your configurations if needed."
fi

# Start all services
echo "🐳 Starting Docker containers..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
echo "==================="
docker compose ps

echo ""
echo "✅ System started successfully!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3001"
echo "  - Backend API: http://localhost:3000/api"
echo "  - Main Site (via Nginx): http://localhost"
echo ""
echo "🔑 Default credentials:"
echo "  - Admin: admin / admin123"
echo "  - Demo: demo / demo123"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker compose logs -f [service-name]"
echo "  - Stop system: docker compose down"
echo "  - Clean restart: ./clean-restart.sh"
echo ""