import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import { contentSetAPI, creatorAPI } from '../services/api';
import type { ContentSet, Creator } from '../services/api';
import { toast } from 'react-hot-toast';
import ContentSetModal from '../components/ContentSetModal';

export default function BoxesPage() {
  const [contentSets, setContentSets] = useState<ContentSet[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<ContentSet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCreator, setFilterCreator] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSet, setEditingSet] = useState<ContentSet | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSet, setDeletingSet] = useState<ContentSet | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel using API service layer
      const [setsData, creatorsData] = await Promise.all([
        contentSetAPI.getAll(),
        creatorAPI.getAll() // CRITICAL: Show ALL creators for content set assignment
      ]);

      setContentSets(setsData);
      setCreators(creatorsData);
    } catch (error) {
      toast.error('Failed to load content sets data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = (set: ContentSet) => {
    setDeletingSet(set);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingSet) return;
    
    try {
      await contentSetAPI.delete(deletingSet.set_id);
      setContentSets(contentSets.filter(set => set.set_id !== deletingSet.set_id));
      setSelectedSet(null);
      toast.success('Box deleted successfully');
    } catch (error) {
      toast.error('Failed to delete box');
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setDeletingSet(null);
    }
  };

  const handleSaveContentSet = async (contentSetData: Partial<ContentSet>) => {
    try {
      if (editingSet) {
        // Update existing content set
        const updatedSet = await contentSetAPI.update(editingSet.set_id, contentSetData);
        setContentSets(contentSets.map(set => 
          set.set_id === editingSet.set_id ? updatedSet : set
        ));
        toast.success('Box updated successfully');
      } else {
        // Create new content set
        const newSet = await contentSetAPI.create(contentSetData as Omit<ContentSet, 'set_id' | 'created_at' | 'updated_at'>);
        setContentSets([...contentSets, newSet]);
        toast.success('Box created successfully');
      }
      setShowModal(false);
      setEditingSet(null);
    } catch (error) {
      toast.error(editingSet ? 'Failed to update content set' : 'Failed to create content set');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleCreateSet = () => {
    setEditingSet(null);
    setShowModal(true);
  };

  const handleEditSet = (contentSet: ContentSet) => {
    setEditingSet(contentSet);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSet(null);
  };

  // Helper function to get creator name
  const getCreatorName = (creatorId: string) => {
    const creator = creators.find(c => c.creator_id === creatorId);
    return creator?.display_name || 'Unknown Creator';
  };

  // Filter content sets based on search and filters
  const filteredSets = contentSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         set.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCreator = !filterCreator || set.creator_id === filterCreator;
    
    return matchesSearch && matchesCreator;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boxes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your content sets and collections
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleCreateSet}
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Box
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content sets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Creators</option>
              {creators.map(creator => (
                <option key={creator.creator_id} value={creator.creator_id}>
                  {creator.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Boxes Grid and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Boxes List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Boxes ({filteredSets.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredSets.map((set) => (
              <div
                key={set.set_id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedSet?.set_id === set.set_id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                }`}
                onClick={() => setSelectedSet(set)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {set.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {getCreatorName(set.creator_id)} • {set.card_count} cards
                    </p>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                      {set.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {set.category}
                      </span>
                      <span>{set.difficulty_level}</span>
                      <span>{set.estimated_time_minutes}min</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSet(set);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSet(set);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSet(set);
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box Detail View */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedSet ? 'Box Details' : 'Select a box to view details'}
            </h2>
          </div>
          <div className="p-6">
            {selectedSet ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedSet.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">{getCreatorName(selectedSet.creator_id)}</span>
                    {' • '}
                    <span>{selectedSet.card_count} cards</span>
                    {' • '}
                    <span>{selectedSet.estimated_time_minutes} minutes</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedSet.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Category</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {selectedSet.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Difficulty</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {selectedSet.difficulty_level}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Target Audience</h4>
                  <p className="text-sm text-gray-700">{selectedSet.target_audience}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Style</h4>
                  <p className="text-sm text-gray-700">{selectedSet.content_style}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Language & Status</h4>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {selectedSet.language}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {selectedSet.status}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(selectedSet.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/cards?set_id=${selectedSet.set_id}`, '_blank')}
                        className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Cards
                      </button>
                      <button
                        onClick={() => handleEditSet(selectedSet)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSet(selectedSet)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Select a box from the list to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Box</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deletingSet?.title}"? This will also delete all {deletingSet?.card_count || 0} associated cards. This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Box
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Box Modal */}
      <ContentSetModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveContentSet}
        contentSet={editingSet}
        creators={creators}
      />
    </div>
  );
}