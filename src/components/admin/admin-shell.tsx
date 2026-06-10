"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  RiDashboardLine,
  RiShoppingBagLine,
  RiFileListLine,
  RiGridLine,
  RiUserLine,
  RiMenuLine,
  RiCloseLine,
} from "@remixicon/react"
import LogoutButton from "@/components/logout-button"

type AdminShellProps = {
  userName: string
  children: React.ReactNode
}

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: RiDashboardLine },
  { href: "/dashboard/products", label: "สินค้า", icon: RiShoppingBagLine },
  { href: "/admin/orders", label: "ออเดอร์", icon: RiFileListLine },
  { href: "/admin/categories", label: "หมวดหมู่", icon: RiGridLine },
  { href: "/admin/users", label: "ผู้ใช้", icon: RiUserLine },
]

function AdminShell({ userName, children }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/"
          className="font-heading text-[22px] font-semibold tracking-tight text-primary"
        >
          MarketNest
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )

  const mobileSidebar = sidebarOpen && (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="fixed inset-0 bg-black/30"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link
            href="/"
            className="font-heading text-[22px] font-semibold tracking-tight text-primary"
          >
            MarketNest
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-accent"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">{sidebar}</div>

      {/* Mobile sidebar */}
      {mobileSidebar}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1 hover:bg-accent lg:hidden"
          >
            <RiMenuLine className="size-5" />
          </button>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              สวัสดี,
              <span className="font-medium text-foreground">{userName}</span>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

export { AdminShell }
