#!/bin/bash

# Boxiii Trivia Viewer Deployment Script
# Quick deployment script for updating the trivia viewer

set -e

echo "🎯 Deploying Boxiii Trivia Viewer..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/boxiii"
TRIVIA_SOURCE="./trivia.html"
TRIVIA_TARGET="/var/www/html/trivia.html"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "$TRIVIA_SOURCE" ]; then
    print_error "trivia.html not found in current directory"
    print_error "Please run this script from the boxiii project root"
    exit 1
fi

# Check if we're on the VPS or local
if [ -d "$DEPLOY_DIR" ]; then
    print_status "Running on VPS - deploying to production"
    
    # Copy trivia file to deployment directory
    print_status "Copying trivia.html to deployment directory..."
    cp "$TRIVIA_SOURCE" "$DEPLOY_DIR/"
    
    # Restart nginx container to pick up the new file
    print_status "Restarting nginx container..."
    cd "$DEPLOY_DIR"
    docker-compose -f docker-compose.prod.yml restart nginx
    
    print_status "✅ Trivia viewer deployed successfully!"
    print_status "🌐 Access at: http://your-domain.com/trivia"
    
else
    print_status "Running locally - setting up for local testing"
    
    # Create local www directory
    mkdir -p /tmp/www/html
    cp "$TRIVIA_SOURCE" /tmp/www/html/trivia.html
    
    print_status "✅ Trivia viewer ready for local testing!"
    print_status "📁 File location: /tmp/www/html/trivia.html"
    print_warning "To deploy to VPS, run this script on your VPS server"
fi

echo ""
echo "📋 Trivia Viewer Features:"
echo "  • Beautiful card flip animations"
echo "  • Keyboard navigation (Space, Arrow keys, ESC)"
echo "  • Touch/swipe support for mobile"
echo "  • Connects to live API data"
echo "  • Premium trivia deck design"
echo "  • Responsive design for all devices"
echo ""
echo "🎮 Controls:"
echo "  • Click/Touch: Flip card"
echo "  • Space: Flip card"
echo "  • ← →: Navigate cards"
echo "  • ESC: Exit trivia"
echo "  • Swipe: Navigate on mobile"