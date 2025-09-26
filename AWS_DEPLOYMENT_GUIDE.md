# 🚀 AWS DEPLOYMENT GUIDE

## ✅ **CARA DEPLOY KE AWS:**

### **1. Setup AWS CLI**
```bash
# Install AWS CLI (jika belum)
brew install awscli  # macOS
# atau download dari: https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Enter your default region (us-east-1)
# Enter your default output format (json)
```

### **2. Setup Environment Variables**
Buat file `.env` di folder `aws-lambda`:
```bash
cd aws-lambda
touch .env
```

Isi file `.env` dengan:
```bash
REPLICATE_API_KEY=r8_DaMQj6GV5SXmXlriHPJnRf5TjwPaVSu0PPewg
NEWS_API_KEY=your_news_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
RAPIDAPI_KEY=024887c011msh588fd1cec974e2bp16266djsn1b16f80bcfe9
```

### **3. Deploy to AWS**
```bash
cd aws-lambda

# Deploy to development
npm run deploy:dev

# Atau deploy langsung
npx serverless deploy --stage dev
```

### **4. Get API Gateway URL**
Setelah deploy selesai, Anda akan mendapat output seperti:
```
endpoints:
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/stock-price
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/ai-prediction
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/technical-analysis
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/market-news
```

### **5. Update Frontend**
Tambahkan URL API Gateway ke `.env.local`:
```bash
# Di root project
echo "VITE_AWS_API_URL=https://abc123def4.execute-api.us-east-1.amazonaws.com/dev" >> .env.local
```

### **6. Restart Frontend**
```bash
# Restart frontend untuk load environment variable baru
npm run dev
```

---

## 🧪 **TESTING:**

### **Test AWS Lambda Functions:**
```bash
# Test stock price
curl "https://your-api-gateway-url.amazonaws.com/dev/stock-price?symbol=AAPL"

# Test AI prediction
curl "https://your-api-gateway-url.amazonaws.com/dev/ai-prediction?symbol=TSLA&timeframe=1%20week"

# Test technical analysis
curl "https://your-api-gateway-url.amazonaws.com/dev/technical-analysis?symbol=MSFT"

# Test market news
curl "https://your-api-gateway-url.amazonaws.com/dev/market-news?query=stock%20market"
```

### **Test Frontend Integration:**
1. Buka http://localhost:8080
2. Masuk ke chat interface
3. Ketik: "What's the price of AAPL?"
4. Lihat apakah data muncul dari AWS Lambda

---

## 🔧 **TROUBLESHOOTING:**

### **Common Issues:**

1. **AWS CLI not configured**
   ```bash
   aws configure
   ```

2. **Permission denied**
   - Pastikan AWS user memiliki permissions untuk Lambda, API Gateway, IAM

3. **Environment variables not set**
   - Pastikan file `.env` ada di folder `aws-lambda`
   - Pastikan semua API keys valid

4. **Deploy failed**
   ```bash
   # Check logs
   npx serverless logs -f stockPrice
   
   # Check deployment status
   npx serverless info
   ```

---

## 💰 **AWS COSTS:**

### **Free Tier (12 months):**
- **Lambda**: 1M requests/month
- **API Gateway**: 1M API calls/month
- **CloudWatch Logs**: 5GB/month

### **After Free Tier:**
- **Lambda**: $0.20 per 1M requests
- **API Gateway**: $3.50 per 1M API calls
- **CloudWatch Logs**: $0.50 per GB

**Estimated monthly cost untuk project ini: $5-10**

---

## 🎯 **NEXT STEPS:**

1. **Setup AWS Account** (jika belum punya)
2. **Configure AWS CLI** dengan credentials
3. **Deploy Lambda Functions** ke AWS
4. **Get API Gateway URL** dari output deploy
5. **Update Frontend** dengan AWS URL
6. **Test Full Integration** di browser

---

## 🎉 **RESULT:**

Setelah deploy berhasil, project Anda akan memiliki:
- ✅ **AWS Lambda Functions** - Serverless backend
- ✅ **API Gateway** - RESTful API endpoints
- ✅ **Frontend Integration** - React app connected to AWS
- ✅ **Production Ready** - Scalable dan cost-effective

**Project Anda sekarang 100% sesuai dengan deskripsi: Frontend React + AWS Lambda Backend! 🚀**
