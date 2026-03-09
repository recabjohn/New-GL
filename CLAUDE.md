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
