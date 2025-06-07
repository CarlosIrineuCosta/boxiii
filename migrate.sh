#!/bin/bash

# Boxiii Migration Script
# This script helps consolidate Info Navigator projects into Boxiii

echo "=== Boxiii Migration Script ==="
echo "This script will help you migrate files from both projects"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the parent directory path
PARENT_DIR=$(dirname $(dirname $(pwd)))
BOXIII_DIR="$PARENT_DIR/boxiii"

echo -e "${YELLOW}Step 1: Moving Boxiii repository to parent directory${NC}"
echo "Please run these commands manually:"
echo ""
echo "cd /home/cdc/projects"
echo "mv info-navigator/boxiii-temp boxiii"
echo "cd boxiii"
echo ""
read -p "Press enter when you've completed these steps..."

echo -e "${YELLOW}Step 2: Copying Builder files${NC}"

# Create Builder structure
mkdir -p builder/backend
mkdir -p builder/frontend/src
mkdir -p builder/frontend/public
mkdir -p builder/data

# Copy Python backend files
echo "Copying Builder backend files..."
cp ../info-navigator/builder/*.py builder/backend/
cp ../info-navigator/builder/requirements.txt builder/backend/
cp -r ../info-navigator/builder/data/* builder/data/ 2>/dev/null || true
cp -r ../info-navigator/builder/test_scipts builder/backend/ 2>/dev/null || true

echo -e "${GREEN}✓ Builder backend files copied${NC}"

echo -e "${YELLOW}Step 3: Copying Viewer (PWA) files${NC}"

# Copy PWA files
echo "Copying Viewer PWA files..."
cp -r ../info-navigator-pwa/* viewer/ 2>/dev/null || true

echo -e "${GREEN}✓ Viewer PWA files copied${NC}"

echo -e "${YELLOW}Step 4: Creating Docker files${NC}"

# Create Builder Dockerfile
cat > builder/Dockerfile << 'EOF'
# Builder Backend Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create Viewer Dockerfile
cat > viewer/Dockerfile << 'EOF'
# Viewer PWA Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  builder-backend:
    build: 
      context: ./builder
      dockerfile: Dockerfile
    container_name: boxiii-builder-backend
    ports:
      - "8001:8000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./builder/data:/app/data
    networks:
      - boxiii-network

  builder-frontend:
    build: 
      context: ./builder/frontend
      dockerfile: Dockerfile
    container_name: boxiii-builder-frontend
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8001
    depends_on:
      - builder-backend
    networks:
      - boxiii-network

  viewer:
    build: 
      context: ./viewer
      dockerfile: Dockerfile
    container_name: boxiii-viewer
    ports:
      - "3000:80"
    volumes:
      - ./viewer/public/data:/usr/share/nginx/html/data
    networks:
      - boxiii-network

networks:
  boxiii-network:
    driver: bridge
EOF

echo -e "${GREEN}✓ Docker files created${NC}"

echo -e "${YELLOW}Step 5: Creating .gitignore${NC}"

cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.env

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Build directories
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Project specific
builder/data/images/
viewer/public/data/
*.log
.cache/

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local
EOF

echo -e "${GREEN}✓ .gitignore created${NC}"

echo -e "${YELLOW}Step 6: Creating environment template${NC}"

cat > .env.example << 'EOF'
# Builder Service
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
CLAUDE_API_KEY=your-claude-api-key
OPENAI_API_KEY=your-openai-api-key

# Database (future)
MONGODB_URI=mongodb://localhost:27017/boxiii

# Viewer Service
REACT_APP_API_URL=http://localhost:8001
EOF

echo -e "${GREEN}✓ Environment template created${NC}"

echo ""
echo -e "${GREEN}=== Migration Summary ===${NC}"
echo "1. Repository structure created"
echo "2. Builder files need to be copied (see manual steps)"
echo "3. Viewer PWA files need to be copied (see manual steps)"
echo "4. Docker configuration created"
echo "5. Environment template created"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Initialize git repository: git add . && git commit -m 'Initial Boxiii structure'"
echo "2. Create GitHub repository named 'boxiii'"
echo "3. Push to GitHub: git remote add origin https://github.com/[username]/boxiii.git"
echo "4. Copy .env.example to .env and add your API keys"
echo "5. Update Builder to use new JSON format (see MIGRATION_GUIDE.md)"
echo ""
echo -e "${GREEN}Migration preparation complete!${NC}"