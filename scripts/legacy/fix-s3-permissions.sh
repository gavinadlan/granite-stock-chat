#!/bin/bash

echo "🔧 Fix S3 Permissions Script"
echo "============================"

echo "📋 Steps to fix S3 permissions:"
echo ""
echo "1. Enable Website Hosting:"
echo "   - AWS Console → S3 → staging-stock-market-chat-frontend-1758970542"
echo "   - Properties → Static website hosting → Edit"
echo "   - Enable → Host a static website"
echo "   - Index document: index.html"
echo "   - Error document: index.html"
echo "   - Save changes"
echo ""
echo "2. Disable Block Public Access:"
echo "   - Permissions → Block public access → Edit"
echo "   - Uncheck ALL options"
echo "   - Save changes"
echo ""
echo "3. Set Bucket Policy:"
echo "   - Permissions → Bucket policy → Edit"
echo "   - Add the JSON policy below"
echo "   - Save changes"
echo ""
echo "4. Make Files Public:"
echo "   - Objects → Select all files"
echo "   - Actions → Make public"
echo "   - Confirm"
echo ""
echo "📄 Bucket Policy JSON:"
echo '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::staging-stock-market-chat-frontend-1758970542/*"
        }
    ]
}'
echo ""
echo "✅ After all steps, test:"
echo "   http://staging-stock-market-chat-frontend-1758970542.s3-website-ap-southeast-2.amazonaws.com"
