import React, { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Platform {
  platform: string
  handle: string
}

interface Creator {
  creator_id: string
  display_name: string
  platforms: Platform[]
  description: string
  categories: string[]
  follower_count?: number
  verified?: boolean
  avatar_url?: string
  // Legacy fields for backward compatibility
  platform?: string
  platform_handle?: string
}

function App() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null)
  const [currentPlatforms, setCurrentPlatforms] = useState<Platform[]>([])
  const [newPlatform, setNewPlatform] = useState({ platform: '', handle: '' })

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5001/api/creators')
      const data = await response.json()
      setCreators(data)
      toast.success(`Loaded ${data.length} creators`)
    } catch (error) {
      toast.error('Failed to load creators')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCreator(null)
    setCurrentPlatforms([])
    setNewPlatform({ platform: '', handle: '' })
    setShowCreateForm(true)
  }

  const handleEdit = (creator: Creator) => {
    setEditingCreator(creator)
    setCurrentPlatforms(creator.platforms || [])
    setShowCreateForm(true)
  }

  const handleDelete = async (creatorId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/creators/${creatorId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete creator')
      }
      
      toast.success('Creator deleted successfully')
      fetchCreators()
    } catch (error) {
      toast.error('Failed to delete creator')
      console.error(error)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const creatorData = {
      display_name: formData.get('display_name') as string,
      platforms: currentPlatforms,
      description: formData.get('description') as string,
      categories: (formData.get('categories') as string).split(',').map(c => c.trim()).filter(c => c)
    }

    try {
      const url = editingCreator 
        ? `http://localhost:5001/api/creators/${editingCreator.creator_id}`
        : 'http://localhost:5001/api/creators'
      
      const method = editingCreator ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creatorData)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingCreator ? 'update' : 'create'} creator`)
      }

      toast.success(`Creator ${editingCreator ? 'updated' : 'created'} successfully`)
      setShowCreateForm(false)
      setEditingCreator(null)
      setCurrentPlatforms([])
      setNewPlatform({ platform: '', handle: '' })
      fetchCreators()
    } catch (error) {
      toast.error(`Failed to ${editingCreator ? 'update' : 'create'} creator`)
      console.error(error)
    }
  }

  const addPlatform = () => {
    if (newPlatform.platform && newPlatform.handle) {
      setCurrentPlatforms([...currentPlatforms, newPlatform])
      setNewPlatform({ platform: '', handle: '' })
    }
  }

  const removePlatform = (index: number) => {
    setCurrentPlatforms(currentPlatforms.filter((_, i) => i !== index))
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return 'bg-red-500 text-white'
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'tiktok': return 'bg-black text-white'
      case 'twitter': return 'bg-blue-500 text-white'
      case 'twitch': return 'bg-purple-600 text-white'
      case 'podcast': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creators...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-500">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Management</h1>
              <p className="text-gray-600 mt-1">Manage your content creators</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-md">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected
              </div>
              <button
                onClick={fetchCreators}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                Add Creator
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingCreator ? 'Edit Creator' : 'Add New Creator'}
                </h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(new FormData(e.currentTarget))
              }} className="p-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creator Name
                    </label>
                    <input
                      name="display_name"
                      type="text"
                      required
                      defaultValue={editingCreator?.display_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Creator display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <input
                      name="categories"
                      type="text"
                      defaultValue={editingCreator?.categories?.join(', ') || ''}
                      placeholder="tech, gaming, lifestyle"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Platforms</label>
                  
                  {/* Current Platforms */}
                  {currentPlatforms.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {currentPlatforms.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${getPlatformColor(platform.platform)}`}>
                              {platform.platform.toUpperCase()}
                            </span>
                            <span className="text-gray-700 font-mono">{platform.handle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlatform(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Platform */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
                    <div>
                      <select
                        value={newPlatform.platform}
                        onChange={(e) => setNewPlatform({...newPlatform, platform: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Platform</option>
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">Twitter</option>
                        <option value="twitch">Twitch</option>
                        <option value="podcast">Podcast</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newPlatform.handle}
                        onChange={(e) => setNewPlatform({...newPlatform, handle: e.target.value})}
                        placeholder="Username/handle"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addPlatform}
                      disabled={!newPlatform.platform || !newPlatform.handle}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Platform
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingCreator?.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the creator..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingCreator(null)
                      setCurrentPlatforms([])
                      setNewPlatform({ platform: '', handle: '' })
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                  >
                    {editingCreator ? 'Update' : 'Create'} Creator
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Creators List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-900">
              Creators ({creators.length})
            </h2>
          </div>
          
          {creators.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No creators yet</h3>
              <p className="text-gray-600 mb-6">Add your first content creator to get started.</p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Add First Creator
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {creators.map((creator) => (
                <div key={creator.creator_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                          {creator.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {creator.display_name}
                          </h3>
                          {creator.verified && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Platforms */}
                      {creator.platforms && creator.platforms.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {creator.platforms.map((platform, index) => (
                            <span key={index} className={`px-3 py-1 rounded-md text-sm font-medium ${getPlatformColor(platform.platform)}`}>
                              {platform.platform.toUpperCase()}: {platform.handle}
                            </span>
                          ))}
                        </div>
                      ) : (
                        creator.platform && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${getPlatformColor(creator.platform)}`}>
                              {creator.platform.toUpperCase()}: {creator.platform_handle}
                            </span>
                          </div>
                        )
                      )}
                      
                      {/* Description */}
                      {creator.description && (
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {creator.description}
                        </p>
                      )}
                      
                      {/* Categories */}
                      {creator.categories && creator.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {creator.categories.map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-6">
                      <button
                        onClick={() => handleEdit(creator)}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors font-medium"
                        title="Edit creator"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(creator.creator_id, creator.display_name)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors font-medium"
                        title="Delete creator"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Creator Management System - Database Connected
          </p>
        </div>
      </main>
    </div>
  )
}

export default App