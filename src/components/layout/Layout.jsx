import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastProvider } from '../ui/Toast'
import SessionTimeoutModal from '../ui/SessionTimeoutModal'

export default function Layout({ children }) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Session timeout warning modal — renders globally over everything */}
      <SessionTimeoutModal />
    </ToastProvider>
  )
}
