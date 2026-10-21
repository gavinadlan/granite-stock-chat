#!/bin/bash

# 🚀 Setup Custom Domain untuk stockai.gavinadlan.my.id
# Script ini akan setup CloudFront, SSL certificate, dan konfigurasi domain

set -e

echo "🚀 Setting up custom domain: stockai.gavinadlan.my.id"
echo "=================================================="

# Variables
DOMAIN="stockai.gavinadlan.my.id"
S3_BUCKET="staging-stock-market-chat-frontend-1758970542"
AWS_REGION="ap-southeast-2"
CERT_REGION="us-east-1"  # CloudFront requires certificates in us-east-1

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   S3 Bucket: $S3_BUCKET"
echo "   AWS Region: $AWS_REGION"
echo "   Certificate Region: $CERT_REGION"
echo ""

# Step 1: Request SSL Certificate
echo "🔐 Step 1: Requesting SSL Certificate..."
CERT_ARN=$(aws acm request-certificate \
  --domain-name "$DOMAIN" \
  --validation-method DNS \
  --region "$CERT_REGION" \
  --query 'CertificateArn' \
  --output text)

echo "✅ Certificate requested: $CERT_ARN"
echo "⚠️  IMPORTANT: You need to validate this certificate via DNS!"
echo "   Run: aws acm describe-certificate --certificate-arn '$CERT_ARN' --region $CERT_REGION"
echo ""

# Step 2: Create CloudFront Origin Access Control
echo "🔒 Step 2: Creating Origin Access Control..."
OAC_ID=$(aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "stockai-oac",
    "Description": "OAC for stockai.gavinadlan.my.id",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }' \
  --query 'OriginAccessControl.Id' \
  --output text)

echo "✅ Origin Access Control created: $OAC_ID"
echo ""

# Step 3: Create CloudFront Distribution
echo "☁️ Step 3: Creating CloudFront Distribution..."
DISTRIBUTION_CONFIG='{
  "CallerReference": "'$(date +%s)'",
  "Comment": "CloudFront distribution for stockai.gavinadlan.my.id",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-staging-stock-market-chat-frontend-1758970542",
        "DomainName": "'$S3_BUCKET'.s3.'$AWS_REGION'.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        },
        "OriginAccessControlId": "'$OAC_ID'"
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-staging-stock-market-chat-frontend-1758970542",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "Aliases": {
    "Quantity": 1,
    "Items": ["'$DOMAIN'"]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "'$CERT_ARN'",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}'

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config "$DISTRIBUTION_CONFIG" \
  --query 'Distribution.Id' \
  --output text)

echo "✅ CloudFront Distribution created: $DISTRIBUTION_ID"
echo ""

# Step 4: Update S3 Bucket Policy
echo "🪣 Step 4: Updating S3 Bucket Policy..."
aws s3api put-bucket-policy \
  --bucket "$S3_BUCKET" \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CloudFrontServicePrincipal",
        "Effect": "Allow",
        "Principal": {
          "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::'$S3_BUCKET'/*",
        "Condition": {
          "StringEquals": {
            "AWS:SourceArn": "arn:aws:cloudfront::1758970542:distribution/'$DISTRIBUTION_ID'"
          }
        }
      }
    ]
  }'

echo "✅ S3 Bucket Policy updated"
echo ""

# Step 5: Block public access to S3
echo "🔒 Step 5: Blocking public access to S3..."
aws s3api put-public-access-block \
  --bucket "$S3_BUCKET" \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ S3 public access blocked"
echo ""

# Summary
echo "🎉 Setup completed successfully!"
echo "=================================="
echo "📋 Summary:"
echo "   Domain: $DOMAIN"
echo "   SSL Certificate: $CERT_ARN"
echo "   CloudFront Distribution: $DISTRIBUTION_ID"
echo "   Origin Access Control: $OAC_ID"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Validate SSL Certificate via DNS:"
echo "   aws acm describe-certificate --certificate-arn '$CERT_ARN' --region $CERT_REGION"
echo ""
echo "2. Update DNS records di Domainesia:"
echo "   CNAME: stockai -> $DISTRIBUTION_ID.cloudfront.net"
echo ""
echo "3. Update GitHub Actions workflow dengan Distribution ID: $DISTRIBUTION_ID"
echo ""
echo "4. Wait for CloudFront deployment (5-15 minutes)"
echo ""
echo "🌐 Your site will be available at: https://$DOMAIN"
