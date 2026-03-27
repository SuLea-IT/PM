<template>
  <div class="upload-page">
    <div class="platform-step">
      <div class="platform-step-header">
        <div class="platform-step-steps">
          <el-steps
            class="custom-steps"
            :active="currentStep"
            align-center
            finish-status="success"
          >
            <el-step
              v-for="(step, index) in steps"
              :key="index"
              :title="$t(`steps.${step.title}`)"
            />
          </el-steps>
        </div>
      </div>
    </div>

    <div class="platform-container">
      <div class="platform-left">
        <div class="platform-step-span">
          <span class="platform-step-span-title">{{ $t("uploadStepOneTitle") }}</span>
          <span class="platform-step-span-text">
            {{ $t("uploadStepOneDescription") }}
          </span>
        </div>

        <div class="platform-left-select">
          <div class="example-download-card">
            <div class="example-download-copy">
              <span class="example-download-kicker">{{ exampleKicker }}</span>
              <h3>{{ exampleTitle }}</h3>
              <p>{{ exampleDescription }}</p>
            </div>
            <a
              class="example-download-btn"
              :href="exampleDownloadUrl"
              download="0day1_L18.zip"
            >
              {{ exampleButtonText }}
            </a>
          </div>

          <DataUpload
            ref="dataUploadRef"
            v-model="selectedFiles"
            :restrictions="activeRestrictions"
            :show-file-list="true"
          />

          <div class="upload-helper-card">
            <div class="upload-helper-row">
              <span class="upload-helper-label">{{ helperSelectedLabel }}</span>
              <span class="upload-helper-value">{{ selectedFiles.length }} / {{ requiredFileCount }}</span>
            </div>
            <div class="upload-helper-row upload-helper-column">
              <span class="upload-helper-label">{{ helperRequiredLabel }}</span>
              <div class="upload-required-tags">
                <span
                  v-for="item in requiredFileLabels"
                  :key="item"
                  class="upload-required-tag"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="platform-left-tip">
          <span>{{ $t("dataUsagePrivacyTitle") }}</span>
          <span>{{ $t("dataUsagePrivacyContent") }}</span>
        </div>
      </div>

      <div class="platform-right">
        <div class="platform-step-span">
          <span class="platform-step-span-title">{{ $t("uploadStepTwoTitle") }}</span>
          <span class="platform-step-span-text">
            {{ $t("uploadStepTwoDescription") }}
          </span>
        </div>

        <div class="platform-left-select">
          <div class="platform-right-image">
            <img src="/UMAP.png" alt="" />
          </div>

          <DataSelect
            v-model="selectedFun"
            :options="funOptions"
            :tag-text="$t('functionality')"
            :placeholder-text="$t('select')"
          />

          <DataSelect
            v-model="selectedDataset"
            :options="datasetOptions"
            :tag-text="$t('dataSet')"
            :placeholder-text="$t('select')"
          />

          <DataInput
            v-model="email"
            :tag-text="$t('enterEmailAddress')"
            :placeholder-text="$t('select')"
            :validateFn="validateEmail"
          />

          <el-button :loading="isUploading" @click="handleUpload">
            {{ $t("upload") }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import DataInput from "../components/element/DataInput.vue";
import DataSelect from "../components/element/DataSelect.vue";
import DataUpload from "../components/element/DataUpload.vue";
import { validateEmail } from "../rule/emailValidator.js";
import { uploadFiles } from "../utils/uploadUtil.js";

const { t, locale } = useI18n();

const steps = [
  { title: "selectData", description: "" },
  { title: "uploadData", description: "" },
  { title: "configureEmail", description: "" },
];

const datasetOptions = computed(() => [
  { value: "1", label: t("singleCellData") },
  { value: "2", label: t("singleCellSpatialData") },
]);

const funOptions = computed(() => [
  { value: "1", label: t("cluster") },
  { value: "2", label: t("singleGeneMapping") },
  { value: "3", label: t("multiGeneMapping") },
]);

const restrictionMaps = {
  1: {
    1: {
      allowedExtensions: [".tsv.gz", ".mtx.gz"],
      requiredFileNames: ["barcodes", "features", "matrix"],
      uploadFileCount: 3,
    },
    2: {
      allowedExtensions: [".tsv.gz", ".mtx.gz", ".txt", ".text"],
      requiredFileNames: ["barcodes", "features", "matrix", "barcodes_pos"],
      uploadFileCount: 4,
    },
  },
  2: {
    1: {
      allowedExtensions: [".tsv.gz", ".mtx.gz", ".txt", ".text"],
      requiredFileNames: ["barcodes", "features", "matrix", "*"],
      uploadFileCount: 4,
    },
    2: {
      allowedExtensions: [".tsv.gz", ".mtx.gz", ".txt", ".text"],
      requiredFileNames: ["barcodes", "features", "matrix", "barcodes_pos", "*"],
      uploadFileCount: 5,
    },
  },
  3: {
    1: {
      allowedExtensions: [".tsv.gz", ".mtx.gz", ".txt", ".text"],
      requiredFileNames: ["barcodes", "features", "matrix", "*"],
      uploadFileCount: 4,
    },
    2: {
      allowedExtensions: [".tsv.gz", ".mtx.gz", ".txt", ".text"],
      requiredFileNames: ["barcodes", "features", "matrix", "barcodes_pos", "*"],
      uploadFileCount: 5,
    },
  },
};

const dataUploadRef = ref(null);
const selectedDataset = ref("1");
const selectedFun = ref("1");
const selectedFiles = ref([]);
const email = ref("");
const isUploading = ref(false);
const exampleDownloadUrl = "/examples/0day1_L18.zip";

const activeRestrictions = computed(
  () => restrictionMaps[Number(selectedFun.value)][Number(selectedDataset.value)]
);

const requiredFileCount = computed(() => activeRestrictions.value.uploadFileCount);

const currentStep = computed(() => {
  if (selectedFiles.value.length === 0) {
    return 0;
  }
  if (!validateEmail(email.value)) {
    return 1;
  }
  return 2;
});

const helperSelectedLabel = computed(() =>
  locale.value === "zh" ? "已选择文件" : "Selected files"
);

const helperRequiredLabel = computed(() =>
  locale.value === "zh" ? "需要的文件" : "Required files"
);
const exampleKicker = computed(() =>
  locale.value === "zh" ? "示例数据" : "Example dataset"
);
const exampleTitle = computed(() =>
  locale.value === "zh" ? "0day1_L18 上传示例" : "0day1_L18 upload example"
);
const exampleDescription = computed(() =>
  locale.value === "zh"
    ? "提供一个可直接下载的 zip 示例包，帮助你快速了解 UploadData 页面需要的文件组织方式与命名规则。"
    : "Download a ready-to-use zip package to quickly see the expected file organization and naming rules for the UploadData workflow."
);
const exampleButtonText = computed(() =>
  locale.value === "zh" ? "下载示例数据" : "Download sample data"
);

const requiredFileLabels = computed(() =>
  activeRestrictions.value.requiredFileNames.map((name) => {
    if (name === "*") {
      return locale.value === "zh" ? "基因列表 (.txt)" : "gene list (.txt)";
    }
    return name;
  })
);

const getExactCountMessage = (count) =>
  locale.value === "zh"
    ? `请上传刚好 ${count} 个文件。`
    : `Please upload exactly ${count} files.`;

const clearSelectedFiles = () => {
  dataUploadRef.value?.clearFiles?.();
  selectedFiles.value = [];
};

watch([selectedDataset, selectedFun], () => {
  clearSelectedFiles();
});

const getFileExtension = (fileName) => {
  const lowerName = String(fileName || "").toLowerCase();
  const fileParts = lowerName.split(".");
  return fileParts.length > 2
    ? `.${fileParts.slice(-2).join(".")}`
    : `.${fileParts.pop()}`;
};

const validateSelectedFileSet = (files, restrictions) => {
  if (files.length !== restrictions.uploadFileCount) {
    return false;
  }

  const fileInfos = files.map((file, index) => ({
    index,
    name: file.name.toLowerCase(),
    extension: getFileExtension(file.name),
  }));

  if (
    fileInfos.some(
      (file) => !restrictions.allowedExtensions.includes(file.extension)
    )
  ) {
    return false;
  }

  const usedIndexes = new Set();
  const specificNames = restrictions.requiredFileNames.filter((name) => name !== "*");

  for (const requiredName of specificNames) {
    const matched = fileInfos.find(
      (file) => !usedIndexes.has(file.index) && file.name.includes(requiredName)
    );

    if (!matched) {
      return false;
    }

    usedIndexes.add(matched.index);
  }

  const wildcardCount = restrictions.requiredFileNames.length - specificNames.length;
  const remainingFiles = fileInfos.filter((file) => !usedIndexes.has(file.index));

  if (remainingFiles.length !== wildcardCount) {
    return false;
  }

  if (
    wildcardCount > 0 &&
    remainingFiles.some(
      (file) => ![".txt", ".text"].includes(file.extension)
    )
  ) {
    return false;
  }

  return true;
};

const handleUpload = async () => {
  const files = selectedFiles.value;
  const restrictions = activeRestrictions.value;

  if (!files.length) {
    ElMessage.error(t("noFilesUploaded"));
    return;
  }

  if (files.length !== restrictions.uploadFileCount) {
    ElMessage.error(getExactCountMessage(restrictions.uploadFileCount));
    return;
  }

  if (!validateSelectedFileSet(files, restrictions)) {
    ElMessage.error(t("invalidFileTypeOrName"));
    return;
  }

  if (!validateEmail(email.value)) {
    ElMessage.error(t("emailRequired"));
    return;
  }

  isUploading.value = true;
  try {
    const success = await uploadFiles(
      files,
      email.value,
      Number(selectedDataset.value),
      restrictions.uploadFileCount,
      Number(selectedFun.value)
    );

    if (success) {
      clearSelectedFiles();
    }
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.steps-card {
  max-width: 500px;
  margin: auto;
}
.upload-page {
  min-height: calc(100vh - 76px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 42px;
  padding: 52px 56px 76px;
  box-sizing: border-box;
}
.platform-step {
  width: 100%;
  max-width: 1460px;
  margin: 0 auto;
}
.platform-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  flex-direction: column;
}
.platform-step-title {
  flex: 0 0 300px;
}
.platform-step-title > span {
  display: flex;
  align-items: center;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.platform-step-steps {
  width: 100%;
  max-width: 1080px;
}
.platform-step-steps :deep(.el-steps) {
  width: 100%;
}
.custom-steps :deep(.el-step__title) {
  font-size: 16px;
}
.custom-steps :deep(.el-step__head) {
  transform: scale(1.12);
}

.platform-container {
  width: 100%;
  max-width: 1460px;
  min-height: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 92px;
  margin: 0 auto;
  padding: 0;
}
.platform-container > div {
  flex: 0 1 auto;
  min-width: 0;
}

.platform-left {
  display: flex;
  flex-direction: column;
  width: 760px;
  padding: 8px 52px 8px 8px;
  position: relative;
}
.platform-left::after {
  content: "";
  position: absolute;
  top: 12px;
  right: -46px;
  height: 700px;
  background-color: #cccccc;
  transform: scaleX(1);
  transition: all 0.3s ease;
  width: 1px;
}
.platform-right {
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 8px 8px 8px 52px;
}

.platform-left-select {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
  width: 100%;
}
.platform-left :deep(.el-select__wrapper) {
  box-shadow: none;
  background: none;
}
.platform-right :deep(.el-select__wrapper) {
  box-shadow: none;
  background: none;
}

.platform-right :deep(.el-input__wrapper) {
  box-shadow: none;
  background: none;
}
.platform-step-span {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  max-width: 600px;
  text-align: left;
  margin-bottom: 28px;
}
.platform-step-span-title {
  font-size: 34px;
  font-weight: 600;
  line-height: 1.3;
}
.platform-step-span-text {
  font-size: 21px;
  line-height: 1.55;
  color: #606266;
}
.platform-left-tip {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  font-size: 15px;
  line-height: 1.7;
  width: 100%;
  max-width: 600px;
  margin-top: 34px;
  padding-top: 0;
  opacity: 0.88;
}
.platform-left-tip > span:first-child {
  font-size: 20px;
  font-weight: 600;
}
.platform-right-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 380px;
  height: 300px;
  margin: 0 0 22px;
}
.platform-right-image img {
  width: 320px;
  height: 320px;
  object-fit: contain;
}

.example-download-card {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(143, 211, 138, 0.16), rgba(118, 170, 255, 0.08));
  border: 1px solid rgba(112, 177, 108, 0.2);
  box-shadow: 0 14px 30px rgba(25, 44, 29, 0.06);
  box-sizing: border-box;
}

.example-download-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-download-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2f6d2d;
}

.example-download-copy h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
  color: #15261a;
}

.example-download-copy p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #55655a;
}

.example-download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8bd85c, #4ca63c);
  color: #0e2109;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 16px 28px rgba(76, 166, 60, 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.example-download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 34px rgba(76, 166, 60, 0.28);
}

.upload-helper-card {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  box-sizing: border-box;
}

.upload-helper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.upload-helper-column {
  align-items: flex-start;
  flex-direction: column;
}

.upload-helper-label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.upload-helper-value {
  font-size: 15px;
  color: #606266;
}

.upload-required-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-required-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f0f9eb;
  color: #365314;
  font-size: 14px;
  line-height: 1.4;
}

.platform-right :deep(.platform-left-tag) {
  max-width: 430px;
}

.platform-right :deep(.el-tag) {
  font-size: 15px;
  padding: 0 16px;
  height: 32px;
  line-height: 30px;
}

.platform-right :deep(.el-select),
.platform-right :deep(.el-input) {
  width: 430px !important;
}

.platform-right :deep(.el-select__wrapper),
.platform-right :deep(.el-input__wrapper) {
  min-height: 52px;
  font-size: 22px;
}

.platform-right :deep(.el-input__inner),
.platform-right :deep(.el-select__placeholder),
.platform-right :deep(.el-select__selected-item) {
  font-size: 22px;
}

.platform-left :deep(.upload-demo) {
  max-width: 640px;
}

.platform-left :deep(.el-upload-dragger) {
  min-height: 260px;
  padding: 44px 34px;
}

.platform-left :deep(.el-icon--upload svg) {
  width: 86px;
  height: 86px;
}

.platform-left :deep(.el-upload__text) {
  font-size: 28px;
  line-height: 1.6;
}

.platform-left :deep(.el-upload__tip) {
  font-size: 18px;
  line-height: 1.6;
}

.platform-right :deep(.el-button) {
  width: 430px;
  min-height: 54px;
  margin-top: 10px;
  font-size: 20px;
}

@media (max-width: 1100px) {
  .upload-page {
    justify-content: flex-start;
    padding: 48px 24px 56px;
  }

  .platform-container {
    gap: 36px;
    max-width: 1120px;
  }

  .platform-left,
  .platform-right {
    padding: 8px 0;
  }

  .platform-left {
    width: 620px;
  }

  .platform-right {
    width: 400px;
  }

  .platform-left::after {
    display: none;
  }
}

@media (max-width: 900px) {
  .upload-page {
    gap: 22px;
    padding: 36px 20px 40px;
  }

  .platform-step-header,
  .platform-container {
    flex-direction: column;
  }

  .platform-step {
    margin-bottom: 0;
  }

  .platform-step-title,
  .platform-step-steps,
  .platform-left,
  .platform-right {
    width: 100%;
    max-width: none;
  }

  .platform-left,
  .platform-right {
    min-height: auto;
    padding: 0;
  }

  .platform-step-title > span {
    font-size: 30px;
  }

  .platform-step-span-title {
    font-size: 24px;
  }

  .platform-step-span-text,
  .platform-left-tip {
    font-size: 16px;
  }

  .platform-left-tip {
    margin-top: 12px;
  }

  .platform-right-image {
    margin-bottom: 10px;
  }

  .upload-helper-card {
    max-width: none;
  }

  .example-download-card {
    max-width: none;
    flex-direction: column;
    align-items: flex-start;
  }

  .example-download-btn {
    width: 100%;
  }

  .platform-right :deep(.el-select),
  .platform-right :deep(.el-input),
  .platform-right :deep(.el-button) {
    width: 100% !important;
  }
}
</style>
