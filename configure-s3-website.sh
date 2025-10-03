#!/bin/bash

# S3 Static Website Configuration Script
# Run this script to configure the kaleidos-qa-reports bucket for static website hosting

set -e

BUCKET_NAME="kaleidos-qa-reports"
REGION="eu-west-1"

echo "🚀 Configuring S3 bucket for static website hosting..."

# 1. Enable Static Website Hosting
echo "📝 Step 1: Enabling static website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document error.html

# 2. Disable Block Public Access
echo "🔓 Step 2: Disabling block public access..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

# 3. Apply bucket policy for public read access
echo "📋 Step 3: Applying bucket policy..."
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://s3-bucket-policy.json

# 4. Upload error page
echo "📄 Step 4: Uploading error page..."
aws s3 cp s3-error.html s3://$BUCKET_NAME/error.html \
  --content-type "text/html" \
  --cache-control "max-age=3600"

# 5. Set CORS configuration for modern browsers
echo "🌐 Step 5: Setting CORS configuration..."
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'

echo ""
echo "✅ Configuration complete!"
echo ""
echo "🌐 Website URLs:"
echo "   Dashboard: http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com/"
echo "   Reports:   http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com/run-{id}/index.html"
echo ""
echo "🔗 You can also create a CNAME record pointing to:"
echo "   $BUCKET_NAME.s3-website.$REGION.amazonaws.com"
echo ""
echo "⚠️  Note: It may take a few minutes for the changes to propagate."