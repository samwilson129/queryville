/**
 * DuckDB-WASM service for Queryville.
 *
 * Manages a single in-memory DuckDB instance per active roadmap. Datasets are
 * loaded from bundled Parquet assets into the WASM virtual filesystem, then
 * exposed as read-only tables. The instance is destroyed/recreated when the
 * user switches roadmaps so each challenge environment contains only the
 * relevant roadmap tables.
 */

import { AsyncDuckDB, createWorker, ConsoleLogger } from "@duckdb/duckdb-wasm"

const WASM_URL = "/dwasm/duckdb-mvp.wasm"
const WORKER_URL = "/dwasm/duckdb-browser-mvp.worker.js"

const ROADMAP_FILES: Record<string, string[]> = {
  city: ["service_requests", "boroughs", "agencies", "complaint_types"],
  commerce: [
    "orders",
    "customers",
    "order_items",
    "payments",
    "reviews",
    "products",
    "sellers",
    "product_category_translation",
  ],
}

const DATASET_BASE: Record<string, string> = {
  city: "/datasets/city",
  commerce: "/datasets/commerce",
}

export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  rowCount: number
  executionTimeMs: number
}

export interface TableSchema {
  name: string
  columns: { name: string; type: string }[]
  rowCount?: number
}

export class DuckDbService {
  // duckdb-wasm's browser types are awkward; we hold the instance as `any`
  // internally and call its methods directly at runtime.
  private db: any = null
  private activeRoadmap: string | null = null
  private initialized = false

  readonly maxRows = 5000

  isInitialized(): boolean {
    return this.initialized
  }

  getActiveRoadmap(): string | null {
    return this.activeRoadmap
  }

  async init(roadmapId: string): Promise<void> {
    if (this.initialized && this.activeRoadmap === roadmapId && this.db) {
      return
    }
    this.destroy()

    const worker = await createWorker(WORKER_URL)
    const db: any = new AsyncDuckDB(new ConsoleLogger(), worker)
    await db.instantiate(WASM_URL)

    const files = ROADMAP_FILES[roadmapId] || []
    const base = DATASET_BASE[roadmapId]

    for (const name of files) {
      const url = `${base}/${name}.parquet`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to load dataset asset: ${url} (${res.status})`)
      }
      const ab = await res.arrayBuffer()
      db.registerFileBuffer(name, new Uint8Array(ab))
    }

    for (const name of files) {
      try {
        await db.query(`CREATE TABLE ${name} AS SELECT * FROM read_parquet('${name}.parquet')`)
      } catch (err) {
        throw new Error(
          `Failed to create table '${name}': ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    this.db = db
    this.activeRoadmap = roadmapId
    this.initialized = true
  }

  async execute(sql: string): Promise<QueryResult> {
    if (!this.db || !this.initialized) {
      throw new Error("DuckDB instance not initialized. Call init(roadmapId) first.")
    }

    const start = performance.now()
    let arrowTable: any
    try {
      const conn = await this.db.connect()
      arrowTable = conn.query(sql)
      conn.close()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : String(err))
    }
    const executionTimeMs = performance.now() - start

    return this.arrowTableToResult(arrowTable, executionTimeMs)
  }

  getSchema(): TableSchema[] {
    if (!this.db || !this.initialized) return []
    const tables: TableSchema[] = []
    try {
      const tableNames: string[] = this.db
        .query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema='main' ORDER BY table_name"
        )
        .toArray()
        .map((r: any) => r.table_name)

      for (const name of tableNames) {
        const cols = this.db
          .query(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='${name}' ORDER BY ordinal_position`
          )
          .toArray()
          .map((r: any) => ({ name: r.column_name, type: r.data_type }))

        let rowCount: number | undefined
        try {
          rowCount = Number(this.db.query(`SELECT COUNT(*) AS c FROM "${name}"`).toArray()[0]?.c) || undefined
        } catch {
          rowCount = undefined
        }

        tables.push({ name, columns: cols, rowCount })
      }
    } catch {
      /* best-effort */
    }
    return tables
  }

  async getSample(tableName: string, limit = 10): Promise<QueryResult> {
    return this.execute(`SELECT * FROM "${tableName}" LIMIT ${limit}`)
  }

  getNullCounts(tableName: string): Record<string, number> {
    if (!this.db) return {}
    const cols = this.getSchema().find((t) => t.name === tableName)?.columns || []
    const result: Record<string, number> = {}
    for (const c of cols) {
      try {
        const n = this.db
          .query(`SELECT COUNT(*) AS c FROM "${tableName}" WHERE "${c.name}" IS NULL`)
          .toArray()[0]?.c
        result[c.name] = Number(n) || 0
      } catch {
        result[c.name] = 0
      }
    }
    return result
  }

  destroy(): void {
    if (this.db) {
      try {
        this.db.disconnect?.()
      } catch {
        /* ignore */
      }
      this.db = null
    }
    this.initialized = false
    this.activeRoadmap = null
  }

  private arrowTableToResult(arrowTable: any, executionTimeMs: number): QueryResult {
    const columns: string[] = []
    const rows: unknown[][] = []

    if (!arrowTable) return { columns, rows, rowCount: 0, executionTimeMs }

    const fields = arrowTable.schema?.fields || arrowTable.schema?._fields || []
    for (const f of fields) {
      columns.push(f.name)
    }

    const n = arrowTable.numRows ?? arrowTable.length ?? 0
    const limit = Math.min(n, this.maxRows)

    for (let i = 0; i < limit; i++) {
      const row: unknown[] = []
      for (const f of fields) {
        const arr = arrowTable.getChild?.(f.name) ?? arrowTable.get?.(f.name)
        row.push(this.extractValue(arr, i))
      }
      rows.push(row)
    }

    return { columns, rows, rowCount: n, executionTimeMs }
  }

  private extractValue(arr: any, index: number): unknown {
    if (!arr) return null
    if (typeof arr.isNull === "function" && arr.isNull(index)) return null
    if (typeof arr.get === "function") {
      try {
        return arr.get(index)
      } catch {
        return null
      }
    }
    return null
  }
}

export const duckDb = new DuckDbService()
