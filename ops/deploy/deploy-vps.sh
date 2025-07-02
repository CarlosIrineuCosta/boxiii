#!/bin/bash

# Boxiii VPS Deployment Script
# Hostinger VPS deployment automation

set -e

echo "🚀 Boxiii VPS Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="boxiii"
GIT_REPO="https://github.com/CarlosIrineuCosta/boxiii.git"
DEPLOY_DIR="/opt/boxiii"
DOMAIN=${DOMAIN:-"your-domain.com"}

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

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. Consider using a dedicated user for deployments."
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
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

# Install git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    apt install -y git
else
    print_status "Git already installed"
fi

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
    print_error "IMPORTANT: Edit .env.prod with your actual values before proceeding!"
    print_error "File location: $DEPLOY_DIR/.env.prod"
    echo "Press Enter after editing .env.prod to continue..."
    read
fi

# Update nginx configuration with actual domain
if [ "$DOMAIN" != "your-domain.com" ]; then
    print_status "Updating nginx configuration with domain: $DOMAIN"
    sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
fi

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

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

# Setup log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/boxiii << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size 50M
    missingok
    delaycompress
    copytruncate
}
EOF

# Create backup script
print_status "Creating backup script..."
cat > /opt/boxiii/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/boxiii/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec boxiii-db-prod pg_dump -U boxiii_user boxiii > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz shared/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/boxiii/backup.sh

# Add backup to crontab (daily at 2 AM)
print_status "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/boxiii/backup.sh >> /var/log/boxiii-backup.log 2>&1") | crontab -

# Setup UFW firewall (basic security)
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Create systemd service for auto-restart
print_status "Creating systemd service..."
cat > /etc/systemd/system/boxiii.service << EOF
[Unit]
Description=Boxiii Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable boxiii.service

print_status "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Point your domain $DOMAIN to this VPS IP address"
echo "2. For SSL, run: certbot --nginx -d $DOMAIN"
echo "3. Access your application at: http://$DOMAIN"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:    docker-compose -f docker-compose.prod.yml logs"
echo "  Restart:      systemctl restart boxiii"
echo "  Update app:   cd $DEPLOY_DIR && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
echo "  Backup:       /opt/boxiii/backup.sh"
echo ""
echo "📁 Important Files:"
echo "  Environment:  $DEPLOY_DIR/.env.prod"
echo "  Nginx config: $DEPLOY_DIR/nginx/nginx.conf"
echo "  Backups:      $DEPLOY_DIR/backups/"