/*
 * Roadmap 02 — The Commerce Code
 * E-commerce intelligence and business analytics using the real Olist Brazilian E-Commerce dataset.
 *
 * Dataset: Brazilian E-Commerce Public Dataset by Olist
 * Source: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
 * Mirror: https://github.com/mara/mara-olist-ecommerce-data/tree/master/data/olist-ecommerce
 * Curated Parquet snapshot stored in public/datasets/commerce/ (see scripts/prepare-commerce-data/).
 *
 * Historical snapshot: orders from approximately Sept 2016 to Oct 2018. Not live or continuously updated.
 * All reference queries are DuckDB dialect, validated against the curated dataset.
 */

import type { Roadmap } from "../../types"

export const commerceRoadmap: Roadmap = {
  id: "commerce",
  title: "The Commerce Code",
  theme: "commerce",
  narrative: `You have joined the Queryville Commerce Analytics team.

An e-commerce company wants to understand its orders, customers, products, sellers, revenue, payments, and delivery performance. Your job is to investigate its historical transactions and identify insights that can help improve business performance.

You will work with eight related tables: orders, customers, order_items, products, sellers, payments, reviews, and product_category_translation.`,
  dataset: {
    dataset: "Brazilian E-Commerce Public Dataset by Olist",
    source: "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
    mirror:
      "https://github.com/mara/mara-olist-ecommerce-data/tree/master/data/olist-ecommerce",
    attribution: "Olist (public dataset)",
    extraction_date_utc: "SEE public/datasets/commerce/dataset.json",
    note: "Historical snapshot. Orders span approximately September 2016 to October 2018. Not live or continuously updated. Tables: orders, customers, order_items, products, sellers, payments, reviews, product_category_translation.",
    limitations: [
      "Historical data only (2016-2018); does not reflect current Olist operations.",
      "Geolocation table excluded from the V1 bundle for size (available in the source dataset).",
      "Curated snapshot, not a complete live feed.",
    ],
  },
  accentColor: "#a78bfa",
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
    "MIN",
    "MAX",
    "GROUP BY",
    "HAVING",
    "CASE WHEN",
    "INNER JOIN",
    "LEFT JOIN",
    "Multiple joins",
    "Join cardinality",
    "NULL handling",
    "Subqueries",
    "EXISTS",
    "CTEs",
    "Window functions",
    "Running totals",
    "Period-over-period",
  ],
  chapters: [
    {
      id: "commerce-ch-01",
      number: 1,
      title: "Opening the Store",
      difficulty: "Beginner",
      narrative: `Start by exploring the core tables: orders, customers, and products. Get a feel for what an order record, a customer record, and a product look like in this e-commerce database.`,
      missionIds: ["commerce-m01", "commerce-m02", "commerce-m03"],
    },
    {
      id: "commerce-ch-02",
      number: 2,
      title: "Understanding Revenue",
      difficulty: "Beginner to intermediate",
      narrative: `Where does the money come from? Calculate total revenue, find the best-selling product categories, and examine the average customer basket.

These missions introduce COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, and CASE WHEN.`,
      missionIds: ["commerce-m04", "commerce-m05", "commerce-m06"],
    },
    {
      id: "commerce-ch-03",
      number: 3,
      title: "Connecting the Business",
      difficulty: "Intermediate",
      narrative: `Tables don't exist in isolation. Connect orders to customers, products to sellers, and orders to payments — while learning why joining transactional tables can accidentally inflate totals.

These missions cover INNER JOIN, LEFT JOIN, multiple joins, join cardinality, and NULL handling.`,
      missionIds: ["commerce-m07", "commerce-m08", "commerce-m09"],
    },
    {
      id: "commerce-ch-04",
      number: 4,
      title: "Customer Intelligence",
      difficulty: "Advanced",
      narrative: `Who are the repeat customers? Are deliveries on time? How do review scores relate to delivery performance?

You'll use subqueries, EXISTS, correlated subqueries, CTEs, date functions, and window functions.`,
      missionIds: ["commerce-m10", "commerce-m11", "commerce-m12"],
    },
    {
      id: "commerce-ch-05",
      number: 5,
      title: "Business Intelligence",
      difficulty: "Expert",
      narrative: `Your capstone. Rank categories and sellers by revenue, investigate retention with running totals and LAG, and build a multi-step executive performance report.

Combines multiple CTEs, window functions, ranking, and complex joins.`,
      missionIds: ["commerce-m13", "commerce-m14", "commerce-m15"],
    },
  ],
}
