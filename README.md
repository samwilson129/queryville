# Queryville

**Real datasets. Structured roadmaps. Practical SQL.**

Queryville is an interactive, browser-based SQL learning platform. Learners write and execute actual SQL (DuckDB dialect) against real, attributed public datasets, following structured roadmaps of investigative missions with result-based grading, hints, explanations, and progress tracking.

> **Status:** V1 — fully functional, production build verified, source on GitHub. See "Deployment" below for the remaining Cloudflare Pages steps.

## Live demo

Not yet deployed to Cloudflare Pages (see Deployment). To run locally:

```bash
git clone https://github.com/samwilson129/queryville.git
cd queryville
npm install
npm run dev
# open http://localhost:5173
```

## What Queryville is

Queryville puts learners in the role of a data analyst investigating real problems:

| Roadmap | Theme | Dataset | Tables | Records |
|---------|-------|---------|--------|---------|
| **The City Files** | Urban intelligence / public service | NYC 311 Service Requests (2020–present) | service_requests, boroughs, agencies, complaint_types | ~257k |
| **The Commerce Code** | E-commerce business analytics | Brazilian E-Commerce Public Dataset by Olist (2016–2018) | orders, customers, order_items, products, sellers, payments, reviews, product_category_translation | ~99k–112k |

Each roadmap has its own narrative, dataset, schema, learning objectives, five chapters, and 15 missions (30 total). Users switch between roadmaps without losing progress.

## Core features

- **Real SQL execution** — DuckDB-WASM runs in the browser; no server, no simulated queries.
- **Read-only security layer** — destructive statements (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `CREATE`, `ALTER`, `ATTACH`, `COPY`, `EXPORT`, `INSTALL`, `LOAD`, `PRAGMA`, `read_csv/read_json/read_parquet`) are parsed and rejected via `node-sql-parser` plus keyword guards before execution.
- **Result-based grading** — user and reference queries are both executed against the same dataset; results are compared (columns, row counts, row order where required, NULL-aware numeric tolerance). SQL text is never matched.
- **Progressive hints** — concept → feature → structure, then "Show solution" after repeated attempts.
- **Explanations** — every mission includes a narrative briefing, context, objectives, concepts, table/column info, expected output, starter SQL, reference solution, and XP reward.
- **Dataset explorer** — schema, column types, null counts, and sample rows computed from the actual loaded data (nothing hardcoded).
- **Progress & gamification** — global + per-roadmap XP, mission/chapter completion, ranks (Data Explorer → Lead Investigator), achievements, all persisted in `localStorage` (V1). Reset with confirmation.
- **Responsive** — split editor/briefing layout on desktop, stacked on mobile. Dark-first premium data-platform design.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS (v4), Lucide icons
- CodeMirror 6 (SQL syntax highlighting, line numbers, dark theme)
- DuckDB-WASM (read-only, in-browser SQL engine)
- localStorage persistence (V1)
- Deploy target: Cloudflare Pages (Vite preset)

## Project structure

```
queryville/
├── public/
│   ├── dwasm/                  # DuckDB-WASM worker + wasm (runtime assets)
│   ├── datasets/
│   │   ├── city/               # NYC 311 Parquet + dataset.json
│   │   └── commerce/           # Olist Parquet + dataset.json (raw CSVs gitignored)
│   └── images/
├── scripts/
│   ├── prepare-city-data/prepare.py          # NYC 311 extraction pipeline
│   └── prepare-commerce-data/prepare.py      # Olist Parquet pipeline
├── src/
│   ├── components/{layout,navigation,roadmap,challenge,editor,results,dataset,progress,ui}
│   ├── pages/{Home,Roadmaps,RoadmapDetail,Workspace,DatasetExplorer,Progress}
│   ├── data/{roadmaps,challenges}/{city,commerce}.ts
│   ├── engine/{duckdb,validator,security}
│   ├── hooks/{useRoadmaps,useProgress}.ts
│   ├── services/{challengeService,progressService}.ts
│   ├── types/index.ts
│   └── utils/cn.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Dataset sources & attribution

**The City Files — NYC 311 Service Requests from 2020 to Present**
- Source: https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9
- Socrata API: https://data.cityofnewyork.us/resource/erm2-nwe9.json
- Attribution: NYC OpenData (public open data)
- Curated snapshot (~257k records, 2020-11-28 to 2026-10-01), not the complete live dataset (updated daily).
- Latitude/longitude are NULL (CSV export provides State Plane X/Y only); `open_data_channel_type` preserved as NULL.

**The Commerce Code — Brazilian E-Commerce Public Dataset by Olist**
- Source: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
- Public mirror used for ingestion: https://github.com/mara/mara-olist-ecommerce-data/tree/master/data/olist-ecommerce
- Attribution: Olist (public dataset)
- Historical snapshot: orders from approximately September 2016 to October 2018. NOT live or continuously updated.
- Geolocation table excluded from the V1 bundle for size (available in the source dataset).

See `scripts/prepare-*/prepare.py` for ingestion instructions and `public/datasets/*/dataset.json` for provenance metadata.

## Data preparation

Both datasets are prepared as Parquet assets committed to `public/datasets/*/`. Raw CSVs are downloaded by the scripts and gitignored.

```bash
# NYC 311 (downloads bounded Socrata CSV export, normalizes, writes Parquet)
python scripts/prepare-city-data/prepare.py

# Olist (places official CSVs into public/datasets/commerce/, then runs)
python scripts/prepare-commerce-data/prepare.py
```

If Kaggle access is unavailable, place the official Olist CSV files into `public/datasets/commerce/` and re-run the commerce script.

## How challenge grading works

1. User writes SQL in the CodeMirror editor.
2. `challengeService.submit()` runs the security parser; unsafe statements are rejected immediately.
3. The user's query and the mission's `referenceSql` are both executed through the same DuckDB-WASM instance.
4. `validator.compareResults()` compares result sets per the mission's `ValidationRule`:
   - `columnOrderMatters`, `rowOrderMatters`, `duplicateRowsMatter`
   - `numericTolerance` (default 1e-6)
   - NULL-aware, multiset comparison when order doesn't matter
5. Feedback is generated (column mismatch, row count, value differences) without revealing the reference query.

## How to add a new roadmap

1. Create `src/data/roadmaps/<id>.ts` exporting a `Roadmap` (see `types/index.ts`).
2. Create `src/data/challenges/<id>.ts` exporting its `Mission[]` (5 chapters × 3 missions = 15).
3. Add the dataset assets to `public/datasets/<id>/` plus `dataset.json`, and register file manifests in `src/engine/duckdb/service.ts` (`ROADMAP_FILES`, `DATASET_BASE`).
4. Import and register the roadmap in `src/hooks/useRoadmaps.ts` (`roadmaps` record).
5. Add dataset prep under `scripts/prepare-<id>-data/`.

## How to add a new challenge

Add a `Mission` object to the roadmap's `challenges/<id>.ts` with: id, number, title, roadmapId, chapterId, difficulty, briefing, context, objectives, concepts, tables, columns, task, expectedOutput, starterSql, referenceSql, hints, solution, xp, and validation rules. Validate the `referenceSql` against the real dataset before committing.

## Deployment — Cloudflare Pages

Build settings:
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/` (repo root)

Remaining steps (GitHub repo `samwilson129/queryville` is pushed; Cloudflare authentication was not available in this environment, so connect manually):

1. Log in to Cloudflare → Workers & Pages → Create application → Pages → Connect to GitHub.
2. Select repository `samwilson129/queryville`, branch `main`.
3. Set framework preset to **Vite**, build command `npm run build`, output directory `dist`.
4. Ensure static assets are served: DuckDB-WASM files (`/dwasm/duckdb-mvp.wasm`, `/dwasm/duckdb-browser-mvp.worker.js`) and Parquet assets (`/datasets/*/*.parquet`) are in `public/` and copied to `dist/` by Vite — no special configuration needed.
5. Deploy. Verify the public HTTPS URL, then test both roadmaps, SQL execution, and dataset explorer on the live site.

No paid services or infrastructure are required.

## Local verification

```bash
npm run build      # production build (tsc + vite build)
npm run preview    # serve dist locally
```

The production build was verified locally: `/`, `/roadmaps`, both roadmap detail pages, workspace SQL execution (SELECT, filters, aggregations, joins, CTEs, window functions), unsafe-statement rejection, result-based grading, XP/progress persistence, and dataset explorer all function.

## Current limitations

- V1 persistence is `localStorage` only (guest use; no login/cloud sync — structured so auth can be added later).
- Raw Olist CSVs are not committed (gitignored); run `scripts/prepare-commerce-data/prepare.py` or place CSVs in `public/datasets/commerce/` if regenerating from source.
- The NYC 311 snapshot is a bounded export (most recent ~200k rows at extraction), not the complete live dataset; dates are normalized to ISO; latitude/longitude and open_data_channel_type are NULL in the CSV export.
- Cloudflare Pages deployment not yet completed (auth unavailable); exact steps above.

## License

Educational project. Datasets remain under their respective source licenses (NYC OpenData; Olist public dataset). Code: MIT.