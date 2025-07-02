# Boxiii Future Features & Development Roadmap

**Created**: June 27, 2025  
**Purpose**: Track future development ideas and feature requests

## Immediate Priorities (Viewer MVP)

### Missing Data Fields for Box Covers
- **Issue**: Need cover image fields similar to book/CD/movie covers
- **Current**: Only have `thumbnail_url` and `banner_url` in content_sets
- **Needed**: 
  - `cover_url` - Square format cover image (like album art)
  - `cover_aspect_ratio` - Support different formats (square, portrait, landscape)
  - `cover_metadata` - Additional info (designer, style, theme)

### Viewer Types (Future Implementations)
1. **Memory Games Viewer** - Matching cards, recall exercises
2. **Trivia Viewer** - Quiz format with scoring
3. **Quiz with Answers** - Educational testing mode
4. **Flashcard Viewer** - Study mode with spaced repetition
5. **Story Mode Viewer** - Narrative progression through cards

## Viewer MVP Features

### 1. My Boxes Grid
- Personal collection view (not Netflix-style browsing)
- User's subscribed/saved boxes
- Recently accessed boxes
- Progress tracking per box

### 2. Mobile-First Design
- Touch-optimized card navigation
- Swipe gestures for card transitions
- Responsive grid layouts
- PWA capabilities for offline use

### 3. Box Cover Display
- Book/album cover aesthetic
- Visual identity for each box
- Creator branding integration
- Cover animations on hover/tap

### 4. Card Navigation
- Simple, intuitive card progression
- Visual progress indicators
- Quick jump to specific cards
- Bookmark/save card positions

## Technical Enhancements

### API Integration
- [ ] Connect Viewer to Builder API instead of static JSON
- [ ] Real-time content updates
- [ ] User authentication and personalization
- [ ] Progress sync across devices

### Performance
- [ ] Lazy loading for images
- [ ] Service worker for offline access
- [ ] Optimized bundle size
- [ ] CDN integration for media

### User Features
- [ ] User accounts and profiles
- [ ] Progress tracking
- [ ] Favorites/bookmarks
- [ ] Social sharing
- [ ] Comments/notes on cards

## Content Enhancements

### Rich Media Support
- [ ] Video cards
- [ ] Audio narration
- [ ] Interactive elements
- [ ] Embedded quizzes
- [ ] AR/VR experiences

### Gamification
- [ ] Achievement system
- [ ] Streak tracking
- [ ] Points/rewards
- [ ] Leaderboards
- [ ] Certificates

## Platform Features

### Creator Tools
- [ ] Analytics dashboard in Builder
- [ ] A/B testing for content
- [ ] Engagement metrics
- [ ] Revenue tracking
- [ ] Content scheduling

### Monetization
- [ ] Subscription tiers
- [ ] Pay-per-box model
- [ ] Creator revenue sharing
- [ ] Corporate/education pricing
- [ ] Sponsored content

## Future Architecture

### Multi-Viewer Architecture
```
Builder API
    ├── Standard Viewer (current MVP)
    ├── Memory Game Viewer
    ├── Trivia Viewer
    ├── Quiz Viewer
    ├── Flashcard Viewer
    └── Custom Viewers (SDK)
```

### Viewer SDK
- [ ] Component library for custom viewers
- [ ] Plugin system for extensions
- [ ] Theme customization
- [ ] White-label support

## Notes

### Design Inspiration
- Think Spotify album covers for boxes
- Apple Books for reading experience
- Duolingo for gamification
- Netflix for discovery (but personal, not algorithmic)

### User Research Needed
- How users want to organize their boxes
- Preferred navigation patterns
- Mobile vs desktop usage
- Offline requirements
- Social features importance

---

**Last Updated**: June 27, 2025  
**Next Review**: After Viewer MVP completion