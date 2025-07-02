# Viewer MVP Action Plan - Quick Implementation

**Goal**: Get a working "My Boxes" viewer with card navigation ASAP

## Quick Win Approach (Keep Current Stack)

Instead of full modernization, let's update the existing viewer for quick MVP:

### Step 1: Transform Homepage to "My Boxes" Grid (2 hours)

```javascript
// Update HomePage.js to show grid instead of Netflix rows
// src/pages/HomePage.js

const MyBoxesPage = () => {
  const [boxes, setBoxes] = useState([]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Minhas Caixas</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boxes.map(box => (
          <BoxCard key={box.set_id} box={box} />
        ))}
      </div>
    </div>
  );
};
```

### Step 2: Create Box Card Component (1 hour)

```javascript
// New component: src/components/BoxCard.js
const BoxCard = ({ box }) => {
  const progress = getProgress(box.set_id); // from localStorage
  
  return (
    <Link to={`/box/${box.set_id}`} className="block">
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition">
        {/* Box Cover - Book Style */}
        <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 p-4">
          <img 
            src={box.thumbnail_url} 
            alt={box.title}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              e.target.src = generatePlaceholderCover(box.title);
            }}
          />
        </div>
        
        {/* Box Info */}
        <div className="p-4">
          <h3 className="font-semibold truncate">{box.title}</h3>
          <p className="text-sm text-gray-400">{box.card_count} cards</p>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(progress / box.card_count) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
```

### Step 3: Improve Mobile Card Viewer (2 hours)

```javascript
// Update QuizPage.js for better mobile UX
const CardViewer = () => {
  const [touchStart, setTouchStart] = useState(null);
  
  // Add swipe support
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (diff > 50) goToNextCard();
    if (diff < -50) goToPreviousCard();
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bar */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Card {currentIndex + 1}</span>
          <span>{box.title}</span>
        </div>
        <div className="bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Card Content */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
          {currentCard.media?.[0] && (
            <img 
              src={currentCard.media[0].url} 
              alt={currentCard.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          
          <h2 className="text-xl font-bold mb-2">{currentCard.title}</h2>
          <p className="text-gray-300 mb-4">{currentCard.summary}</p>
          
          {showAnswer && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <p className="text-sm">{currentCard.detailed_content}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="p-4 flex justify-between items-center">
        <button 
          onClick={goToPreviousCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-gray-700 disabled:opacity-50"
        >
          ←
        </button>
        
        <button 
          onClick={toggleAnswer}
          className="px-6 py-2 bg-blue-500 rounded-full"
        >
          {showAnswer ? 'Ocultar' : 'Ver Resposta'}
        </button>
        
        <button 
          onClick={goToNextCard}
          disabled={currentIndex === cards.length - 1}
          className="p-3 rounded-full bg-gray-700 disabled:opacity-50"
        >
          →
        </button>
      </div>
      
      {/* Dots Indicator */}
      <div className="pb-4 flex justify-center gap-1">
        {cards.map((_, i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
```

### Step 4: Add Progress Tracking (1 hour)

```javascript
// src/services/progressService.js
export const progressService = {
  saveProgress: (boxId, cardIndex) => {
    const progress = {
      boxId,
      cardIndex,
      lastAccessed: new Date().toISOString(),
    };
    localStorage.setItem(`progress_${boxId}`, JSON.stringify(progress));
  },
  
  getProgress: (boxId) => {
    const saved = localStorage.getItem(`progress_${boxId}`);
    return saved ? JSON.parse(saved) : null;
  },
  
  getAllProgress: () => {
    const progress = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('progress_')) {
        const boxId = key.replace('progress_', '');
        progress[boxId] = JSON.parse(localStorage.getItem(key));
      }
    }
    return progress;
  },
};
```

### Step 5: Connect to Builder API (3 hours)

```javascript
// Update src/services/dataService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const getBoxes = async () => {
  try {
    const response = await fetch(`${API_URL}/sets`);
    return await response.json();
  } catch (error) {
    // Fallback to static JSON
    return fetchData('./data/content_sets.json');
  }
};

export const getCards = async (setId) => {
  try {
    const response = await fetch(`${API_URL}/cards?set_id=${setId}`);
    return await response.json();
  } catch (error) {
    // Fallback to static JSON
    const allCards = await fetchData('./data/cards.json');
    return allCards.filter(card => card.set_id === setId);
  }
};
```

## Implementation Order

### Day 1 (Today)
1. ✅ Create documentation (DONE)
2. [ ] Transform homepage to grid view
3. [ ] Create BoxCard component
4. [ ] Add progress tracking

### Day 2
1. [ ] Improve mobile card viewer
2. [ ] Add swipe gestures
3. [ ] Test on real mobile device

### Day 3
1. [ ] Connect to Builder API
2. [ ] Add fallback for offline
3. [ ] Deploy and test

## Files to Modify

1. **src/App.js** - Update routes
2. **src/pages/HomePage.js** → Rename to MyBoxesPage.js
3. **src/components/BoxCard.js** - NEW FILE
4. **src/pages/QuizPage.js** → Rename to CardViewerPage.js
5. **src/services/dataService.js** - Add API connection
6. **src/services/progressService.js** - NEW FILE

## Quick Placeholder Cover Generator

```javascript
// src/utils/coverGenerator.js
export const generatePlaceholderCover = (title) => {
  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-red-500 to-pink-600',
    'from-yellow-500 to-orange-600',
  ];
  
  const colorIndex = title.length % colors.length;
  const initials = title.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Return data URL for SVG
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6" />
          <stop offset="100%" style="stop-color:#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            fill="white" font-size="60" font-weight="bold">
        ${initials}
      </text>
    </svg>
  `)}`;
};
```

## Testing Checklist

- [ ] Grid displays all boxes
- [ ] Box cards are clickable
- [ ] Progress saves to localStorage
- [ ] Cards are swipeable on mobile
- [ ] API fallback works offline
- [ ] Responsive on all screen sizes

## Deploy Options

1. **Keep GitHub Pages** (Easiest)
   - Update existing deployment
   - No infrastructure changes
   
2. **Move to Vercel** (Better)
   - Better routing support
   - API proxy capabilities
   - Automatic deployments

3. **Add to VPS** (Integrated)
   - Same server as Builder
   - Shared nginx config
   - Single domain

---

**Next Action**: Start with Step 1 - Transform Homepage to Grid