import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { RevenuePoint } from "@/types/admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await prisma.orders.findMany({
      where: { date: { gte: startDate } },
      select: { date: true, total_amount: true },
      orderBy: { date: "asc" },
    })

    const revenueMap = new Map<string, { revenue: number; orders: number }>()

    for (const order of orders) {
      if (!order.date) continue
      const dateStr = order.date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      const entry = revenueMap.get(dateStr) || { revenue: 0, orders: 0 }
      entry.revenue += Number(order.total_amount || 0)
      entry.orders += 1
      revenueMap.set(dateStr, entry)
    }

    const revenue: RevenuePoint[] = Array.from(revenueMap.entries()).map(
      ([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      })
    )

    return NextResponse.json(revenue)
  } catch (error) {
    console.error("Failed to fetch revenue:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue" },
      { status: 500 }
    )
  }
}
