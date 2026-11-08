import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { Play, RefreshCw, Copy, CheckCircle2, XCircle, ArrowLeft, Terminal } from "lucide-react"
import { useProgress } from "@/hooks/useProgress"
import { getMission, getRoadmap } from "@/hooks/useRoadmaps"
import { challengeService } from "@/services/challengeService"
import { SQLEditor } from "@/components/editor/SQLEditor"
import { ResultsTable } from "@/components/results/ResultsTable"
import { MissionPanel } from "@/components/challenge/MissionPanel"
import { HintsPanel } from "@/components/challenge/HintsPanel"
import type { RoadmapId } from "@/types"
import { cn } from "@/utils/cn"

export function Workspace() {
  const { roadmapId } = useParams<{ roadmapId: RoadmapId }>()
  const [searchParams] = useSearchParams()
  const missionId = searchParams.get("mission")!

  const roadmap = getRoadmap(roadmapId!)
  const mission = getMission(missionId)
  if (!roadmap || !mission || !roadmapId) {
    return (
      <div className="p-10 rounded-xl border border-border bg-surface">
        <h2 className="text-lg font-bold">Mission not found</h2>
        <Link to="/roadmaps" className="mt-4 inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft size={16} /> Back to roadmaps
        </Link>
      </div>
    )
  }

  const rmId: RoadmapId = roadmapId

  const {
    startRoadmap,
    recordAttempt,
    markChapterCompleted,
    completeRoadmap,
    hasCompleted,
    getMissionProgress,
    xp,
    getRank,
  } = useProgress()

  const [sql, setSql] = useState(mission.starterSql)
  const [runResult, setRunResult] = useState<{ columns: string[]; rows: unknown[][]; rowCount: number; executionTimeMs: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ passed: boolean; score: number; feedback: string; details: any } | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [unlockedHints, setUnlockedHints] = useState(0)

  const progress = getMissionProgress(rmId, missionId)
  const completed = progress.completed
  const hintsUsed = progress.hintsUsed

  useEffect(() => {
    startRoadmap(rmId)
  }, [startRoadmap, rmId])

  const initDb = useCallback(async () => {
    await challengeService.prepareRoadmap(rmId)
  }, [rmId])

  useEffect(() => {
    initDb()
  }, [initDb])

  const handleRun = async () => {
    setSubmitResult(null)
    setError(null)
    const result = await challengeService.runSql(sql)
    if (!result.ok) {
      setError(result.error!)
      setRunResult(null)
    } else {
      setRunResult({ columns: result.columns, rows: result.rows, rowCount: result.rowCount, executionTimeMs: result.executionTimeMs })
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const result = await challengeService.submit(mission, sql)
      setSubmitResult({ passed: result.passed, score: result.score, feedback: result.feedback, details: result.details })

      if (result.passed && !completed) {
        const attempts = progress.attempts + 1
        const xpAwarded = hintsUsed > 0 ? 70 : 100
        recordAttempt({
          roadmapId: rmId,
          missionId,
          passed: true,
          xpAwarded,
          hintsUsed,
          attempts,
        })

        const chapter = roadmap.chapters.find((c: any) => c.missionIds.includes(missionId))
        if (chapter) {
          const allDone = chapter.missionIds.every((mid: string) => hasCompleted(rmId, mid))
          if (allDone) {
            markChapterCompleted(rmId, chapter.id)
          }
        }

        const allMissions = roadmap.chapters.flatMap((c: any) => c.missionIds)
        if (allMissions.every((mid: string) => hasCompleted(rmId, mid))) {
          completeRoadmap(rmId)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlockHint = () => {
    setUnlockedHints((p) => Math.min(p + 1, mission.hints.length))
  }

  const handleReset = () => {
    setSql(mission.starterSql)
    setRunResult(null)
    setError(null)
    setSubmitResult(null)
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] overflow-hidden">
      <aside className="lg:w-[40%] border-r border-border bg-surface flex flex-col overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeft size={16} className="text-muted" />
          <Link to={`/roadmaps/${rmId}`} className="text-sm font-medium text-muted hover:text-text">
            Back to {roadmap.title}
          </Link>
        </div>
        <MissionPanel mission={mission} completed={completed} xpAwarded={completed ? (hintsUsed > 0 ? 70 : 100) : undefined} />
        <div className="mt-auto">
          <HintsPanel
            hints={mission.hints}
            hintsUsed={hintsUsed}
            unlockedHints={unlockedHints}
            onUnlockHint={handleUnlockHint}
            showSolution={showSolution}
            solution={mission.solution}
            onShowSolution={() => setShowSolution(true)}
          />
        </div>
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-surface/90 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-accent" />
            <div>
              <h2 className="font-bold text-text">SQL Workspace</h2>
              <p className="text-xs text-muted">Execute against {roadmap.title} dataset</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:bg-surface-hover transition disabled:opacity-50"
            >
              <RefreshCw size={14} /> Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || completed}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed",
                submitting || completed
                  ? "bg-surface-hover text-muted border-border"
                  : "bg-accent text-[rgba(0,16,24,1)] hover:bg-accent border-accent"
              )}
            >
              {submitting ? "Submitting..." : completed ? "Completed" : "Submit answer"}
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 border-b border-border p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">SQL Editor</h3>
            <span className="text-xs text-muted">Ctrl+Enter to run</span>
          </div>
          <div className="rounded-xl border border-border bg-[rgb(30,33,40)] overflow-hidden shadow">
            <SQLEditor value={sql} onChange={setSql} onRun={handleRun} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={submitting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium hover:bg-surface-hover transition disabled:opacity-50"
            >
              <Play size={14} /> Run query
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(sql)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:bg-surface-hover transition"
              title="Copy SQL"
            >
              <Copy size={14} />
            </button>
            <span className="ml-auto text-xs text-muted">{sql.length} characters</span>
          </div>
        </div>

        <div className="h-[42%] min-h-[300px] border-t border-border p-6 overflow-y-auto bg-surface">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Results</h3>
          {submitResult && (
            <div className="rounded-xl border p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                {submitResult.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-danger" />
                )}
                <span className={cn("text-sm font-semibold", submitResult.passed ? "text-success" : "text-danger")}>
                  {submitResult.passed ? "Correct!" : "Not quite"}
                </span>
              </div>
              <p className="text-sm text-muted">{submitResult.feedback}</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-danger shrink-0">!</div>
                <p className="text-sm text-danger">{error}</p>
              </div>
            </div>
          )}
          {runResult && (
            <ResultsTable
              columns={runResult.columns}
              rows={runResult.rows}
              rowCount={runResult.rowCount}
              executionTimeMs={runResult.executionTimeMs}
            />
          )}
          {!runResult && !error && !submitResult && (
            <div className="h-full flex flex-col items-center justify-center text-muted text-sm">
              <p>Run a query to see results here.</p>
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-surface/90 px-6 py-3 shrink-0 flex items-center justify-between text-xs text-muted">
          <span>{xp.toLocaleString()} XP • {getRank().title}</span>
          <span>Read-only environment — dataset cannot be modified</span>
        </footer>
      </section>
    </div>
  )
}
