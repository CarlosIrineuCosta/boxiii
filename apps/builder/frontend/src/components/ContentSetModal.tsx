import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ContentSet, Creator } from '../services/api';

interface ContentSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contentSet: Partial<ContentSet>) => Promise<void>;
  contentSet?: ContentSet | null;
  creators: Creator[];
}

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

const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert'
];

const TARGET_AUDIENCES = [
  'general_public',
  'students',
  'professionals',
  'educators',
  'children',
  'teenagers',
  'adults',
  'seniors'
];

const CONTENT_STYLES = [
  'question_first',
  'explanation_first',
  'story_driven',
  'step_by_step',
  'problem_solution',
  'interactive'
];

const LANGUAGES = [
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' }
];

const ContentSetModal: React.FC<ContentSetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  contentSet, 
  creators 
}) => {
  const [formData, setFormData] = useState<Partial<ContentSet>>({
    title: '',
    description: '',
    category: 'general',
    creator_id: '',
    estimated_time_minutes: 30,
    difficulty_level: 'intermediate',
    target_audience: 'general_public',
    content_style: 'question_first',
    tags: [],
    prerequisites: [],
    learning_outcomes: [],
    language: 'pt-BR',
    status: 'draft',
  });
  
  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contentSet) {
      setFormData({
        ...contentSet,
        tags: contentSet.tags || [],
        prerequisites: contentSet.prerequisites || [],
        learning_outcomes: contentSet.learning_outcomes || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'general',
        creator_id: creators.length > 0 ? creators[0].creator_id : '',
        estimated_time_minutes: 30,
        difficulty_level: 'intermediate',
        target_audience: 'general_public',
        content_style: 'question_first',
        tags: [],
        prerequisites: [],
        learning_outcomes: [],
        language: 'pt-BR',
        status: 'draft',
      });
    }
    setNewTag('');
    setNewPrerequisite('');
    setNewOutcome('');
    setError('');
  }, [contentSet, isOpen, creators]);

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

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites?.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...(prev.prerequisites || []), newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites?.filter((_, i) => i !== index) || []
    }));
  };

  const addOutcome = () => {
    if (newOutcome.trim() && !formData.learning_outcomes?.includes(newOutcome.trim())) {
      setFormData(prev => ({
        ...prev,
        learning_outcomes: [...(prev.learning_outcomes || []), newOutcome.trim()]
      }));
      setNewOutcome('');
    }
  };

  const removeOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {contentSet ? 'Edit Box' : 'Create New Box'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Introduction to Machine Learning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creator *
              </label>
              <select
                required
                value={formData.creator_id}
                onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
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
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
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
              placeholder="Brief description of this content set"
            />
          </div>

          {/* Learning Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {TARGET_AUDIENCES.map(audience => (
                  <option key={audience} value={audience}>
                    {audience.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Style
              </label>
              <select
                value={formData.content_style}
                onChange={(e) => setFormData({ ...formData, content_style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {CONTENT_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={formData.estimated_time_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_time_minutes: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
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

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            
            {formData.prerequisites && formData.prerequisites.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-center justify-between bg-yellow-50 p-3 rounded-md">
                    <span className="text-gray-700">{prereq}</span>
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                placeholder="Add a prerequisite"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addPrerequisite}
                disabled={!newPrerequisite.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Outcomes
            </label>
            
            {formData.learning_outcomes && formData.learning_outcomes.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                    <span className="text-gray-700">{outcome}</span>
                    <button
                      type="button"
                      onClick={() => removeOutcome(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                placeholder="Add a learning outcome"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addOutcome}
                disabled={!newOutcome.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Language and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
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
              {loading ? 'Saving...' : contentSet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentSetModal;