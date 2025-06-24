import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { creatorAPI, generationAPI } from '../services/api'
import type { Creator } from '../services/api'

export default function GeneratePage() {
  const [formData, setFormData] = useState({
    creator_id: '',
    provider: 'gemini',
    topic: '',
    card_count: 5,
    style: 'educational'
  })
  const [loading, setLoading] = useState(false)
  const [creators, setCreators] = useState<Creator[]>([])
  const [loadingCreators, setLoadingCreators] = useState(true)

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    try {
      setLoadingCreators(true)
      // CRITICAL: Fetch ALL creators for generation - this allows content creation for NEW creators
      // If we filtered to only creators with existing content, users would be blocked from 
      // generating content for newly created creators (chicken-and-egg problem)
      const creatorsData = await creatorAPI.getAll(false) // false = show ALL creators
      setCreators(creatorsData)
    } catch (error) {
      toast.error('Failed to load creators')
      console.error(error)
    } finally {
      setLoadingCreators(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      toast.loading('Generating content with AI...', { id: 'generation' })
      
      const result = await generationAPI.generateContent({
        creator_id: formData.creator_id,
        topic: formData.topic,
        llm_provider: formData.provider,
        num_cards: formData.card_count,
        style: formData.style
      })

      if (result.success) {
        toast.success(
          `🎉 ${result.message}! Generated ${result.cards_generated} cards.`,
          { id: 'generation', duration: 5000 }
        )
        
        // Redirect to Cards tab with the new set
        setTimeout(() => {
          window.location.href = `/cards?set_id=${result.set_id}`
        }, 2000)
      } else {
        toast.error(result.error || 'Generation failed', { id: 'generation' })
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(
        error.message || 'Failed to generate content. Please check your AI provider settings.',
        { id: 'generation' }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Generate Cards</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Use AI to generate educational content cards for your creators
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Creator Selection */}
        <div>
          <label htmlFor="creator" className="block text-sm font-medium leading-6 text-gray-900">
            Creator
          </label>
          <select
            id="creator"
            name="creator"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={formData.creator_id}
            onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
            required
            disabled={loadingCreators}
          >
            <option value="">
              {loadingCreators ? 'Loading creators...' : 'Select a creator'}
            </option>
            {creators.map((creator) => (
              <option key={creator.creator_id} value={creator.creator_id}>
                {creator.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* LLM Provider */}
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">
            AI Provider
          </label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {['gemini', 'claude', 'gpt4'].map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setFormData({ ...formData, provider })}
                className={`${
                  formData.provider === provider
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300'
                } flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold uppercase shadow-sm hover:bg-indigo-500 hover:text-white`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium leading-6 text-gray-900">
            Topic / Prompt
          </label>
          <textarea
            id="topic"
            name="topic"
            rows={3}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="e.g., Dicas de bem-estar e saúde para mulheres 50+"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            required
          />
        </div>

        {/* Card Count */}
        <div>
          <label htmlFor="card_count" className="block text-sm font-medium leading-6 text-gray-900">
            Number of Cards
          </label>
          <input
            type="number"
            id="card_count"
            name="card_count"
            min="3"
            max="20"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={formData.card_count}
            onChange={(e) => setFormData({ ...formData, card_count: parseInt(e.target.value) })}
          />
        </div>

        {/* Content Style */}
        <div>
          <label htmlFor="style" className="block text-sm font-medium leading-6 text-gray-900">
            Content Style
          </label>
          <select
            id="style"
            name="style"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
          >
            <option value="educational">Educational</option>
            <option value="story_driven">Story Driven</option>
            <option value="tutorial">Tutorial</option>
            <option value="inspirational">Inspirational</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>

        {/* Cost Estimate */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                Estimated cost: ~$0.05 for {formData.card_count} cards using {formData.provider.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Cards'}
          </button>
        </div>
      </form>
    </div>
  )
}