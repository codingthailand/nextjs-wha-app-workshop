"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import {
  RiAddLine,
  RiSearchLine,
  RiPencilLine,
  RiDeleteBinLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ProductFormModal } from "./product-form-modal"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import type { AdminProduct, CategoryOption, ProductListResponse } from "@/types/admin"

function ProductsClient() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [inputVal, setInputVal] = useState("")
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const fetchKey = useRef(0)

  const currencyFormat = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  })

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => toast.error("ไม่สามารถโหลดหมวดหมู่ได้"))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(inputVal)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  useEffect(() => {
    const key = ++fetchKey.current

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)

    fetch(`/api/admin/products?${params}`)
      .then((res) => {
        if (key !== fetchKey.current) return null
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then((data: ProductListResponse | null) => {
        if (data) {
          setProducts(data.products)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      })
      .catch(() => {
        if (key === fetchKey.current) toast.error("ไม่สามารถโหลดสินค้าได้")
      })
      .finally(() => {
        if (key === fetchKey.current) setLoading(false)
      })
  }, [search, page, refreshKey])

  function handleEdit(product: AdminProduct) {
    setEditProduct(product)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditProduct(null)
    setFormOpen(true)
  }

  function handleDelete(product: AdminProduct) {
    setDeleteTarget(product)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "เกิดข้อผิดพลาด")
        return
      }
      toast.success("ลบสินค้าเรียบร้อย")
      setDeleteTarget(null)
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบสินค้า")
    }
  }

  function handleFormSuccess() {
    setFormOpen(false)
    setEditProduct(null)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-subhead font-heading">สินค้า</h1>
          <p className="text-muted-foreground">จัดการสินค้าทั้งหมด</p>
        </div>
        <Button onClick={handleCreate}>
          <RiAddLine className="size-4" />
          เพิ่มสินค้า
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>รายการสินค้า ({total})</CardTitle>
            <div className="relative w-72">
              <RiSearchLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาสินค้า..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              ไม่พบสินค้า
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อสินค้า</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{currencyFormat.format(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(product)}
                          >
                            <RiPencilLine className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(product)}
                          >
                            <RiDeleteBinLine className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ก่อนหน้า
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    หน้า {page} จาก {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    ถัดไป
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ProductFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        categories={categories}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmDialog
        product={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export { ProductsClient }
