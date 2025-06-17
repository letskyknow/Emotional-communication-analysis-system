#!/bin/bash

# Emotion Analysis System - Quick Deploy Script
# This script handles the complete deployment process

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║       EMOTION PROPAGATION ANALYSIS SYSTEM             ║"
echo "║              Quick Deploy Script                      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Step 2: Setup environment
echo -e "\n${YELLOW}[2/6] Setting up environment...${NC}"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file from template${NC}"
        echo -e "${BLUE}ℹ Please edit .env file with your configuration${NC}"
    else
        echo -e "${RED}✗ No .env.example file found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Environment file already exists${NC}"
fi

# Step 3: Create necessary directories
echo -e "\n${YELLOW}[3/6] Creating directory structure...${NC}"

directories=(
    "frontend/app"
    "frontend/components"
    "frontend/lib"
    "backend/src"
    "scraper"
    "emotion-analyzer"
    "nginx"
    "test/screenshots"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
done

echo -e "${GREEN}✓ Directory structure created${NC}"

# Step 4: Build Docker images
echo -e "\n${YELLOW}[4/6] Building Docker images...${NC}"
echo "This may take several minutes on first run..."

if docker-compose build; then
    echo -e "${GREEN}✓ Docker images built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Docker images${NC}"
    exit 1
fi

# Step 5: Start services
echo -e "\n${YELLOW}[5/6] Starting services...${NC}"

if docker-compose up -d; then
    echo -e "${GREEN}✓ Services started${NC}"
else
    echo -e "${RED}✗ Failed to start services${NC}"
    exit 1
fi

# Step 6: Wait for services to be ready
echo -e "\n${YELLOW}[6/6] Waiting for services to initialize...${NC}"

# Function to check if a service is ready
check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo -n "Checking $service"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302\|401"; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e " ${RED}✗${NC}"
    return 1
}

# Check each service
check_service "Frontend" "http://localhost" || true
check_service "API" "http://localhost/api/health" || true

# Final status check
echo -e "\n${YELLOW}Checking overall system status...${NC}"

if bash test/system-check.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓ System is operational${NC}"
else
    echo -e "${YELLOW}⚠ Some services may still be initializing${NC}"
fi

# Display access information
echo -e "\n${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"

echo -e "\n${BLUE}Access URLs:${NC}"
echo "  • Frontend:    http://localhost"
echo "  • API:         http://localhost/api"
echo "  • API Docs:    http://localhost/api/docs"

echo -e "\n${BLUE}Default Credentials:${NC}"
echo "  • Username:    admin"
echo "  • Password:    admin"

echo -e "\n${BLUE}Useful Commands:${NC}"
echo "  • View logs:       docker-compose logs -f"
echo "  • Stop services:   docker-compose down"
echo "  • Run tests:       bash test/run-tests.sh"
echo "  • Health check:    bash test/system-check.sh"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "  1. Change default admin password"
echo "  2. Add KOLs to track (up to 50)"
echo "  3. Create events to monitor (up to 10)"
echo "  4. Configure alert thresholds"

echo -e "\n${BLUE}Documentation:${NC}"
echo "  • User Guide:  docs/USER_GUIDE.md"
echo "  • README:      README.md"

# Optional: Open browser
if command_exists open; then
    echo -e "\n${YELLOW}Opening browser...${NC}"
    sleep 2
    open "http://localhost" 2>/dev/null || true
elif command_exists xdg-open; then
    echo -e "\n${YELLOW}Opening browser...${NC}"
    sleep 2
    xdg-open "http://localhost" 2>/dev/null || true
fi

echo -e "\n${GREEN}Happy analyzing! 🚀${NC}"