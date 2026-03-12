import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Columns3, Rows3 } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function Table({
  columns,
  data,
  defaultPageSize = 25,
  onRowClick,
  emptyMessage = 'No records to display',
  emptyState,
  className = '',
  showControls = false,
  embedded = false,
  rowClassName,
  pagination = true,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [hiddenCols, setHiddenCols] = useState(new Set())
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [density, setDensity] = useState('default') // 'compact' | 'default'
  const [focusedRow, setFocusedRow] = useState(-1)
  const colMenuRef = useRef(null)
  const tableRef = useRef(null)

  // Close column menu on outside click
  useEffect(() => {
    if (!colMenuOpen) return
    function handleClick(e) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setColMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [colMenuOpen])

  const visibleColumns = columns.filter(c => !hiddenCols.has(c.key))
  const densityPy = density === 'compact' ? 'py-2' : 'py-3'

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    : data

  const total = sorted.length
  const totalPages = Math.ceil(total / pageSize)
  const slice = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted

  // Keyboard navigation for table rows
  const handleTableKeyDown = useCallback((e) => {
    if (!onRowClick || slice.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedRow(prev => Math.min(prev + 1, slice.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedRow(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && focusedRow >= 0 && focusedRow < slice.length) {
      e.preventDefault()
      onRowClick(slice[focusedRow])
    }
  }, [focusedRow, slice, onRowClick])

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Controls bar */}
      {showControls && (
        <div className="flex items-center gap-2 mb-2 justify-end">
          {/* Density toggle */}
          <button
            onClick={() => setDensity(d => d === 'default' ? 'compact' : 'default')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            title={density === 'compact' ? 'Default density' : 'Compact density'}
          >
            <Rows3 className="h-3.5 w-3.5" />
            {density === 'compact' ? 'Default' : 'Compact'}
          </button>

          {/* Column visibility */}
          <div className="relative" ref={colMenuRef}>
            <button
              onClick={() => setColMenuOpen(o => !o)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              title="Toggle columns"
            >
              <Columns3 className="h-3.5 w-3.5" />
              Columns
            </button>
            {colMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(col.key)}
                      onChange={() => {
                        setHiddenCols(prev => {
                          const next = new Set(prev)
                          if (next.has(col.key)) next.delete(col.key)
                          else if (visibleColumns.length > 1) next.add(col.key)
                          return next
                        })
                      }}
                      className="rounded border-stone-300 text-ink-600 focus:ring-ink-500"
                    />
                    {col.header}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={embedded ? 'overflow-x-auto' : 'overflow-x-auto rounded-xl border border-stone-200'} ref={tableRef} tabIndex={onRowClick ? 0 : undefined} onKeyDown={onRowClick ? handleTableKeyDown : undefined}>
        <table className="min-w-full divide-y divide-stone-100 text-sm">
          <thead className="bg-stone-25">
            <tr>
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 ${densityPy} text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-stone-700 select-none' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        : <ChevronsUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="text-center">
                  {emptyState || (
                    <div className="py-12 text-stone-400 text-sm">{emptyMessage}</div>
                  )}
                </td>
              </tr>
            ) : slice.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={[
                  'transition-colors duration-150 group',
                  onRowClick ? 'cursor-pointer hover:bg-ink-25' : '',
                  i % 2 === 1 ? 'bg-stone-25/50' : '',
                  focusedRow === i ? 'ring-2 ring-inset ring-ink-300 bg-ink-25' : '',
                  rowClassName ? rowClassName(row, i) : '',
                ].join(' ')}
              >
                {visibleColumns.map(col => (
                  <td key={col.key} className={`px-4 ${densityPy} text-stone-700 whitespace-nowrap`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && total > 0 && (
        <div className="flex items-center justify-between mt-3 px-1 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(+e.target.value); setPage(1) }}
              className="border border-stone-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ink-400"
            >
              {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded border border-stone-200 disabled:opacity-40 hover:bg-stone-100 transition-colors">
                &lsaquo;
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded border border-stone-200 disabled:opacity-40 hover:bg-stone-100 transition-colors">
                &rsaquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
