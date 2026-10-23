# 🚀 StockAI

[![CI](https://github.com/gavinadlan/granite-stock-chat/actions/workflows/ci.yml/badge.svg)](https://github.com/gavinadlan/granite-stock-chat/actions/workflows/ci.yml)

**AI-Powered Stock Market Assistant Using AWS Lambda and IBM Granite**

A modern, AI-powered stock market assistant that provides real-time stock information, predictions, and technical analysis. Built with React frontend and AWS Lambda serverless backend.

## 🏗️ **Project Architecture**

```
granite-stock-chat/
├── frontend/            # React + Vite + TypeScript app
│   └── src/             # components, pages, services, hooks, lib
├── backend/             # AWS Lambda functions + serverless.yml
├── packages/shared/     # Types shared by frontend and backend
├── docs/                # API & deployment docs (legacy guides in docs/legacy)
├── roadmap/             # Scale-up roadmap with execution prompts
├── scripts/             # Dev scripts (legacy deploy scripts in scripts/legacy)
└── CLAUDE.md            # Project rules & context for Claude Code
```

## ✨ **Features**

### **Frontend (React)**
- 🎨 **Modern UI** - Beautiful, responsive chat interface
- 📊 **Real-time Data** - Live stock prices and market data
- 🤖 **AI Predictions** - IBM Granite powered stock predictions
- 📈 **Technical Analysis** - RSI, MACD, Moving Averages
- 📰 **Market News** - Latest stock market news
- 🔄 **Smart Fallback** - Multiple data sources with automatic fallback

### **Backend (AWS Lambda)**
- ⚡ **Serverless** - No server management required
- 🔄 **Auto-scaling** - Scales automatically based on demand
- 💰 **Cost-effective** - Pay only for what you use
- 🛡️ **Secure** - Built-in AWS security features
- 🌐 **API Gateway** - RESTful API endpoints

## 🚀 **Quick Start**

This is an npm workspaces monorepo (`frontend`, `backend`, `packages/shared`). Node 20+.

```bash
npm install            # installs every workspace from the repo root
npm run dev:web        # frontend on http://localhost:5173
npm run dev:api        # backend via serverless-offline on http://localhost:3001
npm run lint && npm run typecheck && npm test && npm run build
```

### **Environment Variables**
- Frontend: copy `frontend/.env.example` to `frontend/.env.local` (public values only: API URL & Cognito IDs).
- Backend: secrets live in AWS SSM Parameter Store, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#1-secrets).
  For local overrides copy `backend/.env.example` to `backend/.env`.

## 📚 **Documentation**

- [🚀 Deployment Guide](docs/DEPLOYMENT.md) - AWS deployment & secrets
- [🔌 API Documentation](docs/API.md) - API endpoints and usage
- [🗺️ Roadmap](roadmap/README.md) - Scale-up roadmap and execution prompts
- [📦 Legacy setup notes](docs/legacy/) - Older setup guides (IBM Granite, Yahoo Finance, AWS)

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Vite** - Fast build tool and dev server

### **Backend**
- **AWS Lambda** - Serverless compute
- **API Gateway** - RESTful API management
- **Serverless Framework** - Infrastructure as code
- **Node.js** - JavaScript runtime

### **APIs & Services**
- **IBM Granite** - AI-powered predictions
- **Yahoo Finance** - Real-time stock data
- **Alpha Vantage** - Financial data API
- **News API** - Market news
- **RapidAPI** - API marketplace

## 🎯 **API Endpoints**

### **Stock Price**
```
GET /stock-price?symbol=AAPL
```

### **AI Prediction**
```
GET /ai-prediction?symbol=TSLA&timeframe=1%20week
```

### **Technical Analysis**
```
GET /technical-analysis?symbol=MSFT
```

### **Market News**
```
GET /market-news?query=stock%20market
```

## 💰 **Cost Estimation**

### **AWS Free Tier (12 months)**
- **Lambda**: 1M requests/month
- **API Gateway**: 1M API calls/month
- **CloudWatch Logs**: 5GB/month

### **After Free Tier**
- **Lambda**: $0.20 per 1M requests
- **API Gateway**: $3.50 per 1M API calls
- **Estimated monthly cost**: $5-10

## 🔧 **Development**

### **Frontend Development**
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Backend Development**
```bash
cd backend
npm run offline      # Start local serverless
npm run deploy:dev   # Deploy to development
npm run deploy:prod  # Deploy to production
npm run logs         # View Lambda logs
```

## 🚀 **Deployment**

### **Live Demo**
- **Frontend**: [https://stockai.gavinadlan.my.id](https://stockai.gavinadlan.my.id) ✅
- **Backend API**: [https://api-gateway-url.amazonaws.com/dev](https://api-gateway-url.amazonaws.com/dev) (Coming Soon)

### **Frontend Deployment**
- **Vercel** (Recommended) - [Deploy Now](https://vercel.com)
- **Netlify** - [Deploy Now](https://netlify.com)
- **AWS S3 + CloudFront**

### **Backend Deployment**
- **AWS Lambda** (Serverless) - Deploy with `npm run deploy:dev`
- **API Gateway** - Automatic with Serverless Framework

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **IBM Granite** - AI model for stock predictions
- **Yahoo Finance** - Real-time stock data
- **AWS** - Serverless infrastructure
- **React** - Frontend framework
- **Tailwind CSS** - Styling framework

---

**Built with ❤️ for the stock market community**# Test deployment with new AWS credentials
