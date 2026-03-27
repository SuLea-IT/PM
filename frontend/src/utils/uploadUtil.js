import { ElMessage } from "element-plus";
import i18n from "../i18n/i18n";
import axiosInstance from "./axiosInstance";

const CHUNK_SIZE = 5 * 1024 * 1024;

const translateServerMessage = (message) => {
  switch (message) {
    case "Chunk uploaded successfully, waiting for the remaining chunks.":
    case "Uploading":
    case "???":
      return i18n.global.t("uploadInProgress");
    case "File merge completed and chunk directory was removed.":
    case "All files uploaded successfully":
    case "????????":
      return i18n.global.t("fileUploadSuccess");
    case "??????":
      return i18n.global.t("fileAlreadyExists");
    default:
      if (
        i18n.global.locale.value === "en" &&
        /[\u4e00-\u9fa5]/.test(message || "")
      ) {
        return i18n.global.t("uploadFailedRetry");
      }
      return message;
  }
};

const uploadFileInChunks = async (
  file,
  currentFileIndex,
  totalFiles,
  email,
  fileType,
  fileNumber,
  fun
) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let progressNoticeCount = 0;
  let lastResponse = null;

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("index", index);
    formData.append("totalChunks", totalChunks);
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size);
    formData.append("type", fileType);
    formData.append("number", fileNumber);
    formData.append("currentFileIndex", currentFileIndex);
    formData.append("totalFiles", totalFiles);
    formData.append("email", email);
    formData.append("fun", fun);

    try {
      const response = await axiosInstance.post("/upload/upload", formData);
      lastResponse = response;

      if (response.code !== 200) {
        const translatedMessage = translateServerMessage(response.msg);
        ElMessage.error(translatedMessage || i18n.global.t("uploadFailedRetry"));
        throw new Error(response.msg || "Upload failed");
      }

      if (index < totalChunks - 1) {
        progressNoticeCount += 1;
        if (progressNoticeCount % 3 === 0) {
          ElMessage.success(i18n.global.t("uploadInProgress"));
        }
      }
    } catch (error) {
      console.error("Upload chunk failed:", error);
      ElMessage.error(i18n.global.t("uploadFailedRetry"));
      throw error;
    }
  }

  return lastResponse;
};

const uploadFiles = async (files, email, fileType, fileNumber, fun) => {
  if (files.length === 0) {
    ElMessage.error(i18n.global.t("noFilesUploaded"));
    return false;
  }

  const sortedFiles = Array.from(files).sort((a, b) => b.size - a.size);
  const totalFiles = sortedFiles.length;

  try {
    for (let index = 0; index < totalFiles; index += 1) {
      const response = await uploadFileInChunks(
        sortedFiles[index],
        index + 1,
        totalFiles,
        email,
        fileType,
        fileNumber,
        fun
      );

      if (response?.msg) {
        const translatedMessage = translateServerMessage(response.msg);
        if (index === totalFiles - 1) {
          ElMessage.success(translatedMessage || i18n.global.t("fileUploadSuccess"));
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Upload files failed:", error);
    return false;
  }
};

export { uploadFiles };
