/**
 * Progress persistence layer (V1: localStorage).
 *
 * Data is structured so authentication/cloud sync can be added later without
 * redesigning the app: each roadmap tracks per-mission progress, chapter
 * completion is derived, and global XP/achievements live at the top level.
 */

import type {
  ProgressState,
  RoadmapProgress,
  MissionProgress,
  RoadmapId,
  Submission,
} from "../types"

const STORAGE_KEY = "queryville_progress_v1"
const STATE_VERSION = 1

const RANKS = [
  { id: "explorer", title: "Data Explorer", minXp: 0 },
  { id: "junior", title: "Junior Analyst", minXp: 250 },
  { id: "analyst", title: "Data Analyst", minXp: 750 },
  { id: "senior", title: "Senior Analyst", minXp: 1500 },
  { id: "lead", title: "Lead Investigator", minXp: 3000 },
] as const

const XP = {
  firstAttempt: 100,
  afterHints: 70,
  chapterBonus: 150,
  roadmapBonus: 500,
}

const EMPTY_ROADMAP_PROGRESS: RoadmapProgress = {
  roadmapId: "city",
  startedAt: null,
  completedAt: null,
  missions: {},
  chapterCompletions: {},
  xp: 0,
}

const initialState: ProgressState = {
  version: STATE_VERSION,
  userId: "guest",
  roadmaps: {
    city: { ...EMPTY_ROADMAP_PROGRESS, roadmapId: "city" },
    commerce: { ...EMPTY_ROADMAP_PROGRESS, roadmapId: "commerce" },
  },
  submissions: [],
  xp: 0,
  achievements: [],
  updatedAt: new Date().toISOString(),
}

function load(): ProgressState {
  if (typeof localStorage === "undefined") return initialState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    if (parsed.version !== STATE_VERSION) return initialState
    return {
      ...initialState,
      ...parsed,
      roadmaps: {
        city: { ...initialState.roadmaps.city, ...parsed.roadmaps?.city },
        commerce: { ...initialState.roadmaps.commerce, ...parsed.roadmaps?.commerce },
      },
      submissions: parsed.submissions ?? [],
      achievements: parsed.achievements ?? [],
    }
  } catch {
    return initialState
  }
}

function save(state: ProgressState): void {
  if (typeof localStorage === "undefined") return
  state.updatedAt = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getRank(xp: number): (typeof RANKS)[number] {
  let rank: (typeof RANKS)[number] = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r
  }
  return rank
}

export function computeRoadmapProgress(
  missionCount: number,
  chapterCount: number,
  roadmap: RoadmapProgress
): {
  completedMissions: number
  totalMissions: number
  completedChapters: number
  totalChapters: number
  percent: number
  completed: boolean
} {
  const missions = roadmap.missions
  const completedMissions = Object.values(missions).filter((m) => m.completed).length
  const completedChapters = Object.values(roadmap.chapterCompletions).filter(Boolean).length
  const percent = missionCount ? Math.round((completedMissions / missionCount) * 100) : 0
  return {
    completedMissions,
    totalMissions: missionCount,
    completedChapters,
    totalChapters: chapterCount,
    percent,
    completed: completedMissions === missionCount && missionCount > 0,
  }
}

export class ProgressService {
  private state: ProgressState = load()

  getState(): ProgressState {
    return this.state
  }

  getXp(): number {
    return this.state.xp
  }

  getRank() {
    return getRank(this.state.xp)
  }

  getRoadmapProgress(roadmapId: RoadmapId): RoadmapProgress {
    return this.state.roadmaps[roadmapId]
  }

  getMissionProgress(roadmapId: RoadmapId, missionId: string): MissionProgress {
    return this.state.roadmaps[roadmapId].missions[missionId] ?? {
      missionId,
      completed: false,
      completedAt: null,
      attempts: 0,
      bestXp: 0,
      hintsUsed: 0,
    }
  }

  hasCompleted(roadmapId: RoadmapId, missionId: string): boolean {
    return Boolean(this.getMissionProgress(roadmapId, missionId).completed)
  }

  /**
   * Record a challenge attempt. Awards XP based on whether hints were used and
   * whether it was the first correct attempt. Returns the updated mission
   * progress and any XP awarded.
   */
  recordAttempt({
    roadmapId,
    missionId,
    passed,
    xpAwarded,
    hintsUsed,
    attempts,
  }: {
    roadmapId: RoadmapId
    missionId: string
    passed: boolean
    xpAwarded: number
    hintsUsed: number
    attempts: number
  }): { missionProgress: MissionProgress; xpAwarded: number; chapterJustCompleted: boolean } {
    const roadmap = this.state.roadmaps[roadmapId]
    const prior = roadmap.missions[missionId]
    const wasCompleted = prior?.completed ?? false

    const missionProgress: MissionProgress = {
      missionId,
      completed: passed,
      completedAt: passed ? new Date().toISOString() : prior?.completedAt ?? null,
      attempts: attempts,
      bestXp: passed ? Math.max(prior?.bestXp ?? 0, xpAwarded) : prior?.bestXp ?? 0,
      hintsUsed: hintsUsed,
    }

    roadmap.missions[missionId] = missionProgress

    let xpToAdd = 0
    let chapterJustCompleted = false

    if (passed && !wasCompleted) {
      xpToAdd = xpAwarded
      roadmap.xp = (roadmap.xp || 0) + xpAwarded
      this.state.xp = (this.state.xp || 0) + xpAwarded

      // Derive chapter completion: all missions in the chapter completed.
      // Chapter mission ids are not stored here directly; caller passes chapter mission count.
      // We mark chapter completion when this mission completes and all its siblings are done.
      // Caller should call maybeCompleteChapter separately; we return a flag they can set.
    }

    const submission: Submission = {
      missionId,
      roadmapId,
      sql: "", // filled by caller if desired
      passed,
      xpAwarded: passed ? xpAwarded : 0,
      attempts,
      completedAt: new Date().toISOString(),
    }
    this.state.submissions.push(submission)

    save(this.state)
    return { missionProgress, xpAwarded: xpToAdd, chapterJustCompleted }
  }

  markChapterCompleted(roadmapId: RoadmapId, chapterId: string): boolean {
    const roadmap = this.state.roadmaps[roadmapId]
    if (roadmap.chapterCompletions[chapterId]) return false
    roadmap.chapterCompletions[chapterId] = true
    roadmap.xp = (roadmap.xp || 0) + XP.chapterBonus
    this.state.xp = (this.state.xp || 0) + XP.chapterBonus
    save(this.state)
    return true
  }

  completeRoadmap(roadmapId: RoadmapId): void {
    const roadmap = this.state.roadmaps[roadmapId]
    if (roadmap.completedAt) return
    roadmap.completedAt = new Date().toISOString()
    roadmap.xp = (roadmap.xp || 0) + XP.roadmapBonus
    this.state.xp = (this.state.xp || 0) + XP.roadmapBonus
    const achievement = `roadmap-${roadmapId}-complete`
    if (!this.state.achievements.includes(achievement)) {
      this.state.achievements.push(achievement)
    }
    save(this.state)
  }

  startRoadmap(roadmapId: RoadmapId): void {
    const roadmap = this.state.roadmaps[roadmapId]
    if (!roadmap.startedAt) roadmap.startedAt = new Date().toISOString()
    save(this.state)
  }

  reset(): void {
    this.state = initialState
    save(this.state)
  }

  getSubmissionsFor(roadmapId: RoadmapId, missionId: string): Submission[] {
    return this.state.submissions.filter(
      (s) => s.roadmapId === roadmapId && s.missionId === missionId
    )
  }
}

export const progressService = new ProgressService()
