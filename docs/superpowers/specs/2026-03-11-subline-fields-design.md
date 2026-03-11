# Subline-Specific Fields & Badge Fix — Design Spec
**Date:** 2026-03-11
**Status:** Approved
**Scope:** Badge.jsx fix + Step2_RiskCoverage.jsx subline fields (Liquor, OCP, Railroad)

---

## 1. Fix: StatusBadge 'Issued' Color

**File:** `src/components/ui/Badge.jsx`
**Change:** Add `'Issued': 'bg-ink-100 text-ink-700 ring-ink-200'` to `statusColors`.
**Why:** 'Issued' falls back to stone/grey without this entry.

---

## 2. Subline-Specific Fields in Step 2

### Architecture
- Conditional visibility driven by `data.subline` (already read from same data object)
- New fields added to `Step2_RiskCoverage.jsx` inline — no new files
- Policy Limits card adapts labels/visible rows per subline
- Deductibles card adapts rows per subline
- A new subline-detail Card appears when Liquor / OCP / Railroad is selected

### Subline Flag Logic (extends existing)
```js
const showLiquor    = sl === 'Liquor'
const showOCP       = sl === 'Owners and Contractors'
const showRailroad  = sl === 'Railroad'
const showSpecial   = showLiquor || showOCP || showRailroad
```

---

## 3. Liquor Liability — "Liquor Liability Details" Card

| Field | Type | Key |
|---|---|---|
| Type of Liquor License | Select: Beer & Wine Only / Full Liquor / BYOB Permitted / Temporary Permit | `liquorLicenseType` |
| Type of Establishment | Select: Bar/Tavern / Restaurant / Hotel/Motel / Liquor Store / Nightclub / Fraternal/Social Club / Catering | `liquorEstabType` |
| % of Gross Receipts from Alcohol | Number + % suffix (0–100) | `liquorAlcoholPct` |
| Annual Gross Receipts | $ input | `liquorGrossReceipts` |
| Number of Seats | Number input | `liquorSeats` |
| BYOB Permitted? | Toggle | `liquorBYOB` |
| Open Past Midnight? | Toggle | `liquorOpenPastMidnight` |
| Happy Hour Promotions? | Toggle | `liquorHappyHour` |
| Live Entertainment? | Toggle | `liquorLiveEntertainment` |

**Policy Limits adaptations (Liquor):** hide Products/Comp Ops Aggregate row
**Deductibles adaptations (Liquor):** replace Prem/Ops + Prod/Comp rows with single "Liquor BI / PD" row

---

## 4. Owners & Contractors Protective (OCP) — "OCP Project Details" Card

| Field | Type | Key |
|---|---|---|
| Contractor / Subcontractor Name | Text (required) | `ocpContractorName` |
| Type of Operations | Select: General Contracting / Plumbing / Electrical / HVAC / Roofing / Excavation / Demolition / Other | `ocpOperationsType` |
| Project Description | Textarea | `ocpProjectDescription` |
| Project Location Address | Text | `ocpProjectAddress` |
| Estimated Total Cost of Operations | $ input | `ocpEstimatedCost` |
| Project Start Date | Date | `ocpStartDate` |
| Project Completion Date | Date | `ocpEndDate` |

**Policy Limits adaptations (OCP):** hide Med Payments, Damage to Rented Premises, Personal & Adv Injury; rename "General Aggregate Limit" → "OCP Aggregate Limit"
**Deductibles adaptations (OCP):** single "OCP BI / PD" row

---

## 5. Railroad Protective Liability — "Railroad Project Details" Card

| Field | Type | Key |
|---|---|---|
| Railroad Company Name | Text (required) | `rrCompanyName` |
| Type of Operations Near Railroad | Select: Construction / Maintenance / Repair / Demolition / Excavation / Pipeline / Utility Work | `rrOperationsType` |
| Location of Operations | Text | `rrOperationsLocation` |
| Distance from Active Rail (ft) | Number (amber warning if < 50) | `rrDistanceFeet` |
| Estimated Duration (months) | Number | `rrDurationMonths` |
| Estimated Cost of Work Near Railroad | $ input | `rrEstimatedCost` |
| Any Work Within 50 Feet of Tracks? | Toggle (amber alert if Yes) | `rrWithin50Feet` |

**Policy Limits adaptations (Railroad):** hide Med Payments, Damage to Rented Premises; keep Each Occurrence + General Aggregate + Personal & Adv Injury
**Deductibles adaptations (Railroad):** single "Railroad BI / PD" row

---

## 6. Files Changed
- `src/components/ui/Badge.jsx` — 1 line added
- `src/components/submission/lob/Step2_RiskCoverage.jsx` — subline cards + adapted Policy Limits/Deductibles

## 7. No Changes Needed
- `Step3_Locations.jsx` — classification fields already complete per TC review
- All other files unchanged
