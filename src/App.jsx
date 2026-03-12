import { Routes, Route, Navigate } from 'react-router-dom'
import { Component } from 'react'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage            from './pages/LoginPage'
import DashboardPage        from './pages/DashboardPage'
import SubmissionDetailPage from './pages/SubmissionDetailPage'
import ProductBrowsePage    from './pages/ProductBrowsePage'
import QuoteSummaryPage     from './pages/QuoteSummaryPage'
import SubmissionsPage      from './pages/SubmissionsPage'
import ClearancePage        from './pages/ClearancePage'
import FindPolicyPage       from './pages/FindPolicyPage'
import AccountsPage         from './pages/AccountsPage'
import DocumentsPage        from './pages/DocumentsPage'
import AnalyticsPage        from './pages/AnalyticsPage'
import ActivityLogPage      from './pages/ActivityLogPage'
import SettingsPage         from './pages/SettingsPage'
import HelpPage             from './pages/HelpPage'

// ---------------------------------------------------------------------------
// Global Error Boundary
// ---------------------------------------------------------------------------
class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-full bg-crimson-50 flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-crimson-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-stone-900 mb-1">Something went wrong</h1>
            <p className="text-sm text-stone-500 mb-5">An unexpected error occurred. Please try refreshing the page.</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-ink-700 hover:bg-ink-800 rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Route guard — redirects to /login when not authenticated
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <ErrorBoundary>
    <Routes>
      {/* Public route — no sidebar / topbar */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected routes — wrapped in Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        }
      />
    </Routes>
    </ErrorBoundary>
  )
}
