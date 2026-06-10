"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { RiSaveLine } from "@remixicon/react"
import type { Resolver } from "react-hook-form"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { productSchema, type ProductFormValues } from "@/lib/validations/product"
import type { AdminProduct, CategoryOption } from "@/types/admin"

type ProductFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProduct | null
  categories: CategoryOption[]
  onSuccess: () => void
}

const defaultValues: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
}

function ProductFormModal({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(product ? {
        name: product.name,
        description: product.description || "",
        price: product.price,
        categoryId: String(product.categoryId),
      } : defaultValues)
    }
  }, [open, product, reset])

  async function onSubmit(raw: Record<string, unknown>) {
    const data = raw as unknown as ProductFormValues
    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "เกิดข้อผิดพลาด")
        return
      }

      toast.success(isEdit ? "อัปเดตสินค้าเรียบร้อย" : "เพิ่มสินค้าเรียบร้อย")
      onSuccess()
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </SheetTitle>
          <SheetDescription>
            กรอกข้อมูลสินค้าให้ครบถ้วน
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อสินค้า</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">ราคา</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-sm text-destructive">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">หมวดหมู่</Label>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="h-[42px] w-full min-w-0 rounded-sm border border-input bg-white px-3.5 py-1 text-base outline-none transition-[color,box-shadow,background-color] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-[rgba(194,65,12,0.15)] md:text-sm"
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <RiSaveLine className="size-4" />
                  บันทึก
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export { ProductFormModal }
