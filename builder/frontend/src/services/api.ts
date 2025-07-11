/**
 * API Service Layer for Boxiii Builder
 * Handles all API communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Creator API endpoints
export const creatorAPI = {
  /**
   * Get all creators with optional filtering
   * 
   * CRITICAL SYSTEM DESIGN NOTES:
   * - withContentOnly=false (DEFAULT): Shows ALL creators
   *   USE FOR: Generate Cards page (allows content creation for new creators)
   *   USE FOR: Creators management page (shows all for CRUD operations)
   *   USE FOR: Most scenarios where you need complete creator list
   * 
   * - withContentOnly=true: Shows ONLY creators with existing content sets
   *   USE FOR: Analytics/reporting where you only care about creators with content
   *   USE FOR: Content browsing where empty creators aren't relevant
   *   AVOID: Generate Cards page (blocks content creation for new creators)
   * 
   * @param withContentOnly - Filter to only creators with existing content sets
   * @returns Promise<Creator[]> - Array of creator objects
   */
  getAll: async (withContentOnly: boolean = false) => {
    const params = withContentOnly ? '?with_content_only=true' : '';
    return apiRequest<Creator[]>(`/creators${params}`);
  },

  // Get a single creator by ID
  getById: async (creatorId: string) => {
    return apiRequest<Creator>(`/creators/${creatorId}`);
  },

  // Create a new creator
  create: async (creator: Omit<Creator, 'creator_id' | 'created_at' | 'updated_at'>) => {
    return apiRequest<Creator>('/creators', {
      method: 'POST',
      body: JSON.stringify(creator),
    });
  },

  // Update an existing creator
  update: async (creatorId: string, updates: Partial<Creator>) => {
    return apiRequest<Creator>(`/creators/${creatorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a creator
  delete: async (creatorId: string) => {
    return apiRequest<{ success: boolean }>(`/creators/${creatorId}`, {
      method: 'DELETE',
    });
  },

  // Upload creator avatar
  uploadAvatar: async (creatorId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/creators/${creatorId}/avatar`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  },

  // Upload creator banner
  uploadBanner: async (creatorId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/creators/${creatorId}/banner`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  },
};

// Content Set API endpoints
export const contentSetAPI = {
  getAll: async () => {
    const response = await apiRequest<{data: ContentSet[], count: number}>('/sets');
    return response.data;
  },

  getByCreator: async (creatorId: string) => {
    const response = await apiRequest<{data: ContentSet[], count: number}>(`/sets?creator_id=${creatorId}`);
    return response.data;
  },

  create: async (contentSet: Omit<ContentSet, 'set_id' | 'created_at' | 'updated_at'>) => {
    return apiRequest<ContentSet>('/sets', {
      method: 'POST',
      body: JSON.stringify(contentSet),
    });
  },

  update: async (setId: string, updates: Partial<ContentSet>) => {
    return apiRequest<ContentSet>(`/sets/${setId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (setId: string) => {
    return apiRequest<{ success: boolean }>(`/sets/${setId}`, {
      method: 'DELETE',
    });
  },
};

// Content Card API endpoints
export const contentCardAPI = {
  getAll: async () => {
    const response = await apiRequest<{data: ContentCard[], count: number}>('/cards');
    return response.data;
  },

  getBySet: async (setId: string) => {
    const response = await apiRequest<{data: ContentCard[], count: number}>(`/cards?set_id=${setId}`);
    return response.data;
  },

  create: async (card: Omit<ContentCard, 'card_id' | 'created_at' | 'updated_at'>) => {
    return apiRequest<ContentCard>('/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  },

  update: async (cardId: string, updates: Partial<ContentCard>) => {
    return apiRequest<ContentCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (cardId: string) => {
    return apiRequest<{ success: boolean }>(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },
};

// Generation API
export const generationAPI = {
  generateContent: async (params: {
    creator_id: string;
    topic: string;
    llm_provider: string;
    num_cards: number;
    style?: string;
  }) => {
    return apiRequest<GenerationResult>('/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// Export API
export const exportAPI = {
  exportData: async () => {
    return apiRequest<{ success: boolean; exported_files: string[] }>('/export', {
      method: 'POST',
    });
  },
};

// Types
export interface Platform {
  platform: string;
  handle: string;
}

export interface Creator {
  creator_id: string;
  display_name: string;
  platforms: Platform[];
  avatar_url?: string;
  banner_url?: string;
  description: string;
  categories: string[];
  follower_count?: number;
  verified: boolean;
  social_links: Record<string, string>;
  expertise_areas: string[];
  content_style: string;
  created_at: string;
  updated_at: string;
}

export interface ContentSet {
  set_id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  banner_url?: string;
  card_count: number;
  estimated_time_minutes: number;
  difficulty_level: string;
  target_audience: string;
  supported_navigation: string[];
  content_style: string;
  tags: string[];
  prerequisites: string[];
  learning_outcomes: string[];
  stats: Record<string, any>;
  status: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ContentCard {
  card_id: string;
  set_id: string;
  creator_id: string;
  title: string;
  summary: string;
  order_index: number;
  detailed_content?: string;
  domain_data: Record<string, any>;
  media: any[];
  navigation_contexts: Record<string, any>;
  tags: any[];
  created_at: string;
  updated_at: string;
}

export interface GenerationResult {
  success: boolean;
  set_id: string;
  cards_generated: number;
  message: string;
}