# Boxiii Trivia Viewer

A beautiful, premium trivia card interface that connects to your Boxiii API to display content in an elegant card game format.

## Features

### 🎨 Premium Design
- **Beautiful Typography**: Uses Google Fonts (Inter + Playfair Display)
- **Card Game Aesthetic**: Professional trivia deck appearance
- **Smooth Animations**: CSS transforms with cubic-bezier easing
- **Premium Color Scheme**: Dark background with elegant card styling
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🎯 Interactive Experience
- **Card Flip Animation**: Click or tap to reveal answers
- **Keyboard Navigation**: Full keyboard support for power users
- **Touch Support**: Swipe gestures for mobile navigation
- **Card Counter**: Shows current position (e.g., "Card 3 of 10")
- **Loading States**: Beautiful loading spinner and error handling

### 🎮 Controls
- **Click/Touch**: Flip card to reveal answer
- **Spacebar**: Flip card
- **Arrow Keys**: Navigate between cards (← Previous, → Next)
- **ESC Key**: Exit trivia
- **Swipe Gestures**: Navigate cards on mobile devices

### 🔌 API Integration
- **Live Data**: Connects to your Boxiii API
- **Auto-refresh**: Updates content every 5 minutes
- **Error Handling**: Graceful error states with retry options
- **Dynamic Content**: Shows real trivia cards from your database

## Installation

### Quick Deployment (VPS)

1. **Copy files to your VPS**:
   ```bash
   # From your local project directory
   scp trivia.html user@your-vps:/opt/boxiii/
   scp deploy-trivia.sh user@your-vps:/opt/boxiii/
   ```

2. **Deploy on VPS**:
   ```bash
   # On your VPS
   cd /opt/boxiii
   chmod +x deploy-trivia.sh
   ./deploy-trivia.sh
   ```

3. **Access the trivia viewer**:
   ```
   http://your-domain.com/trivia
   ```

### Manual Installation

1. **Place trivia.html** in your web server directory:
   ```bash
   cp trivia.html /var/www/html/
   ```

2. **Update nginx configuration** to serve the file:
   ```nginx
   location /trivia {
       alias /var/www/html/trivia.html;
       expires 1h;
       add_header Cache-Control "public";
   }
   ```

3. **Restart nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

## Usage

### Basic Navigation
1. **Start**: Open `/trivia` in your browser
2. **Read Question**: Question appears on the front of the card
3. **Flip to Answer**: Click the card or press Spacebar
4. **Navigate**: Use arrow keys or navigation buttons
5. **Exit**: Press ESC or click Exit button

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Flip card |
| `←` | Previous card |
| `→` | Next card |
| `ESC` | Exit trivia |

### Mobile Gestures
- **Tap**: Flip card
- **Swipe Left**: Next card
- **Swipe Right**: Previous card

## Configuration

### API Endpoint
The trivia viewer automatically detects your environment:
- **Production**: Uses `/api` (served by nginx)
- **Development**: Uses `http://localhost:5001/api`

### Custom Styling
To customize the appearance, edit the CSS variables in `trivia.html`:

```css
:root {
    --bg-primary: #0f1419;        /* Background gradient start */
    --bg-secondary: #1a2332;      /* Background gradient end */
    --card-bg: #ffffff;           /* Card background */
    --accent-primary: #667eea;    /* Primary accent color */
    --accent-secondary: #764ba2;  /* Secondary accent color */
    --gold: #f6e05e;             /* Gold accent for counter */
}
```

## Troubleshooting

### Common Issues

1. **Cards Not Loading**
   - Check that your Boxiii API is running
   - Verify API endpoint in browser console
   - Ensure you have created content cards in the Builder

2. **Styling Issues**
   - Check that Google Fonts are loading
   - Verify CSS is not being cached
   - Test in different browsers

3. **Navigation Not Working**
   - Check JavaScript console for errors
   - Ensure all DOM elements are properly loaded
   - Test keyboard events in browser

### Error Messages
- **"No trivia cards found"**: Create content in the Builder first
- **"HTTP 404"**: Check API endpoint configuration
- **"Unable to load"**: Check network connection and API status

## Technical Details

### Files
- `trivia.html`: Main trivia viewer (self-contained HTML/CSS/JS)
- `deploy-trivia.sh`: Deployment script for VPS
- `TRIVIA_VIEWER.md`: This documentation

### Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features Used**: CSS Grid, Flexbox, CSS Transforms, ES6+ JavaScript

### Performance
- **Bundle Size**: ~15KB (self-contained, no external dependencies except fonts)
- **Load Time**: < 1 second on modern connections
- **Animations**: Hardware-accelerated CSS transforms
- **API Calls**: Minimal, with 5-minute refresh interval

## Integration with Boxiii

The trivia viewer integrates seamlessly with your Boxiii system:

1. **Data Source**: Pulls from `/api/cards` endpoint
2. **Content Format**: Uses `title`, `detailed_content`, and `summary` fields
3. **Real-time Updates**: Automatically refreshes content
4. **Creator Integration**: Shows creator information when available

## Future Enhancements

Planned features for future versions:
- [ ] Category filtering
- [ ] Progress tracking
- [ ] Score keeping
- [ ] Multiplayer support
- [ ] Audio support
- [ ] Offline mode
- [ ] Custom themes

---

**Created**: June 27, 2025  
**Version**: 1.0.0  
**Compatibility**: Boxiii Builder API v1.0.0+