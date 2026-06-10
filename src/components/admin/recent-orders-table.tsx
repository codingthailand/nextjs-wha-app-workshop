"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AdminOrderItem } from "@/types/admin"

type RecentOrdersTableProps = {
  orders: AdminOrderItem[]
  loading?: boolean
}

const statusLabels: Record<string, string> = {
  delivered: "สำเร็จ",
  received: "ได้รับแล้ว",
  processing: "กำลังดำเนินการ",
}

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  delivered: "success",
  processing: "warning",
  received: "default",
}

const currencyFormat = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
})

function OrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ออเดอร์ล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-5 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentOrdersTable({ orders, loading }: RecentOrdersTableProps) {
  if (loading) {
    return <OrdersSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ออเดอร์ล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ออเดอร์</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>จำนวน</TableHead>
              <TableHead>ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  ไม่มีออเดอร์
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    {new Date(order.date).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>{order.items} ชิ้น</TableCell>
                  <TableCell>{currencyFormat.format(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status] || "default"}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { RecentOrdersTable }
