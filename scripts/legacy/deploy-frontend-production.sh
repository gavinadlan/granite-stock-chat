#!/bin/bash

echo "🚀 Deploy Frontend to AWS S3 (PRODUCTION)"
echo "=========================================="

# Production bucket name
BUCKET_NAME="staging-stock-market-chat-frontend-1758970542"
REGION="ap-southeast-2"

# CloudFront Distribution ID
CLOUDFRONT_DIST_ID="E1EBQAS461CZEZ"

echo ""
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
echo "   Bucket: $BUCKET_NAME"
echo ""

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
cd ..

echo ""
echo "📦 Files ready in frontend/dist/"
ls -lh frontend/dist/ | head -10

echo ""
echo "🔍 Checking AWS CLI configuration..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo ""
    echo "❌ AWS CLI not configured or credentials expired"
    echo ""
    echo "📋 OPTION 1: Setup MFA di AWS Console (Recommended)"
    echo "   1. Login ke: https://console.aws.amazon.com"
    echo "   2. Setup MFA (pilih Authenticator app - pakai Google Authenticator)"
    echo "   3. Setelah MFA setup, configure AWS CLI lagi:"
    echo "      aws configure"
    echo ""
    echo "📋 OPTION 2: Upload Manual via AWS Console"
    echo "   1. Login ke: https://console.aws.amazon.com"
    echo "   2. Setup MFA dulu"
    echo "   3. Go to S3 → $BUCKET_NAME"
    echo "   4. Delete semua file lama"
    echo "   5. Upload semua file dari frontend/dist/"
    echo "   6. Make semua file public"
    echo ""
    echo "📋 OPTION 3: Pakai AWS CLI dengan Session Token"
    echo "   Jika sudah punya temporary credentials, bisa pakai:"
    echo "   export AWS_ACCESS_KEY_ID=..."
    echo "   export AWS_SECRET_ACCESS_KEY=..."
    echo "   export AWS_SESSION_TOKEN=..."
    echo ""
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Upload files to S3
echo "📤 Uploading files to S3..."
aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ \
    --region $REGION \
    --delete \
    --exclude "*.map" \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "assets/*" \
    --cache-control "public, max-age=31536000, immutable" \
    --include "assets/*"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload successful!"
    echo ""
    
    # Invalidate CloudFront cache if distribution ID is provided
    if [ ! -z "$CLOUDFRONT_DIST_ID" ]; then
        echo "🔄 Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id $CLOUDFRONT_DIST_ID \
            --paths "/*"
        
        if [ $? -eq 0 ]; then
            echo "✅ CloudFront cache invalidation initiated"
        else
            echo "⚠️  CloudFront invalidation failed, but upload was successful"
        fi
        echo ""
    fi
    
    echo "🌐 Website URLs:"
    echo "   - http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
    echo "   - https://stockai.gavinadlan.my.id (jika pakai custom domain)"
    echo ""
    echo "✅ Deployment completed!"
    echo ""
    echo "💡 Note: Perubahan mungkin perlu beberapa menit untuk muncul"
    echo "   Jika pakai CloudFront, tunggu invalidation selesai (biasanya 1-5 menit)"
    echo ""
else
    echo ""
    echo "❌ Upload failed"
    echo ""
    echo "💡 Coba upload manual via AWS Console:"
    echo "   1. Login: https://console.aws.amazon.com"
    echo "   2. S3 → $BUCKET_NAME"
    echo "   3. Upload semua file dari frontend/dist/"
    exit 1
fi

