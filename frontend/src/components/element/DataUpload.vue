<template>
  <div class="data-upload">
    <el-upload
      ref="uploadRef"
      v-model:file-list="uploadFileList"
      class="upload-demo"
      drag
      action="#"
      multiple
      :auto-upload="false"
      :accept="acceptText"
      :limit="limit"
      :show-file-list="showFileList"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text" v-html="$t('dropFileText')"></div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t("fileSizeTip") }}
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import i18n from "../../i18n/i18n";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  restrictions: {
    type: Object,
    required: true,
  },
  showFileList: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const uploadRef = ref(null);
const uploadFileList = ref([]);

const acceptText = computed(
  () => props.restrictions?.allowedExtensions?.join(",") || ""
);
const limit = computed(() => props.restrictions?.uploadFileCount || 20);

const getFileExtension = (fileName) => {
  const lowerName = String(fileName || "").toLowerCase();
  const fileParts = lowerName.split(".");
  return fileParts.length > 2
    ? `.${fileParts.slice(-2).join(".")}`
    : `.${fileParts.pop()}`;
};

const isValidByExtension = (file) => {
  const allowedExtensions = props.restrictions?.allowedExtensions || [];
  const fileExtension = getFileExtension(file.name);
  return allowedExtensions.includes(fileExtension);
};

const emitRawFiles = () => {
  emit(
    "update:modelValue",
    uploadFileList.value.map((item) => item.raw).filter(Boolean)
  );
};

const getLimitMessage = () =>
  i18n.global.locale.value === "zh"
    ? `请上传刚好 ${limit.value} 个文件。`
    : `Please upload exactly ${limit.value} files.`;

const getInvalidFileMessage = (fileName) =>
  i18n.global.locale.value === "zh"
    ? `文件 ${fileName} 不符合当前上传规则。`
    : `File ${fileName} does not match the current upload rule.`;

const beforeUpload = (file) => {
  if (!isValidByExtension(file)) {
    ElMessage.error(getInvalidFileMessage(file.name));
    return false;
  }
  return false;
};

const handleChange = (uploadFile, fileList) => {
  if (!uploadFile?.raw) {
    uploadFileList.value = [...fileList];
    emitRawFiles();
    return;
  }

  if (!isValidByExtension(uploadFile.raw)) {
    uploadFileList.value = fileList.filter((item) => item.uid !== uploadFile.uid);
    emitRawFiles();
    return;
  }

  uploadFileList.value = [...fileList];
  emitRawFiles();
};

const handleRemove = (uploadFile, fileList) => {
  uploadFileList.value = [...fileList];
  emitRawFiles();
};

const handleExceed = () => {
  ElMessage.warning(getLimitMessage());
};

const clearFiles = () => {
  uploadRef.value?.clearFiles();
  uploadFileList.value = [];
  emit("update:modelValue", []);
};

defineExpose({
  clearFiles,
});
</script>

<style scoped>
.data-upload,
.upload-demo {
  width: 100%;
  max-width: 500px;
}

.upload-demo :deep(.el-upload-dragger) {
  padding: 18px 16px;
  min-height: 200px;
}

.upload-demo :deep(.el-upload__tip) {
  margin-top: 10px;
  line-height: 1.5;
}

.upload-demo :deep(.el-upload__text) {
  font-size: 22px;
  line-height: 1.45;
}

.upload-demo :deep(.el-icon--upload svg) {
  width: 64px;
  height: 64px;
}
</style>
