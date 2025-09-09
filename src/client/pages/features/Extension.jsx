import React, { useCallback, useEffect, useState } from 'react'
import { Save, Plus, X, Eye, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function Extension() {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    status: 'synced',
  })

  const [settings, setSettings] = useState({
    enabled: true,
    language: 'Both',
    sensitivity: 'medium',
    flaggingStyle: 'highlight',
    highlightColor: '#374151',
    whitelist: { websites: [], terms: [] },
    dictionary: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const presetColors = ['#FF4444', '#FFB020', '#10B981', '#3B82F6', '#8B5CF6']

  const [newWebsite, setNewWebsite] = useState('')
  const [newTerm, setNewTerm] = useState('')
  const [newWord, setNewWord] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState('4rem')

  const simulateDelay = (ms) => new Promise((r) => setTimeout(r, ms))

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await simulateDelay(300)
      const loadedSettings = {
        enabled: true,
        language: 'Both',
        sensitivity: 'medium',
        flaggingStyle: 'highlight',
        highlightColor: '#374151',
        whitelist: { websites: ['example.com'], terms: ['sample'] },
        dictionary: ['forbidden', 'restricted'],
      }
      setSettings(loadedSettings)
      setOriginalSettings(JSON.parse(JSON.stringify(loadedSettings)))
      setHasUnsavedChanges(false)
      setSyncStatus({ lastSync: new Date().toISOString(), status: 'synced' })
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

  const checkForChanges = useCallback((newSettings) => {
    if (!originalSettings) return false
    return JSON.stringify(newSettings) !== JSON.stringify(originalSettings)
  }, [originalSettings])

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [setting]: value }
      setHasUnsavedChanges(checkForChanges(updated))
      return updated
    })
  }

  const addToList = (type, value) => {
    if (!value.trim()) return
    setSettings((prev) => {
      const updated =
        type === 'dictionary'
          ? { ...prev, dictionary: [...prev.dictionary, value.trim()] }
          : {
              ...prev,
              whitelist: {
                websites: type === 'whitelist' ? [...prev.whitelist.websites, value.trim()] : prev.whitelist.websites,
                terms: type !== 'whitelist' ? [...prev.whitelist.terms, value.trim()] : prev.whitelist.terms,
              },
            }
      setHasUnsavedChanges(checkForChanges(updated))
      return updated
    })
    if (type === 'whitelist') setNewWebsite('')
    else if (type === 'dictionary') setNewWord('')
    else setNewTerm('')
  }

  const removeFromList = (type, index) => {
    setSettings((prev) => {
      const updated =
        type === 'dictionary'
          ? { ...prev, dictionary: prev.dictionary.filter((_, i) => i !== index) }
          : {
              ...prev,
              whitelist: {
                websites: type === 'whitelist' ? prev.whitelist.websites.filter((_, i) => i !== index) : prev.whitelist.websites,
                terms: type !== 'whitelist' ? prev.whitelist.terms.filter((_, i) => i !== index) : prev.whitelist.terms,
              },
            }
      setHasUnsavedChanges(checkForChanges(updated))
      return updated
    })
  }

  const handleSync = async () => {
    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }))
    setError(null)
    try {
      await simulateDelay(500)
      await loadPreferences()
      setSyncStatus({ lastSync: new Date().toISOString(), status: 'synced' })
    } catch (e) {
      setError('Failed to sync preferences')
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await simulateDelay(500)
      setOriginalSettings(JSON.parse(JSON.stringify(settings)))
      setHasUnsavedChanges(false)
      setSyncStatus({ lastSync: new Date().toISOString(), status: 'synced' })
    } catch (e) {
      setError('Failed to save preferences')
      setSyncStatus((prev) => ({ ...prev, status: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className={`max-w-7xl mx-auto px-3 py-2 ${hasUnsavedChanges ? 'pb-24' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-900">Extension Settings</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center text-sm">
                {syncStatus.status === 'synced' && <CheckCircle className="w-4 h-4 text-[#015763] mr-2" />}
                {syncStatus.status === 'syncing' && <RefreshCw className="w-4 h-4 text-[#015763] animate-spin mr-2" />}
                {syncStatus.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mr-2" />}
                <span className="font-medium text-gray-900">
                  {syncStatus.status === 'synced' && 'Settings Synced'}
                  {syncStatus.status === 'syncing' && 'Syncing...'}
                  {syncStatus.status === 'error' && 'Sync Error'}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-0.5">Last synced: {new Date(syncStatus.lastSync).toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncStatus.status === 'syncing'}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 h-9 px-4 py-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200 -mx-6 mb-6"></div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  {settings.flaggingStyle === 'highlight' && <span style={{ backgroundColor: settings.highlightColor }} className="px-2">flagged content</span>}
                  {settings.flaggingStyle === 'asterisk' && <span className="px-2">**************</span>}
                  {settings.flaggingStyle === 'underline' && (
                    <span style={{ textDecoration: 'underline', textDecorationColor: settings.highlightColor, textDecorationThickness: '2px' }} className="px-2">flagged content</span>
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
                  <input type="color" value={settings.highlightColor} onChange={(e) => handleSettingChange('highlightColor', e.target.value)} className="h-10 w-20 rounded-md cursor-pointer border border-gray-200" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{settings.highlightColor.toUpperCase()}</span>
                    <span className="text-xs text-gray-500">Click to change</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {presetColors.map((color) => (
                    <button type="button" key={color} onClick={() => handleSettingChange('highlightColor', color)} title={color.toUpperCase()} className={`h-8 w-8 rounded-full border ${settings.highlightColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-[#015763] border-transparent' : 'border-gray-200'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Whitelist Settings</h2>
              <p className="text-gray-500 mt-1">Manage exceptions for websites and terms</p>
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
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {settings.whitelist.websites.map((website, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#FAFCFF] px-4 py-2.5 rounded-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-900">{website}</span>
                      <button type="button" onClick={() => removeFromList('whitelist', index)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {settings.whitelist.terms.map((term, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#FAFCFF] px-4 py-2.5 rounded-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-900">{term}</span>
                      <button type="button" onClick={() => removeFromList('terms', index)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-4 bg-white border border-gray-200 shadow-lg z-40 rounded-lg" style={{ left: `calc(${sidebarWidth} + 1rem)`, right: '1rem', transition: 'left 0.3s ease-in-out' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Unsaved Changes</h3>
                <p className="text-sm text-gray-500 mt-1">You have unsaved changes to your extension settings</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setSettings(originalSettings); setHasUnsavedChanges(false) }} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 h-10 px-4 py-2">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} disabled={isLoading} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-[#015763] text-white hover:bg-[#015763]/90 h-10 px-6 py-2">
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

