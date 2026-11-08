"""Prepare the NYC 311 Service Requests dataset for Queryville - Roadmap 01: The City Files.

Source: NYC OpenData - 311 Service Requests from 2020 to Present
https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9

Attribution: NYC OpenData (public open data).

This script downloads a bounded snapshot from the Socrata CSV export
(https://data.cityofnewyork.us/api/views/erm2-nwe9/rows.csv?$limit=...), normalizes
data types, and writes Parquet assets to public/datasets/city/.

If the network is unavailable in your environment, place the official rows.csv export
into public/datasets/city/ and run the normalization portion of this script.

Output tables:
  - service_requests.parquet   (primary table)
  - boroughs.parquet           (derived dimension)
  - agencies.parquet           (derived dimension)
  - complaint_types.parquet    (derived dimension)
  - dataset.json               (provenance metadata)
"""

from __future__ import annotations

import csv
import json
import os
import sys
from datetime import datetime, timezone

import pyarrow as pa
import pyarrow.parquet as pq

API_CSV_URL = (
    "https://data.cityofnewyork.us/api/views/erm2-nwe9/rows.csv"
    "?accessType=DOWNLOAD&$limit=200000&$order=created_date DESC"
)
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "datasets", "city")

EXPECTED_COLUMNS = [
    "unique_key", "created_date", "closed_date", "agency", "agency_name",
    "complaint_type", "descriptor", "borough", "incident_zip", "status",
    "resolution_description",
]


def parse_nyc_dt(v):
    """'08/03/2021 01:18:14 PM' -> '2021-08-03 13:18:14' (ISO)."""
    if not v:
        return None
    try:
        return datetime.strptime(v, "%m/%d/%Y %I:%M:%S %p").strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        return v


def g(row, col_idx, name):
    i = col_idx.get(name)
    if i is None or i >= len(row):
        return None
    v = row[i].strip()
    return v if v != "" else None


def read_csv_rows(path):
    col_idx = {}
    rows = []
    boroughs, agencies, complaints = set(), set(), set()
    min_date = max_date = None
    n = 0
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for i, c in enumerate(header):
            col_idx[c.strip()] = i
        for row in reader:
            n += 1
            unique_key = g(row, col_idx, "Unique Key")
            if not unique_key:
                continue
            created = parse_nyc_dt(g(row, col_idx, "Created Date"))
            closed = parse_nyc_dt(g(row, col_idx, "Closed Date"))
            agency = g(row, col_idx, "Agency")
            agency_name = g(row, col_idx, "Agency Name")
            complaint = g(row, col_idx, "Problem (formerly Complaint Type)")
            descriptor = g(row, col_idx, "Problem Detail (formerly Descriptor)")
            borough = g(row, col_idx, "Borough")
            zipc = g(row, col_idx, "Incident Zip")
            status = g(row, col_idx, "Status")
            resolution = g(row, col_idx, "Resolution Description")
            rows.append({
                "unique_key": unique_key, "created_date": created, "closed_date": closed,
                "agency": agency, "agency_name": agency_name, "complaint_type": complaint,
                "descriptor": descriptor, "borough": borough, "incident_zip": zipc,
                "latitude": None, "longitude": None, "status": status,
                "resolution_description": resolution,
                "open_data_channel_type": None,
            })
            if created:
                d = created[:10]
                min_date = d if min_date is None or d < min_date else min_date
                max_date = d if max_date is None or d > max_date else max_date
            if borough:
                boroughs.add(borough)
            if agency:
                agencies.add(agency)
            if complaint:
                complaints.add(complaint)
    return rows, boroughs, agencies, complaints, min_date, max_date, n


def write_parquet(rows, boroughs, agencies, complaints, min_date, max_date, raw_count):
    os.makedirs(OUT_DIR, exist_ok=True)

    # De-duplicate by unique_key
    seen = set()
    uniq = []
    for r in rows:
        if r["unique_key"] in seen:
            continue
        seen.add(r["unique_key"])
        uniq.append(r)

    schema = pa.schema([
        pa.field("unique_key", pa.string()),
        pa.field("created_date", pa.string()),
        pa.field("closed_date", pa.string()),
        pa.field("agency", pa.string()),
        pa.field("agency_name", pa.string()),
        pa.field("complaint_type", pa.string()),
        pa.field("descriptor", pa.string()),
        pa.field("borough", pa.string()),
        pa.field("incident_zip", pa.string()),
        pa.field("latitude", pa.float64()),
        pa.field("longitude", pa.float64()),
        pa.field("status", pa.string()),
        pa.field("resolution_description", pa.string()),
        pa.field("open_data_channel_type", pa.string()),
    ])

    pq.write_table(
        pa.Table.from_pylist(uniq, schema=schema),
        os.path.join(OUT_DIR, "service_requests.parquet"), compression="zstd",
    )

    agency_map = {}
    for r in uniq:
        if r["agency"] and r["agency_name"] and r["agency"] not in agency_map:
            agency_map[r["agency"]] = r["agency_name"]

    pq.write_table(
        pa.Table.from_pylist(
            [{"borough": b} for b in sorted(boroughs)],
            pa.schema([pa.field("borough", pa.string())]),
        ),
        os.path.join(OUT_DIR, "boroughs.parquet"), compression="zstd",
    )
    pq.write_table(
        pa.Table.from_pylist(
            [{"agency": k, "agency_name": v} for k, v in sorted(agency_map.items())],
            pa.schema([pa.field("agency", pa.string()), pa.field("agency_name", pa.string())]),
        ),
        os.path.join(OUT_DIR, "agencies.parquet"), compression="zstd",
    )
    ct_agency = {}
    for r in uniq:
        if r["complaint_type"] and r["complaint_type"] not in ct_agency:
            ct_agency[r["complaint_type"]] = r["agency"]
    pq.write_table(
        pa.Table.from_pylist(
            [{"complaint_type": ct, "agency": ct_agency.get(ct)} for ct in sorted(complaints)],
            pa.schema([pa.field("complaint_type", pa.string()), pa.field("agency", pa.string())]),
        ),
        os.path.join(OUT_DIR, "complaint_types.parquet"), compression="zstd",
    )

    meta = {
        "dataset": "311 Service Requests from 2020 to Present",
        "source": "https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9",
        "api": "https://data.cityofnewyork.us/resource/erm2-nwe9.json",
        "csv_export": API_CSV_URL,
        "attribution": "NYC OpenData",
        "extraction_date_utc": datetime.now(timezone.utc).isoformat(),
        "row_count": len(uniq),
        "raw_rows_read": raw_count,
        "date_range": {"earliest_created": min_date, "latest_created": max_date},
        "columns": EXPECTED_COLUMNS,
        "dimension_tables": {
            "boroughs": f"{len(boroughs)} distinct",
            "agencies": f"{len(agency_map)} distinct",
            "complaint_types": f"{len(complaints)} distinct",
        },
        "limitations": [
            "Curated snapshot from the Socrata rows.csv export, not the complete live dataset "
            "(source is updated daily).",
            "Dates normalized from the CSV's US format to ISO.",
            "The CSV export provides State Plane X/Y coordinates rather than lat/long; "
            "latitude/longitude are NULL.",
            "open_data_channel_type is not present in the CSV export; preserved as NULL.",
            "Bounded to the most recent 200,000 export rows for V1.",
        ],
    }
    with open(os.path.join(OUT_DIR, "dataset.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print("Wrote service_requests.parquet:", len(uniq), "rows")
    print(json.dumps(meta, indent=2))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    # Prefer a local rows.csv if present (offline environments); otherwise download.
    local_csv = os.path.join(OUT_DIR, "source_rows.csv")
    if os.path.exists(local_csv):
        print("Using local rows.csv:", local_csv)
        src = local_csv
    else:
        print("Downloading Socrata CSV export (bounded snapshot) ...")
        import urllib.request
        req = urllib.request.Request(
            API_CSV_URL,
            headers={"User-Agent": "Queryville data prep (educational project)"},
        )
        with urllib.request.urlopen(req, timeout=300) as resp:
            data = resp.read()
        with open(local_csv, "wb") as f:
            f.write(data)
        src = local_csv
        print("Downloaded", len(data), "bytes")

    rows, boroughs, agencies, complaints, min_date, max_date, n = read_csv_rows(src)
    print("Rows read:", n)
    write_parquet(rows, boroughs, agencies, complaints, min_date, max_date, n)
    print("Done.")


if __name__ == "__main__":
    main()
