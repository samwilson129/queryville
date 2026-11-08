/**
 * Challenge orchestration service.
 *
 * Connects the DuckDB engine, the security layer, and the result-based
 * validator. Keeps SQL execution, validation, and progress concerns separate
 * from UI components.
 */

import { duckDb } from "../engine/duckdb/service"
import { validateSqlSecurity, formatSecurityError } from "../engine/security"
import { gradeSubmission } from "../engine/validator"
import type { Mission, GradingResult } from "../types"

export interface RunResult {
  ok: boolean
  columns: string[]
  rows: unknown[][]
  rowCount: number
  executionTimeMs: number
  error?: string
}

export interface SubmitResult extends GradingResult {
  run: RunResult
}

class ChallengeService {
  private initializedRoadmap: string | null = null

  /** Ensure the DuckDB instance is loaded for the given roadmap. */
  async prepareRoadmap(roadmapId: string): Promise<void> {
    if (this.initializedRoadmap !== roadmapId) {
      await duckDb.init(roadmapId)
      this.initializedRoadmap = roadmapId
    }
  }

  getActiveRoadmap(): string | null {
    return this.initializedRoadmap
  }

  /** Run arbitrary SQL (explorer / playground) against the active roadmap DB. */
  async runSql(sql: string): Promise<RunResult> {
    if (!duckDb.isInitialized()) {
      return { ok: false, columns: [], rows: [], rowCount: 0, executionTimeMs: 0, error: "Database not initialized." }
    }
    const security = validateSqlSecurity(sql)
    if (!security.allowed) {
      return {
        ok: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: formatSecurityError(security.reason),
      }
    }
    try {
      const result = await duckDb.execute(sql)
      return { ok: true, ...result }
    } catch (err) {
      return {
        ok: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  /** Get schema for the dataset explorer. */
  getSchema() {
    return duckDb.getSchema()
  }

  getSample(tableName: string, limit = 10) {
    return duckDb.getSample(tableName, limit)
  }

  getNullCounts(tableName: string) {
    return duckDb.getNullCounts(tableName)
  }

  /** Submit a challenge answer: security check, run user + reference, grade. */
  async submit(mission: Mission, userSql: string): Promise<SubmitResult> {
    const security = validateSqlSecurity(userSql)
    if (!security.allowed) {
      return {
        passed: false,
        score: 0,
        feedback: formatSecurityError(security.reason),
        error: security.reason ?? undefined,
        details: {
          columnMatch: false,
          rowCountMatch: false,
          contentMatch: false,
          userRows: 0,
          expectedRows: 0,
        },
        run: {
          ok: false,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 0,
          error: formatSecurityError(security.reason),
        },
      }
    }

    const runQuery = async (sql: string) => {
      const result = await duckDb.execute(sql)
      return { columns: result.columns, rows: result.rows }
    }

    const run = await this.runSql(userSql)
    const grade = await gradeSubmission({
      userSql,
      referenceSql: mission.referenceSql,
      rule: mission.validation,
      runQuery,
    })

    return { ...grade, run }
  }

  destroy() {
    duckDb.destroy()
    this.initializedRoadmap = null
  }
}

export const challengeService = new ChallengeService()
