#!/bin/bash

# Complete Test Suite Runner
# This script runs all tests to verify the system is working correctly

set -e

echo "🧪 Emotion Analysis System - Complete Test Suite"
echo "==============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}Running: $test_name${NC}"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓ $test_name passed${NC}\n"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗ $test_name failed${NC}\n"
    fi
}

# 1. System Requirements Check
echo -e "${YELLOW}1. SYSTEM REQUIREMENTS${NC}"
echo "======================"
run_test "Docker Check" "docker --version"
run_test "Docker Compose Check" "docker-compose --version"

# 2. Configuration Check
echo -e "${YELLOW}2. CONFIGURATION${NC}"
echo "================"
run_test "Environment File" "test -f .env && echo '.env file exists' || (test -f .env.example && echo '.env.example found - copy to .env' && false)"

# 3. Docker Services Check
echo -e "${YELLOW}3. DOCKER SERVICES${NC}"
echo "=================="

# Check if services are defined in docker-compose.yml
run_test "Docker Compose Validation" "docker-compose config > /dev/null 2>&1"

# Try to start services if not running
echo "Starting services (this may take a few minutes)..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 30

# Run system health check
run_test "System Health Check" "bash test/system-check.sh"

# 4. API Tests
echo -e "${YELLOW}4. API TESTS${NC}"
echo "============"

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies..."
    npm init -y > /dev/null 2>&1
    npm install axios socket.io-client puppeteer --save-dev > /dev/null 2>&1
fi

run_test "API Integration Tests" "node test/api.test.js"

# 5. Frontend Tests
echo -e "${YELLOW}5. FRONTEND TESTS${NC}"
echo "================="
run_test "Frontend UI Tests" "node test/frontend.test.js"

# 6. Database Connectivity Tests
echo -e "${YELLOW}6. DATABASE TESTS${NC}"
echo "================"

run_test "PostgreSQL Connection" "docker-compose exec -T postgres pg_isready -U emotion_user"
run_test "MongoDB Connection" "docker-compose exec -T mongo mongosh --eval 'db.runCommand({ping: 1})' --quiet"
run_test "Redis Connection" "docker-compose exec -T redis redis-cli ping"

# 7. Service Logs Check
echo -e "${YELLOW}7. SERVICE LOGS${NC}"
echo "==============="

# Check for errors in logs
check_logs() {
    local service=$1
    echo -n "Checking $service logs for errors... "
    
    error_count=$(docker-compose logs --tail=100 $service 2>&1 | grep -iE "error|exception|failed" | grep -v "Error: connect ECONNREFUSED" | wc -l)
    
    if [ "$error_count" -eq 0 ]; then
        echo -e "${GREEN}✓ No errors found${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Found $error_count error messages${NC}"
        return 1
    fi
}

run_test "Frontend Logs" "check_logs frontend"
run_test "API Logs" "check_logs api"
run_test "Scraper Logs" "check_logs scraper"
run_test "Emotion Analyzer Logs" "check_logs emotion-analyzer"

# 8. Performance Check
echo -e "${YELLOW}8. PERFORMANCE CHECK${NC}"
echo "==================="

# Check response times
check_response_time() {
    local url=$1
    local name=$2
    local max_time=${3:-3}
    
    echo -n "Checking $name response time... "
    
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$url" || echo "999")
    
    # Convert to milliseconds
    response_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "999")
    response_ms=${response_ms%.*}
    
    if [ "$response_ms" -lt "$((max_time * 1000))" ]; then
        echo -e "${GREEN}✓ ${response_ms}ms${NC}"
        return 0
    else
        echo -e "${RED}✗ ${response_ms}ms (exceeds ${max_time}s)${NC}"
        return 1
    fi
}

run_test "Frontend Response Time" "check_response_time http://localhost Frontend"
run_test "API Response Time" "check_response_time http://localhost/api/health API"

# Summary
echo ""
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo "============"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! The system is working correctly.${NC}"
    echo ""
    echo "You can now access:"
    echo "  - Frontend: http://localhost"
    echo "  - API: http://localhost/api"
    echo "  - API Docs: http://localhost/api/docs"
    echo ""
    echo "Default login credentials:"
    echo "  - Username: admin"
    echo "  - Password: admin"
else
    echo -e "${RED}❌ Some tests failed. Please check the output above for details.${NC}"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check Docker logs: docker-compose logs -f [service_name]"
    echo "2. Restart services: docker-compose restart"
    echo "3. Rebuild services: docker-compose build --no-cache"
    echo "4. Check .env configuration"
fi

exit $FAILED_TESTS