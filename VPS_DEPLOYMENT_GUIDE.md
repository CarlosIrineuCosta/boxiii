# Complete VPS Deployment Guide for Boxiii Tech Stack

## Executive Summary

This guide documents the complete process for deploying the Boxiii application stack on a VPS, including solutions for common WSL2 development issues and the transition to production Linux environments.

**Tech Stack:**
- **Frontend**: React + TypeScript (Builder Admin), Simple HTML/CSS/JS (Viewer)
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **VPS**: Ubuntu Linux

**Key Learning**: WSL2 development environments have persistent networking and build tool issues. Native Linux VPS deployment bypasses these problems entirely.

## Problem Context: WSL2 Development Issues

### WSL2 Limitations Encountered
- **Vite/React dev servers**: Consistent blank screen issues despite polling configurations
- **Port forwarding**: Unreliable WSL2-Windows networking bridge
- **File watching**: Broken despite `usePolling: true` configurations  
- **Build tools**: Modern JS toolchain incompatibilities with WSL2 virtualization
- **Time cost**: Significant development time lost to WSL2-specific debugging

### Solution: VPS Native Linux Development
Moving to native Linux VPS eliminates all WSL2 virtualization issues and provides:
- Reliable networking without WSL2 bridge
- Standard Linux development environment
- Direct file system access
- Production-parity development environment

## VPS Environment Setup

### Prerequisites
- Ubuntu VPS with root access
- Domain name or public IP address
- SSH access configured
- Docker and Docker Compose installed

### Initial VPS Configuration

```bash
# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git nginx docker.io docker-compose-v2

# Start and enable services
systemctl start docker
systemctl enable docker
systemctl start nginx
systemctl enable nginx

# Add user to docker group (if not using root)
usermod -aG docker $USER
```

## Project Deployment Architecture

### Directory Structure
```
/opt/boxiii/                    # Main application directory
├── builder/                    # Admin interface (React + FastAPI)
│   ├── frontend/              # React admin dashboard
│   ├── backend/               # FastAPI backend
│   └── Dockerfile.prod        # Production build
├── viewer/                     # Content viewer (Simple HTML or PWA)
│   ├── index.html             # Simple HTML viewer
│   └── Dockerfile.prod        # Production build (if PWA)
├── nginx/                      # Reverse proxy configuration
│   └── nginx.conf             # Main nginx config
├── database/                   # Database initialization
│   └── init/                  # SQL initialization scripts
├── .env.prod                   # Production environment variables
├── docker-compose.prod.yml     # Production container orchestration
└── deploy.sh                   # Deployment script
```

### Service Architecture
```
External Request (Port 80/443)
         ↓
    Nginx Reverse Proxy
         ↓
    ┌────┴────┬─────────┬─────────┐
    │         │         │         │
    /         /api/*    /viewer   /health
    │         │         │         │
 Builder   Backend   Viewer   Health Check
(React)   (FastAPI) (HTML)   (FastAPI)
Port 3000 Port 5000 Static   Backend
    │         │         │         │
    └─────────┼─────────┘         │
              │                   │
              ↓                   │
         PostgreSQL               │
         Port 5432                │
              │                   │
              └───────────────────┘
```

## Step-by-Step Deployment Process

### 1. Clone and Setup Project

```bash
# Navigate to deployment directory
cd /opt

# Clone repository
git clone https://github.com/yourusername/boxiii.git
cd boxiii

# Switch to appropriate branch
git checkout main  # or your deployment branch
```

### 2. Environment Configuration

```bash
# Create production environment file
cp .env.example .env.prod

# Edit production environment variables
nano .env.prod
```

**Required Environment Variables:**
```bash
# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_NAME=boxiii_db
DB_USER=boxiii
DB_PASSWORD=your_secure_password_here

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
API_SECRET_KEY=your_api_secret_key_here

# AI Services (if using)
GEMINI_API_KEY=your_gemini_api_key
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Frontend Configuration
REACT_APP_API_URL=/api
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGINS=http://your-domain.com,https://your-domain.com
```

### 3. Docker Compose Configuration

**docker-compose.prod.yml example:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: boxiii-db-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - boxiii-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./builder/backend
      dockerfile: Dockerfile.prod
    container_name: boxiii-backend-prod
    restart: unless-stopped
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - API_SECRET_KEY=${API_SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - boxiii-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./builder/frontend
      dockerfile: Dockerfile.prod
      args:
        - REACT_APP_API_URL=/api
    container_name: boxiii-frontend-prod
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - boxiii-network

  viewer:
    build:
      context: ./viewer
      dockerfile: Dockerfile.prod
    container_name: boxiii-viewer-prod
    restart: unless-stopped
    networks:
      - boxiii-network

  nginx:
    image: nginx:alpine
    container_name: boxiii-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro  # If using SSL
    depends_on:
      - frontend
      - backend
      - viewer
    networks:
      - boxiii-network

volumes:
  postgres_data:

networks:
  boxiii-network:
    driver: bridge
```

### 4. Nginx Configuration

**nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log  /var/log/nginx/access.log;
    error_log   /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # Upstream definitions
    upstream backend {
        server frontend:3000;
    }

    upstream api {
        server backend:5000;
    }

    upstream viewer {
        server viewer:80;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Rate limiting
        limit_req zone=general burst=50 nodelay;

        # Health check endpoint
        location /health {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://api/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            
            # Handle preflight requests
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin *;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type 'text/plain; charset=utf-8';
                add_header Content-Length 0;
                return 204;
            }
        }

        # Viewer routes
        location /viewer/ {
            proxy_pass http://viewer/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Builder admin interface (default)
        location / {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 5. Deployment Script

**deploy.sh:**
```bash
#!/bin/bash

set -e

echo "🚀 Starting Boxiii deployment..."

# Load environment variables
if [ -f .env.prod ]; then
    export $(cat .env.prod | xargs)
else
    echo "❌ .env.prod file not found!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🔍 Running health checks..."

# Check database
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U $DB_USER -d $DB_NAME; then
    echo "✅ Database is ready"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check backend API
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend API health check failed"
    exit 1
fi

# Check frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check viewer
if curl -f http://localhost/viewer/ > /dev/null 2>&1; then
    echo "✅ Viewer is ready"
else
    echo "❌ Viewer health check failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📍 Application is available at: http://$(curl -s ifconfig.me)"
echo "   - Admin Builder: http://$(curl -s ifconfig.me)/"
echo "   - Content Viewer: http://$(curl -s ifconfig.me)/viewer/"
echo "   - API Documentation: http://$(curl -s ifconfig.me)/api/docs"
```

## Simple HTML Viewer Alternative

For cases where React/PWA complexity isn't needed, use a simple HTML viewer:

**viewer/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boxiii Content Viewer</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background-color: #1a1a1a; 
            color: white; 
            margin: 0;
            line-height: 1.6;
        }
        h1 {
            color: #3b82f6;
            text-align: center;
            margin-bottom: 30px;
        }
        .box { 
            border: 1px solid #333; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            background-color: #2a2a2a; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .box h3 {
            color: #60a5fa;
            margin-top: 0;
            margin-bottom: 10px;
        }
        .box p {
            margin: 8px 0;
            color: #d1d5db;
        }
        .cards-count {
            color: #fbbf24;
            font-weight: bold;
        }
        .error { 
            color: #ef4444; 
            background-color: #7f1d1d;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .success { 
            color: #22c55e; 
            font-weight: bold;
        }
        #status { 
            margin: 20px 0; 
            font-size: 18px; 
            text-align: center;
        }
        .loading {
            text-align: center;
            font-style: italic;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <h1>🎯 Boxiii Content Viewer</h1>
    <div id="status" class="loading">Loading your boxes...</div>
    <div id="content"></div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Boxiii Viewer: JavaScript loaded');
            loadBoxes();
        });
        
        async function loadBoxes() {
            const statusDiv = document.getElementById('status');
            const contentDiv = document.getElementById('content');
            
            try {
                console.log('Fetching boxes from API...');
                
                const response = await fetch('/api/sets');
                
                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API response:', data);
                
                // Handle both direct array and {data: array} formats
                const boxes = Array.isArray(data) ? data : data.data || [];
                
                if (boxes.length === 0) {
                    statusDiv.innerHTML = '<span class="error">No boxes found in your database</span>';
                    return;
                }
                
                statusDiv.innerHTML = `<span class="success">✅ Found ${boxes.length} boxes in your database!</span>`;
                
                contentDiv.innerHTML = boxes.map(function(box) {
                    return '<div class="box">' +
                        '<h3>' + (box.title || 'Untitled Box') + '</h3>' +
                        '<p>' + (box.description || 'No description available') + '</p>' +
                        '<p class="cards-count">Cards: ' + (box.card_count || 0) + '</p>' +
                        '<p><strong>Category:</strong> ' + (box.category || 'General') + '</p>' +
                        '<p><strong>Language:</strong> ' + (box.language || 'Not specified') + '</p>' +
                        '</div>';
                }).join('');
                
            } catch (error) {
                console.error('Error loading boxes:', error);
                statusDiv.innerHTML = '<div class="error">❌ Error connecting to API: ' + error.message + '</div>';
                
                contentDiv.innerHTML = '<div class="box">' +
                    '<h3>Connection Test</h3>' +
                    '<p>Could not connect to your Boxiii API. This could mean:</p>' +
                    '<p>• The API server is not running</p>' +
                    '<p>• Docker containers are stopped</p>' +
                    '<p>• Network configuration issue</p>' +
                    '</div>';
            }
        }
    </script>
</body>
</html>
```

## Common Issues and Solutions

### 1. Docker Container Communication Issues

**Problem**: Containers cannot communicate with each other
**Solution**: Ensure all containers are on the same Docker network

```bash
# Check networks
docker network ls

# Inspect network
docker network inspect boxiii_boxiii-network

# Restart with proper networking
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Environment Variables Not Loading

**Problem**: Backend fails to connect to database
**Solution**: Ensure .env.prod file exists and is properly formatted

```bash
# Copy from example
cp .env.example .env.prod

# Verify variables are loaded
docker-compose -f docker-compose.prod.yml config
```

### 3. Nginx Configuration Conflicts

**Problem**: Default nginx configuration conflicts with custom config
**Solution**: Remove default configurations

```bash
# Inside nginx container
docker exec -it boxiii-nginx-prod bash
rm /etc/nginx/conf.d/default.conf
nginx -s reload
```

### 4. Database Connection Issues

**Problem**: Backend cannot connect to PostgreSQL
**Solution**: Check database health and credentials

```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec db pg_isready -U boxiii -d boxiii_db

# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Verify credentials match environment variables
cat .env.prod | grep DB_
```

### 5. Port Conflicts

**Problem**: Port 80 already in use
**Solution**: Stop conflicting services

```bash
# Check what's using port 80
netstat -tlnp | grep :80

# Stop nginx if running natively
systemctl stop nginx

# Or change docker-compose port mapping
# ports: "8080:80" instead of "80:80"
```

## Monitoring and Maintenance

### Container Health Monitoring

```bash
# Check all container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Check disk usage
docker system df
```

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U boxiii boxiii_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
cat backup_file.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U boxiii -d boxiii_db
```

### SSL Certificate Setup (Optional)

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Quick Deployment Commands

For Claude Code sessions, use these quick commands:

```bash
# Full deployment
cd /opt/boxiii && git pull && ./deploy.sh

# Quick restart
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl -f http://localhost/health

# Database check
docker-compose -f docker-compose.prod.yml exec db pg_isready -U boxiii -d boxiii_db
```

## Success Verification Checklist

After deployment, verify these endpoints:

- [ ] **Builder Admin**: `http://your-ip/` - React admin interface
- [ ] **API Health**: `http://your-ip/health` - Returns JSON health status
- [ ] **API Documentation**: `http://your-ip/api/docs` - Swagger/OpenAPI docs
- [ ] **Content Viewer**: `http://your-ip/viewer/` - Content display interface
- [ ] **Database**: All containers show as healthy in `docker-compose ps`

## Performance Optimization

### Production Recommendations

1. **Nginx Optimization**:
   - Enable gzip compression
   - Set up proper caching headers
   - Configure rate limiting

2. **Database Optimization**:
   - Regular VACUUM and ANALYZE
   - Monitor query performance
   - Set up connection pooling

3. **Docker Optimization**:
   - Use multi-stage builds
   - Minimize image sizes
   - Set up proper restart policies

4. **Security**:
   - Use non-root users in containers
   - Enable firewall (ufw)
   - Regular security updates
   - Environment variable security

This guide should enable any Claude Code session to recreate a working Boxiii deployment on a VPS with minimal troubleshooting.