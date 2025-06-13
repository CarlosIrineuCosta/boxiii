import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Creator } from '../services/api';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (creator: Partial<Creator>) => Promise<void>;
  creator?: Creator | null;
}

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'website', 'twitter', 'linkedin'];
const CATEGORIES = [
  'technology_gaming',
  'health_fitness',
  'food_cooking',
  'travel_lifestyle',
  'education_science',
  'entertainment_popculture',
  'business_finance',
  'arts_crafts',
  'parenting_family',
  'fashion_beauty',
  'space_exploration',
  'wellness',
  'nutrition',
  'earth_mysteries',
  'general',
];

const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose, onSave, creator }) => {
  const [formData, setFormData] = useState<Partial<Creator>>({
    display_name: '',
    platform: 'youtube',
    platform_handle: '',
    description: '',
    categories: [],
    verified: false,
    content_style: 'educational',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (creator) {
      setFormData(creator);
    } else {
      setFormData({
        display_name: '',
        platform: 'youtube',
        platform_handle: '',
        description: '',
        categories: [],
        verified: false,
        content_style: 'educational',
      });
    }
  }, [creator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...(prev.categories || []), category],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {creator ? 'Edit Creator' : 'Add New Creator'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Dr. John Smith - Tech Channel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Handle
              </label>
              <input
                type="text"
                required
                value={formData.platform_handle}
                onChange={(e) => setFormData({ ...formData, platform_handle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the creator and their content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categories?.includes(category) || false}
                    onChange={() => handleCategoryToggle(category)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follower Count
            </label>
            <input
              type="number"
              value={formData.follower_count || ''}
              onChange={(e) => setFormData({ ...formData, follower_count: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional: Number of followers"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified || false}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="verified" className="text-sm font-medium text-gray-700">
              Verified Creator
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {loading ? 'Saving...' : creator ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorModal;