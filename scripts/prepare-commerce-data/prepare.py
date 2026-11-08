"""Prepare the Olist Brazilian E-Commerce dataset for Queryville - Roadmap 02: The Commerce Code.

Source: Brazilian E-Commerce Public Dataset by Olist
https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce

Licensing: the dataset is public data published by Olist; this mirror was retrieved
from a public GitHub mirror of the original CSV files. The data is a historical
snapshot (orders from Sept 2016 to Oct 2018), NOT a live feed.

Note: Kaggle access to the official dataset may require authentication. If you cannot
re-download from Kaggle, place the official CSV files (from the Olist dataset) into
public/datasets/commerce/ and re-run this script. The expected file names are listed
in EXPECTED_FILES.

Output: parquet files in public/datasets/commerce/ plus dataset.json provenance metadata.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

import pandas as pd

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "datasets", "commerce")
OUT_DIR = SRC_DIR

# Columns coerced to proper types so reference queries stay simple and readable.
NUMERIC_COLUMNS = {
    "order_items": ["price", "freight_value"],
    "payments": ["payment_value", "payment_installments"],
    "products": [
        "product_name_lenght",
        "product_description_lenght",
        "product_photos_qty",
        "product_weight_g",
        "product_length_cm",
        "product_height_cm",
        "product_width_cm",
    ],
}

EXPECTED_FILES = [
    "olist_orders_dataset.csv",
    "olist_customers_dataset.csv",
    "olist_order_items_dataset.csv",
    "olist_order_payments_dataset.csv",
    "olist_order_reviews_dataset.csv",
    "olist_products_dataset.csv",
    "olist_sellers_dataset.csv",
    "product_category_name_translation.csv",
    "olist_geolocation_dataset.csv",  # optional; large, excluded by default in V1
]

# Source -> parquet table name mapping. Geolocation is optional in V1 (61 MB CSV).
TABLE_FILES = {
    "orders": "olist_orders_dataset.csv",
    "customers": "olist_customers_dataset.csv",
    "order_items": "olist_order_items_dataset.csv",
    "payments": "olist_order_payments_dataset.csv",
    "reviews": "olist_order_reviews_dataset.csv",
    "products": "olist_products_dataset.csv",
    "sellers": "olist_sellers_dataset.csv",
    "product_category_translation": "product_category_name_translation.csv",
}

DATE_COLUMNS = {
    "orders": [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
    ],
    "reviews": ["review_creation_date", "review_answer_timestamp"],
}

# Documented key relationships (validated against the source schemas).
PRIMARY_KEYS = {
    "orders": ["order_id"],
    "customers": ["customer_id"],
    "order_items": ["order_id", "order_item_id"],
    "payments": ["order_id", "payment_sequential"],
    "reviews": ["review_id"],
    "products": ["product_id"],
    "sellers": ["seller_id"],
    "product_category_translation": ["product_category_name"],
}

FOREIGN_KEYS = [
    ("order_items", "order_id", "orders", "order_id"),
    ("payments", "order_id", "orders", "order_id"),
    ("reviews", "order_id", "orders", "order_id"),
    ("orders", "customer_id", "customers", "customer_id"),
    ("order_items", "product_id", "products", "product_id"),
    ("order_items", "seller_id", "sellers", "seller_id"),
    (
        "products",
        "product_category_name",
        "product_category_translation",
        "product_category_name",
    ),
]


def read_csv(name: str) -> pd.DataFrame:
    path = os.path.join(SRC_DIR, name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing source file: {path}")
    df = pd.read_csv(path, dtype=str, keep_default_na=False)
    # Empty strings -> None so DuckDB sees proper NULLs.
    df = df.replace("", None)
    for col in DATE_COLUMNS.get(name, []):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    for col in NUMERIC_COLUMNS.get(name, []):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    extraction_date = datetime.now(timezone.utc).isoformat()
    stats: dict = {}

    for table, file_name in TABLE_FILES.items():
        path = os.path.join(SRC_DIR, file_name)
        if not os.path.exists(path):
            print(f"SKIP {table}: {file_name} not found")
            continue
        df = read_csv(file_name)
        df.to_parquet(os.path.join(OUT_DIR, f"{table}.parquet"), index=False)
        stats[table] = {
            "rows": int(len(df)),
            "columns": list(df.columns),
            "source_file": file_name,
        }
        print(f"{table}: {len(df)} rows, {len(df.columns)} columns")

    # Date coverage of orders (the historical window).
    orders_path = os.path.join(OUT_DIR, "orders.parquet")
    date_min = date_max = None
    if os.path.exists(orders_path):
        import pyarrow.parquet as pq

        orders = pq.read_table(orders_path, columns=["order_purchase_timestamp"]).to_pandas()
        ts = pd.to_datetime(orders["order_purchase_timestamp"], errors="coerce")
        date_min = str(ts.min().date()) if not ts.isna().all() else None
        date_max = str(ts.max().date()) if not ts.isna().all() else None

    meta = {
        "dataset": "Brazilian E-Commerce Public Dataset by Olist",
        "source": "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
        "mirror": "https://github.com/mara/mara-olist-ecommerce-data/tree/master/data/olist-ecommerce",
        "attribution": "Olist (public dataset)",
        "extraction_date_utc": extraction_date,
        "note": "Historical snapshot. Orders span approximately Sept 2016 - Oct 2018. "
        "Not live or continuously updated.",
        "date_range": {"earliest_order": date_min, "latest_order": date_max},
        "tables": stats,
        "primary_keys": PRIMARY_KEYS,
        "foreign_keys": [
            {"from_table": a, "from_column": b, "to_table": c, "to_column": d}
            for a, b, c, d in FOREIGN_KEYS
        ],
        "limitations": [
            "Historical data only (2016-2018); does not reflect current Olist operations.",
            "Geolocation table excluded from V1 bundle for size (available in source).",
            "Curated snapshot, not a complete live feed.",
        ],
    }
    with open(os.path.join(OUT_DIR, "dataset.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print("Done.")


if __name__ == "__main__":
    main()
