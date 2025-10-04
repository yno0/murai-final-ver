import React, { useEffect, useState, useRef } from 'react'
import { FiDownload, FiUpload, FiSearch, FiFilter, FiCheck, FiX, FiAlertCircle, FiFileText, FiDatabase } from 'react-icons/fi'
import adminApiService from '../../services/adminApi.js'

export default function ImportExport() {
  const [words, setWords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [progress, setProgress] = useState({ total: 0, done: 0 })
  const [importResults, setImportResults] = useState(null)
  const [exportFilters, setExportFilters] = useState({ language: '', category: '' })
  const [importOptions, setImportOptions] = useState({ overwriteExisting: false, skipInvalid: true })
  const fileInputRef = useRef(null)

  const loadWords = async () => {
    try {
      setIsLoading(true)
      setError('')
      const res = await adminApiService.getDictionaryWords({ page: 1, limit: 5000 })
      const list = res?.data?.words || res?.words || []
      setWords(list)
    } catch (e) {
      setError(e.message || 'Failed to load words')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadWords() }, [])

  const filtered = words.filter(w => {
    if (!search) return true
    const q = search.toLowerCase()
    return (w.word || '').toLowerCase().includes(q) || (w.language || '').toLowerCase().includes(q) || (w.category || '').toLowerCase().includes(q)
  })

  const download = (filename, dataStr) => {
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    try {
      setIsLoading(true)
      setError('')
      setMessage('')

      const response = await adminApiService.exportDictionary(exportFilters)
      const exportData = response.data || response

      const json = JSON.stringify(exportData, null, 2)
      download(`dictionary-export-${new Date().toISOString().slice(0,10)}.json`, json)
      setMessage(`Exported ${exportData.totalCount || exportData.words?.length || 0} words successfully`)
    } catch (e) {
      setError(e.message || 'Failed to export dictionary')
    } finally {
      setIsLoading(false)
    }
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setMessage('')
    setProgress({ total: 0, done: 0 })
    setImportResults(null)

    try {
      setIsLoading(true)
      const text = await file.text()
      const data = JSON.parse(text)
      const items = Array.isArray(data) ? data : Array.isArray(data.words) ? data.words : []

      if (!Array.isArray(items) || items.length === 0) {
        setError('No words found in file. Expected JSON array or object with "words" array.')
        return
      }

      setProgress({ total: items.length, done: 0 })

      // Use the new bulk import API
      const response = await adminApiService.importDictionary(items, importOptions)
      const results = response.data || response

      setImportResults(results)
      setProgress({ total: results.total, done: results.total })

      if (results.imported > 0 || results.updated > 0) {
        await loadWords()
        setMessage(`Import completed: ${results.imported} imported, ${results.updated} updated, ${results.skipped} skipped`)
      } else {
        setMessage('Import completed with no changes')
      }

    } catch (e) {
      console.error('Import failed', e)
      setError(e.message || 'Failed to import file')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Import & Export</h1>
            <p className="text-sm text-gray-600">
              Export current dictionary or import from a JSON file • {filtered.length} words available
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiDatabase className="h-4 w-4" />
              {words.length} total words
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FiDownload className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Dictionary</h3>
            <p className="text-sm text-gray-600">Download your dictionary data as a JSON file</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language Filter</label>
            <select
              value={exportFilters.language}
              onChange={(e) => setExportFilters({...exportFilters, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
            <select
              value={exportFilters.category}
              onChange={(e) => setExportFilters({...exportFilters, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="">All Categories</option>
              <option value="profanity">Profanity</option>
              <option value="slur">Slur</option>
              <option value="bullying">Bullying</option>
              <option value="sexual">Sexual</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  Export JSON
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <FiUpload className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import Dictionary</h3>
            <p className="text-sm text-gray-600">Upload a JSON file to add words to your dictionary</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importOptions.overwriteExisting}
                onChange={(e) => setImportOptions({...importOptions, overwriteExisting: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Overwrite existing words</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importOptions.skipInvalid}
                onChange={(e) => setImportOptions({...importOptions, skipInvalid: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Skip invalid entries</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={openFilePicker}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Importing...
                </>
              ) : (
                <>
                  <FiUpload className="h-4 w-4" />
                  Import JSON
                </>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {/* Progress and Status */}
        {(progress.total > 0 && isLoading) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>Processing import...</span>
              <span>{progress.done}/{progress.total}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Import Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <FiCheck className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">Imported: <span className="font-medium">{importResults.imported}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <FiCheck className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Updated: <span className="font-medium">{importResults.updated}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-yellow-100 rounded">
                  <FiX className="h-3 w-3 text-yellow-600" />
                </div>
                <span className="text-gray-700">Skipped: <span className="font-medium">{importResults.skipped}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-red-100 rounded">
                  <FiAlertCircle className="h-3 w-3 text-red-600" />
                </div>
                <span className="text-gray-700">Errors: <span className="font-medium">{importResults.errors?.length || 0}</span></span>
              </div>
            </div>
            {importResults.errors && importResults.errors.length > 0 && (
              <details className="mt-3">
                <summary className="text-sm text-gray-700 cursor-pointer hover:text-gray-900">View Errors ({importResults.errors.length})</summary>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md max-h-32 overflow-y-auto">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-700 py-1">{error}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Search and Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <FiFileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Dictionary Preview</h3>
              <p className="text-sm text-gray-600">Browse your current dictionary words</p>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Word</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={3}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading words...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={3}>
                    {search ? 'No words match your search.' : 'No words found in dictionary.'}
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((w) => (
                  <tr key={w._id || w.id || `${w.word}-${w.language}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.word}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {w.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        {w.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filtered.length > 50 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
              Showing first 50 of {filtered.length} words. Use search to find specific words.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
