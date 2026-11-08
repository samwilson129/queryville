/*
 * Roadmap 01 — The City Files: 15 missions (5 chapters x 3).
 * Reference queries are written in DuckDB dialect and validated against the
 * curated NYC 311 dataset in public/datasets/city/.
 */

import type { Mission } from "../../types"

const baseRule = (overrides: Partial<import("../../types").ValidationRule> = {}) => ({
  columnOrderMatters: true,
  rowOrderMatters: true,
  duplicateRowsMatter: true,
  numericTolerance: 1e-6,
  ...overrides,
})

export const cityMissions: Mission[] = [
  // ================= CHAPTER 01 — First Response =================
  {
    id: "city-m01",
    number: 1,
    title: "Welcome to the City",
    roadmapId: "city",
    chapterId: "city-ch-01",
    difficulty: "Beginner",
    briefing: `Your first day in the Urban Intelligence Unit. Pull up the most recent service requests so you can see what the data looks like — one row per request, with the key identifying fields.`,
    context: "Inspect the most recent entries in the service_requests table to understand the record structure.",
    objectives: ["Select specific columns from a table", "Order results by a timestamp", "Limit the number of rows returned"],
    concepts: ["SELECT", "FROM", "ORDER BY", "LIMIT"],
    tables: ["service_requests"],
    columns: {
      service_requests: [
        "unique_key",
        "created_date",
        "agency",
        "complaint_type",
        "borough",
      ],
    },
    task: `Return the unique_key, created_date, agency, complaint_type, and borough of the 10 most recent service requests, ordered from newest to oldest.

Expected output columns: unique_key, created_date, agency, complaint_type, borough`,
    expectedOutput: ["unique_key", "created_date", "agency", "complaint_type", "borough"],
    starterSql: `SELECT
    unique_key,
    created_date,
    agency,
    complaint_type,
    borough
FROM service_requests
ORDER BY created_date DESC
LIMIT 10;`,
    referenceSql: `SELECT
    unique_key,
    created_date,
    agency,
    complaint_type,
    borough
FROM service_requests
ORDER BY created_date DESC
LIMIT 10;`,
    hints: [
      "Start with SELECT to list the columns you need, then FROM service_requests.",
      "Use ORDER BY created_date DESC to show the newest requests first.",
      "Add LIMIT 10 to return only the 10 most recent rows.",
    ],
    solution: `SELECT
    unique_key,
    created_date,
    agency,
    complaint_type,
    borough
FROM service_requests
ORDER BY created_date DESC
LIMIT 10;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, columnOrderMatters: true }),
  },
  {
    id: "city-m02",
    number: 2,
    title: "Where's the Noise?",
    roadmapId: "city",
    chapterId: "city-ch-01",
    difficulty: "Beginner",
    briefing: `Residents in Brooklyn are reporting noise issues. Find the noise-related complaints in that borough so the team can see the scale of the problem.`,
    context: "Filter rows with WHERE using a pattern match on complaint_type and an equality check on borough.",
    objectives: ["Filter rows with WHERE", "Use LIKE for pattern matching", "Combine conditions with AND"],
    concepts: ["WHERE", "LIKE", "AND"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["unique_key", "complaint_type", "borough"],
    },
    task: `Return unique_key, complaint_type, and borough for all noise-related complaints in BROOKLYN. Match complaint types containing the word "Noise" (case-insensitive) and limit to the borough "BROOKLYN".

Expected output columns: unique_key, complaint_type, borough`,
    expectedOutput: ["unique_key", "complaint_type", "borough"],
    starterSql: `SELECT
    unique_key,
    complaint_type,
    borough
FROM service_requests
WHERE complaint_type LIKE '%Noise%' AND borough = 'BROOKLYN'
LIMIT 100;`,
    referenceSql: `SELECT
    unique_key,
    complaint_type,
    borough
FROM service_requests
WHERE complaint_type LIKE '%Noise%' AND borough = 'BROOKLYN'
LIMIT 100;`,
    hints: [
      "Use WHERE to filter rows.",
      "LIKE '%Noise%' matches complaint types containing the word Noise.",
      "Combine the two conditions with AND.",
    ],
    solution: `SELECT
    unique_key,
    complaint_type,
    borough
FROM service_requests
WHERE complaint_type LIKE '%Noise%' AND borough = 'BROOKLYN'
LIMIT 100;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false, columnOrderMatters: true }),
  },
  {
    id: "city-m03",
    number: 3,
    title: "The City's Biggest Problems",
    roadmapId: "city",
    chapterId: "city-ch-01",
    difficulty: "Beginner",
    briefing: `Which complaint categories are reported most often? Aggregate the data to find the most frequently reported complaint types across the whole city.`,
    context: "Use GROUP BY with COUNT to aggregate, then ORDER BY to rank.",
    objectives: ["Group rows with GROUP BY", "Count rows with COUNT(*)", "Sort results with ORDER BY"],
    concepts: ["COUNT", "GROUP BY", "ORDER BY", "Aliases"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["complaint_type"],
    },
    task: `Return each complaint_type and the total number of requests for that category. Sort in descending order of request volume.

Expected output columns: complaint_type, total_requests`,
    expectedOutput: ["complaint_type", "total_requests"],
    starterSql: `SELECT
    complaint_type,
    COUNT(*) AS total_requests
FROM service_requests
GROUP BY complaint_type
ORDER BY total_requests DESC;`,
    referenceSql: `SELECT
    complaint_type,
    COUNT(*) AS total_requests
FROM service_requests
GROUP BY complaint_type
ORDER BY total_requests DESC;`,
    hints: [
      "GROUP BY complaint_type groups rows that share the same complaint category.",
      "COUNT(*) counts how many requests fall into each group.",
      "ORDER BY total_requests DESC puts the biggest categories first.",
    ],
    solution: `SELECT
    complaint_type,
    COUNT(*) AS total_requests
FROM service_requests
GROUP BY complaint_type
ORDER BY total_requests DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, columnOrderMatters: true }),
  },

  // ================= CHAPTER 02 — The Bigger Picture =================
  {
    id: "city-m04",
    number: 4,
    title: "Borough Breakdown",
    roadmapId: "city",
    chapterId: "city-ch-02",
    difficulty: "Beginner to intermediate",
    briefing: `The Urban Intelligence Unit wants to know which borough receives the highest number of service requests. Compare volumes across boroughs.`,
    context: "Aggregate by borough and rank by request count.",
    objectives: ["Group by borough", "Count requests per borough", "Sort descending by volume"],
    concepts: ["COUNT", "GROUP BY", "ORDER BY"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["borough"],
    },
    task: `Return each borough and the total number of service requests. Sort in descending order of request volume.

Expected output columns: borough, total_requests`,
    expectedOutput: ["borough", "total_requests"],
    starterSql: `SELECT
    borough,
    COUNT(*) AS total_requests
FROM service_requests
GROUP BY borough
ORDER BY total_requests DESC;`,
    referenceSql: `SELECT
    borough,
    COUNT(*) AS total_requests
FROM service_requests
GROUP BY borough
ORDER BY total_requests DESC;`,
    hints: [
      "GROUP BY borough creates one group per borough.",
      "COUNT(*) counts the requests in each borough.",
      "ORDER BY total_requests DESC ranks boroughs by volume.",
    ],
    solution: `SELECT
    borough,
    COUNT(*) AS total_requests
FROM service_requests
GROUP BY borough
ORDER BY total_requests DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "city-m05",
    number: 5,
    title: "The Noise Index",
    roadmapId: "city",
    chapterId: "city-ch-02",
    difficulty: "Beginner to intermediate",
    briefing: `Rank the most common complaint categories in the city. The Noise Index helps the unit prioritize which complaint types to tackle first.`,
    context: "Same aggregation pattern as Mission 04, grouped by complaint_type.",
    objectives: ["Group by complaint category", "Count and rank categories"],
    concepts: ["COUNT", "GROUP BY", "ORDER BY"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["complaint_type"],
    },
    task: `Return each complaint_type and the number of complaints in that category. Rank them in descending order of frequency.

Expected output columns: complaint_type, complaint_count`,
    expectedOutput: ["complaint_type", "complaint_count"],
    starterSql: `SELECT
    complaint_type,
    COUNT(*) AS complaint_count
FROM service_requests
GROUP BY complaint_type
ORDER BY complaint_count DESC;`,
    referenceSql: `SELECT
    complaint_type,
    COUNT(*) AS complaint_count
FROM service_requests
GROUP BY complaint_type
ORDER BY complaint_count DESC;`,
    hints: [
      "GROUP BY complaint_type groups rows by category.",
      "COUNT(*) counts complaints per category.",
      "ORDER BY complaint_count DESC ranks the most common first.",
    ],
    solution: `SELECT
    complaint_type,
    COUNT(*) AS complaint_count
FROM service_requests
GROUP BY complaint_type
ORDER BY complaint_count DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "city-m06",
    number: 6,
    title: "Beyond the Average",
    roadmapId: "city",
    chapterId: "city-ch-02",
    difficulty: "Beginner to intermediate",
    briefing: `Which boroughs receive more service requests than the average borough? Use a subquery to compute the average borough volume, then filter.`,
    context: "Introduces a scalar subquery in WHERE plus GROUP BY/HAVING-style logic.",
    objectives: ["Use a subquery", "Compare group values to an average", "Filter groups with WHERE"],
    concepts: ["GROUP BY", "Subquery", "AVG", "Conditional aggregation"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["borough"],
    },
    task: `Return each borough whose total complaint volume exceeds the average volume across all boroughs. Show borough and total_requests, sorted descending.

Expected output columns: borough, total_requests`,
    expectedOutput: ["borough", "total_requests"],
    starterSql: `WITH borough_counts AS (
    SELECT borough, COUNT(*) AS total_requests
    FROM service_requests
    GROUP BY borough
)
SELECT borough, total_requests
FROM borough_counts
WHERE total_requests > (SELECT AVG(total_requests) FROM borough_counts)
ORDER BY total_requests DESC;`,
    referenceSql: `WITH borough_counts AS (
    SELECT borough, COUNT(*) AS total_requests
    FROM service_requests
    GROUP BY borough
)
SELECT borough, total_requests
FROM borough_counts
WHERE total_requests > (SELECT AVG(total_requests) FROM borough_counts)
ORDER BY total_requests DESC;`,
    hints: [
      "Use a CTE to compute each borough's total first.",
      "A scalar subquery (SELECT AVG(...) FROM borough_counts) gives the average borough volume.",
      "Filter with WHERE total_requests > <average>.",
    ],
    solution: `WITH borough_counts AS (
    SELECT borough, COUNT(*) AS total_requests
    FROM service_requests
    GROUP BY borough
)
SELECT borough, total_requests
FROM borough_counts
WHERE total_requests > (SELECT AVG(total_requests) FROM borough_counts)
ORDER BY total_requests DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },

  // ================= CHAPTER 03 — The Waiting Game =================
  {
    id: "city-m07",
    number: 7,
    title: "Clock Is Ticking",
    roadmapId: "city",
    chapterId: "city-ch-03",
    difficulty: "Intermediate",
    briefing: `How long does the city take, on average, to resolve a service request? Only consider requests that have been closed (closed_date is not null).`,
    context: "Date difference and NULL handling: filter out open requests with no closed_date.",
    objectives: ["Compute date differences", "Handle NULLs with WHERE ... IS NOT NULL", "Average with AVG"],
    concepts: ["Date functions", "Date differences", "NULL handling", "AVG"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["created_date", "closed_date"],
    },
    task: `Return the average resolution time in days for closed requests. Resolution time = closed_date minus created_date.

Expected output columns: avg_resolution_days`,
    expectedOutput: ["avg_resolution_days"],
    starterSql: `SELECT
    AVG(CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS avg_resolution_days
FROM service_requests
WHERE closed_date IS NOT NULL;`,
    referenceSql: `SELECT
    AVG(CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS avg_resolution_days
FROM service_requests
WHERE closed_date IS NOT NULL;`,
    hints: [
      "Cast created_date and closed_date to DATE so subtraction yields days.",
      "Filter with WHERE closed_date IS NOT NULL to exclude open requests.",
      "AVG(...) computes the mean resolution time.",
    ],
    solution: `SELECT
    AVG(CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS avg_resolution_days
FROM service_requests
WHERE closed_date IS NOT NULL;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false, numericTolerance: 0.01 }),
  },
  {
    id: "city-m08",
    number: 8,
    title: "Still Waiting",
    roadmapId: "city",
    chapterId: "city-ch-03",
    difficulty: "Intermediate",
    briefing: `Which service requests are still unresolved? Find requests that have no closed_date, meaning they remain open.`,
    context: "IS NULL to surface unresolved work.",
    objectives: ["Filter with IS NULL", "Select identifying fields"],
    concepts: ["IS NULL", "NULL handling"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["unique_key", "created_date", "agency", "complaint_type", "borough"],
    },
    task: `Return unique_key, created_date, agency, complaint_type, and borough for unresolved requests (closed_date IS NULL). Limit to 100 rows.

Expected output columns: unique_key, created_date, agency, complaint_type, borough`,
    expectedOutput: ["unique_key", "created_date", "agency", "complaint_type", "borough"],
    starterSql: `SELECT
    unique_key,
    created_date,
    agency,
    complaint_type,
    borough
FROM service_requests
WHERE closed_date IS NULL
LIMIT 100;`,
    referenceSql: `SELECT
    unique_key,
    created_date,
    agency,
    complaint_type,
    borough
FROM service_requests
WHERE closed_date IS NULL
LIMIT 100;`,
    hints: [
      "An unresolved request has no closed_date, so use WHERE closed_date IS NULL.",
      "Return the identifying fields for each open request.",
      "LIMIT 100 keeps the result manageable.",
    ],
    solution: `SELECT
    unique_key,
    created_date,
    agency,
    complaint_type,
    borough
FROM service_requests
WHERE closed_date IS NULL
LIMIT 100;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false }),
  },
  {
    id: "city-m09",
    number: 9,
    title: "Who Takes the Longest?",
    roadmapId: "city",
    chapterId: "city-ch-03",
    difficulty: "Intermediate",
    briefing: `Compare resolution times across agencies. Which agencies take the longest, on average, to close a request?`,
    context: "Group by agency, average date difference, only closed requests.",
    objectives: ["Group by agency", "Average resolution time per agency", "Rank agencies"],
    concepts: ["GROUP BY", "AVG", "Date differences", "ORDER BY"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["agency", "created_date", "closed_date"],
    },
    task: `Return each agency, the number of closed requests, and the average resolution time in days. Sort by average resolution time descending.

Expected output columns: agency, closed_requests, avg_resolution_days`,
    expectedOutput: ["agency", "closed_requests", "avg_resolution_days"],
    starterSql: `SELECT
    agency,
    COUNT(*) AS closed_requests,
    AVG(CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS avg_resolution_days
FROM service_requests
WHERE closed_date IS NOT NULL
GROUP BY agency
ORDER BY avg_resolution_days DESC
LIMIT 15;`,
    referenceSql: `SELECT
    agency,
    COUNT(*) AS closed_requests,
    AVG(CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS avg_resolution_days
FROM service_requests
WHERE closed_date IS NOT NULL
GROUP BY agency
ORDER BY avg_resolution_days DESC
LIMIT 15;`,
    hints: [
      "GROUP BY agency aggregates per agency.",
      "COUNT(*) counts closed requests per agency.",
      "AVG of the date difference gives average resolution time.",
      "ORDER BY avg_resolution_days DESC ranks slowest agencies first.",
    ],
    solution: `SELECT
    agency,
    COUNT(*) AS closed_requests,
    AVG(CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS avg_resolution_days
FROM service_requests
WHERE closed_date IS NOT NULL
GROUP BY agency
ORDER BY avg_resolution_days DESC
LIMIT 15;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },

  // ================= CHAPTER 04 — Patterns in the Noise =================
  {
    id: "city-m10",
    number: 10,
    title: "Weekend Effect",
    roadmapId: "city",
    chapterId: "city-ch-04",
    difficulty: "Advanced",
    briefing: `Do more service requests come in on weekends than weekdays? Compare complaint patterns across weekdays and weekends.`,
    context: "Extract the day of week from created_date and bucket into Weekend/Weekday.",
    objectives: ["Extract day of week", "Bucket dates into categories", "Aggregate and compare"],
    concepts: ["Date extraction", "CASE WHEN", "GROUP BY", "COUNT"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["created_date"],
    },
    task: `Return day_type ('Weekend' or 'Weekday') and the total request count for each. Sort by request count descending.

Expected output columns: day_type, request_count`,
    expectedOutput: ["day_type", "request_count"],
    starterSql: `SELECT
    CASE
        WHEN CAST(strftime('%w', CAST(created_date AS DATE)) AS INTEGER) IN (0, 6) THEN 'Weekend'
        ELSE 'Weekday'
    END AS day_type,
    COUNT(*) AS request_count
FROM service_requests
GROUP BY day_type
ORDER BY request_count DESC;`,
    referenceSql: `SELECT
    CASE
        WHEN CAST(strftime('%w', CAST(created_date AS DATE)) AS INTEGER) IN (0, 6) THEN 'Weekend'
        ELSE 'Weekday'
    END AS day_type,
    COUNT(*) AS request_count
FROM service_requests
GROUP BY day_type
ORDER BY request_count DESC;`,
    hints: [
      "strftime('%w', date) returns the day of week as a number (0 = Sunday, 6 = Saturday).",
      "Use CASE WHEN to bucket days 0 and 6 as 'Weekend', everything else as 'Weekday'.",
      "GROUP BY day_type and COUNT(*) to compare the two buckets.",
    ],
    solution: `SELECT
    CASE
        WHEN CAST(strftime('%w', CAST(created_date AS DATE)) AS INTEGER) IN (0, 6) THEN 'Weekend'
        ELSE 'Weekday'
    END AS day_type,
    COUNT(*) AS request_count
FROM service_requests
GROUP BY day_type
ORDER BY request_count DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "city-m11",
    number: 11,
    title: "Month Over Month",
    roadmapId: "city",
    chapterId: "city-ch-04",
    difficulty: "Advanced",
    briefing: `How does this month's request volume compare to the previous month? Use a window function (LAG) to look at the prior month's volume.`,
    context: "DATE_TRUNC to month, GROUP BY, then LAG over time-ordered months.",
    objectives: ["Truncate dates to month", "Use LAG window function", "Compute month-over-month change"],
    concepts: ["Date truncation", "Window functions", "LAG", "CTEs"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["created_date"],
    },
    task: `Return month, request volume, the previous month's volume, and the change (current - previous). Order chronologically.

Expected output columns: month, requests, prev_month, change`,
    expectedOutput: ["month", "requests", "prev_month", "change"],
    starterSql: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', CAST(created_date AS DATE)) AS month,
        COUNT(*) AS requests
    FROM service_requests
    GROUP BY 1
)
SELECT
    month,
    requests,
    LAG(requests) OVER (ORDER BY month) AS prev_month,
    requests - LAG(requests) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;`,
    referenceSql: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', CAST(created_date AS DATE)) AS month,
        COUNT(*) AS requests
    FROM service_requests
    GROUP BY 1
)
SELECT
    month,
    requests,
    LAG(requests) OVER (ORDER BY month) AS prev_month,
    requests - LAG(requests) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;`,
    hints: [
      "DATE_TRUNC('month', date) groups each request into its calendar month.",
      "Aggregate counts per month in a CTE.",
      "LAG(requests) OVER (ORDER BY month) pulls the previous month's volume onto each row.",
    ],
    solution: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', CAST(created_date AS DATE)) AS month,
        COUNT(*) AS requests
    FROM service_requests
    GROUP BY 1
)
SELECT
    month,
    requests,
    LAG(requests) OVER (ORDER BY month) AS prev_month,
    requests - LAG(requests) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "city-m12",
    number: 12,
    title: "The Leaderboard",
    roadmapId: "city",
    chapterId: "city-ch-04",
    difficulty: "Advanced",
    briefing: `Rank agencies by their performance: total requests handled and the share that get closed. Build a leaderboard of the busiest agencies.`,
    context: "Conditional aggregation (SUM of CASE) to count closures, then compute a closure rate and rank.",
    objectives: ["Conditional aggregation with CASE", "Compute rates/percentages", "Rank with ORDER BY"],
    concepts: ["CASE WHEN", "Conditional aggregation", "GROUP BY", "ORDER BY"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["agency", "closed_date"],
    },
    task: `Return each agency, total requests, number closed, and closure rate (percent closed). Sort by closure rate descending, then total requests descending.

Expected output columns: agency, total_requests, closed, closure_rate_pct`,
    expectedOutput: ["agency", "total_requests", "closed", "closure_rate_pct"],
    starterSql: `SELECT
    agency,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) AS closed,
    ROUND(100.0 * SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS closure_rate_pct
FROM service_requests
GROUP BY agency
ORDER BY closure_rate_pct DESC, total_requests DESC
LIMIT 15;`,
    referenceSql: `SELECT
    agency,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) AS closed,
    ROUND(100.0 * SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS closure_rate_pct
FROM service_requests
GROUP BY agency
ORDER BY closure_rate_pct DESC, total_requests DESC
LIMIT 15;`,
    hints: [
      "COUNT(*) is total requests per agency.",
      "SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) counts closed requests.",
      "closure_rate_pct = 100.0 * closed / total_requests.",
      "ORDER BY closure_rate_pct DESC ranks best performers first.",
    ],
    solution: `SELECT
    agency,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) AS closed,
    ROUND(100.0 * SUM(CASE WHEN closed_date IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS closure_rate_pct
FROM service_requests
GROUP BY agency
ORDER BY closure_rate_pct DESC, total_requests DESC
LIMIT 15;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.01 }),
  },

  // ================= CHAPTER 05 — The Final Investigation =================
  {
    id: "city-m13",
    number: 13,
    title: "The Backlog Crisis",
    roadmapId: "city",
    chapterId: "city-ch-05",
    difficulty: "Expert",
    briefing: `Which agencies have a persistent backlog of unresolved requests? Identify agencies whose open-request count exceeds the average backlog.`,
    context: "CTE for open-request counts, then a scalar subquery for the average backlog.",
    objectives: ["Count open requests per agency", "Scalar subquery for average", "Filter groups above average"],
    concepts: ["CTE", "Subquery", "COUNT", "IS NULL", "GROUP BY"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["agency", "closed_date"],
    },
    task: `Return each agency and its number of open (unresolved) requests, but only where the open count exceeds the average open count across all agencies. Sort by open_requests descending.

Expected output columns: agency, open_requests`,
    expectedOutput: ["agency", "open_requests"],
    starterSql: `WITH open_counts AS (
    SELECT agency, COUNT(*) AS open_requests
    FROM service_requests
    WHERE closed_date IS NULL
    GROUP BY agency
)
SELECT agency, open_requests
FROM open_counts
WHERE open_requests > (SELECT AVG(open_requests) FROM open_counts)
ORDER BY open_requests DESC;`,
    referenceSql: `WITH open_counts AS (
    SELECT agency, COUNT(*) AS open_requests
    FROM service_requests
    WHERE closed_date IS NULL
    GROUP BY agency
)
SELECT agency, open_requests
FROM open_counts
WHERE open_requests > (SELECT AVG(open_requests) FROM open_counts)
ORDER BY open_requests DESC;`,
    hints: [
      "Filter to open requests with WHERE closed_date IS NULL.",
      "Group by agency and count open requests in a CTE.",
      "Compare each agency's open count to the average open count using a scalar subquery.",
    ],
    solution: `WITH open_counts AS (
    SELECT agency, COUNT(*) AS open_requests
    FROM service_requests
    WHERE closed_date IS NULL
    GROUP BY agency
)
SELECT agency, open_requests
FROM open_counts
WHERE open_requests > (SELECT AVG(open_requests) FROM open_counts)
ORDER BY open_requests DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "city-m14",
    number: 14,
    title: "The Changing City",
    roadmapId: "city",
    chapterId: "city-ch-05",
    difficulty: "Expert",
    briefing: `Which complaint categories are getting slower to resolve? Compare average resolution time in the recent half of the data versus the older half.`,
    context: "Split resolved requests into two time periods using the median created date, then compare averages.",
    objectives: ["Split data into time periods", "Compare averages across periods", "HAVING to ensure enough samples"],
    concepts: ["CTE", "Date functions", "CASE WHEN", "HAVING", "AVG", "Subquery"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["complaint_type", "created_date", "closed_date"],
    },
    task: `For each complaint type with at least 10 resolved requests in both halves, return the category, its average resolution days in the recent half, and in the older half. Sort by the difference (recent minus older) descending so deteriorating categories appear first.

Expected output columns: complaint_type, recent_avg_days, older_avg_days`,
    expectedOutput: ["complaint_type", "recent_avg_days", "older_avg_days"],
    starterSql: `WITH resolved AS (
    SELECT
        complaint_type,
        CAST(created_date AS DATE) AS created,
        CAST(closed_date AS DATE) AS closed,
        (CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS days
    FROM service_requests
    WHERE closed_date IS NOT NULL
),
split AS (
    SELECT
        complaint_type,
        days,
        CASE
            WHEN created >= (SELECT MAX(created) FROM resolved) - INTERVAL 6 MONTH THEN 'recent'
            ELSE 'older'
        END AS period
    FROM resolved
)
SELECT
    complaint_type,
    ROUND(AVG(CASE WHEN period = 'recent' THEN days END)::numeric, 2) AS recent_avg_days,
    ROUND(AVG(CASE WHEN period = 'older' THEN days END)::numeric, 2) AS older_avg_days
FROM split
GROUP BY complaint_type
HAVING COUNT(CASE WHEN period = 'recent' THEN 1 END) >= 10
   AND COUNT(CASE WHEN period = 'older' THEN 1 END) >= 10
ORDER BY (recent_avg_days - older_avg_days) DESC
LIMIT 10;`,
    referenceSql: `WITH resolved AS (
    SELECT
        complaint_type,
        CAST(created_date AS DATE) AS created,
        CAST(closed_date AS DATE) AS closed,
        (CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS days
    FROM service_requests
    WHERE closed_date IS NOT NULL
),
split AS (
    SELECT
        complaint_type,
        days,
        CASE
            WHEN created >= (SELECT MAX(created) FROM resolved) - INTERVAL 6 MONTH THEN 'recent'
            ELSE 'older'
        END AS period
    FROM resolved
)
SELECT
    complaint_type,
    ROUND(AVG(CASE WHEN period = 'recent' THEN days END)::numeric, 2) AS recent_avg_days,
    ROUND(AVG(CASE WHEN period = 'older' THEN days END)::numeric, 2) AS older_avg_days
FROM split
GROUP BY complaint_type
HAVING COUNT(CASE WHEN period = 'recent' THEN 1 END) >= 10
   AND COUNT(CASE WHEN period = 'older' THEN 1 END) >= 10
ORDER BY (recent_avg_days - older_avg_days) DESC
LIMIT 10;`,
    hints: [
      "Build a 'resolved' CTE with created, closed, and days-to-resolve for closed requests only.",
      "Use INTERVAL 6 MONTH from the latest created date to define 'recent' vs 'older'.",
      "Use conditional AVG in the outer query for each period.",
      "HAVING ensures each category has enough samples in both halves.",
    ],
    solution: `WITH resolved AS (
    SELECT
        complaint_type,
        CAST(created_date AS DATE) AS created,
        CAST(closed_date AS DATE) AS closed,
        (CAST(closed_date AS DATE) - CAST(created_date AS DATE)) AS days
    FROM service_requests
    WHERE closed_date IS NOT NULL
),
split AS (
    SELECT
        complaint_type,
        days,
        CASE
            WHEN created >= (SELECT MAX(created) FROM resolved) - INTERVAL 6 MONTH THEN 'recent'
            ELSE 'older'
        END AS period
    FROM resolved
)
SELECT
    complaint_type,
    ROUND(AVG(CASE WHEN period = 'recent' THEN days END)::numeric, 2) AS recent_avg_days,
    ROUND(AVG(CASE WHEN period = 'older' THEN days END)::numeric, 2) AS older_avg_days
FROM split
GROUP BY complaint_type
HAVING COUNT(CASE WHEN period = 'recent' THEN 1 END) >= 10
   AND COUNT(CASE WHEN period = 'older' THEN 1 END) >= 10
ORDER BY (recent_avg_days - older_avg_days) DESC
LIMIT 10;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.5 }),
  },
  {
    id: "city-m15",
    number: 15,
    title: "The Final Report",
    roadmapId: "city",
    chapterId: "city-ch-05",
    difficulty: "Expert",
    briefing: `Your capstone investigation. Combine multiple SQL concepts: CTEs, window functions, aggregation, and ranking to produce a multi-step report on the city's service request landscape.

This is the final challenge — draw on everything you've learned across the roadmap.`,
    context: "Multi-CTE analytical query with window ranking.",
    objectives: ["Combine CTEs and window functions", "Rank within groups", "Produce a final analytical report"],
    concepts: ["CTEs", "Window functions", "RANK", "PARTITION BY", "GROUP BY", "Aggregation"],
    tables: ["service_requests"],
    columns: {
      service_requests: ["created_date", "borough"],
    },
    task: `For each calendar month, rank boroughs by their request volume and return the top 3 boroughs per month. Show month, borough, request volume, and the borough's rank within that month. Order by month descending, then rank.

Expected output columns: month, borough, requests, borough_rank`,
    expectedOutput: ["month", "borough", "requests", "borough_rank"],
    starterSql: `WITH monthly_borough AS (
    SELECT
        DATE_TRUNC('month', CAST(created_date AS DATE)) AS month,
        borough,
        COUNT(*) AS requests
    FROM service_requests
    GROUP BY 1, 2
),
ranked AS (
    SELECT
        month,
        borough,
        requests,
        RANK() OVER (PARTITION BY month ORDER BY requests DESC) AS borough_rank
    FROM monthly_borough
)
SELECT month, borough, requests, borough_rank
FROM ranked
WHERE borough_rank <= 3
ORDER BY month DESC, borough_rank
LIMIT 20;`,
    referenceSql: `WITH monthly_borough AS (
    SELECT
        DATE_TRUNC('month', CAST(created_date AS DATE)) AS month,
        borough,
        COUNT(*) AS requests
    FROM service_requests
    GROUP BY 1, 2
),
ranked AS (
    SELECT
        month,
        borough,
        requests,
        RANK() OVER (PARTITION BY month ORDER BY requests DESC) AS borough_rank
    FROM monthly_borough
)
SELECT month, borough, requests, borough_rank
FROM ranked
WHERE borough_rank <= 3
ORDER BY month DESC, borough_rank
LIMIT 20;`,
    hints: [
      "First CTE: compute request volume per month per borough (DATE_TRUNC to month).",
      "Second CTE: use RANK() OVER (PARTITION BY month ORDER BY requests DESC) to rank boroughs within each month.",
      "Filter to borough_rank <= 3 for the top 3 per month.",
    ],
    solution: `WITH monthly_borough AS (
    SELECT
        DATE_TRUNC('month', CAST(created_date AS DATE)) AS month,
        borough,
        COUNT(*) AS requests
    FROM service_requests
    GROUP BY 1, 2
),
ranked AS (
    SELECT
        month,
        borough,
        requests,
        RANK() OVER (PARTITION BY month ORDER BY requests DESC) AS borough_rank
    FROM monthly_borough
)
SELECT month, borough, requests, borough_rank
FROM ranked
WHERE borough_rank <= 3
ORDER BY month DESC, borough_rank
LIMIT 20;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
]
