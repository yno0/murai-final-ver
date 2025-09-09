import React, { useEffect, useState } from 'react'
import { FiUsers, FiShield, FiAlertTriangle, FiClock } from 'react-icons/fi'

export default function Overview() {
  const [isLoading, setIsLoading] = useState(true)
  const [statusData, setStatusData] = useState({
    accountStatus: 'Active',
    totalDetections: 0,
    totalVisitedSites: 0,
    issuesFound: 0,
    lastScan: 'Loading...'
  })
  const [recentActivity, setRecentActivity] = useState([
    { type: 'Loading...', account: 'Fetching recent activity', time: '...', status: 'info' },
  ])
  const [selectedTimeRange] = useState('week')

  useEffect(() => {
    // Minimal demo data without services
    setIsLoading(true)
    const timeout = setTimeout(() => {
      setStatusData({
        accountStatus: 'Active',
        totalDetections: 1284,
        totalVisitedSites: 342,
        issuesFound: 12,
        lastScan: 'Just now'
      })
      setRecentActivity([
        { type: 'Report Generated', account: 'Weekly summary created', time: '2m ago', status: 'success' },
        { type: 'Settings Updated', account: 'Notification preferences changed', time: '1h ago', status: 'info' },
        { type: 'Website Visited', account: 'example.com scanned', time: '3h ago', status: 'info' },
        { type: 'Content Flagged', account: 'Suspicious content blocked', time: 'Yesterday', status: 'warning' }
      ])
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timeout)
  }, [selectedTimeRange])
  

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-gray-600 mt-1">Your highlights at a glance.</p>
        </div>

        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{isLoading ? '...' : statusData.totalDetections}</p>
                  <p className="text-sm text-gray-600">Harmful Content Detected</p>
                </div>
                <div className="flex items-end space-x-1 h-12">
                  <div className="w-2 bg-blue-200 rounded-t h-8"></div>
                  <div className="w-2 bg-blue-300 rounded-t h-10"></div>
                  <div className="w-2 bg-blue-400 rounded-t h-6"></div>
                  <div className="w-2 bg-blue-500 rounded-t h-12"></div>
                  <div className="w-2 bg-blue-300 rounded-t h-7"></div>
                  <div className="w-2 bg-blue-200 rounded-t h-9"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FiShield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{isLoading ? '...' : statusData.totalVisitedSites}</p>
                  <p className="text-sm text-gray-600">Websites Monitored</p>
                </div>
                <div className="flex items-end space-x-1 h-12">
                  <div className="w-2 bg-green-200 rounded-t h-10"></div>
                  <div className="w-2 bg-green-300 rounded-t h-8"></div>
                  <div className="w-2 bg-green-400 rounded-t h-12"></div>
                  <div className="w-2 bg-green-500 rounded-t h-6"></div>
                  <div className="w-2 bg-green-300 rounded-t h-9"></div>
                  <div className="w-2 bg-green-200 rounded-t h-7"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#015763]">Recent activity</h3>
              <span className="text-xs text-gray-500">Updated {isLoading ? '...' : 'just now'}</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((a, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate">{a.type}</p>
                    <p className="text-xs text-gray-500 truncate">{a.account}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-3">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Last scan: {isLoading ? 'Loading...' : statusData.lastScan}</span>
          </div>
          <button className="text-sm text-[#015763] font-medium hover:underline">Run new scan</button>
        </div>
      </div>
    </div>
  )
}

