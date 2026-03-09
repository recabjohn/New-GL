import { useState, useMemo } from 'react'
import {
  Search, BookOpen, BarChart2, ShieldCheck,
  ChevronDown, ChevronUp,
  Mail, Phone, MessageSquare,
  Play, ThumbsUp, ThumbsDown,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'

// ─── Hero ─────────────────────────────────────────────────────────────────────

const POPULAR_TOPICS = [
  'Create Submission',
  'Check Clearance',
  'Generate Quote',
  'Bind Policy',
  'Schedule of Forms',
  'Rate Indication',
]

function HeroSection() {
  const [query, setQuery] = useState('')

  return (
    <div className="rounded-xl bg-ink-950 px-8 py-12 text-center">
      <h1 className="text-3xl font-bold text-white mb-2">How can we help you?</h1>
      <p className="text-ink-300 text-sm mb-6">Search our documentation, guides, and FAQ.</p>

      {/* Search */}
      <div className="max-w-xl mx-auto relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for anything..."
          className="w-full bg-white rounded-xl shadow-lg pl-12 pr-5 py-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-flame-400"
        />
      </div>

      {/* Popular topic chips */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="text-xs text-ink-400 self-center mr-1">Popular:</span>
        {POPULAR_TOPICS.map(topic => (
          <button
            key={topic}
            type="button"
            className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-white text-xs font-medium rounded-full transition-colors duration-150"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Quick Start Cards ────────────────────────────────────────────────────────

const QUICK_STARTS = [
  {
    icon: BookOpen,
    iconColor: 'text-flame-500',
    iconBg: 'bg-flame-50',
    title: 'Getting Started',
    description: 'Learn the fundamentals of the Solaris GL platform and get your first submission live in minutes.',
    steps: [
      'Create your user account and configure your profile',
      'Start a new submission and complete the account intake form',
      'Run clearance to verify there are no conflicts',
    ],
  },
  {
    icon: BarChart2,
    iconColor: 'text-ink-700',
    iconBg: 'bg-ink-50',
    title: 'Rate a Policy',
    description: 'Walk through the full rating workflow from LOB selection through premium indication.',
    steps: [
      'Select the line of business and coverage structure',
      'Enter risk data and location details',
      'Review the Schedule of Forms and generate a Rate Indication',
    ],
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-sage-600',
    iconBg: 'bg-sage-50',
    title: 'Bind & Issue',
    description: 'Finalize coverage, issue policy documents, and manage post-bind endorsements.',
    steps: [
      'Accept the quoted terms and click Bind Policy',
      'Review the generated policy package and cover letter',
      'File endorsements or schedule mid-term changes as needed',
    ],
  },
]

function QuickStartCards() {
  return (
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Quick Start</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_STARTS.map(({ icon: Icon, iconColor, iconBg, title, description, steps }) => (
          <div key={title} className="bg-white rounded-xl border border-stone-200 shadow-card p-5 flex flex-col">
            <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <h3 className="text-sm font-semibold text-stone-800 mb-1.5">{title}</h3>
            <p className="text-xs text-stone-500 mb-4 flex-1">{description}</p>
            <ol className="space-y-2 mb-5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                  <span className="flex-shrink-0 h-4 w-4 rounded-full bg-stone-100 text-stone-500 font-bold text-[10px] flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="text-sm font-medium text-ink-700 hover:text-ink-800 text-left transition-colors"
            >
              View Guide &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    section: 'Submissions & Clearance',
    items: [
      {
        id: 'faq-1',
        question: 'How do I create a new submission?',
        answer:
          'To create a new submission, click the "New Submission" button on the Dashboard or Submissions page. You will be guided through a multi-step form covering the insured account details, named insureds, contacts, and line of business selection. All required fields are marked with an asterisk. Once the form is complete, click "Register Submission" to save the record and proceed to clearance.',
      },
      {
        id: 'faq-2',
        question: 'What is clearance and why is it needed?',
        answer:
          'Clearance is the process of verifying that the insured account is not already represented by another broker or underwriter within Solaris or affiliated carriers. It prevents duplicate quoting and protects existing broker relationships. Clearance checks are run automatically when a new submission is registered, and results are displayed on the Clearance tab of the submission detail page.',
      },
      {
        id: 'faq-3',
        question: 'How long does clearance check take?',
        answer:
          'Most clearance checks complete within a few seconds. In rare cases involving complex account structures or large named insured lists, the check may take up to 30 seconds. You will see a spinner on the Clearance tab while the check is running, and you will receive an in-app notification — and optionally an email — when results are ready.',
      },
      {
        id: 'faq-4',
        question: 'Can I resubmit after a clearance conflict?',
        answer:
          'Yes. If a clearance conflict is identified, you can review the conflicting record, contact the conflicting party, and — if the conflict is resolved — mark the conflict as cleared and proceed. If the conflict cannot be resolved, the submission will be declined at the clearance stage. In both cases, a full audit trail is maintained on the Clearance tab.',
      },
    ],
  },
  {
    section: 'Rating & Quoting',
    items: [
      {
        id: 'faq-5',
        question: 'How is the premium calculated?',
        answer:
          'Premium is calculated using a combination of actuarially determined base rates, risk-specific modifiers (industry, location, revenue, prior losses), and coverage structure factors such as limits, retentions, and selected endorsements. The full rating algorithm is documented in the Rate Manual, accessible from the Schedule of Forms panel in each submission.',
      },
      {
        id: 'faq-6',
        question: 'What is the Schedule of Forms?',
        answer:
          'The Schedule of Forms (SOF) is the complete list of policy forms, endorsements, and exclusions that apply to a given quote. It is generated automatically based on the selected line of business, state of domicile, and coverage options. Mandatory forms are always included; optional forms can be added or removed by the underwriter before binding.',
      },
      {
        id: 'faq-7',
        question: 'Can I modify limits after quoting?',
        answer:
          'Yes. After a quote has been generated, you can modify coverage limits, deductibles, and optional endorsements by editing the LOB tab. Each change will trigger a re-rate and produce a new quote version. All prior versions are preserved in the quote history for auditing purposes. Note that changing named insureds or the policy period requires a fresh clearance check.',
      },
      {
        id: 'faq-8',
        question: 'How do I generate a Rate Indication?',
        answer:
          'A Rate Indication is an unofficial, non-binding premium estimate generated before full underwriting review. To generate one, navigate to the LOB tab of your submission, complete the risk data fields, and click "Run Rate Indication." The result will display the indicated premium range alongside a loss cost breakdown. Rate Indications can be shared with brokers as PDFs from the Documents tab.',
      },
    ],
  },
  {
    section: 'Policy & Binding',
    items: [
      {
        id: 'faq-9',
        question: 'What happens after I click Bind Policy?',
        answer:
          'Clicking "Bind Policy" initiates the binding workflow: the system locks the quote terms, generates a policy number, and creates the full policy document package — including the declarations page, Schedule of Forms, and any applicable endorsements. The policy status changes to "Bound" and all relevant parties receive email notifications. The binder document is available immediately in the Documents tab.',
      },
      {
        id: 'faq-10',
        question: 'How do I issue an endorsement?',
        answer:
          'To issue an endorsement on a bound policy, open the policy from the Submissions or Find Policy page, then navigate to the Endorsements panel. Click "New Endorsement," select the endorsement type (e.g., additional insured, limit change, location addition), complete the required fields, and click "File Endorsement." The endorsement is processed immediately and appears in the policy document history.',
      },
      {
        id: 'faq-11',
        question: 'Where can I find the policy documents?',
        answer:
          'All policy documents — including the declaration page, Schedule of Forms, endorsements, and binder letters — are available on the Documents tab of any bound submission. You can view documents in-browser, download individual files, or bulk-download the complete policy package as a ZIP archive. Documents are retained for the life of the policy plus a regulatory hold period of seven years.',
      },
    ],
  },
]

// ─── FAQ Accordion with search + helpful votes ────────────────────────────────

function FAQItem({ faq, isOpen, onToggle, helpfulVotes, onVote }) {
  const vote = helpfulVotes[faq.id]

  return (
    <div className="border-b border-stone-100 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(faq.id)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-stone-800 group-hover:text-ink-700 transition-colors">
          {faq.question}
        </span>
        {isOpen
          ? <ChevronUp className="h-4 w-4 text-stone-400 flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-stone-400 flex-shrink-0" />
        }
      </button>
      {isOpen && (
        <div className="pb-4 pr-8">
          <p className="text-sm text-stone-600 leading-relaxed mb-4">{faq.answer}</p>
          {/* Helpful feedback */}
          <div className="flex items-center gap-3 border-t border-stone-100 pt-3">
            {vote ? (
              <span className="text-xs text-stone-400 italic">Thanks for your feedback!</span>
            ) : (
              <>
                <span className="text-xs text-stone-500">Was this helpful?</span>
                <button
                  type="button"
                  onClick={() => onVote(faq.id, 'yes')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-sage-50 hover:text-sage-700 text-stone-500 text-xs font-medium border border-stone-200 hover:border-sage-200 transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Yes
                </button>
                <button
                  type="button"
                  onClick={() => onVote(faq.id, 'no')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-crimson-50 hover:text-crimson-700 text-stone-500 text-xs font-medium border border-stone-200 hover:border-crimson-200 transition-colors"
                >
                  <ThumbsDown className="h-3.5 w-3.5" /> No
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FAQSections() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [helpfulVotes, setHelpfulVotes] = useState({})

  const allFaqs = useMemo(() => FAQ_SECTIONS.flatMap(s => s.items), [])

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_SECTIONS
    const q = searchQuery.toLowerCase()
    return FAQ_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(
        item =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      ),
    })).filter(section => section.items.length > 0)
  }, [searchQuery])

  const totalFiltered = filteredSections.reduce((sum, s) => sum + s.items.length, 0)

  const handleToggle = id => {
    setExpandedFAQ(prev => (prev === id ? null : id))
  }

  const handleVote = (id, vote) => {
    setHelpfulVotes(prev => ({ ...prev, [id]: vote }))
  }

  return (
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Frequently Asked Questions</p>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-300 shadow-sm"
        />
        {searchQuery && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            {totalFiltered} result{totalFiltered !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredSections.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-card py-12 text-center">
          <Search className="h-8 w-8 text-stone-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500">No FAQs match your search.</p>
          <p className="text-xs text-stone-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSections.map(({ section, items }) => (
            <div key={section} className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-stone-100 bg-stone-25">
                <h3 className="text-sm font-semibold text-stone-800">{section}</h3>
              </div>
              <div className="px-5">
                {items.map(faq => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isOpen={expandedFAQ === faq.id}
                    onToggle={handleToggle}
                    helpfulVotes={helpfulVotes}
                    onVote={handleVote}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Video Tutorials ──────────────────────────────────────────────────────────

const TUTORIALS = [
  { id: 'tut-1', title: 'Getting Started with GL Submissions', duration: '4:32' },
  { id: 'tut-2', title: 'How to Rate and Generate a Quote',    duration: '7:15' },
  { id: 'tut-3', title: 'Binding a Policy Step-by-Step',       duration: '5:48' },
]

function VideoTutorials() {
  const toast = useToast()

  return (
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Video Tutorials</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TUTORIALS.map(tut => (
          <div key={tut.id} className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden flex flex-col">
            {/* Thumbnail */}
            <div className="relative bg-stone-200 h-36 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                <Play className="h-6 w-6 text-ink-700 ml-0.5" />
              </div>
              <span className="absolute bottom-2 right-2 bg-ink-900/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                {tut.duration}
              </span>
            </div>
            {/* Info */}
            <div className="p-4 flex flex-col flex-1 gap-3">
              <p className="text-sm font-medium text-stone-800 leading-snug flex-1">{tut.title}</p>
              <Button
                variant="secondary"
                size="sm"
                icon={Play}
                onClick={() => toast.info('Opening tutorial', `Opening tutorial: ${tut.title}`)}
              >
                Watch
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Release Notes ────────────────────────────────────────────────────────────

const RELEASE_NOTES = [
  { version: 'v2.4.1', description: 'New combined ratio trend chart in Analytics',    badge: 'New',      badgeColor: 'bg-flame-100 text-flame-700'  },
  { version: 'v2.4.0', description: 'Quote versioning with Clone Quote support',       badge: 'New',      badgeColor: 'bg-flame-100 text-flame-700'  },
  { version: 'v2.3.2', description: 'Improved PDF export performance',                 badge: 'Improved', badgeColor: 'bg-sage-100 text-sage-700'    },
  { version: 'v2.3.1', description: 'Fixed clearance date calculation bug',            badge: 'Fix',      badgeColor: 'bg-stone-100 text-stone-600'  },
]

function ReleaseNotes() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100">
        <h3 className="text-sm font-semibold text-stone-800">Release Notes</h3>
      </div>
      <div className="divide-y divide-stone-100">
        {RELEASE_NOTES.map(r => (
          <div key={r.version} className="flex items-center gap-4 px-5 py-3.5">
            <span className="font-mono text-xs font-bold text-stone-500 w-14 shrink-0">{r.version}</span>
            <p className="text-sm text-stone-700 flex-1">{r.description}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.badgeColor}`}>
              {r.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Support Contact with Chat Modal ─────────────────────────────────────────

const CHAT_CATEGORIES = [
  'Submission Question',
  'Quote Issue',
  'Billing',
  'Technical Problem',
  'Other',
]

function ChatModal({ open, onClose }) {
  const toast = useToast()
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    if (!message.trim()) {
      setError('Please enter a message before starting the chat.')
      return
    }
    setError('')
    setStarting(true)
    await new Promise(r => setTimeout(r, 1000))
    setStarting(false)
    setCategory('')
    setMessage('')
    onClose()
    toast.success('Chat session started', 'A support agent will join shortly.')
  }

  const handleClose = () => {
    setCategory('')
    setMessage('')
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-100 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-sage-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-sage-800 font-mono">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-stone-900">How can we help you today?</h3>
            <p className="text-xs text-stone-400 mt-0.5">Support agents are online — typical response in 2 min.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-600 transition-colors ml-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Category */}
          <div>
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="form-input"
            >
              <option value="">Select a category...</option>
              {CHAT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="form-label">
              Message <span className="text-flame-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); if (error) setError('') }}
              placeholder="Describe your issue or question..."
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300 ${error ? 'border-crimson-400' : 'border-stone-200'}`}
            />
            {error && <p className="mt-1 text-xs text-crimson-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
            <Button
              variant="cta"
              size="sm"
              icon={MessageSquare}
              loading={starting}
              onClick={handleStart}
            >
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SupportCard() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />

      <div className="rounded-xl bg-ink-50 border border-ink-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-stone-900">Need more help?</h2>
            <p className="text-sm text-stone-500 mt-1">
              Our support team is available <span className="font-medium text-stone-700">Mon–Fri, 8am–6pm CT</span>.
            </p>
            <div className="mt-2">
              <Badge color="green">Avg response: 2 hours</Badge>
            </div>
          </div>

          {/* Contact options */}
          <div className="flex flex-wrap gap-4 flex-shrink-0">
            {/* Email */}
            <div className="flex items-center gap-3 bg-white rounded-lg border border-stone-200 px-4 py-3 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-ink-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-ink-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email</p>
                <a
                  href="mailto:support@solaris-gl.com"
                  className="text-sm font-medium text-ink-700 hover:underline"
                >
                  support@solaris-gl.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 bg-white rounded-lg border border-stone-200 px-4 py-3 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center">
                <Phone className="h-4 w-4 text-sage-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Phone</p>
                <a
                  href="tel:18007652747"
                  className="text-sm font-medium text-stone-800 hover:underline font-mono"
                >
                  1-800-SOLARIS
                </a>
              </div>
            </div>

            {/* Live Chat */}
            <div className="flex items-center gap-3 bg-white rounded-lg border border-stone-200 px-4 py-3 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-flame-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-flame-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Live Chat</p>
                <Button variant="cta" size="xs" onClick={() => setChatOpen(true)}>Start Chat</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page Root ────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div className="px-6 py-6 max-w-5xl mx-auto space-y-8">
      <HeroSection />
      <QuickStartCards />
      <VideoTutorials />
      <FAQSections />
      <ReleaseNotes />
      <SupportCard />
    </div>
  )
}
