import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { api } from '../lib/api';
import { db } from '../lib/db';
import type { Box, Card } from '../lib/db';

interface CardViewerPageProps {
  isOnline: boolean;
  isPWA: boolean;
}

export default function CardViewerPage({}: CardViewerPageProps) {
  const { boxId } = useParams<{ boxId: string }>();
  const navigate = useNavigate();
  
  const [box, setBox] = useState<Box | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (boxId) {
      loadBoxData();
    }
  }, [boxId]);

  useEffect(() => {
    // Save progress when card changes
    if (box && cards.length > 0) {
      db.saveProgress(box.set_id, currentIndex);
    }
  }, [currentIndex, box, cards]);

  const loadBoxData = async () => {
    if (!boxId) return;
    
    setLoading(true);
    try {
      const [boxData, cardsData] = await Promise.all([
        api.getBox(boxId),
        api.getCards(boxId)
      ]);
      
      if (boxData) {
        setBox(boxData);
        setCards(cardsData);
        
        // Load saved progress
        const progress = await db.getProgress(boxId);
        if (progress) {
          setCurrentIndex(progress.card_index);
        }
      }
    } catch (error) {
      console.error('Error loading box data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  // Touch gesture handlers
  const handlers = useSwipeable({
    onSwipedLeft: goToNextCard,
    onSwipedRight: goToPreviousCard,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!box || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400 mb-4">Box not found</div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          Back to My Boxes
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="card-viewer">
      {/* Header with progress */}
      <div className="bg-gray-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-sm font-medium truncate flex-1 mx-4">{box.title}</h1>
          <span className="text-sm text-gray-400">
            {currentIndex + 1}/{cards.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card content with swipe area */}
      <div {...handlers} className="touch-area flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Card media */}
          {currentCard.media && currentCard.media[0] && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={currentCard.media[0].url}
                alt={currentCard.media[0].alt_text || currentCard.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Card content */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-3">{currentCard.title}</h2>
            <p className="text-gray-300 mb-4">{currentCard.summary}</p>
            
            {/* Show/hide answer button */}
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium mb-4 transition-colors"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            
            {/* Answer content */}
            {showAnswer && (
              <div className="bg-gray-700 rounded-lg p-4 animate-in fade-in duration-300">
                <p className="text-sm leading-relaxed">{currentCard.detailed_content}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <button
          onClick={goToPreviousCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Card dots indicator */}
        <div className="flex gap-1 overflow-x-auto max-w-xs">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setShowAnswer(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-500 w-6'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNextCard}
          disabled={currentIndex === cards.length - 1}
          className="p-3 rounded-full bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Swipe hint (shown once) */}
      {currentIndex === 0 && !localStorage.getItem('swipeHintShown') && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-pulse">
            <p className="text-lg mb-2">Swipe left or right to navigate</p>
            <button
              onClick={() => {
                localStorage.setItem('swipeHintShown', 'true');
              }}
              className="text-sm text-gray-400 underline pointer-events-auto"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}