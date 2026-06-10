"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type {
  AdminStats,
  RevenuePoint,
  AdminOrderItem,
  Period,
} from "@/types/admin"
import { KpiCard, KpiCardSkeleton } from "@/components/admin/kpi-card"
import { PeriodSelector } from "@/components/admin/period-selector"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"

const RevenueChart = dynamic(
  () =>
    import("@/components/admin/revenue-chart").then((m) => ({
      default: m.RevenueChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded bg-muted" />
    ),
  }
)

const currencyFormat = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
})

function DashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [revenueLoading, setRevenueLoading] = useState(true)

  const [period, setPeriod] = useState<Period>("30d")

  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders?limit=5"),
        ])

        if (cancelled) return

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
          setStatsError(null)
        } else {
          throw new Error("Failed to fetch stats")
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setOrders(data.orders)
        }
      } catch (err) {
        setStatsError(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
        )
      } finally {
        if (!cancelled) {
          setStatsLoading(false)
          setOrdersLoading(false)
        }
      }
    }

    load()

    const interval = setInterval(() => {
      async function refresh() {
        try {
          const [statsRes, ordersRes] = await Promise.all([
            fetch("/api/admin/stats"),
            fetch("/api/admin/orders?limit=5"),
          ])

          if (cancelled) return

          if (statsRes.ok) {
            const data = await statsRes.json()
            setStats(data)
            setStatsError(null)
          }

          if (ordersRes.ok) {
            const data = await ordersRes.json()
            setOrders(data.orders)
          }
        } catch {
          // silent on background refresh
        }
      }
      refresh()
    }, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setRevenueLoading(true)
      try {
        const res = await fetch(`/api/admin/revenue?period=${period}`)
        if (cancelled) return
        if (!res.ok) throw new Error("Failed to fetch revenue")
        const data = await res.json()
        setRevenue(data)
      } catch {
        if (!cancelled) setRevenue([])
      } finally {
        if (!cancelled) setRevenueLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [period])

  function retryStats() {
    setStatsLoading(true)
    setStatsError(null)

    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed")
        return res.json()
      })
      .then((data) => {
        setStats(data)
        setStatsError(null)
      })
      .catch((err) => {
        setStatsError(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
        )
      })
      .finally(() => {
        setStatsLoading(false)
      })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-subhead font-heading">แดชบอร์ด</h1>
          <p className="text-muted-foreground">ภาพรวมร้านค้าของคุณ</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))
        ) : statsError ? (
          <div className="col-span-full flex items-center gap-4 rounded-md border bg-destructive/10 p-4 text-destructive">
            <p>ไม่สามารถโหลดข้อมูลสถิติ</p>
            <button
              onClick={retryStats}
              className="text-sm font-semibold underline underline-offset-2"
            >
              ลองใหม่
            </button>
          </div>
        ) : stats ? (
          <>
            <KpiCard
              title="ยอดขายวันนี้"
              value={currencyFormat.format(stats.todaySales)}
            />
            <KpiCard title="ออเดอร์วันนี้" value={stats.todayOrders} />
            <KpiCard
              title="ออเดอร์รอดำเนินการ"
              value={stats.pendingOrders}
            />
            <KpiCard title="สินค้าทั้งหมด" value={stats.totalProducts} />
            <KpiCard title="ผู้ใช้ทั้งหมด" value={stats.totalUsers} />
          </>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-body-large font-heading font-semibold">
            รายได้
          </h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        <RevenueChart data={revenue} loading={revenueLoading} />
      </div>

      <RecentOrdersTable orders={orders} loading={ordersLoading} />
    </div>
  )
}

export { DashboardClient }
