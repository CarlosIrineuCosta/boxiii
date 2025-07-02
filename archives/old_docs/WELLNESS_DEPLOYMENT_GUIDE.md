# Wellness Interface Deployment Guide

## Quick Reference

### Live URLs
- **Production**: http://147.79.110.46/wellness.html
- **Local Development**: file:///home/cdc/projects/boxiii/wellness.html

### Key Files
- **Main Interface**: `/home/cdc/projects/boxiii/wellness.html`
- **Production**: `/var/www/html/wellness.html`
- **Images**: `/var/www/html/images/wellness/c001-c010.jpg`
- **Documentation**: `/home/cdc/projects/boxiii/WELLNESS_INTERFACE.md`

## Deployment Commands

### Full Deployment (Interface + Images)
```bash
# Deploy main interface
scp /home/cdc/projects/boxiii/wellness.html root@147.79.110.46:/var/www/html/

# Deploy images (if needed)
scp /home/cdc/projects/boxiii/wellness-images/* root@147.79.110.46:/var/www/html/images/wellness/

# Verify deployment
curl -I http://147.79.110.46/wellness.html
```

### Interface Only Update
```bash
# For content/styling changes
scp /home/cdc/projects/boxiii/wellness.html root@147.79.110.46:/var/www/html/
```

### Image Management
```bash
# Create image directories
ssh root@147.79.110.46 "mkdir -p /var/www/html/images/wellness"

# Copy specific images
scp /home/cdc/projects/boxiii/viewer/public/images/sets/s002/cards/c00{1,2,3,4,5,6}.jpg root@147.79.110.46:/var/www/html/images/wellness/

# Verify images
ssh root@147.79.110.46 "ls -la /var/www/html/images/wellness/"
```

## Development Workflow

### 1. Local Development
```bash
# Edit interface
vim /home/cdc/projects/boxiii/wellness.html

# Test locally (open in browser)
firefox /home/cdc/projects/boxiii/wellness.html
```

### 2. Content Updates
```bash
# Update card content in wellness.html
# Sections to modify:
# - .card-title
# - .card-summary  
# - .card-back-text
# - background-image URLs
```

### 3. Deploy to Production
```bash
# Single command deployment
scp /home/cdc/projects/boxiii/wellness.html root@147.79.110.46:/var/www/html/
```

### 4. Verify Deployment
```bash
# Check file exists
ssh root@147.79.110.46 "ls -la /var/www/html/wellness.html"

# Test in browser
curl -I http://147.79.110.46/wellness.html

# Check last modified
ssh root@147.79.110.46 "stat /var/www/html/wellness.html"
```

## CI/CD Integration

### GitHub Actions Workflow (Future)
```yaml
name: Deploy Wellness Interface
on:
  push:
    paths:
      - 'wellness.html'
      - 'wellness-images/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to VPS
        run: |
          scp wellness.html ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/var/www/html/
          scp wellness-images/* ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/var/www/html/images/wellness/
```

### Manual Sync Check
```bash
# Compare local vs production
diff /home/cdc/projects/boxiii/wellness.html <(ssh root@147.79.110.46 "cat /var/www/html/wellness.html")

# Check for differences (should be empty if synced)
echo $?  # 0 = identical, 1 = different
```

## Image Asset Management

### Current Image Mapping
| Card | Image File | Content Topic |
|------|------------|---------------|
| 1 | c001.jpg | 5 Pilares do Bem-estar |
| 2 | c002.jpg | Exercícios de Baixo Impacto |
| 3 | c003.jpg | Alimentação Anti-inflamatória |
| 4 | c004.jpg | Qualidade do Sono |
| 5 | c005.jpg | Conexões Sociais |
| 6 | c006.jpg | Mindfulness e Meditação |

### Adding New Images
```bash
# 1. Add image to local directory
cp new-image.jpg /home/cdc/projects/boxiii/wellness-images/c007.jpg

# 2. Deploy to VPS
scp /home/cdc/projects/boxiii/wellness-images/c007.jpg root@147.79.110.46:/var/www/html/images/wellness/

# 3. Update wellness.html to use new image
# Add new card with: background-image: url('/images/wellness/c007.jpg');
```

### Image Optimization (Future)
```bash
# Convert to WebP for better performance
cwebp -q 80 c001.jpg -o c001.webp

# CSS fallback implementation
background-image: url('/images/wellness/c001.webp'), url('/images/wellness/c001.jpg');
```

## Server Configuration

### Nginx Configuration
```nginx
# Static file serving
location /images/wellness/ {
    alias /var/www/html/images/wellness/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Wellness interface
location /wellness {
    alias /var/www/html/wellness.html;
    expires 1h;
    add_header Cache-Control "public";
}
```

### File Permissions
```bash
# Set correct permissions
ssh root@147.79.110.46 "chmod 644 /var/www/html/wellness.html"
ssh root@147.79.110.46 "chmod 644 /var/www/html/images/wellness/*.jpg"
ssh root@147.79.110.46 "chown www-data:www-data /var/www/html/wellness.html"
ssh root@147.79.110.46 "chown www-data:www-data /var/www/html/images/wellness/*.jpg"
```

## Backup & Recovery

### Create Backup
```bash
# Backup current interface
ssh root@147.79.110.46 "cp /var/www/html/wellness.html /var/www/html/wellness.html.backup.$(date +%Y%m%d)"

# Backup images
ssh root@147.79.110.46 "tar -czf /var/www/html/wellness-images-backup-$(date +%Y%m%d).tar.gz /var/www/html/images/wellness/"
```

### Restore from Backup
```bash
# Restore interface
ssh root@147.79.110.46 "cp /var/www/html/wellness.html.backup.20250627 /var/www/html/wellness.html"

# Restore images
ssh root@147.79.110.46 "tar -xzf /var/www/html/wellness-images-backup-20250627.tar.gz -C /"
```

## Testing & Validation

### Pre-deployment Checks
```bash
# 1. Validate HTML syntax
# Use online validator or: tidy -errors /home/cdc/projects/boxiii/wellness.html

# 2. Check image references
grep -o "url('/images/wellness/[^']*')" /home/cdc/projects/boxiii/wellness.html

# 3. Test card flip functionality locally
# Open in browser and click each card

# 4. Check responsive design
# Test in browser developer tools with mobile viewport
```

### Post-deployment Validation
```bash
# 1. Check HTTP response
curl -I http://147.79.110.46/wellness.html
# Should return: HTTP/1.1 200 OK

# 2. Validate images load
curl -I http://147.79.110.46/images/wellness/c001.jpg
# Should return: HTTP/1.1 200 OK

# 3. Check file size (should be ~12KB)
ssh root@147.79.110.46 "du -h /var/www/html/wellness.html"

# 4. Test card functionality
# Manual browser testing required
```

## Performance Monitoring

### Load Time Analysis
```bash
# Test page load speed
curl -w "@curl-format.txt" -o /dev/null -s http://147.79.110.46/wellness.html

# Where curl-format.txt contains:
# time_namelookup:  %{time_namelookup}\n
# time_connect:     %{time_connect}\n
# time_total:       %{time_total}\n
```

### Image Optimization Check
```bash
# Check image sizes
ssh root@147.79.110.46 "du -h /var/www/html/images/wellness/*.jpg"

# Ideal size: <500KB per image for web optimization
```

## Troubleshooting

### Common Issues & Solutions

1. **404 Error on Images**
   ```bash
   # Check image path and permissions
   ssh root@147.79.110.46 "ls -la /var/www/html/images/wellness/"
   ssh root@147.79.110.46 "nginx -t && systemctl reload nginx"
   ```

2. **Card Flip Not Working**
   ```bash
   # Check JavaScript console in browser
   # Verify CSS classes are properly applied
   # Test with simplified card structure
   ```

3. **Mobile Display Issues**
   ```bash
   # Check viewport meta tag
   grep "viewport" /home/cdc/projects/boxiii/wellness.html
   
   # Test responsive breakpoints
   # Use browser developer tools
   ```

4. **Portuguese Characters Not Displaying**
   ```bash
   # Check charset encoding
   grep "charset" /home/cdc/projects/boxiii/wellness.html
   # Should be: <meta charset="UTF-8">
   ```

### Debug Commands
```bash
# Check VPS connectivity
ping 147.79.110.46

# Check nginx status
ssh root@147.79.110.46 "systemctl status nginx"

# Check nginx logs
ssh root@147.79.110.46 "tail -f /var/log/nginx/access.log"
ssh root@147.79.110.46 "tail -f /var/log/nginx/error.log"

# Test local vs remote file diff
diff /home/cdc/projects/boxiii/wellness.html <(ssh root@147.79.110.46 "cat /var/www/html/wellness.html")
```

## Security Notes

### File Security
- All files have restrictive permissions (644)
- No executable scripts or user uploads
- Static content only - no server-side processing

### HTTPS Migration (Future)
```bash
# Install Certbot for SSL
ssh root@147.79.110.46 "apt install certbot python3-certbot-nginx"

# Get SSL certificate
ssh root@147.79.110.46 "certbot --nginx -d yourdomain.com"

# Update URLs from http:// to https://
```

---

**Deployment Status**: ✅ Production Ready  
**Last Updated**: June 27, 2025  
**Environment**: Hostinger VPS (Ubuntu + Nginx)  
**Maintenance**: Monthly image optimization recommended