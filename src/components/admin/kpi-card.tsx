import { Card, CardContent } from "@/components/ui/card"

type KpiCardProps = {
  title: string
  value: string | number
  icon?: React.ReactNode
}

function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function KpiCardSkeleton() {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <div className="size-10 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export { KpiCard, KpiCardSkeleton }
