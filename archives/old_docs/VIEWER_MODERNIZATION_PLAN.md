# Boxiii Viewer Modernization Plan

**Created**: June 27, 2025  
**Status**: Planning Phase  
**Goal**: Transform Viewer from Netflix-style to personal "My Boxes" MVP

## Current State Analysis

### What We Have
- **Technology**: React 18.2 with Create React App (outdated build system)
- **Data**: Static JSON files in `public/data/` (not connected to Builder API)
- **UI**: Netflix-style with hero banner and content rows
- **Features**: Basic quiz/card viewing, Portuguese translations
- **Styling**: Tailwind CSS v3 (Builder uses v4)
- **PWA**: Partial implementation (manifest exists, no service worker)

### Problems to Solve
1. **No API Connection**: Uses static JSON instead of Builder API
2. **Wrong UI Paradigm**: Netflix-style vs personal collection
3. **Outdated Build**: CRA is deprecated, should use Vite
4. **No Box Covers**: Missing visual identity for boxes
5. **Poor Mobile UX**: Not optimized for touch/mobile
6. **No User Context**: No authentication or personalization

## MVP Architecture

### Phase 1: Foundation Upgrade (Week 1)

#### 1.1 Migrate to Vite
```bash
# Create new Vite project
npm create vite@latest viewer-new -- --template react-ts

# Benefits:
- Fast HMR (like Builder)
- Modern build system
- TypeScript support
- Better PWA plugin support
```

#### 1.2 Connect to Builder API
```typescript
// New API Service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const boxiiiAPI = {
  // Public endpoints (no auth required for MVP)
  getBoxes: () => fetch(`${API_URL}/sets`).then(r => r.json()),
  getBox: (id: string) => fetch(`${API_URL}/sets/${id}`).then(r => r.json()),
  getCards: (setId: string) => fetch(`${API_URL}/cards?set_id=${setId}`).then(r => r.json()),
  getCreator: (id: string) => fetch(`${API_URL}/creators/${id}`).then(r => r.json()),
};
```

#### 1.3 TypeScript Interfaces (Shared with Builder)
```typescript
// Share these with Builder
interface Box {
  set_id: string;
  title: string;
  description: string;
  cover_url?: string; // NEW FIELD
  thumbnail_url: string;
  creator_id: string;
  card_count: number;
  difficulty_level: string;
  estimated_time_minutes: number;
  progress?: UserProgress; // Future
}

interface Card {
  card_id: string;
  title: string;
  summary: string;
  detailed_content: string;
  media: MediaAttachment[];
  order_index: number;
}
```

### Phase 2: MVP UI Components (Week 2)

#### 2.1 My Boxes Grid
```typescript
// Simple grid layout - NOT Netflix rows
<MyBoxesGrid>
  <BoxCard>
    <BoxCover /> // Book-like cover
    <BoxTitle />
    <BoxProgress /> // 70% complete
    <BoxActions /> // Continue, Share
  </BoxCard>
</MyBoxesGrid>
```

#### 2.2 Mobile-First Card Viewer
```typescript
// Swipeable card interface
<CardViewer>
  <CardProgress /> // 3 of 10
  <CardContent>
    <CardMedia /> // Image/Video
    <CardTitle />
    <CardBody />
  </CardContent>
  <CardNavigation>
    <SwipeIndicator />
    <CardDots /> // ••●••••
  </CardNavigation>
</CardViewer>
```

#### 2.3 Box Cover Component
```typescript
// Book/Album cover aesthetic
<BoxCover 
  coverUrl={box.cover_url}
  fallback={generateCoverFromTitle(box.title)}
  aspectRatio="square" // or "portrait"
  size="medium"
/>
```

### Phase 3: Core Features (Week 3)

#### 3.1 Navigation Flow
```
Home (My Boxes) → Box Details → Card Viewer
      ↓                            ↓
   All Boxes                  Save Progress
```

#### 3.2 Offline Support (PWA)
```javascript
// Vite PWA Plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.boxiii\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
            },
          },
        ],
      },
    }),
  ],
});
```

#### 3.3 Local Progress Storage
```typescript
// IndexedDB for offline progress
const progressDB = {
  save: (boxId: string, cardIndex: number) => {
    localStorage.setItem(`progress_${boxId}`, cardIndex.toString());
  },
  get: (boxId: string): number => {
    return parseInt(localStorage.getItem(`progress_${boxId}`) || '0');
  },
};
```

## Implementation Roadmap

### Week 1: Foundation
- [x] Create future features document
- [ ] Set up new Vite project with TypeScript
- [ ] Migrate core components to new structure
- [ ] Connect to Builder API endpoints
- [ ] Set up shared TypeScript interfaces

### Week 2: MVP UI
- [ ] Design and implement My Boxes grid
- [ ] Create mobile-first card viewer
- [ ] Implement box cover component
- [ ] Add touch gestures for mobile
- [ ] Create responsive layouts

### Week 3: Features & Polish
- [ ] Add offline support (PWA)
- [ ] Implement progress tracking
- [ ] Add basic animations
- [ ] Test on real devices
- [ ] Deploy MVP

## Technical Decisions

### Why Vite over CRA
- Same as Builder (consistency)
- 10-100x faster HMR
- Modern build optimizations
- Better PWA support
- Active maintenance

### Why TypeScript
- Share interfaces with Builder
- Better IDE support
- Catch errors early
- Self-documenting code

### Why API-First
- Real-time content updates
- Single source of truth
- Enable future features (auth, progress sync)
- Consistent with Builder architecture

## MVP Success Criteria

### Must Have
- ✅ Grid view of boxes (not Netflix rows)
- ✅ Mobile-friendly card navigation
- ✅ Connect to Builder API
- ✅ Basic offline support
- ✅ Visual box covers

### Nice to Have
- Progress persistence
- Smooth animations
- Share functionality
- Search/filter boxes
- Dark/light theme

### Won't Have (Yet)
- User authentication
- Social features
- Payment integration
- Multiple viewer types
- Advanced gamification

## Migration Strategy

### Parallel Development
1. Keep current viewer running
2. Build new viewer in `viewer-new/`
3. Test thoroughly
4. Switch when ready
5. Archive old viewer

### Data Migration
- Current: Static JSON files
- New: Builder API calls
- Fallback: Cache API responses for offline

### Deployment
- Current: GitHub Pages with HashRouter
- New: Vercel/Netlify with proper routing
- Future: Integrate with VPS deployment

## Next Steps

1. **Immediate**: Create new Vite project structure
2. **This Week**: Connect to Builder API
3. **Next Week**: Build MVP UI components
4. **Two Weeks**: Deploy and test MVP

---

**Questions to Resolve**:
1. Should we add `cover_url` field to Builder first?
2. How to handle user progress without auth?
3. Which deployment platform for MVP?
4. How to migrate existing static data users?