import React, { useEffect, useState, useRef } from 'react'
import { FiDownload, FiUpload, FiSearch, FiFilter, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi'
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
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Import & Export</h1>
        <p className="text-gray-600 mt-1">Export current dictionary or import from a JSON file.</p>
      </div>

      {/* Export Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Dictionary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language Filter</label>
            <select
              value={exportFilters.language}
              onChange={(e) => setExportFilters({...exportFilters, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
            <select
              value={exportFilters.category}
              onChange={(e) => setExportFilters({...exportFilters, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
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
              className="w-full px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiDownload /> {isLoading ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Import Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Import Dictionary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importOptions.overwriteExisting}
                onChange={(e) => setImportOptions({...importOptions, overwriteExisting: e.target.checked})}
                className="rounded border-gray-300 text-[#015763] focus:ring-[#015763]"
              />
              <span className="text-sm text-gray-700">Overwrite existing words</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importOptions.skipInvalid}
                onChange={(e) => setImportOptions({...importOptions, skipInvalid: e.target.checked})}
                className="rounded border-gray-300 text-[#015763] focus:ring-[#015763]"
              />
              <span className="text-sm text-gray-700">Skip invalid entries</span>
            </label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openFilePicker}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            <FiUpload /> {isLoading ? 'Importing...' : 'Import JSON'}
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search current…" className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Progress and Status */}
        {(progress.total > 0 && isLoading) && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Processing...</span>
              <span>{progress.done}/{progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#015763] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Import Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <FiCheck className="text-green-600" />
                <span>Imported: {importResults.imported}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCheck className="text-blue-600" />
                <span>Updated: {importResults.updated}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiX className="text-yellow-600" />
                <span>Skipped: {importResults.skipped}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiAlertCircle className="text-red-600" />
                <span>Errors: {importResults.errors?.length || 0}</span>
              </div>
            </div>
            {importResults.errors && importResults.errors.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-gray-700 cursor-pointer">View Errors</summary>
                <div className="mt-1 text-xs text-red-600 max-h-32 overflow-y-auto">
                  {importResults.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {message && <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{message}</div>}
        {error && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>No results.</td></tr>
              ) : filtered.map((w) => (
                <tr key={w._id || w.id || `${w.word}-${w.language}`}>
                  <td className="px-6 py-3 text-sm text-gray-900">{w.word}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{w.language}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{w.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
