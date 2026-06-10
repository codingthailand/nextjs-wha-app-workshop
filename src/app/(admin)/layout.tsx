import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import type { Metadata } from "next"
import { Lora, Open_Sans, Source_Code_Pro } from "next/font/google"
import { cn } from "@/lib/utils"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AdminShell } from "@/components/admin/admin-shell"

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
})

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MarketNest — Admin Dashboard",
  description: "Admin dashboard for MarketNest",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="th"
      className={cn(openSans.variable, lora.variable, sourceCodePro.variable)}
    >
      <body>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center text-muted-foreground">
              กำลังโหลด...
            </div>
          }
        >
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
        <Toaster />
      </body>
    </html>
  )
}

async function AdminLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await connection()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <AdminShell userName={session.user.name}>
      {children}
    </AdminShell>
  )
}
