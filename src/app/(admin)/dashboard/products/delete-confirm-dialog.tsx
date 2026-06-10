"use client"

import { useState } from "react"
import { AlertDialog } from "radix-ui"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { AdminProduct } from "@/types/admin"

type DeleteConfirmDialogProps = {
  product: AdminProduct | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

function DeleteConfirmDialog({
  product,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const open = !!product

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-popover p-6 shadow-lg duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <AlertDialog.Title className="font-heading text-lg font-semibold">
            ยืนยันการลบสินค้า
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า
            <strong className="text-foreground"> {product?.name}</strong> ?
            การกระทำนี้ไม่สามารถยกเลิกได้
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" disabled={loading}>
                ยกเลิก
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading ? (
                <>
                  <Spinner className="size-4" />
                  กำลังลบ...
                </>
              ) : (
                "ลบสินค้า"
              )}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export { DeleteConfirmDialog }
