/*
 * Roadmap 02 — The Commerce Code: 15 missions (5 chapters x 3).
 * Reference queries are written in DuckDB dialect and validated against the
 * curated Olist Brazilian E-Commerce dataset in public/datasets/commerce/.
 */

import type { Mission } from "../../types"

const baseRule = (overrides: Partial<import("../../types").ValidationRule> = {}) => ({
  columnOrderMatters: true,
  rowOrderMatters: true,
  duplicateRowsMatter: true,
  numericTolerance: 1e-6,
  ...overrides,
})

export const commerceMissions: Mission[] = [
  // ================= CHAPTER 01 — Opening the Store =================
  {
    id: "commerce-m01",
    number: 1,
    title: "First Orders",
    roadmapId: "commerce",
    chapterId: "commerce-ch-01",
    difficulty: "Beginner",
    briefing: `Your first day on the Commerce Analytics team. Pull up the most recent orders to see what an order record looks like.`,
    context: "Inspect recent rows in the orders table.",
    objectives: ["Select specific columns", "Order by timestamp", "Limit rows"],
    concepts: ["SELECT", "FROM", "ORDER BY", "LIMIT"],
    tables: ["orders"],
    columns: {
      orders: ["order_id", "customer_id", "order_status", "order_purchase_timestamp"],
    },
    task: `Return order_id, customer_id, order_status, and order_purchase_timestamp for the 10 most recent orders, ordered newest first.

Expected output columns: order_id, customer_id, order_status, order_purchase_timestamp`,
    expectedOutput: ["order_id", "customer_id", "order_status", "order_purchase_timestamp"],
    starterSql: `SELECT
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp
FROM orders
ORDER BY order_purchase_timestamp DESC
LIMIT 10;`,
    referenceSql: `SELECT
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp
FROM orders
ORDER BY order_purchase_timestamp DESC
LIMIT 10;`,
    hints: [
      "SELECT the columns you need, then FROM orders.",
      "ORDER BY order_purchase_timestamp DESC shows newest orders first.",
      "LIMIT 10 returns only the 10 most recent rows.",
    ],
    solution: `SELECT
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp
FROM orders
ORDER BY order_purchase_timestamp DESC
LIMIT 10;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "commerce-m02",
    number: 2,
    title: "Who Are the Customers?",
    roadmapId: "commerce",
    chapterId: "commerce-ch-01",
    difficulty: "Beginner",
    briefing: `Where are the company's customers located? Identify the distinct customer states (regions) served.`,
    context: "Use DISTINCT to list unique customer states.",
    objectives: ["List distinct values", "Order the results"],
    concepts: ["DISTINCT", "ORDER BY"],
    tables: ["customers"],
    columns: {
      customers: ["customer_state"],
    },
    task: `Return the distinct customer_state values from the customers table, ordered alphabetically.

Expected output columns: customer_state`,
    expectedOutput: ["customer_state"],
    starterSql: `SELECT DISTINCT customer_state
FROM customers
ORDER BY customer_state;`,
    referenceSql: `SELECT DISTINCT customer_state
FROM customers
ORDER BY customer_state;`,
    hints: [
      "SELECT DISTINCT customer_state returns each state only once.",
      "ORDER BY customer_state lists them alphabetically.",
    ],
    solution: `SELECT DISTINCT customer_state
FROM customers
ORDER BY customer_state;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "commerce-m03",
    number: 3,
    title: "Product Catalogue",
    roadmapId: "commerce",
    chapterId: "commerce-ch-01",
    difficulty: "Beginner",
    briefing: `Explore the product catalogue. Look at product identifiers, their categories, and product attributes such as weight.`,
    context: "Select product fields where category is known.",
    objectives: ["Select product columns", "Filter out NULL categories", "Limit rows"],
    concepts: ["SELECT", "WHERE", "IS NOT NULL", "LIMIT"],
    tables: ["products"],
    columns: {
      products: ["product_id", "product_category_name", "product_weight_g"],
    },
    task: `Return product_id, product_category_name, and product_weight_g for products that have a known category. Limit to 20 rows.

Expected output columns: product_id, product_category_name, product_weight_g`,
    expectedOutput: ["product_id", "product_category_name", "product_weight_g"],
    starterSql: `SELECT
    product_id,
    product_category_name,
    product_weight_g
FROM products
WHERE product_category_name IS NOT NULL
LIMIT 20;`,
    referenceSql: `SELECT
    product_id,
    product_category_name,
    product_weight_g
FROM products
WHERE product_category_name IS NOT NULL
LIMIT 20;`,
    hints: [
      "WHERE product_category_name IS NOT NULL excludes products without a category.",
      "LIMIT 20 keeps the catalogue preview manageable.",
    ],
    solution: `SELECT
    product_id,
    product_category_name,
    product_weight_g
FROM products
WHERE product_category_name IS NOT NULL
LIMIT 20;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false }),
  },

  // ================= CHAPTER 02 — Understanding Revenue =================
  {
    id: "commerce-m04",
    number: 4,
    title: "The Revenue Report",
    roadmapId: "commerce",
    chapterId: "commerce-ch-02",
    difficulty: "Beginner to intermediate",
    briefing: `How much money has the business processed? Calculate total revenue and the average payment value using the payments table.`,
    context: "Aggregate over payment_value.",
    objectives: ["Count orders", "Sum payment value", "Average payment value"],
    concepts: ["COUNT", "SUM", "AVG"],
    tables: ["payments"],
    columns: {
      payments: ["payment_value"],
    },
    task: `Return the total number of payments, total revenue, and average payment value.

Expected output columns: total_orders, total_revenue, avg_order_payment`,
    expectedOutput: ["total_orders", "total_revenue", "avg_order_payment"],
    starterSql: `SELECT
    COUNT(*) AS total_orders,
    SUM(payment_value) AS total_revenue,
    AVG(payment_value) AS avg_order_payment
FROM payments;`,
    referenceSql: `SELECT
    COUNT(*) AS total_orders,
    SUM(payment_value) AS total_revenue,
    AVG(payment_value) AS avg_order_payment
FROM payments;`,
    hints: [
      "COUNT(*) counts payment records.",
      "SUM(payment_value) is total revenue processed.",
      "AVG(payment_value) is the average payment amount.",
    ],
    solution: `SELECT
    COUNT(*) AS total_orders,
    SUM(payment_value) AS total_revenue,
    AVG(payment_value) AS avg_order_payment
FROM payments;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false, numericTolerance: 0.01 }),
  },
  {
    id: "commerce-m05",
    number: 5,
    title: "Best-Selling Categories",
    roadmapId: "commerce",
    chapterId: "commerce-ch-02",
    difficulty: "Beginner to intermediate",
    briefing: `Which product categories generate the most revenue? Join order items to products and the category translation table.`,
    context: "Multiple joins, then GROUP BY category with SUM of price.",
    objectives: ["Join multiple tables", "Sum revenue by category", "Rank categories"],
    concepts: ["INNER JOIN", "Multiple joins", "SUM", "GROUP BY", "ORDER BY"],
    tables: ["order_items", "products", "product_category_translation"],
    columns: {
      order_items: ["product_id", "price"],
      products: ["product_id", "product_category_name"],
      product_category_translation: ["product_category_name", "product_category_name_english"],
    },
    task: `Return each product category (in English) and its total revenue from order items. Sort by revenue descending.

Expected output columns: category, category_revenue`,
    expectedOutput: ["category", "category_revenue"],
    starterSql: `SELECT
    t.product_category_name_english AS category,
    SUM(oi.price) AS category_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN product_category_translation t ON p.product_category_name = t.product_category_name
GROUP BY t.product_category_name_english
ORDER BY category_revenue DESC
LIMIT 15;`,
    referenceSql: `SELECT
    t.product_category_name_english AS category,
    SUM(oi.price) AS category_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN product_category_translation t ON p.product_category_name = t.product_category_name
GROUP BY t.product_category_name_english
ORDER BY category_revenue DESC
LIMIT 15;`,
    hints: [
      "Join order_items → products on product_id.",
      "Join products → product_category_translation on product_category_name to get the English name.",
      "SUM(oi.price) grouped by category gives category revenue.",
    ],
    solution: `SELECT
    t.product_category_name_english AS category,
    SUM(oi.price) AS category_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN product_category_translation t ON p.product_category_name = t.product_category_name
GROUP BY t.product_category_name_english
ORDER BY category_revenue DESC
LIMIT 15;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.01 }),
  },
  {
    id: "commerce-m06",
    number: 6,
    title: "The Customer Basket",
    roadmapId: "commerce",
    chapterId: "commerce-ch-02",
    difficulty: "Beginner to intermediate",
    briefing: `What does a typical customer's basket look like? Calculate the total value of each order from its items, then look at the distribution.`,
    context: "GROUP BY order_id to build order baskets, then aggregate.",
    objectives: ["Build order baskets with GROUP BY", "Sum item prices per order", "Average basket value"],
    concepts: ["SUM", "GROUP BY", "Subquery", "AVG"],
    tables: ["order_items"],
    columns: {
      order_items: ["order_id", "price"],
    },
    task: `Return each order_id and its total basket value (sum of item prices). Sort by basket value descending.

Expected output columns: order_id, order_value`,
    expectedOutput: ["order_id", "order_value"],
    starterSql: `SELECT
    order_id,
    SUM(price) AS order_value
FROM order_items
GROUP BY order_id
ORDER BY order_value DESC
LIMIT 20;`,
    referenceSql: `SELECT
    order_id,
    SUM(price) AS order_value
FROM order_items
GROUP BY order_id
ORDER BY order_value DESC
LIMIT 20;`,
    hints: [
      "GROUP BY order_id groups the items belonging to each order.",
      "SUM(price) is the total basket value for that order.",
      "ORDER BY order_value DESC shows the largest baskets first.",
    ],
    solution: `SELECT
    order_id,
    SUM(price) AS order_value
FROM order_items
GROUP BY order_id
ORDER BY order_value DESC
LIMIT 20;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.01 }),
  },

  // ================= CHAPTER 03 — Connecting the Business =================
  {
    id: "commerce-m07",
    number: 7,
    title: "Orders and Customers",
    roadmapId: "commerce",
    chapterId: "commerce-ch-03",
    difficulty: "Intermediate",
    briefing: `Connect each order to the customer who placed it. Show customer location alongside their orders.`,
    context: "INNER JOIN orders to customers on customer_id.",
    objectives: ["Inner join two tables", "Select from both tables", "Handle the join key"],
    concepts: ["INNER JOIN", "Join keys", "Multiple tables"],
    tables: ["orders", "customers"],
    columns: {
      orders: ["order_id", "order_status", "customer_id"],
      customers: ["customer_id", "customer_city", "customer_state"],
    },
    task: `Return customer_id, customer_city, customer_state, order_id, and order_status for orders joined to their customers. Limit to 30 rows.

Expected output columns: customer_id, customer_city, customer_state, order_id, order_status`,
    expectedOutput: ["customer_id", "customer_city", "customer_state", "order_id", "order_status"],
    starterSql: `SELECT
    c.customer_id,
    c.customer_city,
    c.customer_state,
    o.order_id,
    o.order_status
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
LIMIT 30;`,
    referenceSql: `SELECT
    c.customer_id,
    c.customer_city,
    c.customer_state,
    o.order_id,
    o.order_status
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
LIMIT 30;`,
    hints: [
      "JOIN orders o ON c.customer_id = o.customer_id connects customers to their orders.",
      "This is an INNER JOIN: only customers with orders (and orders with customers) appear.",
      "Prefix columns with table aliases to avoid ambiguity.",
    ],
    solution: `SELECT
    c.customer_id,
    c.customer_city,
    c.customer_state,
    o.order_id,
    o.order_status
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
LIMIT 30;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false }),
  },
  {
    id: "commerce-m08",
    number: 8,
    title: "The Seller Network",
    roadmapId: "commerce",
    chapterId: "commerce-ch-03",
    difficulty: "Intermediate",
    briefing: `Investigate which sellers supply which products through order items. Connect order items to products and sellers.`,
    context: "Join order_items to both products and sellers.",
    objectives: ["Join order_items to products", "Join order_items to sellers", "Multiple joins"],
    concepts: ["INNER JOIN", "Multiple joins", "Join keys"],
    tables: ["order_items", "products", "sellers"],
    columns: {
      order_items: ["order_id", "product_id", "seller_id", "price"],
      products: ["product_id"],
      sellers: ["seller_id"],
    },
    task: `Return order_id, product_id, seller_id, and price for order items, joined to their product and seller. Limit to 30 rows.

Expected output columns: order_id, product_id, seller_id, price`,
    expectedOutput: ["order_id", "product_id", "seller_id", "price"],
    starterSql: `SELECT
    oi.order_id,
    oi.product_id,
    oi.seller_id,
    oi.price
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN sellers s ON oi.seller_id = s.seller_id
LIMIT 30;`,
    referenceSql: `SELECT
    oi.order_id,
    oi.product_id,
    oi.seller_id,
    oi.price
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN sellers s ON oi.seller_id = s.seller_id
LIMIT 30;`,
    hints: [
      "Join order_items to products on product_id.",
      "Join order_items to sellers on seller_id.",
      "Two INNER JOINs means only items with both a valid product and seller appear.",
    ],
    solution: `SELECT
    oi.order_id,
    oi.product_id,
    oi.seller_id,
    oi.price
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN sellers s ON oi.seller_id = s.seller_id
LIMIT 30;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false }),
  },
  {
    id: "commerce-m09",
    number: 9,
    title: "Following the Money",
    roadmapId: "commerce",
    chapterId: "commerce-ch-03",
    difficulty: "Intermediate",
    briefing: `Combine orders with their payment records to understand payment methods and amounts. Watch out: one order can have multiple payments, so joining can inflate counts.`,
    context: "Join orders to payments; note one-to-many cardinality.",
    objectives: ["Join orders to payments", "Identify payment types and amounts", "Recognize one-to-many join inflation"],
    concepts: ["INNER JOIN", "Join cardinality", "One-to-many", "NULL handling"],
    tables: ["orders", "payments"],
    columns: {
      orders: ["order_id", "order_status"],
      payments: ["order_id", "payment_type", "payment_value"],
    },
    task: `Return order_id, order_status, payment_type, and payment_value for orders joined to their payments. Limit to 30 rows.

Expected output columns: order_id, order_status, payment_type, payment_value`,
    expectedOutput: ["order_id", "order_status", "payment_type", "payment_value"],
    starterSql: `SELECT
    o.order_id,
    o.order_status,
    p.payment_type,
    p.payment_value
FROM orders o
JOIN payments p ON o.order_id = p.order_id
LIMIT 30;`,
    referenceSql: `SELECT
    o.order_id,
    o.order_status,
    p.payment_type,
    p.payment_value
FROM orders o
JOIN payments p ON o.order_id = p.order_id
LIMIT 30;`,
    hints: [
      "JOIN orders to payments on order_id.",
      "Because one order can have multiple payments, an order may appear more than once — this is one-to-many join inflation.",
      "Be careful when summing payment_value across this join to avoid double-counting revenue.",
    ],
    solution: `SELECT
    o.order_id,
    o.order_status,
    p.payment_type,
    p.payment_value
FROM orders o
JOIN payments p ON o.order_id = p.order_id
LIMIT 30;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: false }),
  },

  // ================= CHAPTER 04 — Customer Intelligence =================
  {
    id: "commerce-m10",
    number: 10,
    title: "Repeat Customers",
    roadmapId: "commerce",
    chapterId: "commerce-ch-04",
    difficulty: "Advanced",
    briefing: `Which customers buy more than once? Find customers with more than one order and rank them by purchase frequency.`,
    context: "GROUP BY customer_id with HAVING COUNT(*) > 1.",
    objectives: ["Group by customer", "Filter groups with HAVING", "Rank repeat customers"],
    concepts: ["GROUP BY", "HAVING", "COUNT", "ORDER BY"],
    tables: ["orders"],
    columns: {
      orders: ["customer_id", "order_id"],
    },
    task: `Return customer_id and their number of orders for customers with more than one order. Sort by order count descending.

Expected output columns: customer_id, order_count`,
    expectedOutput: ["customer_id", "order_count"],
    starterSql: `SELECT
    customer_id,
    COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY order_count DESC
LIMIT 20;`,
    referenceSql: `SELECT
    customer_id,
    COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY order_count DESC
LIMIT 20;`,
    hints: [
      "GROUP BY customer_id aggregates orders per customer.",
      "HAVING COUNT(*) > 1 keeps only repeat customers.",
      "ORDER BY order_count DESC ranks most frequent buyers first.",
    ],
    solution: `SELECT
    customer_id,
    COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY order_count DESC
LIMIT 20;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "commerce-m11",
    number: 11,
    title: "Delivery Performance",
    roadmapId: "commerce",
    chapterId: "commerce-ch-04",
    difficulty: "Advanced",
    briefing: `Are deliveries on time? Compare the actual delivery date to the estimated delivery date for delivered orders.`,
    context: "Date difference between delivered date and estimated date; NULL handling for undelivered.",
    objectives: ["Compute date differences", "Filter delivered orders", "Sort by delivery delay"],
    concepts: ["Date differences", "IS NOT NULL", "ORDER BY"],
    tables: ["orders"],
    columns: {
      orders: ["order_id", "order_delivered_customer_date", "order_estimated_delivery_date"],
    },
    task: `Return order_id, the actual delivery date, the estimated delivery date, and the difference in days (actual - estimated). Only include delivered orders. Sort by the difference descending.

Expected output columns: order_id, order_delivered_customer_date, order_estimated_delivery_date, delivery_diff_days`,
    expectedOutput: ["order_id", "order_delivered_customer_date", "order_estimated_delivery_date", "delivery_diff_days"],
    starterSql: `SELECT
    order_id,
    order_delivered_customer_date,
    order_estimated_delivery_date,
    CAST(order_delivered_customer_date AS DATE) - CAST(order_estimated_delivery_date AS DATE) AS delivery_diff_days
FROM orders
WHERE order_delivered_customer_date IS NOT NULL
ORDER BY delivery_diff_days DESC
LIMIT 20;`,
    referenceSql: `SELECT
    order_id,
    order_delivered_customer_date,
    order_estimated_delivery_date,
    CAST(order_delivered_customer_date AS DATE) - CAST(order_estimated_delivery_date AS DATE) AS delivery_diff_days
FROM orders
WHERE order_delivered_customer_date IS NOT NULL
ORDER BY delivery_diff_days DESC
LIMIT 20;`,
    hints: [
      "Filter to delivered orders with WHERE order_delivered_customer_date IS NOT NULL.",
      "Cast both timestamps to DATE before subtracting to get days.",
      "Positive values mean delivery was later than estimated.",
    ],
    solution: `SELECT
    order_id,
    order_delivered_customer_date,
    order_estimated_delivery_date,
    CAST(order_delivered_customer_date AS DATE) - CAST(order_estimated_delivery_date AS DATE) AS delivery_diff_days
FROM orders
WHERE order_delivered_customer_date IS NOT NULL
ORDER BY delivery_diff_days DESC
LIMIT 20;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "commerce-m12",
    number: 12,
    title: "Customer Satisfaction",
    roadmapId: "commerce",
    chapterId: "commerce-ch-04",
    difficulty: "Advanced",
    briefing: `How do review scores relate to delivery performance? For each review score, find the average delivery delay.`,
    context: "Join reviews to orders, group by review_score, average date difference.",
    objectives: ["Join reviews to orders", "Group by review score", "Average delivery delay per score"],
    concepts: ["INNER JOIN", "GROUP BY", "AVG", "Date differences"],
    tables: ["reviews", "orders"],
    columns: {
      reviews: ["review_id", "order_id", "review_score"],
      orders: ["order_id", "order_delivered_customer_date", "order_estimated_delivery_date"],
    },
    task: `Return review_score, the number of reviews, and the average delivery delay in days. Only include delivered orders. Sort by review score descending.

Expected output columns: review_score, review_count, avg_delivery_diff`,
    expectedOutput: ["review_score", "review_count", "avg_delivery_diff"],
    starterSql: `SELECT
    r.review_score,
    COUNT(*) AS review_count,
    AVG(CAST(o.order_delivered_customer_date AS DATE) - CAST(o.order_estimated_delivery_date AS DATE)) AS avg_delivery_diff
FROM reviews r
JOIN orders o ON r.order_id = o.order_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY r.review_score
ORDER BY r.review_score DESC;`,
    referenceSql: `SELECT
    r.review_score,
    COUNT(*) AS review_count,
    AVG(CAST(o.order_delivered_customer_date AS DATE) - CAST(o.order_estimated_delivery_date AS DATE)) AS avg_delivery_diff
FROM reviews r
JOIN orders o ON r.order_id = o.order_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY r.review_score
ORDER BY r.review_score DESC;`,
    hints: [
      "Join reviews to orders on order_id.",
      "Filter delivered orders with WHERE order_delivered_customer_date IS NOT NULL.",
      "GROUP BY r.review_score and AVG of the date difference shows delay per score.",
    ],
    solution: `SELECT
    r.review_score,
    COUNT(*) AS review_count,
    AVG(CAST(o.order_delivered_customer_date AS DATE) - CAST(o.order_estimated_delivery_date AS DATE)) AS avg_delivery_diff
FROM reviews r
JOIN orders o ON r.order_id = o.order_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY r.review_score
ORDER BY r.review_score DESC;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.01 }),
  },

  // ================= CHAPTER 05 — Business Intelligence =================
  {
    id: "commerce-m13",
    number: 13,
    title: "The Revenue Leaderboard",
    roadmapId: "commerce",
    chapterId: "commerce-ch-05",
    difficulty: "Expert",
    briefing: `Rank product categories and sellers by revenue. Build a leaderboard using window functions.`,
    context: "CTE for category revenue, then RANK() over revenue.",
    objectives: ["Aggregate revenue by category", "Rank with a window function", "Order by rank"],
    concepts: ["CTE", "SUM", "GROUP BY", "Window functions", "RANK", "ORDER BY"],
    tables: ["order_items", "products", "product_category_translation"],
    columns: {
      order_items: ["product_id", "price"],
      products: ["product_id", "product_category_name"],
      product_category_translation: ["product_category_name", "product_category_name_english"],
    },
    task: `Return each product category, its total revenue, and its revenue rank. Sort by revenue descending.

Expected output columns: category, revenue, revenue_rank`,
    expectedOutput: ["category", "revenue", "revenue_rank"],
    starterSql: `WITH cat_rev AS (
    SELECT
        t.product_category_name_english AS category,
        SUM(oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN product_category_translation t ON p.product_category_name = t.product_category_name
    GROUP BY t.product_category_name_english
)
SELECT
    category,
    revenue,
    RANK() OVER (ORDER BY revenue DESC) AS revenue_rank
FROM cat_rev
ORDER BY revenue DESC
LIMIT 15;`,
    referenceSql: `WITH cat_rev AS (
    SELECT
        t.product_category_name_english AS category,
        SUM(oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN product_category_translation t ON p.product_category_name = t.product_category_name
    GROUP BY t.product_category_name_english
)
SELECT
    category,
    revenue,
    RANK() OVER (ORDER BY revenue DESC) AS revenue_rank
FROM cat_rev
ORDER BY revenue DESC
LIMIT 15;`,
    hints: [
      "First CTE computes revenue per category (join order_items → products → translation).",
      "RANK() OVER (ORDER BY revenue DESC) assigns ranks by revenue.",
      "Sort final output by revenue descending.",
    ],
    solution: `WITH cat_rev AS (
    SELECT
        t.product_category_name_english AS category,
        SUM(oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN product_category_translation t ON p.product_category_name = t.product_category_name
    GROUP BY t.product_category_name_english
)
SELECT
    category,
    revenue,
    RANK() OVER (ORDER BY revenue DESC) AS revenue_rank
FROM cat_rev
ORDER BY revenue DESC
LIMIT 15;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.01 }),
  },
  {
    id: "commerce-m14",
    number: 14,
    title: "The Retention Question",
    roadmapId: "commerce",
    chapterId: "commerce-ch-05",
    difficulty: "Expert",
    briefing: `Investigate repeat purchase behaviour. For each customer, sequence their orders chronologically and identify orders beyond the first (repeat purchases).`,
    context: "ROW_NUMBER() partitioned by customer ordered by purchase timestamp.",
    objectives: ["Number orders per customer", "Window function with PARTITION BY", "Identify repeat purchases"],
    concepts: ["CTE", "ROW_NUMBER", "PARTITION BY", "Window functions"],
    tables: ["orders"],
    columns: {
      orders: ["customer_id", "order_id", "order_purchase_timestamp"],
    },
    task: `Return customer_id, order sequence number, and purchase timestamp for each customer's orders, ordered by customer and sequence.

Expected output columns: customer_id, order_seq, order_purchase_timestamp`,
    expectedOutput: ["customer_id", "order_seq", "order_purchase_timestamp"],
    starterSql: `WITH customer_orders AS (
    SELECT
        customer_id,
        order_id,
        order_purchase_timestamp,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_purchase_timestamp) AS order_seq
    FROM orders
)
SELECT customer_id, order_seq, order_purchase_timestamp
FROM customer_orders
ORDER BY customer_id, order_seq
LIMIT 30;`,
    referenceSql: `WITH customer_orders AS (
    SELECT
        customer_id,
        order_id,
        order_purchase_timestamp,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_purchase_timestamp) AS order_seq
    FROM orders
)
SELECT customer_id, order_seq, order_purchase_timestamp
FROM customer_orders
ORDER BY customer_id, order_seq
LIMIT 30;`,
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_purchase_timestamp) numbers each customer's orders chronologically.",
      "order_seq = 1 is the first order; higher values are repeat purchases.",
      "CTE keeps the query readable.",
    ],
    solution: `WITH customer_orders AS (
    SELECT
        customer_id,
        order_id,
        order_purchase_timestamp,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_purchase_timestamp) AS order_seq
    FROM orders
)
SELECT customer_id, order_seq, order_purchase_timestamp
FROM customer_orders
ORDER BY customer_id, order_seq
LIMIT 30;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true }),
  },
  {
    id: "commerce-m15",
    number: 15,
    title: "The Executive Report",
    roadmapId: "commerce",
    chapterId: "commerce-ch-05",
    difficulty: "Expert",
    briefing: `Your capstone. Build a monthly business performance report: monthly revenue, running total, and month-over-month change using multiple CTEs and window functions.`,
    context: "Multiple CTEs, date truncation, SUM window (running total), LAG (period comparison).",
    objectives: ["Aggregate monthly revenue", "Compute running total", "Month-over-month comparison"],
    concepts: ["Multiple CTEs", "Date truncation", "Window functions", "Running totals", "LAG", "Period-over-period"],
    tables: ["orders", "order_items", "payments"],
    columns: {
      orders: ["order_id", "order_purchase_timestamp"],
      order_items: ["order_id", "price"],
      payments: ["order_id", "payment_value"],
    },
    task: `Return month, monthly revenue, running total of revenue, and previous month's revenue. Order chronologically.

Expected output columns: month, monthly_revenue, running_total, prev_month_revenue`,
    expectedOutput: ["month", "monthly_revenue", "running_total", "prev_month_revenue"],
    starterSql: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', CAST(o.order_purchase_timestamp AS DATE)) AS month,
        SUM(p.payment_value) AS monthly_revenue
    FROM orders o
    JOIN payments p ON o.order_id = p.order_id
    GROUP BY 1
)
SELECT
    month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (ORDER BY month) AS running_total,
    LAG(monthly_revenue) OVER (ORDER BY month) AS prev_month_revenue
FROM monthly
ORDER BY month;`,
    referenceSql: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', CAST(o.order_purchase_timestamp AS DATE)) AS month,
        SUM(p.payment_value) AS monthly_revenue
    FROM orders o
    JOIN payments p ON o.order_id = p.order_id
    GROUP BY 1
)
SELECT
    month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (ORDER BY month) AS running_total,
    LAG(monthly_revenue) OVER (ORDER BY month) AS prev_month_revenue
FROM monthly
ORDER BY month;`,
    hints: [
      "First CTE: monthly revenue = SUM(payment_value) per month (join orders → payments).",
      "SUM(monthly_revenue) OVER (ORDER BY month) is the running total.",
      "LAG(monthly_revenue) OVER (ORDER BY month) is the previous month's revenue.",
    ],
    solution: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', CAST(o.order_purchase_timestamp AS DATE)) AS month,
        SUM(p.payment_value) AS monthly_revenue
    FROM orders o
    JOIN payments p ON o.order_id = p.order_id
    GROUP BY 1
)
SELECT
    month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (ORDER BY month) AS running_total,
    LAG(monthly_revenue) OVER (ORDER BY month) AS prev_month_revenue
FROM monthly
ORDER BY month;`,
    xp: 100,
    validation: baseRule({ rowOrderMatters: true, numericTolerance: 0.01 }),
  },
]
