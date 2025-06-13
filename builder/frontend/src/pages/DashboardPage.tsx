import { useState, useEffect } from 'react'
import { DocumentTextIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { creatorAPI, contentSetAPI, contentCardAPI } from '../services/api'

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: 'Total Content Sets', value: '...', icon: DocumentTextIcon, color: 'bg-blue-500' },
    { name: 'Active Creators', value: '...', icon: UserGroupIcon, color: 'bg-green-500' },
    { name: 'Cards Generated', value: '...', icon: SparklesIcon, color: 'bg-purple-500' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all cards by calling the API without set filter
        const creatorsResponse = await fetch('/api/creators')
        const setsResponse = await fetch('/api/sets')
        const cardsResponse = await fetch('/api/cards')
        
        const creators = await creatorsResponse.json()
        const sets = await setsResponse.json()
        const cards = await cardsResponse.json()

        setStats([
          { name: 'Total Content Sets', value: (sets?.data?.length || sets?.length || 0).toString(), icon: DocumentTextIcon, color: 'bg-blue-500' },
          { name: 'Active Creators', value: (creators?.data?.length || creators?.length || 0).toString(), icon: UserGroupIcon, color: 'bg-green-500' },
          { name: 'Cards Generated', value: (cards?.data?.length || cards?.length || 0).toString(), icon: SparklesIcon, color: 'bg-purple-500' },
        ])
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const recentActivity = [
    { id: 1, creator: 'Ana Contti', contentSet: 'Programa Longe Vida', cards: 7, date: '2 hours ago' },
    { id: 2, creator: 'Lunar Explorer', contentSet: 'Nutrição para Astronautas', cards: 5, date: '5 hours ago' },
    { id: 3, creator: 'Box I Creator', contentSet: 'Around the World', cards: 10, date: '1 day ago' },
  ]

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="truncate text-sm font-medium text-indigo-600">{activity.contentSet}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        by {activity.creator} • {activity.cards} cards
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/generate"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <SparklesIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Generate New Content</p>
              <p className="text-sm text-gray-500">Create AI-powered content sets</p>
            </div>
          </a>
          
          <a
            href="/creators"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-10 w-10 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Manage Creators</p>
              <p className="text-sm text-gray-500">Add or edit creator profiles</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}