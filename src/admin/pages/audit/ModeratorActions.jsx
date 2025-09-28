import React, { useEffect, useState } from 'react'
import { FiUser, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import adminApiService from '../../services/adminApi.js'

export default function ModeratorActions() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError('')
        const params = { type: 'moderator', page, limit, sortBy: 'timestamp', sortOrder: 'desc' }
        if (search) params.search = search
        const res = await adminApiService.getLogs(params)
        const items = res?.data?.logs || res?.logs || []
        const pagination = res?.data?.pagination || res?.pagination || {}
        setLogs(items)
        setTotal(pagination.total || 0)
      } catch (e) {
        setError(e.message || 'Failed to load moderator actions')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [search, page, limit])

  const totalPages = Math.max(Math.ceil(total / Math.max(limit, 1)), 1)

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUser className="text-[#015763]" />
          Moderator Actions
        </h1>
        <p className="text-gray-600 mt-1">Actions performed by moderators</p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1) }} placeholder="Search…" className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md" />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-gray-600">Rows</span>
            <select value={limit} onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1) }} className="px-2 py-1 border border-gray-300 rounded">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-600">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No actions.</div>
          ) : logs.map((log) => (
            <div key={log._id || log.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-900 font-medium">{log.action}</div>
                <div className="text-xs text-gray-500">{log.timestamp || log.createdAt}</div>
              </div>
              {log.details && <div className="text-sm text-gray-600 mt-1">{log.details}</div>}
              <div className="text-xs text-gray-500 mt-1">by {log.metadata?.actorName || log.metadata?.actorEmail || 'Moderator'}</div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm">
          <span className="text-gray-600">Page {page} of {totalPages} • {total} items</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-gray-300" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}><FiChevronLeft /></button>
            <button className="px-3 py-1 rounded border border-gray-300" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
