/** Recharts 折线图数据点 */
export interface LineChartDataPoint {
  time: string
  value: number
  label?: string
}

/** 双轴折线图数据点 */
export interface DualLineChartDataPoint {
  time: string
  primary: number
  secondary: number
}

/** 柱状图数据点 */
export interface BarChartDataPoint {
  name: string
  value: number
  fill?: string
}

/** 饼图数据点 */
export interface PieChartDataPoint {
  name: string
  value: number
  fill?: string
}

/** 集群功率分配图数据 */
export interface ClusterChartDataPoint {
  cluster: string
  capacity: number
  allocated: number
  available: number
}

/** 电网负载可视化数据 */
export interface GridLoadDataPoint {
  hour: string
  loadPercent: number
  capacityKw: number
}

/** 峰谷电价可视化段 */
export interface TariffChartSegment {
  period: string
  startHour: number
  endHour: number
  price: number
  color: string
}

export interface ChartSeriesConfig {
  dataKey: string
  name: string
  color: string
  yAxisId?: 'left' | 'right'
}

export interface AdminLineChartProps {
  data: LineChartDataPoint[]
  series?: ChartSeriesConfig[]
  title: string
  description?: string
  height?: number
  unit?: string
  borderless?: boolean
}

export interface AdminBarChartProps {
  data: BarChartDataPoint[]
  title: string
  description?: string
  height?: number
  unit?: string
  borderless?: boolean
}

export interface AdminPieChartProps {
  data: PieChartDataPoint[]
  title: string
  description?: string
  height?: number
  borderless?: boolean
}
