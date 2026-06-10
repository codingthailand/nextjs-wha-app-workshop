"use client"

import { Button } from "@/components/ui/button"
import type { Period } from "@/types/admin"

type PeriodSelectorProps = {
  value: Period
  onChange: (period: Period) => void
}

const periods: { value: Period; label: string }[] = [
  { value: "7d", label: "7 วัน" },
  { value: "30d", label: "30 วัน" },
  { value: "90d", label: "90 วัน" },
]

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg border bg-muted/10 p-1">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={value === p.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}

export { PeriodSelector }
