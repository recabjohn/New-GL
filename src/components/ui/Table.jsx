import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function Table({
  columns,
  data,
  defaultPageSize = 25,
  onRowClick,
  emptyMessage = 'No records to display',
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

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
  const slice = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="min-w-full divide-y divide-stone-100 text-sm">
          <thead className="bg-stone-25">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-stone-700 select-none' : ''}`}
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
                <td colSpan={columns.length} className="text-center py-12 text-stone-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : slice.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={[
                  'transition-colors duration-100',
                  onRowClick ? 'cursor-pointer hover:bg-ink-25' : '',
                  i % 2 === 1 ? 'bg-stone-25/50' : '',
                ].join(' ')}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-stone-700 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
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
