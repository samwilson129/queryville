import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { Database, Table, List, Info, HelpCircle } from "lucide-react"
import { getRoadmap } from "@/hooks/useRoadmaps"
import { challengeService } from "@/services/challengeService"

export function DatasetExplorer() {
  const { roadmapId } = useParams<{ roadmapId: string }>()
  const roadmap = getRoadmap(roadmapId!)

  const [tables, setTables] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [sample, setSample] = useState<{ columns: string[]; rows: unknown[][] } | null>(null)
  const [nullCounts, setNullCounts] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!roadmapId) return
      try {
        await challengeService.prepareRoadmap(roadmapId)
        const schema = await challengeService.getSchema()
        setTables(schema)
        setSelected((current) => current ?? schema[0]?.name ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    load()
  }, [roadmapId])

  useEffect(() => {
    if (!selected) return
    const loadSample = async () => {
      try {
        const s = await challengeService.getSample(selected, 10)
        setSample({ columns: s.columns, rows: s.rows })
        setNullCounts(await challengeService.getNullCounts(selected))
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    loadSample()
  }, [selected])

  if (!roadmap) {
    return <div className="p-10 text-muted">Dataset not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to={`/roadmaps/${roadmapId}`} className="text-muted hover:text-text text-sm">
            <List size={16} /> Roadmaps
          </Link>
          <span className="text-dim">/</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dataset Explorer</h1>
          <p className="text-sm text-muted">{roadmap.title} — {roadmap.theme}</p>
        </div>
      </div>

      {/* Meta card */}
      <div className="rounded-2xl border border-border bg-surface p-8 mb-10">
        <div className="flex items-start gap-4">
          <Database className={`w-10 h-10 ${roadmap.accentColor === "#22c3e6" ? "text-city" : "text-commerce"} flex-shrink-0`} />
          <div>
            <h2 className="text-lg font-bold">{roadmap.dataset.dataset}</h2>
            <p className="mt-2 text-muted text-sm leading-relaxed">{roadmap.dataset.note}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <span className="flex items-center gap-1"><Info size={14} /> Source</span>
              <span>•</span>
              <span>{roadmap.dataset.extraction_date_utc ? "Extracted " + roadmap.dataset.extraction_date_utc : "Curated snapshot"}</span>
              <span>•</span>
              <span>DuckDB dialect</span>
            </div>
            {roadmap.dataset.limitations && roadmap.dataset.limitations.length > 0 && (
              <div className="mt-3 rounded-lg border border-border/40 bg-surface-hover p-3">
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Limitations</span>
                </div>
                <ul className="text-sm text-muted space-y-1 list-disc list-inside">
                  {roadmap.dataset.limitations.map((l: string, i: number) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Table list */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <Table className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-bold">Tables ({tables.length})</h3>
            </div>
            <div className="space-y-1 max-h-[70vh] overflow-y-auto">
              {tables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelected(t.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition",
                    selected === t.name
                      ? "bg-accent/10 border border-accent/30"
                      : "border-transparent hover:bg-surface-hover"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium text-text">{t.name}</div>
                    <div className="text-[10px] text-muted">{t.rowCount?.toLocaleString() ?? "—"} rows</div>
                  </div>
                  <span className="text-[10px] font-mono text-muted">{t.columns.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schema + sample */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="rounded-xl border border-border bg-surface p-20 flex flex-col items-center justify-center text-muted">
              <List className="w-10 h-10 mb-3 opacity-40" />
              <p>Select a table to inspect its schema and sample data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selected}</h3>
                  <p className="text-sm text-muted">
                    {sample ? sample.rows.length + " sample rows" : ""} • {tables.find((t) => t.name === selected)?.columns.length} columns
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="border-b border-border bg-surface-hover px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                    Schema
                  </div>
                  <div className="overflow-auto max-h-[44vh]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="border-b border-border/40 p-3 text-left text-muted">Column</th>
                          <th className="border-b border-border/40 p-3 text-left text-muted">Type</th>
                          <th className="border-b border-border/40 p-3 text-left text-muted">Nulls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tables.find((t) => t.name === selected)?.columns.map((col: any) => (
                          <tr key={col.name}>
                            <td className="border-b border-border/40 p-3 font-mono">{col.name}</td>
                            <td className="border-b border-border/40 p-3 font-mono text-muted">{col.type}</td>
                            <td className="border-b border-border/40 p-3 font-mono text-muted">
                              {nullCounts[col.name] ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col">
                  <div className="border-b border-border bg-surface-hover px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                    Sample data
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          {(sample?.columns || []).map((col) => (
                            <th key={col} className="border-b border-border/40 p-3 text-left font-mono text-muted uppercase tracking-wider text-[10px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sample?.rows || []).map((row: unknown[], rIdx: number) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="border-b border-border/40 p-3 font-mono text-xs">
                                {cell === null || cell === undefined ? (
                                  <span className="text-dim italic">NULL</span>
                                ) : (
                                  String(cell)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-sm text-muted">
        <p className="mb-2">All statistics are calculated from the actual loaded dataset — nothing is hardcoded.</p>
        <p>The tables shown here are the same tables available in the SQL workspace for this roadmap.</p>
      </div>
    </div>
  )
}

import { cn } from "@/utils/cn"
