# Documentation Summary

This document provides an overview of the simplified documentation structure for the Boxiii project.

## Active Documentation

### Core Files (Root Level)
- `README.md` - Main project overview, quick start, and basic information
- `CLAUDE.md` - Project memory for Claude Code (development assistant instructions)

### Technical Documentation (docs/)
- `architecture.md` - System architecture, data flow, API design
- `deployment.md` - VPS deployment guide with Docker and Nginx
- `monorepo-structure.md` - Detailed explanation of project organization

### Application-Specific Documentation
- `apps/viewer/README.md` - PWA viewer setup and features
- `apps/viewer-mobile/README.md` - React Native mobile app documentation

## Archived Documentation

All legacy documentation has been moved to `archives/old_docs/` including:
- Historical session summaries
- Old planning documents
- Legacy CI/CD documentation
- Development history logs
- Problem-solving records

## Documentation Principles

### Simplified Structure
1. **Single Source of Truth**: Each topic covered in one primary document
2. **Current Information**: All active docs reflect the monorepo structure
3. **Clear Hierarchy**: Root README → Technical docs → App-specific docs
4. **No Duplicates**: Removed redundant files (setup.md was duplicate of README.md)

### Content Standards
- Updated all path references to match monorepo structure
- Removed outdated status information
- Consolidated overlapping technical details
- Focused on practical, actionable information

## File Changes Made

### Updated Files
- `README.md` - Completely rewritten for monorepo structure
- `docs/architecture.md` - Simplified and updated with current tech stack
- `docs/deployment.md` - Updated for new directory structure and corrected paths

### Removed Files
- `docs/setup.md` - Was duplicate of README.md content

### Preserved Files
- `docs/monorepo-structure.md` - Created during reorganization, provides detailed structure explanation
- Application READMEs - Already current and well-written

## Navigation Guide

**For project overview**: Start with `README.md`
**For technical details**: Read `docs/architecture.md`  
**For deployment**: Follow `docs/deployment.md`
**For project organization**: Reference `docs/monorepo-structure.md`
**For app-specific info**: Check respective `apps/*/README.md` files

## Maintenance

This documentation structure should be maintained by:
1. Keeping README.md current with any major changes
2. Updating architecture.md when system design changes
3. Revising deployment.md when deployment process changes
4. Archiving outdated information rather than deleting it

All documentation follows the principle of providing clear, actionable information without redundancy.