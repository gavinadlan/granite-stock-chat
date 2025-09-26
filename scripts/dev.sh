#!/bin/bash

# Stock Market Chatbot - Development Script
# This script helps you run both frontend and backend

echo "🚀 Stock Market Chatbot - Development Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you have 'frontend' and 'backend' folders"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi
cd ..

echo ""
echo "🎉 Setup complete! Choose an option:"
echo ""
echo "1. 🖥️  Run Frontend Only (React app)"
echo "2. ⚡ Run Backend Only (AWS Lambda local)"
echo "3. 🚀 Run Both Frontend & Backend"
echo "4. 📚 Show Documentation"
echo "5. 🚀 Deploy to AWS"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🖥️  Starting Frontend..."
        cd frontend
        npm run dev
        ;;
    2)
        echo "⚡ Starting Backend..."
        cd backend
        npm run offline
        ;;
    3)
        echo "🚀 Starting Both Frontend & Backend..."
        echo "Frontend will run on http://localhost:8080"
        echo "Backend will run on http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        # Start backend in background
        cd backend
        npm run offline &
        BACKEND_PID=$!
        cd ..
        
        # Start frontend
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        
        # Wait for user to stop
        wait $FRONTEND_PID
        kill $BACKEND_PID
        ;;
    4)
        echo "📚 Opening Documentation..."
        if command_exists open; then
            open docs/
        elif command_exists xdg-open; then
            xdg-open docs/
        else
            echo "📖 Documentation available in the 'docs' folder"
            echo "   - README.md - Main documentation"
            echo "   - DEPLOYMENT.md - AWS deployment guide"
            echo "   - API.md - API documentation"
        fi
        ;;
    5)
        echo "🚀 Deploying to AWS..."
        echo "Make sure you have AWS CLI configured first!"
        echo ""
        read -p "Continue with deployment? (y/n): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            cd backend
            npm run deploy:dev
            echo ""
            echo "✅ Deployment complete!"
            echo "📝 Don't forget to update your frontend .env.local with the new API Gateway URL"
        else
            echo "❌ Deployment cancelled"
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac
