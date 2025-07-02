# Boxiii Git Branch Strategy

## Current Branch Structure (2025-06-27)

### 🌳 **Three-Branch Model**

```
main                    # Old stable version (reference/fallback)
viewer-pwa-wsl-fix     # Previous PWA version (keep as backup)
pwa-dev                # Current working version (active development)
```

### 📋 **Branch Purposes**

#### **main**
- **Purpose**: Old stable version for reference
- **Use Case**: Fallback if we need to refer to previous decisions
- **Status**: Read-only, historical reference
- **Note**: Clean alternative to git rollback for major version differences

#### **viewer-pwa-wsl-fix** 
- **Purpose**: Previous PWA implementation (backup)
- **Use Case**: Reference for old implementation decisions
- **Status**: Frozen after pwa-dev creation
- **Timeline**: Delete after tomorrow when structure is cleaned

#### **pwa-dev**
- **Purpose**: Current active development branch
- **Use Case**: All ongoing wellness interface, PWA, and feature development
- **Status**: Active - all commits happen here
- **Content**: Wellness interface, documentation, CI/CD setup

## 🚀 **Development Workflow**

### **Daily Development**
1. Work in `pwa-dev` branch
2. Commit changes regularly
3. Document major decisions
4. Keep structure clean but functional

### **Tomorrow's Cleanup Plan**
1. Review and organize `pwa-dev` structure
2. Remove unnecessary files
3. Clean up documentation
4. Delete `viewer-pwa-wsl-fix` branch
5. Establish final CI/CD workflow

## 📁 **Current Working Structure**

### **Active Files in pwa-dev**
- `wellness.html` - Wellness interface
- `wellness-images/` - Local image assets
- `ci-cd/` - CI/CD infrastructure
- `WELLNESS_INTERFACE.md` - Technical docs
- `WELLNESS_DEPLOYMENT_GUIDE.md` - Operations guide
- `CLAUDE.md` - Project memory

### **Files to Review Tomorrow**
- Old documentation files
- Duplicate or outdated configs
- Unused assets
- Legacy code remnants

## 🎯 **Safety Principles**

1. **Never delete without backup**: Keep old branches until new structure is proven
2. **Incremental changes**: Small, tested modifications
3. **Document decisions**: Clear reasoning for all structural changes
4. **Test thoroughly**: Verify deployments work before cleanup
5. **Multiple recovery points**: Git history + branch backups

## 📝 **Notes for Tomorrow**

- Current structure works but needs organization
- Feature branches discussion postponed (good decision)
- CI/CD infrastructure started but basic
- Wellness interface successfully deployed
- All critical files documented and backed up

---

**Created**: June 27, 2025  
**Current Branch**: pwa-dev  
**Status**: Active Development  
**Next Review**: Tomorrow (cleanup session)