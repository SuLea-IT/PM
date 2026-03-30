<template>
  <div class="visitor-stats-page">
    <div class="page-header">
      <div>
        <h1>{{ text.pageTitle }}</h1>
        <p>{{ text.pageSubtitle }}</p>
      </div>
      <div class="page-actions">
        <el-select v-model="selectedDays" class="days-select" size="large">
          <el-option
            v-for="option in dayOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button type="primary" :loading="loading" @click="loadSummary">
          {{ text.refresh }}
        </el-button>
      </div>
    </div>

    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <div class="summary-grid">
          <el-card
            v-for="card in summaryCards"
            :key="card.key"
            shadow="hover"
            class="summary-card"
          >
            <div class="summary-card-label">{{ card.label }}</div>
            <div class="summary-card-value">{{ card.value }}</div>
            <div class="summary-card-extra">{{ card.extra }}</div>
          </el-card>
        </div>

        <div v-if="hasData" class="chart-grid">
          <el-card class="chart-card" shadow="never">
            <template #header>{{ text.dailyTrend }}</template>
            <div ref="dailyChartRef" class="chart"></div>
          </el-card>

          <el-card class="chart-card" shadow="never">
            <template #header>{{ text.topCountries }}</template>
            <div ref="countryChartRef" class="chart"></div>
          </el-card>

          <el-card class="chart-card" shadow="never">
            <template #header>{{ text.topRoutes }}</template>
            <div ref="routeChartRef" class="chart"></div>
          </el-card>

          <el-card class="chart-card" shadow="never">
            <template #header>{{ text.deviceDistribution }}</template>
            <div ref="deviceChartRef" class="chart"></div>
          </el-card>
        </div>

        <el-empty v-else :description="text.noData" />

        <div class="table-grid">
          <el-card shadow="never">
            <template #header>{{ text.topIps }}</template>
            <el-table :data="summary?.topIps || []" stripe>
              <el-table-column prop="ip" :label="text.ip" min-width="140" />
              <el-table-column
                prop="locationLabel"
                :label="text.location"
                min-width="180"
              />
              <el-table-column prop="count" :label="text.visits" width="90" />
              <el-table-column
                prop="deviceType"
                :label="text.device"
                width="100"
              />
              <el-table-column
                prop="browser"
                :label="text.browser"
                width="110"
              />
              <el-table-column
                prop="lastRoute"
                :label="text.route"
                min-width="150"
              />
              <el-table-column min-width="160" :label="text.lastSeen">
                <template #default="{ row }">
                  {{ formatDateTime(row.lastSeen) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <el-card shadow="never">
            <template #header>{{ text.recentVisits }}</template>
            <el-table :data="summary?.recentEvents || []" stripe height="420">
              <el-table-column min-width="160" :label="text.time">
                <template #default="{ row }">
                  {{ formatDateTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="ip" :label="text.ip" min-width="130" />
              <el-table-column
                prop="locationLabel"
                :label="text.location"
                min-width="170"
              />
              <el-table-column prop="route" :label="text.route" min-width="150" />
              <el-table-column
                prop="browser"
                :label="text.browser"
                width="100"
              />
              <el-table-column prop="os" :label="text.os" width="100" />
              <el-table-column
                prop="deviceType"
                :label="text.device"
                width="100"
              />
              <el-table-column :label="text.referrer" min-width="180">
                <template #default="{ row }">
                  {{ row.referrer || "Direct" }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import * as echarts from "echarts";
import { apiConfig } from "../config/apiConfig";

const { locale } = useI18n();

const dictionary = {
  en: {
    pageTitle: "Visitor analytics",
    pageSubtitle:
      "Track website access IPs, locations, routes, devices, and recent traffic activity.",
    refresh: "Refresh",
    days7: "Last 7 days",
    days30: "Last 30 days",
    days90: "Last 90 days",
    totalVisits: "Total visits",
    uniqueIps: "Unique IPs",
    publicIps: "Public IPs",
    uniqueCountries: "Countries / regions",
    uniqueRoutes: "Visited routes",
    dailyTrend: "Daily trend",
    topCountries: "Top locations",
    topRoutes: "Top routes",
    deviceDistribution: "Device distribution",
    topIps: "Top IPs",
    recentVisits: "Recent visits",
    ip: "IP",
    location: "Location",
    visits: "Visits",
    device: "Device",
    browser: "Browser",
    route: "Route",
    lastSeen: "Last seen",
    time: "Time",
    os: "OS",
    referrer: "Referrer",
    noData: "No visitor data has been recorded yet.",
    privateNetwork: "private network visits",
  },
  zh: {
    pageTitle: "访客统计",
    pageSubtitle: "统计网站访问 IP、来源地区、访问路由、设备类型和最近访问记录。",
    refresh: "刷新",
    days7: "最近 7 天",
    days30: "最近 30 天",
    days90: "最近 90 天",
    totalVisits: "总访问量",
    uniqueIps: "独立 IP",
    publicIps: "公网 IP",
    uniqueCountries: "国家/地区数",
    uniqueRoutes: "访问路由数",
    dailyTrend: "每日趋势",
    topCountries: "地区分布",
    topRoutes: "热门路由",
    deviceDistribution: "设备分布",
    topIps: "高频 IP",
    recentVisits: "最近访问",
    ip: "IP",
    location: "位置",
    visits: "访问次数",
    device: "设备",
    browser: "浏览器",
    route: "路由",
    lastSeen: "最后访问",
    time: "时间",
    os: "系统",
    referrer: "来源页",
    noData: "暂时还没有访客数据。",
    privateNetwork: "来自内网/本地访问",
  },
};

const text = computed(() => dictionary[locale.value] || dictionary.zh);
const selectedDays = ref(30);
const loading = ref(false);
const summary = ref(null);

const dayOptions = computed(() => [
  { label: text.value.days7, value: 7 },
  { label: text.value.days30, value: 30 },
  { label: text.value.days90, value: 90 },
]);

const summaryCards = computed(() => {
  const totals = summary.value?.totals || {};
  return [
    {
      key: "visits",
      label: text.value.totalVisits,
      value: totals.visits || 0,
      extra: `${selectedDays.value}d`,
    },
    {
      key: "uniqueIps",
      label: text.value.uniqueIps,
      value: totals.uniqueIps || 0,
      extra: text.value.topIps,
    },
    {
      key: "publicIps",
      label: text.value.publicIps,
      value: totals.publicIps || 0,
      extra: `${totals.privateIps || 0} ${text.value.privateNetwork}`,
    },
    {
      key: "countries",
      label: text.value.uniqueCountries,
      value: totals.uniqueCountries || 0,
      extra: text.value.topCountries,
    },
    {
      key: "routes",
      label: text.value.uniqueRoutes,
      value: totals.uniqueRoutes || 0,
      extra: text.value.topRoutes,
    },
  ];
});

const hasData = computed(() => (summary.value?.totals?.visits || 0) > 0);

const dailyChartRef = ref(null);
const countryChartRef = ref(null);
const routeChartRef = ref(null);
const deviceChartRef = ref(null);

let dailyChart;
let countryChart;
let routeChart;
let deviceChart;

function resizeCharts() {
  [dailyChart, countryChart, routeChart, deviceChart].forEach((chart) => {
    chart?.resize?.();
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale.value === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
  });
}

function getChartThemeColors() {
  return ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272"];
}

function disposeCharts() {
  [dailyChart, countryChart, routeChart, deviceChart].forEach((chart) => {
    chart?.dispose?.();
  });
  dailyChart = null;
  countryChart = null;
  routeChart = null;
  deviceChart = null;
}

function renderCharts() {
  if (!hasData.value) {
    disposeCharts();
    return;
  }

  const colors = getChartThemeColors();
  const data = summary.value;

  if (dailyChartRef.value) {
    dailyChart = echarts.init(dailyChartRef.value);
    dailyChart.setOption({
      color: colors,
      tooltip: { trigger: "axis" },
      legend: { data: [text.value.totalVisits, text.value.uniqueIps] },
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
      xAxis: {
        type: "category",
        data: data.dailyTrend.map((item) => item.date),
      },
      yAxis: { type: "value" },
      series: [
        {
          name: text.value.totalVisits,
          type: "line",
          smooth: true,
          data: data.dailyTrend.map((item) => item.visits),
        },
        {
          name: text.value.uniqueIps,
          type: "line",
          smooth: true,
          data: data.dailyTrend.map((item) => item.uniqueIps),
        },
      ],
    });
  }

  if (countryChartRef.value) {
    countryChart = echarts.init(countryChartRef.value);
    countryChart.setOption({
      color: [colors[1]],
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 80, right: 20, top: 20, bottom: 20 },
      xAxis: { type: "value" },
      yAxis: {
        type: "category",
        data: (data.topCountries || []).map((item) => item.name),
      },
      series: [
        {
          type: "bar",
          data: (data.topCountries || []).map((item) => item.count),
          barMaxWidth: 20,
        },
      ],
    });
  }

  if (routeChartRef.value) {
    routeChart = echarts.init(routeChartRef.value);
    routeChart.setOption({
      color: [colors[0]],
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 80, right: 20, top: 20, bottom: 20 },
      xAxis: { type: "value" },
      yAxis: {
        type: "category",
        data: (data.topRoutes || []).map((item) => item.name),
      },
      series: [
        {
          type: "bar",
          data: (data.topRoutes || []).map((item) => item.count),
          barMaxWidth: 20,
        },
      ],
    });
  }

  if (deviceChartRef.value) {
    deviceChart = echarts.init(deviceChartRef.value);
    deviceChart.setOption({
      color: colors,
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["35%", "65%"],
          data: (data.topDevices || []).map((item) => ({
            name: item.name,
            value: item.count,
          })),
        },
      ],
    });
  }
}

async function loadSummary() {
  loading.value = true;
  try {
    const response = await axios.get(apiConfig.endpoints.getVisitorSummary(), {
      params: { days: selectedDays.value },
    });
    summary.value = response.data.data;
    await nextTick();
    disposeCharts();
    renderCharts();
  } catch (error) {
    console.error("Failed to load visitor summary:", error);
    summary.value = null;
    disposeCharts();
  } finally {
    loading.value = false;
  }
}

watch(selectedDays, loadSummary);
watch(
  () => locale.value,
  async () => {
    await nextTick();
    disposeCharts();
    renderCharts();
  }
);

onMounted(loadSummary);
onMounted(() => {
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  disposeCharts();
});
</script>

<style scoped>
.visitor-stats-page {
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: var(--el-bg-color-page, #f5f7fa);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.days-select {
  width: 150px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  border-radius: 14px;
}

.summary-card-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.summary-card-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
}

.summary-card-extra {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.chart-grid,
.table-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  min-height: 360px;
}

.chart {
  width: 100%;
  height: 300px;
}

@media (max-width: 1100px) {
  .chart-grid,
  .table-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .visitor-stats-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .page-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
