#!/bin/bash

# System Health Check Script
# This script checks if all services are running properly

set -e

echo "🔍 Emotion Analysis System - Health Check"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
check_docker() {
    echo -n "Checking Docker... "
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    echo -n "Checking Docker Compose... "
    if command -v docker-compose > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Installed${NC}"
        return 0
    else
        echo -e "${RED}✗ Not installed${NC}"
        return 1
    fi
}

# Check service status
check_service() {
    local service=$1
    local port=$2
    echo -n "Checking $service... "
    
    if docker-compose ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✓ Running${NC}"
        
        # Check port accessibility
        if nc -z localhost $port 2>/dev/null; then
            echo "  └─ Port $port: ${GREEN}✓ Accessible${NC}"
        else
            echo "  └─ Port $port: ${YELLOW}⚠ Not accessible${NC}"
        fi
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Check API health endpoint
check_api_health() {
    echo -n "Checking API health endpoint... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
        
        # Get detailed health info
        health_data=$(curl -s http://localhost/api/health)
        echo "  └─ Status: $(echo $health_data | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
        return 0
    else
        echo -e "${RED}✗ Unhealthy (HTTP $response)${NC}"
        return 1
    fi
}

# Check database connections
check_database() {
    local db_type=$1
    local container=$2
    local check_cmd=$3
    
    echo -n "Checking $db_type database... "
    
    if docker-compose exec -T $container $check_cmd > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Connected${NC}"
        return 0
    else
        echo -e "${RED}✗ Connection failed${NC}"
        return 1
    fi
}

# Check frontend accessibility
check_frontend() {
    echo -n "Checking frontend... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Accessible${NC}"
        return 0
    else
        echo -e "${RED}✗ Not accessible (HTTP $response)${NC}"
        return 1
    fi
}

# Check WebSocket connection
check_websocket() {
    echo -n "Checking WebSocket... "
    
    # Simple check if socket.io endpoint responds
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/socket.io/ || echo "000")
    
    if [ "$response" = "400" ] || [ "$response" = "200" ]; then
        # 400 is expected for socket.io without proper handshake
        echo -e "${GREEN}✓ Available${NC}"
        return 0
    else
        echo -e "${RED}✗ Not available${NC}"
        return 1
    fi
}

# Main execution
main() {
    local total_checks=0
    local passed_checks=0
    
    echo "1. System Requirements"
    echo "----------------------"
    
    ((total_checks++))
    check_docker && ((passed_checks++)) || true
    
    ((total_checks++))
    check_docker_compose && ((passed_checks++)) || true
    
    echo ""
    echo "2. Service Status"
    echo "-----------------"
    
    services=(
        "frontend:3001"
        "api:3000"
        "postgres:5432"
        "mongo:27017"
        "redis:6379"
        "scraper:0"
        "emotion-analyzer:0"
        "nginx:80"
    )
    
    for service_port in "${services[@]}"; do
        IFS=':' read -r service port <<< "$service_port"
        ((total_checks++))
        
        if [ "$port" != "0" ]; then
            check_service "$service" "$port" && ((passed_checks++)) || true
        else
            check_service "$service" "0" && ((passed_checks++)) || true
        fi
    done
    
    echo ""
    echo "3. Application Health"
    echo "--------------------"
    
    ((total_checks++))
    check_frontend && ((passed_checks++)) || true
    
    ((total_checks++))
    check_api_health && ((passed_checks++)) || true
    
    ((total_checks++))
    check_websocket && ((passed_checks++)) || true
    
    echo ""
    echo "4. Database Connectivity"
    echo "-----------------------"
    
    ((total_checks++))
    check_database "PostgreSQL" "postgres" "pg_isready -U emotion_user" && ((passed_checks++)) || true
    
    ((total_checks++))
    check_database "MongoDB" "mongo" "mongosh --eval 'db.runCommand({ping: 1})' --quiet" && ((passed_checks++)) || true
    
    ((total_checks++))
    check_database "Redis" "redis" "redis-cli ping" && ((passed_checks++)) || true
    
    echo ""
    echo "5. Summary"
    echo "----------"
    echo "Total checks: $total_checks"
    echo -e "Passed: ${GREEN}$passed_checks${NC}"
    echo -e "Failed: ${RED}$((total_checks - passed_checks))${NC}"
    
    if [ $passed_checks -eq $total_checks ]; then
        echo -e "\n${GREEN}✅ All systems operational!${NC}"
        return 0
    else
        echo -e "\n${YELLOW}⚠️  Some issues detected. Please check the logs.${NC}"
        echo "Run 'docker-compose logs -f [service_name]' to view service logs."
        return 1
    fi
}

# Run main function
main