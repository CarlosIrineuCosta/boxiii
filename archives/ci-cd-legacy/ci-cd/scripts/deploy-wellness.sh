#!/bin/bash

# Boxiii Wellness Interface Deployment Script
# Deploys wellness.html and images to VPS
# Usage: ./deploy-wellness.sh

set -e  # Exit on any error

# Configuration
VPS_HOST="147.79.110.46"
VPS_USER="root"
LOCAL_PROJECT="/home/cdc/projects/boxiii"
VPS_WEB_ROOT="/var/www/html"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Wellness Interface Deployment${NC}"

# Check if wellness.html exists
if [ ! -f "$LOCAL_PROJECT/wellness.html" ]; then
    echo -e "${RED}❌ Error: wellness.html not found in $LOCAL_PROJECT${NC}"
    exit 1
fi

# Check if images directory exists
if [ ! -d "$LOCAL_PROJECT/wellness-images" ]; then
    echo -e "${RED}❌ Error: wellness-images directory not found${NC}"
    exit 1
fi

# Create backup on VPS
echo -e "${YELLOW}📦 Creating backup on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST "cp $VPS_WEB_ROOT/wellness.html $VPS_WEB_ROOT/wellness.html.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'No existing file to backup'"

# Deploy wellness interface
echo -e "${YELLOW}🌐 Deploying wellness interface...${NC}"
scp "$LOCAL_PROJECT/wellness.html" $VPS_USER@$VPS_HOST:$VPS_WEB_ROOT/

# Deploy images
echo -e "${YELLOW}🖼️  Deploying wellness images...${NC}"
ssh $VPS_USER@$VPS_HOST "mkdir -p $VPS_WEB_ROOT/images/wellness"
scp "$LOCAL_PROJECT/wellness-images"/* $VPS_USER@$VPS_HOST:$VPS_WEB_ROOT/images/wellness/

# Set proper permissions
echo -e "${YELLOW}🔒 Setting file permissions...${NC}"
ssh $VPS_USER@$VPS_HOST "chmod 644 $VPS_WEB_ROOT/wellness.html"
ssh $VPS_USER@$VPS_HOST "chmod 644 $VPS_WEB_ROOT/images/wellness/*.jpg"
ssh $VPS_USER@$VPS_HOST "chown www-data:www-data $VPS_WEB_ROOT/wellness.html $VPS_WEB_ROOT/images/wellness/*.jpg"

# Verify deployment
echo -e "${YELLOW}✅ Verifying deployment...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$VPS_HOST/wellness.html)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Wellness interface available at: http://$VPS_HOST/wellness.html${NC}"
else
    echo -e "${RED}❌ Deployment verification failed (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# Show deployment summary
echo -e "${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 WELLNESS INTERFACE DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 Deployed: $(date)"
echo "🌐 URL: http://$VPS_HOST/wellness.html"
echo "📁 Files: wellness.html + wellness images"
echo "🔒 Permissions: Set correctly"
echo "✅ Status: Online and verified"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"