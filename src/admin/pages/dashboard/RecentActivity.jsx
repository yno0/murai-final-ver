import React, { useEffect, useState } from 'react';
import { FiClock, FiUser, FiShield, FiEdit, FiEye, FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters / sorting / pagination
  const [type, setType] = useState(''); // admin | system | moderator | user | ''
  const [action, setAction] = useState('');
  const [severity, setSeverity] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setError('');

        const params = { page, limit, sortBy, sortOrder };
        if (type) params.type = type;
        if (action) params.action = action;
        if (severity) params.severity = severity;
        if (search) params.search = search;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await adminApiService.getLogs(params);
        const logs = response?.data?.logs || response?.logs || [];
        const pagination = response?.data?.pagination || response?.pagination || { total: 0 };

        const normalized = logs.map((log, idx) => ({
          id: log.id || log._id || idx,
          type: log.isSystemLog ? 'system' : (/^admin_/i.test(log.action) ? 'admin' : 'user'),
          action: log.action || 'Activity',
          user: log.actor?.name || log.user || 'System',
          details: log.details || log.message || '',
          timestamp: log.timestamp || log.createdAt || '',
        }));
        setActivities(normalized);
        setTotal(pagination.total || 0);
      } catch (e) {
        console.error('Failed to load activities', e);
        setError(e.message || 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [type, action, severity, search, startDate, endDate, sortBy, sortOrder, page, limit]);

  const totalPages = Math.max(Math.ceil(total / Math.max(limit, 1)), 1);

  const getIconForType = (t) => {
    switch (t) {
      case 'moderation':
        return <FiShield className="h-4 w-4" />;
      case 'user':
        return <FiUser className="h-4 w-4" />;
      case 'dictionary':
        return <FiEdit className="h-4 w-4" />;
      case 'system':
      default:
        return <FiEye className="h-4 w-4" />;
    }
  };

  const resetFilters = () => {
    setType('');
    setAction('');
    setSeverity('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSortBy('timestamp');
    setSortOrder('desc');
    setPage(1);
    setLimit(20);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiClock className="text-[#015763]" />
          Recent Activity
        </h1>
        <p className="text-gray-600 mt-1">
          Track all recent actions and changes across the MURAi admin platform
        </p>
      </div>

      {/* Minimal filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…"
              className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
            />
          </div>

          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent">
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>

          <input value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} placeholder="Action" className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent" />

          <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent">
            <option value="">Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent" />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent">
            <option value="timestamp">Time</option>
            <option value="action">Action</option>
            <option value="details">Details</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <button onClick={resetFilters} className="ml-auto px-2.5 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1">
            <FiRefreshCw className="opacity-80" /> Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Activity Timeline</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Rows</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border border-gray-300 rounded">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading activities…</div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No recent activity.</div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gray-50 text-gray-700`}>
                    {getIconForType(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.details}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.user}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="p-3 border-top border-gray-200 bg-gray-50 flex items-center justify-between text-sm">
          <span className="text-gray-600">Page {page} of {totalPages} • {total} items</span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 hover:bg-white"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
            >
              <FiChevronLeft /> Prev
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 hover:bg-white"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
