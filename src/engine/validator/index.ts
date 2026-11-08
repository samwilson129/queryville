/**
 * Queryville result-based grading engine.
 *
 * Grades by executing the user's query and the reference query against the
 * same dataset and comparing actual result sets — never by matching SQL text
 * or keywords.
 *
 * Comparison rules (per challenge):
 *  - columnOrderMatters: do column names/order need to match exactly?
 *  - rowOrderMatters: does row order matter? (ORDER BY required)
 *  - duplicateRowsMatter: are duplicate rows significant?
 *  - numericTolerance: float comparison tolerance (default 1e-6)
 *
 * NULLs are treated as equal to NULL. Rows are compared as multisets unless
 * order matters.
 */

import type { GradingResult, ValidationRule } from "../../types"

const DEFAULT_NUMERIC_TOLERANCE = 1e-6

export interface ComparisonDetail {
  columnMatch: boolean
  rowCountMatch: boolean
  contentMatch: boolean
  userRows: number
  expectedRows: number
  sampleMismatch?: Array<{ user: unknown[]; expected: unknown[] }>
}

function valuesEqual(a: unknown, b: unknown, tolerance: number): boolean {
  if (a === null && b === null) return true
  if (a === null || b === null) return false

  const na = Number(a)
  const nb = Number(b)
  const aIsNum = typeof a === "number" || (typeof a === "string" && !isNaN(na) && a.trim() !== "")
  const bIsNum = typeof b === "number" || (typeof b === "string" && !isNaN(nb) && b.trim() !== "")

  if (aIsNum && bIsNum) {
    return Math.abs(na - nb) <= tolerance
  }
  return String(a) === String(b)
}

function rowEqual(r1: unknown[], r2: unknown[], tolerance: number): boolean {
  if (r1.length !== r2.length) return false
  for (let i = 0; i < r1.length; i++) {
    if (!valuesEqual(r1[i], r2[i], tolerance)) return false
  }
  return true
}

function columnNamesMatch(cols1: string[], cols2: string[]): boolean {
  if (cols1.length !== cols2.length) return false
  for (let i = 0; i < cols1.length; i++) {
    if (String(cols1[i]).toLowerCase() !== String(cols2[i]).toLowerCase()) return false
  }
  return true
}

/**
 * Compare two result sets given validation rules.
 */
export function compareResults(
  user: { columns: string[]; rows: unknown[][] },
  expected: { columns: string[]; rows: unknown[][] },
  rule: ValidationRule
): ComparisonDetail {
  const tolerance = rule.numericTolerance ?? DEFAULT_NUMERIC_TOLERANCE

  const columnMatch = rule.columnOrderMatters
    ? columnNamesMatch(user.columns, expected.columns)
    : user.columns.length === expected.columns.length &&
        user.columns
          .map((c) => c.toLowerCase())
          .sort()
          .join(",") ===
          expected.columns
            .map((c) => c.toLowerCase())
            .sort()
            .join(",")

  const userRows = user.rows
  const expectedRows = expected.rows
  const rowCountMatch = userRows.length === expectedRows.length

  let contentMatch = false
  const sampleMismatch: Array<{ user: unknown[]; expected: unknown[] }> = []

  if (rule.rowOrderMatters) {
    // Ordered comparison: rows must match position-by-position.
    const len = Math.min(userRows.length, expectedRows.length)
    let mismatches = 0
    for (let i = 0; i < len; i++) {
      if (!rowEqual(userRows[i], expectedRows[i], tolerance)) {
        mismatches++
        if (sampleMismatch.length < 5) {
          sampleMismatch.push({ user: userRows[i], expected: expectedRows[i] })
        }
      }
    }
    contentMatch =
      rowCountMatch && mismatches === 0 && userRows.length === expectedRows.length
  } else {
    // Order-independent multiset comparison.
    const consumed = new Array(expectedRows.length).fill(false)
    let matched = 0
    for (const ur of userRows) {
      let found = -1
      for (let j = 0; j < expectedRows.length; j++) {
        if (consumed[j]) continue
        if (rowEqual(ur, expectedRows[j], tolerance)) {
          found = j
          break
        }
      }
      if (found >= 0) {
        consumed[found] = true
        matched++
      } else if (sampleMismatch.length < 5) {
        sampleMismatch.push({ user: ur, expected: expectedRows[0] })
      }
    }

    if (rule.duplicateRowsMatter) {
      contentMatch = rowCountMatch && matched === expectedRows.length
    } else {
      // Duplicates don't matter: compare distinct rows only.
      const distinctUser = uniqueRows(userRows, tolerance)
      const distinctExpected = uniqueRows(expectedRows, tolerance)
      contentMatch = distinctUser.length === distinctExpected.length
      // verify each distinct expected appears in user
      if (contentMatch) {
        for (const er of distinctExpected) {
          if (!distinctUser.some((ur) => rowEqual(ur, er, tolerance))) {
            contentMatch = false
            break
          }
        }
      }
    }
  }

  return {
    columnMatch,
    rowCountMatch,
    contentMatch,
    userRows: userRows.length,
    expectedRows: expectedRows.length,
    sampleMismatch: sampleMismatch.length ? sampleMismatch : undefined,
  }
}

function uniqueRows(rows: unknown[][], tolerance: number): unknown[][] {
  const unique: unknown[][] = []
  for (const r of rows) {
    if (!unique.some((u) => rowEqual(u, r, tolerance))) {
      unique.push(r)
    }
  }
  return unique
}

/**
 * Grade a user submission against a reference result.
 * `runQuery` executes SQL against the live DuckDB instance and returns {columns, rows}.
 */
export async function gradeSubmission({
  userSql,
  referenceSql,
  rule,
  runQuery,
}: {
  userSql: string
  referenceSql: string
  rule: ValidationRule
  runQuery: (sql: string) => Promise<{ columns: string[]; rows: unknown[][] }>
}): Promise<GradingResult> {
  let expected: { columns: string[]; rows: unknown[][] }
  let user: { columns: string[]; rows: unknown[][] }

  try {
    expected = await runQuery(referenceSql)
  } catch (err) {
    return {
      passed: false,
      score: 0,
      feedback: "The reference query could not be executed. Please contact support.",
      error: err instanceof Error ? err.message : String(err),
      details: { columnMatch: false, rowCountMatch: false, contentMatch: false, userRows: 0, expectedRows: 0 },
    }
  }

  try {
    user = await runQuery(userSql)
  } catch (err) {
    return {
      passed: false,
      score: 0,
      feedback: `Your query returned an error: ${err instanceof Error ? err.message : String(err)}`,
      error: err instanceof Error ? err.message : String(err),
      details: {
        columnMatch: false,
        rowCountMatch: false,
        contentMatch: false,
        userRows: 0,
        expectedRows: expected.rows.length,
      },
    }
  }

  const details = compareResults(user, expected, rule)
  const passed = details.columnMatch && details.rowCountMatch && details.contentMatch

  const score = passed ? 100 : partialScore(details)
  const feedback = buildFeedback(passed, details)

  return { passed, score, feedback, details }
}

function partialScore(d: ComparisonDetail): number {
  let score = 0
  if (d.columnMatch) score += 25
  if (d.rowCountMatch) score += 25
  if (d.contentMatch) score += 50
  return score
}

function buildFeedback(passed: boolean, d: ComparisonDetail): string {
  if (passed) {
    return "Correct! Your results match the expected output."
  }

  const parts: string[] = []
  if (!d.columnMatch) {
    parts.push("Your result columns don't match the expected output.")
  }
  if (!d.rowCountMatch) {
    parts.push(
      `Row count mismatch: your query returned ${d.userRows} row(s), expected ${d.expectedRows}.`
    )
  }
  if (!d.contentMatch) {
    if (d.rowCountMatch) {
      parts.push("The row count is right, but some values differ from the expected results.")
    } else {
      parts.push("Your results don't match the expected output.")
    }
  }
  if (d.sampleMismatch && d.sampleMismatch.length) {
    parts.push("Review the expected vs. your values in the feedback panel.")
  }

  return parts.join(" ") || "Your results don't match the expected output. Try again."
}
