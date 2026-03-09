# GL PAAS — Production Feature Enhancement Plan

## Context

The Solaris GL PAAS UI has 13 fully-routed pages with 0 console errors. All sidebar links work. The pages render real data but most buttons/interactions are static. This plan upgrades every page with enterprise-grade PAAS features — real workflow actions, rich interactive tables, modal workflows, status tracking, and domain-accurate GL insurance logic — executed via 5 parallel agent batches.

---

## Tech Constraints

- React 18 + Vite + Tailwind CSS v3 + React Router v6
- No external chart libraries — pure CSS flexbox + inline styles only
- Icons: lucide-react | Custom palette: ink, flame, stone, sage, amber, crimson
- font-mono for all numbers, premiums, IDs, codes
- All mock data hardcoded — fake async via setTimeout
- Must maintain 0 console errors

---

## BATCH A — Dashboard + SubmissionsPage
**Agent: voltagent-core-dev:fullstack-developer**

### Dashboard (/)
1. Bulk Action Toolbar — checkbox column, floating bar (Reassign/Export/Clear)
2. Row Reassign — avatar click opens reassign modal, updates submissionOverrides
3. Needs Attention Dismiss — × button per alert, dismissedAlerts Set
4. Export Format Modal — CSV/JSON selector before download

### SubmissionsPage (/submissions)
1. Inline Quick-Edit — click priority/assignee to get inline select, updates overrides
2. Days Remaining column — green >7d, amber 3-7d, crimson <3d/overdue
3. Row Context Menu — MoreHorizontal button → View/Reassign/Change Priority/Export Row/Mark Urgent
4. Saved Filters — 3 preset chips + Save Filter modal
5. Bulk Export with column selector — modal with Toggle checkboxes per column

---

## BATCH B — ClearancePage + FindPolicyPage
**Agent: voltagent-core-dev:frontend-developer**

### ClearancePage (/clearance)
1. Inline Check per row — spinner, clearedIds/conflictIds Sets, SN129111 = conflict
2. Conflict Resolution Modal — conflicting policy table, Override & Clear / Decline
3. Clearance Notes accordion — inline textarea per row
4. Batch Run All Pending — 2s async, clears all queue
5. Clickable KPI filter — kpiFilter state, active card ring highlight

### FindPolicyPage (/find)
1. Policy Detail SlideOver — row click opens SlideOver with details/timeline sub-tabs
2. Live Search History — replaces static recent searches
3. Comparison Mode — compareIds Set, floating bar at 2+, CompareModal xl
4. Row Quick Actions — View, Compare, Copy SN#, Flag

---

## BATCH C — AccountsPage + DocumentsPage
**Agent: voltagent-core-dev:ui-designer**

### AccountsPage (/accounts)
1. Account Detail SlideOver — 3 sub-tabs (overview/history/contacts)
2. New Account Modal — full form (Account Name, FEIN, Legal Entity, Contact, State, Agency, LOB)
3. Inline Assignee Change — click cell → inline select → override
4. Expiry Alert Banner — amber banner, 3 expiring accounts, Dismiss button
5. Export accounts CSV — exportLoading + download

### DocumentsPage (/documents)
1. Document Preview Modal — click doc name → Modal xl with PDF viewer + metadata
2. Bulk Download — checkbox column, floating bar, Download Selected
3. Regenerate per row — RefreshCw icon, 1.2s async
4. Send to Agent modal — pre-filled email form
5. Pending docs + clickable KPI filter — 2 pending mock docs, stat cards filter table

---

## BATCH D — AnalyticsPage + ActivityLogPage
**Agent: voltagent-core-dev:fullstack-developer**

### AnalyticsPage (/analytics)
1. Period-driven KPIs + charts — PERIOD_DATA object (MTD/QTD/YTD) drives all values
2. Loss Ratio by Agency — horizontal CSS bars, sage/crimson by threshold 65%
3. Underwriter Performance Table — 4 UW rows, clickable
4. Bar chart delta labels — ↑/↓ percentage above each bar
5. Export Report button — 800ms async toast

### ActivityLogPage (/activity)
1. Inline event detail expand — click row toggles accordion with event-specific fields
2. Log Manual Event modal — type/subId/detail form, prepend to localEvents
3. Export Log CSV — wire button to actual CSV download
4. Stats strip filter wiring — clicking stat chips filters events

---

## BATCH E — Settings + Help + QuoteSummary Subjectivities + ClearanceTab
**Agent: voltagent-core-dev:ui-designer**

### SettingsPage (/settings)
- Profile: Save toasts, Upload Photo preview, password validation
- Notifications: Save Preferences toasts
- Display: Dark theme preview card, Save Display Settings toasts
- System: Generate Key modal (2-step + copy), Audit Log email toast, RESET confirm gate

### HelpPage (/help)
1. Live search dropdown — useMemo filters FAQ, expandedFAQ controlled at page level
2. Start Chat modal — support agent avatar, category select
3. Video Tutorials section — 3 cards with Play overlay, Watch button toasts
4. "Was this helpful?" per FAQ — Yes/No buttons, helpfulVotes map
5. Release Notes card — 4 entries with New/Improved/Fix badges

### QuoteSummaryPage — SubjectivityTab
- Replace placeholder with 5-item subjectivity table (2 pre-bind satisfied, 2 post-bind open, 1 waived)
- Summary strip: Pre-Bind X/2, Post-Bind X/2, Waived
- Satisfy/Waive modals, Add Subjectivity button + modal
- Green "all pre-bind satisfied" banner

### ClearanceTab (/submissions/:id?tab=clearance)
1. Risk Assessment Score panel — overall 72, 5-category horizontal CSS bars
2. Flag for Manual Review — toggle + inline textarea
3. Prior Policy Lookup — input + search, 2-row results (Travelers, Hartford)
4. Market Intelligence note — textarea + save

---

## Verification Checklist (Batches A–E)

| Route | Key checks |
|-------|-----------|
| `/` | Checkbox column; bulk bar; reassign modal; dismiss × |
| `/submissions` | Inline edit; Days Remaining column; context menu; saved filter chips |
| `/clearance` | Check spins; SN129111 conflict; conflict modal; Run All Pending |
| `/find` | SlideOver on row click; Copy SN# toast; compare bar; search history |
| `/accounts` | SlideOver; amber banner; New Account modal; Export |
| `/documents` | Preview modal; Bulk bar; Regenerate spinner; Send modal |
| `/analytics` | Period changes KPIs+bars; Loss Ratio card; UW table; Export toast |
| `/activity` | Accordion expand; Log Event modal; Export CSV; stat chip filter |
| `/settings` | Save toasts; Photo preview; Generate Key; RESET gate |
| `/help` | Search dropdown; Chat modal; Video Watch toast; Helpful votes |
| `/quotes/Q00-0014019-00` | 5 subjectivities; Satisfy/Waive modals; Add Subjectivity |
| `/submissions/SN129105?tab=clearance` | Risk score; Flag toggle; Prior policy search |

**All pages must show 0 console errors.**

---

## PROJECT ANALYSIS — Current State vs Real PAAs Gaps

### What exists
- 13 routed pages, 0 console errors
- Dashboard: pipeline, KPIs, bulk-select table, reassign/dismiss/export modals (Batch A done)
- SubmissionsPage: pipeline strip, filter bar, table — static buttons not yet wired
- ClearancePage: pending queue + recently-cleared list — per-row check/conflict not wired
- FindPolicyPage: search hero, advanced filters, recent searches sidebar — row actions static
- AccountsPage: KPI strip, filter bar, paginated table — no slideover, no expiry banner
- DocumentsPage: stats, filter bar, table — no preview modal, no bulk select
- AnalyticsPage: bar chart, pipeline breakdown, agency volume, tx mix, quote table — period toggle doesn't change values
- ActivityLogPage: timeline with date separators, filter selects — accordion/modal/export not wired
- SubmissionDetail: 3-tab stepper (Clearance → Account → GL Policy) with 3-step LOBTab
- QuoteSummaryPage: premium breakdown, bind/decline flow, diary notes, empty SubjectivityTab
- SettingsPage / HelpPage: scaffolded but mostly static

### Missing for a Real PAAs System (New Batches F–J)

---

## BATCH F — Sidebar + TopBar Power Features
**Agent: voltagent-core-dev:frontend-developer**

### Sidebar (Sidebar.jsx)
1. Count badges on nav items — Clearance shows live count of `submissions.filter(status===Clearance||InProgress).length`; Documents shows hardcoded `2` pending-generation badge; both rendered as a small flame-colored pill when > 0
2. "+" New Submission quick-add button — appears inside sidebar header (next to logo) when expanded; clicking opens NewSubmissionModal directly without navigating
3. Pinned active submission chip — when user is on `/submissions/:id`, a small chip appears under the Submissions nav item showing the SN# (e.g. "SN129105") in font-mono with an × to navigate back
4. Bottom user card dropdown — clicking the user avatar/name area in the bottom nav opens an inline dropdown menu (above it): "My Profile" → /settings, "Switch View" (UW / Manager / Agent — cosmetic chips, toast only), "Sign Out" (toast)

### TopBar (TopBar.jsx)
1. Notifications panel — bell icon opens a right-aligned dropdown (w-80) with 8 hardcoded notifications: 2 high (crimson dot: quote expiring, clearance overdue), 3 medium (amber: doc ready, sub assigned, renewal approaching), 3 low (stone: status changed ×3); each item shows icon + text + SN# + time-ago; "Mark all read" button clears dot; clicking item navigates to relevant submission; panel closes on outside click
2. Global Search command palette — clicking the TopBar search input OR pressing ⌘K/Ctrl+K opens a full-overlay modal (max-w-xl, top-1/4); shows "Recent" chips (6 hardcoded SN# searches) before typing; on keystroke, filters submissions + quote IDs in real time with keyboard navigation (↑/↓/Enter navigates); Esc closes; result rows show SN#, insured name, status badge
3. User profile dropdown — clicking the avatar/name in TopBar right section opens a small dropdown: avatar with name + role, separator, "Profile & Settings" → /settings, "Theme" toggle stub (toast), "Help Center" → /help, separator, "Sign Out" toast

---

## BATCH G — Submission Detail Completeness
**Agent: voltagent-core-dev:fullstack-developer**

### SubmissionDetail — New "Quotes" Tab
1. Add 4th tab "Quotes" to the stepper in SubmissionDetail — shows a table of quote versions for this submission: `Q00-0014019-00` (current, Offered), plus 2 older versions (`-01` Declined, `-02` Draft) with mock dates; clicking a row navigates to `/quotes/:id`
2. Status workflow timeline — right-side panel in the Clearance tab showing the full GL submission lifecycle: Registered → Clearance Check → Account Setup → GL Policy Input → Rated → Quoted → Bound → Issued; each step has a timestamp (mock); current step pulses

### QuoteSummaryPage — Binder & Rating tabs
1. Post-bind binder generation — after clicking "Bind Policy", the Summary tab auto-adds a "BinderDocument" row to the Documents card (binder #BND-0014019, generated timestamp = now); a new amber info banner appears: "Binder issued — policy effective 10/01/2026. Policy # POL-0014019"; toast includes policy number
2. New "Rating" tab on QuoteSummaryPage — shows `ratingWorksheet` data from mockData as a structured display: limits table at top (Each Occurrence, GA, Products, PAI); per-location per-classification rows with columns: Class Code, Description, Territory, Premium Basis, Exposure, Loss Cost, LCM, Base Rate, Final ILF, Deductible Factor, Final Rate, Prem Ops $, Prod Comp Ops $; total row at bottom; certified terrorism row; grand total matches $486.00
3. New "Forms" tab on QuoteSummaryPage — renders `scheduleForms` from mockData as a table: Form Number (font-mono), Form Name, Type (C=Compulsory badge in stone, O=Optional badge in amber), Premium (if applicable, font-mono); total optional premium row at bottom

### SubmissionDetail — ClearanceTab Enhancement
- Already covered in Batch E; ensure Batch G agent verifies it is complete before proceeding

---

## BATCH H — Real GL Insurance Data & New Mock Fields
**Agent: voltagent-core-dev:fullstack-developer**

### mockData.js additions
1. Extend each `submissions` row with 5 new fields:
   - `state`: 'IL' | 'CA' | 'TX' | 'NY' | 'FL' etc. (derive from agency states, vary across 20 rows)
   - `annualRevenue`: string e.g. '$1,500,000' (vary across rows)
   - `yearsInBusiness`: number 2–45 (vary)
   - `lossHistory`: 'Clean (0 losses)' | '1 loss — $12,400' | '2 losses — $38,200'
   - `naicsCode`: e.g. '532490', '722511', '238160' (match insured type)
2. Add `policyNumber` field to bound/issued submissions: e.g. `POL-0014019`
3. Add `commission: 12.5` (percent) to each submission row
4. Add `claims` array to mockData (3 claims for SN129105):
   - `{ id: 'CLM-00291', date: '11/14/2025', type: 'Property Damage', status: 'Closed', reserve: 4200, paid: 3800, claimant: 'City of Chicago' }`
   - `{ id: 'CLM-00318', date: '01/22/2026', type: 'Bodily Injury', status: 'Open', reserve: 22500, paid: 0, claimant: 'Marcus D. Holt' }`
   - `{ id: 'CLM-00341', date: '02/28/2026', type: 'Products Liability', status: 'In Investigation', reserve: 8000, paid: 0, claimant: 'Elena Voss' }`

### SubmissionDetail — new "Claims" tab
1. Add 5th tab "Claims" — shows 3 mock claims for SN129105, empty state for all others; claim rows: Claim #, Date of Loss, Type, Status badge (Closed=sage, Open=crimson, In Investigation=amber), Reserve ($, font-mono), Paid ($, font-mono), Claimant; total reserve row at bottom; "No open claims" empty state with sage icon for all other submissions
2. SubmissionHeader displays `policyNumber` when status is Bound or Issued — shown in header meta strip as "Policy #: POL-0014019" in font-mono amber badge

### AccountsPage — Account Detail SlideOver data
- The existing Batch C SlideOver should include (when built):
  - Coverage summary section: limits table pulled from `glPolicy` (Each Occurrence $100K, GA $200K, Products $200K, PAI $100K, Damage to Rented Premises $100K, Med Pay $5K)
  - Commission section: Agency Commission 12.5%, Est. Commission Amount = totalPremium × 0.125, shown as $60.75 for SN129105
  - Loss history chip from new `lossHistory` field

---

## BATCH I — Advanced Analytics Additions
**Agent: voltagent-core-dev:fullstack-developer**

### AnalyticsPage additions (new sections below existing content)

1. **Renewal Pipeline Panel** — new card below Quote Activity table; shows upcoming renewals by month for next 3 months (Oct 2026: 4 renewals, Nov 2026: 3, Dec 2026: 2); each row: Insured, SN#, Effective Date, Current Premium, Days Until Renewal; rows within 60 days colored amber, within 30 days crimson; "Start Renewal" button per row (toast)

2. **Loss Ratio by Class** — horizontal CSS bar card; 6 GL class types: Mercantile 58%, Contractor 71%, Restaurant 82%, Service 44%, Habitational 69%, Professional 37%; each bar colored sage if < 65%, crimson if >= 65%; a dashed vertical threshold line at 65% (CSS border); legend shows sage=acceptable, crimson=review needed; values in font-mono

3. **Underwriter Performance Table** — 4 UW rows: uiuxAdmin, jsmith, adavis, mrodriguez; columns: UW Name (avatar chip), Open Submissions, Bound MTD, Avg Days to Quote (font-mono), Win Rate (% with mini CSS bar), Total Premium Written; rows are clickable (filters activity log to that user); Export button top-right

4. **Combined Ratio Trend** — 6-month stacked CSS bar chart (Oct–Mar); each bar split into Loss Ratio (ink-400) + Expense Ratio (stone-200); loss values 55–82%, expense constant 28%; tooltip-on-hover shows breakdown (pure CSS, no library); 100% marker line dashed

5. **Export Report** — top-right "Export Report" button; 800ms async spinner; toast "Report exported. Downloading PDF summary."; also "Email Report" secondary button opens a small modal: To field (pre-filled mock email), Subject (pre-filled "GL Analytics — March 2026"), Send button → toast

---

## BATCH J — Task System + Send-to-Agent + Workflow Automation
**Agent: voltagent-core-dev:ui-designer**

### Dashboard — My Tasks Widget (right panel, replaces or stacks with Due This Week)
1. "My Tasks" card in the right panel with 4 mock tasks:
   - { sn: 'SN129106', desc: 'Follow up on clearance docs', type: 'Follow-up', due: '03/07/2026', priority: 'HIGH' }
   - { sn: 'SN129108', desc: 'Request loss runs from agent', type: 'Document Request', due: '03/08/2026', priority: 'HIGH' }
   - { sn: 'SN129113', desc: 'Review classification codes', type: 'Review', due: '03/10/2026', priority: 'MEDIUM' }
   - { sn: 'SN129120', desc: 'Call agent re: premium increase', type: 'Call', due: '03/12/2026', priority: 'LOW' }
2. Each task row: priority dot (crimson/amber/stone) + SN# chip + description + due date + checkmark button (click = strikethrough + toast "Task completed" + remove from list)
3. "+ Add Task" button opens a modal: SN# input (searchable dropdown from submissions), Task Type select (Follow-up/Doc Request/Review/Call/Other), Due Date, Note textarea; Save adds to localTasks (prepend); 0 console errors

### QuoteSummaryPage — Send to Agent
1. "Send to Agent" secondary button in QuoteSummaryPage header (next to Bind Policy); opens a modal: To (pre-filled: agentName + mock @agency.com email), CC (underwriter email — uiuxAdmin@solaris.com), Subject (pre-filled: "Quote Proposal — SN129105 — Test — $486.00"), Body (pre-filled multi-line with insured, effective date, limits, premium); Attach: toggle chips for QuoteProposal (pre-checked) and RatingWorksheet; Send button → 1200ms async loading → toast "Quote sent to Michael Grant at Hawthorne Risk Advisors, LLC"; modal closes

### SubmissionDetail — Automated Banners
1. Quote expiry alert banner — if a submission has status "Offered" and a quote effectiveDate within 30 days of today (March 2026), show an amber banner at top of QuoteSummaryPage: "Quote expires in X days — bind or extend before [date]"; Extend (toast) and Dismiss buttons
2. Need-By countdown chips — in SubmissionsPage and Dashboard table, the "Need By" column cell gets a color-coded chip overlay: >7 days = sage, 3–7 days = amber, <3 days = crimson, overdue = crimson + "OVERDUE" text (using current date March 6, 2026 as base)
3. Clearance overdue banner — in ClearancePage pending queue, if a submission's createdDate is >3 days ago and still in Clearance, show a small crimson "Overdue X days" chip next to the submission name

### SubmissionsPage — Renewal Indicators
1. Add "Renewal Due" column visible only when transactionType filter = "RENEWAL" — shows days until expiration date with color coding (same sage/amber/crimson thresholds as need-by)
2. Renewal batch action — when multiple RENEWAL rows selected in bulk, bulk toolbar adds "Start Renewals" button that shows a toast "X renewal submissions initiated"

---

## Verification Checklist (Batches F–J)

| Route / Component | Key checks |
|-------------------|-----------|
| Sidebar | Count badge on Clearance; + button opens NewSubmissionModal; active SN chip; user dropdown |
| TopBar | Notifications panel opens/closes; mark all read clears dot; Global search ⌘K opens palette; user dropdown |
| `/submissions/:id` | 5 tabs (Clearance, Account, GL Policy, Quotes, Claims); status timeline visible |
| `/submissions/:id?tab=clearance` | Status workflow timeline; risk score; flag toggle; prior policy search (Batch E + G) |
| `/quotes/Q00-0014019-00` | Rating tab shows ratingWorksheet data; Forms tab shows scheduleForms; binder doc after bind; Send to Agent modal |
| `/quotes/:id` (Quotes tab in submission) | All 3 quote versions listed; clicking navigates to QuoteSummaryPage |
| `/analytics` | Renewal pipeline panel; Loss Ratio by Class bars with threshold; UW table; Combined Ratio chart; Email Report modal |
| `/` Dashboard | My Tasks widget; task check-off works; Add Task modal; need-by color chips in table |
| `/submissions` | Need-by color chips; Renewal Due column when filtered; Renewal batch action |
| `/clearance` | Overdue X days chip on stale submissions |
| All pages | 0 console errors |
