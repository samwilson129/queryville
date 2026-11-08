import { useCallback, useState, useEffect } from "react"
import { progressService } from "../services/progressService"
import type { ProgressState, RoadmapId } from "../types"

/**
 * React binding around the progress service. Triggers a re-render whenever
 * progress is saved so the UI reflects completions and XP immediately.
 */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(progressService.getState())

  const refresh = useCallback(() => {
    setState(progressService.getState())
  }, [])

  // Listen for cross-tab / external storage changes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "queryville_progress_v1") refresh()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [refresh])

  return {
    ...state,
    getXp: progressService.getXp.bind(progressService),
    getRank: progressService.getRank.bind(progressService),
    getRoadmapProgress: progressService.getRoadmapProgress.bind(progressService),
    getMissionProgress: progressService.getMissionProgress.bind(progressService),
    hasCompleted: progressService.hasCompleted.bind(progressService),
    recordAttempt: progressService.recordAttempt.bind(progressService),
    markChapterCompleted: progressService.markChapterCompleted.bind(progressService),
    completeRoadmap: progressService.completeRoadmap.bind(progressService),
    startRoadmap: progressService.startRoadmap.bind(progressService),
    reset: progressService.reset.bind(progressService),
    refresh,
  } as ProgressState & {
    getXp: () => number
    getRank: () => { id: string; title: string; minXp: number }
    getRoadmapProgress: (id: RoadmapId) => import("../types").RoadmapProgress
    getMissionProgress: (id: RoadmapId, missionId: string) => import("../types").MissionProgress
    hasCompleted: (id: RoadmapId, missionId: string) => boolean
    recordAttempt: typeof progressService.recordAttempt
    markChapterCompleted: (id: RoadmapId, chapterId: string) => boolean
    completeRoadmap: (id: RoadmapId) => void
    startRoadmap: (id: RoadmapId) => void
    reset: () => void
    refresh: () => void
  }
}
