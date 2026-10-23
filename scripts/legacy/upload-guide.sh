#!/bin/bash

echo "🚀 Manual Upload to S3 - Step by Step"
echo "===================================="

echo "📋 Current files in dist/:"
ls -la frontend/dist/

echo ""
echo "🔧 Steps to upload manually:"
echo "1. Login to AWS Console: https://console.aws.amazon.com"
echo "2. Go to S3 → staging-stock-market-chat-frontend-1758970542"
echo "3. Delete all existing files"
echo "4. Upload all files from frontend/dist/ folder"
echo "5. Make all files public"
echo "6. Test: http://staging-stock-market-chat-frontend-1758970542.s3-website-ap-southeast-2.amazonaws.com"
echo ""
echo "✅ After upload, your domain will work at:"
echo "   http://stockai.gavinadlan.my.id"
echo ""
echo "📁 Files to upload:"
echo "   - index.html"
echo "   - favicon.png"
echo "   - placeholder.svg"
echo "   - robots.txt"
echo "   - assets/ folder (with all contents)"
