# Boxiii Deployment Guide

## Overview

This guide covers deployment of the Boxiii monorepo to a VPS (Virtual Private Server).

**Tech Stack**:
- Frontend: React + TypeScript
- Backend: FastAPI + Python
- Database: PostgreSQL
- Containerization: Docker + Docker Compose
- Web Server: Nginx (reverse proxy)
- Target: Ubuntu Linux VPS

## Prerequisites

### VPS Requirements
- Ubuntu 20.04+ or similar Linux distribution
- 2GB+ RAM
- 20GB+ storage
- Root or sudo access

### Local Requirements
- Git
- SSH access to VPS

## Initial VPS Setup

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 4. Install Git and Clone Repository
```bash
apt install git -y
cd /var/www
git clone https://github.com/your-username/boxiii.git
cd boxiii
```

## Environment Configuration

### 1. Create Production Environment File
```bash
cd /var/www/boxiii
cp .env.example .env.prod
```

### 2. Configure Environment Variables
```bash
nano .env.prod
```

Required variables:
```bash
# Database
DB_PASSWORD=your_secure_password
DB_USER=boxiii_user
DB_NAME=boxiii_db
DB_HOST=postgres
DB_PORT=5432

# Security
JWT_SECRET=your_jwt_secret_key

# AI APIs (optional)
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Email (future)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

## Docker Deployment

### 1. Navigate to Docker Configuration
```bash
cd /var/www/boxiii/ops/docker
```

### 2. Load Environment Variables
```bash
export $(cat ../../.env.prod | xargs)
```

### 3. Start Services
```bash
# For production
docker-compose -f docker-compose.prod.yml up -d

# For development
docker-compose up -d
```

### 4. Verify Services
```bash
docker-compose ps
```

Expected output:
```
Name                    Command               State           Ports
----------------------------------------------------------------
boxiii-db              docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
boxiii-builder-backend python main.py               Up      0.0.0.0:5001->5000/tcp
boxiii-builder-frontend npm run preview              Up      0.0.0.0:3001->3000/tcp
boxiii-viewer          npm run preview              Up      0.0.0.0:3000->3000/tcp
```

## Nginx Configuration

### 1. Install Nginx
```bash
apt install nginx -y
```

### 2. Configure Nginx
```bash
nano /etc/nginx/sites-available/boxiii
```

Basic configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Builder Frontend
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Viewer Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static {
        alias /var/www/boxiii/packages/uploads;
    }
}
```

### 3. Enable Site
```bash
ln -s /etc/nginx/sites-available/boxiii /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## SSL/HTTPS Setup (Optional)

### 1. Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate
```bash
certbot --nginx -d your-domain.com
```

## Database Initialization

### 1. Access Database Container
```bash
docker exec -it boxiii-db psql -U boxiii_user -d boxiii_db
```

### 2. Verify Tables
```sql
\dt
-- Should show: creators, content_sets, content_cards
\q
```

## Troubleshooting

### Check Service Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs builder-backend
docker-compose logs postgres
```

### Restart Services
```bash
docker-compose restart
# or restart specific service
docker-compose restart builder-backend
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it boxiii-db pg_isready -U boxiii_user
```

### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5001
netstat -tulpn | grep :5432
```

## Maintenance

### Update Application
```bash
cd /var/www/boxiii
git pull origin main
cd ops/docker
docker-compose pull
docker-compose up -d --build
```

### Backup Database
```bash
docker exec boxiii-db pg_dump -U boxiii_user boxiii_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Monitor Logs
```bash
# Follow logs in real-time
docker-compose logs -f

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Production Optimization

### 1. Configure Firewall
```bash
ufw allow 22     # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw enable
```

### 2. Set up Log Rotation
```bash
nano /etc/logrotate.d/boxiii
```

### 3. Configure Monitoring
- Set up system monitoring (htop, netdata)
- Configure alerting for service failures
- Monitor disk space and memory usage

## Security Considerations

1. **Environment Variables**: Never commit .env files to Git
2. **Database Passwords**: Use strong, unique passwords
3. **API Keys**: Rotate API keys regularly
4. **System Updates**: Keep VPS updated
5. **Backups**: Regular database and file backups
6. **SSH Access**: Use key-based authentication, disable password auth