// API service with offline fallback
import { db } from './db';
import type { Box, Card, Creator } from './db';

// Use static JSON files by default, can override with env var for API mode
const USE_API = import.meta.env.VITE_USE_API === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const JSON_BASE_URL = '/data';

// Network status helper
export const isOnline = () => navigator.onLine;

// Helper to fetch JSON files with fallback
async function fetchJSON<T>(path: string): Promise<T> {
  console.log('Fetching JSON:', `${JSON_BASE_URL}/${path}`);
  try {
    const response = await fetch(`${JSON_BASE_URL}/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
  } catch (error) {
    console.warn(`Failed to fetch ${path}, returning empty array:`, error);
    return [] as T;
  }
}

// API service with offline support
export const api = {
  // Fetch boxes - online first, fallback to offline
  async getBoxes(): Promise<Box[]> {
    if (isOnline()) {
      try {
        let boxes: Box[];
        
        if (USE_API) {
          // API mode - connect to Builder
          console.log('Fetching from API:', `${API_URL}/sets`);
          const response = await fetch(`${API_URL}/sets`);
          if (!response.ok) throw new Error(`API request failed: ${response.status}`);
          const data = await response.json();
          console.log('API response:', data);
          // Handle both array format and {data: array} format
          boxes = Array.isArray(data) ? data : data.data || [];
        } else {
          // Static mode - use JSON files
          boxes = await fetchJSON<Box[]>('content_sets.json');
        }
        
        // Cache in IndexedDB
        await db.boxes.bulkPut(boxes);
        return boxes;
      } catch (error) {
        console.warn('Failed to fetch boxes, using offline data:', error);
      }
    }
    
    // Offline or error - return from database
    return db.boxes.toArray();
  },

  // Get single box
  async getBox(boxId: string): Promise<Box | undefined> {
    if (isOnline()) {
      try {
        if (USE_API) {
          const response = await fetch(`${API_URL}/sets/${boxId}`);
          if (response.ok) {
            const box = await response.json();
            await db.boxes.put(box);
            return box;
          }
        } else {
          // In static mode, get from already loaded boxes
          const boxes = await this.getBoxes();
          const box = boxes.find(b => b.set_id === boxId);
          if (box) return box;
        }
      } catch (error) {
        console.warn('Failed to fetch box:', error);
      }
    }
    
    return db.boxes.get(boxId);
  },

  // Get cards for a box
  async getCards(boxId: string): Promise<Card[]> {
    if (isOnline()) {
      try {
        let cards: Card[];
        
        if (USE_API) {
          console.log('Fetching cards from API:', `${API_URL}/cards?set_id=${boxId}`);
          const response = await fetch(`${API_URL}/cards?set_id=${boxId}`);
          if (!response.ok) throw new Error(`Cards API request failed: ${response.status}`);
          const data = await response.json();
          console.log('Cards API response:', data);
          // Handle both array format and {data: array} format
          cards = Array.isArray(data) ? data : data.data || [];
        } else {
          // Static mode - load all cards and filter
          const allCards = await fetchJSON<Card[]>('cards.json');
          cards = allCards.filter(card => card.set_id === boxId);
        }
        
        await db.cards.bulkPut(cards);
        return cards;
      } catch (error) {
        console.warn('Failed to fetch cards:', error);
      }
    }
    
    return db.cards.where('set_id').equals(boxId).sortBy('order_index');
  },

  // Get creator info
  async getCreator(creatorId: string): Promise<Creator | undefined> {
    if (isOnline()) {
      try {
        if (USE_API) {
          const response = await fetch(`${API_URL}/creators/${creatorId}`);
          if (response.ok) {
            const creator = await response.json();
            await db.creators.put(creator);
            return creator;
          }
        } else {
          // Static mode - load all creators and find
          const creators = await fetchJSON<Creator[]>('creators.json');
          const creator = creators.find(c => c.creator_id === creatorId);
          if (creator) {
            await db.creators.put(creator);
            return creator;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch creator:', error);
      }
    }
    
    return db.creators.get(creatorId);
  },

  // Download box for offline use
  async downloadBox(boxId: string): Promise<void> {
    if (!isOnline()) {
      throw new Error('Cannot download while offline');
    }

    // Get box details
    const box = await this.getBox(boxId);
    if (!box) throw new Error('Box not found');

    // Get all cards
    const cards = await this.getCards(boxId);
    
    // Get creator info
    if (box.creator_id) {
      await this.getCreator(box.creator_id);
    }

    // Mark as downloaded
    await db.downloadBox(boxId);

    // Pre-cache media files
    if ('caches' in window) {
      const cache = await caches.open('boxiii-media-v1');
      const mediaUrls = cards.flatMap(card => 
        card.media?.map(m => m.url).filter(url => url.startsWith('http')) || []
      );
      
      for (const url of mediaUrls) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn('Failed to cache media:', url, error);
        }
      }
    }
  },

  // Get my boxes (downloaded + recently accessed)
  async getMyBoxes(): Promise<Box[]> {
    // Always try to sync with server first
    if (isOnline()) {
      await this.getBoxes();
    }
    
    return db.getMyBoxes();
  }
};