import React, { useMemo, useState } from 'react'

const emailRegex = /^(?:[a-zA-Z0-9_'^&%+\-]+(?:\.[a-zA-Z0-9_'^&%+\-]+)*|"(?:[^"\\]|\\.)+")@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/

export function InviteModal({ isOpen, onClose, onInvite }) {
  const [input, setInput] = useState('')
  const [emails, setEmails] = useState([])
  const [role, setRole] = useState('member')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const parsedCandidates = useMemo(() => {
    return input
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }, [input])

  const addEmails = () => {
    setError('')
    if (parsedCandidates.length === 0) return
    const invalid = parsedCandidates.filter((e) => !emailRegex.test(e))
    if (invalid.length) {
      setError(`Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`)
      return
    }
    const merged = Array.from(new Set([...emails, ...parsedCandidates]))
    setEmails(merged)
    setInput('')
  }

  const removeEmail = (rm) => {
    setEmails((prev) => prev.filter((e) => e !== rm))
  }

  const handleInvite = () => {
    setError('')
    if (emails.length === 0) {
      setError('Add at least one email to invite')
      return
    }
    onInvite?.({ emails, role, message })
  }

  const closeAndReset = () => {
    setInput('')
    setEmails([])
    setRole('member')
    setMessage('')
    setError('')
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={closeAndReset} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invite members</h2>
            <p className="text-sm text-gray-600 mt-0.5">Add one or more emails. We’ll send them an invite.</p>
          </div>
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600" onClick={closeAndReset} aria-label="Close">×</button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email addresses</label>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="name@example.com, another@domain.com"
                className="flex-1 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2"
              />
              <button
                type="button"
                onClick={addEmails}
                className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm font-medium hover:bg-gray-100"
              >
                Add
              </button>
            </div>
            {emails.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {emails.map((e) => (
                  <span key={e} className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 text-xs text-gray-800">
                    {e}
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => removeEmail(e)} aria-label={`Remove ${e}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Message (optional)</label>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a note to your invite"
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button className="h-10 px-4 rounded-md border border-gray-200 bg-white text-sm font-medium hover:bg-gray-100" onClick={closeAndReset}>Cancel</button>
          <button className="h-10 px-4 rounded-md bg-[#015763] text-white text-sm font-medium hover:bg-[#015763]/90" onClick={handleInvite}>Send invites</button>
        </div>
      </div>
    </div>
  )
}

export default InviteModal


