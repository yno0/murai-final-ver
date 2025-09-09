import React, { useState } from 'react'
import { Settings as SettingsIcon, Bell, User, Shield, Globe, Moon } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, browser: true, reports: false })

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 py-2">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Settings</h1>
        <div className="border-b border-gray-200 -mx-3 mb-6"></div>

        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-[#015763] text-[#015763]' : 'border-transparent text-gray-500 hover:text-[#015763]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-[#015763]" />
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Toggle dark mode on/off</p>
                  </div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-[#015763]' : 'bg-gray-200'} relative`}>
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-[#015763]" />
                  <div>
                    <h3 className="font-medium">Language</h3>
                    <p className="text-sm text-gray-500">Choose your preferred language</p>
                  </div>
                </div>
                <select className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2">
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium capitalize">{key.replace('_', ' ')} Notifications</h3>
                    <p className="text-sm text-gray-500">Receive {key} notifications</p>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#015763]' : 'bg-gray-200'} relative`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-[#015763] focus:ring-[#015763]" />
                    <span>Allow data collection for improved detection</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-[#015763] focus:ring-[#015763]" />
                    <span>Share anonymous usage statistics</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-medium mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" value="user@example.com" readOnly />
                  </div>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 h-9 px-4 py-2">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

