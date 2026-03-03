import sys
import pandas as pd
import os
import json

def main():
    # 获取命令行参数
    mat = sys.argv[1]         # 输入的CSV文件路径
    save_path = sys.argv[2]   # 输出文件保存的目录
    gene = sys.argv[3]        # 要保留的基因列名称
    color = "#460b5e"         # 颜色代码，可以根据需要修改

    # 要保留的列名
    cols_to_keep = ['UMAP1', 'UMAP2', 'cell', gene]

    # 使用usecols参数，只读取需要的列
    df = pd.read_csv(mat, usecols=cols_to_keep)

    # 生成JSON数据
    data = {
        gene: {
            "color": color,
            "cells": []
        }
    }

    # 遍历DataFrame的每一行，构建cells列表
    for index, row in df.iterrows():
        cell_data = {
            "cell": row["cell"],
            "UMAP1": float(row["UMAP1"]),
            "UMAP2": float(row["UMAP2"]),
            "expression": float(row[gene])
        }
        data[gene]["cells"].append(cell_data)

    # 将JSON数据输出到标准输出
    print(json.dumps(data))

if __name__ == "__main__":
    main()
