import { useProgress } from "@/hooks/useProgress"
import { getRoadmap, getMissionCount, getChapterCount, getMission } from "@/hooks/useRoadmaps"
import { Trophy, Zap, Activity } from "lucide-react"
import { Link } from "react-router-dom"

export function Progress() {
  const { xp, getRank, getRoadmapProgress, achievements, reset, submissions } = useProgress()
  const rank = getRank()

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
          <p className="mt-2 text-muted">Your SQL learning journey across both roadmaps.</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-xs text-muted hover:bg-surface-hover transition"
          title="Reset all progress"
        >
          <Zap className="w-4 h-4" /> Reset progress
        </button>
      </div>

      {/* Rank card */}
      <div className="rounded-2xl border border-border bg-surface p-8 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Rank</h2>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-2xl font-bold text-text">{rank.title}</span>
              <span className="px-2 py-0.5 rounded border border-border text-[10px] text-muted uppercase">{rank.minXp} XP floor</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              {xp.toLocaleString()} total XP earned. Complete missions and chapters to level up.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent">{xp.toLocaleString()}</div>
            <div className="text-xs text-muted">Total XP</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Progress to next rank</span>
            <span>{Math.min(100, Math.round((xp / 3000) * 100))}%</span>
          </div>
          <div className="h-3 w-full bg-surface-hover rounded-full overflow-hidden border border-border/50">
            <div className="h-full bg-accent transition-all duration-700" style={{ width: Math.min(100, Math.round((xp / 3000) * 100)) + "%" }} />
          </div>
        </div>
      </div>

      {/* Roadmap progress */}
      <div className="space-y-8">
        {["city", "commerce"].map((id) => {
          const roadmap = getRoadmap(id)
          const progress = getRoadmapProgress(id as any)
          const missionCount = getMissionCount(id)
          const chapterCount = getChapterCount(id)
          const completed = Object.values(progress.missions).filter((m: any) => m.completed).length
          const percent = missionCount ? Math.round((completed / missionCount) * 100) : 0
          return (
            <div key={id} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${roadmap!.accentColor === "#22c3e6" ? "bg-city/20 text-city" : "bg-commerce/20 text-commerce"}`}>
                    {id === "city" ? <Activity className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-text">{roadmap!.title}</h3>
                    <p className="text-xs text-muted">{roadmap!.theme}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-accent">{percent}%</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{completed}/{missionCount} missions</span>
                  <span>{Object.values(progress.chapterCompletions).filter(Boolean).length}/{chapterCount} chapters</span>
                </div>
                <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden border border-border/50">
                  <div className={`h-full bg-accent transition-all duration-700`} style={{ width: percent + "%" }} />
                </div>
              </div>
              <Link
                to={`/roadmaps/${id}`}
                className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:underline"
              >
                Open roadmap <span>→</span>
              </Link>
            </div>
          )
        })}

        {/* Achievements */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Achievements</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: "city-complete", title: "City Files Complete", icon: Activity, earned: achievements.includes("roadmap-city-complete") },
              { id: "commerce-complete", title: "Commerce Code Complete", icon: Trophy, earned: achievements.includes("roadmap-commerce-complete") },
            ].map((a) => (
              <div key={a.id} className={`p-4 rounded-lg border ${a.earned ? "border-accent/40 bg-accent/5" : "border-border/40 bg-surface/50 text-muted"}`}>
                <a.icon className={`w-6 h-6 mb-2 ${a.earned ? "text-accent" : "text-dim"}`} />
                <div className="text-xs font-medium">{a.title}</div>
                <div className="text-[10px] text-muted">{a.earned ? "Earned" : "Locked"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Recent activity</h3>
          <div className="space-y-3">
            {[...submissions].reverse().slice(0, 8).map((s) => {
              const m = getMission(s.missionId)
              return (
                <div key={s.completedAt + s.missionId} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-muted">{m ? m.title : s.missionId}</span>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">
                      {s.passed ? "passed" : "attempt"}
                    </span>
                  </div>
                  <span className={cn("text-xs font-mono", s.passed ? "text-success" : "text-muted")}>
                    {s.passed ? "+" + s.xpAwarded + " XP" : "—"}
                  </span>
                </div>
              )
            })}
            {submissions.length === 0 && (
              <div className="text-muted text-sm text-center py-4">No activity yet. Start solving missions!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { cn } from "@/utils/cn"
