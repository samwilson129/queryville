/*
 * Roadmap 01 — The City Files
 * Urban intelligence and public service investigation using real NYC 311 service requests.
 *
 * Dataset: 311 Service Requests from 2020 to Present (NYC OpenData)
 * Source: https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9
 * Curated snapshot stored in public/datasets/city/ (see scripts/prepare-city-data/).
 *
 * All reference queries are written in DuckDB dialect and validated against the
 * curated dataset. Do not fabricate data or reference queries.
 */

import type { Roadmap } from "../../types"

export const cityRoadmap: Roadmap = {
  id: "city",
  title: "The City Files",
  theme: "urban",
  narrative: `You have joined the Queryville Urban Intelligence Unit.

New York City receives millions of service requests from residents every year. City agencies need to understand what problems are occurring, where they are happening, and how effectively they are being resolved.

Your task is to investigate actual NYC 311 service requests and produce evidence-based findings. You will work with the real service_requests table plus derived dimension tables (boroughs, agencies, complaint_types).`,
  dataset: {
    dataset: "311 Service Requests from 2020 to Present",
    source:
      "https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9",
    api: "https://data.cityofnewyork.us/resource/erm2-nwe9.json",
    attribution: "NYC OpenData",
    extraction_date_utc: "SEE public/datasets/city/dataset.json",
    note: "Curated snapshot, not the complete live dataset. The source is updated daily. Tables: service_requests (primary), boroughs, agencies, complaint_types (derived dimensions).",
    limitations: [
      "Representative snapshot spanning multiple years, not the full extract.",
      "Preserves meaningful NULL values (e.g., closed_date for open requests).",
      "Geospatial point column omitted; latitude/longitude retained.",
    ],
  },
  accentColor: "#22c3e6",
  estimatedMinutes: 210,
  conceptOrder: [
    "SELECT",
    "FROM",
    "LIMIT",
    "DISTINCT",
    "Aliases",
    "WHERE",
    "ORDER BY",
    "COUNT",
    "SUM",
    "AVG",
    "GROUP BY",
    "HAVING",
    "CASE WHEN",
    "Date functions",
    "NULL handling",
    "CTEs",
    "Window functions",
    "ROW_NUMBER",
    "RANK",
    "LAG",
    "Subqueries",
    "Multi-CTE analysis",
  ],
  chapters: [
    {
      id: "city-ch-01",
      number: 1,
      title: "First Response",
      difficulty: "Beginner",
      narrative: `Your first task is understanding the city's service request database.

Start by inspecting the service_requests table: what columns exist, what a single request looks like, and how the data is organized. These missions introduce the core SQL verbs you'll use throughout the roadmap.`,
      missionIds: ["city-m01", "city-m02", "city-m03"],
    },
    {
      id: "city-ch-02",
      number: 2,
      title: "The Bigger Picture",
      difficulty: "Beginner to intermediate",
      narrative: `Now aggregate. Which boroughs generate the most service requests? Which complaint categories dominate? Where does the city's volume exceed the average?

These missions introduce COUNT, SUM, AVG, GROUP BY, HAVING, and conditional logic with CASE WHEN.`,
      missionIds: ["city-m04", "city-m05", "city-m06"],
    },
    {
      id: "city-ch-03",
      number: 3,
      title: "The Waiting Game",
      difficulty: "Intermediate",
      narrative: `How long does it take the city to resolve a request? Which requests are still waiting? Which agencies are slowest?

You'll work with date differences, NULL handling (open requests have no closed_date), CASE expressions, and CTEs.`,
      missionIds: ["city-m07", "city-m08", "city-m09"],
    },
    {
      id: "city-ch-04",
      number: 4,
      title: "Patterns in the Noise",
      difficulty: "Advanced",
      narrative: `Do complaints spike on weekends? How does this month compare to last? Which agencies lead the performance leaderboard?

These missions introduce window functions (ROW_NUMBER, RANK, LAG), PARTITION BY, and date truncation.`,
      missionIds: ["city-m10", "city-m11", "city-m12"],
    },
    {
      id: "city-ch-05",
      number: 5,
      title: "The Final Investigation",
      difficulty: "Expert",
      narrative: `Your capstone. Combine everything: multi-CTE queries, subqueries, window functions, and complex aggregation to investigate the backlog, deteriorating resolution times, and produce a final evidence report.

This challenge requires a meaningful combination of skills — not one simple SELECT.`,
      missionIds: ["city-m13", "city-m14", "city-m15"],
    },
  ],
}
