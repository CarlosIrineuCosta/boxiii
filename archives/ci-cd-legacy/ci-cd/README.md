# Boxiii CI/CD Infrastructure

## Overview

This directory contains the CI/CD infrastructure for the Boxiii PWA development branch. The structure is designed to be simple, safe, and easy to maintain.

## Directory Structure

```
ci-cd/
├── scripts/           # Deployment and automation scripts
│   └── deploy-wellness.sh    # Wellness interface deployment
├── configs/           # Configuration files (future)
├── docs/             # CI/CD documentation
│   └── BRANCH_STRATEGY.md   # Git branch organization
└── README.md         # This file
```

## Quick Commands

### Deploy Wellness Interface
```bash
# From project root
./ci-cd/scripts/deploy-wellness.sh
```

### Check Current Branch
```bash
git branch
# Should show: * pwa-dev
```

## Current Status (2025-06-27)

### ✅ **Working**
- Wellness interface deployment script
- Three-branch strategy documented
- Safe development environment
- VPS deployment verified

### 🔄 **In Progress**
- CI/CD structure organization
- Documentation consolidation
- File cleanup planning

### 📋 **Tomorrow's Tasks**
- Clean up unnecessary files
- Organize documentation
- Delete old viewer-pwa-wsl-fix branch
- Finalize CI/CD workflow

## Safety Notes

- **Current branch**: `pwa-dev` (active development)
- **Backup branch**: `viewer-pwa-wsl-fix` (delete tomorrow)
- **Reference branch**: `main` (historical fallback)
- **All changes are committed regularly for safety**

## Usage Guidelines

1. **Stay in pwa-dev branch** for all development
2. **Test deployments** before major changes
3. **Document decisions** in appropriate files
4. **Keep structure simple** until proven workflow
5. **Don't delete old branches** until new structure is verified

---

**Created**: June 27, 2025  
**Branch**: pwa-dev  
**Status**: Active Development Infrastructure