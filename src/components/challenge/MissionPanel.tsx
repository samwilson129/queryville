import { BookOpen, Target, Info, Code2, CheckCircle } from "lucide-react"

interface MissionPanelProps {
  mission: any
  completed: boolean
  xpAwarded?: number
}

export function MissionPanel({ mission, completed, xpAwarded }: MissionPanelProps) {
  const sections = [
    { label: "Briefing", icon: Info, content: mission.briefing },
    { label: "Context", icon: Target, content: mission.context },
    { label: "Objectives", icon: CheckCircle, content: mission.objectives.join(" • ") },
    { label: "Concepts", icon: BookOpen, content: mission.concepts.join(" • ") },
    { label: "Tables", icon: Code2, content: (mission.tables || []).join(" • ") },
  ]

  return (
    <div className="h-full rounded-xl border border-border bg-surface p-6 flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{mission.difficulty}</span>
          {completed && <span className="text-xs text-success font-medium">Completed</span>}
        </div>
        <h3 className="text-2xl font-bold tracking-tight">{mission.title}</h3>
        <p className="mt-2 text-muted text-sm leading-relaxed">{mission.task}</p>
        {mission.expectedOutput && (
          <div className="mt-3 p-3 rounded-lg border border-border/40 bg-surface-hover">
            <div className="text-[10px] uppercase tracking-wider text-dim font-bold mb-1">Expected output columns</div>
            <div className="text-xs font-mono text-text">{mission.expectedOutput.join(", ")}</div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {sections.map((s) => (
          <div key={s.label} className="pt-2 border-t border-border/50 first:border-0">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-accent/70" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted">{s.label}</span>
            </div>
            <div className="text-sm text-muted leading-relaxed space-y-1">
              {s.content.split(" • ").map((p: string, j: number) => (
                <p key={j} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent/60">•</span> {p}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {completed && xpAwarded && (
        <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-accent">+{xpAwarded} XP</span>
        </div>
      )}
    </div>
  )
}
