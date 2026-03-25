import json
import os
import sys

import numpy as np
import pandas as pd


COLOR_HEX = "#460b5e"


def find_column(columns, candidates):
    lower_to_raw = {str(col).strip().lower(): col for col in columns}
    for name in candidates:
        key = name.strip().lower()
        if key in lower_to_raw:
            return lower_to_raw[key]
    return None


def resolve_coordinate_columns(columns):
    pairs = [
        ("x", "y"),
        ("row", "col"),
        ("col", "row"),
        ("x_centroid", "y_centroid"),
        ("spatial_x", "spatial_y"),
        ("umap1", "umap2"),
        ("umap_1", "umap_2"),
        ("xcoord", "ycoord"),
    ]
    for x_name, y_name in pairs:
        x_col = find_column(columns, [x_name])
        y_col = find_column(columns, [y_name])
        if x_col is not None and y_col is not None:
            return x_col, y_col
    return None, None


def resolve_gene_column(columns, requested_gene):
    direct = find_column(columns, [requested_gene])
    if direct is not None:
        return direct
    return None


def to_float_series(series):
    return pd.to_numeric(series, errors="coerce").fillna(0.0)


def resolve_spatial_from_h5ad(adata):
    if "spatial" in adata.obsm and adata.obsm["spatial"] is not None:
        arr = np.asarray(adata.obsm["spatial"])
        if arr.ndim == 2 and arr.shape[1] >= 2:
            return arr[:, 0], arr[:, 1]

    x_col = find_column(adata.obs.columns, ["x", "row", "x_centroid", "spatial_x", "umap1", "umap_1"])
    y_col = find_column(adata.obs.columns, ["y", "col", "y_centroid", "spatial_y", "umap2", "umap_2"])
    if x_col is not None and y_col is not None:
        x_vals = to_float_series(adata.obs[x_col]).to_numpy()
        y_vals = to_float_series(adata.obs[y_col]).to_numpy()
        return x_vals, y_vals

    raise ValueError("cannot find spatial coordinates in h5ad (need obsm['spatial'] or x/y-like obs columns)")


def extract_gene_from_h5ad(adata, requested_gene):
    var_names = adata.var_names.astype(str)
    lower_map = {g.lower(): g for g in var_names}

    if requested_gene in var_names:
        gene_name = requested_gene
    elif requested_gene.lower() in lower_map:
        gene_name = lower_map[requested_gene.lower()]
    else:
        raise ValueError(f"gene '{requested_gene}' not found in h5ad var_names")

    gene_idx = adata.var_names.get_loc(gene_name)
    expr = adata[:, gene_idx].X
    if hasattr(expr, "toarray"):
        expr = expr.toarray()
    expr = np.asarray(expr).reshape(-1)
    return gene_name, expr


def load_cells_from_h5ad(h5ad_path, requested_gene):
    import scanpy as sc

    adata = sc.read_h5ad(h5ad_path)
    x_vals, y_vals = resolve_spatial_from_h5ad(adata)
    gene_name, expr_vals = extract_gene_from_h5ad(adata, requested_gene)
    cells = []
    for i, cell_name in enumerate(adata.obs_names.astype(str)):
        cells.append(
            {
                "cell": cell_name,
                "UMAP1": float(x_vals[i]),
                "UMAP2": float(y_vals[i]),
                "expression": float(expr_vals[i]),
            }
        )
    return gene_name, cells


def load_cells_from_csv(csv_path, requested_gene):
    header = pd.read_csv(csv_path, nrows=0)
    columns = list(header.columns)

    x_col, y_col = resolve_coordinate_columns(columns)
    if x_col is None or y_col is None:
        raise ValueError("cannot find coordinate columns in gene.csv")

    gene_col = resolve_gene_column(columns, requested_gene)
    if gene_col is None:
        raise ValueError(f"gene '{requested_gene}' not found in gene.csv")

    cell_col = find_column(
        columns,
        ["cell", "cell_id", "cellid", "barcode", "barcodes", "x", "index"],
    )

    usecols = [x_col, y_col, gene_col] + ([cell_col] if cell_col else [])
    df = pd.read_csv(csv_path, usecols=usecols)

    x_vals = to_float_series(df[x_col])
    y_vals = to_float_series(df[y_col])
    expr_vals = to_float_series(df[gene_col])
    if cell_col:
        cell_vals = df[cell_col].astype(str)
    else:
        cell_vals = pd.Series([f"cell_{i}" for i in range(len(df))], index=df.index)

    cells = []
    for i in range(len(df)):
        cells.append(
            {
                "cell": cell_vals.iat[i],
                "UMAP1": float(x_vals.iat[i]),
                "UMAP2": float(y_vals.iat[i]),
                "expression": float(expr_vals.iat[i]),
            }
        )
    return requested_gene, cells


def pick_h5ad_from_dataset_dir(dataset_dir):
    preferred = os.path.join(dataset_dir, "sc_test.h5ad")
    if os.path.exists(preferred):
        return preferred
    candidates = sorted(
        [
            os.path.join(dataset_dir, name)
            for name in os.listdir(dataset_dir)
            if name.lower().endswith(".h5ad")
        ]
    )
    return candidates[0] if candidates else None


def main():
    if len(sys.argv) < 4:
        raise ValueError("usage: spatial_gene.py <gene_csv_path> <base_path> <gene>")

    csv_path = sys.argv[1]
    requested_gene = sys.argv[3]
    if os.path.exists(csv_path):
        gene_name, cells = load_cells_from_csv(csv_path, requested_gene)
    else:
        dataset_dir = os.path.dirname(csv_path)
        h5ad_path = pick_h5ad_from_dataset_dir(dataset_dir)
        if not h5ad_path:
            raise FileNotFoundError(
                f"neither gene.csv nor h5ad found in dataset dir: {dataset_dir}"
            )
        gene_name, cells = load_cells_from_h5ad(h5ad_path, requested_gene)

    payload = {
        gene_name: {
            "color": COLOR_HEX,
            "cells": cells,
        }
    }
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
