#!/bin/bash

echo "🧹 Clean Restart - Emotion Analysis System"
echo "=========================================="
echo "⚠️  WARNING: This will delete all data and rebuild from scratch!"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Operation cancelled."
  exit 1
fi

echo ""
echo "📦 Stopping all containers..."
docker compose down

echo ""
echo "🗑️  Removing volumes (all data will be lost)..."
docker compose down -v

echo ""
echo "🧹 Removing Docker images..."
docker compose down --rmi local

echo ""
echo "🔧 Cleaning Docker build cache..."
docker builder prune -f

echo ""
echo "🏗️  Rebuilding all services (no cache)..."
docker compose build --no-cache

echo ""
echo "🚀 Starting fresh system..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 15

echo ""
echo "📊 Service Status:"
echo "==================="
docker compose ps

echo ""
echo "✅ Clean restart completed!"
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
echo "💡 The database has been initialized with default users."
echo ""