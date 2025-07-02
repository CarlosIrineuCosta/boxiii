import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DocumentTextIcon, UserGroupIcon, SparklesIcon, RectangleStackIcon } from '@heroicons/react/24/outline'
import { creatorAPI, contentSetAPI, contentCardAPI } from '../services/api'

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: 'Creators', value: '...', icon: UserGroupIcon, color: 'bg-green-500', link: '/creators' },
    { name: 'Boxes', value: '...', icon: DocumentTextIcon, color: 'bg-blue-500', link: '/boxes' },
    { name: 'Total Cards', value: '...', icon: SparklesIcon, color: 'bg-purple-500', link: '/cards' },
  ])
  const [, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data using API service layer
        const [creators, sets, cards] = await Promise.all([
          creatorAPI.getAll(),
          contentSetAPI.getAll(),
          contentCardAPI.getAll()
        ])

        // Update stats in the correct order: Creators, Boxes, Total Cards
        setStats([
          { name: 'Creators', value: (creators?.length || 0).toString(), icon: UserGroupIcon, color: 'bg-green-500', link: '/creators' },
          { name: 'Boxes', value: (sets?.length || 0).toString(), icon: DocumentTextIcon, color: 'bg-blue-500', link: '/boxes' },
          { name: 'Total Cards', value: (cards?.length || 0).toString(), icon: SparklesIcon, color: 'bg-purple-500', link: '/cards' },
        ])

        // Create recent activity from real data
        const creatorsMap = creators.reduce((acc: any, creator: any) => {
          acc[creator.creator_id] = creator.display_name
          return acc
        }, {})

        const activity = sets.map((set: any, index: number) => ({
          id: index + 1,
          creator: creatorsMap[set.creator_id] || 'Unknown Creator',
          box: set.title.length > 50 ? set.title.substring(0, 47) + '...' : set.title,
          cards: set.card_count || 0,
          date: new Date(set.created_at).toLocaleDateString()
        }))

        setRecentActivity(activity)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
          <Link
            key={stat.name}
            to={stat.link}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
              </div>
            </div>
          </Link>
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
                      <p className="truncate text-sm font-medium text-indigo-600">{activity.box}</p>
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
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link
            to="/generate"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <SparklesIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Generate Cards</p>
              <p className="text-sm text-gray-500">Create AI-powered content boxes</p>
            </div>
          </Link>
          
          <Link
            to="/creators"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-10 w-10 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Manage Creators</p>
              <p className="text-sm text-gray-500">Add or edit creator profiles</p>
            </div>
          </Link>

          <Link
            to="/boxes"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Manage Boxes</p>
              <p className="text-sm text-gray-500">View and organize content boxes</p>
            </div>
          </Link>

          <Link
            to="/cards"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <RectangleStackIcon className="h-10 w-10 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Browse Cards</p>
              <p className="text-sm text-gray-500">Inspect and manage individual cards</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}