<template>
  <div class="info-panel-container">
    <div class="info-section help-section">
      <h3 class="section-header">Canvas Toolbar Guide</h3>
      <div class="section-content help-list">
        <div
          v-for="tip in toolbarTips"
          :key="tip.title"
          class="help-item"
        >
          <div class="help-item-head">
            <div v-if="tip.icon" class="help-item-icon" v-html="tip.icon"></div>
            <div class="help-item-title">{{ tip.title }}</div>
          </div>
          <div class="help-item-desc">{{ tip.description }}</div>
        </div>
      </div>
    </div>
    <div v-if="mode === 'gene' && geneStats" class="info-section">
      <h3 class="section-header">{{ $t("geneExpression") }}</h3>
      <div class="section-content">
        <div class="stat-item">
          <span>{{ $t('expressingCells') }}:</span>
          <strong>{{ geneStats.expressingCells }} / {{ geneStats.totalCells }}</strong>
        </div>
        <div class="stat-item">
          <span>{{ $t('proportion') }}:</span>
          <strong>{{ geneStats.percentage.toFixed(2) }}%</strong>
        </div>
      </div>
    </div>
    <div v-if="mode === 'cluster'" class="info-section">
      <h3 class="section-header section-header-with-badge">
        <span>{{ $t("selectedCluster") }}</span>
        <span class="count-badge">{{ selectedClusters.length }}</span>
      </h3>
      <div class="section-content cluster-list">
        <div v-if="selectedClusters.length">
          <div
            v-for="cluster in selectedClusters"
            :key="cluster.name"
            class="cluster-item"
          >
            <div class="cluster-color-box" :style="{ backgroundColor: cluster.color }"></div>
            <span class="cluster-name">{{ cluster.name }}</span>
          </div>
        </div>
        <div v-else class="empty-state-card">
          <span class="no-selection-text">{{ $t("none") || "None" }}</span>
        </div>
      </div>
    </div>
    <div class="info-section points-section">
      <h3 class="section-header section-header-with-badge">
        <span>{{ $t("selectedPoints") }}</span>
        <span class="count-badge">{{ selectedPoints.length }}</span>
      </h3>
      <div class="section-content points-list" v-html="formattedSelectedPoints"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InfoPanel",
  props: {
    mode: String,
    selectedClusters: Array,
    selectedPoints: Array,
    geneStats: Object,
  },
  computed: {
    toolbarTips() {
      return [
        {
          title: "Move",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L8 6h3v3H6v4h3v3H8l4 4 4-4h-3v-3h4V9h-3V6h3L12 2z"/></svg>`,
          description: "Drag the canvas to pan, and use the mouse wheel to zoom in or out.",
        },
        {
          title: "Select",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4H8C5.79 4 4 5.79 4 8v8c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-2 10h-4v-4h4v4z"/></svg>`,
          description: "Switch to selection mode, then drag on the canvas to box-select cells.",
        },
        {
          title: "Reset",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
          description: "Restore the default zoom level, position, and viewing state.",
        },
        {
          title: "Rotate",
          description: "Use the slider in the toolbar to rotate the canvas for easier inspection.",
        },
        {
          title: "Selection Result",
          description: "Selected cells will appear in the panel below for quick review.",
        },
      ];
    },
    formattedSelectedPoints() {
      if (!this.selectedPoints || this.selectedPoints.length === 0) {
        return `<div class="empty-state-card"><div class="no-selection-text">${this.$t("none") || "None"}</div></div>`;
      }
      return this.selectedPoints.map(p => `<div class="point-item">${p.cellName}</div>`).join("");
    },
  },
};
</script>

<style scoped>
.info-panel-container {
  width: 300px;
  background-color: var(--el-info-panel-bg-color, #ffffff);
  border-left: 1px solid var(--el-info-panel-border-color, #e4e7ed);
  padding: 15px;
  height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  color: var(--el-text-color-primary, #303133);
  box-sizing: border-box;
  gap: 15px;
}

.info-section {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-info-panel-border-color, #e0e0e0);
  border-radius: 4px;
  background-color: var(--el-info-panel-section-bg-color, #f9f9f9);
}

.section-header {
  font-size: 16px;
  font-weight: 600;
  padding: 10px;
  margin: 0;
  border-bottom: 1px solid var(--el-info-panel-border-color, #e0e0e0);
  background-color: var(--el-info-panel-header-bg-color, #f5f5f5);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.section-header-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8bd85c, #57b643);
  color: #0d2009;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.section-content {
  padding: 10px;
}

.help-section,
.points-section {
  flex: 1;
  min-height: 0;
}

.help-section .section-content,
.points-section .section-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.cluster-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cluster-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--el-info-panel-border-color, #e0e0e0);
background: linear-gradient(180deg, #515151, #656565);
  box-shadow: 0 6px 14px rgba(31, 45, 61, 0.05);
}

.cluster-color-box {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex: 0 0 18px;
}

.cluster-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.help-list,
.points-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.help-list {
  gap: 10px;
}

.help-item {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--el-info-panel-border-color, #e0e0e0);
  background: var(--el-info-panel-header-bg-color, #f5f5f5);
}

.help-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-item-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid var(--el-info-panel-border-color, #dcdfe6);
  color: #2f6d2d;
  flex: 0 0 28px;
}

.help-item-icon :deep(svg) {
  width: 16px;
  height: 16px;
  display: block;
}

.help-item-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary, #303133);
}

.help-item-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular, #606266);
}

.points-list {
  padding-right: 5px;
}

.point-item {
  margin-bottom: 8px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 12px;
  border: 1px solid var(--el-info-panel-border-color, #e0e0e0);
  background: linear-gradient(180deg, #ffffff, #f7f9fc);
  color: var(--el-text-color-primary, #303133);
  box-shadow: 0 6px 14px rgba(31, 45, 61, 0.05);
  word-break: break-word;
}

.point-item:last-child {
  margin-bottom: 0;
}

.empty-state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 76px;
  padding: 14px;
  border-radius: 12px;
  border: 1px dashed var(--el-info-panel-border-color, #dcdfe6);
  background: linear-gradient(180deg, #fcfcfd, #f6f8fb);
}

.no-selection-text {
  color: #909399;
  font-style: italic;
  font-size: 13px;
}

:global(html.dark) .cluster-item,
:global(html.dark) .point-item {
  background: rgba(12, 12, 12, 0.58);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

:global(html.dark) .cluster-name,
:global(html.dark) .point-item {
  color: #f5f5f5;
}

:global(html.dark) .empty-state-card {
  background: rgba(12, 12, 12, 0.42);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
