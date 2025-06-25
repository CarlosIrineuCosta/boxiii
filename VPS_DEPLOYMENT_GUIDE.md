# Boxiii VPS Deployment Guide

## Quick Deployment for Hostinger VPS

This guide will deploy your Boxiii admin platform to your Hostinger VPS with full database functionality.

## Prerequisites

1. **Hostinger VPS** with root access
2. **Domain name** pointed to your VPS IP
3. **AI API Keys** (Gemini, Claude, OpenAI)
4. **SSH access** to your VPS

## One-Command Deployment

### Step 1: Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Download and Run Deployment Script
```bash
curl -sSL https://raw.githubusercontent.com/CarlosIrineuCosta/boxiii/main/deploy-vps.sh | bash
```

**Alternative - Manual Steps:**
```bash
# Clone repository
git clone https://github.com/CarlosIrineuCosta/boxiii.git
cd boxiii

# Make script executable
chmod +x deploy-vps.sh

# Run deployment
./deploy-vps.sh
```

## Configuration Setup

### Step 3: Configure Environment Variables
After deployment, edit your production environment:

```bash
cd /opt/boxiii
nano .env.prod
```

**Required Configuration:**
```bash
# Database Configuration
DB_PASSWORD=your_secure_database_password_here

# JWT Configuration  
JWT_SECRET=your_very_long_random_jwt_secret_key_here

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Domain Configuration
DOMAIN=yourdomain.com
ADMIN_EMAIL=your-email@domain.com
```

### Step 4: Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

## Domain & SSL Setup

### Step 5: Point Domain to VPS
In your domain registrar (Hostinger, Cloudflare, etc.):
- **A Record**: `@` → `your-vps-ip`
- **A Record**: `www` → `your-vps-ip`

### Step 6: Install SSL Certificate
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
certbot renew --dry-run
```

## Access Your Application

After deployment and domain setup:

- **Admin Panel**: `https://yourdomain.com`
- **API Documentation**: `https://yourdomain.com/api/docs`
- **Health Check**: `https://yourdomain.com/health`

## Management Commands

### View Application Status
```bash
cd /opt/boxiii
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs builder-backend
docker-compose -f docker-compose.prod.yml logs builder-frontend
docker-compose -f docker-compose.prod.yml logs postgres
```

### Update Application
```bash
cd /opt/boxiii
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Restart Services
```bash
# Restart all
systemctl restart boxiii

# Restart specific service
docker-compose -f docker-compose.prod.yml restart builder-backend
```

### Database Backup
```bash
# Manual backup
/opt/boxiii/backup.sh

# View backup files
ls -la /opt/boxiii/backups/
```

## Security Features

### Automatic Security Setup
- [OK] **Firewall**: UFW configured (SSH, HTTP, HTTPS only)
- [OK] **Rate Limiting**: API and auth endpoint protection
- [OK] **Security Headers**: XSS, CSRF, clickjacking protection
- [OK] **HTTPS Redirect**: Automatic HTTP to HTTPS redirect
- [OK] **Log Rotation**: Prevents disk space issues

### Additional Security (Recommended)
```bash
# Change SSH port (optional)
nano /etc/ssh/sshd_config
# Change: Port 22 → Port 2222
systemctl restart ssh

# Install fail2ban for SSH protection
apt install fail2ban
systemctl enable fail2ban
```

## Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl https://yourdomain.com/health

# Database health
docker exec boxiii-db-prod pg_isready -U boxiii_user -d boxiii

# Service status
systemctl status boxiii
```

### Log Monitoring
```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# System logs
journalctl -u boxiii -f

# Nginx access logs
docker logs boxiii-nginx-prod
```

### Automated Backups
- **Schedule**: Daily at 2:00 AM
- **Retention**: 7 days
- **Location**: `/opt/boxiii/backups/`
- **Contents**: Database + uploaded files

## Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker status
systemctl status docker

# Check environment file
cat /opt/boxiii/.env.prod

# Rebuild containers
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

**Database connection errors:**
```bash
# Check database logs
docker logs boxiii-db-prod

# Connect to database manually
docker exec -it boxiii-db-prod psql -U boxiii_user -d boxiii
```

**Domain not accessible:**
```bash
# Check nginx status
docker logs boxiii-nginx-prod

# Test local connectivity
curl -I http://localhost

# Check DNS propagation
nslookup yourdomain.com
```

### Emergency Recovery
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore from backup
cd /opt/boxiii/backups
# Find latest backup
ls -la *.sql

# Restore database
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10
docker exec -i boxiii-db-prod psql -U boxiii_user -d boxiii < db_backup_YYYYMMDD_HHMMSS.sql

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

## Cost Optimization

### Hostinger VPS Recommendations
- **Minimum**: VPS Plan 1 (1GB RAM, 20GB SSD) - €3.99/month
- **Recommended**: VPS Plan 2 (2GB RAM, 40GB SSD) - €7.99/month
- **Resource Usage**: ~500MB RAM, ~5GB storage for small dataset

### Resource Monitoring
```bash
# Check resource usage
docker stats

# Check disk usage
df -h
du -sh /opt/boxiii/*

# Check memory usage
free -h
```

## Support & Updates

### Automatic Updates
The deployment includes automatic system updates. For application updates:
```bash
cd /opt/boxiii && git pull && docker-compose -f docker-compose.prod.yml up -d --build
```

### Getting Help
- **Logs**: Always check logs first (`docker-compose logs`)
- **Status**: Verify all services are running (`docker-compose ps`)
- **Health**: Test endpoints (`curl https://yourdomain.com/health`)

---

**Congratulations!** Your Boxiii admin platform is now live and accessible to your business partner with full database functionality.

**Access URL**: `https://yourdomain.com`