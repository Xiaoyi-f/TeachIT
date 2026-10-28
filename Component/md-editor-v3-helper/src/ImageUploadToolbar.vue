<script setup>
import { reactive, ref } from "vue";
import { NormalToolbar } from "md-editor-v3";
import {
  buildImagePlaceholder,
  putImage,
  toLocalSrc,
} from "./imageStore";

const props = defineProps({
  title: {
    type: String,
    default: "上传图片",
  },
  insert: {
    type: Function,
    default: () => { },
  },
  onUploadImg: {
    type: Function,
    required: true,
  },
});

const inputRef = ref(null);
const queue = ref([]);

const dialog = reactive({
  visible: false,
  previewUrl: "",
  localId: "",
  width: "320",
  height: "",
});

const pick = () => {
  inputRef.value?.click();
};

const resetDialog = () => {
  dialog.visible = false;
  dialog.previewUrl = "";
  dialog.localId = "";
  dialog.width = "320";
  dialog.height = "";
};

const openNext = () => {
  const next = queue.value.shift();
  if (!next) {
    resetDialog();
    return;
  }
  dialog.localId = next.id;
  dialog.previewUrl = next.previewUrl;
  dialog.width = "320";
  dialog.height = "";
  dialog.visible = true;
};

const cancel = () => {
  queue.value = [];
  resetDialog();
};

const confirm = () => {
  const placeholder = buildImagePlaceholder(
    dialog.localId,
    dialog.width,
    dialog.height
  );
  // 块级换行
  props.insert(() => ({
    targetValue: `\n\n${placeholder}\n\n`,
    select: false,
    deviationStart: 0,
    deviationEnd: 0,
  }));
  openNext();
};

const onChange = async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = "";
  if (!files.length) return;

  // 先走上传回调拿到地址
  await props.onUploadImg(files, (urls) => {
    queue.value = (urls || []).map((url, index) => {
      // onUploadImg 约定返回 local://id 或可访问 url
      let id = "";
      if (String(url).startsWith("local://")) {
        id = String(url).slice("local://".length);
      } else {
        id = putImage(url);
      }
      const file = files[index];
      const previewUrl = file ? URL.createObjectURL(file) : toLocalSrc(id);
      return { id, previewUrl };
    });
    openNext();
  });
};
</script>

<template>
  <NormalToolbar :title="title" @onClick="pick">
    <template #trigger>
      <svg class="md-editor-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </template>
  </NormalToolbar>

  <input ref="inputRef" class="image-upload-input" type="file" accept="image/*" multiple @change="onChange" />

  <div v-if="dialog.visible" class="img-dialog-mask" @click.self="cancel">
    <div class="img-dialog" role="dialog" aria-modal="true">
      <div class="img-dialog__title">设置图片尺寸</div>
      <div class="img-dialog__preview">
        <img :src="dialog.previewUrl" alt="预览" />
        <span class="img-dialog__badge">📷</span>
      </div>
      <div class="img-dialog__row">
        <label>
          width
          <span>
            <input v-model="dialog.width" type="text" inputmode="numeric" placeholder="320" />
            px
          </span>
        </label>
        <label>
          height
          <span>
            <input v-model="dialog.height" type="text" inputmode="numeric" placeholder="自动" />
            px
          </span>
        </label>
      </div>
      <p class="img-dialog__tip">
        height 留空则按比例自适应。插入后正文是短占位，可继续改 width / height（px）。
      </p>
      <div class="img-dialog__actions">
        <button type="button" class="ghost" @click="cancel">取消</button>
        <button type="button" class="primary" @click="confirm">插入</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-upload-input {
  display: none;
}

.img-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.45);
}

.img-dialog {
  width: min(420px, calc(100vw - 32px));
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  color: #1f2328;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.img-dialog__title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.img-dialog__preview {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 140px;
  max-height: 220px;
  margin-bottom: 14px;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
  background: #f8fafc;
  overflow: hidden;
}

.img-dialog__preview img {
  max-width: 100%;
  max-height: 220px;
  object-fit: contain;
}

.img-dialog__badge {
  position: absolute;
  left: 10px;
  top: 8px;
  font-size: 18px;
}

.img-dialog__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.img-dialog__row label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.img-dialog__row span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1f2328;
}

.img-dialog__row input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 14px;
}

.img-dialog__tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.img-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.img-dialog__actions button {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  background: #fff;
  cursor: pointer;
}

.img-dialog__actions .primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.img-dialog__actions .ghost:hover {
  background: #f3f4f6;
}
</style>
