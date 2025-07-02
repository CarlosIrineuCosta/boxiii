import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { contentCardAPI, contentSetAPI, creatorAPI } from '../services/api';
import type { ContentCard, ContentSet, Creator } from '../services/api';
import { toast } from 'react-hot-toast';
import ContentCardModal from '../components/ContentCardModal';

export default function PreviewPage() {
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [sets, setSets] = useState<ContentSet[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCreator, setFilterCreator] = useState('');
  const [filterSet, setFilterSet] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<ContentCard | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel using proper API methods
      const [cardsData, setsData, creatorsData] = await Promise.all([
        contentCardAPI.getAll(),
        contentSetAPI.getAll(),
        creatorAPI.getAll()
      ]);

      setCards(cardsData);
      setSets(setsData);
      setCreators(creatorsData);
    } catch (error) {
      toast.error('Failed to load content data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      await contentCardAPI.delete(cardId);
      setCards(cards.filter(card => card.card_id !== cardId));
      setSelectedCard(null);
      toast.success('Card deleted successfully');
    } catch (error) {
      toast.error('Failed to delete card');
      console.error(error);
    }
  };

  const handleSaveCard = async (cardData: Partial<ContentCard>) => {
    try {
      if (editingCard) {
        // Update existing card
        const updatedCard = await contentCardAPI.update(editingCard.card_id, cardData);
        setCards(cards.map(card => 
          card.card_id === editingCard.card_id ? updatedCard : card
        ));
        toast.success('Card updated successfully');
      } else {
        // Create new card
        const newCard = await contentCardAPI.create(cardData as Omit<ContentCard, 'card_id' | 'created_at' | 'updated_at'>);
        setCards([...cards, newCard]);
        toast.success('Card created successfully');
      }
      setShowModal(false);
      setEditingCard(null);
    } catch (error) {
      toast.error(editingCard ? 'Failed to update card' : 'Failed to create card');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setShowModal(true);
  };

  const handleEditCard = (card: ContentCard) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCard(null);
  };

  // Helper functions to get names
  const getCreatorName = (creatorId: string) => {
    const creator = creators.find(c => c.creator_id === creatorId);
    return creator?.display_name || 'Unknown Creator';
  };

  const getSetTitle = (setId: string) => {
    const set = sets.find(s => s.set_id === setId);
    return set?.title || 'Unknown Set';
  };

  // Filter cards based on search and filters
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCreator = !filterCreator || card.creator_id === filterCreator;
    const matchesSet = !filterSet || card.set_id === filterSet;
    
    return matchesSearch && matchesCreator && matchesSet;
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
          <h1 className="text-2xl font-bold text-gray-900">Content Preview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quick inspection and management of generated content cards
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {filteredCards.length} of {cards.length} cards
          </span>
          <button
            type="button"
            onClick={handleCreateCard}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Card Manually
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
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

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filterSet}
              onChange={(e) => setFilterSet(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Sets</option>
              {sets.map(set => (
                <option key={set.set_id} value={set.set_id}>
                  {set.title.length > 40 ? set.title.substring(0, 37) + '...' : set.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cards List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Content Cards</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredCards.map((card) => (
              <div
                key={card.card_id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedCard?.card_id === card.card_id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                }`}
                onClick={() => setSelectedCard(card)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {getCreatorName(card.creator_id)} • {getSetTitle(card.set_id)}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                      {card.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {card.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {card.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{card.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard(card);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCard(card);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.card_id);
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

        {/* Card Detail View */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedCard ? 'Card Preview' : 'Select a card to preview'}
            </h2>
          </div>
          <div className="p-6">
            {selectedCard ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedCard.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">{getCreatorName(selectedCard.creator_id)}</span>
                    {' • '}
                    <span>{getSetTitle(selectedCard.set_id)}</span>
                    {' • '}
                    <span>Order: {selectedCard.order_index}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedCard.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Detailed Content</h4>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
                    {selectedCard.detailed_content}
                  </div>
                </div>

                {selectedCard.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCard.media && selectedCard.media.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Media Links</h4>
                    <div className="space-y-2">
                      {selectedCard.media.map((media, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {media.type?.toUpperCase() || 'LINK'}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {media.title || 'Untitled'}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {media.url}
                              </div>
                            </div>
                          </div>
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCard.domain_data && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Domain Info</h4>
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                      <div><strong>Topic:</strong> {selectedCard.domain_data.topic}</div>
                      <div><strong>Difficulty:</strong> {selectedCard.domain_data.difficulty}</div>
                      <div><strong>Guidance:</strong> {selectedCard.domain_data.guidance}</div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(selectedCard.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCard(selectedCard)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCard(selectedCard.card_id)}
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
                <EyeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Select a card from the list to preview its content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Card Modal */}
      <ContentCardModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveCard}
        card={editingCard}
        contentSets={sets}
        creators={creators}
      />
    </div>
  );
}