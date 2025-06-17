#!/bin/bash

echo "🔍 Testing Emotion Analysis System"
echo "=================================="
echo ""

# Test API Health
echo "1. Testing API Health Check..."
curl -s http://localhost:3000/health | jq . || echo "❌ API health check failed"
echo ""

# Test Login
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token' 2>/dev/null)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "✅ Login successful!"
  echo "Token: ${TOKEN:0:50}..."
else
  echo "❌ Login failed"
  echo $LOGIN_RESPONSE
fi
echo ""

# Test KOL API
echo "3. Testing KOL API..."
curl -s http://localhost:3000/kol \
  -H "Authorization: Bearer $TOKEN" | jq . || echo "❌ KOL API failed"
echo ""

# Test Events API
echo "4. Testing Events API..."
curl -s http://localhost:3000/events \
  -H "Authorization: Bearer $TOKEN" | jq . || echo "❌ Events API failed"
echo ""

# Show running containers
echo "5. Docker Container Status:"
docker compose ps
echo ""

echo "📝 Summary:"
echo "- API is running at: http://localhost:3000"
echo "- API documentation: http://localhost:3000/api"
echo "- You can test the login using: test-login.html"
echo ""
echo "To open the test login page:"
echo "open test-login.html"  # For macOS
echo ""