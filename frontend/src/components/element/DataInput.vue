<template>
  <div class="platform-left-tag">
    <el-tag type="info" style="width: fit-content">{{ tagText }}</el-tag>
    <el-input
      :model-value="modelValue"
      :placeholder="placeholderText"
      style="width: 240px"
      @input="handleInput"
      clearable
    />
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  tagText: {
    type: String,
    default: "Data set",
  },

  modelValue: {
    type: [String, Number],
    default: "",
  },
  placeholderText: {
    type: String,
    default: "Select",
  },
  validateFn: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();
const errorMessage = ref("");

const updateErrorMessage = (value) => {
  if (!props.validateFn) {
    errorMessage.value = "";
    return;
  }

  const isValid = props.validateFn(value);
  errorMessage.value = isValid || !value ? "" : t("invalidEmail");
};

const handleInput = (value) => {
  updateErrorMessage(value);
  emit("update:modelValue", value);
};

watch(
  () => props.modelValue,
  (newVal) => {
    updateErrorMessage(newVal);
  }
);
</script>

<style scoped>
.platform-left-tag {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  margin: 0;
}

.platform-left-tag :deep(.el-input__wrapper)::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 10%;
  height: 1px;
  background-color: #d5d5d5;
  transform: scaleX(1);
  transition: all 0.3s ease;
  width: 80%;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: -2px;
}
</style>
