import { useProgress } from "@/hooks/useProgress"
import { getRoadmap } from "@/hooks/useRoadmaps"
import { Link } from "react-router-dom"
import { Rocket, Database, Layers, Code2, Activity } from "lucide-react"

export function Home() {
  const { xp, getRank, getRoadmapProgress } = useProgress()
  const rank = getRank()

  const city = getRoadmap("city")
  const commerce = getRoadmap("commerce")
  const cityProgress = getRoadmapProgress("city")
  const commerceProgress = getRoadmapProgress("commerce")

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-text">
      {/* Background subtle grid */}
      <div className="fixed inset-0 -z-10 opacity-30" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a00,#1e293b40,#0f172a00)]"></div>
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_50%,_black_70%,_transparent)]" />
      </div>

      <nav className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 rounded-lg border border-border bg-accent/10 px-3 py-1.5 text-accent font-medium text-sm hover:bg-accent/20">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Queryville
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/roadmaps" className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-sm font-medium transition">Roadmaps</Link>
            <a href="#" className="text-xs text-muted">About</a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-10 space-y-12">
        {/* Hero */}
        <section className="relative rounded-2xl border border-border bg-surface p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl" aria-hidden="true"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-hover text-xs text-accent font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              V1 now live
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              SQL makes more sense when the data <span className="text-accent">is real.</span>
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              Explore real-world datasets, follow structured SQL roadmaps, and solve investigations that make you
              think like a data analyst. No simulations — you write and execute actual SQL against curated,
              attributed public datasets.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/roadmaps" className="px-7 py-3 bg-accent text-[rgba(0,16,24,1)] rounded-xl font-semibold text-sm hover:bg-accent hover:shadow-[0_0_24px_rgba(34,195,230,0.4)] transition">Explore Roadmaps</Link>
              <a href="#" className="px-7 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-medium transition">See How It Works</a>
            </div>
          </div>
        </section>

        {/* Progress bar */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Your progress</span>
            <span className="text-xs text-muted">{xp} XP • {rank.title}</span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-3 overflow-hidden border border-border/50">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: Math.min(100, Math.round(xp / 3000 * 100)) + "%" }} />
          </div>
        </section>

        {/* Roadmaps preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Pick your investigation</h2>
            <p className="text-sm text-muted">Two real datasets. Two complete roadmaps.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <RoadmapCard
              roadmap={city!}
              progress={cityProgress}
              accent={city!.accentColor}
            />
            <RoadmapCard
              roadmap={commerce!}
              progress={commerceProgress}
              accent={commerce!.accentColor}
            />
          </div>
        </section>

        {/* Curriculum preview */}
        <section className="rounded-xl border border-border bg-surface p-8 md:p-10">
          <h2 className="text-xl font-bold mb-6">A sensible SQL progression</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <CurriculumCol
              title="Fundamentals → Filtering"
              icon={Code2}
              items={["SELECT / FROM / LIMIT", "DISTINCT & aliases", "WHERE · AND / OR / NOT", "LIKE · IN · BETWEEN", "ORDER BY · ASC / DESC"]}
            />
            <CurriculumCol
              title="Aggregation → Joins"
              icon={Database}
              items={["COUNT · SUM · AVG · MIN · MAX", "GROUP BY · HAVING", "CASE WHEN · COALESCE", "INNER / LEFT / FULL JOIN", "Subqueries · CTEs"]}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <CurriculumCol
              title="Windows → Analytics"
              icon={Activity}
              items={["ROW_NUMBER · RANK · DENSE_RANK", "LAG · LEAD", "Running totals · Moving avg", "Period-over-period", "Multi-CTE analysis"]}
            />
            <CurriculumCol
              title="Real data, real feedback"
              icon={Layers}
              items={["Result-based grading (not keyword matching)", "Hints & explanations", "Schema explorer", "XP & progress tracking", "DuckDB dialect"]}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <span>Queryville V1 — Educational project</span>
          <div className="flex gap-6">
            <span>NYC 311 OpenData</span>
            <span>Olist Brazilian E-Commerce</span>
            <span>DuckDB-WASM</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function RoadmapCard({ roadmap, progress, accent }: { roadmap: any; progress: any; accent: string }) {
  const missionCount = roadmap.chapters.reduce((s: number, c: any) => s + c.missionIds.length, 0)
  const completed = progress.missions ? Object.values(progress.missions).filter((m: any) => m.completed).length : 0
  const percent = missionCount ? Math.round((completed / missionCount) * 100) : 0
  const started = Boolean(progress.startedAt)

  return (
    <Link
      to={`/roadmaps/${roadmap.id}`}
      className="group block rounded-xl border border-border bg-surface p-6 hover:bg-surface-hover hover:border-accent/40 transition"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg ${accent === "#22c3e6" ? "bg-city/20 text-city" : "bg-commerce/20 text-commerce"}`}>
          {roadmap.id === "city" ? <Layers className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
        </div>
        <span className="ml-auto text-xs font-medium text-accent">{percent}%</span>
      </div>
      <h3 className="text-lg font-bold">{roadmap.title}</h3>
      <p className="mt-2 text-sm text-muted line-clamp-2">{roadmap.narrative.split(".")[0]}.</p>
      <div className="mt-5 flex items-center justify-between text-xs text-muted">
        <span>{missionCount} missions • {roadmap.chapters.length} chapters</span>
        <span>{roadmap.theme}</span>
      </div>
      <div className="mt-3 h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
        <div className={`h-full bg-accent transition-all duration-700`} style={{ width: percent + "%" }} />
      </div>
      <p className="mt-3 text-xs font-medium">
        {started ? "Continue investigating" : "Start roadmap"}
      </p>
    </Link>
  )
}

function CurriculumCol({ title, icon: Icon, items }: { title: string; icon: any; items: string[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-sm font-bold">{title}</span>
      </div>
      <ul className="space-y-1 text-sm text-muted">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5 pl-2">
            <span className="text-accent/60">›</span> {it}
          </li>
        ))}
      </ul>
    </div>
  )
}
