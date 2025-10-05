import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Globe,
  Key,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useToastContext } from '../../contexts/ToastContext'

export default function Settings() {
  const toast = useToastContext()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState(null)

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    timezone: 'UTC',
    language: 'en'
  })

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    showPassword: false
  })



  // Privacy settings
  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    analyticsSharing: false,
    profileVisibility: 'private'
  })

  // General settings
  const [general, setGeneral] = useState({
    autoSave: true,
    compactView: false
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'general', label: 'General', icon: SettingsIcon },
  ]

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const user = localStorage.getItem('user')
        if (user) {
          const parsedUser = JSON.parse(user)
          setUserData(parsedUser)
          setProfileData({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            timezone: parsedUser.timezone || 'UTC',
            language: parsedUser.language || 'en'
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        toast.error('Failed to load user data')
      }
    }
    loadUserData()
  }, [toast])

  // Check if user is OAuth user (Google, etc.)
  const isOAuthUser = userData && (userData.password === null || userData.password === undefined)
  const hasPassword = userData && userData.password !== null && userData.password !== undefined

  // Save profile data
  const saveProfile = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      // Update localStorage
      const updatedUser = { ...userData, ...profileData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUserData(updatedUser)

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Save security settings
  const saveSecuritySettings = async () => {
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      // TODO: Implement API call to update password/security
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setSecurityData({
        ...securityData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toast.success('Security settings updated successfully!')
    } catch (error) {
      console.error('Error saving security settings:', error)
      toast.error('Failed to update security settings')
    } finally {
      setIsLoading(false)
    }
  }

  // Set password for OAuth users
  const setPasswordForOAuthUser = async () => {
    if (!securityData.newPassword || securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      setIsLoading(true)
      // TODO: Implement API call to set password for OAuth user
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      // Update user data to reflect that they now have a password
      const updatedUser = { ...userData, password: 'set' } // Don't store actual password
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUserData(updatedUser)

      setSecurityData({
        ...securityData,
        newPassword: '',
        confirmPassword: ''
      })

      toast.success('Password set successfully! You can now use email/password to sign in.')
    } catch (error) {
      console.error('Error setting password:', error)
      toast.error('Failed to set password')
    } finally {
      setIsLoading(false)
    }
  }



  // Save privacy settings
  const savePrivacy = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement API call to save privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Privacy settings updated!')
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      toast.error('Failed to update privacy settings')
    } finally {
      setIsLoading(false)
    }
  }

  // Save general settings
  const saveGeneral = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement API call to save general settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('General settings updated!')
    } catch (error) {
      console.error('Error saving general settings:', error)
      toast.error('Failed to update general settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#015763] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#015763]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                      <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
                    </div>
                    <button
                      onClick={saveProfile}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Asia/Manila">Philippines Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="fil">Filipino</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                      <p className="text-gray-600 mt-1">Manage your password and security preferences</p>
                    </div>
                    {!isOAuthUser && (
                      <button
                        onClick={saveSecuritySettings}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Authentication Method Info */}
                    <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {isOAuthUser ? (
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          ) : (
                            <Key className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-blue-900">
                            {isOAuthUser ? 'Google Account' : 'Email & Password Account'}
                          </h3>
                          <p className="text-blue-700 mt-1">
                            {isOAuthUser
                              ? 'You signed up using Google OAuth. You can optionally set a password to enable email/password login.'
                              : 'You can change your password or enable additional security features.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {isOAuthUser ? 'Set Password (Optional)' : 'Change Password'}
                      </h3>

                      {isOAuthUser ? (
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-yellow-800 font-medium">Optional Password Setup</p>
                                <p className="text-yellow-700 text-sm mt-1">
                                  Setting a password will allow you to sign in with either Google or email/password.
                                  You can continue using Google sign-in without setting a password.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                value={securityData.newPassword}
                                onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                                placeholder="Enter new password (min 6 characters)"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                              </label>
                              <input
                                type="password"
                                value={securityData.confirmPassword}
                                onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>

                          <button
                            onClick={setPasswordForOAuthUser}
                            disabled={isLoading || !securityData.newPassword || !securityData.confirmPassword}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Key className="w-4 h-4" />
                            {isLoading ? 'Setting Password...' : 'Set Password'}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={securityData.showPassword ? 'text' : 'password'}
                                value={securityData.currentPassword}
                                onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setSecurityData({...securityData, showPassword: !securityData.showPassword})}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {securityData.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={securityData.newPassword}
                              onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={securityData.confirmPassword}
                              onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-gray-600 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${securityData.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button
                            onClick={() => setSecurityData({...securityData, twoFactorEnabled: !securityData.twoFactorEnabled})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              securityData.twoFactorEnabled ? 'bg-[#015763]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Authentication Methods */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication Methods</h3>
                      <div className="space-y-3">
                        {/* Google OAuth */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <div>
                              <p className="font-medium text-gray-900">Google Sign-In</p>
                              <p className="text-sm text-gray-600">Sign in with your Google account</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            isOAuthUser ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isOAuthUser ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              'Not Connected'
                            )}
                          </span>
                        </div>

                        {/* Email/Password */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">Email & Password</p>
                              <p className="text-sm text-gray-600">Sign in with email and password</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            hasPassword ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {hasPassword ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              'Not Set'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Login Sessions */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • Last active now</p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                      <p className="text-gray-600 mt-1">Control how your data is used and shared</p>
                    </div>
                    <button
                      onClick={savePrivacy}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Data Collection */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Data Collection</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Allow data collection for service improvement</p>
                            <p className="text-sm text-gray-600">Help us improve our services by sharing anonymous usage data</p>
                          </div>
                          <button
                            onClick={() => setPrivacy({...privacy, dataCollection: !privacy.dataCollection})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy.dataCollection ? 'bg-[#015763]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy.dataCollection ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Share analytics data</p>
                            <p className="text-sm text-gray-600">Allow sharing of anonymized analytics data with third parties</p>
                          </div>
                          <button
                            onClick={() => setPrivacy({...privacy, analyticsSharing: !privacy.analyticsSharing})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy.analyticsSharing ? 'bg-[#015763]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy.analyticsSharing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Profile Visibility */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'private', label: 'Private', description: 'Only you can see your profile' },
                          { value: 'team', label: 'Team Only', description: 'Only team members can see your profile' },
                          { value: 'public', label: 'Public', description: 'Anyone can see your profile' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={privacy.profileVisibility === option.value}
                              onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                              className="text-[#015763] focus:ring-[#015763]"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Export your data</p>
                          <p className="text-sm text-gray-600">Download a copy of all your data</p>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                      <p className="text-gray-600 mt-1">Configure general application preferences</p>
                    </div>
                    <button
                      onClick={saveGeneral}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Appearance */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Compact View</p>
                            <p className="text-sm text-gray-600">Use a more compact layout to fit more content</p>
                          </div>
                          <button
                            onClick={() => setGeneral({...general, compactView: !general.compactView})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              general.compactView ? 'bg-[#015763]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                general.compactView ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Behavior */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Behavior</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Auto-save</p>
                            <p className="text-sm text-gray-600">Automatically save changes as you work</p>
                          </div>
                          <button
                            onClick={() => setGeneral({...general, autoSave: !general.autoSave})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              general.autoSave ? 'bg-[#015763]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                general.autoSave ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                      <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-900">Delete Account</p>
                            <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                          </div>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

