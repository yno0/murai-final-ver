import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout.jsx'

// Dashboard Pages
import SystemOverview from './pages/dashboard/SystemOverview.jsx'

// Moderation Management Pages
import FlaggedContentLogs from './pages/moderation/FlaggedContentLogs.jsx'
import Reports from './pages/moderation/Reports.jsx'
import ResolvedCases from './pages/moderation/ResolvedCases.jsx'
import ModerationRules from './pages/moderation/ModerationRules.jsx'

// Analytics & Reports Pages
import SentimentTrends from './pages/analytics/SentimentTrends.jsx'
import OffensiveWordFrequency from './pages/analytics/OffensiveWordFrequency.jsx'
import WebsiteReports from './pages/analytics/WebsiteReports.jsx'
import LanguageAnalytics from './pages/analytics/LanguageAnalytics.jsx'
import ExportReports from './pages/analytics/ExportReports.jsx'

// Dictionary Management Pages
import MasterWordList from './pages/dictionary/MasterWordList.jsx'
import AddWords from './pages/dictionary/AddEditWords.jsx'

import SynonymsVariations from './pages/dictionary/SynonymsVariations.jsx'
import CustomLists from './pages/dictionary/CustomLists.jsx'
import ImportExport from './pages/dictionary/ImportExport.jsx'

// User & Role Management Pages
import EndUsers from './pages/users/EndUsers.jsx'

import AdminAccounts from './pages/users/AdminAccounts.jsx'
import RolePermissions from './pages/users/RolePermissions.jsx'

// Website & Integration Management Pages
import ConnectedDomains from './pages/integrations/ConnectedDomains.jsx'
import ApiKeys from './pages/integrations/ApiKeys.jsx'
import IntegrationLogs from './pages/integrations/IntegrationLogs.jsx'
import UsageStatistics from './pages/integrations/UsageStatistics.jsx'

// System Settings Pages
import GlobalPolicies from './pages/settings/GlobalPolicies.jsx'
import LanguageSupport from './pages/settings/LanguageSupport.jsx'
import NotificationPreferences from './pages/settings/NotificationPreferences.jsx'
import SystemPreferences from './pages/settings/SystemPreferences.jsx'

// Audit & Activity Log Pages
import AdminActivityHistory from './pages/audit/AdminActivityHistory.jsx'
import ModeratorActions from './pages/audit/ModeratorActions.jsx'
import LoginAttempts from './pages/audit/LoginAttempts.jsx'
import DictionaryChanges from './pages/audit/DictionaryChanges.jsx'

// Support & Communication Pages
import UserReports from './pages/support/UserReports.jsx'
import FeedbackSuggestions from './pages/support/FeedbackSuggestions.jsx'
import HelpCenter from './pages/support/HelpCenter.jsx'

// Profile & Security Pages
import ProfileSettings from './pages/profile/ProfileSettings.jsx'
import ChangePassword from './pages/profile/ChangePassword.jsx'
import SecuritySettings from './pages/profile/SecuritySettings.jsx'

// Authentication
import AdminLogin from './pages/AdminLogin.jsx'

function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-600">Admin page not found.</p>
    </main>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AdminLogin />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      // Default redirect to dashboard
      { index: true, element: <SystemOverview /> },

      // Dashboard
      { path: 'dashboard/overview', element: <SystemOverview /> },

      // Moderation Management
      { path: 'moderation/flagged-content', element: <FlaggedContentLogs /> },
      { path: 'moderation/reports', element: <Reports /> },
      { path: 'moderation/resolved-cases', element: <ResolvedCases /> },
      { path: 'moderation/rules', element: <ModerationRules /> },

      // Analytics & Reports
      { path: 'analytics/sentiment-trends', element: <SentimentTrends /> },
      { path: 'analytics/word-frequency', element: <OffensiveWordFrequency /> },
      { path: 'analytics/website-reports', element: <WebsiteReports /> },
      { path: 'analytics/language-analytics', element: <LanguageAnalytics /> },
      { path: 'analytics/export-reports', element: <ExportReports /> },

      // Dictionary Management
      { path: 'dictionary/master-list', element: <MasterWordList /> },
      { path: 'dictionary/add-words', element: <AddWords /> },

      { path: 'dictionary/synonyms', element: <SynonymsVariations /> },
      { path: 'dictionary/custom-lists', element: <CustomLists /> },
      { path: 'dictionary/import-export', element: <ImportExport /> },

      // User & Role Management
      { path: 'users/end-users', element: <EndUsers /> },

      { path: 'users/admin-accounts', element: <AdminAccounts /> },
      { path: 'users/roles-permissions', element: <RolePermissions /> },

      // Website & Integration Management
      { path: 'integrations/domains', element: <ConnectedDomains /> },
      { path: 'integrations/api-keys', element: <ApiKeys /> },
      { path: 'integrations/logs', element: <IntegrationLogs /> },
      { path: 'integrations/usage-stats', element: <UsageStatistics /> },

      // System Settings
      { path: 'settings/global-policies', element: <GlobalPolicies /> },
      { path: 'settings/language-support', element: <LanguageSupport /> },
      { path: 'settings/notifications', element: <NotificationPreferences /> },
      { path: 'settings/system-preferences', element: <SystemPreferences /> },

      // Audit & Activity Logs
      { path: 'audit/admin-activity', element: <AdminActivityHistory /> },
      { path: 'audit/moderator-actions', element: <ModeratorActions /> },
      { path: 'audit/login-attempts', element: <LoginAttempts /> },
      { path: 'audit/dictionary-changes', element: <DictionaryChanges /> },

      // Support & Communication
      { path: 'support/user-reports', element: <UserReports /> },
      { path: 'support/feedback', element: <FeedbackSuggestions /> },
      { path: 'support/help-center', element: <HelpCenter /> },

      // Profile & Security
      { path: 'profile/settings', element: <ProfileSettings /> },
      { path: 'profile/change-password', element: <ChangePassword /> },
      { path: 'profile/security', element: <SecuritySettings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default function AdminApp() {
  return <AdminLayout />
}

export { router as adminRouter }