import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import type { AdminOrderItem } from "@/types/admin"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = Math.min(Number(searchParams.get("limit")) || 5, 50)

  try {
    const orders = await prisma.orders.findMany({
      take: limit,
      orderBy: { date: "desc" },
      include: {
        customers: { select: { name: true } },
        order_items: { select: { quantity: true } },
      },
    })

    const total = await prisma.orders.count()

    const mappedOrders: AdminOrderItem[] = orders
      .filter((o) => o.date)
      .map((o) => ({
        id: o.id,
        date: o.date!.toISOString(),
        customer: o.customers?.name || "ไม่ระบุ",
        total: Number(o.total_amount || 0),
        status: o.status || "processing",
        items: o.order_items.reduce((sum, item) => sum + item.quantity, 0),
      }))

    return NextResponse.json({ orders: mappedOrders, total })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
