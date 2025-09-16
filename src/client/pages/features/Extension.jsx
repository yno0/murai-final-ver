import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Settings, User, LogOut, Save, RotateCcw, AlertCircle, CheckCircle, Clock, Eye, Plus, X, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import extensionSettingsService from '../../services/extensionSettingsService.js'
import authService from '../../services/authService.js'
import ExtensionHeader from '../../components/ExtensionHeader.jsx'

export default function Extension() {
  const navigate = useNavigate()
  const [sidebarWidth, setSidebarWidth] = useState('256px')
  const [settings, setSettings] = useState({
    enabled: true,
    language: 'Both',
    sensitivity: 'medium',
    flaggingStyle: 'highlight',
    highlightColor: '#374151',
    whitelist: { websites: [], terms: [] },
    dictionary: []
  })
  const [originalSettings, setOriginalSettings] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncStatus, setSyncStatus] = useState({ lastSync: null, status: 'synced' })
  const [user, setUser] = useState(null)
  const [newWebsite, setNewWebsite] = useState('')
  const [newTerm, setNewTerm] = useState('')
  const [newWord, setNewWord] = useState('')

  // Preset colors for highlight color picker
  const presetColors = ['#374151', '#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#059669', '#0891b2', '#2563eb', '#7c3aed', '#c026d3']

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
      setError(null)
      
      // Use actual extension settings service
      const response = await extensionSettingsService.getSettings()
      const loadedSettings = extensionSettingsService.convertFromApiFormat(response.data)
      
      setSettings(loadedSettings)
      setOriginalSettings(JSON.parse(JSON.stringify(loadedSettings)))
      setHasUnsavedChanges(false)
      setSyncStatus({ 
        lastSync: loadedSettings.lastSync, 
        status: loadedSettings.syncStatus 
      })
    } catch (e) {
      setError('Failed to load preferences')
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  useEffect(() => {
    const hasChanges = checkForChanges(settings)
    setHasUnsavedChanges(hasChanges)
  }, [settings, checkForChanges])

  const handleSync = async () => {
    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }))
    setError(null)
    try {
      console.log('🔄 Starting sync process...')
      console.log('Last sync timestamp:', syncStatus.lastSync)

      // Check if user is authenticated
      const token = localStorage.getItem('token')
      console.log('Token available for sync:', !!token)

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
      console.log('✅ Sync completed successfully')
    } catch (e) {
      console.error('❌ Sync failed:', e)
      setError(`Failed to sync preferences: ${e.message}`)
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      window.location.href = '/login?from=extension'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
        setError(validation.errors.join(', '))
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
    } catch (e) {
      console.error('❌ Save failed:', e)
      setError(`Failed to save preferences: ${e.message}`)
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await extensionSettingsService.resetSettings()
        const resetSettings = extensionSettingsService.convertFromApiFormat(response.data)
        
        setSettings(resetSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(resetSettings)))
        setHasUnsavedChanges(false)
        setSyncStatus({ 
          lastSync: resetSettings.lastSync, 
          status: 'synced' 
        })
      } catch (e) {
        setError('Failed to reset preferences')
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
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header */}
      <ExtensionHeader
        onSync={handleSync}
        isLoading={syncStatus.status === 'syncing'}
        syncStatus={syncStatus}
        lastSync={syncStatus.lastSync}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className={`max-w-7xl mx-auto px-6 py-8 ${hasUnsavedChanges ? 'pb-24' : ''}`}>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="text-sm font-medium text-gray-900">Sensitivity Level</label>
                  <p className="text-sm text-gray-500">Adjust how strictly content is filtered</p>
                </div>
                <select value={settings.sensitivity} onChange={(e) => handleSettingChange('sensitivity', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2">
                  <option value="low">Low - Only flag explicit content</option>
                  <option value="medium">Medium - Balanced filtering</option>
                  <option value="high">High - Strict content filtering</option>
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
                  {settings.flaggingStyle === 'blur' && <span className="filter blur-[4px] bg-gray-100 px-2">flagged content</span>}
                  {settings.flaggingStyle === 'highlight' && <span style={{ backgroundColor: settings.highlightColor || '#374151' }} className="px-2">flagged content</span>}
                  {settings.flaggingStyle === 'asterisk' && <span className="px-2">**************</span>}
                  {settings.flaggingStyle === 'underline' && (
                    <span style={{ textDecoration: 'underline', textDecorationColor: settings.highlightColor || '#374151', textDecorationThickness: '2px' }} className="px-2">flagged content</span>
                  )}
                  {settings.flaggingStyle === 'none' && <span className="px-2">flagged content</span>} in context. You can customize how sensitive content appears using the settings below.
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
                  <option value="blur">Blur Content</option>
                  <option value="highlight">Highlight Content</option>
                  <option value="asterisk">Replace with Asterisks</option>
                  <option value="underline">Underline Content</option>
                  <option value="none">No Visual Change</option>
                </select>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-medium text-gray-900">Highlight Color</label>
                  <p className="text-sm text-gray-500">Select color for highlights and underlines</p>
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

