/* Shared domain types for Queryville */

export type RoadmapId = "city" | "commerce"

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
}

export interface TableInfo {
  name: string
  rowCount?: number
  columns: ColumnInfo[]
}

export interface DatasetMeta {
  dataset: string
  source: string
  mirror?: string
  api?: string
  attribution: string
  extraction_date_utc?: string
  date_range?: { earliest?: string | null; latest?: string | null }
  note?: string
  limitations?: string[]
  tables?: Record<string, { rows: number; columns: string[]; source_file?: string }>
  primary_keys?: Record<string, string[]>
  foreign_keys?: Array<{
    from_table: string
    from_column: string
    to_table: string
    to_column: string
  }>
}

export type Difficulty = "Beginner" | "Beginner to intermediate" | "Intermediate" | "Advanced" | "Expert"

export type Hint = string

export interface ValidationRule {
  columnOrderMatters: boolean
  rowOrderMatters: boolean
  duplicateRowsMatter: boolean
  numericTolerance?: number
}

export interface Mission {
  id: string
  number: number
  title: string
  difficulty: Difficulty
  briefing: string
  context: string
  objectives: string[]
  concepts: string[]
  tables: string[] // relevant table names
  columns?: Record<string, string[]> // table -> columns
  task: string
  expectedOutput?: string[]
  starterSql: string
  referenceSql: string
  hints: Hint[]
  solution: string
  xp: number
  validation: ValidationRule
  roadmapId: RoadmapId
  chapterId: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  difficulty: Difficulty
  narrative: string
  missionIds: string[]
}

export interface Roadmap {
  id: RoadmapId
  title: string
  theme: string
  narrative: string
  dataset: DatasetMeta
  chapters: Chapter[]
  conceptOrder: string[]
  estimatedMinutes: number
  accentColor: string
}

export interface GradingResult {
  passed: boolean
  score: number // 0-100
  feedback: string
  details?: {
    rowCountMatch: boolean
    columnMatch: boolean
    contentMatch: boolean
    userRows: number
    expectedRows: number
    sampleMismatch?: Array<{ user: unknown[]; expected: unknown[] }>
  }
  error?: string
}

export interface Submission {
  missionId: string
  roadmapId: RoadmapId
  sql: string
  passed: boolean
  xpAwarded: number
  attempts: number
  completedAt: string
}

export interface ProgressState {
  version: number
  userId: string // guest id
  roadmaps: Record<RoadmapId, RoadmapProgress>
  submissions: Submission[]
  xp: number
  achievements: string[]
  updatedAt: string
}

export interface RoadmapProgress {
  roadmapId: RoadmapId
  startedAt: string | null
  completedAt: string | null
  missions: Record<string, MissionProgress>
  chapterCompletions: Record<string, boolean>
  xp: number
}

export interface MissionProgress {
  missionId: string
  completed: boolean
  completedAt: string | null
  attempts: number
  bestXp: number
  hintsUsed: number
  sql?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
}

export interface EditorTheme {
  name: string
}
