import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, LinkIcon, PlayIcon } from '@heroicons/react/24/outline';
import type { ContentCard, ContentSet, Creator } from '../services/api';

interface ContentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<ContentCard>) => Promise<void>;
  card?: ContentCard | null;
  contentSets: ContentSet[];
  creators: Creator[];
}

interface MediaLink {
  type: 'video' | 'instagram' | 'link' | 'embed';
  url: string;
  title?: string;
  description?: string;
}

const ContentCardModal: React.FC<ContentCardModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  contentSets,
  creators 
}) => {
  const [formData, setFormData] = useState<Partial<ContentCard>>({
    title: '',
    summary: '',
    detailed_content: '',
    order_index: 1,
    set_id: '',
    creator_id: '',
    domain_data: {},
    media: [],
    navigation_contexts: {},
    tags: [],
  });
  
  const [mediaLinks, setMediaLinks] = useState<MediaLink[]>([]);
  const [newMediaLink, setNewMediaLink] = useState<MediaLink>({
    type: 'video',
    url: '',
    title: '',
    description: ''
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (card) {
      setFormData({
        ...card,
        tags: card.tags || [],
        media: card.media || [],
        domain_data: card.domain_data || {},
        navigation_contexts: card.navigation_contexts || {},
      });
      
      // Extract media links from the media array
      const extractedLinks: MediaLink[] = (card.media || []).map(media => ({
        type: media.type || 'link',
        url: media.url || '',
        title: media.title || '',
        description: media.description || ''
      }));
      setMediaLinks(extractedLinks);
    } else {
      // Set defaults for new card
      const defaultCreatorId = creators.length > 0 ? creators[0].creator_id : '';
      const defaultSetId = contentSets.filter(set => set.creator_id === defaultCreatorId)[0]?.set_id || '';
      
      setFormData({
        title: '',
        summary: '',
        detailed_content: '',
        order_index: 1,
        set_id: defaultSetId,
        creator_id: defaultCreatorId,
        domain_data: {},
        media: [],
        navigation_contexts: {},
        tags: [],
      });
      setMediaLinks([]);
    }
    setNewTag('');
    setNewMediaLink({
      type: 'video',
      url: '',
      title: '',
      description: ''
    });
    setError('');
  }, [card, isOpen, creators, contentSets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert media links back to the format expected by the API
      const processedFormData = {
        ...formData,
        media: mediaLinks.map(link => ({
          type: link.type,
          url: link.url,
          title: link.title,
          description: link.description
        }))
      };

      await onSave(processedFormData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorChange = (creatorId: string) => {
    setFormData(prev => ({ ...prev, creator_id: creatorId }));
    
    // Filter content sets for this creator and reset set selection
    const creatorSets = contentSets.filter(set => set.creator_id === creatorId);
    if (creatorSets.length > 0) {
      setFormData(prev => ({ ...prev, set_id: creatorSets[0].set_id }));
    } else {
      setFormData(prev => ({ ...prev, set_id: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const addMediaLink = () => {
    if (newMediaLink.url.trim()) {
      setMediaLinks([...mediaLinks, { ...newMediaLink }]);
      setNewMediaLink({
        type: 'video',
        url: '',
        title: '',
        description: ''
      });
    }
  };

  const removeMediaLink = (index: number) => {
    setMediaLinks(mediaLinks.filter((_, i) => i !== index));
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="h-4 w-4" />;
      case 'instagram': return <span className="text-sm font-bold">IG</span>;
      case 'embed': return <span className="text-sm font-bold">HTML</span>;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getFilteredSets = () => {
    return contentSets.filter(set => set.creator_id === formData.creator_id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {card ? 'Edit Content Card' : 'Create New Content Card'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creator *
              </label>
              <select
                required
                value={formData.creator_id}
                onChange={(e) => handleCreatorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a creator</option>
                {creators.map(creator => (
                  <option key={creator.creator_id} value={creator.creator_id}>
                    {creator.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Set *
              </label>
              <select
                required
                value={formData.set_id}
                onChange={(e) => setFormData({ ...formData, set_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.creator_id}
              >
                <option value="">Select a content set</option>
                {getFilteredSets().map(set => (
                  <option key={set.set_id} value={set.set_id}>
                    {set.title}
                  </option>
                ))}
              </select>
              {!formData.creator_id && (
                <p className="text-xs text-gray-500 mt-1">Select a creator first</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to Neural Networks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <textarea
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief summary of the card content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Content
            </label>
            <textarea
              value={formData.detailed_content}
              onChange={(e) => setFormData({ ...formData, detailed_content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the full content for this card. You can copy and paste from any source."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Index
            </label>
            <input
              type="number"
              min="1"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Media Links Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Links
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Add video links, Instagram posts, external links, or HTML embeds that will be displayed with this card
            </p>
            
            {mediaLinks.length > 0 && (
              <div className="mb-4 space-y-2">
                {mediaLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-blue-600">
                        {getMediaIcon(link.type)}
                        <span className="text-xs font-medium uppercase">{link.type}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {link.title || 'Untitled'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {link.url}
                        </div>
                        {link.description && (
                          <div className="text-xs text-gray-600 truncate">
                            {link.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaLink(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Media Link Form */}
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <select
                    value={newMediaLink.type}
                    onChange={(e) => setNewMediaLink({...newMediaLink, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="video">Video URL</option>
                    <option value="instagram">Instagram</option>
                    <option value="link">External Link</option>
                    <option value="embed">HTML Embed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={newMediaLink.url}
                    onChange={(e) => setNewMediaLink({...newMediaLink, url: e.target.value})}
                    placeholder="URL or embed code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addMediaLink}
                    disabled={!newMediaLink.url.trim()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newMediaLink.title}
                  onChange={(e) => setNewMediaLink({...newMediaLink, title: e.target.value})}
                  placeholder="Title (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={newMediaLink.description}
                  onChange={(e) => setNewMediaLink({...newMediaLink, description: e.target.value})}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : card ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentCardModal;