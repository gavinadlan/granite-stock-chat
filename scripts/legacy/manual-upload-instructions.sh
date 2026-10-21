#!/bin/bash

echo "🚀 Manual Upload to S3"
echo "======================"

echo "📁 Files to upload:"
ls -la dist/

echo ""
echo "📋 Instructions:"
echo "1. Login to AWS Console: https://console.aws.amazon.com"
echo "2. Go to S3 → staging-stock-market-chat-frontend-1758970542"
echo "3. Upload all files from dist/ folder"
echo "4. Make files public"
echo "5. Test: http://staging-stock-market-chat-frontend-1758970542.s3-website-ap-southeast-2.amazonaws.com"
echo ""
echo "✅ After upload, your domain will work at:"
echo "   http://stockai.gavinadlan.my.id"
