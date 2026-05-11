# Tomato callus 用户手册

> 文档用途：帮助普通用户快速了解并使用 Tomato callus 单细胞空间平台的核心页面、可视化分析功能与上传流程。  
> 文档更新时间：2026-05-11  
> 截图说明：本文中的界面截图基于当前前端版本通过 Chromium 本地截取，图片位于 `img/` 目录。

---

## 1. 平台简介

Tomato callus 是一个面向番茄愈伤组织再生研究的单细胞空间平台，用于空间转录组、单细胞与相关多模态数据的可视化探索和结果交付。当前网站主要包含以下入口：

- **About**：平台介绍、研究背景、数据资源概览；
- **Analyse**：在线浏览平台数据，并进行聚类/基因相关可视化；
- **Upload Data**：上传用户数据，配置分析任务，并通过邮箱接收结果；
- **References**：浏览和检索文献参考列表；
- **Forum**：跳转到外部论坛社区页面。

推荐使用 **Chrome、Edge 等 Chromium 内核浏览器** 访问，以获得更稳定的显示与交互体验。

---

## 2. 首页与导航说明

### 2.1 顶部导航栏

网站顶部导航栏提供以下常用功能：

- **About**：进入平台介绍页；
- **Analyse**：进入分析页；
- **Forum**：跳转外部论坛；
- **语言切换**：支持英文/中文切换；
- **明暗主题切换**：支持浅色/暗夜模式切换。

### 2.2 About 页面

About 页面主要用于展示平台背景、研究摘要、模块入口与参考文献入口。用户可以通过该页面快速了解平台内容，并直接跳转到分析页或上传页。

![About 页面截图](img/about-page.png)

**建议使用方式：**

1. 首次访问时先阅读 About 页面，了解平台定位与数据背景；
2. 点击 **Explore Atlas** 进入在线分析；
3. 点击 **Upload Data** 进入自定义数据上传流程；
4. 点击 **View full reference list** 查看相关文献。

---

## 3. Analyse 页面总览

Analyse 页面是平台的核心交互区域，主要由三部分组成：

1. **左侧控制面板**：用于选择数据源、数据类型、分析模式和可视化参数；
2. **中间画布区域（Canvas）**：用于展示聚类、基因表达、空间分布等内容；
3. **右侧信息面板**：显示工具说明、已选 cluster、已选点等信息；
4. **右上图例区域（Legend）**：在 cluster 模式下可显示类别颜色，并支持颜色与名称编辑。

![Analyse 页面截图](img/platform-page.png)

---

## 4. Analyse 页面详细使用说明

### 4.1 左侧控制面板（Control Panel）

左侧面板用于配置分析参数，主要分为以下几个部分。

#### 4.1.1 Data Configuration

用于设置数据来源与分析上下文。

- **Select Data Source**：选择数据源；当前界面中可见的典型选项包括：
  - `Cluster`
  - `umap`
  - `Xenium`
  - `spatial`
  - `singleCell`
- **Select Data Type**：当数据源不是 `Cluster` 时显示，可进一步选择样本/时间点；
- **Select Mode**：当数据源支持时，可在以下模式间切换：
  - `cluster`
  - `gene`

> 说明：`singleCell` 数据源在当前逻辑下仅支持 cluster 模式，不提供 gene 模式。

#### 4.1.2 Visualization Parameters

用于调整图形显示效果。

- **Point Size**：调整点大小；
- **Select Clusters**：在特定数据源下筛选要显示的 cluster；
- **Show Cluster Labels**：显示 cluster 标签；
- **Low render (smoother)**：低渲染模式，适合点数较多时提高流畅度；
- **Progressive reveal**：渐进显示 cluster；
- **Show Proportion / Hide Proportion**：显示或关闭 cluster 比例图。

#### 4.1.3 Gene Analysis

当模式切换到 `gene` 后，可进行基因表达分析。

支持两种输入方式：

- **Single Gene**：输入或检索单个基因；
- **Gene Set**：以多行文本形式输入多个基因。

相关控制项包括：

- **Input Gene Name / Input Gene Set**：输入基因；
- **Submit**：提交基因查询；
- **Show Cluster Background**：在基因图上叠加 cluster 背景；
- **Show Cluster Labels**：显示背景 cluster 标签；
- **Gene Opacity**：调节基因层透明度；
- **Gene Color Scale**：设置 Min / Mid / Max 三段颜色；
- **Cluster Opacity**：当显示 cluster 背景时，调节背景透明度。

#### 4.1.4 Download

左侧底部的 **Download** 按钮用于导出当前图像。结合页面逻辑，导出时会尽量保留当前可视化及图例信息。

---

### 4.2 中间画布区域（Canvas）

Canvas 是分析页的核心展示区域，支持图像浏览、选择与旋转等操作。

#### 4.2.1 工具栏功能

画布顶部工具栏包含以下操作：

- **Move**：拖动画布平移视图；滚轮缩放；
- **Select**：框选点或 cluster；
- **Reset**：恢复默认视图；
- **Rotate Canvas**：通过滑块调整画布旋转角度。

#### 4.2.2 典型操作方式

- 使用鼠标滚轮可放大或缩小；
- 使用 Move 工具时，可拖动查看不同区域；
- 切换到 Select 工具后，可在画布中拖出框选区域；
- 使用 Reset 可在多次操作后快速回到初始视角；
- 使用旋转滑块可调整图像方向，便于观察。

---

### 4.3 右侧信息面板（Info Panel）

右侧信息面板用于辅助解释当前交互结果，主要包含：

- **Canvas Toolbar Guide**：说明 Move / Select / Reset / Rotate / Selection Result 的用途；
- **Selected Cluster**：显示当前选中的 cluster；
- **Selected Points**：显示框选后的点（通常为 cell 名称列表）；
- **Gene Expression**：当进入 gene 模式且有统计结果时，会显示表达细胞数量和比例。

#### 4.3.1 Selected Cluster

该区域用于展示当前选中的 cluster：

- 标题右侧数字徽标显示已选 cluster 数量；
- 每个 cluster 条目会显示颜色块与名称；
- 若没有选中内容，则显示空状态。

#### 4.3.2 Selected Points

该区域用于展示当前框选后的点：

- 标题右侧数字徽标显示已选点数量；
- 每个点以列表卡片形式展示；
- 当数量较多时，该区域支持滚动查看。

---

### 4.4 图例区域（Legend）

在 cluster 模式下，右上角图例通常会出现。图例支持以下操作：

- 点击条目切换 cluster 显示/隐藏；
- 使用颜色选择器修改 cluster 颜色；
- **双击名称** 可直接编辑 cluster 名称。

这部分适合用于快速定制展示样式，便于生成更符合展示需求的截图或导出图片。

---

## 5. Upload Data 页面使用说明

Upload Data 页面用于提交用户自己的数据并触发分析流程。

![UploadData 页面截图](img/upload-page.png)

页面整体分为左右两栏：

- **左侧**：上传文件、查看上传要求、下载示例数据；
- **右侧**：选择分析功能、数据类型并填写邮箱；
- 页面顶部还有步骤条，用于提示当前处于哪一阶段。

---

### 5.1 上传前准备

建议在上传前先准备好以下信息：

1. 你要分析的数据类型；
2. 对应功能（cluster / single gene / multi-gene）；
3. 满足命名规则的文件；
4. 一个可接收结果邮件的邮箱地址。

页面中提供了示例包：

- **0day1_L18 upload example**  
  可直接下载示例 zip，用于参考文件组织方式与命名规则。

---

### 5.2 上传流程

#### Step 1：上传数据文件

将文件拖入上传区域，或点击上传。

#### Step 2：配置分析任务

在右侧依次完成：

- 选择 **Functionality**（功能）；
- 选择 **Data Set**（数据类型）；
- 填写邮箱地址；
- 点击 **Upload** 提交任务。

---

### 5.3 文件组合要求（根据当前前端逻辑整理）

下表按照当前页面规则整理了上传文件数量与命名要求。

| 功能                | 数据类型                 | 需要文件数 | 必需文件名关键词                                             | 允许扩展名                            |
| ------------------- | ------------------------ | ---------: | ------------------------------------------------------------ | ------------------------------------- |
| Cluster analysis    | Single-cell data         |          3 | `barcodes`、`features`、`matrix`                             | `.tsv.gz`、`.mtx.gz`                  |
| Cluster analysis    | Single-cell spatial data |          4 | `barcodes`、`features`、`matrix`、`barcodes_pos`             | `.tsv.gz`、`.mtx.gz`、`.txt`、`.text` |
| Single-gene mapping | Single-cell data         |          4 | `barcodes`、`features`、`matrix`、一个额外基因列表文件       | `.tsv.gz`、`.mtx.gz`、`.txt`、`.text` |
| Single-gene mapping | Single-cell spatial data |          5 | `barcodes`、`features`、`matrix`、`barcodes_pos`、一个额外基因列表文件 | `.tsv.gz`、`.mtx.gz`、`.txt`、`.text` |
| Multi-gene mapping  | Single-cell data         |          4 | `barcodes`、`features`、`matrix`、一个额外基因列表文件       | `.tsv.gz`、`.mtx.gz`、`.txt`、`.text` |
| Multi-gene mapping  | Single-cell spatial data |          5 | `barcodes`、`features`、`matrix`、`barcodes_pos`、一个额外基因列表文件 | `.tsv.gz`、`.mtx.gz`、`.txt`、`.text` |

> 补充说明：  
>
> - 页面会检查**文件数量是否刚好匹配**；  
> - 文件名中需要包含对应关键词；  
> - 对于基因列表文件，当前逻辑要求其扩展名为 `.txt` 或 `.text`；  
> - 若命名或数量不符合要求，前端会直接提示错误。

---

### 5.4 邮件结果说明

UploadData 页面要求填写邮箱地址。结合当前系统逻辑：

- 任务完成后，平台会将结果打包为压缩文件；
- 邮件中会附带结果摘要与结果压缩包；
- 邮件主题当前使用平台名称相关标题；
- 用户可直接下载附件查看结果。

---

## 6. References 页面使用说明

References 页面用于集中浏览平台整理的文献列表。

![References 页面截图](img/references-page.png)

该页面支持：

- 查看参考文献总数；
- 按作者、年份、期刊或关键词进行搜索；
- 在滚动列表中浏览完整条目；
- 从 References 页面返回 About 页面。

适用场景：

- 快速定位某篇文献；
- 查看平台所依赖的研究背景；
- 用于课题汇报或补充阅读。

---

## 7. 常见使用场景建议

### 7.1 仅浏览平台内置数据

适合流程：

1. 打开 About 页面了解背景；
2. 进入 Analyse；
3. 从 `Cluster`、`umap`、`Xenium`、`spatial`、`singleCell` 中选择数据源；
4. 调整显示参数并观察结果；
5. 如有需要可导出当前图像。

### 7.2 做单基因查询

建议流程：

1. 进入 Analyse；
2. 将模式切换为 `gene`；
3. 选择 **Single Gene**；
4. 输入基因名并提交；
5. 通过颜色条、画布与右侧统计区域查看结果。

### 7.3 做多基因集合分析

建议流程：

1. 进入 Analyse；
2. 切换为 `gene` 模式；
3. 选择 **Gene Set**；
4. 每行输入一个基因；
5. 提交后观察多基因投影结果。

### 7.4 上传自定义数据并通过邮件收取结果

建议流程：

1. 先下载示例包确认文件结构；
2. 按要求整理文件名；
3. 进入 UploadData 页面；
4. 上传文件、选择功能和数据集类型；
5. 输入邮箱并提交；
6. 等待系统分析完成后查收邮件。

---

## 8. 常见问题（FAQ）

### 8.1 为什么上传时提示文件数量不正确？

因为上传页会按所选功能和数据类型检查**精确文件数**，必须与页面要求完全一致。

### 8.2 为什么提示文件类型或文件名不符合规则？

通常是以下原因之一：

- 扩展名不在允许范围内；
- 文件名中未包含 `barcodes`、`features`、`matrix`、`barcodes_pos` 等要求关键词；
- 基因列表文件不是 `.txt` 或 `.text`。

### 8.3 为什么 gene 模式下没有结果？

可能原因包括：

- 当前数据源不支持 gene 模式；
- 基因名称输入有误；
- 后端数据或接口未返回对应结果。

### 8.4 为什么建议使用 Chromium 浏览器？

因为平台中包含较多现代前端交互、可视化和画布渲染能力，Chrome / Edge 等 Chromium 内核浏览器兼容性更好。

---

## 9. 文档与截图目录说明

当前手册目录结构如下：

```text
user-manual/
├─ README.md
└─ img/
   ├─ about-page.png
   ├─ platform-page.png
   ├─ upload-page.png
   └─ references-page.png
```

如果后续页面样式、按钮名称或上传规则发生变化，建议同步更新本手册与截图。

---

## 10. 联系与补充说明

- 官方网站：[Tomato callus](https://www.single-cell-spatial.com/#/home)
- 联系邮箱：`bosheng.li@pku-iaas.edu.cn`

如需继续扩展，本手册后续还可以补充：

- 中文版图文操作流程（逐步编号版）；
- 管理员操作手册；
- 上传文件模板说明；
- 邮件结果包内容说明；
- FAQ 的运维排障版。
- 
