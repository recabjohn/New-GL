import { useState, useRef } from 'react'
import {
  User, Bell, Monitor, Server,
  Key, Download, FileText, AlertTriangle,
  Copy, Trash2, Plus,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toggle from '../components/ui/Toggle'
import Badge from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'

// ─── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab() {
  const toast = useToast()
  const [twoFA, setTwoFA] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState(null)
  const fileInputRef = useRef(null)

  // Password fields
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwErrors, setPwErrors] = useState({})
  const [changingPw, setChangingPw] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Profile saved', 'Your profile has been updated.')
  }

  const handleFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarSrc(url)
    e.target.value = ''
  }

  const handleChangePassword = async () => {
    const errors = {}
    if (!currentPw) errors.currentPw = 'Current password is required.'
    if (!newPw) errors.newPw = 'New password is required.'
    if (newPw && newPw === currentPw) errors.newPw = 'New password must differ from current password.'
    if (!confirmPw) errors.confirmPw = 'Please confirm your new password.'
    if (newPw && confirmPw && newPw !== confirmPw) errors.confirmPw = 'Passwords do not match.'

    if (Object.keys(errors).length > 0) {
      setPwErrors(errors)
      return
    }
    setPwErrors({})
    setChangingPw(true)
    await new Promise(r => setTimeout(r, 800))
    setChangingPw(false)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    toast.success('Password changed', 'Your password has been updated successfully.')
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card title="Profile Photo">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 h-20 w-20 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white font-mono select-none">UA</span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Upload Photo
            </Button>
            <p className="mt-1.5 text-xs text-stone-400">JPG, PNG or GIF. Max size 2 MB.</p>
          </div>
        </div>
      </Card>

      {/* Personal Info */}
      <Card title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue="uiuxAdmin" />
          <Input label="Email" type="email" defaultValue="uiuxadmin@solaris-gl.com" />
          <Input label="Phone" type="tel" defaultValue="+1 (555) 000-0000" />
          <Input label="Role" defaultValue="Senior Underwriter" disabled />
          <Input label="Department" defaultValue="Commercial Lines" />
          <Input label="Location" defaultValue="Chicago, IL" />
        </div>
      </Card>

      {/* Password */}
      <Card title="Password &amp; Security">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            error={pwErrors.currentPw}
          />
          <div />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            error={pwErrors.newPw}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            error={pwErrors.confirmPw}
          />
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            loading={changingPw}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* 2FA */}
      <Card title="Two-Factor Authentication">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-stone-700 mb-1">
              Add an extra layer of security to your account. When enabled, you will be required
              to enter a one-time code from your authenticator app each time you sign in.
            </p>
            <p className="text-xs text-stone-400">
              Supported apps: Google Authenticator, Authy, 1Password.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Toggle checked={twoFA} onChange={setTwoFA} label="Enable 2FA" />
            {twoFA
              ? <Badge color="green">Enabled</Badge>
              : <Badge color="default">Disabled</Badge>
            }
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="cta" size="md" loading={saving} onClick={handleSaveProfile}>
          Save Profile
        </Button>
      </div>
    </div>
  )
}

// ─── Notifications Tab ───────────────────────────────────────────────────────

const EMAIL_ITEMS = [
  { label: 'New submission assigned',   key: 'email_assigned',    default: true  },
  { label: 'Clearance result ready',    key: 'email_clearance',   default: true  },
  { label: 'Quote generated',           key: 'email_quote',       default: true  },
  { label: 'Policy bound',             key: 'email_bound',       default: true  },
  { label: 'Endorsement filed',        key: 'email_endorse',     default: false },
  { label: 'Submission expiring soon', key: 'email_expiring',    default: true  },
  { label: 'System maintenance alerts', key: 'email_maint',       default: false },
]

const INAPP_ITEMS = [
  { label: 'New submission assigned',   key: 'inapp_assigned',   default: true },
  { label: 'Clearance result ready',    key: 'inapp_clearance',  default: true },
  { label: 'Quote generated',           key: 'inapp_quote',      default: true },
  { label: 'Policy bound',             key: 'inapp_bound',      default: true },
  { label: 'Endorsement filed',        key: 'inapp_endorse',    default: true },
  { label: 'Submission expiring soon', key: 'inapp_expiring',   default: true },
  { label: 'System maintenance alerts', key: 'inapp_maint',      default: true },
]

function useToggles(items) {
  const init = {}
  items.forEach(i => { init[i.key] = i.default })
  const [state, setState] = useState(init)
  const toggle = key => setState(s => ({ ...s, [key]: !s[key] }))
  return [state, toggle]
}

function NotificationsTab() {
  const toast = useToast()
  const [email, toggleEmail] = useToggles(EMAIL_ITEMS)
  const [inapp, toggleInApp] = useToggles(INAPP_ITEMS)
  const [dailyDigest, setDailyDigest] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [digestTime, setDigestTime] = useState('9:00 AM')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Preferences saved', 'Your notification preferences have been updated.')
  }

  return (
    <div className="space-y-6">
      <Card title="Email Notifications">
        <div className="divide-y divide-stone-100">
          {EMAIL_ITEMS.map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-stone-700">{item.label}</span>
              <Toggle checked={email[item.key]} onChange={() => toggleEmail(item.key)} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="In-App Notifications">
        <div className="divide-y divide-stone-100">
          {INAPP_ITEMS.map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-stone-700">{item.label}</span>
              <Toggle checked={inapp[item.key]} onChange={() => toggleInApp(item.key)} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Digest Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Daily digest</p>
              <p className="text-xs text-stone-400">Receive a summary of daily activity each morning.</p>
            </div>
            <div className="flex items-center gap-3">
              {dailyDigest && (
                <Select
                  value={digestTime}
                  onChange={setDigestTime}
                  options={['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM']}
                  className="w-32"
                />
              )}
              <Toggle checked={dailyDigest} onChange={setDailyDigest} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Weekly summary</p>
              <p className="text-xs text-stone-400">A comprehensive weekly report sent every Monday.</p>
            </div>
            <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="cta" size="md" loading={saving} onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  )
}

// ─── Display Tab ─────────────────────────────────────────────────────────────

function ThemeCard({ id, label, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={[
        'flex-1 rounded-xl border-2 p-4 text-left transition-all duration-150',
        selected
          ? 'border-ink-500 ring-2 ring-ink-200 bg-ink-50'
          : 'border-stone-200 hover:border-stone-300 bg-white',
      ].join(' ')}
    >
      <p className={`text-sm font-semibold mb-0.5 ${selected ? 'text-ink-700' : 'text-stone-800'}`}>{label}</p>
      <p className="text-xs text-stone-400">{description}</p>
    </button>
  )
}

function DarkModePreview() {
  return (
    <div className="bg-ink-950 rounded-xl p-4 overflow-hidden">
      <div className="flex gap-3 h-24">
        {/* Mini sidebar */}
        <div className="w-16 bg-ink-900 rounded-lg p-2 flex flex-col gap-1.5">
          <div className="h-2 bg-ink-700 rounded w-10" />
          <div className="h-1.5 bg-ink-800 rounded w-8" />
          <div className="h-1.5 bg-ink-800 rounded w-9" />
          <div className="h-1.5 bg-ink-600 rounded w-7" />
          <div className="h-1.5 bg-ink-800 rounded w-8" />
        </div>
        {/* Mini content area */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-ink-800 rounded w-24" />
          <div className="flex gap-2 flex-1">
            <div className="flex-1 bg-ink-900 rounded-lg p-2 flex flex-col gap-1">
              <div className="h-1.5 bg-ink-700 rounded w-full" />
              <div className="h-1.5 bg-ink-700 rounded w-3/4" />
              <div className="h-2 bg-ink-600 rounded w-12 mt-1" />
            </div>
            <div className="flex-1 bg-ink-900 rounded-lg p-2 flex flex-col gap-1">
              <div className="h-1.5 bg-ink-700 rounded w-full" />
              <div className="h-1.5 bg-ink-700 rounded w-2/3" />
              <div className="h-2 bg-sage-600 rounded w-10 mt-1" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-ink-400 mt-2 text-center">Dark mode preview</p>
    </div>
  )
}

function ButtonGroup({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-stone-200 overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            'px-4 py-2 text-sm font-medium transition-colors duration-150',
            i > 0 ? 'border-l border-stone-200' : '',
            value === opt
              ? 'bg-ink-700 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-50',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function DisplayTab() {
  const toast = useToast()
  const [selectedTheme, setSelectedTheme] = useState('Light')
  const [density, setDensity]     = useState('Default')
  const [landing, setLanding]     = useState('Dashboard')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [currency, setCurrency]   = useState('USD')
  const [pageSize, setPageSize]   = useState('25')
  const [saving, setSaving] = useState(false)

  const THEMES = [
    { id: 'Light',  label: 'Light',  description: 'Default light interface' },
    { id: 'Dark',   label: 'Dark',   description: 'Easy on the eyes at night' },
    { id: 'System', label: 'System', description: 'Follows your OS preference' },
  ]

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Display settings saved', 'Your display preferences have been updated.')
  }

  return (
    <div className="space-y-6">
      <Card title="Appearance">
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Theme</p>
            <div className="flex gap-3">
              {THEMES.map(t => (
                <ThemeCard
                  key={t.id}
                  id={t.id}
                  label={t.label}
                  description={t.description}
                  selected={selectedTheme === t.id}
                  onClick={setSelectedTheme}
                />
              ))}
            </div>
          </div>

          {selectedTheme === 'Dark' && (
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Dark Mode Preview</p>
              <DarkModePreview />
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Density</p>
            <ButtonGroup options={['Compact', 'Default', 'Comfortable']} value={density} onChange={setDensity} />
          </div>
        </div>
      </Card>

      <Card title="Regional &amp; Formatting">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Default Landing Page"
            value={landing}
            onChange={setLanding}
            options={['Dashboard', 'Submissions', 'Clearance']}
          />
          <Select
            label="Date Format"
            value={dateFormat}
            onChange={setDateFormat}
            options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']}
          />
          <Select
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={['USD', 'EUR', 'GBP']}
          />
          <Select
            label="Table Page Size"
            value={pageSize}
            onChange={setPageSize}
            options={['10', '25', '50', '100']}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="cta" size="md" loading={saving} onClick={handleSave}>
          Save Display Settings
        </Button>
      </div>
    </div>
  )
}

// ─── System Tab ──────────────────────────────────────────────────────────────

const MOCK_KEYS = [
  {
    id: 1,
    name: 'Production Integration',
    key: 'sk-prod-••••••••••••••••••••3f9a',
    created: '2024-11-01',
    lastUsed: '2025-03-05',
    status: 'Active',
  },
  {
    id: 2,
    name: 'CI/CD Pipeline',
    key: 'sk-ci-••••••••••••••••••••a12b',
    created: '2025-01-15',
    lastUsed: '2025-03-01',
    status: 'Active',
  },
]

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `sk-gl-prod-${result}`
}

function ApiKeyModal({ open, onClose, toast }) {
  const [step, setStep] = useState(1)
  const [newKey, setNewKey] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const k = generateApiKey()
    setNewKey(k)
    setStep(2)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newKey).then(() => {
      setCopied(true)
      toast.success('Key copied', 'API key copied to clipboard.')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      toast.error('Copy failed', 'Could not copy to clipboard.')
    })
  }

  const handleClose = () => {
    setStep(1)
    setNewKey('')
    setCopied(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Generate API Key">
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This will <strong>invalidate your existing API key</strong>. Any integrations using the old key will stop working immediately.
            </p>
          </div>
          <p className="text-sm text-stone-600">Are you sure you want to generate a new API key?</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
            <Button variant="cta" size="sm" icon={Key} onClick={handleGenerate}>Generate</Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-sage-50 border border-sage-200 p-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Your New API Key</p>
            <p className="font-mono text-sm text-ink-800 break-all select-all">{newKey}</p>
          </div>
          <p className="text-xs text-stone-400">Copy and store this key securely. It will not be shown again.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="cta" size="sm" onClick={handleClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function ResetModal({ open, onClose, toast }) {
  const [resetting, setResetting] = useState(false)

  const handleReset = async () => {
    setResetting(true)
    await new Promise(r => setTimeout(r, 1000))
    setResetting(false)
    onClose()
    toast.warning('Settings reset to defaults', 'All settings have been restored to factory defaults.')
  }

  return (
    <Modal open={open} onClose={onClose} title="Reset All Settings">
      <div className="space-y-4">
        <p className="text-sm text-stone-700">
          This will reset all settings to factory defaults. This cannot be undone.
        </p>
        <p className="text-sm text-stone-500">
          All notification preferences, display settings, and API keys will be permanently removed.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="danger" size="sm" icon={AlertTriangle} loading={resetting} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function SystemTab() {
  const toast = useToast()
  const [keys, setKeys] = useState(MOCK_KEYS)
  const [auditRange, setAuditRange] = useState('last_90')
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [sendingAudit, setSendingAudit] = useState(false)

  const revokeKey = id => setKeys(prev => prev.filter(k => k.id !== id))

  const handleSendAudit = async () => {
    setSendingAudit(true)
    await new Promise(r => setTimeout(r, 800))
    setSendingAudit(false)
    toast.success('Audit log emailed', 'The audit log has been sent to your registered email address.')
  }

  return (
    <div className="space-y-6">
      <ApiKeyModal open={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} toast={toast} />
      <ResetModal open={resetModalOpen} onClose={() => setResetModalOpen(false)} toast={toast} />

      {/* API Keys */}
      <Card
        title="API Keys"
        actions={
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setApiKeyModalOpen(true)}>
            Generate API Key
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {['Name', 'Key', 'Created', 'Last Used', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest pb-2 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {keys.map(k => (
                <tr key={k.id}>
                  <td className="py-3 pr-4 font-medium text-stone-800">{k.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-stone-500">{k.key}</td>
                  <td className="py-3 pr-4 text-stone-500">{k.created}</td>
                  <td className="py-3 pr-4 text-stone-500">{k.lastUsed}</td>
                  <td className="py-3 pr-4">
                    <Badge color="green">{k.status}</Badge>
                  </td>
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Trash2}
                      className="text-crimson-600 hover:bg-crimson-50"
                      onClick={() => revokeKey(k.id)}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-stone-400">No API keys. Generate one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Log */}
      <Card title="Audit Log">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Date Range"
            value={auditRange}
            onChange={setAuditRange}
            options={[
              { value: 'last_7',  label: 'Last 7 days'  },
              { value: 'last_30', label: 'Last 30 days' },
              { value: 'last_90', label: 'Last 90 days' },
              { value: 'all',     label: 'All time'     },
            ]}
            className="w-44"
          />
          <Button variant="secondary" size="md" icon={Download}>Download Audit Log</Button>
          <Button
            variant="secondary"
            size="md"
            icon={FileText}
            loading={sendingAudit}
            onClick={handleSendAudit}
          >
            Send Audit Log
          </Button>
        </div>
        <p className="mt-3 text-xs text-stone-400">
          Audit logs are retained for 365 days in accordance with your enterprise data retention policy.
          Logs include all user actions, configuration changes, and system events.
        </p>
      </Card>

      {/* Data Export */}
      <Card title="Data Export">
        <p className="text-sm text-stone-500 mb-4">
          Export your data for external reporting or backup purposes. Exports are generated asynchronously
          and delivered to your registered email address.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="md" icon={FileText}>Export All Submissions (CSV)</Button>
          <Button variant="secondary" size="md" icon={FileText}>Export Policy Data (CSV)</Button>
          <Button variant="secondary" size="md" icon={Download}>Export Analytics Report (PDF)</Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <div className="rounded-xl border border-crimson-300 bg-crimson-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-crimson-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-crimson-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-crimson-800">Danger Zone</h3>
            <p className="mt-1 text-sm text-crimson-700">
              Resetting all settings will revert every configuration option — including notification
              preferences, display settings, and API keys — back to factory defaults.
              <strong className="font-semibold"> This action cannot be undone.</strong>
            </p>
            <div className="mt-4">
              <Button
                variant="danger"
                size="sm"
                icon={AlertTriangle}
                onClick={() => setResetModalOpen(true)}
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab Definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',       label: 'Profile',       Icon: User,    Component: ProfileTab       },
  { id: 'notifications', label: 'Notifications', Icon: Bell,    Component: NotificationsTab },
  { id: 'display',       label: 'Display',       Icon: Monitor, Component: DisplayTab       },
  { id: 'system',        label: 'System',        Icon: Server,  Component: SystemTab        },
]

// ─── Page Root ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const active = TABS.find(t => t.id === activeTab)
  const ActiveComponent = active?.Component

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-400 mt-0.5">Manage your account preferences and configuration.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar nav */}
        <nav className="w-[200px] flex-shrink-0 space-y-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                activeTab === id
                  ? 'bg-ink-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  )
}
