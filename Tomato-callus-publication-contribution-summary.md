# Tomato callus 项目工作总结

数据截至：2026-05-09  
项目网站：[https://www.single-cell-spatial.com/#/home](https://www.single-cell-spatial.com/#/home)  
公开文章：[Super-resolution single-cell spatial atlas of plant de novo regeneration](https://www.biorxiv.org/content/10.64898/2026.02.20.705279v1.full)  
DOI：[10.64898/2026.02.20.705279](https://doi.org/10.64898/2026.02.20.705279)  
审稿状态：另有一篇 MP（Molecular Plant）稿件正在审稿中  

> 说明：示例文档是按 GitHub PR 参与记录整理的开源贡献总结。本项目属于已公开发表/发布的科研文章与配套数据平台建设，因此本文档按“论文产出 + 数据资源 + 平台建设 + 可视化与分析功能”的口径整理。

## 项目简介

Tomato callus 是面向番茄离体再生研究的单细胞空间图谱与数据平台，围绕植物 de novo regeneration 过程中从创伤响应到茎尖/芽再生的时空组织结构展开。项目通过超分辨率多模态空间转录组技术追踪番茄再生过程，解析约 1.16 million cells 的空间细胞状态，并将数据、图谱、实验流程和交互式浏览能力整合到公开网站中。

该项目已以预印本形式发布在 bioRxiv，题名为 **Super-resolution single-cell spatial atlas of plant de novo regeneration**。文章展示了番茄再生过程中一个此前未被充分认识的 ovoid-structured stem-cell niche，包含 signaling layer、plastic compartment 和 quiescent core，并强调 EPFL8b-mediated signaling 在组织模式化与再生能力中的作用。除 bioRxiv 公开文章外，项目另有一篇 MP 稿件处于审稿阶段。

项目网站提供了面向研究者的资源入口，包括首页研究概览、内置图谱浏览、基因投影、聚类可视化、上传分析工作流、参考文献资源和数据协议入口，用于支撑论文结果复现、数据探索和后续功能验证。

## 产出概览

| 指标 | 内容 |
| --- | --- |
| 公开文章 | Super-resolution single-cell spatial atlas of plant de novo regeneration |
| 发表/发布平台 | bioRxiv |
| 发布时间 | 2026-02-20 |
| DOI | 10.64898/2026.02.20.705279 |
| 审稿中稿件 | MP（Molecular Plant）稿件正在审稿 |
| 项目网站 | https://www.single-cell-spatial.com/#/home |
| 数据规模 | 约 1.16 million profiled cells |
| 空间图谱 | 101 spatial maps |
| Xenium 靶向基因 | 50 genes |
| 再生时间窗口 | 0-16 DPE |
| 核心主题 | plant de novo regeneration, tomato callus, single-cell spatial atlas, stem-cell niche |
| 平台功能 | Atlas 浏览、cluster 可视化、gene projection、数据上传分析、参考文献与协议入口 |
| 前端技术 | Vue 3, Vite, Element Plus, deck.gl, ECharts, vue-i18n |
| 后端与分析 | Node.js/Express API, Python analysis scripts, file upload, email result delivery |

整体产出不以 GitHub PR 数量衡量，而以论文发表、数据资源建设、交互式平台上线、图谱浏览能力和后续投稿支撑为主要衡量维度。

## 主要工作内容

### 1. 论文与数据资源建设

项目围绕番茄 callus de novo regeneration 构建高分辨率时空图谱，形成可供论文、审稿和后续研究复用的数据资源。

- 整合多时间点番茄再生样本，覆盖从创伤响应、stem-cell establishment、SCN formation 到 shoot regeneration 的完整再生窗口。
- 通过多模态空间转录组和单细胞/单核转录组数据，支撑对 callus 内部异质性、空间结构和细胞状态转变的系统解析。
- 在文章中提出 ovoid-structured stem-cell niche 的组织模型，并归纳 signaling layer、plastic compartment 和 quiescent core 三类关键空间层次。
- 结合基因表达空间分布，展示 CUC2、PLT3a、STM、WUS、CLV3、EPFL8b 等关键因子在再生 niche 中的定位和潜在功能。
- 形成 bioRxiv 公开文章，并继续支撑 MP 稿件审稿过程中的资源展示和补充说明。

相关产出：

- [bioRxiv full text](https://www.biorxiv.org/content/10.64898/2026.02.20.705279v1.full)
- [DOI: 10.64898/2026.02.20.705279](https://doi.org/10.64898/2026.02.20.705279)
- Tomato callus 数据与协议资源网站

### 2. 项目首页与科研叙事展示

首页用于向审稿人、读者和潜在用户快速说明项目背景、核心发现、数据规模和平台入口，是论文资源与数据平台之间的桥梁。

- 将项目名称聚焦为 Tomato callus，避免泛化为普通的 “Single Cell Spatial Platform”。
- 首页展示项目核心摘要，包括 plant de novo regeneration、super-resolution spatial transcriptomics、1.16M cells、101 spatial maps 和 50 Xenium genes。
- 通过分区叙事展示再生过程的关键阶段，包括 wound response、stem-cell establishment、SCN formation 和 shoot regeneration。
- 以机制模型区块突出 EPFL8b-mediated signaling 与 ovoid-structured SCN 的组织逻辑。
- 在首页加入 bioRxiv 文章引用区，包含文章标题、短引用、DOI 和阅读全文链接。
- 保留 References 入口，用于集中呈现与植物再生、空间转录组和信号调控相关的文献资源。

### 3. 内置图谱浏览与交互式分析平台

Analyse/Platform 页面是项目核心数据浏览入口，用于支持论文数据的在线探索和图谱级验证。

- 支持多数据源切换，包括 Xenium、spatial、singleCell、umap 和 cluster 数据。
- 支持样本/时间点选择，使用户能够在不同数据集之间快速切换。
- 提供 cluster 模式，用于浏览细胞群、空间结构和细胞类型分布。
- 提供 gene 模式，用于单基因投影和空间表达模式观察。
- 支持 point size、gene opacity、cluster background、color scale、cluster labels 等可视化参数调整。
- 支持画布移动、缩放、框选、旋转、重置和图像导出，便于论文图谱复核和展示材料准备。
- 示例基因改为由后端读取当前数据集后动态返回，避免在前端写死基因列表，使示例内容跟随数据集变化。

### 4. 后端数据接口与资源组织

后端用于连接静态图谱资源、基因表达数据、上传分析流程和访问统计等模块，为前端浏览与自定义分析提供稳定接口。

- 提供数据类型接口，用于按数据源读取可用样本。
- 提供基因列表接口，基于当前数据集读取 gene.csv 或 h5ad 中的真实基因名称。
- 提供示例基因接口，由后端根据当前数据集返回用于展示的 example genes。
- 提供 gene projection 数据接口，支持前端按数据源、样本和基因名加载表达坐标。
- 维护 upload workflow，支持用户上传文件并触发后端分析脚本。
- 集成邮件结果发送能力，用于在分析完成后向用户交付结果包。
- 支持 visitor analytics，用于观察平台访问情况和资源使用情况。

### 5. 数据上传与自定义分析工作流

Upload Data 页面用于支持外部用户提交自有数据，扩展平台从“论文图谱浏览”到“用户数据分析”的使用场景。

- 提供上传页面和文件组织说明，帮助用户理解数据格式要求。
- 支持 single-cell、single-cell spatial、spatial 和 Xenium 等数据类型入口。
- 支持邮箱填写与校验，分析结果可通过邮件交付。
- 后端通过文件上传、任务执行和邮件模板串联完整分析流程。
- 上传文件会按项目规则组织和清理，降低长期存储和隐私风险。

### 6. 文献、协议与审稿支撑

项目不仅是可视化网站，也承担论文补充材料、协议公开、审稿沟通和资源复用的支撑作用。

- 首页和 References 页面承载与 manuscript 相关的文献背景。
- 平台作为 bioRxiv 文章中 “Datasets and protocols are available” 的公开入口。
- 文章引用、DOI、网站链接和数据入口保持一致，方便审稿人和读者从论文跳转到资源平台。
- MP 稿件审稿期间，平台可继续作为补充资源、数据验证入口和图谱展示环境使用。
- 后续若 MP 稿件接收，可补充正式期刊引用、DOI、卷期页码和新的资源说明。

## 工作明细

| 模块 | 工作内容 | 主要产出 |
| --- | --- | --- |
| 论文资源 | 整理并公开番茄 callus de novo regeneration 单细胞空间图谱 | bioRxiv 文章与公开网站 |
| 数据规模 | 整合约 1.16M cells、101 spatial maps 和 50 Xenium genes | 可在线浏览的数据资源 |
| 首页展示 | 构建项目介绍、机制模型、阶段叙事和文章引用入口 | `/home` 项目门户 |
| 图谱浏览 | 支持 cluster 与 gene projection 的交互式可视化 | `/analyse/Platform` |
| 示例基因 | 改为后端按当前数据集读取并返回 | 动态 example genes |
| 数据接口 | 提供样本、基因列表、基因投影和上传相关 API | Node.js/Express 后端服务 |
| 上传分析 | 支持用户上传数据并触发 Python 分析流程 | `/analyse/UploadData` |
| 结果交付 | 通过邮件发送分析结果包 | nodemailer 邮件工作流 |
| 文献资源 | 维护 References 页面和 manuscript 相关文献入口 | 文献检索与展示 |
| 审稿支撑 | 支持 bioRxiv 公开文章和 MP 审稿稿件的资源访问 | 可复核、可展示的平台入口 |

## 文章与稿件状态

| 类型 | 状态 | 说明 |
| --- | --- | --- |
| bioRxiv 文章 | 已公开发布 | Super-resolution single-cell spatial atlas of plant de novo regeneration |
| DOI | 已有 | 10.64898/2026.02.20.705279 |
| MP 稿件 | 审稿中 | 稿件仍处于 review 阶段，正式题录信息待接收后补充 |
| 数据平台 | 已上线 | https://www.single-cell-spatial.com/#/home |

## 可用于简历或项目经历的简版描述

参与 Tomato callus 单细胞空间转录组图谱与数据平台建设，支撑已发布于 bioRxiv 的 **Super-resolution single-cell spatial atlas of plant de novo regeneration** 及后续 MP 审稿稿件。项目整合约 1.16 million cells、101 spatial maps 和 50 个 Xenium 靶向基因，围绕番茄 de novo regeneration 构建从创伤响应到 shoot organogenesis 的高分辨率时空图谱。主要工作覆盖科研资源门户、交互式 atlas 浏览、cluster 可视化、gene projection、动态示例基因、数据上传分析、后端数据接口、结果邮件交付和参考文献资源维护。技术栈涉及 Vue 3、Vite、Element Plus、deck.gl、ECharts、Node.js/Express、Python 分析脚本和服务器部署维护。

## 工作特点总结

- 面向已发表/公开论文和审稿中稿件，而不是单纯的 GitHub 开源 PR 贡献。
- 以科研数据资源、文章支撑、审稿复核和在线可视化为核心产出。
- 覆盖前端展示、后端接口、数据组织、基因投影、上传分析和邮件结果交付等完整平台链路。
- 将论文中的关键发现转化为可浏览、可检索、可复核的在线资源。
- 支持审稿人和读者从文章直接进入数据平台，提高论文资源的透明度和可复用性。
- 后续可在 MP 稿件接收后补充正式期刊题录、DOI、引用格式和对应平台入口。

