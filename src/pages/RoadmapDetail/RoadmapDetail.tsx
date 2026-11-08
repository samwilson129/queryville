import { useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ChevronRight, Clock, Layers, Rocket } from "lucide-react"
import { useProgress } from "@/hooks/useProgress"
import { getRoadmap, getMission, getChapterMissionIds, getMissionCount } from "@/hooks/useRoadmaps"
import type { RoadmapId } from "@/types"
import { cn } from "@/utils/cn"

export function RoadmapDetail() {
  const { roadmapId } = useParams<{ roadmapId: RoadmapId }>()
  const navigate = useNavigate()
  const { getRoadmapProgress, hasCompleted, startRoadmap } = useProgress()

  if (!roadmapId) return <div className="p-10 text-muted">Invalid roadmap.</div>

  const roadmap = getRoadmap(roadmapId)
  if (!roadmap) return <div className="p-10 text-muted">Roadmap not found.</div>

  const progress = getRoadmapProgress(roadmapId)
  const missionCount = getMissionCount(roadmapId)
  const completed = progress.missions
    ? Object.values(progress.missions).filter((m: any) => m.completed).length
    : 0
  const percent = missionCount ? Math.round((completed / missionCount) * 100) : 0

  useEffect(() => {
    startRoadmap(roadmapId)
  }, [startRoadmap, roadmapId])

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/roadmaps" className="text-muted hover:text-text text-sm">
            <ChevronRight size={16} /> Roadmaps
          </Link>
          <span className="text-dim">/</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
          <p className="mt-1 text-sm text-muted">{roadmap.theme}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={cn("flex items-center gap-1 px-2 py-1 rounded border", "bg-surface-hover border-border text-muted")}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> {percent}% complete
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 mb-10">
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", roadmap.accentColor === "#22c3e6" ? "bg-city/20 text-city" : "bg-commerce/20 text-commerce")}>
            {roadmap.id === "city" ? <Layers className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold">{roadmap.title}</h2>
            <p className="mt-2 text-muted leading-relaxed max-w-xl">{roadmap.narrative}</p>
            <div className="mt-5 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1"><Clock size={14} /> Est. {roadmap.estimatedMinutes} min</span>
              <span>•</span>
              <span>{roadmap.chapters.length} chapters • {missionCount} missions</span>
              <span>•</span>
              <span>DuckDB dialect</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {roadmap.chapters.map((chapter) => {
          const missionIds = getChapterMissionIds(roadmapId, chapter.id)
          const chapterMissions = missionIds.map((mid: string) => getMission(mid)).filter(Boolean) as any[]
          const completedInChapter = chapterMissions.filter((m: any) => hasCompleted(roadmapId, m.id)).length
          const chapterDone = completedInChapter === chapterMissions.length && chapterMissions.length > 0

          return (
            <div key={chapter.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="border-b border-border/60 bg-surface-hover px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("flex items-center justify-center w-8 h-8 rounded-full", chapterDone ? "bg-accent text-[rgba(0,16,24,1)]" : "bg-surface-hover text-muted border border-border")}>
                    {chapter.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-text">{chapter.title}</h3>
                    <p className="text-xs text-muted">{chapter.narrative}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold">{completedInChapter}/{chapterMissions.length}</div>
                  <div className="text-[10px] text-muted">{chapterDifficultyLabel(chapter.difficulty)}</div>
                </div>
              </div>
              <div className="px-6 py-5 grid md:grid-cols-3 gap-4">
                {missionIds.map((mid: string, i: number) => {
                  const m = getMission(mid)! as any
                  const done = hasCompleted(roadmapId, mid)
                  const prevId = i === 0 ? null : missionIds[i - 1]
                  const unlocked = i === 0 || hasCompleted(roadmapId, prevId!)
                  return (
                    <MissionNode
                      key={mid}
                      mission={m}
                      done={done}
                      unlocked={unlocked}
                      onStart={() => navigate(`/roadmaps/${roadmapId}/workspace?mission=${mid}`)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-sm text-muted">
        <p>Missions unlock sequentially within each chapter. You can revisit completed missions at any time. XP and
          progress persist in your browser and survive refresh.</p>
      </div>
    </div>
  )
}

function chapterDifficultyLabel(d: string) {
  const labels: Record<string, string> = {
    Beginner: "Beginner",
    "Beginner to intermediate": "Beginner–intermediate",
    Intermediate: "Intermediate",
    Advanced: "Advanced",
    Expert: "Expert",
  }
  return labels[d] || d
}

function MissionNode({ mission, done, unlocked, onStart }: any) {
  return (
    <button
      onClick={unlocked ? onStart : undefined}
      disabled={!unlocked}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border p-4 transition",
        done
          ? "border-accent/40 bg-accent/5"
          : unlocked
            ? "border-border hover:border-accent/50 hover:bg-surface-hover"
            : "border-border/40 bg-surface/50 text-muted",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">{mission.number}</span>
          {done && <span className="w-3 h-3 text-accent">✓</span>}
          {!unlocked && <span className="w-3 h-3 text-muted">🔒</span>}
        </div>
        {!done && unlocked && <span className="w-3 h-3 text-accent/60">▶</span>}
      </div>
      <h4 className="font-semibold text-sm leading-tight">{mission.title}</h4>
      <p className="text-xs text-muted line-clamp-2">{mission.briefing}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent/70">{mission.difficulty}</span>
        <span className="text-[10px] text-muted">{mission.xp} XP</span>
      </div>
    </button>
  )
}
