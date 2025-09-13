import React, { useState } from 'react'
import { InviteModal } from './InviteModal'

export function PricingModal({ isOpen, onClose, onSelectPlan }) {
  if (!isOpen) return null

  const [showInvite, setShowInvite] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    {
      id: 'personal',
      name: 'Personal',
      tagline: 'Protect yourself on social platforms',
      price: '$0',
      period: '/mo',
      features: ['Basic detection', 'Email alerts', '1 user'],
      highlight: false,
    },
    {
      id: 'family',
      name: 'Family',
      tagline: 'Safety for everyone at home',
      price: '$9',
      period: '/mo',
      features: ['Advanced detection', 'Realtime alerts', 'Up to 5 members'],
      highlight: true,
    },
    {
      id: 'team',
      name: 'Team',
      tagline: 'Group protection made simple',
      price: '$19',
      period: '/mo',
      features: ['Priority scanning', 'Shared reports', 'Up to 10 members'],
      highlight: false,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-5xl p-6 md:p-8 lg:p-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Choose your plan</h2>
            <p className="text-sm text-gray-600 mt-1">Flexible options for individuals, families, and teams</p>
          </div>
          <button
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 bg-white flex flex-col ${
                plan.highlight
                  ? 'border-[#015763] ring-1 ring-[#015763]/20 shadow-sm scale-[1.02]'
                  : 'border-gray-200'
              }`}
            >
              {plan.highlight && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-[#015763]/10 text-[#015763]">
                    Most popular
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{plan.tagline}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-700">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-4 w-4 inline-flex items-center justify-center rounded-full bg-[#015763]/10 text-[#015763] text-[10px]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button
                  className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition ${
                    plan.highlight
                      ? 'bg-[#015763] text-white hover:bg-[#015763]/90'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    setShowInvite(true)
                  }}
                >
                  Get started
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          You can change plans anytime. No credit card required to start.
        </div>
        <InviteModal
          isOpen={showInvite}
          onClose={() => setShowInvite(false)}
          onInvite={({ emails, role, message }) => {
            setShowInvite(false)
            onSelectPlan?.(selectedPlan)
          }}
        />
      </div>
    </div>
  )
}

export default PricingModal


