@echo off
REM Stock Market Chatbot - Development Script for Windows
REM This script helps you run both frontend and backend

echo 🚀 Stock Market Chatbot - Development Setup
echo ==========================================

REM Check if we're in the right directory
if not exist "frontend" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you have 'frontend' and 'backend' folders
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you have 'frontend' and 'backend' folders
    pause
    exit /b 1
)

REM Check dependencies
echo 🔍 Checking dependencies...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies already installed
)
cd ..

echo.
echo 🎉 Setup complete! Choose an option:
echo.
echo 1. 🖥️  Run Frontend Only (React app)
echo 2. ⚡ Run Backend Only (AWS Lambda local)
echo 3. 🚀 Run Both Frontend ^& Backend
echo 4. 📚 Show Documentation
echo 5. 🚀 Deploy to AWS
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 🖥️  Starting Frontend...
    cd frontend
    npm run dev
) else if "%choice%"=="2" (
    echo ⚡ Starting Backend...
    cd backend
    npm run offline
) else if "%choice%"=="3" (
    echo 🚀 Starting Both Frontend ^& Backend...
    echo Frontend will run on http://localhost:8080
    echo Backend will run on http://localhost:3000
    echo.
    echo Press Ctrl+C to stop both servers
    
    REM Start backend in background
    cd backend
    start "Backend" cmd /k "npm run offline"
    cd ..
    
    REM Start frontend
    cd frontend
    npm run dev
) else if "%choice%"=="4" (
    echo 📚 Opening Documentation...
    start docs
) else if "%choice%"=="5" (
    echo 🚀 Deploying to AWS...
    echo Make sure you have AWS CLI configured first!
    echo.
    set /p confirm="Continue with deployment? (y/n): "
    if /i "%confirm%"=="y" (
        cd backend
        npm run deploy:dev
        echo.
        echo ✅ Deployment complete!
        echo 📝 Don't forget to update your frontend .env.local with the new API Gateway URL
    ) else (
        echo ❌ Deployment cancelled
    )
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

pause
