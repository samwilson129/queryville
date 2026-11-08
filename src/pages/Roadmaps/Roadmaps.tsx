import { useProgress } from "@/hooks/useProgress"
import { getRoadmap, getMissionCount, getChapterCount } from "@/hooks/useRoadmaps"
import { Link } from "react-router-dom"
import { Layers, Rocket, Clock, CheckCircle2 } from "lucide-react"

export function Roadmaps() {
  const { getRoadmapProgress } = useProgress()
  const cityProgress = getRoadmapProgress("city")
  const commerceProgress = getRoadmapProgress("commerce")

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roadmaps</h1>
          <p className="mt-2 text-muted">Choose an investigation. Each roadmap is a self-contained campaign with
            its own dataset, chapters, and missions.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <RoadmapCampaignCard
          id="city"
          title="The City Files"
          theme="urban"
          accent="#22c3e6"
          icon={<Layers className="w-6 h-6" />}
          description="Investigate the city using real NYC 311 service requests. Work with the Urban Intelligence Unit to find patterns in public service data."
          progress={cityProgress}
        />
        <RoadmapCampaignCard
          id="commerce"
          title="The Commerce Code"
          theme="commerce"
          accent="#a78bfa"
          icon={<Rocket className="w-6 h-6" />}
          description="Investigate an e-commerce business using the real Olist Brazilian E-Commerce dataset. Analyze orders, customers, products, sellers, and payments."
          progress={commerceProgress}
        />
      </div>

      <div className="mt-12 rounded-xl border border-border bg-surface p-8">
        <h2 className="text-lg font-bold mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-muted">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
            <div>
              <div className="font-medium text-text">Write real SQL</div>
              <div className="mt-0.5">Execute queries against the actual curated dataset in the browser via DuckDB-WASM.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
            <div>
              <div className="font-medium text-text">Result-based grading</div>
              <div className="mt-0.5">Your answer is graded by comparing actual query results — not by matching SQL text.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
            <div>
              <div className="font-medium text-text">Progress persists</div>
              <div className="mt-0.5">XP, completions, and progress save to your browser and survive refresh.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoadmapCampaignCard({ id, title, theme, accent, icon, description, progress }: any) {
  const roadmap = getRoadmap(id)
  const missionCount = getMissionCount(id)
  const chapterCount = getChapterCount(id)
  const completed = progress.missions ? Object.values(progress.missions).filter((m: any) => m.completed).length : 0
  const percent = missionCount ? Math.round((completed / missionCount) * 100) : 0
  const started = Boolean(progress.startedAt)

  return (
    <Link
      to={`/roadmaps/${id}`}
      className="group rounded-xl border border-border bg-surface p-8 hover:bg-surface-hover hover:border-accent/40 transition"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent === "#22c3e6" ? "bg-city/20 text-city" : "bg-commerce/20 text-commerce"}`}>
          {icon}
        </div>
        <span className="ml-auto text-xs font-bold text-accent uppercase tracking-wider">{percent}% complete</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">{theme}</span>
        <span className="ml-auto text-xs text-muted">{chapterCount} chapters • {missionCount} missions</span>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted leading-relaxed mb-6">{description}</p>
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Progress</span>
          <span>{completed}/{missionCount} missions</span>
        </div>
        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden border border-border/50">
          <div className={`h-full bg-accent transition-all duration-700`} style={{ width: percent + "%" }} />
        </div>
      </div>
      <button
        className="w-full py-3 px-4 rounded-xl border border-accent bg-surface text-accent font-semibold text-sm hover:bg-accent hover:text-[rgba(0,16,24,1)] transition"
      >
        {started ? "Continue" : "Start roadmap"}
      </button>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-muted">
        <Clock className="w-3 h-3" />
        <span>Est. {roadmap?.estimatedMinutes} min</span>
      </div>
    </Link>
  )
}
