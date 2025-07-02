# Fix: Builder and Viewer Running Simultaneously

## Problem Analysis

**Root Cause**: The production Docker Compose configuration was missing the Viewer service, and Nginx was only routing to the Builder frontend. This caused the mutual exclusion where fixing one app broke the other.

### Evidence:
- ✅ Builder accessible on port 3001 (via Nginx)
- ❌ Viewer timeout on port 3000 (service didn't exist)
- ✅ API accessible on port 5001 (FastAPI backend)

## Solution Implemented

### 1. Updated Production Docker Compose
**File**: `ops/docker/docker-compose.prod.yml`

**Added**:
- `viewer-frontend` service (was missing entirely)
- Updated Nginx dependency to include both frontends
- Added static HTML file mounts for wellness.html, trivia.html, viewer.html

### 2. Updated Nginx Configuration  
**File**: `ops/nginx/nginx.conf`

**Changed routing**:
- `/` → `viewer-frontend:3000` (Public Viewer PWA)
- `/admin` → `builder-frontend:3000` (Admin Interface)
- `/admin/` → `builder-frontend:3000` (Admin assets)
- `/api/` → `builder-backend:5000` (Shared API)

### 3. Created Missing Production Files
**Added**:
- `apps/viewer/Dockerfile.prod` (production build)
- `apps/viewer/nginx.conf` (container nginx config)

## New Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ├── / → Viewer PWA (Public)
    ├── /admin → Builder (Admin)
    ├── /api → Backend (Shared)
    └── /*.html → Static files
```

## Deployment Commands

### On Hostinger VPS:

```bash
# 1. SSH into server
ssh user@147.79.110.46

# 2. Navigate to deployment directory
cd /opt/boxiii

# 3. Pull latest changes (includes the fixes)
git pull origin main

# 4. Rebuild with both apps
cd ops/docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Verify all services are running
docker-compose -f docker-compose.prod.yml ps
```

### Expected Services After Fix:

```
Name                           State    Ports
---------------------------------------------------
boxiii-db-prod                Up       5432/tcp
boxiii-builder-backend-prod    Up       5000/tcp
boxiii-builder-frontend-prod   Up       3000/tcp
boxiii-viewer-frontend-prod    Up       3000/tcp (NEW!)
boxiii-nginx-prod             Up       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## Access URLs After Fix:

- **Public Viewer (PWA)**: http://147.79.110.46/
- **Admin Builder**: http://147.79.110.46/admin
- **API Documentation**: http://147.79.110.46/api/docs
- **Wellness Interface**: http://147.79.110.46/wellness.html
- **Health Check**: http://147.79.110.46/health

## Verification Commands

Test both apps simultaneously:

```bash
# Test Viewer (should work)
curl -I http://147.79.110.46/

# Test Builder Admin (should work)  
curl -I http://147.79.110.46/admin

# Test API (should work)
curl -I http://147.79.110.46/api/docs

# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Why This Fixes the Problem

1. **No More Mutual Exclusion**: Both Viewer and Builder services run in separate containers
2. **Shared Backend**: Both apps use the same FastAPI backend via `/api/` routes
3. **Clear Routing**: Nginx properly routes requests to the correct frontend
4. **Production Ready**: Both apps use optimized production builds with Nginx

## Rollback Plan (if needed)

```bash
cd /opt/boxiii
git checkout HEAD~1  # Go back to previous commit
docker-compose -f ops/docker/docker-compose.prod.yml up -d --build
```

This fix ensures both Builder and Viewer can run simultaneously without conflicts.