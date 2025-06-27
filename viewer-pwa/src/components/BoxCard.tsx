import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box } from '../lib/db';
import { api } from '../lib/api';
import { db } from '../lib/db';

interface BoxCardProps {
  box: Box;
  isOnline: boolean;
}

export default function BoxCard({ box, isOnline }: BoxCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load progress for this box
    loadProgress();
  }, [box.set_id]);

  const loadProgress = async () => {
    const savedProgress = await db.getProgress(box.set_id);
    if (savedProgress) {
      setProgress((savedProgress.completed_cards.length / box.card_count) * 100);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (!isOnline || downloading) return;
    
    setDownloading(true);
    try {
      await api.downloadBox(box.set_id);
      // Reload to show downloaded status
      window.location.reload();
    } catch (error) {
      console.error('Failed to download box:', error);
      alert('Failed to download box. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Generate placeholder cover if none exists
  const getCoverImage = () => {
    if (box.cover_url) return box.cover_url;
    if (box.thumbnail_url) return box.thumbnail_url;
    
    // Generate gradient placeholder
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-purple-600',
    ];
    const colorIndex = box.set_id.length % colors.length;
    const gradient = colors[colorIndex];
    
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
          ${box.title.substring(0, 2).toUpperCase()}
        </text>
      </svg>
    `)}`;
  };

  return (
    <Link to={`/box/${box.set_id}`} className="block">
      <div className="box-card group relative">
        {/* Cover Image */}
        <div className="aspect-square bg-gray-700 relative overflow-hidden">
          <img
            src={getCoverImage()}
            alt={box.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder on error
              e.currentTarget.src = getCoverImage();
            }}
          />
          
          {/* Download Button Overlay */}
          {isOnline && !box.downloaded && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full 
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {downloading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              )}
            </button>
          )}
          
          {/* Downloaded Indicator */}
          {box.downloaded && (
            <div className="absolute top-2 left-2 bg-green-600 p-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Box Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{box.title}</h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{box.card_count} cards</span>
            <span>{box.estimated_time_minutes}min</span>
          </div>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-2 bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}