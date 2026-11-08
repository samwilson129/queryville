/**
 * SQL security layer for Queryville.
 *
 * Only read-only SELECT statements (including CTEs, subqueries, UNION) are
 * permitted. Destructive / DDL / file-access statements are rejected before
 * they ever reach DuckDB.
 *
 * Uses node-sql-parser to inspect the AST rather than naive string matching,
 * then runs a secondary keyword guard for defense in depth.
 */

import { Parser } from "node-sql-parser"

const parser = new Parser()

// SQL AST ast types we allow as top-level statements.
const ALLOWED_AST_TYPES = new Set([
  "select",
  "with", // CTE-led queries parsed as 'with' by some dialects
  "union",
  "except",
  "intersect",
])

// Destructive keywords that must never appear (defense-in-depth).
const BANNED_KEYWORDS = [
  "DROP",
  "DELETE",
  "UPDATE",
  "INSERT",
  "CREATE",
  "ALTER",
  "ATTACH",
  "COPY",
  "EXPORT",
  "INSTALL",
  "LOAD",
  "PRAGMA",
  "SET ",
  "SET ",
  "VACUUM",
  "REPLACE",
]

const BANNED_PATTERNS = [
  /read_csv\s*\(/i,
  /read_json\s*\(/i,
  /read_parquet\s*\(/i, // users must not read arbitrary files
  /copy\s+.*\s+to/i,
  /export\s+/i,
  /\battach\b/i,
  /\bpragma\b/i,
]

export interface SecurityCheck {
  allowed: boolean
  reason: string | null
  statementType: string | null
}

/**
 * Keyword guard: checks raw SQL for banned statement keywords at statement
 * boundaries. Returns null if clean, or the banned keyword found.
 */
function keywordGuard(sql: string): string | null {
  const upper = sql.toUpperCase()
  for (const kw of BANNED_KEYWORDS) {
    // Match keyword at start or after a semicolon (statement boundary).
    const re = new RegExp(`(^|;)\\s*${kw}\\b`, "i")
    if (re.test(upper)) return kw
  }
  for (const pat of BANNED_PATTERNS) {
    if (pat.test(sql)) return pat.source
  }
  return null
}

export function validateSqlSecurity(sql: string): SecurityCheck {
  const trimmed = sql.trim()
  if (!trimmed) {
    return { allowed: false, reason: "Empty query.", statementType: null }
  }

  const keywordHit = keywordGuard(trimmed)
  if (keywordHit) {
    return {
      allowed: false,
      reason: `Blocked statement: '${keywordHit}' is not permitted in the read-only workspace.`,
      statementType: keywordHit,
    }
  }

  let ast: any
  try {
    ast = parser.astify(trimmed)
  } catch (err) {
    // If the parser can't handle it, reject rather than risk an unsafe pass-through.
    return {
      allowed: false,
      reason: "Unable to parse SQL statement. Only read-only SELECT queries are allowed.",
      statementType: null,
    }
  }

  const statements = Array.isArray(ast) ? ast : [ast]
  for (const stmt of statements) {
    const type = stmt?.stmt_type || stmt?.type
    if (!type || !ALLOWED_AST_TYPES.has(type)) {
      return {
        allowed: false,
        reason: `Only read-only SELECT queries are allowed. '${type}' statements are not permitted.`,
        statementType: type,
      }
    }
  }

  return { allowed: true, reason: null, statementType: statements[0]?.stmt_type || null }
}

export function formatSecurityError(reason: string | null): string {
  return `🔒 Query blocked — ${reason ?? "this statement is not permitted"}`
}
