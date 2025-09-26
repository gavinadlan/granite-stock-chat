#!/bin/bash

echo "🚀 Adding all files to git..."
git add .

echo "📝 Committing changes..."
git commit -m "feat: Complete project restructure and documentation

- Restructure project with separate frontend and backend folders
- Add comprehensive documentation (API, Deployment, Setup guides)
- Create development scripts for easy project management
- Implement professional project architecture
- Update README with complete setup and deployment instructions
- Add separate package.json for frontend and backend
- Create deployment scripts for multiple platforms
- Add professional project structure with docs folder

Frontend Features:
- React 18 with TypeScript
- Tailwind CSS and Radix UI components
- Real-time stock data integration
- AI-powered predictions with IBM Granite
- Technical analysis and market news
- Smart fallback system for multiple data sources

Backend Features:
- AWS Lambda serverless functions
- API Gateway integration
- Multiple data source fallback system
- IBM Granite AI integration
- Comprehensive error handling
- Serverless Framework configuration

Documentation:
- Complete API documentation
- AWS deployment guides
- Setup instructions for all components
- Professional project structure
- Development scripts for easy management

This commit completes the project restructuring and prepares it for production deployment and submission."

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Successfully pushed to GitHub!"
echo "🔗 Repository: https://github.com/gavinadlan/granite-stock-chat.git"
