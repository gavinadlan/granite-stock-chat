# Deployment Guide

## CI/CD Pipeline Overview

This project uses GitHub Actions for CI/CD with the following workflows:

### 1. CI Pipeline (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Jobs**:
  - Frontend: Lint, Build, Test
  - Backend: Validate, Package
  - Deploy Staging: Auto-deploy to staging on `develop` branch
  - Deploy Production: Auto-deploy to production on `main` branch
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

#### Vercel Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### API Keys (for Vercel environment variables)
```
VITE_AWS_API_URL=your_aws_lambda_url
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_REPLICATE_API_KEY=your_replicate_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_NEWS_API_KEY=your_news_api_key
```

#### Optional: Slack Notifications
```
SLACK_WEBHOOK=your_slack_webhook_url
```

### 2. AWS Setup

1. Create IAM user with Lambda, API Gateway, and CloudFormation permissions
2. Generate access keys
3. Add keys to GitHub secrets

### 3. Vercel Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Get tokens from Vercel dashboard
5. Add tokens to GitHub secrets

### 4. Branch Strategy

- **`main`**: Production branch (auto-deploys to production)
- **`develop`**: Staging branch (auto-deploys to staging)
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
vercel --prod         # Production
vercel                # Preview
```

## Environment Variables

### Backend (.env)
```
REPLICATE_API_KEY=your_replicate_key
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
RAPIDAPI_KEY=your_rapidapi_key
```

### Frontend (Vercel Environment Variables)
```
VITE_AWS_API_URL=https://your-api-gateway-url.amazonaws.com/dev
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_REPLICATE_API_KEY=your_replicate_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_NEWS_API_KEY=your_news_api_key
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

### Vercel Analytics
- Monitor frontend performance
- Track user analytics
- Monitor build times

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Failures**
   - Verify AWS credentials
   - Check Vercel tokens
   - Ensure environment variables are set

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
- Environment variables are encrypted in Vercel
- Security scanning runs on every PR
- Dependencies are automatically updated

## Performance

- Frontend builds are cached
- Backend packages are optimized
- API response times are monitored
- Performance tests run on every deployment
