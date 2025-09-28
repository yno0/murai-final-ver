import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Filter,
  Search,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  ArrowUpDown,
  Calendar,
  User,
  MessageSquare,
  Loader2,
  ExternalLink,
  Eye,
} from 'lucide-react'
import apiService from '../../services/api.js'

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  // Removed flaggedContent state - using only reports now
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  const filterRef = useRef(null)
  const sortRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load reports and stats in parallel
      const [reportsResponse, statsResponse] = await Promise.all([
        apiService.getReports({ page: 1, limit: 100 }),
        apiService.getReportStats().catch(() => ({ data: null })) // Optional stats
      ])

      console.log('Reports response:', reportsResponse)

      if (reportsResponse.success) {
        setReports(reportsResponse.data.reports || [])
      } else {
        console.warn('Reports response not successful:', reportsResponse)
        setReports([])
      }

      if (statsResponse && statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

    } catch (e) {
      console.error('Failed to load reports data:', e)
      setError('Failed to load reports data. Please try again.')
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filterOptions = [
    { label: 'All Reports', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Review', value: 'in_review' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Dismissed', value: 'dismissed' },
    { label: 'Escalated', value: 'escalated' },
  ]
  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'Severity', value: 'severity' },
    { label: 'Status', value: 'status' },
  ]

  // Transform reports from database to display format
  const transformedReports = reports.map(report => ({
    id: report._id,
    reportId: report.reportId,
    content: `Report: ${report.reason.replace('-', ' ').replace('_', ' ')}`,
    reportedText: report.metadata?.submittedText || report.details || 'No content provided',
    status: report.status || 'open',
    severity: report.severity || 'medium',
    date: report.createdAt,
    reportedBy: 'User Report',
    group: report.reason,
    response: report.resolution?.notes || '',
    sourceUrl: report.metadata?.submittedUrl,
    confidence: null, // Reports don't have confidence scores
    detectionMethod: 'user-reported',
    domain: report.metadata?.submittedUrl ? (() => {
      try {
        return new URL(report.metadata.submittedUrl).hostname;
      } catch {
        return 'Invalid URL';
      }
    })() : 'Unknown',
    reason: report.reason,
    details: report.details,
    category: report.category,
    assignedTo: report.assignedTo,
    resolution: report.resolution
  }))

  // Use only the actual reports from the database
  const allReports = transformedReports

  const filteredReports = Array.isArray(allReports)
    ? allReports
        .filter((report) => {
          const matchesFilter = activeFilter === 'all' || report.status === activeFilter
          const q = searchQuery.trim().toLowerCase()
          const matchesSearch =
            q === '' ||
            (report.content && report.content.toLowerCase().includes(q)) ||
            (report.reportedText && report.reportedText.toLowerCase().includes(q))
          return matchesFilter && matchesSearch
        })
        .sort((a, b) => {
          let comparison = 0
          if (sortBy === 'date') {
            const dateA = a.date ? new Date(a.date) : new Date(0)
            const dateB = b.date ? new Date(b.date) : new Date(0)
            if (!isNaN(dateA) && !isNaN(dateB)) comparison = dateB - dateA
          } else if (sortBy === 'severity') {
            const order = { high: 3, medium: 2, low: 1 }
            comparison = (order[b.severity] || 0) - (order[a.severity] || 0)
          } else if (sortBy === 'status') {
            const order = { pending: 3, investigating: 2, resolved: 1 }
            comparison = (order[b.status] || 0) - (order[a.status] || 0)
          }
          return sortOrder === 'desc' ? comparison : -comparison
        })
    : []

  const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'open':
        return { color: 'bg-blue-100 text-blue-700', icon: Clock }
      case 'in_review':
        return { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle }
      case 'dismissed':
        return { color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
      case 'escalated':
        return { color: 'bg-red-100 text-red-700', icon: AlertTriangle }
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-[#015763]" />
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-[#015763] opacity-80" />
      case 'low':
        return <Flag className="w-5 h-5 text-[#015763] opacity-60" />
      default:
        return null
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date'
    try {
      const d = new Date(dateValue)
      if (isNaN(d)) return 'Invalid date'
      return d.toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#015763]" />
          <span className="text-gray-600">Loading reports...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-medium text-gray-900">Content Reports</h1>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-[#015763]/10 rounded-lg">
                  <Flag className="w-5 h-5 text-[#015763]" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Flagged</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalFlagged || allReports.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Open Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{allReports.filter(r => r.status === 'open').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">{allReports.filter(r => r.status === 'resolved').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">High Severity</p>
                  <p className="text-2xl font-semibold text-gray-900">{allReports.filter(r => r.severity === 'high').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 -mx-2"></div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mt-6 mb-6">
          <div className="relative w-full sm:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative" ref={filterRef}>
              <button
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="mr-2 h-4 w-4 text-[#015763]" />
                {filterOptions.find((f) => f.value === activeFilter)?.label}
                <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-md">
                  <div className="p-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setActiveFilter(option.value)
                          setShowFilterDropdown(false)
                        }}
                        className={`relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 ${
                          activeFilter === option.value ? 'bg-gray-100 text-[#015763] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={sortRef}>
              <button
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <ArrowUpDown className="mr-2 h-4 w-4 text-[#015763]" />
                {sortOptions.find((o) => o.value === sortBy)?.label}
                <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-md">
                  <div className="p-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value)
                          setShowSortDropdown(false)
                        }}
                        className={`relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 ${
                          sortBy === option.value ? 'bg-gray-100 text-[#015763] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <div className="rounded-md border border-gray-200">
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#015763]/10 rounded-lg">{getSeverityIcon(report.severity)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-medium leading-6 text-gray-900">{report.content}</h3>
                        <p className="mt-1 text-sm text-gray-500">{report.reportedText}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusInfo(report.status).color}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5 text-[#015763]" />
                        {formatDate(report.date)}
                      </span>
                      <span className="flex items-center">
                        <User className="mr-1 h-3.5 w-3.5 text-[#015763]" />
                        {report.reportedBy}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="mr-1 h-3.5 w-3.5 text-[#015763]" />
                        {report.group}
                      </span>
                      {report.confidence && (
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3.5 w-3.5 text-[#015763]" />
                          {Math.round(report.confidence * 100)}% confidence
                        </span>
                      )}
                      {report.sourceUrl && (
                        <a
                          href={report.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-[#015763] hover:text-[#015763]/80"
                        >
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          {report.domain}
                        </a>
                      )}
                      {report.reportId && (
                        <span className="flex items-center">
                          <MessageSquare className="mr-1 h-3.5 w-3.5 text-[#015763]" />
                          ID: {report.reportId}
                        </span>
                      )}
                    </div>
                    {(report.response || report.details) && (
                      <div className="mt-3 border-l-2 border-[#015763]/20 pl-3">
                        {report.response && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium text-[#015763]">Response: </span>
                            {report.response}
                          </p>
                        )}
                        {report.details && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium text-[#015763]">Details: </span>
                            {report.details}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredReports.length === 0 && (
          <div className="rounded-md border border-gray-200 bg-white">
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-8">
              <AlertTriangle className="h-10 w-10 text-gray-400" />
              <h3 className="mt-4 text-sm font-semibold text-gray-900">No content reports found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {!Array.isArray(allReports) || allReports.length === 0
                  ? 'No flagged content has been detected yet. Install the MURAi extension to start monitoring content.'
                  : 'No reports found matching your search. Try adjusting your filters.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

