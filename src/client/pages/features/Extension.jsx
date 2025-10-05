import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Settings, User, LogOut, Save, RotateCcw, AlertCircle, CheckCircle, Clock, Eye, Plus, X, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import extensionSettingsService from '../../services/extensionSettingsService.js'
import authService from '../../services/authService.js'
import ExtensionHeader from '../../components/ExtensionHeader.jsx'
import { useToastContext } from '../../contexts/ToastContext.jsx'

export default function Extension() {
  const navigate = useNavigate()
  const toast = useToastContext()
  const [sidebarWidth, setSidebarWidth] = useState('256px')
  const [settings, setSettings] = useState({
    enabled: true,
    language: 'Both',
    detectionMode: 'term-based',
    flaggingStyle: 'highlight',
    highlightColor: '#374151',
    showHighlight: true,
    whitelist: { websites: [], terms: [] },
    dictionary: []
  })
  const [originalSettings, setOriginalSettings] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState({ lastSync: null, status: 'synced' })
  const [user, setUser] = useState(null)
  const [newWebsite, setNewWebsite] = useState('')
  const [newTerm, setNewTerm] = useState('')
  const [newWord, setNewWord] = useState('')
  const [lastSyncTime, setLastSyncTime] = useState(0) // Rate limit protection

  // Preset colors for highlight color picker - neutral and professional
  const presetColors = ['#374151', '#6b7280', '#4b5563', '#1f2937', '#111827', '#dc2626', '#ea580c', '#059669', '#2563eb', '#7c3aed']

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Add item to list (whitelist websites, terms, or dictionary)
  const addToList = (listType, value) => {
    if (!value.trim()) return
    
    if (listType === 'whitelist') {
      setSettings(prev => ({
        ...prev,
        whitelist: {
          ...prev.whitelist,
          websites: [...prev.whitelist.websites, value.trim()]
        }
      }))
      setNewWebsite('')
    } else if (listType === 'terms') {
      setSettings(prev => ({
        ...prev,
        whitelist: {
          ...prev.whitelist,
          terms: [...prev.whitelist.terms, value.trim()]
        }
      }))
      setNewTerm('')
    } else if (listType === 'dictionary') {
      setSettings(prev => ({
        ...prev,
        dictionary: [...prev.dictionary, value.trim()]
      }))
      setNewWord('')
    }
  }

  // Remove item from list
  const removeFromList = (listType, index) => {
    if (listType === 'whitelist') {
      setSettings(prev => ({
        ...prev,
        whitelist: {
          ...prev.whitelist,
          websites: prev.whitelist.websites.filter((_, i) => i !== index)
        }
      }))
    } else if (listType === 'terms') {
      setSettings(prev => ({
        ...prev,
        whitelist: {
          ...prev.whitelist,
          terms: prev.whitelist.terms.filter((_, i) => i !== index)
        }
      }))
    } else if (listType === 'dictionary') {
      setSettings(prev => ({
        ...prev,
        dictionary: prev.dictionary.filter((_, i) => i !== index)
      }))
    }
  }

  useEffect(() => {
    const checkSidebarWidth = () => {
      const sidebar = document.querySelector('aside')
      if (sidebar) setSidebarWidth(`${sidebar.offsetWidth}px`)
    }
    checkSidebarWidth()
    const observer = new MutationObserver(checkSidebarWidth)
    const sidebar = document.querySelector('aside')
    if (sidebar) observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('resize', checkSidebarWidth)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkSidebarWidth)
    }
  }, [])

  // Load user info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = authService.getStoredUser()
        if (userData) {
          setUser(userData)
        } else {
          // Fetch from API if not in localStorage
          const response = await authService.getCurrentUser()
          setUser(response.data.user)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    loadUser()
  }, [])

  const checkForChanges = useCallback((newSettings) => {
    if (!originalSettings) return false
    return JSON.stringify(newSettings) !== JSON.stringify(originalSettings)
  }, [originalSettings])

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)

      // Use actual extension settings service - NO AUTO-SYNC to prevent rate limits
      const response = await extensionSettingsService.getSettings()
      const loadedSettings = extensionSettingsService.convertFromApiFormat(response.data)

      setSettings(loadedSettings)
      setOriginalSettings(JSON.parse(JSON.stringify(loadedSettings)))
      setHasUnsavedChanges(false)
      setSyncStatus({
        lastSync: loadedSettings.lastSync,
        status: loadedSettings.syncStatus || 'synced'
      })
    } catch (e) {
      toast.error('Failed to load preferences')
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  useEffect(() => {
    const hasChanges = checkForChanges(settings)
    setHasUnsavedChanges(hasChanges)
  }, [settings, checkForChanges])

  const handleSync = async () => {
    // Rate limit protection - prevent sync if called within last 10 seconds
    const now = Date.now()
    if (now - lastSyncTime < 10000) {
      toast.warning('Please wait before syncing again (rate limit protection)')
      return
    }

    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }))
    setLastSyncTime(now)

    try {
      console.log('🔄 Starting manual sync process...')
      console.log('Last sync timestamp:', syncStatus.lastSync)

      // Check if user is authenticated
      const token = localStorage.getItem('token')
      console.log('Token available for sync:', !!token)

      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await extensionSettingsService.syncSettings(syncStatus.lastSync)
      console.log('Sync response:', response)

      const syncedSettings = extensionSettingsService.convertFromApiFormat(response.data)
      console.log('Synced settings:', syncedSettings)

      setSettings(syncedSettings)
      setOriginalSettings(JSON.parse(JSON.stringify(syncedSettings)))
      setHasUnsavedChanges(false)
      setSyncStatus({
        lastSync: syncedSettings.lastSync,
        status: 'synced'
      })
      console.log('✅ Manual sync completed successfully')
      toast.success('Settings synced successfully!')
    } catch (e) {
      console.error('❌ Sync failed:', e)
      if (e.message.includes('rate limit') || e.message.includes('Too many requests')) {
        toast.error('Rate limit exceeded. Please wait before syncing again.')
      } else {
        toast.error(`Failed to sync preferences: ${e.message}`)
      }
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      // Check if we're actually in an extension context before adding the parameter
      const isInExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      if (isInExtension) {
        window.location.href = '/login?from=extension'
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const syncSettingsToExtension = async (settingsToSync) => {
    try {
      console.log('🔄 Syncing settings to extension...')

      // Check if we're in a browser extension context
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const token = localStorage.getItem('token')
        if (token) {
          chrome.runtime.sendMessage({
            type: 'SYNC_SETTINGS',
            token: token
          }, (response) => {
            if (response?.success) {
              console.log('✅ Settings synced to extension successfully')
            } else {
              console.warn('⚠️ Extension sync failed:', response?.error)
            }
          })
        }
      } else {
        console.log('ℹ️ Not in extension context, skipping extension sync')
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync settings to extension:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🔄 Starting save process...')
      console.log('Current settings:', settings)

      // Check if user is authenticated
      const token = localStorage.getItem('token')
      console.log('Token available:', !!token)

      // Validate settings before sending
      const validation = extensionSettingsService.validateSettings(settings)
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.errors)
        toast.error(validation.errors.join(', '))
        return
      }

      const apiSettings = extensionSettingsService.convertToApiFormat(settings)
      console.log('API settings to send:', apiSettings)

      const response = await extensionSettingsService.updateSettings(apiSettings)
      console.log('Save response:', response)

      const updatedSettings = extensionSettingsService.convertFromApiFormat(response.data)

      setSettings(updatedSettings)
      setOriginalSettings(JSON.parse(JSON.stringify(updatedSettings)))
      setHasUnsavedChanges(false)
      setSyncStatus({
        lastSync: updatedSettings.lastSync,
        status: 'synced'
      })
      console.log('✅ Settings saved successfully')
      toast.success('Extension settings saved successfully!')

      // Sync settings to extension chrome.storage (local only, no server sync to prevent rate limits)
      await syncSettingsToExtension(updatedSettings)
    } catch (e) {
      console.error('❌ Save failed:', e)
      toast.error(`Failed to save preferences: ${e.message}`)
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      try {
        setIsLoading(true)

        const response = await extensionSettingsService.resetSettings()
        const resetSettings = extensionSettingsService.convertFromApiFormat(response.data)

        setSettings(resetSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(resetSettings)))
        setHasUnsavedChanges(false)
        setSyncStatus({
          lastSync: resetSettings.lastSync,
          status: 'synced'
        })
        toast.success('Settings reset to default successfully!')
      } catch (e) {
        toast.error('Failed to reset preferences')
        setSyncStatus((prev) => ({ ...prev, status: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'syncing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />
    }
  }

  const getSyncStatusText = () => {
    switch (syncStatus.status) {
      case 'synced':
        return 'Synced'
      case 'syncing':
        return 'Syncing...'
      case 'error':
        return 'Sync Error'
      default:
        return 'Not Synced'
    }
  }

  if (isLoading && !settings.enabled !== undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading extension settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <ExtensionHeader
        onSync={handleSync}
        isLoading={syncStatus.status === 'syncing'}
        syncStatus={syncStatus}
        lastSync={syncStatus.lastSync}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className={`max-w-7xl mx-auto px-6 py-8 ${hasUnsavedChanges ? 'pb-24' : ''}`}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Basic Settings</h2>
                <p className="text-gray-500 mt-1">Configure fundamental extension behavior</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${settings.enabled ? 'text-[#015763]' : 'text-gray-500'}`}>{settings.enabled ? 'Active' : 'Inactive'}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.enabled} onChange={(e) => handleSettingChange('enabled', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#015763] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#015763]"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-gray-900">Language</label>
                  <p className="text-sm text-gray-500">Select the language for content monitoring</p>
                </div>
                <select value={settings.language} onChange={(e) => handleSettingChange('language', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2">
                  <option value="English">English</option>
                  <option value="Tagalog">Tagalog</option>
                  <option value="Taglish">Taglish</option>
                  <option value="Both">Both (English & Tagalog)</option>
                </select>
              </div>



              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-gray-900">Detection Mode</label>
                  <p className="text-sm text-gray-500">Choose how content is analyzed</p>
                </div>
                <select value={settings.detectionMode || 'term-based'} onChange={(e) => handleSettingChange('detectionMode', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2">
                  <option value="term-based">Term-Based - Fast dictionary matching</option>
                  <option value="context-aware">AI-Powered - Context-aware analysis</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Content Flagging</h2>
              <p className="text-gray-500 mt-1">Customize how flagged content appears</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-[#015763]" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
                  <p className="text-sm text-gray-500">See how your content will appear when flagged</p>
                </div>
              </div>
              <div className="bg-[#FAFCFF] p-6 rounded-lg">
                <p className="text-base text-gray-900 leading-relaxed">
                  This is a sample text with{' '}
                  {settings.flaggingStyle === 'blur' && <span className="filter blur-[4px] bg-gray-100 px-2 rounded">flagged content</span>}
                  {settings.flaggingStyle === 'highlight' && <span style={{ backgroundColor: settings.highlightColor || '#374151', color: 'white' }} className="px-2 py-1 rounded">flagged content</span>}
                  {settings.flaggingStyle === 'asterisk' && <span className="px-2 font-mono text-gray-600">**************</span>}
                  {' '}in context. You can customize how sensitive content appears using the settings below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-gray-900">Flagging Style</label>
                  <p className="text-sm text-gray-500">Choose how to display flagged content</p>
                </div>
                <select value={settings.flaggingStyle} onChange={(e) => handleSettingChange('flaggingStyle', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2">
                  <option value="highlight">Highlight Content</option>
                  <option value="blur">Blur Content</option>
                  <option value="asterisk">Replace with Asterisks</option>
                </select>
              </div>

              {/* Show Highlight Toggle for blur and asterisk */}
              {(settings.flaggingStyle === 'blur' || settings.flaggingStyle === 'asterisk') && (
                <div className="rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-900">Show Highlight</label>
                      <p className="text-sm text-gray-500">Add highlight color to {settings.flaggingStyle} effect</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showHighlight}
                        onChange={(e) => handleSettingChange('showHighlight', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#015763]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#015763]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Show Color Picker when highlight is enabled OR when flagging style is highlight */}
              {(settings.flaggingStyle === 'highlight' || (settings.showHighlight && (settings.flaggingStyle === 'blur' || settings.flaggingStyle === 'asterisk'))) && (
                <div className="rounded-lg border border-gray-200 p-6">
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-sm font-medium text-gray-900">Highlight Color</label>
                    <p className="text-sm text-gray-500">Select color for highlights and effects</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="color" value={settings.highlightColor || '#374151'} onChange={(e) => handleSettingChange('highlightColor', e.target.value)} className="h-10 w-20 rounded-md cursor-pointer border border-gray-200" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{settings.highlightColor?.toUpperCase() || '#374151'}</span>
                      <span className="text-xs text-gray-500">Click to change</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {presetColors.map((color) => (
                      <button type="button" key={color} onClick={() => handleSettingChange('highlightColor', color)} title={color.toUpperCase()} className={`h-8 w-8 rounded-full border ${(settings.highlightColor || '#374151').toLowerCase() === color.toLowerCase() ? 'ring-2 ring-[#015763] border-transparent' : 'border-gray-200'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Whitelist Settings</h2>
                  <p className="text-gray-500 mt-1">Manage exceptions for websites and terms</p>
                </div>
                <button
                  onClick={() => navigate('/client/extension/whitelist')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#015763] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Manage Whitelist
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-gray-900">Whitelisted Websites</label>
                  <p className="text-sm text-gray-500">Add websites to exclude from monitoring</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} placeholder="e.g., example.com" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" />
                  <button type="button" onClick={() => addToList('whitelist', newWebsite)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#015763] text-white hover:bg-[#015763]/90 h-10 px-4 py-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.whitelist.websites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No websites whitelisted yet</p>
                    </div>
                  ) : (
                    <>
                      {settings.whitelist.websites.slice(0, 3).map((website, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#FAFCFF] px-4 py-2.5 rounded-md border border-gray-200">
                          <span className="text-sm font-medium text-gray-900">{website}</span>
                          <button type="button" onClick={() => removeFromList('whitelist', index)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {settings.whitelist.websites.length > 3 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500">
                            +{settings.whitelist.websites.length - 3} more websites
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-gray-900">Whitelisted Terms</label>
                  <p className="text-sm text-gray-500">Add terms to exclude from flagging</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="Enter term to whitelist" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" />
                  <button type="button" onClick={() => addToList('terms', newTerm)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#015763] text-white hover:bg-[#015763]/90 h-10 px-4 py-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.whitelist.terms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No terms whitelisted yet</p>
                    </div>
                  ) : (
                    <>
                      {settings.whitelist.terms.slice(0, 3).map((term, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#FAFCFF] px-4 py-2.5 rounded-md border border-gray-200">
                          <span className="text-sm font-medium text-gray-900">{term}</span>
                          <button type="button" onClick={() => removeFromList('terms', index)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {settings.whitelist.terms.length > 3 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500">
                            +{settings.whitelist.terms.length - 3} more terms
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Word Dictionary</h2>
              <p className="text-gray-500 mt-1">Manage custom words to be flagged</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-sm font-medium text-gray-900">Add Words to Dictionary</label>
                <p className="text-sm text-gray-500">Enter words that should be flagged when detected</p>
              </div>
              <div className="flex gap-2 mb-6">
                <input type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Enter word or phrase to flag" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" />
                <button type="button" onClick={() => addToList('dictionary', newWord)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#015763] text-white hover:bg-[#015763]/90 h-10 px-4 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[240px] overflow-y-auto pr-2">
                  {settings.dictionary.map((word, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#FAFCFF] px-4 py-2.5 rounded-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-900">{word}</span>
                      <button type="button" onClick={() => removeFromList('dictionary', index)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {settings.dictionary.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No words added to dictionary yet</p>}
              </div>
            </div>
          </div>
        </form>

        {/* Save bar */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <p className="text-sm text-gray-600">You have unsaved changes</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

