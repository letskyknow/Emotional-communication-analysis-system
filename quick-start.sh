#!/bin/bash

echo "🚀 Quick Start - Emotion Analysis System"
echo "======================================="

# Check if .env file exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
fi

# Start only essential services first
echo "🐳 Starting essential services..."
docker compose up -d postgres redis mongo

echo "⏳ Waiting for databases to be ready..."
sleep 10

echo "🔨 Building and starting API service..."
docker compose up -d api

echo "⏳ Waiting for API to be ready..."
sleep 15

echo "🎨 Starting frontend service..."
docker compose up -d frontend

echo "🌐 Starting nginx..."
docker compose up -d nginx

echo ""
echo "📊 Service Status:"
echo "==================="
docker compose ps

echo ""
echo "✅ Essential services started!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3001"
echo "  - Backend API: http://localhost:3000"
echo "  - Main Site (via Nginx): http://localhost"
echo ""
echo "🔑 Default credentials:"
echo "  - Admin: admin / admin123"
echo "  - Demo: demo / demo123"
echo ""
echo "💡 To start data collection services, run:"
echo "  docker compose up -d scraper emotion-analyzer"
echo ""