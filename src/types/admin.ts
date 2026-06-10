export type AdminStats = {
  todaySales: number
  todayOrders: number
  pendingOrders: number
  totalProducts: number
  totalUsers: number
}

export type RevenuePoint = {
  date: string
  revenue: number
  orders: number
}

export type AdminOrderItem = {
  id: number
  date: string
  customer: string
  total: number
  status: 'delivered' | 'received' | 'processing'
  items: number
}

export type Period = '7d' | '30d' | '90d'

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

export type AdminProduct = {
  id: number
  name: string
  description: string | null
  price: number
  categoryId: number
  categoryName: string
}

export type CategoryOption = {
  id: number
  name: string
}

export type ProductListResponse = {
  products: AdminProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
