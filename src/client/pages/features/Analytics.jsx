import React, { useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Shield, AlertTriangle, TrendingUp, Clock, Download } from 'lucide-react'

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

  const kpiData = { totalDetections: 1247, activeMonitoring: 156, riskScore: 82, avgResponse: '2.3s' }
  const detectionTrends = [
    { date: 'Mon', detections: 45, threats: 12, safe: 33 },
    { date: 'Tue', detections: 32, threats: 8, safe: 24 },
    { date: 'Wed', detections: 67, threats: 15, safe: 52 },
    { date: 'Thu', detections: 28, threats: 6, safe: 22 },
    { date: 'Fri', detections: 89, threats: 23, safe: 66 },
    { date: 'Sat', detections: 54, threats: 14, safe: 40 },
    { date: 'Sun', detections: 41, threats: 11, safe: 30 },
  ]
  const detectionsByType = [
    { type: 'Phishing', count: 156, percentage: 35 },
    { type: 'Malware', count: 98, percentage: 22 },
    { type: 'Data Breach', count: 87, percentage: 20 },
    { type: 'Spam', count: 67, percentage: 15 },
    { type: 'Others', count: 35, percentage: 8 },
  ]
  const siteVisits = [
    { site: 'facebook.com', visits: 156, detections: 23, risk: 'high' },
    { site: 'instagram.com', visits: 142, detections: 18, risk: 'medium' },
    { site: 'twitter.com', visits: 98, detections: 12, risk: 'low' },
    { site: 'linkedin.com', visits: 76, detections: 8, risk: 'low' },
    { site: 'youtube.com', visits: 187, detections: 15, risk: 'medium' },
    { site: 'tiktok.com', visits: 134, detections: 28, risk: 'high' },
  ]
  const siteCategories = [
    { category: 'Social Media', visits: 456, detections: 89 },
    { category: 'Entertainment', visits: 234, detections: 45 },
    { category: 'News', visits: 167, detections: 23 },
    { category: 'Shopping', visits: 145, detections: 18 },
    { category: 'Others', visits: 89, detections: 12 },
  ]
  const languageDistribution = [
    { language: 'English', percentage: 45, detections: 567, risk: 'medium' },
    { language: 'Spanish', percentage: 25, detections: 312, risk: 'high' },
    { language: 'French', percentage: 15, detections: 189, risk: 'low' },
    { language: 'German', percentage: 10, detections: 134, risk: 'medium' },
    { language: 'Others', percentage: 5, detections: 45, risk: 'low' },
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-medium text-gray-900">Analytics</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="border-b border-gray-200 -mx-2"></div>

        <div className="flex items-center gap-1 mt-6 bg-gray-100 p-1 rounded-full w-fit">
          {['summary', 'sites', 'languages'].map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
          <KPICard icon={AlertTriangle} title="Total Detections" value={kpiData.totalDetections} data={detectionTrends} getHeight={(item) => (item.detections / 100) * 48} />
          <KPICard icon={Shield} title="Active Monitoring" value={kpiData.activeMonitoring} data={siteVisits.slice(0, 6)} getHeight={(item) => (item.visits / 200) * 48} />
          <KPICard icon={TrendingUp} title="Risk Score" value={`${kpiData.riskScore}%`} data={[82, 78, 85, 80, 82, 79]} getHeight={(score) => (score / 100) * 48} />
          <KPICard icon={Clock} title="Avg Response" value={kpiData.avgResponse} data={[2.3, 2.1, 2.4, 2.2, 2.3, 2.2]} getHeight={(time) => (time / 3) * 48} />
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
                    <p className="text-2xl font-semibold text-gray-900">{detectionsByType[0].type}</p>
                    <p className="text-sm text-gray-500 mt-1">{detectionsByType[0].count} detections</p>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Of Total Detections</span>
                        <span className="font-medium text-[#015763]">{detectionsByType[0].percentage}%</span>
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
                        <span className="text-sm font-medium text-gray-900">{detectionTrends[detectionTrends.length - 1].detections} detections</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Safe Content</span>
                        <span className="text-sm font-medium text-[#015763]">{detectionTrends[detectionTrends.length - 1].safe} items</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Needs Review</span>
                        <span className="text-sm font-medium text-[#015763]">{detectionTrends[detectionTrends.length - 1].threats} items</span>
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
                  <DistributionChart data={detectionsByType} dataKey="count" nameKey="type" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Detection Types Overview</h3>
                  <ToggleButtons options={['By Count', 'By Percentage']} activeOption={viewMode.summary} onToggle={(mode) => setViewMode({ ...viewMode, summary: mode })} />
                </div>
                <DetailsList
                  data={detectionsByType}
                  renderItem={(type) => (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{type.type}</span>
                        <span className="text-sm font-medium text-[#015763]">{viewMode.summary === 'By Count' ? type.count : `${type.percentage}%`}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#015763] rounded-full" style={{ width: `${viewMode.summary === 'By Count' ? (type.count / 200) * 100 : type.percentage}%` }} />
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
                <DistributionChart data={siteCategories} dataKey={viewMode.sites === 'By Visits' ? 'visits' : 'detections'} nameKey="category" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Top Sites</h2>
                  <ToggleButtons options={['Most Visited', 'Most Detections']} activeOption={viewMode.sites === 'By Visits' ? 'Most Visited' : 'Most Detections'} onToggle={(mode) => setViewMode({ ...viewMode, sites: mode === 'Most Visited' ? 'By Visits' : 'By Detections' })} />
                </div>
                <DetailsList
                  data={siteVisits}
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
                        <div className="h-full bg-[#015763] rounded-full" style={{ width: `${(site.detections / site.visits) * 100}%` }} />
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
                <DistributionChart data={languageDistribution} dataKey={viewMode.languages === 'By Usage' ? 'percentage' : 'detections'} nameKey="language" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Language Details</h2>
                  <ToggleButtons options={['Most Used', 'Most Detections']} activeOption={viewMode.languages === 'By Usage' ? 'Most Used' : 'Most Detections'} onToggle={(mode) => setViewMode({ ...viewMode, languages: mode === 'Most Used' ? 'By Usage' : 'By Detections' })} />
                </div>
                <DetailsList
                  data={languageDistribution}
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

