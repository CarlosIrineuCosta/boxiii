#!/bin/bash

# Boxiii Hostinger VPS Deployment Script
# One-command deployment for Ubuntu VPS

set -e

echo "🚀 Boxiii Hostinger Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Configuration
PROJECT_NAME="boxiii"
GIT_REPO="https://github.com/CarlosIrineuCosta/boxiii.git"
DEPLOY_DIR="/opt/boxiii"
VPS_IP="147.79.110.46"

print_status "Starting deployment on Hostinger VPS: $VPS_IP"

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
else
    print_status "Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose already installed"
fi

# Install git and nano if not present
print_status "Installing Git and Nano..."
apt install -y git nano

# Create deployment directory
print_status "Setting up deployment directory..."
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git fetch origin
    git reset --hard origin/main
else
    print_status "Cloning repository..."
    git clone $GIT_REPO .
fi

# Check for environment file
if [ ! -f ".env.prod" ]; then
    print_warning "Creating .env.prod from template..."
    cp .env.prod.example .env.prod
    
    # Set default values for Hostinger
    print_status "Configuring environment for Hostinger..."
    sed -i "s/your_secure_database_password_here/boxiii_secure_2025_password/" .env.prod
    sed -i "s/your_very_long_random_jwt_secret_key_here/$(openssl rand -base64 64 | tr -d '\n')/" .env.prod
    sed -i "s/your-domain.com/$VPS_IP/" .env.prod
    
    print_warning "Environment file created with default values."
    print_warning "Edit /opt/boxiii/.env.prod to add your API keys:"
    print_warning "- GEMINI_API_KEY"
    print_warning "- CLAUDE_API_KEY" 
    print_warning "- OPENAI_API_KEY"
fi

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start production containers
print_status "Building and starting production containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "✅ Services are running!"
else
    print_error "❌ Some services failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Setup basic firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

print_status "🎉 Deployment completed successfully!"
echo ""
echo "📋 Access Information:"
echo "  Admin Panel:    http://$VPS_IP"
echo "  API Docs:       http://$VPS_IP/api/docs"
echo "  Health Check:   http://$VPS_IP/health"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:      cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml logs"
echo "  Restart:        cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml restart"
echo "  Update app:     cd $DEPLOY_DIR && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "📁 Important Files:"
echo "  Environment:    $DEPLOY_DIR/.env.prod"
echo "  Application:    $DEPLOY_DIR/"
echo ""
echo "⚠️  Next Steps:"
echo "1. Add your API keys to: $DEPLOY_DIR/.env.prod"
echo "2. Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "3. Access your application at: http://$VPS_IP"