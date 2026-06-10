import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { productSchema } from "@/lib/validations/product"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      )
    }

    const { name, description, price, categoryId } = parsed.data

    const product = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        name,
        description: description || null,
        price,
        category_id: Number(categoryId),
      },
      include: { categories: { select: { name: true } } },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name || "",
        description: product.description,
        price: Number(product.price || 0),
        categoryId: product.category_id || 0,
        categoryName: product.categories?.name || "",
      },
    })
  } catch (error) {
    console.error("Failed to update product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const count = await prisma.order_items.count({
      where: { product_id: Number(id) },
    })

    if (count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถลบได้ เนื่องจากสินค้านี้มีคำสั่งซื้อ ${count} รายการ`,
        },
        { status: 409 }
      )
    }

    await prisma.products.delete({ where: { id: Number(id) } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
