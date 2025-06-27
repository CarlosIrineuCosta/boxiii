import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { db, Box } from '../lib/db';
import BoxCard from '../components/BoxCard';

interface MyBoxesPageProps {
  isOnline: boolean;
  isPWA: boolean;
}

export default function MyBoxesPage({ isOnline, isPWA }: MyBoxesPageProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'downloaded' | 'recent'>('all');

  useEffect(() => {
    loadBoxes();
  }, [filter]);

  const loadBoxes = async () => {
    setLoading(true);
    try {
      let loadedBoxes: Box[] = [];
      
      console.log('Loading boxes with filter:', filter);
      
      if (filter === 'downloaded') {
        loadedBoxes = await db.getDownloadedBoxes();
      } else if (filter === 'recent') {
        loadedBoxes = await db.getMyBoxes();
      } else {
        loadedBoxes = await api.getBoxes();
      }
      
      console.log('Loaded boxes:', loadedBoxes);
      setBoxes(loadedBoxes);
    } catch (error) {
      console.error('Error loading boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Boxes</h1>
        <p className="text-gray-400">Your personal learning collection</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Boxes
        </button>
        <button
          onClick={() => setFilter('downloaded')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'downloaded'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Downloaded
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'recent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Recent
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-400">Loading boxes...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && boxes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-xl text-gray-400 mb-2">No boxes found</div>
          {filter === 'downloaded' && (
            <p className="text-sm text-gray-500">
              Download boxes to access them offline
            </p>
          )}
          {filter === 'all' && (
            <div className="text-sm text-gray-500 space-y-2">
              <p>No content available yet.</p>
              <p>To add content:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Start the Builder backend</li>
                <li>Create boxes with content</li>
                <li>Run the static export script</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Boxes Grid */}
      {!loading && boxes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boxes.map((box) => (
            <BoxCard key={box.set_id} box={box} isOnline={isOnline} />
          ))}
        </div>
      )}

      {/* PWA Install Prompt */}
      {!isPWA && isOnline && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 rounded-lg p-4 shadow-lg web-only">
          <p className="text-sm mb-2">Install Boxiii for offline access</p>
          <button className="bg-blue-700 px-4 py-2 rounded text-sm font-medium">
            Add to Home Screen
          </button>
        </div>
      )}
    </div>
  );
}