#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Double JS Doodles Full Stack Application"
echo "=================================================="

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Check if required directories exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: backend or frontend directory not found${NC}"
    exit 1
fi

# Start Backend
echo -e "${BLUE}📦 Starting FastAPI Backend...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Error: Virtual environment not found in backend/venv${NC}"
    echo -e "${YELLOW}💡 Run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found in backend directory${NC}"
    echo -e "${YELLOW}💡 Create backend/.env with required environment variables${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

echo -e "${YELLOW}🚀 Starting uvicorn server on http://localhost:8082...${NC}"
python -m uvicorn app.main:app --reload --port 8082 --log-level info &
BACKEND_PID=$!

cd ..

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8082/docs > /dev/null; then
    echo -e "${RED}❌ Backend failed to start properly${NC}"
    echo -e "${YELLOW}💡 Check backend logs above for errors${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}✅ Backend started successfully on http://localhost:8082${NC}"

# Start Frontend
echo -e "${BLUE}⚛️  Starting React Frontend...${NC}"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found in frontend directory${NC}"
    echo -e "${YELLOW}💡 Create frontend/.env with required environment variables${NC}"
    cleanup
    exit 1
fi

echo -e "${YELLOW}🚀 Starting React development server on http://localhost:3001...${NC}"
BROWSER=none PORT=3001 npm start &
FRONTEND_PID=$!

cd ..

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 5

# Check if frontend is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo -e "${RED}❌ Frontend failed to start properly${NC}"
    echo -e "${YELLOW}💡 Check frontend logs above for errors${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}✅ Frontend started successfully on http://localhost:3001${NC}"

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo "=============================================="
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:3001"
echo -e "${BLUE}🔧 Backend:${NC}  http://localhost:8082"
echo -e "${BLUE}📖 API Docs:${NC} http://localhost:8082/docs"
echo ""
echo -e "${YELLOW}📋 Logs will appear below. Press Ctrl+C to stop both services.${NC}"
echo "=============================================="

# Keep script running and show logs
wait