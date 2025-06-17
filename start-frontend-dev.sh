#!/bin/bash

echo "🚀 Starting Frontend in Development Mode"
echo "======================================="

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export NEXT_PUBLIC_API_URL=http://localhost:3000
export NEXT_PUBLIC_WS_URL=ws://localhost:3000

echo "🔧 Starting Next.js development server..."
echo "📍 Frontend will be available at: http://localhost:3001"
echo ""

# Start the development server
npm run dev -- -p 3001