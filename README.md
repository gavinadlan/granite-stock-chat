# 🚀 Stock Market Chatbot

**Web-Based Stock Market Chatbot Using AWS Lambda and IBM Granite**

A modern, AI-powered stock market chatbot that provides real-time stock information, predictions, and technical analysis. Built with React frontend and AWS Lambda serverless backend.

## 🏗️ **Project Architecture**

```
granite-stock-chat-68dfe4c3/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── services/        # API Services
│   │   ├── pages/          # Page Components
│   │   └── hooks/          # Custom Hooks
│   ├── public/             # Static Assets
│   └── package.json        # Frontend Dependencies
├── backend/                 # AWS Lambda Backend
│   ├── functions/          # Lambda Functions
│   ├── serverless.yml      # Serverless Configuration
│   └── package.json        # Backend Dependencies
├── docs/                   # Documentation
│   ├── API.md             # API Documentation
│   ├── DEPLOYMENT.md      # Deployment Guide
│   └── SETUP.md           # Setup Instructions
└── README.md              # This file
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

### **1. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **2. Backend Setup**
```bash
cd backend
npm install
npm run deploy:dev
```

### **3. Environment Variables**
Create `.env.local` in frontend folder:
```bash
VITE_AWS_API_URL=https://your-api-gateway-url.amazonaws.com/dev
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_REPLICATE_API_KEY=your_replicate_api_key
VITE_RAPIDAPI_KEY=your_rapidapi_key
```

## 📚 **Documentation**

- [📖 Setup Guide](docs/SETUP.md) - Complete setup instructions
- [🚀 Deployment Guide](docs/DEPLOYMENT.md) - AWS deployment instructions
- [🔌 API Documentation](docs/API.md) - API endpoints and usage
- [🤖 IBM Granite Setup](docs/IBM_GRANITE_SETUP.md) - AI model configuration
- [📊 Yahoo Finance Setup](docs/YAHOO_FINANCE_SETUP.md) - Data source configuration

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
- **Frontend**: [https://stock-market-chatbot.vercel.app](https://stock-market-chatbot.vercel.app) (Coming Soon)
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
