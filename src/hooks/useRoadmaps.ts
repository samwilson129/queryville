import { cityRoadmap } from "../data/roadmaps/city"
import { commerceRoadmap } from "../data/roadmaps/commerce"
import { cityMissions } from "../data/challenges/city"
import { commerceMissions } from "../data/challenges/commerce"
import type { Roadmap, Mission } from "../types"

const missionById: Record<string, Mission> = {}
for (const m of [...cityMissions, ...commerceMissions]) {
  missionById[m.id] = m
}

export const roadmaps: Record<string, Roadmap> = {
  city: cityRoadmap,
  commerce: commerceRoadmap,
}

export function getRoadmap(id: string): Roadmap | undefined {
  return roadmaps[id]
}

export function getMission(id: string): Mission | undefined {
  return missionById[id]
}

export function getMissionCount(roadmapId: string): number {
  return Object.values(roadmaps[roadmapId]?.chapters ?? {}).reduce(
    (sum, ch) => sum + ch.missionIds.length,
    0
  )
}

export function getChapterCount(roadmapId: string): number {
  return roadmaps[roadmapId]?.chapters.length ?? 0
}

export function getChapterMissionIds(roadmapId: string, chapterId: string): string[] {
  const ch = roadmaps[roadmapId]?.chapters.find((c) => c.id === chapterId)
  return ch ? ch.missionIds : []
}

export function getChapter(roadmapId: string, chapterId: string) {
  return roadmaps[roadmapId]?.chapters.find((c) => c.id === chapterId)
}
