import { Eye } from "lucide-react"
import type { Hint } from "@/types"

interface HintsPanelProps {
  hints: Hint[]
  hintsUsed: number
  unlockedHints: number
  onUnlockHint: () => void
  showSolution: boolean
  solution?: string
  onShowSolution: () => void
}

export function HintsPanel({
  hints,
  hintsUsed,
  unlockedHints,
  onUnlockHint,
  showSolution,
  solution,
  onShowSolution,
}: HintsPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Hints</h3>
        <span className="text-xs text-muted">{Math.min(hintsUsed, hints.length)}/{hints.length}</span>
      </div>

      {showSolution && solution ? (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Reference solution</span>
            </div>
            <pre className="overflow-x-auto text-xs font-mono text-text whitespace-pre-wrap">{solution}</pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {hints.map((text, i) => {
            const unlocked = i < unlockedHints
            return (
              <div
                key={i}
                className={cn(
                  "group relative p-3 rounded-lg border transition",
                  unlocked
                    ? "border-accent/50 bg-accent/5"
                    : "border-border/50 hover:border-accent/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Hint {i + 1}
                  </span>
                  {!unlocked && i === unlockedHints && (
                    <button
                      onClick={onUnlockHint}
                      className="text-xs text-accent hover:underline"
                    >
                      Unlock
                    </button>
                  )}
                </div>
                <div className={cn("text-sm text-muted leading-relaxed", unlocked ? "text-text" : "text-dim")}>
                  {unlocked ? text : "Complete the previous hint to reveal this one."}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!showSolution && unlockedHints === hints.length && (
        <button
          onClick={onShowSolution}
          className="w-full py-2 rounded-lg border border-border bg-surface-hover text-xs text-muted hover:text-accent hover:bg-accent/5 transition"
        >
          Show solution
        </button>
      )}
    </div>
  )
}

import { cn } from "@/utils/cn"
