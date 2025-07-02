# Boxiii PWA Viewer

A Progressive Web App for viewing educational content boxes with offline support.

## Features

- **PWA Support**: Install as app on mobile/desktop
- **Offline First**: Download boxes for offline access
- **Touch Gestures**: Swipe to navigate cards
- **Progress Tracking**: Saves your position in each box
- **Responsive**: Works on all devices

## Tech Stack

- **Vite + React + TypeScript**: Modern build tooling
- **Tailwind CSS**: Utility-first styling
- **Dexie (IndexedDB)**: Offline database
- **React Swipeable**: Touch gesture support
- **Service Worker**: Offline caching

## Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA Features

### Offline Support
- Boxes can be downloaded for offline viewing
- Progress is saved locally
- API responses are cached

### Installation
- Add to Home Screen on mobile
- Install as desktop app on Chrome/Edge
- Works standalone without browser UI

### Touch Navigation
- Swipe left/right to navigate cards
- Tap to show/hide answers
- Smooth animations

## Deployment

### Static Hosting (Vercel/Netlify)
```bash
npm run build
# Deploy dist folder
```

### VPS with Nginx
```nginx
server {
  listen 443 ssl http2;
  server_name viewer.boxiii.com;
  
  root /var/www/viewer-pwa/dist;
  
  location / {
    try_files $uri /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:5001;
  }
}
```

## Architecture

```
viewer-pwa/
├── src/
│   ├── lib/
│   │   ├── db.ts        # Offline database (IndexedDB)
│   │   └── api.ts       # API with offline fallback
│   ├── pages/
│   │   ├── MyBoxesPage.tsx    # Grid view of boxes
│   │   └── CardViewerPage.tsx # Card navigation
│   ├── components/
│   │   └── BoxCard.tsx        # Box display component
│   └── App.tsx               # PWA detection & routing
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
└── index.html          # PWA meta tags
```

## Future Enhancements

- [ ] User authentication
- [ ] Sync progress across devices
- [ ] Multiple viewer modes (quiz, flashcards)
- [ ] Social sharing
- [ ] Analytics