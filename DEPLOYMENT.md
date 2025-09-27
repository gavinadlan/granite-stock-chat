# AWS Deployment Guide

## CI/CD Pipeline Overview

This project uses GitHub Actions for CI/CD with AWS deployment:

### 1. CI Pipeline (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Jobs**:
  - Frontend: Lint, Build, Test
  - Backend: Validate, Package
  - Deploy Staging: Auto-deploy to AWS staging on `develop` branch
  - Deploy Production: Auto-deploy to AWS production on `main` branch
  - Security: Vulnerability scanning

### 2. Test Suite (`test.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Jobs**:
  - Frontend Tests: Linting, Type checking, Build
  - Backend Tests: Serverless validation, Package testing
  - API Integration Tests: Endpoint testing
  - Performance Tests: Response time testing

### 3. Manual Deploy (`deploy.yml`)
- **Triggers**: Manual workflow dispatch
- **Options**: Staging or Production deployment
- **Features**: Slack notifications

## Setup Instructions

### 1. GitHub Secrets

Add these secrets to your GitHub repository:

#### AWS Secrets
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

#### S3 Buckets
```
S3_BUCKET_STAGING=staging-stock-market-chat-frontend
S3_BUCKET_PRODUCTION=production-stock-market-chat-frontend
```

#### CloudFront Distributions
```
CLOUDFRONT_DISTRIBUTION_ID_STAGING=your_staging_distribution_id
CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION=your_production_distribution_id
```

#### Optional: Slack Notifications
```
SLACK_WEBHOOK=your_slack_webhook_url
```

### 2. AWS Setup

1. Create IAM user with permissions for:
   - Lambda, API Gateway, CloudFormation
   - S3, CloudFront
   - IAM (for creating roles)
2. Generate access keys
3. Add keys to GitHub secrets

### 3. AWS Infrastructure Setup

#### Backend (Serverless Framework)
```bash
cd backend
npm install
npm run deploy:dev    # Staging
npm run deploy:prod   # Production
```

#### Frontend (S3 + CloudFront)
```bash
# Deploy infrastructure
aws cloudformation deploy \
  --template-file aws-frontend-deploy.yml \
  --stack-name staging-stock-market-chat-frontend \
  --parameter-overrides Environment=staging \
  --capabilities CAPABILITY_IAM

aws cloudformation deploy \
  --template-file aws-frontend-deploy.yml \
  --stack-name production-stock-market-chat-frontend \
  --parameter-overrides Environment=production \
  --capabilities CAPABILITY_IAM
```

### 4. Branch Strategy

- **`main`**: Production branch (auto-deploys to AWS production)
- **`develop`**: Staging branch (auto-deploys to AWS staging)
- **Feature branches**: Create PRs to `develop` or `main`

## Deployment Commands

### Manual Deployment

```bash
# Deploy to staging
gh workflow run deploy.yml -f environment=staging

# Deploy to production
gh workflow run deploy.yml -f environment=production
```

### Local Deployment

```bash
# Backend
cd backend
npm run deploy:dev    # Staging
npm run deploy:prod   # Production

# Frontend
cd frontend
npm run build
aws s3 sync dist/ s3://staging-stock-market-chat-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Environment Variables

### Backend (.env)
```
REPLICATE_API_KEY=your_replicate_key
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
RAPIDAPI_KEY=your_rapidapi_key
```

### Frontend (Build-time Environment Variables)
```bash
# Set environment variables before build
export VITE_AWS_API_URL=https://your-api-gateway-url.amazonaws.com/dev
export VITE_RAPIDAPI_KEY=your_rapidapi_key
export VITE_REPLICATE_API_KEY=your_replicate_key
export VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
export VITE_NEWS_API_KEY=your_news_api_key

# Then build
npm run build
```

## Monitoring

### GitHub Actions
- View workflow runs in GitHub Actions tab
- Check logs for deployment status
- Monitor security scan results

### AWS CloudWatch
- Monitor Lambda function logs
- Set up CloudWatch alarms
- Track API Gateway metrics
- Monitor S3 access logs
- Track CloudFront distribution metrics

### AWS S3 & CloudFront
- Monitor S3 bucket access patterns
- Track CloudFront cache hit ratios
- Monitor bandwidth usage
- Set up billing alerts

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Failures**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Ensure CloudFront distribution exists
   - Verify environment variables are set

3. **API Issues**
   - Verify API keys are correct
   - Check AWS Lambda logs
   - Test endpoints manually

### Debug Commands

```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally
cd frontend
npm run dev

# Check serverless config
cd backend
npx serverless config validate

# Test API endpoints
curl http://localhost:3001/dev/stock-price?symbol=AAPL
```

## Security

- All API keys are stored as GitHub secrets
- Environment variables are set at build time
- Security scanning runs on every PR
- Dependencies are automatically updated
- S3 buckets have proper access controls
- CloudFront provides HTTPS encryption

## Performance

- Frontend builds are cached
- Backend packages are optimized
- API response times are monitored
- Performance tests run on every deployment
- CloudFront provides global CDN
- S3 provides scalable storage
