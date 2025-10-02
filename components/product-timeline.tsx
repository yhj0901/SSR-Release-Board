import { Card } from "@/components/ui/card"
import { Calendar, CheckCircle2, Clock } from "lucide-react"

interface Product {
  name: string
  developmentDate: string
  qaDate: string
  releaseDate: string
  version?: string
  releaseNotes?: string
}

interface ProductTimelineProps {
  product: Product
}

export function ProductTimeline({ product }: ProductTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPhaseStatus = (currentIndex: number, dateString: string, prevDateString?: string) => {
    const currentDate = new Date()
    const phaseEndDate = new Date(dateString)
    const prevPhaseEndDate = prevDateString ? new Date(prevDateString) : null

    // If current date is past this phase's end date, it's completed
    if (currentDate > phaseEndDate) {
      return "completed"
    }

    // If this is the first phase (no previous phase)
    if (!prevPhaseEndDate) {
      // If we haven't reached the end date yet, it's in progress
      return "in-progress"
    }

    // For subsequent phases: in progress if previous phase is complete and current phase hasn't ended
    if (currentDate > prevPhaseEndDate && currentDate <= phaseEndDate) {
      return "in-progress"
    }

    // Otherwise, it's upcoming (previous phase not complete yet)
    return "upcoming"
  }

  const milestones = [
    {
      label: "Development",
      labelKo: "개발 종료",
      date: product.developmentDate,
      icon: Clock,
    },
    {
      label: "QA",
      labelKo: "QA 종료",
      date: product.qaDate,
      icon: CheckCircle2,
    },
    {
      label: "Release",
      labelKo: "최종 릴리즈",
      date: product.releaseDate,
      icon: Calendar,
    },
  ]

  return (
    <Card className="bg-card border-border p-6 transition-all hover:border-muted-foreground/30">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
        {product.version && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {product.version}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon
          const prevDate = index > 0 ? milestones[index - 1].date : undefined
          const status = getPhaseStatus(index, milestone.date, prevDate)

          return (
            <div key={milestone.label} className="relative">
              {index !== milestones.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-[2px] bg-border" />
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    status === "completed"
                      ? "border-green-500 bg-green-500/20"
                      : status === "in-progress"
                        ? "border-amber-500 bg-amber-500/20 animate-pulse"
                        : "border-border bg-secondary"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      status === "completed"
                        ? "text-green-500"
                        : status === "in-progress"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    }`}
                  />
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{milestone.labelKo}</h3>
                    {status === "completed" && <span className="text-xs text-green-500 font-medium">완료</span>}
                    {status === "in-progress" && <span className="text-xs text-amber-500 font-medium">진행 중</span>}
                  </div>
                  <p className="mt-1 font-mono text-lg text-foreground">{formatDate(milestone.date)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">진행 상황</span>
          <span className="font-mono text-foreground">
            {
              milestones.filter((m, i) => {
                const prevDate = i > 0 ? milestones[i - 1].date : undefined
                return getPhaseStatus(i, m.date, prevDate) === "completed"
              }).length
            }{" "}
            / {milestones.length}
          </span>
        </div>
        {product.releaseNotes && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">이번 버전</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{product.releaseNotes}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
