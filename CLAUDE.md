# GL PAAs — Codebase Instructions & Workflow Rules

## Tech Constraints (NON-NEGOTIABLE)

- React 18 + Vite + Tailwind CSS v3 + React Router v6
- **NO external chart libraries** — pure CSS flexbox + inline styles only for all charts/bars
- Icons: `lucide-react` only
- Custom palette: `ink`, `flame`, `stone`, `sage`, `amber`, `crimson` (defined in tailwind.config.js)
- `font-mono` for ALL numbers, premiums, IDs, codes, percentages in tables
- All mock data hardcoded in `src/data/mockData.js` — async via `setTimeout` only
- **Must maintain 0 console errors** at all times
- No TypeScript — plain JSX only
- No new npm packages — use only what's already installed

---

## Real PAAs Workflow Rules (from brainstorming)

These rules reflect real GL insurance PAAs business logic. All implementations MUST follow them.

### 1. Progressive Step Gating (Q1 — Decision C)
- Steps in the submission workflow are **progressive unlock**: each step is grey and locked until the prior step is fully complete.
- The **"Rate & Quote"** button/action is HIDDEN until ALL 3 steps (Clearance + Account + GL Policy) are saved/complete.
- Visual state: locked step = grey circle with lock icon; completed step = sage circle with checkmark; active step = flame circle.

### 2. Clearance Completion Definition (Q2 — Decision C)
- Clearance is complete when: Agency + Agent + Effective Date are filled AND clearance check passes AND user clicks **"Confirm & Proceed"**.
- Once confirmed, clearance is **permanently locked** — no editing ever.
- Status indicator: green "Cleared" badge, locked icon.

### 3. Account Completion Definition (Q3 — Decision C)
- Account is complete when ALL of these are filled AND user clicks **"Save Account"**:
  - Account Name
  - Legal Entity type
  - State
  - FEIN (format: XX-XXXXXXX)
  - Phone AND Email
  - At least 1 Named Insured
  - At least 1 Contact
- Account tab remains editable after saving. Re-saving triggers a re-rating warning toast.

### 4. GL Policy Completion Definition (Q4 — Decision C)
- GL Policy is complete when ALL of these are filled AND user clicks **"Save & Rate"**:
  - Underwriter assigned
  - Coverage Form selected
  - Loss Run Years value
  - Carrier Loss Runs value
  - Each Occurrence Limit
  - ERC (Experience Rate Modifier)
  - At least 1 Location (with State and Zip)
  - At least 1 Classification (with Exposure > 0)
- GL Policy tab remains editable after saving. Re-saving triggers re-rating warning toast.

### 5. Quote Generation Flow (Q5 — Decision B)
- "Rate & Quote" button → **Rating Results screen** (shows live rating breakdown).
- From Rating Results, user clicks **"Generate Quote"** → QuoteSummaryPage opens in `[Draft]` status.
- From Draft, UW clicks **"Offer Quote"** → status becomes `[Offered]`.
- Quote version increments each time Generate Quote is clicked: `-00`, `-01`, `-02`.

### 6. Transaction Type Differentiation (Q6 — Decision B)
- **NEW BUSINESS (NB)**: Full flow — Clearance → Account → GL Policy → Rate → Quote → Bind → Issue.
- **RENEWAL**: Skip clearance step. Account + GL Policy are pre-filled from prior term. UW reviews and updates.
- **ENDORSEMENT**: Skip clearance + account steps. Only GL Policy tab shown with changed fields highlighted in **amber**. Auto-generates endorsement document on save.

### 7. Binding Workflow (Q7 — Decision C)
- Before binding, ALL pre-bind subjectivities must be satisfied.
- Binding modal requires:
  - Payment Plan selection
  - Surplus Lines acknowledgment
  - **UW Certification checkbox** (mandatory)
- On bind: Bind Confirmation modal shows; status → `Bound`; Binder document auto-generated.

### 8. Document Auto-Generation (Q8 — Decision B)
- Documents are auto-generated at these events:
  - **Generate Quote**: QuoteProposal + RatingWorksheet
  - **Offer Quote**: (marks docs as "Offered" version)
  - **Bind Policy**: Binder + Policy document
  - **Save Endorsement**: Endorsement document
- Each newly generated doc shows a **"NEW" badge** that fades after 5 seconds.

### 9. Step Editability (Q9 — Custom Decision)
- **Clearance**: Permanently locked after "Confirm & Proceed". Cannot be edited.
- **Account tab**: Always editable. Re-saving after a quote exists triggers: "Re-rating required. Any existing quotes will be marked as Draft." warning toast.
- **GL Policy tab**: Always editable. Same re-rating warning on re-save.
- **QuoteSummaryPage**: Always editable (can re-rate, re-generate quotes).

### 10. Quote Expiry (Q10 — Decision B)
- Offered quotes expire **30 days** from the Offer date.
- Status → `[Expired]` automatically on expiry date.
- An amber countdown banner appears on QuoteSummaryPage when < 30 days remain: "Quote expires in X days — bind or extend before [date]"
- **"Re-offer"** button resets the 30-day clock.
- Dashboard "Needs Attention" surfaces expiring quotes.

### 11. Status Auto-Progression (Q11 — Decision B modified)
- Workflow steps (Clearance, Account, GL Policy input) all show status = **"In Progress"** (not "Registered").
- Status auto-updates at key events:
  - Offer Quote → `Offered`
  - Bind Policy → `Bound`
  - Issue Policy → `Issued`
  - Quote expiry → `Expired`
  - Decline Quote → `Declined`
- Pipeline strip on SubmissionsPage and Dashboard reflects live counts.

### 12. Unsaved Changes Guard (Q12 — Decision C)
- When navigating away from **Account tab** or **GL Policy tab** with unsaved changes, show an in-app modal:
  - Title: "Unsaved Changes"
  - Body: "You have unsaved changes. What would you like to do?"
  - Buttons: **"Stay & Save"** (saves then stays) | **"Leave Anyway"** (discards and navigates)
- Do NOT use browser `beforeunload` — custom in-app modal only.

### 13. Quote Versioning (Q13 — Decision C)
- Each time "Generate Quote" is clicked, a new version is created: `Q00-0014019-00`, `-01`, `-02`, etc.
- Only the **latest Offered or Bound** quote is the active quote.
- **"Clone Quote"** button allows creating a parallel version (e.g., for different limit options).
- All versions are visible in the Quotes tab of SubmissionDetail.

### 14. Policy Issuance (Q14 — Decision B)
- **"Issue Policy"** button is only visible to roles: `Senior UW` and `uiuxAdmin`.
- Clicking Issue Policy:
  - Assigns policy number: `POL-XXXXXXX` (e.g., `POL-0014019`)
  - Auto-generates Policy document
  - Status → `Issued`
  - Policy # shown in header meta strip as amber badge in font-mono

---

## Submission Workflow States

```
In Progress → (Offer Quote) → Offered → (Bind) → Bound → (Issue Policy) → Issued
                                      ↘ (Decline) → Declined
                                      ↘ (30 days) → Expired
```

---

## Batch Implementation Plan

### Wave 1 (all independent — launch in parallel)

| Batch | Files | Agent |
|-------|-------|-------|
| A-sub | SubmissionsPage.jsx | react-specialist |
| B | ClearancePage.jsx + FindPolicyPage.jsx | frontend-developer |
| C | AccountsPage.jsx + DocumentsPage.jsx | ui-designer |
| D | AnalyticsPage.jsx + ActivityLogPage.jsx | fullstack-developer |
| F | Sidebar.jsx + TopBar.jsx | frontend-developer |
| H | mockData.js | javascript-pro |

### Wave 2 (after Wave 1 — sequential due to shared files)

| Batch | Files | Agent | Dependency |
|-------|-------|-------|------------|
| E | SettingsPage + HelpPage + QuoteSummaryPage(subjectivities) + ClearanceTab | ui-designer | none |
| G | SubmissionDetail(Quotes tab+timeline) + QuoteSummaryPage(Rating+Forms+binder tabs) | fullstack-developer | H must finish first |
| I | AnalyticsPage (advanced sections) | react-specialist | D must finish first |
| J | Dashboard(tasks) + QuoteSummaryPage(send) + banners + SubmissionsPage(renewal) | ui-designer | G must finish first |

---

## Key File Paths

```
src/
  data/mockData.js              ← ALL mock data here
  pages/
    Dashboard.jsx               ← COMPLETE (Batch A done)
    SubmissionsPage.jsx
    ClearancePage.jsx
    FindPolicyPage.jsx
    AccountsPage.jsx
    DocumentsPage.jsx
    AnalyticsPage.jsx
    ActivityLogPage.jsx
    QuoteSummaryPage.jsx
    SettingsPage.jsx
    HelpPage.jsx
  components/
    layout/
      Sidebar.jsx
      TopBar.jsx
    submission/
      SubmissionDetail.jsx      ← 3-tab stepper host
      ClearanceTab.jsx
      lob/
        LOBTab.jsx              ← 3-step wizard
        Step1_SubmissionInfo.jsx
        Step2_RiskCoverage.jsx
        Step3_Locations.jsx
    dashboard/
      Dashboard.jsx             ← COMPLETE
    ui/
      Button.jsx
      Toast.jsx
      Modal.jsx (if exists)
```

---

## Color / Style Reference

| Semantic Use | Tailwind Class |
|---|---|
| Active/CTA | `flame-500`, `flame-600` |
| Success/Complete | `sage-500`, `sage-600` |
| Warning/Expiry | `amber-500`, `amber-600` |
| Error/Overdue | `crimson-500`, `crimson-600` |
| Neutral UI | `stone-100` through `stone-900` |
| Dark text | `ink-900`, `ink-700` |
| Numbers/IDs | `font-mono` |

---

## Current Date for Mock Data

Use **March 9, 2026** as "today" for all date calculations (need-by chips, expiry countdowns, overdue flags, etc.)

---

## Implemented Patterns (Reference)

### Bind → Issue Policy Flow (QuoteSummaryPage.jsx)
- `BindModal`: Payment Plan dropdown + Surplus Lines checkbox + UW Certification checkbox. Both checkboxes required — button disabled until both checked. 900ms async on confirm.
- `IssueModal`: Shows `SSIC-GLN02-0014019-26` amber pill, Preview Issuance / Issue / Discard buttons. 1000ms async on issue.
- State machine: `offered → bound → issued`. `declined` is a side branch from offered.
- After bind: `bound=true`, `binderDoc` created, "Issue Policy" button appears in header + Premium card.
- After issue: `issued=true`, `policyDoc` created (type: PolicyIssuance), ink-color banner + badge, terminal state.
- Status badge values: 'Offered' | 'Bound' | 'Issued' | 'Declined'
- Mock policy numbers: `POL-0014019` (bound binder), `SSIC-GLN02-0014019-26` (issued policy)

### Classification Validation (LOBTab.jsx)
- On "Save & Rate" (step 3 final): iterate `data.stateSchedule → locations → classifications`
- If any location has 0 classifications: `toast.error('Classifications required', 'Add at least 1 classification to: ...')`
- Block navigation — do NOT proceed to browse/rating.

### Classification UX (Step3_Locations.jsx)
- NO expand-row chevron pattern. Classifications managed via modal only.
- Empty state: amber dashed button `<AlertTriangle /> Add Classification`
- Filled state: sage pill showing count `<Check /> N classes`
- Both buttons open `ManageClassificationsModal` via `openManageModal(stateId, locId)`
- CLASS_COVERAGES_CATALOG has 12 items (7 original + 5 from TC Excel)

### Submission Type Lock (NewSubmissionModal.jsx)
- Submission Type is read-only display `NEW-BUSINESS` — not a dropdown
- `submissionType: 'NEW-BUSINESS'` hardcoded in form state
- Helper text: "Renewals & endorsements are created from existing policies."

### Rating Page Fields (ProductBrowsePage.jsx)
- LOB: `const lob = submission.linesOfBusiness?.[0] || 'General Liability'` — read-only display
- Primary State: `const primaryEntry = glPolicy.stateSchedule?.find(s => s.isPrimary) || glPolicy.stateSchedule?.[0]` — read-only display
- These are NEVER dropdowns — always static text from submission data.

---

## Step 2 Subline Field Parity — Pending Implementation

### Subline 1: Premises/Operations and Products/Completed Operations (STANDARD)

Changes needed to `Step2_RiskCoverage.jsx`:

**Add constants:**
- `const personalInjuryLimits = ['100,000', '300,000', '500,000', '1,000,000', '2,000,000']`
- `const yesNoOpts = ['No', 'Yes']`

**Policy Limits card — field order (match old Solartis):**
1. Each Occurrence Limit * (Select)
2. Medical Payments Exclusion for Entire Policy (Yes/No Select) — shown before Med Pay Limit, hide for OCP/Railroad
3. Medical Payments Limit (Select, hide for OCP/Railroad)
4. Personal and Advertising Injury Limit (change from `<Input>` to `<Select options={personalInjuryLimits}>`, hide for OCP)
5. General Aggregate Limit * (Select)
6. Products/Comp Ops Aggregate (Select, conditional on showProdComp)
7. Damage to Premises Rented (Input, hide for OCP/Railroad) — keep as-is

**After Coverage Form — add:**
- Condominium Association (Yes/No Select) — key: `condominiumAssociation`, default 'No'
- Change Coverage Form + Condominium Association layout: `grid grid-cols-2 gap-4` (remove `max-w-xs`)

**Data keys:**
- Med Pay Exclusion: `medPayExclusionPolicy` (separate from existing `medPayExclusion` toggle in flags)
- Condominium Association: `condominiumAssociation`
- Personal Injury Limit: existing `personalAdvInjuryLimit` key, just change to Select

### Subline 2: Premises/Operations ONLY

Differences from Subline 1 (additional conditional logic needed):

- **Limited Product Withdrawal Coverage** — only show when `showProdComp` is true (hide for Prem/Ops only)
  - Currently it's always visible in Coverage Flags collapsible — needs `showProdComp` guard
- **Minimum Premium** — only show `premOpsMinimum` + `policyMinimum`; hide `prodCompOpsMinimum` + `specialCombinedMinimum` when `!showProdComp`
- Products/Comp Ops Aggregate: already hidden by `showProdComp` ✓
- Prod/Comp deductible rows: already hidden by `showProdComp` ✓

**Implementation note:** In Coverage Flags toggles array, wrap `limitedProductWithdrawal` in `{showProdComp && ...}` or conditionally exclude it. In Minimum Premium collapsible, wrap Prod/Comp and Special Combined inputs with `{showProdComp && ...}`.

### Subline 3: Products/Completed Operations ONLY

Key differences from Subline 1 reveal additional conditional logic needed:

**New flag to add:**
```js
const showProdCompOnly = sl === 'Products/Completed Operations'
```

**Fields that only show when `showPremOps` (= Prem/Ops or Prem/Ops+Prod/Comp):**
- Governmental Subdivision — currently always visible in Coverage Flags; add `showPremOps` guard
- Medical Payments Exclusion for Entire Policy — use `showPremOps` (not just `!showOCP && !showRailroad`)
- Medical Payments Limit — use `showPremOps`
- Personal and Advertising Injury Limit — use `showPremOps`
- Condominium Association — use `showPremOps`
- Limited Coverage For Designated Unmanned Aircraft — use `showPremOps`

**Aggregate Limit logic (critical change):**
- "General Aggregate Limit" → hide when Prod/Comp only → condition: `!showProdCompOnly` (show for all except Prod/Comp only)
- "Products/Comp Ops Aggregate" → show when `showProdComp` (already correct) — for Prod/Comp only, this is the ONLY aggregate shown

**Minimum Premium per subline:**
- `premOpsMinimum` → show when `showPremOps`
- `prodCompOpsMinimum` → show when `showProdComp`
- `specialCombinedMinimum` → show when `showPremOps && showProdComp` (Prem/Ops + Prod/Comp combined only)
- `policyMinimum` → always show

**Note from user:** Common fields (State, Revenue, OSHA, Commission, etc.) are fixed — only subline-specific sections adapt when subline changes. This is already the component's pattern.

### Subline 4: Liquor

Critical differences from standard sublines:

**Limit label changes (when `showLiquor`):**
- "Each Occurrence Limit" → **"Each Common Cause Limit"** (no CSL suffix)
- "General Aggregate Limit" → **"Aggregate Limit"** (no CSL suffix)
- Need separate constants: `liquorOccurrenceLimits` (same numbers as occurrenceLimits but without ' CSL') and `liquorAggLimits` (same numbers as aggLimits but without ' CSL')

**Deductible:** Single "Deductible" field (NOT separate BI/PD columns)
- Current code has showLiquor row with BI + PD columns — change to single dropdown
- New key: `liquorDeductible` (replace `liquorBI` + `liquorPD`)

**Minimum Premium label:** "Liquor Premium To Reach Minimum" (key: `liquorMinimum`)

**Additional conditional logic revealed:**
- **Size Of Risk Rating** — absent for Liquor → condition must be `!showSpecial` (show for all 3 standard sublines, hide for Liquor/OCP/Railroad)
- **Damage to Premises Rented** — absent for Liquor → change condition from `!showOCP && !showRailroad` to `showPremOps` (since it only appears for Prem/Ops sublines)

**Fields present in Liquor (same as standard):**
- Post-Bind Loss Control Override, Subline, Coverage Form, Legal Entity ✓
- Experience Rating, Schedule Rating, TRIP, Accept Terrorism, Composite Rating ✓
- Liquor Liability Details card (already implemented) ✓

**Fields absent for Liquor (already handled or need fix):**
- Governmental Subdivision → `showPremOps` ✓
- Limited Product Withdrawal → `showProdComp` ✓
- Size Of Risk Rating → change to `!showSpecial` (NEW fix)
- Medical Payments fields → `showPremOps` ✓ (already `!showOCP && !showRailroad`, add `&& !showLiquor` OR use `showPremOps`)
- Personal & Adv Injury → `showPremOps` ✓
- Condominium Association → `showPremOps` ✓
- Damage to Rented Premises → change to `showPremOps` (NEW fix)

### Subline 5: OCP (Owners and Contractors)

Critical differences from standard sublines:

**Limit label changes (when `showOCP`):**
- "Each Occurrence Limit" → **"Each Occurrence Limit"** (no CSL suffix — same as Liquor pattern)
- "OCP Aggregate Limit" → **"Aggregate Limit"** (no CSL suffix — already renamed but needs no-CSL values)
- Need separate constants: `ocpOccurrenceLimits` and `ocpAggLimits` (same numbers but without ' CSL')
- The numbers appear to be the same range as standard limits

**Global Legal Entity — EXPANDED list** (replace current 7-item  used everywhere — applies to ALL sublines, clearance, account, Named Insured cards everywhere):
```js
const legalEntityOpts = [
  'Association', 'Corporation', 'C Corporation', 'S Corporation', 'Domestic Profit Corporation',
  'Foreign Corporation', 'Foreign Limited Liability Company', 'Foreign Limited Partnership',
  'General Partnership', 'Governmental Unit', 'Individual', 'Joint Venture', 'Limited Corporation',
  'Limited Liability Company', 'Limited Liability Partnership', 'Limited Partnership',
  'Nonprofit Corporation', 'Partnership', 'Professional Corporation', 'Religious Organization',
  'Sole Proprietor', 'Other',
]
```
Single global constant — no per-subline variants needed.

**Minimum Premium label:** "Owners and Contractors Premium To Reach Minimum" (key: `ocpMinimum`) + `policyMinimum`

**Fields present for OCP (same as standard):**
- Post-Bind Loss Control Override, Subline, Coverage Form ✓
- OCP Named Insured Details (Name, Address 1/2, City, State, Zip, Legal Entity) — already implemented ✓
- Experience Rating, Schedule Rating, TRIP, Accept Terrorism, Composite Rating ✓
- OCP Project Details card (already implemented) ✓

**Fields absent for OCP (already handled):**
- Med Pay, Damage to Rented, Personal & Adv Injury → already guarded in previous session ✓
- Products/Comp Ops Aggregate → `showProdComp` ✓
- Deductible rows → already have OCP-specific BI+PD rows ✓

### Subline 6: Railroad

Critical differences from standard sublines:

**Limit label changes (when `showRailroad`):**
- "Each Occurrence Limit" (no CSL suffix)
- "Aggregate Limit" (no CSL suffix)
- **Different occurrence limit values** (not same as standard):
  ```js
  const rrOccurrenceLimits = ['25,000','50,000','100,000','150,000','300,000','500,000','1,000,000','1,500,000','2,000,000']
  ```
  Note: 150,000 (not 200,000), stops at 2,000,000 (no 3M/4M/5M/10M)
- **Aggregate Limit is AUTO-COMPUTED (read-only display)** — always 3× the Each Occurrence Limit (e.g. 1,000,000 → 3,000,000; 2,000,000 → 6,000,000). Render as disabled input showing the computed value.

**Minimum Premium label:** "Railroad Premium To Reach Minimum" (key: `rrMinimum`) + `policyMinimum`

**Named Insured Details:** Same "OCP/Railroad Named Insured Details" section heading for both OCP and Railroad.

**Fields present for Railroad (same as OCP):**
- Post-Bind Loss Control Override, Subline, Coverage Form ✓
- OCP/Railroad Named Insured Details (Name, Address 1/2, City, State, Zip, Legal Entity) ✓
- Experience Rating, Schedule Rating, TRIP, Accept Terrorism, Composite Rating ✓
- Railroad Project Details card (already implemented) ✓

**Fields absent for Railroad (already handled):**
- Med Pay, Damage to Rented, Personal & Adv Injury → already guarded ✓

---

### Global: Post-Bind Loss Control Override — FULL OPTIONS

Replace current options (likely just 'Not Applicable') with full 9-item list:
```js
const lossControlOpts = [
  'Require Loss Control',
  'Waive Loss Control Requirement',
  'Not Applicable',
  'Other Require Loss Control',
  'Not Required Loss Control',
  'Require Loss Reduction',
  'Require Risk Control',
  'Live Require Risk Control',
  'Live Require Loss Reduction',
]
```

---

### Global UI Changes (from final review)

**Minimum Premium section:**
- Old system: labels only (no editable inputs) — just text showing the label names
- New system: currently has dollar `$` input fields
- **Change: Remove input fields, render just the label text rows (read-only display)**
- Per-subline labels still apply (e.g. "Railroad Premium To Reach Minimum", "Liquor Premium To Reach Minimum", etc.)

**Loss Control Requirements collapsible:**
- Old system: Post-Bind Loss Control Override is a top-level field (already at top of form in new system)
- The "Loss Control Requirements" collapsible in new system is a duplicate/unnecessary section
- **Remove the Loss Control Requirements collapsible entirely**
- Post-Bind Loss Control Override stays as top-level field with correct 9-option list
