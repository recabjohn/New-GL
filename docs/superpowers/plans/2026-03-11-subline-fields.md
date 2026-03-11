# Subline Fields & Badge Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix missing 'Issued' status badge color and add Liquor / OCP / Railroad subline-specific fields to Step 2 of the GL Policy wizard.

**Architecture:** Two isolated file changes. Badge.jsx gets one new entry in its statusColors map. Step2_RiskCoverage.jsx gains three conditional cards (one per special subline) plus adapts its existing Policy Limits and Deductibles cards based on the selected subline value.

**Tech Stack:** React 18, Tailwind CSS v3 (custom palette: ink/flame/stone/sage/amber/crimson), lucide-react icons, plain JSX (no TypeScript). No test framework — verify visually in the browser dev server (`npm run dev`).

**Spec:** `docs/superpowers/specs/2026-03-11-subline-fields-design.md`

---

## Chunk 1: Badge Fix

### Task 1: Add 'Issued' to StatusBadge color map

**Files:**
- Modify: `src/components/ui/Badge.jsx:1-8`

- [ ] **Step 1: Open Badge.jsx and locate statusColors**

  File: `src/components/ui/Badge.jsx`

  The `statusColors` object at the top of the file currently has 6 entries ending with `'Bound'`. It is missing `'Issued'`.

- [ ] **Step 2: Add the Issued entry**

  Add one line inside `statusColors` after `'Bound'`:

  ```js
  const statusColors = {
    'In Progress': 'bg-amber-100 text-amber-700 ring-amber-200',
    'Offered':     'bg-sage-50 text-sage-700 ring-sage-200',
    'Registered':  'bg-ink-50 text-ink-700 ring-ink-200',
    'Clearance':   'bg-flame-50 text-flame-700 ring-flame-200',
    'Cancelled':   'bg-crimson-50 text-crimson-700 ring-crimson-200',
    'Bound':       'bg-sage-100 text-sage-800 ring-sage-300',
    'Issued':      'bg-ink-100 text-ink-700 ring-ink-200',
  }
  ```

- [ ] **Step 3: Verify visually**

  In the running dev server, navigate to any submission that has been issued (`QuoteSummaryPage`). Confirm the status badge renders with ink (dark blue/navy) color instead of grey stone.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/ui/Badge.jsx
  git commit -m "fix: add Issued status badge ink color"
  ```

---

## Chunk 2: Step 2 Subline Fields

### Task 2: Add subline flag logic and Liquor Liability card

**Files:**
- Modify: `src/components/submission/lob/Step2_RiskCoverage.jsx`

**Context:** The file already has this comment at line ~126:
```js
// Subline-driven field visibility (Liquor/OCP/Railroad handled separately later)
const sl = data.subline || ''
const showPremOps  = ...
const showProdComp = ...
```
Extend the flags and add the Liquor card below the Policy Limits card.

- [ ] **Step 1: Extend the subline flag block**

  Find the existing flag block (around line 126) and extend it:

  ```js
  const sl = data.subline || ''
  const showPremOps  = !sl || sl === 'Premises/Operations and Products/Completed Operations' || sl === 'Premises/Operations'
  const showProdComp = !sl || sl === 'Premises/Operations and Products/Completed Operations' || sl === 'Products/Completed Operations'
  const showLiquor   = sl === 'Liquor'
  const showOCP      = sl === 'Owners and Contractors'
  const showRailroad = sl === 'Railroad'
  const showSpecial  = showLiquor || showOCP || showRailroad
  ```

- [ ] **Step 2: Add Liquor constants at the top of the file (with other constants)**

  After the existing `ADDITIONAL_COVERAGES_CATALOG` constant, add:

  ```js
  const liquorLicenseOpts  = ['Beer & Wine Only', 'Full Liquor', 'BYOB Permitted', 'Temporary Permit']
  const liquorEstabOpts    = ['Bar/Tavern', 'Restaurant', 'Hotel/Motel', 'Liquor Store', 'Nightclub', 'Fraternal/Social Club', 'Catering']
  const ocpOperationsOpts  = ['General Contracting', 'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Excavation', 'Demolition', 'Other']
  const rrOperationsOpts   = ['Construction', 'Maintenance', 'Repair', 'Demolition', 'Excavation', 'Pipeline', 'Utility Work']
  ```

- [ ] **Step 3: Replace the Policy Limits grid to adapt per subline**

  Locate the `<div className="grid grid-cols-2 gap-4">` block inside the Policy Limits `<Card>` (currently lines ~203–210 of `Step2_RiskCoverage.jsx`). **Replace the entire grid div** with:

  ```jsx
  <div className="grid grid-cols-2 gap-4">
    <Select label="Each Occurrence Limit *" required searchable options={occurrenceLimits} value={data.eachOccurrenceLimit} onChange={v => set('eachOccurrenceLimit', v)} />
    <Select
      label={showOCP ? 'OCP Aggregate Limit *' : 'General Aggregate Limit *'}
      required searchable options={aggLimits}
      value={data.generalAggregateLimit} onChange={v => set('generalAggregateLimit', v)}
    />
    {showProdComp && (
      <Select label="Products/Comp Ops Aggregate" searchable options={aggLimits} value={data.prodCompOpsAggregateLimit} onChange={v => set('prodCompOpsAggregateLimit', v)} />
    )}
    {!showOCP && !showRailroad && (
      <Select label="Medical Payments Limit" searchable options={medPayLimits} value={data.medPayLimit} onChange={v => set('medPayLimit', v)} />
    )}
    {!showOCP && !showRailroad && (
      <Input label="Damage to Premises Rented" value={data.damageToRentedPremisesLimit} onChange={e => set('damageToRentedPremisesLimit', e.target.value)} prefix="$" />
    )}
    {!showOCP && (
      <Input label="Personal &amp; Adv Injury" value={data.personalAdvInjuryLimit} onChange={e => set('personalAdvInjuryLimit', e.target.value)} prefix="$" />
    )}
  </div>
  ```

  Note: labels kept identical to existing code (`"Damage to Premises Rented"`, `"Personal &amp; Adv Injury"`) to avoid unintended search-replace issues.

- [ ] **Step 4: Adapt Deductibles card rows**

  The existing deductibles table has Prem/Ops and Prod/Comp rows (already conditional on `showPremOps` / `showProdComp`) plus a **Combined BI&PD** row at the bottom. When a special subline is active, `showPremOps` and `showProdComp` are both false, leaving the Combined row rendering an empty `<td>` with an empty grid. Fix: wrap the entire Combined row with `{!showSpecial && (...)}`.

  Locate the Combined BI&PD `<tr>` (last row of the deductibles `<tbody>`) and wrap it:

  ```jsx
  {!showSpecial && (
    <tr>
      <td className="px-4 py-3 text-xs font-semibold text-stone-600">Combined BI&amp;PD</td>
      <td className="px-3 py-2" colSpan={2}>
        <div className="grid grid-cols-2 gap-2">
          {showPremOps  && <Select searchable options={deductibleOptions} value={data.premOpsBIandPD}     onChange={v => set('premOpsBIandPD', v)} />}
          {showProdComp && <Select searchable options={deductibleOptions} value={data.prodCompOpsBIandPD} onChange={v => set('prodCompOpsBIandPD', v)} />}
        </div>
      </td>
    </tr>
  )}
  ```

  Then add three new rows for the special sublines **inside the `<tbody>`**, only one of which will show at a time:

  ```jsx
  {showLiquor && (
    <tr>
      <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">Liquor Liability</td>
      <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.liquorBI} onChange={v => set('liquorBI', v)} /></td>
      <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.liquorPD} onChange={v => set('liquorPD', v)} /></td>
    </tr>
  )}
  {showOCP && (
    <tr>
      <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">OCP</td>
      <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.ocpBI} onChange={v => set('ocpBI', v)} /></td>
      <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.ocpPD} onChange={v => set('ocpPD', v)} /></td>
    </tr>
  )}
  {showRailroad && (
    <tr>
      <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">Railroad</td>
      <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.railroadBI} onChange={v => set('railroadBI', v)} /></td>
      <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.railroadPD} onChange={v => set('railroadPD', v)} /></td>
    </tr>
  )}
  ```

- [ ] **Step 5: Add Liquor Liability Details card**

  Insert this Card **after** the Policy Limits card and **before** the Deductibles card. It only renders when `showLiquor` is true:

  ```jsx
  {showLiquor && (
    <Card title="Liquor Liability Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type of Liquor License" required
            options={liquorLicenseOpts}
            value={data.liquorLicenseType}
            onChange={v => set('liquorLicenseType', v)}
          />
          <Select
            label="Type of Establishment" required
            options={liquorEstabOpts}
            value={data.liquorEstabType}
            onChange={v => set('liquorEstabType', v)}
          />
          <Input
            label="% of Gross Receipts from Alcohol"
            type="number"
            value={data.liquorAlcoholPct ?? ''}
            onChange={e => set('liquorAlcoholPct', e.target.value === '' ? '' : Number(e.target.value))}
            suffix="%"
            placeholder="0–100"
          />
          <Input
            label="Annual Gross Receipts"
            type="number"
            value={data.liquorGrossReceipts ?? ''}
            onChange={e => set('liquorGrossReceipts', e.target.value === '' ? '' : Number(e.target.value))}
            prefix="$"
          />
          <Input
            label="Number of Seats"
            type="number"
            value={data.liquorSeats ?? ''}
            onChange={e => set('liquorSeats', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 120"
          />
        </div>
        <SectionRule color="bg-amber-400">Operating Characteristics</SectionRule>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {[
            ['liquorBYOB',            'BYOB Permitted'],
            ['liquorOpenPastMidnight','Open Past Midnight'],
            ['liquorHappyHour',       'Happy Hour Promotions'],
            ['liquorLiveEntertainment','Live Entertainment'],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700">{label}</span>
              <Toggle checked={!!data[k]} onChange={v => set(k, v)} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )}
  ```

- [ ] **Step 6: Verify Liquor card in browser**

  - In dev server, open a submission → GL Policy tab → Step 2.
  - Change Subline to "Liquor".
  - Confirm: Liquor Liability Details card appears, Products/Comp Ops Aggregate disappears from Policy Limits, Liquor row appears in Deductibles table.
  - Change Subline back to "Premises/Operations and Products/Completed Operations".
  - Confirm: All standard rows restored, Liquor card hidden.

---

### Task 3: OCP Project Details card

**Files:**
- Modify: `src/components/submission/lob/Step2_RiskCoverage.jsx` (continuation)

- [ ] **Step 1: Add OCP Project Details card**

  Insert after the Liquor card (still before Deductibles). Only renders when `showOCP`:

  ```jsx
  {showOCP && (
    <Card title="OCP Project Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contractor / Subcontractor Name" required
            value={data.ocpContractorName || ''}
            onChange={e => set('ocpContractorName', e.target.value)}
            placeholder="e.g. Acme Construction LLC"
          />
          <Select
            label="Type of Operations" required
            options={ocpOperationsOpts}
            value={data.ocpOperationsType}
            onChange={v => set('ocpOperationsType', v)}
          />
          <Input
            label="Project Location Address"
            value={data.ocpProjectAddress || ''}
            onChange={e => set('ocpProjectAddress', e.target.value)}
            placeholder="Street, City, State"
          />
          <Input
            label="Estimated Total Cost of Operations"
            type="number"
            value={data.ocpEstimatedCost ?? ''}
            onChange={e => set('ocpEstimatedCost', e.target.value === '' ? '' : Number(e.target.value))}
            prefix="$"
          />
          <Input
            label="Project Start Date"
            type="date"
            value={data.ocpStartDate || ''}
            onChange={e => set('ocpStartDate', e.target.value)}
          />
          <Input
            label="Project Completion Date"
            type="date"
            value={data.ocpEndDate || ''}
            onChange={e => set('ocpEndDate', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label mb-1.5">Project Description</label>
          <textarea
            rows={3}
            value={data.ocpProjectDescription || ''}
            onChange={e => set('ocpProjectDescription', e.target.value)}
            placeholder="Describe the scope of work and operations…"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
          />
        </div>
      </div>
    </Card>
  )}
  ```

- [ ] **Step 2: Verify OCP card in browser**

  - Change Subline to "Owners and Contractors".
  - Confirm: OCP Project Details card appears; General Aggregate label reads "OCP Aggregate Limit"; Med Payments, Damage to Rented Premises, Personal & Adv Injury fields disappear; OCP row appears in Deductibles.

---

### Task 4: Railroad Project Details card

**Files:**
- Modify: `src/components/submission/lob/Step2_RiskCoverage.jsx` (continuation)

- [ ] **Step 1: Add Railroad Project Details card**

  Insert after the OCP card. Only renders when `showRailroad`:

  ```jsx
  {showRailroad && (
    <Card title="Railroad Project Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Railroad Company Name" required
            value={data.rrCompanyName || ''}
            onChange={e => set('rrCompanyName', e.target.value)}
            placeholder="e.g. Union Pacific Railroad"
          />
          <Select
            label="Type of Operations Near Railroad" required
            options={rrOperationsOpts}
            value={data.rrOperationsType}
            onChange={v => set('rrOperationsType', v)}
          />
          <Input
            label="Location of Operations"
            value={data.rrOperationsLocation || ''}
            onChange={e => set('rrOperationsLocation', e.target.value)}
            placeholder="Street / mile marker / description"
          />
          <div>
            <Input
              label="Distance from Active Rail (ft)"
              type="number"
              value={data.rrDistanceFeet ?? ''}
              onChange={e => set('rrDistanceFeet', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 75"
            />
            {data.rrDistanceFeet !== '' && data.rrDistanceFeet !== undefined && Number(data.rrDistanceFeet) < 50 && (
              <p className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 shrink-0" /> Under 50 ft — additional review required
              </p>
            )}
          </div>
          <Input
            label="Estimated Duration (months)"
            type="number"
            value={data.rrDurationMonths ?? ''}
            onChange={e => set('rrDurationMonths', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 6"
          />
          <Input
            label="Estimated Cost of Work Near Railroad"
            type="number"
            value={data.rrEstimatedCost ?? ''}
            onChange={e => set('rrEstimatedCost', e.target.value === '' ? '' : Number(e.target.value))}
            prefix="$"
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-stone-100 bg-stone-25">
          <div>
            <p className="text-sm font-medium text-stone-800">Any Work Within 50 Feet of Tracks?</p>
            {data.rrWithin50Feet && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                <AlertTriangle className="h-3 w-3 shrink-0" /> Flagged for underwriter review
              </p>
            )}
          </div>
          <Toggle checked={!!data.rrWithin50Feet} onChange={v => set('rrWithin50Feet', v)} />
        </div>
      </div>
    </Card>
  )}
  ```

- [ ] **Step 2: Verify Railroad card in browser**

  - Change Subline to "Railroad".
  - Confirm: Railroad Project Details card appears; enter a distance < 50 — amber warning appears; toggle "Within 50 Feet" — amber alert shows; Med Payments + Damage to Rented rows disappear; Railroad row appears in Deductibles; Personal & Adv Injury remains visible.

- [ ] **Step 3: Verify all sublines restore correctly**

  Switch through all 6 subline options and verify no console errors, no missing/extra fields.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/submission/lob/Step2_RiskCoverage.jsx
  git commit -m "feat: add Liquor/OCP/Railroad subline-specific fields in Step 2"
  ```

---

## Summary

| Task | File | Change |
|---|---|---|
| 1 | `src/components/ui/Badge.jsx` | Add `'Issued'` ink color to `statusColors` |
| 2–4 | `src/components/submission/lob/Step2_RiskCoverage.jsx` | Subline flags + 3 conditional cards + adapted Policy Limits/Deductibles |
