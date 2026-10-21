#!/bin/bash

# Script to deploy backend and get AWS Cognito configuration
echo "🚀 Deploying AWS Cognito Backend..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Deploy backend
echo "📦 Deploying backend..."
cd backend

# Deploy with serverless
npx serverless deploy --stage dev

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
    
    # Get stack outputs
    echo "🔍 Getting AWS Cognito configuration..."
    
    USER_POOL_ID=$(aws cloudformation describe-stacks \
        --stack-name stock-market-chatbot-dev \
        --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
        --output text)
    
    USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
        --stack-name stock-market-chatbot-dev \
        --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
        --output text)
    
    API_GATEWAY_URL=$(aws cloudformation describe-stacks \
        --stack-name stock-market-chatbot-dev \
        --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
        --output text)
    
    echo ""
    echo "🎉 AWS Cognito Configuration:"
    echo "================================"
    echo "User Pool ID: $USER_POOL_ID"
    echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
    echo "API Gateway URL: $API_GATEWAY_URL"
    echo ""
    echo "📝 Frontend Environment Variables:"
    echo "================================"
    echo "VITE_AWS_REGION=us-east-1"
    echo "VITE_USER_POOL_ID=$USER_POOL_ID"
    echo "VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID"
    echo "VITE_API_BASE_URL=$API_GATEWAY_URL"
    echo ""
    echo "💡 Copy these values to frontend/.env.local"
    echo "   cp frontend/env.aws.template frontend/.env.local"
    echo "   Then edit frontend/.env.local with the values above"
    
else
    echo "❌ Backend deployment failed!"
    exit 1
fi
