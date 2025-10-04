import React, { useEffect, useState } from 'react'
import { FiUsers, FiShield, FiAlertTriangle, FiClock, FiCheckCircle, FiX } from 'react-icons/fi'
import apiService from '../../services/api.js'
import { useToastContext } from '../../contexts/ToastContext.jsx'

export default function Overview() {
  const toast = useToastContext()
  const [isLoading, setIsLoading] = useState(true)
  const [statusData, setStatusData] = useState({
    accountStatus: 'Active',
    totalDetections: 0,
    totalVisitedSites: 0,
    issuesFound: 0,
    lastScan: 'Loading...'
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [selectedTimeRange] = useState('week')
  const [showExtensionNotice, setShowExtensionNotice] = useState(false)

  useEffect(() => {
    // Check if user came from extension
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from') === 'extension' || 
                         document.referrer.includes('chrome-extension://') ||
                         window.location.href.includes('from=extension');
    
    if (fromExtension) {
      setShowExtensionNotice(true);
      // Auto-hide after 8 seconds
      setTimeout(() => {
        setShowExtensionNotice(false);
      }, 8000);
    }
  }, []);

  useEffect(() => {
    loadOverviewData()
  }, [selectedTimeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadOverviewData = async () => {
    try {
      setIsLoading(true)

      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No authentication token found, showing demo data')
        setStatusData({
          accountStatus: 'Demo Mode',
          totalDetections: 0,
          totalVisitedSites: 0,
          issuesFound: 0,
          lastScan: 'Login required'
        })
        setRecentActivity([])
        setIsLoading(false)
        return
      }

      // Load flagged content and reports in parallel
      const [flaggedResponse, reportsResponse] = await Promise.all([
        apiService.getFlaggedContent({ page: 1, limit: 100 }).catch(e => {
          console.warn('Failed to load flagged content:', e)
          if (e.message.includes('Authentication required')) {
            throw new Error('Please log in to view your flagged content data')
          }
          return { success: false, data: { content: [] } }
        }),
        apiService.getReports({ page: 1, limit: 20 }).catch(e => {
          console.warn('Failed to load reports:', e)
          if (e.message.includes('Authentication required')) {
            throw new Error('Please log in to view your reports data')
          }
          return { success: false, data: { reports: [] } }
        })
      ])

      console.log('Overview data loaded:', { flaggedResponse, reportsResponse })

      // Process flagged content data - note: server returns { content, pagination }
      const flaggedContent = flaggedResponse.success ? flaggedResponse.data.content || [] : []
      const reports = reportsResponse.success ? reportsResponse.data.reports || [] : []
      
      console.log('Processed data:', { 
        flaggedContentCount: flaggedContent.length, 
        reportsCount: reports.length,
        flaggedContentSample: flaggedContent.slice(0, 2),
        reportsSample: reports.slice(0, 2)
      })
      
      // Calculate unique websites from flagged content
      const uniqueDomains = new Set()
      flaggedContent.forEach(content => {
        if (content.sourceUrl) {
          try {
            const domain = new URL(content.sourceUrl).hostname
            uniqueDomains.add(domain)
          } catch {
            // Invalid URL, skip
          }
        }
        if (content.metadata?.domain) {
          uniqueDomains.add(content.metadata.domain)
        }
      })

      // Find latest activity timestamp
      const allActivities = [...flaggedContent, ...reports]
      const latestActivity = allActivities.reduce((latest, item) => {
        const itemDate = new Date(item.createdAt || item.date)
        return itemDate > latest ? itemDate : latest
      }, new Date(0))

      // Set status data
      setStatusData({
        accountStatus: 'Active',
        totalDetections: flaggedContent.length,
        totalVisitedSites: uniqueDomains.size,
        issuesFound: reports.length,
        lastScan: latestActivity > new Date(0) ? formatTimeAgo(latestActivity) : 'No activity yet'
      })

      // Create recent activity from flagged content and reports
      const recentActivities = []
      
      // Add recent flagged content
      flaggedContent.slice(0, 10).forEach(content => {
        recentActivities.push({
          type: 'Content Flagged',
          account: `"${content.detectedWord}" detected on ${getDomainFromUrl(content.sourceUrl)}`,
          time: formatTimeAgo(new Date(content.createdAt)),
          status: 'warning',
          date: new Date(content.createdAt)
        })
      })

      // Add recent reports
      reports.slice(0, 10).forEach(report => {
        recentActivities.push({
          type: 'Report Submitted',
          account: `${report.reason.replace('-', ' ')} report submitted`,
          time: formatTimeAgo(new Date(report.createdAt)),
          status: 'info',
          date: new Date(report.createdAt)
        })
      })

      // Sort by date and take most recent 8
      recentActivities.sort((a, b) => b.date - a.date)
      setRecentActivity(recentActivities.slice(0, 8))

    } catch (e) {
      console.error('Failed to load overview data:', e)
      toast.error('Failed to load overview data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getDomainFromUrl = (url) => {
    if (!url) return 'Unknown site'
    try {
      return new URL(url).hostname
    } catch {
      return 'Unknown site'
    }
  }
  

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">Your highlights at a glance.</p>
          </div>
          <button
            onClick={loadOverviewData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#015763]/90 transition-colors disabled:opacity-50"
          >
            <FiShield className="w-4 h-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Authentication Notice */}
        {!localStorage.getItem('token') && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <FiUsers className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  🔐 Login Required
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Please log in to view your flagged content data, reports, and activity. The MURAi extension will automatically sync your data when you're authenticated.
                </p>
                <div className="mt-2">
                  <a
                    href="/login"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Go to Login →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extension Success Notice */}
        {showExtensionNotice && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start">
              <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  🎉 MURAi Extension Login Successful!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You're now logged in! Click the MURAi extension icon in your browser toolbar to access your extension settings and customize your content moderation preferences.
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => setShowExtensionNotice(false)}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowExtensionNotice(false)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{isLoading ? '...' : statusData.issuesFound}</p>
                  <p className="text-sm text-gray-600">Reports Submitted</p>
                </div>
                <div className="flex items-end space-x-1 h-12">
                  <div className="w-2 bg-orange-200 rounded-t h-7"></div>
                  <div className="w-2 bg-orange-300 rounded-t h-9"></div>
                  <div className="w-2 bg-orange-400 rounded-t h-5"></div>
                  <div className="w-2 bg-orange-500 rounded-t h-11"></div>
                  <div className="w-2 bg-orange-300 rounded-t h-8"></div>
                  <div className="w-2 bg-orange-200 rounded-t h-6"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#015763]">Recent activity</h3>
              <span className="text-xs text-gray-500">Updated {isLoading ? '...' : 'just now'}</span>
            </div>
            {recentActivity.length > 0 ? (
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
            ) : (
              <div className="py-8 text-center">
                <FiClock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isLoading ? 'Loading...' : 
                   !localStorage.getItem('token') ? 'Please log in to view your activity' :
                   'Use the MURAi extension to start monitoring content'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Last scan: {isLoading ? 'Loading...' : statusData.lastScan}</span>
          </div>
          <button 
            onClick={loadOverviewData}
            disabled={isLoading}
            className="text-sm text-[#015763] font-medium hover:underline disabled:opacity-50"
          >
            {isLoading ? 'Scanning...' : 'Refresh data'}
          </button>
        </div>
      </div>
    </div>
  )
}

