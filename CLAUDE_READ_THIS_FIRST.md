# CLAUDE READ THIS FIRST - Session Summary 2025-06-27

## DECISION: Switch from WSL2 to Native Linux Development

**WSL2 ISSUES (UNFIXABLE):**
- ❌ Vite/React dev servers consistently fail (blank screens)
- ❌ WSL2-Windows networking bridge unreliable for 2+ years
- ❌ Port forwarding breaks, file watching broken despite polling
- ❌ Time wasted on WSL2 quirks instead of actual development

**SOLUTION: Native Linux Server**
- ✅ User has local Linux machine available
- ✅ Can run Ubuntu GUI + terminal locally  
- ✅ No WSL2 bridge = reliable networking
- ✅ Native file access = better performance
- ✅ Standard Linux dev tools work as designed

**CURRENT STATUS:**
- ✅ Database has real data (6 boxes, 25 cards confirmed via API)
- ✅ Project architecture is solid
- ❌ Need to migrate from WSL2 to Linux machine

## WSL2 Networking Solution Found

**WORKING SETUP:**
```bash
cd viewer-pwa
python3 -m http.server 9000 --bind 0.0.0.0
# Access: http://localhost:9000/test.html
```

**KEY INSIGHT:** Modern build tools (Vite 7 + React 19 + Tailwind v4) have WSL2 compatibility issues, but basic Python server + simple HTML works perfectly.

## What Was Tried (and failed):
- Vite dev server with various WSL2 configs - blank screen
- PostCSS/Tailwind v4 configuration - build errors  
- React PWA with IndexedDB - couldn't test due to dev server issues

## Current Architecture:
- **Database:** PostgreSQL with 4 creators, 6 content sets, 25 cards
- **API:** FastAPI at localhost:5001 (works correctly)
- **Viewer:** Simple HTML at localhost:9000/test.html (works correctly)
- **Builder:** Docker containers (can be started with `docker-compose up -d`)

## TOMORROW'S PLAN: Linux Dev Environment Setup

**OPTION 1: Local Linux Machine (Preferred)**
1. **Setup Environment:**
   ```bash
   # Project isolation with Python venv
   python3 -m venv boxiii-env
   source boxiii-env/bin/activate
   
   # Node.js version management  
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   
   # Docker for database
   sudo apt install docker.io docker-compose-v2
   ```

2. **Project Migration:**
   ```bash
   git clone https://github.com/user/boxiii.git
   cd boxiii
   # Setup backend venv, install deps
   # Setup frontend npm install
   # Run docker-compose up -d
   ```

3. **Development Workflow:**
   - Backend: Python venv isolation per project
   - Frontend: Node.js via nvm for version control
   - Database: Docker containers
   - Access from Windows: http://linux-ip:5173/

**OPTION 2: VPS Development (Fallback)**
- Claude has SSH access to your VPS
- Can setup identical environment there
- Test immediately without local setup

**PRIORITY:** Linux machine setup = solve WSL2 issues permanently

## Files Changed:
- `viewer-pwa/test.html` - Working simple HTML viewer
- `viewer-pwa/.env` - Set VITE_USE_API=true for real data
- `viewer-pwa/vite.config.ts` - WSL2 polling config (didn't solve it)

## Problem Root Cause:
WSL2 + modern JS build tools compatibility issue. Python server proves networking works, so it's specifically the dev toolchain.