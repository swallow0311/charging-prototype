import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: keyof T | string
  title: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

export interface TableFilterOption {
  label: string
  value: string
}

export interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: TableColumn<T>[]
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  filterKey?: keyof T
  filterOptions?: TableFilterOption[]
  pageSize?: number
  emptyMessage?: string
  toolbarExtra?: ReactNode
  selectedRowId?: string | null
  onRowClick?: (row: T) => void
  compact?: boolean
  /** 隐藏内置搜索/筛选工具栏（外部自定义筛选时使用） */
  hideToolbar?: boolean
  /** 搜索框宽度 class，默认固定 w-64 */
  searchWidth?: string
  getRowClassName?: (row: T) => string | undefined
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
}
