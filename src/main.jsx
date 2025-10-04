import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import "./shared/styles/index.css";

// Import client routes
import Landing from './client/pages/Landing.jsx'
import Login from './client/pages/Login.jsx'
import Signup from './client/pages/Signup.jsx'
import ForgotPassword from './client/pages/ForgotPassword.jsx'
import SelectUser from './client/pages/SelectUser.jsx'
import AuthCallback from './client/pages/AuthCallback.jsx'
import TestGoogleAuth from './client/pages/TestGoogleAuth.jsx'
import ExtensionSuccess from './client/pages/ExtensionSuccess.jsx'
import ClientLayout from './client/layouts/ClientLayout.jsx'
import Overview from './client/pages/features/Overview.jsx'
import Analytics from './client/pages/features/Analytics.jsx'
import Report from './client/pages/features/Report.jsx'
import Help from './client/pages/features/Help.jsx'
import Settings from './client/pages/features/Settings.jsx'
import Extension from './client/pages/features/Extension.jsx'
import WhitelistManagement from './client/pages/features/WhitelistManagement.jsx'
import Debug from './client/pages/Debug.jsx'
import ProtectedRoute from './client/components/ProtectedRoute.jsx'

// Import admin components
import AdminLayout from './admin/layouts/AdminLayout.jsx'
import AdminLogin from './admin/pages/AdminLogin.jsx'
import AdminAuthWrapper from './admin/components/AdminAuthWrapper.jsx'

// Import admin pages
import SystemOverview from './admin/pages/dashboard/SystemOverview.jsx'
import FlaggedContentLogs from './admin/pages/moderation/FlaggedContentLogs.jsx'
import Reports from './admin/pages/moderation/Reports.jsx'
import ResolvedCases from './admin/pages/moderation/ResolvedCases.jsx'
import ModerationRules from './admin/pages/moderation/ModerationRules.jsx'
import SentimentTrends from './admin/pages/analytics/SentimentTrends.jsx'
import OffensiveWordFrequency from './admin/pages/analytics/OffensiveWordFrequency.jsx'
import WebsiteReports from './admin/pages/analytics/WebsiteReports.jsx'
import LanguageAnalytics from './admin/pages/analytics/LanguageAnalytics.jsx'
import ExportReports from './admin/pages/analytics/ExportReports.jsx'
import MasterWordList from './admin/pages/dictionary/MasterWordList.jsx'
import AddEditWords from './admin/pages/dictionary/AddEditWords.jsx'

import SynonymsVariations from './admin/pages/dictionary/SynonymsVariations.jsx'
import CustomLists from './admin/pages/dictionary/CustomLists.jsx'
import ImportExport from './admin/pages/dictionary/ImportExport.jsx'
import EndUsers from './admin/pages/users/EndUsers.jsx'

import AdminAccounts from './admin/pages/users/AdminAccounts.jsx'
import RolePermissions from './admin/pages/users/RolePermissions.jsx'
import ConnectedDomains from './admin/pages/integrations/ConnectedDomains.jsx'
import ApiKeys from './admin/pages/integrations/ApiKeys.jsx'
import IntegrationLogs from './admin/pages/integrations/IntegrationLogs.jsx'
import UsageStatistics from './admin/pages/integrations/UsageStatistics.jsx'
import GlobalPolicies from './admin/pages/settings/GlobalPolicies.jsx'
import LanguageSupport from './admin/pages/settings/LanguageSupport.jsx'
import NotificationPreferences from './admin/pages/settings/NotificationPreferences.jsx'
import SystemPreferences from './admin/pages/settings/SystemPreferences.jsx'
import AdminActivityHistory from './admin/pages/audit/AdminActivityHistory.jsx'
import ModeratorActions from './admin/pages/audit/ModeratorActions.jsx'
import LoginAttempts from './admin/pages/audit/LoginAttempts.jsx'
import DictionaryChanges from './admin/pages/audit/DictionaryChanges.jsx'
import UserReports from './admin/pages/support/UserReports.jsx'
import FeedbackSuggestions from './admin/pages/support/FeedbackSuggestions.jsx'
import HelpCenter from './admin/pages/support/HelpCenter.jsx'
import ProfileSettings from './admin/pages/profile/ProfileSettings.jsx'
import ChangePassword from './admin/pages/profile/ChangePassword.jsx'
import SecuritySettings from './admin/pages/profile/SecuritySettings.jsx'
import SecuritySettingsTest from './admin/pages/profile/SecuritySettingsTest.jsx'

function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-600">Page not found.</p>
    </main>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/client',
    element: (
      <ProtectedRoute>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Overview /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'reports', element: <Report /> },
      { path: 'extension', element: <Extension /> },
      { path: 'extension/whitelist', element: <WhitelistManagement /> },
      { path: 'help', element: <Help /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <AdminAuthWrapper>
        <AdminLogin />
      </AdminAuthWrapper>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminAuthWrapper>
        <AdminLayout />
      </AdminAuthWrapper>
    ),
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
      { path: 'dictionary/add-edit', element: <AddEditWords /> },

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
      { path: 'profile/security-test', element: <SecuritySettingsTest /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/extension-success',
    element: <ExtensionSuccess />,
  },
  {
    path: '/debug',
    element: <Debug />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/register',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/select-user',
    element: <SelectUser />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/test-google-auth',
    element: <TestGoogleAuth />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
