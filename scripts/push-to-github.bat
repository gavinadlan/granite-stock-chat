@echo off
REM Git operations script for Stock Market Chatbot
echo 🚀 Pushing Stock Market Chatbot to GitHub
echo ==========================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check git status
echo 📋 Checking git status...
git status

REM Add all changes
echo 📦 Adding all changes...
git add .

REM Commit with descriptive message
echo 💾 Committing changes...
git commit -m "feat: Restructure project with professional architecture

- Separate frontend and backend into dedicated folders
- Create comprehensive documentation structure
- Add development scripts for easy setup
- Implement professional project architecture
- Update README with complete setup instructions
- Add API documentation and deployment guides
- Create separate package.json for frontend and backend
- Add deployment scripts for multiple platforms

Frontend:
- React app with TypeScript and Tailwind CSS
- Modern UI components with Radix UI
- Real-time stock data integration
- AI-powered predictions with IBM Granite
- Technical analysis and market news

Backend:
- AWS Lambda serverless functions
- API Gateway integration
- Multiple data source fallback system
- IBM Granite AI integration
- Comprehensive error handling

Documentation:
- Complete API documentation
- Deployment guides for AWS and frontend
- Setup instructions for all components
- Professional project structure

This commit prepares the project for production deployment and submission."

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Successfully pushed to GitHub!
echo 🔗 Repository: https://github.com/gavinadlan/granite-stock-chat.git
echo.
echo 📝 Next steps:
echo 1. Deploy frontend to Vercel/Netlify
echo 2. Deploy backend to AWS Lambda
echo 3. Update README with live deployment URLs
echo 4. Submit project for evaluation

pause
