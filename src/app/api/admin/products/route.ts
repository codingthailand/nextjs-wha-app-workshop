import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { Prisma } from "../../../../../generated/prisma/client"
import { productSchema } from "@/lib/validations/product"

const ITEMS_PER_PAGE = 10

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const search = searchParams.get("search") || ""

    const where: Prisma.productsWhereInput = {}
    if (search) {
      where.name = { contains: search }
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        include: { categories: { select: { name: true } } },
        orderBy: { id: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.products.count({ where }),
    ])

    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name || "",
      description: p.description,
      price: Number(p.price || 0),
      categoryId: p.category_id || 0,
      categoryName: p.categories?.name || "",
    }))

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    return NextResponse.json({
      products: mapped,
      total,
      page,
      pageSize: ITEMS_PER_PAGE,
      totalPages,
    })
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      )
    }

    const { name, description, price, categoryId } = parsed.data

    const product = await prisma.products.create({
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
    console.error("Failed to create product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    )
  }
}
