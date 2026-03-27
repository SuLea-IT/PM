<template>
  <div class="control-panel">
    <div class="panel-header">{{ $t("selectTitle") }}</div>
    
    <div class="panel-section">
      <div class="section-title">{{ $t("dataConfiguration") }}</div>
      <div class="control-item">
        <label>{{ $t("selectDataSource") }}</label>
        <el-select v-model="selectedDataSource" :placeholder="$t('selectDataSource')" @change="onDataSourceChange">
          <el-option
            v-for="item in dataSourceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div v-if="selectedDataSource !== 'cluster'" class="control-item">
        <label>{{ $t("selectDataType") }}</label>
        <el-select v-model="selectedDataType" :placeholder="$t('selectDataType')" @change="onDataTypeChange">
          <el-option v-for="type in dataTypes" :key="type" :label="type" :value="type"></el-option>
        </el-select>
      </div>
      <div v-if="selectedDataSource !== 'cluster'" class="control-item">
        <label>{{ $t("selectMode") }}</label>
        <el-select v-model="selectedMode" :placeholder="$t('selectMode')" @change="onModeChange">
          <el-option :label="$t('cluster')" value="cluster"></el-option>
          <el-option v-if="selectedDataSource !== 'singleCell'" :label="$t('gene')" value="gene"></el-option>
        </el-select>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title">{{ $t("visualizationParams") }}</div>
      <div class="control-item">
        <label>{{ $t("pointSize") }}</label>
        <el-slider v-model="pointSize" :min="0.1" :max="2" :step="0.1" @input="onPointSizeChange"></el-slider>
      </div>
      <div v-if="selectedMode === 'cluster' && selectedDataSource === 'umap'" class="control-item">
        <label>{{ $t("selectClusters") }}</label>
        <el-select
          v-model="selectedClusters"
          multiple
          collapse-tags
          :max-collapse-tags="5"
          :placeholder="$t('selectClusters')"
          @change="onClusterChange"
        >
          <el-option v-for="item in clusterOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <div v-if="selectedMode === 'cluster' && selectedDataSource === 'umap'" class="control-item">
        <el-checkbox v-model="showClusterLabels" @change="onShowClusterLabelsChange">{{ $t("showClusterLabels") }}</el-checkbox>
      </div>
      <div v-if="selectedMode === 'cluster'" class="control-item switch-control">
        <label>{{ $t("lowRender") }}</label>
        <el-switch v-model="lowRenderEnabled" @change="onLowRenderChange"></el-switch>
      </div>
      <div v-if="selectedMode === 'cluster'" class="control-item switch-control">
        <label>{{ $t("stepReveal") }}</label>
        <el-switch v-model="stepRevealEnabled" @change="onStepRevealEnabledChange"></el-switch>
      </div>
      <div v-if="selectedMode === 'cluster'" class="control-item">
        <el-button type="primary" @click="toggleProportionChart" class="full-width-button">
          {{ showProportion ? $t("hideProportion") : $t("showProportion") }}
        </el-button>
      </div>
    </div>

    <div v-if="selectedMode === 'gene'" class="panel-section">
      <div class="section-title">{{ $t("geneAnalysis") }}</div>
      <el-radio-group v-model="geneMode" size="small" class="full-width-radio">
        <el-radio-button label="single">{{ $t("singleGene") }}</el-radio-button>
        <el-radio-button label="set">{{ $t("geneSet") }}</el-radio-button>
      </el-radio-group>
      
      <div v-if="geneMode === 'single'" class="gene-input-section">
        <label>{{ $t("inputGeneName") }}</label>
        <el-select
          ref="geneNameSelect"
          v-model="inputGeneName"
          filterable
          remote
          :remote-method="searchGenes"
          :loading="geneSearchLoading"
          :placeholder="$t('enterGeneName')"
          class="full-width-select"
        >
          <el-option
            v-for="item in sampleGenes"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
        <div v-if="geneTags.length > 0" class="gene-tags-wrap">
          <span class="gene-tags-title">Dataset genes:</span>
          <el-tag
            v-for="gene in geneTags"
            :key="gene"
            class="gene-tag-item"
            size="small"
            @click="onGeneTagClick(gene)"
          >
            {{ gene }}
          </el-tag>
        </div>
        <el-button type="primary" @click="onGeneInputChange" class="full-width-button">{{ $t("submit") }}</el-button>
      </div>
      
      <div v-if="geneMode === 'set'" class="gene-input-section">
        <label>{{ $t("inputGeneSet") }}</label>
        <el-input type="textarea" :rows="4" :placeholder="$t('enterGeneSet')" v-model="geneSet"></el-input>
        <el-button type="primary" @click="onGeneInputChange" class="full-width-button">{{ $t("submit") }}</el-button>
      </div>

      <div class="control-item" style="margin-top: 15px;">
        <el-checkbox v-model="showClusterBg" @change="onShowClusterBgChange">{{ $t("showClusterBackground") }}</el-checkbox>
      </div>
      <div v-if="showClusterBg && selectedDataSource === 'umap'" class="control-item" style="padding-left: 20px;">
        <el-checkbox v-model="showClusterLabels" @change="onShowClusterLabelsChange">{{ $t("showClusterLabels") }}</el-checkbox>
      </div>
      <div class="control-item">
        <label>{{ $t("geneOpacity") }}</label>
        <el-slider v-model="geneOpacity" :min="0" :max="1" :step="0.1" @input="onGeneOpacityChange"></el-slider>
      </div>
      <div class="control-item">
        <label>{{ $t("geneColorScale") }}</label>
        <div class="color-picker-group">
          <div class="color-picker-item">
            <span>Min</span>
            <el-color-picker v-model="minColor" @change="onMinColorChange"></el-color-picker>
          </div>
          <div class="color-picker-item">
            <span>Mid</span>
            <el-color-picker v-model="midColor" @change="onMidColorChange"></el-color-picker>
          </div>
          <div class="color-picker-item">
            <span>Max</span>
            <el-color-picker v-model="maxColor" @change="onMaxColorChange"></el-color-picker>
          </div>
        </div>
      </div>
      <div v-if="showClusterBg" class="control-item">
        <label>{{ $t("clusterOpacity") }}</label>
        <el-slider v-model="clusterBgOpacity" :min="0" :max="1" :step="0.1" @input="onClusterBgOpacityChange"></el-slider>
      </div>
    </div>

    <div class="panel-footer">
      <el-button type="primary" @click="onDownloadRequest" class="full-width-button">{{ $t("download") }}</el-button>
    </div>
  </div>
</template>

<script>
import { apiConfig } from '../config/apiConfig';
import axios from 'axios';

export default {
  name: "ControlPanel",
  props: {
    dataTypes: Array,
    clusterOptions: Array,
    showProportion: Boolean,
  },
  data() {
    return {
      selectedDataSource: "cluster",
      selectedDataType: "",
      selectedMode: "cluster",
      pointSize: 1,
      lowRenderEnabled: true,
      stepRevealEnabled: true,
      inputGeneName: "",
      selectedClusters: [],
      geneMode: 'single',
      geneSet: '',
      showClusterBg: false,
      geneOpacity: 1,
      clusterBgOpacity: 1,
      showClusterLabels: false,
      minColor: '#0000ff',
      midColor: '#ffff00',
      maxColor: '#ff0000',
      sampleGenes: [],
      geneSearchLoading: false,
      geneTags: [],
      dataSourceOptions: [
        { label: "Cluster", value: "cluster" },
        { label: "umap", value: "umap" },
        { label: "Xenium", value: "xenium" },
        { label: "spatial", value: "spatial" },
        { label: "singleCell", value: "singleCell" }
      ]
    };
  },
  methods: {
    applyDefaultGeneFromTags(tags) {
      if (
        this.selectedDataSource === 'xenium' &&
        this.selectedMode === 'gene' &&
        this.geneMode === 'single' &&
        Array.isArray(tags) &&
        tags.length > 0 &&
        !this.inputGeneName
      ) {
        this.inputGeneName = tags[0];
        this.$emit("gene-input", this.inputGeneName);
      }
    },
    async loadGeneTags(searchTerm = '', limit = 3) {
      if (!this.selectedDataType) {
        this.geneTags = [];
        return;
      }
      try {
        const url = apiConfig.endpoints.getSampleGenes(
          this.selectedDataType,
          searchTerm,
          this.selectedDataSource
        );
        const response = await axios.get(url);
        if (response.data.success && Array.isArray(response.data.data)) {
          this.geneTags = response.data.data.slice(0, limit);
          this.applyDefaultGeneFromTags(this.geneTags);
        } else {
          this.geneTags = [];
        }
      } catch (error) {
        this.geneTags = [];
      }
    },
    async searchGenes(query) {
      if (query !== '') {
        this.geneSearchLoading = true;
        try {
          const url = apiConfig.endpoints.getSampleGenes(
            this.selectedDataType,
            query,
            this.selectedDataSource
          );
          const response = await axios.get(url);
          if (response.data.success) {
            this.sampleGenes = response.data.data;
            this.geneTags = this.sampleGenes.slice(0, 3);
            this.applyDefaultGeneFromTags(this.geneTags);
          }
        } catch (error) {
          console.error("Failed to search genes:", error);
          this.sampleGenes = [];
          this.geneTags = [];
        } finally {
          this.geneSearchLoading = false;
        }
      } else {
        this.sampleGenes = [];
        this.loadGeneTags();
      }
    },
    onDataSourceChange(value) {
      this.geneTags = [];
      if (value !== 'umap' && this.showClusterLabels) {
        this.showClusterLabels = false;
        this.onShowClusterLabelsChange(false);
      }
      if (value === 'singleCell' && this.selectedMode === 'gene') {
        this.selectedMode = 'cluster';
        this.onModeChange('cluster');
      }
      this.$emit("update:dataSource", value);
    },
    onDataTypeChange(value) {
        this.$emit("update:dataType", value);
        this.sampleGenes = []; // Clear gene list on data type change
        this.inputGeneName = ''; // Clear selected gene
        this.loadGeneTags();
    },
    onModeChange(value) {
      this.$emit("update:mode", value);
    },
    onPointSizeChange(value) {
        this.$emit("update:pointSize", value);
    },
    onGeneInputChange() {
      if (this.geneMode === 'single') {
        this.geneSet = ''; // Clear gene set
        this.$emit("gene-set-input", []);
        this.$emit("gene-input", this.inputGeneName);
      } else {
        this.inputGeneName = ''; // Clear single gene
        this.$emit("gene-input", "");
        const genes = this.geneSet.split('\n').filter(g => g.trim() !== '');
        this.$emit("gene-set-input", genes);
      }
    },
    onGeneTagClick(gene) {
      this.inputGeneName = gene;
    },
    onDownloadRequest() {
      this.$emit("download-request");
    },
    onClusterChange(value) {
      this.$emit("update:visible-clusters", value);
    },
    onLowRenderChange(value) {
      // true => 启用低渲染（屏幕栅格抽样）；false => 关闭抽样
      this.$emit("update:lod-enabled", value);
    },
    onStepRevealEnabledChange(value) {
      this.$emit("update:step-reveal-enabled", value);
    },
    onShowClusterBgChange(value) {
      this.$emit("update:show-cluster-bg", value);
    },
    onGeneOpacityChange(value) {
      this.$emit("update:gene-opacity", value);
    },
    onClusterBgOpacityChange(value) {
      this.$emit("update:cluster-bg-opacity", value);
    },
    onShowClusterLabelsChange(value) {
      this.$emit("update:show-cluster-labels", value);
    },
    onMinColorChange(value) {
      this.$emit("update:min-color", value);
    },
    onMidColorChange(value) {
      this.$emit("update:mid-color", value);
    },
    onMaxColorChange(value) {
      this.$emit("update:max-color", value);
    },
    toggleProportionChart() {
      this.$emit("update:show-proportion", !this.showProportion);
    },
  },
   mounted() {
    if (this.dataTypes.length > 0) {
      this.selectedDataType = this.dataTypes[0];
      this.onDataTypeChange(this.selectedDataType);
    }
  },
  watch: {
      dataTypes(newVal) {
          if (!newVal || newVal.length === 0) {
              this.selectedDataType = '';
              this.onDataTypeChange(this.selectedDataType);
              return;
          }
          if (!newVal.includes(this.selectedDataType)) {
              this.selectedDataType = newVal[0];
              this.onDataTypeChange(this.selectedDataType);
          }
      },
      clusterOptions(newVal) {
        if (newVal) {
          this.selectedClusters = newVal.map(item => item.value);
          this.onClusterChange(this.selectedClusters);
        }
      },
      selectedDataSource(newVal) {
        if (newVal !== 'umap' && this.showClusterLabels) {
          this.showClusterLabels = false;
          this.onShowClusterLabelsChange(false);
        }
      },
      selectedMode(newVal) {
        if (newVal === 'gene' && this.geneMode === 'single') {
          this.loadGeneTags();
        }
      },
      geneMode(newVal) {
        if (newVal === 'single' && this.selectedMode === 'gene') {
          this.loadGeneTags();
        }
      }
  }
};
</script>

<style scoped>
.control-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  background-color: var(--el-control-panel-bg-color, #f7f8fa);
  border-right: 1px solid var(--el-control-panel-border-color, #e4e7ed);
  box-sizing: border-box;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  overflow-y: auto; /* 内置滚动条 */
}

.panel-header {
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-control-panel-header-color, #303133);
  border-bottom: 1px solid var(--el-control-panel-border-color, #e4e7ed);
  text-align: center;
}

.panel-section {
  padding: 20px;
  border-bottom: 1px solid var(--el-control-panel-border-color, #e4e7ed);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--el-control-panel-section-color, #606266);
  text-align: center;
}

.control-item {
  margin-bottom: 15px;
}

.control-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--el-control-panel-section-color, #606266);
  text-align: center;
}

.switch-control {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.switch-control :deep(.el-switch) {
  margin: 0 auto;
}

.control-item .el-select,
.control-item .el-slider {
  width: 100%;
}

.control-item :deep(.el-checkbox) {
  width: 100%;
  justify-content: center;
}

.control-item :deep(.el-button) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gene-input-section {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-width-radio {
  width: 100%;
  display: flex;
}
.full-width-radio > .el-radio-button {
  flex: 1;
}
.full-width-radio >>> .el-radio-button__inner {
  width: 100%;
}

.full-width-button {
  width: 100%;
}

.full-width-select {
  width: 100%;
}
.gene-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.gene-tags-title {
  font-size: 12px;
  color: var(--el-control-panel-section-color, #606266);
}
.gene-tag-item {
  cursor: pointer;
}

.panel-footer {
  padding: 20px;
  margin-top: auto;
  border-top: 1px solid var(--el-control-panel-border-color, #e4e7ed);
  position: sticky; /* 滚动时仍固定在面板底部可见 */
  bottom: 0;
  background-color: var(--el-control-panel-bg-color, #f7f8fa);
  z-index: 1;
}

.color-picker-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.color-picker-item span {
  font-size: 12px;
  color: var(--el-control-panel-section-color, #606266);
}
</style>
