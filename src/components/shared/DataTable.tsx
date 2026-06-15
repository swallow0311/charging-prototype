import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { DataTableProps } from '@/types'

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = '搜索...',
  searchKeys = [],
  filterKey,
  filterOptions,
  pageSize = 10,
  emptyMessage = '暂无数据',
  toolbarExtra,
  selectedRowId,
  onRowClick,
  compact = false,
  hideToolbar = false,
  searchWidth = 'w-64',
  getRowClassName,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...data]

    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        searchKeys.some((key) => String(row[key]).toLowerCase().includes(q)),
      )
    }

    if (filterKey && filter !== 'all') {
      result = result.filter((row) => String(row[filterKey]) === filter)
    }

    return result
  }, [data, search, searchKeys, filterKey, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const selectable = Boolean(onRowClick)

  return (
    <div className="space-y-4">
      {!hideToolbar ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className={cn('relative shrink-0', searchWidth)}>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9"
            />
          </div>
          {filterKey && filterOptions ? (
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {toolbarExtra}
        </div>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)} style={{ width: col.width }} className={compact ? 'text-xs' : undefined}>
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => {
                const isSelected = selectedRowId === row.id
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      selectable && 'datatable-row--selectable',
                      isSelected && 'datatable-row--selected',
                      getRowClassName?.(row),
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className={compact ? 'py-2.5 text-sm' : undefined}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>共 {filtered.length} 条，第 {page}/{totalPages} 页</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
