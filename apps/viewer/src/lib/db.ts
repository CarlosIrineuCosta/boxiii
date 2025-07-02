// Offline-first database using Dexie (IndexedDB wrapper)
import Dexie, { Table } from 'dexie';

// TypeScript interfaces matching Builder data model
export interface Creator {
  creator_id: string;
  display_name: string;
  avatar_url?: string;
  platform?: string;
  verified?: boolean;
}

export interface Box {
  set_id: string;
  creator_id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  cover_url?: string; // New field for box covers
  card_count: number;
  difficulty_level: string;
  estimated_time_minutes: number;
  category?: string;
  tags?: string[];
  // Local fields
  downloaded?: boolean;
  last_accessed?: Date;
  progress?: number;
}

export interface Card {
  card_id: string;
  set_id: string;
  creator_id: string;
  title: string;
  summary: string;
  detailed_content: string;
  order_index: number;
  media?: Array<{
    media_type: string;
    url: string;
    alt_text?: string;
  }>;
  tags?: string[];
}

export interface Progress {
  id?: number;
  set_id: string;
  card_index: number;
  completed_cards: number[];
  last_accessed: Date;
  notes?: string;
}

// Dexie database class
class BoxiiiDB extends Dexie {
  creators!: Table<Creator>;
  boxes!: Table<Box>;
  cards!: Table<Card>;
  progress!: Table<Progress>;

  constructor() {
    super('BoxiiiDB');
    
    this.version(1).stores({
      creators: 'creator_id',
      boxes: 'set_id, creator_id, downloaded, category',
      cards: 'card_id, set_id, order_index',
      progress: '++id, set_id'
    });
  }

  // Helper to download a box with all its cards
  async downloadBox(boxId: string): Promise<void> {
    const transaction = this.transaction('rw', this.boxes, this.cards, async () => {
      // Mark box as downloaded
      await this.boxes.update(boxId, { downloaded: true });
      
      // In real app, fetch cards from API here
      // For now, cards should be added separately
    });
    
    return transaction;
  }

  // Get progress for a box
  async getProgress(boxId: string): Promise<Progress | undefined> {
    return this.progress.where('set_id').equals(boxId).first();
  }

  // Save progress
  async saveProgress(boxId: string, cardIndex: number, completed?: number[]): Promise<void> {
    const existing = await this.getProgress(boxId);
    
    if (existing) {
      await this.progress.update(existing.id!, {
        card_index: cardIndex,
        completed_cards: completed || existing.completed_cards,
        last_accessed: new Date()
      });
    } else {
      await this.progress.add({
        set_id: boxId,
        card_index: cardIndex,
        completed_cards: completed || [],
        last_accessed: new Date()
      });
    }
    
    // Update box last accessed
    await this.boxes.update(boxId, { last_accessed: new Date() });
  }

  // Get downloaded boxes
  async getDownloadedBoxes(): Promise<Box[]> {
    return this.boxes.where('downloaded').equals(true).toArray();
  }

  // Get my boxes (downloaded or recently accessed)
  async getMyBoxes(): Promise<Box[]> {
    const downloaded = await this.getDownloadedBoxes();
    const recentlyAccessed = await this.boxes
      .where('last_accessed')
      .above(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      .toArray();
    
    // Merge and deduplicate
    const boxMap = new Map<string, Box>();
    [...downloaded, ...recentlyAccessed].forEach(box => {
      boxMap.set(box.set_id, box);
    });
    
    return Array.from(boxMap.values()).sort((a, b) => {
      const aDate = a.last_accessed || new Date(0);
      const bDate = b.last_accessed || new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  }
}

// Export database instance
export const db = new BoxiiiDB();