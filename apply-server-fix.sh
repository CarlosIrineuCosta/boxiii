#!/bin/bash

# Boxiii Server Fix Application Script
# Fixes the mutual exclusion problem between Builder and Viewer

set -e

echo "🔧 Applying Boxiii Server Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ] || [ ! -d "ops/docker" ]; then
    print_error "Must be run from the boxiii project root directory"
    print_error "Expected files: CLAUDE.md, ops/docker/"
    exit 1
fi

print_status "Found boxiii project structure ✓"

# Verify the fixes are in place
print_step "1. Verifying fix files exist..."

REQUIRED_FILES=(
    "ops/docker/docker-compose.prod.yml"
    "ops/nginx/nginx.conf"
    "apps/viewer/Dockerfile.prod"
    "apps/viewer/nginx.conf"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "✓ $file exists"
    else
        print_error "✗ Missing required file: $file"
        exit 1
    fi
done

# Check if docker-compose.prod.yml contains viewer-frontend service
print_step "2. Checking production configuration..."

if grep -q "viewer-frontend:" ops/docker/docker-compose.prod.yml; then
    print_status "✓ viewer-frontend service found in production config"
else
    print_error "✗ viewer-frontend service missing from docker-compose.prod.yml"
    print_error "Please ensure the updated configuration includes the viewer service"
    exit 1
fi

# Check if nginx.conf has proper routing
if grep -q "/admin" ops/nginx/nginx.conf && grep -q "upstream viewer" ops/nginx/nginx.conf; then
    print_status "✓ Nginx configuration includes proper routing"
else
    print_error "✗ Nginx configuration missing proper routing"
    exit 1
fi

print_step "3. Preparing for deployment..."

# Create deployment summary
cat << EOF

📋 DEPLOYMENT SUMMARY
====================

Services to be deployed:
• PostgreSQL Database (shared)
• Builder Backend (FastAPI - shared API)
• Builder Frontend (Admin interface)
• Viewer Frontend (Public PWA) [NEW]
• Nginx Reverse Proxy (updated routing)

Access URLs after deployment:
• Public Viewer:    http://147.79.110.46/
• Admin Builder:    http://147.79.110.46/admin  
• API Docs:         http://147.79.110.46/api/docs
• Wellness:         http://147.79.110.46/wellness.html

Expected containers:
• boxiii-db-prod
• boxiii-builder-backend-prod  
• boxiii-builder-frontend-prod
• boxiii-viewer-frontend-prod [NEW]
• boxiii-nginx-prod

EOF

print_warning "This script prepares the fix. To deploy to server:"
print_warning "1. Commit these changes to Git"
print_warning "2. SSH to VPS: ssh user@147.79.110.46"
print_warning "3. Run: cd /opt/boxiii && git pull origin main"
print_warning "4. Run: cd ops/docker && docker-compose -f docker-compose.prod.yml down"
print_warning "5. Run: docker-compose -f docker-compose.prod.yml up -d --build"

echo ""
print_status "🎉 Fix preparation completed successfully!"
print_status "All required files are in place and configurations are valid."

echo ""
echo "📝 DEPLOYMENT CHECKLIST:"
echo "□ Commit and push changes to Git repository"  
echo "□ SSH into Hostinger VPS (147.79.110.46)"
echo "□ Navigate to /opt/boxiii"
echo "□ Pull latest changes (git pull origin main)"
echo "□ Stop current containers"
echo "□ Build and start with new configuration"
echo "□ Verify all 5 services are running"
echo "□ Test both Builder (/admin) and Viewer (/) access"

echo ""
print_status "Ready for deployment! 🚀"