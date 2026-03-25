import json
import os
import sys

import pandas as pd


NON_GENE_COLUMNS = {
    "cell",
    "cell_id",
    "cellid",
    "barcode",
    "barcodes",
    "x",
    "y",
    "row",
    "col",
    "x_centroid",
    "y_centroid",
    "spatial_x",
    "spatial_y",
    "umap1",
    "umap2",
    "umap_1",
    "umap_2",
    "cluster",
    "leiden",
}


def from_gene_csv(csv_path):
    header = pd.read_csv(csv_path, nrows=0)
    genes = []
    for col in header.columns:
        col_str = str(col)
        if col_str.strip().lower() not in NON_GENE_COLUMNS:
            genes.append(col_str)
    return genes


def pick_h5ad(dataset_dir):
    preferred = os.path.join(dataset_dir, "sc_test.h5ad")
    if os.path.exists(preferred):
        return preferred
    h5ads = sorted(
        [
            os.path.join(dataset_dir, name)
            for name in os.listdir(dataset_dir)
            if name.lower().endswith(".h5ad")
        ]
    )
    return h5ads[0] if h5ads else None


def from_h5ad(h5ad_path):
    import scanpy as sc

    adata = sc.read_h5ad(h5ad_path)
    return [str(g) for g in adata.var_names]


def main():
    if len(sys.argv) < 2:
        raise ValueError("usage: list_genes.py <dataset_dir>")

    dataset_dir = sys.argv[1]
    gene_csv = os.path.join(dataset_dir, "gene.csv")

    if os.path.exists(gene_csv):
        genes = from_gene_csv(gene_csv)
    else:
        h5ad_path = pick_h5ad(dataset_dir)
        if not h5ad_path:
            raise FileNotFoundError(f"no gene.csv or h5ad in {dataset_dir}")
        genes = from_h5ad(h5ad_path)

    print(json.dumps(genes, ensure_ascii=False))


if __name__ == "__main__":
    main()
