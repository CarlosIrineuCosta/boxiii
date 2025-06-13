import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { creatorAPI } from '../services/api';
import type { Creator } from '../services/api';
import CreatorModal from '../components/CreatorModal';
import { toast } from 'react-hot-toast';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const data = await creatorAPI.getAll();
      setCreators(data);
    } catch (error) {
      toast.error('Failed to load creators');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCreator(null);
    setIsModalOpen(true);
  };

  const handleEdit = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsModalOpen(true);
  };

  const handleSave = async (creatorData: Partial<Creator>) => {
    try {
      if (selectedCreator) {
        await creatorAPI.update(selectedCreator.creator_id, creatorData);
        toast.success('Creator updated successfully');
      } else {
        await creatorAPI.create(creatorData as any);
        toast.success('Creator created successfully');
      }
      fetchCreators();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (creatorId: string) => {
    if (!confirm('Are you sure you want to delete this creator? This will also delete all their content.')) {
      return;
    }

    try {
      setDeleting(creatorId);
      await creatorAPI.delete(creatorId);
      toast.success('Creator deleted successfully');
      fetchCreators();
    } catch (error) {
      toast.error('Failed to delete creator');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const formatCategories = (categories: string[]) => {
    return categories.map(cat => 
      cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Creators</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage content creators and their profiles
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2 flex">
          <button
            type="button"
            onClick={fetchCreators}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <ArrowPathIcon className="mr-2 h-5 w-5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Creator
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && creators.length === 0 && (
        <div className="mt-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No creators</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new creator.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Creator
            </button>
          </div>
        </div>
      )}

      {/* Creators Table */}
      {!loading && creators.length > 0 && (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Creator
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Platform
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Followers
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Categories
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {creators.map((creator) => (
                      <tr key={creator.creator_id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {creator.avatar_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={creator.avatar_url}
                                  alt={creator.display_name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-lg font-medium text-gray-600">
                                    {creator.display_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{creator.display_name}</div>
                              <div className="text-gray-500">
                                {creator.platforms && creator.platforms.length > 0 
                                  ? creator.platforms[0].handle 
                                  : (creator.platform_handle || '')
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {creator.platforms && creator.platforms.length > 0 
                            ? creator.platforms[0].platform.charAt(0).toUpperCase() + creator.platforms[0].platform.slice(1)
                            : (creator.platform ? creator.platform.charAt(0).toUpperCase() + creator.platform.slice(1) : '-')
                          }
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {creator.follower_count ? creator.follower_count.toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {formatCategories(creator.categories.slice(0, 2)).map((cat) => (
                              <span
                                key={cat}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                              >
                                {cat}
                              </span>
                            ))}
                            {creator.categories.length > 2 && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                +{creator.categories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {creator.verified && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Verified
                            </span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(creator)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(creator.creator_id)}
                              disabled={deleting === creator.creator_id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Modal */}
      <CreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        creator={selectedCreator}
      />
    </div>
  );
}