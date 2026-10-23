#!/bin/bash

# Script to fix S3 bucket configuration for SPA routing
echo "🔧 Fixing S3 bucket configuration for SPA routing..."

BUCKET_NAME="staging-stock-market-chat-frontend-1758970542"
REGION="ap-southeast-2"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Set AWS region
export AWS_DEFAULT_REGION=$REGION

echo "🔍 Checking bucket status..."

# Configure website hosting
echo "📝 Configuring website hosting..."
aws s3api put-bucket-website \
  --bucket $BUCKET_NAME \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

if [ $? -eq 0 ]; then
    echo "✅ Website hosting configured"
else
    echo "❌ Failed to configure website hosting"
    exit 1
fi

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public read access..."
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Sid\": \"PublicReadGetObject\",
        \"Effect\": \"Allow\",
        \"Principal\": \"*\",
        \"Action\": \"s3:GetObject\",
        \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
      }
    ]
  }"

if [ $? -eq 0 ]; then
    echo "✅ Bucket policy set for public read access"
else
    echo "❌ Failed to set bucket policy"
    exit 1
fi

# Enable public access
echo "🌐 Enabling public access..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

if [ $? -eq 0 ]; then
    echo "✅ Public access enabled"
else
    echo "❌ Failed to enable public access"
    exit 1
fi

# Verify configuration
echo "🔍 Verifying configuration..."
aws s3api get-bucket-website --bucket $BUCKET_NAME
aws s3api get-bucket-policy --bucket $BUCKET_NAME

echo ""
echo "🎉 S3 bucket configuration completed!"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "💡 Test the following URLs:"
echo "   - http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "   - http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/chat"
echo "   - http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/profile"
echo "   - http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/settings"
echo ""
echo "All URLs should redirect to index.html and React Router will handle the routing."
