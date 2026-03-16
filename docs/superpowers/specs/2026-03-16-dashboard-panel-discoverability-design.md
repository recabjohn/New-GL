# Dashboard Right Panel Discoverability — Design Spec

**Date:** 2026-03-16
**Status:** Approved
**File affected:** `src/components/dashboard/Dashboard.jsx`

---

## Problem

The right panel toggle is an icon-only button placed next to the Export button in the dashboard header. New users have no way of knowing what's inside the panel (Needs Attention, Due This Week, Recent Activity, My Tasks).

---

## Solution: A + C Combined

### Change 1 — Toggle Button

Replace the existing icon-only `<button>` at its current position (before Export) with a labeled pill. Same DOM position.

**Closed state:** `PanelRightOpen` icon + "Side Panel" label + crimson badge showing `visibleAttention.length` (hidden when 0). Style: `bg-white border-stone-200 text-stone-600 hover:bg-stone-50`.

**Open state:** `PanelRightClose` icon + same label + same badge. Style: `bg-ink-50 border-ink-300 text-ink-700`.

> `PanelRightOpen` and `PanelRightClose` are already imported in Dashboard.jsx — no new import needed.

### Change 2 — Accordion Panel

Each section card's existing header div becomes the clickable accordion toggle. No new wrapper elements. Content is conditionally rendered with `&&` based on `expandedSections.has(id)`.

**New state:** `expandedSections` — Set of expanded section IDs.

**Section IDs:** `'attention'` | `'due'` | `'activity'` | `'tasks'`

Multiple sections can be open simultaneously.

**Default expanded state:** When the panel opens, if `visibleAttention.length > 0`, start with `new Set(['attention'])` (auto-expand Needs Attention to surface urgent alerts). If no active alerts, start with an empty Set. This aligns with the discoverability goal — the most urgent section opens first when there's something to act on.

State always resets (per above logic) when the panel is toggled closed and reopened.

---

## State & Handlers

```js
// Add alongside existing rightPanelOpen state
const [expandedSections, setExpandedSections] = useState(new Set())

const toggleSection = (id) => {
  setExpandedSections(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}

// Toggle button onClick — replace existing onClick:
onClick={() => {
  const opening = !rightPanelOpen
  setRightPanelOpen(v => !v)
  // Auto-expand Needs Attention on open if there are active alerts; otherwise reset to empty
  setExpandedSections(opening && visibleAttention.length > 0 ? new Set(['attention']) : new Set())
}}
```

---

## Toggle Button Code

```jsx
<button
  onClick={() => {
    const opening = !rightPanelOpen
    setRightPanelOpen(v => !v)
    setExpandedSections(opening && visibleAttention.length > 0 ? new Set(['attention']) : new Set())
  }}
  aria-label={rightPanelOpen ? 'Hide side panel' : 'Show side panel'}
  className={[
    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
    rightPanelOpen
      ? 'bg-ink-50 border-ink-300 text-ink-700'
      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50',
  ].join(' ')}
>
  {rightPanelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
  Side Panel
  {visibleAttention.length > 0 && (
    <span className="bg-crimson-600 text-white text-[9px] font-bold rounded-full px-1.5 py-px leading-none">
      {visibleAttention.length}
    </span>
  )}
</button>
```

---

## Section Header Spec

| Section | ID | Icon | Icon color | Count badge | Header bg | Hover |
|---|---|---|---|---|---|---|
| Needs Attention | `attention` | `AlertCircle` | `text-crimson-600` | `visibleAttention.length` — hide when 0 | `bg-crimson-50 border-b border-crimson-100` | `hover:bg-crimson-100` |
| Due This Week | `due` | `CalendarCheck` | `text-amber-500` | none | `border-b border-stone-100` | `hover:bg-stone-50` |
| Recent Activity | `activity` | `Activity` | `text-ink-500` | none | `border-b border-stone-100` | `hover:bg-stone-50` |
| My Tasks | `tasks` | `ListTodo` | `text-ink-500` | `tasks.length` — hide when 0 | `border-b border-stone-100` | `hover:bg-stone-50` |

> Icon colors match existing code exactly. No color changes.
> Both count badges (attention and tasks) are hidden when their count is 0.

**Chevron alignment:** The chevron is always right-aligned. Use `ml-auto` on the chevron itself when there is no count badge, so the chevron is pushed to the right edge regardless of whether a badge is present.

---

## Accordion Header Code (all 4 sections)

### Needs Attention

```jsx
<button
  onClick={() => toggleSection('attention')}
  className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-crimson-100 bg-crimson-50 hover:bg-crimson-100 transition-colors"
>
  <AlertCircle className="h-3.5 w-3.5 text-crimson-600 shrink-0" />
  <h3 className="text-[11px] font-bold text-crimson-800 uppercase tracking-wide">Needs Attention</h3>
  {visibleAttention.length > 0 && (
    <span className="text-[10px] font-bold text-white bg-crimson-600 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
      {visibleAttention.length}
    </span>
  )}
  {expandedSections.has('attention')
    ? <ChevronUp className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
    : <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
  }
</button>
{expandedSections.has('attention') && (
  <div className="divide-y divide-stone-50">
    {/* existing content — unchanged */}
  </div>
)}
```

### Due This Week

```jsx
<button
  onClick={() => toggleSection('due')}
  className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 hover:bg-stone-50 transition-colors"
>
  <CalendarCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
  <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Due This Week</h3>
  {expandedSections.has('due')
    ? <ChevronUp className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
    : <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
  }
</button>
{expandedSections.has('due') && (
  <div className="px-3 py-1.5 space-y-0.5">
    {/* existing content — unchanged */}
  </div>
)}
```

### Recent Activity

```jsx
<button
  onClick={() => toggleSection('activity')}
  className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 hover:bg-stone-50 transition-colors"
>
  <Activity className="h-3.5 w-3.5 text-ink-500 shrink-0" />
  <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Recent Activity</h3>
  {expandedSections.has('activity')
    ? <ChevronUp className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
    : <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
  }
</button>
{expandedSections.has('activity') && (
  <div className="divide-y divide-stone-50">
    {/* existing content — unchanged */}
  </div>
)}
```

### My Tasks

```jsx
<button
  onClick={() => toggleSection('tasks')}
  className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 hover:bg-stone-50 transition-colors"
>
  <ListTodo className="h-3.5 w-3.5 text-ink-500 shrink-0" />
  <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">My Tasks</h3>
  {tasks.length > 0 && (
    <span className="text-[10px] font-bold text-white bg-ink-600 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
      {tasks.length}
    </span>
  )}
  {expandedSections.has('tasks')
    ? <ChevronUp className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
    : <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-auto" />
  }
</button>
{expandedSections.has('tasks') && (
  <div>
    {/* existing task list content — unchanged */}
    {/* existing footer (completed count + add task button) — unchanged */}
  </div>
)}
```

---

## What Does NOT Change

- Content inside all 4 sections (alert items, task rows, activity rows, due-week rows) — unchanged
- `rightPanelOpen` state and outer panel wrapper — unchanged
- Dismiss alert, complete task, add task functionality — unchanged
- `ChevronDown`, `ChevronUp`, `PanelRightOpen`, `PanelRightClose` all already imported — no new imports needed

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/dashboard/Dashboard.jsx` | (1) Replace toggle button, (2) add `expandedSections` state + `toggleSection` handler, (3) convert all 4 section headers to accordion buttons |
