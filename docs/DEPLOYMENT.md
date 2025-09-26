# 🚀 Deployment Guide

## Stock Market Chatbot - AWS Deployment

This guide will help you deploy the Stock Market Chatbot to AWS using Lambda and API Gateway.

## Prerequisites

### 1. AWS Account
- Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
- Set up billing information (free tier available)

### 2. AWS CLI
```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from: https://aws.amazon.com/cli/

# Verify installation
aws --version
```

### 3. AWS Credentials
```bash
# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (us-east-1)
# Enter your default output format (json)
```

### 4. Node.js & npm
```bash
# Install Node.js (if not already installed)
# Download from: https://nodejs.org/
```

## Deployment Steps

### 1. Prepare Environment Variables

Create `.env` file in the `backend` folder:

```bash
cd backend
touch .env
```

Add your API keys to `.env`:
```bash
REPLICATE_API_KEY=r8_DaMQj6GV5SXmXlriHPJnRf5TjwPaVSu0PPewg
NEWS_API_KEY=your_news_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
RAPIDAPI_KEY=024887c011msh588fd1cec974e2bp16266djsn1b16f80bcfe9
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Deploy to AWS

```bash
# Deploy to development environment
npm run deploy:dev

# Or deploy directly
npx serverless deploy --stage dev
```

### 4. Get API Gateway URL

After successful deployment, you'll see output like:

```
endpoints:
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/stock-price
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/ai-prediction
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/technical-analysis
  GET - https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/market-news
```

### 5. Update Frontend Configuration

Create `.env.local` in the `frontend` folder:

```bash
cd frontend
touch .env.local
```

Add the API Gateway URL:
```bash
VITE_AWS_API_URL=https://abc123def4.execute-api.us-east-1.amazonaws.com/dev
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_REPLICATE_API_KEY=r8_DaMQj6GV5SXmXlriHPJnRf5TjwPaVSu0PPewg
VITE_RAPIDAPI_KEY=024887c011msh588fd1cec974e2bp16266djsn1b16f80bcfe9
```

### 6. Test Deployment

```bash
# Test stock price endpoint
curl "https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/stock-price?symbol=AAPL"

# Test AI prediction endpoint
curl "https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/ai-prediction?symbol=TSLA&timeframe=1%20week"
```

## Production Deployment

### 1. Deploy to Production

```bash
cd backend
npm run deploy:prod
```

### 2. Update Frontend for Production

Update `.env.local` with production URL:
```bash
VITE_AWS_API_URL=https://abc123def4.execute-api.us-east-1.amazonaws.com/prod
```

### 3. Build Frontend for Production

```bash
cd frontend
npm run build
```

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy from frontend folder:
```bash
cd frontend
vercel
```

3. Follow the prompts to configure deployment

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy from frontend folder:
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: AWS S3 + CloudFront

1. Create S3 bucket for static hosting
2. Upload built files from `frontend/dist`
3. Configure CloudFront distribution
4. Set up custom domain (optional)

## Monitoring & Logs

### View Lambda Logs

```bash
cd backend
npm run logs -- -f stockPrice
npm run logs -- -f aiPrediction
npm run logs -- -f technicalAnalysis
npm run logs -- -f marketNews
```

### AWS Console Monitoring

1. Go to AWS Lambda console
2. Select your function
3. Click on "Monitor" tab
4. View metrics, logs, and traces

## Troubleshooting

### Common Issues

1. **AWS CLI not configured**
   ```bash
   aws configure
   ```

2. **Permission denied**
   - Ensure AWS user has Lambda, API Gateway, and IAM permissions
   - Check IAM policies

3. **Environment variables not set**
   - Verify `.env` file exists in backend folder
   - Check all API keys are valid

4. **Deploy failed**
   ```bash
   # Check deployment status
   npx serverless info
   
   # Check logs
   npx serverless logs -f functionName
   ```

5. **CORS errors**
   - API Gateway CORS is configured in serverless.yml
   - Check browser console for specific errors

### Debug Commands

```bash
# Check deployment status
npx serverless info

# Invoke function locally
npx serverless invoke -f stockPrice --data '{"symbol":"AAPL"}'

# View function logs
npx serverless logs -f stockPrice --tail

# Remove deployment
npx serverless remove
```

## Cost Optimization

### AWS Free Tier (12 months)
- **Lambda**: 1M requests/month
- **API Gateway**: 1M API calls/month
- **CloudWatch Logs**: 5GB/month

### After Free Tier
- **Lambda**: $0.20 per 1M requests
- **API Gateway**: $3.50 per 1M API calls
- **CloudWatch Logs**: $0.50 per GB

### Cost Optimization Tips

1. **Use appropriate memory sizes** for Lambda functions
2. **Set reasonable timeouts** to avoid unnecessary charges
3. **Monitor usage** with AWS Cost Explorer
4. **Use CloudWatch alarms** for cost alerts

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **IAM Permissions**: Use least privilege principle
3. **API Gateway**: Enable throttling and rate limiting
4. **Lambda**: Use VPC if accessing private resources
5. **Monitoring**: Set up CloudWatch alarms for errors

## Scaling Considerations

1. **Lambda Concurrency**: Default limit is 1000 concurrent executions
2. **API Gateway**: Handles up to 10,000 requests per second
3. **Database**: Consider DynamoDB for persistent storage
4. **Caching**: Use CloudFront for static assets

## Backup & Recovery

1. **Code**: Store in version control (Git)
2. **Configuration**: Use Infrastructure as Code (serverless.yml)
3. **Data**: Regular backups if using databases
4. **Monitoring**: Set up automated alerts

## Support

For deployment issues:
1. Check AWS documentation
2. Review serverless framework docs
3. Check project GitHub issues
4. Contact AWS support (if on paid plan)

---

**Happy Deploying! 🚀**
