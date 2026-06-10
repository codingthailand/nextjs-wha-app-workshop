import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { AdminStats } from "@/types/admin"

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)

    const [todayOrdersResult, pendingOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.orders.findMany({
        where: { date: { gte: todayStart, lt: todayEnd } },
        select: { total_amount: true },
      }),
      prisma.orders.count({ where: { status: "processing" } }),
      prisma.products.count(),
      prisma.user.count(),
    ])

    const todaySales = todayOrdersResult.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    )
    const todayOrders = todayOrdersResult.length

    const stats: AdminStats = {
      todaySales,
      todayOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
