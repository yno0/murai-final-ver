import React, { useState, useEffect } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Shield, AlertTriangle, TrendingUp, Clock, Download } from 'lucide-react'
import apiService from '../../services/api.js'

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
)

const KPICard = ({ icon, title, value, data, getHeight }) => {
  const Icon = icon
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 rounded-lg">
            <Icon className="w-5 h-5 text-[#015763]" />
          </div>
          <h3 className="text-sm font-medium text-[#015763] ml-2">{title}</h3>
        </div>
        <div className="p-2 rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#015763]" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{value}</p>
        </div>
        <div className="flex items-end space-x-1 h-12">
          {data.map((item, index) => (
            <div
              key={index}
              className="w-2 bg-[#015763] rounded-t"
              style={{ height: `${getHeight(item)}px`, opacity: 0.2 + index * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const ToggleButtons = ({ options, activeOption, onToggle }) => (
  <div className="flex gap-2">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onToggle(option)}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
          activeOption === option ? 'bg-[#015763] text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {option}
      </button>
    ))}
  </div>
)

const DistributionChart = ({ data, dataKey, nameKey }) => (
  <>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#015763" opacity={1 - index * 0.15} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-6">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#015763', opacity: 1 - index * 0.15 }} />
          <span className="text-sm text-gray-600">{item[nameKey]}</span>
        </div>
      ))}
    </div>
  </>
)

const DetailsList = ({ data, renderItem }) => (
  <div className="space-y-4">
    {data.map((item, index) => (
      <div key={index} className="p-4 rounded-lg bg-gray-50">
        {renderItem(item)}
      </div>
    ))}
  </div>
)

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('summary')
  const [viewMode, setViewMode] = useState({ summary: 'By Count', sites: 'By Visits', languages: 'By Usage' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [analyticsData, setAnalyticsData] = useState({
    kpiData: { totalDetections: 0, activeMonitoring: 0, riskScore: 0, avgResponse: '0s' },
    detectionTrends: [],
    detectionsByType: [],
    siteVisits: [],
    siteCategories: [],
    languageDistribution: []
  })
  useEffect(() => {
    loadAnalyticsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No authentication token found, showing demo data')
        setAnalyticsData({
          kpiData: { totalDetections: 0, activeMonitoring: 0, riskScore: 0, avgResponse: '0s' },
          detectionTrends: [],
          detectionsByType: [],
          siteVisits: [],
          siteCategories: [],
          languageDistribution: []
        })
        setIsLoading(false)
        return
      }

      // Load flagged content and reports data
      const [flaggedResponse, reportsResponse] = await Promise.all([
        apiService.getFlaggedContent({ page: 1, limit: 1000 }).catch(e => {
          console.warn('Failed to load flagged content:', e)
          if (e.message.includes('Authentication required')) {
            throw new Error('Please log in to view your analytics data')
          }
          return { success: false, data: { content: [] } }
        }),
        apiService.getReports({ page: 1, limit: 1000 }).catch(e => {
          console.warn('Failed to load reports:', e)
          if (e.message.includes('Authentication required')) {
            throw new Error('Please log in to view your analytics data')
          }
          return { success: false, data: { reports: [] } }
        })
      ])

      console.log('Analytics data loaded:', { flaggedResponse, reportsResponse })

      const flaggedContent = flaggedResponse.success ? flaggedResponse.data.content || [] : []
      // const reports = reportsResponse.success ? reportsResponse.data.reports || [] : [] // Future use

      // Process the data to generate analytics
      const processedData = processAnalyticsData(flaggedContent)
      setAnalyticsData(processedData)

    } catch (e) {
      console.error('Failed to load analytics data:', e)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (flaggedContent) => {
    // Calculate KPIs
    const totalDetections = flaggedContent.length
    const uniqueDomains = new Set(flaggedContent.map(content => {
      if (content.sourceUrl) {
        try {
          return new URL(content.sourceUrl).hostname
        } catch {
          return null
        }
      }
      return content.metadata?.domain || null
    })).size
    
    const avgConfidence = flaggedContent.length > 0 
      ? flaggedContent.reduce((sum, content) => sum + (content.confidenceScore || 0), 0) / flaggedContent.length
      : 0
    const riskScore = Math.round(avgConfidence * 100)
    
    const avgResponse = flaggedContent.length > 0
      ? (flaggedContent.reduce((sum, content) => sum + (content.processingTime || 0), 0) / flaggedContent.length / 1000).toFixed(1) + 's'
      : '0s'

    // Generate detection trends (last 7 days)
    const detectionTrends = generateDetectionTrends(flaggedContent)
    
    // Generate detections by type based on severity and confidence
    const detectionsByType = generateDetectionsByType(flaggedContent)
    
    // Generate site visits data
    const siteVisits = generateSiteVisits(flaggedContent)
    
    // Generate site categories
    const siteCategories = generateSiteCategories(flaggedContent)
    
    // Generate language distribution
    const languageDistribution = generateLanguageDistribution(flaggedContent)

    return {
      kpiData: { totalDetections, activeMonitoring: uniqueDomains, riskScore, avgResponse },
      detectionTrends,
      detectionsByType,
      siteVisits,
      siteCategories,
      languageDistribution
    }
  }

  const generateDetectionTrends = (flaggedContent) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const trends = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayContent = flaggedContent.filter(content => {
        const contentDate = new Date(content.createdAt || content.timestamp)
        return contentDate >= dayStart && contentDate <= dayEnd
      })
      
      const threats = dayContent.filter(content => (content.confidenceScore || 0) > 0.7).length
      const safe = dayContent.length - threats
      
      trends.push({
        date: days[date.getDay()],
        detections: dayContent.length,
        threats,
        safe
      })
    }
    
    return trends
  }

  const generateDetectionsByType = (flaggedContent) => {
    const typeMap = {}
    
    flaggedContent.forEach(content => {
      const confidence = content.confidenceScore || 0
      let type = 'Low Risk'
      
      if (confidence > 0.8) type = 'High Risk'
      else if (confidence > 0.6) type = 'Medium Risk'
      else if (confidence > 0.4) type = 'Low Risk'
      else type = 'Very Low Risk'
      
      typeMap[type] = (typeMap[type] || 0) + 1
    })
    
    const total = flaggedContent.length
    return Object.entries(typeMap).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count)
  }

  const generateSiteVisits = (flaggedContent) => {
    const siteMap = {}
    
    flaggedContent.forEach(content => {
      let domain = 'Unknown'
      if (content.sourceUrl) {
        try {
          domain = new URL(content.sourceUrl).hostname
        } catch {
          domain = content.metadata?.domain || 'Unknown'
        }
      } else if (content.metadata?.domain) {
        domain = content.metadata.domain
      }
      
      if (!siteMap[domain]) {
        siteMap[domain] = { visits: 0, detections: 0 }
      }
      siteMap[domain].visits += 1
      siteMap[domain].detections += 1
    })
    
    return Object.entries(siteMap)
      .map(([site, data]) => {
        const riskRatio = data.detections / Math.max(data.visits, 1)
        let risk = 'low'
        if (riskRatio > 0.3) risk = 'high'
        else if (riskRatio > 0.1) risk = 'medium'
        
        return {
          site,
          visits: data.visits,
          detections: data.detections,
          risk
        }
      })
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6)
  }

  const generateSiteCategories = (flaggedContent) => {
    const categoryMap = {}
    
    flaggedContent.forEach(content => {
      let domain = ''
      if (content.sourceUrl) {
        try {
          domain = new URL(content.sourceUrl).hostname
        } catch {
          domain = content.metadata?.domain || ''
        }
      } else if (content.metadata?.domain) {
        domain = content.metadata.domain
      }
      
      let category = 'Others'
      if (domain.includes('facebook') || domain.includes('instagram') || domain.includes('twitter') || domain.includes('linkedin') || domain.includes('tiktok')) {
        category = 'Social Media'
      } else if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('twitch')) {
        category = 'Entertainment'
      } else if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc')) {
        category = 'News'
      } else if (domain.includes('amazon') || domain.includes('shop') || domain.includes('store')) {
        category = 'Shopping'
      }
      
      if (!categoryMap[category]) {
        categoryMap[category] = { visits: 0, detections: 0 }
      }
      categoryMap[category].visits += 1
      categoryMap[category].detections += 1
    })
    
    return Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        visits: data.visits,
        detections: data.detections
      }))
      .sort((a, b) => b.visits - a.visits)
  }

  const generateLanguageDistribution = (flaggedContent) => {
    const langMap = {}
    
    flaggedContent.forEach(content => {
      const language = content.language || 'Unknown'
      if (!langMap[language]) {
        langMap[language] = { count: 0, totalConfidence: 0 }
      }
      langMap[language].count += 1
      langMap[language].totalConfidence += content.confidenceScore || 0
    })
    
    const total = flaggedContent.length
    return Object.entries(langMap)
      .map(([language, data]) => {
        const avgConfidence = data.totalConfidence / data.count
        let risk = 'low'
        if (avgConfidence > 0.7) risk = 'high'
        else if (avgConfidence > 0.4) risk = 'medium'
        
        return {
          language,
          percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
          detections: data.count,
          risk
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-medium text-gray-900">Analytics</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAnalyticsData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#015763]/90 transition-colors disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          </div>
        </div>
        <div className="border-b border-gray-200 -mx-2"></div>

        {/* Authentication Notice */}
        {!localStorage.getItem('token') && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  🔐 Login Required
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Please log in to view your analytics data, including detection trends, site analysis, and language distribution.
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

        {/* Error Notice */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setError('')
                      loadAnalyticsData()
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 mt-6 bg-gray-100 p-1 rounded-full w-fit">
          {['summary', 'sites', 'languages'].map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
          <KPICard 
            icon={AlertTriangle} 
            title="Total Detections" 
            value={isLoading ? '...' : analyticsData.kpiData.totalDetections} 
            data={analyticsData.detectionTrends} 
            getHeight={(item) => analyticsData.detectionTrends.length > 0 ? (item.detections / Math.max(...analyticsData.detectionTrends.map(t => t.detections))) * 48 : 0} 
          />
          <KPICard 
            icon={Shield} 
            title="Active Monitoring" 
            value={isLoading ? '...' : analyticsData.kpiData.activeMonitoring} 
            data={analyticsData.siteVisits.slice(0, 6)} 
            getHeight={(item) => analyticsData.siteVisits.length > 0 ? (item.visits / Math.max(...analyticsData.siteVisits.map(s => s.visits))) * 48 : 0} 
          />
          <KPICard 
            icon={TrendingUp} 
            title="Risk Score" 
            value={isLoading ? '...' : `${analyticsData.kpiData.riskScore}%`} 
            data={analyticsData.detectionTrends.map(t => Math.round(t.threats / Math.max(t.detections, 1) * 100))} 
            getHeight={(score) => (score / 100) * 48} 
          />
          <KPICard 
            icon={Clock} 
            title="Avg Response" 
            value={isLoading ? '...' : analyticsData.kpiData.avgResponse} 
            data={analyticsData.detectionTrends.map(() => parseFloat(analyticsData.kpiData.avgResponse) || 0)} 
            getHeight={(time) => (time / 3) * 48} 
          />
        </div>

        <div className="mt-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#015763]/10 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-[#015763]" />
                      </div>
                      <h3 className="text-sm font-medium text-[#015763]">Most Common Detection</h3>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {isLoading ? '...' : analyticsData.detectionsByType[0]?.type || 'No Data'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {isLoading ? '...' : analyticsData.detectionsByType[0]?.count || 0} detections
                    </p>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Of Total Detections</span>
                        <span className="font-medium text-[#015763]">
                          {isLoading ? '...' : analyticsData.detectionsByType[0]?.percentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#015763]/10 rounded-lg">
                        <Clock className="w-5 h-5 text-[#015763]" />
                      </div>
                      <h3 className="text-sm font-medium text-[#015763]">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Last 24 Hours</span>
                        <span className="text-sm font-medium text-gray-900">
                          {isLoading ? '...' : analyticsData.detectionTrends[analyticsData.detectionTrends.length - 1]?.detections || 0} detections
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Safe Content</span>
                        <span className="text-sm font-medium text-[#015763]">
                          {isLoading ? '...' : analyticsData.detectionTrends[analyticsData.detectionTrends.length - 1]?.safe || 0} items
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Needs Review</span>
                        <span className="text-sm font-medium text-[#015763]">
                          {isLoading ? '...' : analyticsData.detectionTrends[analyticsData.detectionTrends.length - 1]?.threats || 0} items
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#015763]/10 rounded-lg">
                        <Shield className="w-5 h-5 text-[#015763]" />
                      </div>
                      <h3 className="text-sm font-medium text-[#015763]">Detection Distribution</h3>
                    </div>
                  </div>
                  {analyticsData.detectionsByType.length > 0 ? (
                    <DistributionChart data={analyticsData.detectionsByType} dataKey="count" nameKey="type" />
                  ) : (
                    <div className="py-8 text-center">
                      <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No detection data available</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {isLoading ? 'Loading...' : 'Use the MURAi extension to start detecting content'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Detection Types Overview</h3>
                  <ToggleButtons options={['By Count', 'By Percentage']} activeOption={viewMode.summary} onToggle={(mode) => setViewMode({ ...viewMode, summary: mode })} />
                </div>
                <DetailsList
                  data={analyticsData.detectionsByType}
                  renderItem={(type) => (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{type.type}</span>
                        <span className="text-sm font-medium text-[#015763]">{viewMode.summary === 'By Count' ? type.count : `${type.percentage}%`}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#015763] rounded-full" style={{ width: `${viewMode.summary === 'By Count' ? (type.count / Math.max(...analyticsData.detectionsByType.map(t => t.count))) * 100 : type.percentage}%` }} />
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
          )}

          {activeTab === 'sites' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Site Distribution</h2>
                  <ToggleButtons options={['By Visits', 'By Detections']} activeOption={viewMode.sites} onToggle={(mode) => setViewMode({ ...viewMode, sites: mode })} />
                </div>
                <DistributionChart data={analyticsData.siteCategories} dataKey={viewMode.sites === 'By Visits' ? 'visits' : 'detections'} nameKey="category" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Top Sites</h2>
                  <ToggleButtons options={['Most Visited', 'Most Detections']} activeOption={viewMode.sites === 'By Visits' ? 'Most Visited' : 'Most Detections'} onToggle={(mode) => setViewMode({ ...viewMode, sites: mode === 'Most Visited' ? 'By Visits' : 'By Detections' })} />
                </div>
                <DetailsList
                  data={analyticsData.siteVisits}
                  renderItem={(site) => (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{site.site}</p>
                          <p className="text-xs text-gray-500 mt-1">{site.visits} visits</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#015763]">{site.detections} detections</p>
                          <p className="text-xs text-gray-500 mt-1">Risk: {site.risk}</p>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-3">
                        <div className="h-full bg-[#015763] rounded-full" style={{ width: `${(site.detections / Math.max(site.visits, 1)) * 100}%` }} />
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
          )}

          {activeTab === 'languages' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Language Distribution</h2>
                  <ToggleButtons options={['By Usage', 'By Detections']} activeOption={viewMode.languages} onToggle={(mode) => setViewMode({ ...viewMode, languages: mode })} />
                </div>
                <DistributionChart data={analyticsData.languageDistribution} dataKey={viewMode.languages === 'By Usage' ? 'percentage' : 'detections'} nameKey="language" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Language Details</h2>
                  <ToggleButtons options={['Most Used', 'Most Detections']} activeOption={viewMode.languages === 'By Usage' ? 'Most Used' : 'Most Detections'} onToggle={(mode) => setViewMode({ ...viewMode, languages: mode === 'Most Used' ? 'By Usage' : 'By Detections' })} />
                </div>
                <DetailsList
                  data={analyticsData.languageDistribution}
                  renderItem={(lang) => (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lang.language}</p>
                          <p className="text-xs text-gray-500 mt-1">{lang.percentage}% of content</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#015763]">{lang.detections} detections</p>
                          <p className="text-xs text-gray-500 mt-1">Risk: {lang.risk}</p>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-3">
                        <div className="h-full bg-[#015763] rounded-full" style={{ width: `${lang.percentage}%` }} />
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

