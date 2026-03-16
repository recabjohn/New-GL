# Dashboard Right Panel Discoverability — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the icon-only right panel toggle button with a labeled pill that shows a live alert count, and convert the 4 right-panel sections into an accordion so new users immediately understand what the panel contains.

**Architecture:** Single-file change to `Dashboard.jsx`. Add `expandedSections` Set state and a `toggleSection` handler. Replace the toggle button JSX. Convert each of the 4 section card headers from static `<div>` to clickable `<button>` with conditional content rendering. No new files, no new imports needed.

**Tech Stack:** React 18, Tailwind CSS v3, lucide-react icons, plain JSX (no TypeScript). No test framework — verification is manual via `npm run dev` in the browser.

**Spec:** `docs/superpowers/specs/2026-03-16-dashboard-panel-discoverability-design.md`

---

## Chunk 1: State, Toggle Button, and Accordion Sections

### Task 1: Add `expandedSections` state and `toggleSection` handler

**Files:**
- Modify: `src/components/dashboard/Dashboard.jsx`

- [ ] **Step 1: Add `expandedSections` state after `rightPanelOpen`**

  In `Dashboard.jsx`, find this exact line:
  ```js
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  ```
  Replace it with:
  ```js
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState(new Set())
  ```

- [ ] **Step 2: Add `toggleSection` handler after `handleAddTask`**

  Find this exact line:
  ```js
  const TASK_TYPES = ['Follow-up', 'Document Request', 'Review', 'Call', 'Other']
  ```
  Replace it with:
  ```js
  const toggleSection = (id) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const TASK_TYPES = ['Follow-up', 'Document Request', 'Review', 'Call', 'Other']
  ```

- [ ] **Step 3: Verify — run dev server, confirm 0 console errors**

  ```bash
  cd gl-paas-ui && npm run dev
  ```
  Open the dashboard. Expected: 0 console errors, dashboard renders identically to before (no visual change yet).

---

### Task 2: Replace the toggle button

**Files:**
- Modify: `src/components/dashboard/Dashboard.jsx` (lines 317–324)

- [ ] **Step 1: Find and replace the icon-only toggle button**

  Find this exact block:
  ```jsx
          <button
            onClick={() => setRightPanelOpen(v => !v)}
            title={rightPanelOpen ? 'Hide side panel' : 'Show side panel'}
            aria-label={rightPanelOpen ? 'Hide side panel' : 'Show side panel'}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
  ```
  Replace it with:
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

  Note: `visibleAttention` is computed at line 244 and is available in the render scope — no import needed.

- [ ] **Step 2: Verify toggle button visually**

  In the browser:
  - Button shows "Side Panel" label with a crimson badge **4**
  - Click → panel opens with all sections collapsed, Needs Attention auto-expanded (has 4 alerts)
  - Click again → panel closes
  - Button active state (ink-blue border/bg) when panel is open
  - 0 console errors

---

### Task 3: Convert "Needs Attention" section to accordion

**Files:**
- Modify: `src/components/dashboard/Dashboard.jsx` (lines 521–567)

- [ ] **Step 1: Replace the Needs Attention header `<div>` with accordion `<button>`**

  Find this exact block (lines 521–527):
  ```jsx
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-crimson-100 bg-crimson-50">
              <AlertCircle className="h-3.5 w-3.5 text-crimson-600 shrink-0" />
              <h3 className="text-[11px] font-bold text-crimson-800 uppercase tracking-wide">Needs Attention</h3>
              <span className="ml-auto text-[10px] font-bold text-white bg-crimson-600 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                {visibleAttention.length}
              </span>
            </div>
  ```
  Replace it with:
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
  ```

- [ ] **Step 2: Wrap the Needs Attention content with conditional rendering**

  Find this exact opening tag (line 528):
  ```jsx
            <div className="divide-y divide-stone-50">
              {visibleAttention.length === 0 ? (
  ```
  Replace it with:
  ```jsx
            {expandedSections.has('attention') && (
            <div className="divide-y divide-stone-50">
              {visibleAttention.length === 0 ? (
  ```
  Then find the closing `</div>` that ends this content block (line 567, the one that closes the `divide-y divide-stone-50` div — it is the `</div>` immediately before `</div>` that closes the card):
  ```jsx
            </div>
          </div>

          {/* Due This Week */}
  ```
  Replace it with:
  ```jsx
            </div>
            )}
          </div>

          {/* Due This Week */}
  ```

- [ ] **Step 3: Verify Needs Attention accordion**

  - Panel opens → Needs Attention auto-expanded (4 alerts visible)
  - Click header → collapses (alert list hidden, header still visible)
  - Click header → re-expands
  - Dismiss all alerts → crimson badge disappears from header and from toggle button
  - Close and reopen panel → Needs Attention no longer auto-expands (no alerts)
  - 0 console errors

---

### Task 4: Convert "Due This Week" section to accordion

**Files:**
- Modify: `src/components/dashboard/Dashboard.jsx` (lines 572–591)

- [ ] **Step 1: Replace the Due This Week header `<div>` with accordion `<button>`**

  Find this exact block (lines 572–575):
  ```jsx
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
              <CalendarCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Due This Week</h3>
            </div>
  ```
  Replace it with:
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
  ```

- [ ] **Step 2: Wrap the Due This Week content with conditional rendering**

  Find this exact opening tag (line 576):
  ```jsx
            <div className="px-3 py-1.5 space-y-0.5">
              {submissions.filter(s => s.priority === 'HIGH').slice(0, 4).map(s => (
  ```
  Replace it with:
  ```jsx
            {expandedSections.has('due') && (
            <div className="px-3 py-1.5 space-y-0.5">
              {submissions.filter(s => s.priority === 'HIGH').slice(0, 4).map(s => (
  ```
  Then find the closing tag at line 591–592:
  ```jsx
            </div>
          </div>

          {/* Recent Activity */}
  ```
  Replace it with:
  ```jsx
            </div>
            )}
          </div>

          {/* Recent Activity */}
  ```

- [ ] **Step 3: Verify**

  - Due This Week header visible, collapsed by default
  - Click → expands showing 4 HIGH priority submission rows
  - Click → collapses
  - 0 console errors

---

### Task 5: Convert "Recent Activity" section to accordion

**Files:**
- Modify: `src/components/dashboard/Dashboard.jsx` (lines 596–629)

- [ ] **Step 1: Replace the Recent Activity header `<div>` with accordion `<button>`**

  Find this exact block (lines 596–599):
  ```jsx
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
              <Activity className="h-3.5 w-3.5 text-ink-500 shrink-0" />
              <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Recent Activity</h3>
            </div>
  ```
  Replace it with:
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
  ```

- [ ] **Step 2: Wrap the Recent Activity content with conditional rendering**

  Find this exact opening tag (line 600):
  ```jsx
            <div className="divide-y divide-stone-50">
              {ACTIVITY.map((a, i) => {
  ```
  Replace it with:
  ```jsx
            {expandedSections.has('activity') && (
            <div className="divide-y divide-stone-50">
              {ACTIVITY.map((a, i) => {
  ```
  Then find the closing tags at lines 629–631:
  ```jsx
            </div>
          </div>

          {/* My Tasks */}
  ```
  Replace it with:
  ```jsx
            </div>
            )}
          </div>

          {/* My Tasks */}
  ```

- [ ] **Step 3: Verify**

  - Recent Activity header visible, collapsed by default
  - Click → expands showing 5 activity entries (clickable rows navigate to submissions)
  - Click → collapses
  - 0 console errors

---

### Task 6: Convert "My Tasks" section to accordion

**Files:**
- Modify: `src/components/dashboard/Dashboard.jsx` (lines 634–698)

- [ ] **Step 1: Replace the My Tasks header `<div>` with accordion `<button>`**

  Find this exact block (lines 634–642):
  ```jsx
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
              <ListTodo className="h-3.5 w-3.5 text-ink-500 shrink-0" />
              <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">My Tasks</h3>
              {tasks.length > 0 && (
                <span className="ml-auto text-[10px] font-bold text-white bg-ink-600 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                  {tasks.length}
                </span>
              )}
            </div>
  ```
  Replace it with:
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
  ```

- [ ] **Step 2: Wrap task list AND footer together with conditional rendering**

  The task list and footer are two sibling elements that must both be hidden when collapsed. Wrap them together in a React fragment.

  **Part A — add opening wrapper.** Find this exact block (line 644):
  ```jsx
            <div className="divide-y divide-stone-50">
              {tasks.length === 0 ? (
  ```
  Replace it with:
  ```jsx
            {expandedSections.has('tasks') && (
            <>
            <div className="divide-y divide-stone-50">
              {tasks.length === 0 ? (
  ```

  **Part B — add closing wrapper.** Find this exact block (unique — includes the full footer content for unambiguous matching):
  ```jsx
            {/* Footer: completed count + add task */}
            <div className="px-3 py-2.5 border-t border-stone-100 bg-stone-25 flex items-center justify-between">
              <span className="text-[10px] text-stone-400">
                Completed today: <span className="font-mono font-semibold text-stone-600">{completedToday}</span>
              </span>
              <button
                onClick={() => setAddTaskOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-600 hover:text-ink-800 hover:bg-ink-50 px-2 py-1 rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Task
              </button>
            </div>
          </div>
  ```
  Replace it with:
  ```jsx
            {/* Footer: completed count + add task */}
            <div className="px-3 py-2.5 border-t border-stone-100 bg-stone-25 flex items-center justify-between">
              <span className="text-[10px] text-stone-400">
                Completed today: <span className="font-mono font-semibold text-stone-600">{completedToday}</span>
              </span>
              <button
                onClick={() => setAddTaskOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-600 hover:text-ink-800 hover:bg-ink-50 px-2 py-1 rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Task
              </button>
            </div>
            </>
            )}
          </div>
  ```

- [ ] **Step 3: Verify My Tasks accordion**

  - My Tasks header visible with ink badge **4**
  - Collapsed by default
  - Click → expands showing 4 task rows + footer ("Completed today: 0" + "Add Task" button)
  - Complete a task → badge decrements
  - "Add Task" button opens modal and works correctly
  - Complete all tasks → badge disappears, "No tasks remaining." shows inside expanded section
  - 0 console errors

---

### Task 7: Full end-to-end verification and commit

- [ ] **Step 1: Full flow verification**

  Open `http://localhost:5173` in the browser and verify:
  1. Dashboard loads — "Side Panel" button visible with crimson **4** badge
  2. Click "Side Panel" → panel opens, Needs Attention auto-expanded, other 3 collapsed
  3. Click "Needs Attention" header → collapses. Click again → expands
  4. Click "Due This Week" → expands rows. Click again → collapses
  5. Click "Recent Activity" → expands entries. Click again → collapses
  6. Click "My Tasks" → expands tasks + footer. "Add Task" works. Complete task works
  7. Click "Side Panel" button → panel closes (ink active style on button while open)
  8. Click "Side Panel" again → panel reopens, Needs Attention auto-expanded again
  9. Dismiss all 4 alerts → crimson badge disappears from "Side Panel" button and from Needs Attention header
  10. Close and reopen panel → all 4 sections start collapsed (no auto-expand, no alerts left)

- [ ] **Step 2: Confirm 0 console errors**

  Browser DevTools → Console tab → must show zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/dashboard/Dashboard.jsx
  git commit -m "$(cat <<'EOF'
  feat: replace icon-only panel toggle with labeled pill + accordion sections

  - Toggle button now shows 'Side Panel' label with live alert count badge
  - Right panel sections convert to accordion (collapsed by default)
  - Needs Attention auto-expands on panel open when active alerts exist
  - Addresses new-user discoverability gap
  EOF
  )"
  ```
