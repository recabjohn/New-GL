import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage       from './pages/DashboardPage'
import SubmissionDetailPage from './pages/SubmissionDetailPage'
import ProductBrowsePage   from './pages/ProductBrowsePage'
import QuoteSummaryPage    from './pages/QuoteSummaryPage'
import SubmissionsPage     from './pages/SubmissionsPage'
import ClearancePage       from './pages/ClearancePage'
import FindPolicyPage      from './pages/FindPolicyPage'
import AccountsPage        from './pages/AccountsPage'
import DocumentsPage       from './pages/DocumentsPage'
import AnalyticsPage       from './pages/AnalyticsPage'
import ActivityLogPage     from './pages/ActivityLogPage'
import SettingsPage        from './pages/SettingsPage'
import HelpPage            from './pages/HelpPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Core */}
        <Route path="/"                         element={<DashboardPage />} />
        <Route path="/submissions/:id"          element={<SubmissionDetailPage />} />
        <Route path="/submissions/:id/browse"   element={<ProductBrowsePage />} />
        <Route path="/quotes/:id"               element={<QuoteSummaryPage />} />

        {/* Enterprise pages */}
        <Route path="/submissions"              element={<SubmissionsPage />} />
        <Route path="/clearance"               element={<ClearancePage />} />
        <Route path="/find"                    element={<FindPolicyPage />} />
        <Route path="/accounts"               element={<AccountsPage />} />
        <Route path="/documents"              element={<DocumentsPage />} />
        <Route path="/analytics"              element={<AnalyticsPage />} />
        <Route path="/activity"               element={<ActivityLogPage />} />
        <Route path="/settings"               element={<SettingsPage />} />
        <Route path="/help"                   element={<HelpPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
