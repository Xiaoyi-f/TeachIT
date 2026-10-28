<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { MdEditor, MdPreview, MdCatalog } from "md-editor-v3";
import { Emoji, ExportPDF } from "@vavt/v3-extension";
import "md-editor-v3/lib/style.css";
import "md-editor-v3/lib/preview.css";
import "@vavt/v3-extension/lib/asset/Emoji.css";
import "@vavt/v3-extension/lib/asset/ExportPDF.css";
import "./mdEditorConfig";
import ImageUploadToolbar from "./ImageUploadToolbar.vue";
import { putImage, toLocalSrc } from "./imageStore";

const mode = ref("edit");
const catalogOpen = ref(true);
const previewScrollRef = ref(null);

/** 用序号生成唯一 id，避免同名标题冲突 - 回调函数, 自动传参 - 标题文本、标题级别、标题索引  */
const mdHeadingId = (_text, _level, index) => `heading-${index}`;

/**
 * 同名标题时库内 getElementById 会跳到第一个。
 * 这里按目录序号对齐正文标题顺序，强制跳到对应那一个。
 */
const onCatalogClick = (e, tocItem) => {
  e.preventDefault();
  const container = previewScrollRef.value;
  if (!container || !tocItem?.index) return;

  const headings = container.querySelectorAll(
    ".md-editor-preview h1, .md-editor-preview h2, .md-editor-preview h3, .md-editor-preview h4, .md-editor-preview h5, .md-editor-preview h6"
  );
  const target = headings[tocItem.index - 1];
  if (!(target instanceof HTMLElement)) return;

  const top =
    target.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop -
    8;

  container.scrollTo({ top, behavior: "smooth" });
};

const state = reactive({
  theme: "light",
  text: `
# Hello MdEditor!

下面有 1 个空行

下面有 2 个空行


下面有 3 个空行



## 表格示例

| 名称 | 说明 |
| --- | --- |
| 图片 | 工具栏上传（无后端时用本地预览） |
| 表格 | 点工具栏表格图标，选择行列 |
| Mermaid | 点工具栏插入后右侧预览渲染 |

## Mermaid 示例

\`\`\`mermaid
flowchart LR
  A[编辑 Markdown] --> B[实时预览]
  B --> C[保存]
\`\`\`

\`\`\`mermaid
flowchart TD
  D[第一张图] --> E[第二张图]
  E --> F[都要渲染]
\`\`\`
`,
  id: "my-editor",
  catalogList: [],
});

// 工具栏定义
const toolBars = [
  "bold", // 加粗
  "underline", // 下划线
  "italic", // 斜体
  "strikeThrough", // 删除线
  "-",
  "title", // 标题
  "sub", // 下标
  "sup", // 上标
  "quote", // 引用
  "unorderedList", // 无序列表
  "orderedList", // 有序列表
  "-",
  "codeRow", // 行内代码
  "code", // 代码块
  "link", // 链接
  2, // 上传图片（直接选文件，无链接/裁剪菜单）
  "table", // 表格
  "mermaid", // Mermaid图表
  0, // 表情（defToolbars 第 1 个）
  "-",
  "revoke", // 撤销
  "next", // 重做
  "save", // 保存
  1, // 导出 PDF（defToolbars 第 2 个）
  "=",
  "pageFullscreen", // 页面全屏
  "fullscreen", // 全屏
  "preview", // 预览
  "catalog", // 目录
];

// 上传图片：优先接口；失败则写入本地图库，正文只保留 local://短占位
const onUploadImg = async (files, callback) => {
  try {
    const res = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const form = new FormData();
          form.append("file", file);

          axios
            .post("/api/img/upload", form, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
        });
      })
    );
    callback(
      res.map((item, index) => {
        const url = item?.data?.url;
        if (!url) return toLocalSrc(putImage(files[index]));
        return toLocalSrc(putImage(url));
      })
    );
  } catch (e) {
    callback(files.map((file) => toLocalSrc(putImage(file))));
  }
};

// 获取目录
const onGetCatalog = (list) => {
  state.catalogList = list;
};
</script>

<template>
  <div class="page" :class="state.theme">
    <header class="header">
      <div class="brand">
        <span class="brand-mark">M</span>
        <div class="brand-text">
          <strong>Markdown</strong>
          <span>编辑器</span>
        </div>
      </div>
      <div class="actions">
        <div class="seg" role="group">
          <button type="button" :class="{ active: state.theme === 'light' }" @click="state.theme = 'light'">
            浅色
          </button>
          <button type="button" :class="{ active: state.theme === 'dark' }" @click="state.theme = 'dark'">
            深色
          </button>
        </div>
        <div class="seg" role="group" aria-label="模式">
          <button type="button" :class="{ active: mode === 'edit' }" @click="mode = 'edit'">
            编辑
          </button>
          <button type="button" :class="{ active: mode === 'preview' }" @click="mode = 'preview'">
            预览
          </button>
        </div>
      </div>
    </header>

    <!-- 编辑：MdEditor + toolBars + 上传 + 目录 -->
    <MdEditor v-if="mode === 'edit'" v-model="state.text" :theme="state.theme" :toolbars="toolBars"
      :mdHeadingId="mdHeadingId" noKatex class="editor" @onUploadImg="onUploadImg" @onGetCatalog="onGetCatalog">
      <template #defToolbars>
        <Emoji :theme="state.theme" title="表情" />
        <ExportPDF :modelValue="state.text" :theme="state.theme" title="导出 PDF" fileName="markdown" />
        <ImageUploadToolbar title="上传图片" :onUploadImg="onUploadImg" />
      </template>
    </MdEditor>

    <!-- 展示：MdPreview + MdCatalog -->
    <div v-else class="preview-wrap">
      <div class="preview-stage">
        <aside class="catalog" :class="{ collapsed: !catalogOpen }">
          <div class="catalog-bar">
            <span v-show="catalogOpen">目录</span>
            <button type="button" class="icon-btn" :aria-label="catalogOpen ? '收起目录' : '展开目录'"
              :title="catalogOpen ? '收起目录' : '展开目录'" @click="catalogOpen = !catalogOpen">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                  stroke-linejoin="round" d="M10 3.5 5.5 8 10 12.5" />
              </svg>
            </button>
          </div>
          <div v-show="catalogOpen" class="catalog-body">
            <MdCatalog :editorId="state.id" :scrollElement="previewScrollRef" :scrollElementOffsetTop="8"
              :mdHeadingId="mdHeadingId" :theme="state.theme" @onClick="onCatalogClick" />
          </div>
        </aside>

        <article class="preview-panel">
          <div ref="previewScrollRef" class="preview-scroll">
            <MdPreview :id="state.id" :modelValue="state.text" :theme="state.theme" :mdHeadingId="mdHeadingId"
              noKatex />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}

.page {
  --bar-h: 52px;
  --line: #e6e8eb;
  --bar-bg: #fff;
  --muted: #6b7280;
  --seg-bg: #f3f4f6;
  --seg-active: #fff;
  --accent: #2563eb;
  --md-line: 1.75em;
  height: 100vh;
  overflow: hidden;
  background: #f5f6f8;
  color: #1f2328;
}

.page.dark {
  --line: #30363d;
  --bar-bg: #161b22;
  --muted: #8b949e;
  --seg-bg: #0d1117;
  --seg-active: #21262d;
  --accent: #58a6ff;
  background: #0d1117;
  color: #e6edf3;
}

.header {
  height: var(--bar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  background: var(--bar-bg);
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex: none;
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.brand-text strong {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.brand-text span {
  font-size: 12px;
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: none;
}

.seg {
  display: flex;
  padding: 2px;
  border-radius: 8px;
  background: var(--seg-bg);
  border: 1px solid var(--line);
}

.seg button {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
}

.seg button.active {
  background: var(--seg-active);
  color: inherit;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.editor {
  height: calc(100vh - var(--bar-h));
}

.preview-wrap {
  --preview-pad: 16px;
  --panel-radius: 10px;
  --md-line: 1.75em;
  height: calc(100vh - var(--bar-h));
  min-height: 0;
  overflow: hidden;
  padding: var(--preview-pad);
  background: #eceef1;
  box-sizing: border-box;
}

.page.dark .preview-wrap {
  background: #010409;
}

.preview-stage {
  display: flex;
  align-items: stretch;
  gap: 14px;
  height: 100%;
  min-height: 0;
}

.catalog {
  flex: 0 0 232px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: var(--bar-bg);
  border: 1px solid var(--line);
  border-radius: var(--panel-radius);
  overflow: hidden;
  transition: flex-basis 0.2s ease, width 0.2s ease;
}

.catalog.collapsed {
  flex-basis: 44px;
}

.catalog-bar {
  height: 44px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 8px 0 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
}

.catalog.collapsed .catalog-bar {
  justify-content: center;
  padding: 0;
  border-bottom: 0;
}

.catalog.collapsed .icon-btn svg {
  transform: rotate(180deg);
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--seg-bg);
}

.catalog-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px 8px 14px;
}

.catalog-body .md-editor-catalog-link {
  cursor: pointer;
}

.catalog-body .md-editor-catalog-link>span:hover {
  color: var(--accent);
}

.preview-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: var(--bar-bg);
  border: 1px solid var(--line);
  border-radius: var(--panel-radius);
  color: inherit;
  overflow: hidden;
}

.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  /* MdCatalog 要求滚动容器必须定位 */
  padding: 28px 36px 48px;
  box-sizing: border-box;
}

.preview-panel .md-editor-previewOnly,
.preview-panel .md-editor-preview-wrapper,
.preview-panel .md-editor-preview {
  height: auto !important;
  min-height: 100%;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.preview-panel .md-editor-preview {
  padding: 0 !important;
  display: block;
}

/*
 * 覆盖 md-editor 主题默认标题间距：margin: 1.4em 0 .8em
 * （本文件未使用 scoped，不要写 :deep()）
 */
.md-editor-preview {
  font-size: 16px;
  line-height: var(--md-line);
}

.md-editor-preview .md-blank-line {
  display: block !important;
  height: var(--md-line) !important;
  min-height: var(--md-line) !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  overflow: hidden;
  line-height: var(--md-line) !important;
  font-size: 16px !important;
  opacity: 0;
  user-select: none;
  pointer-events: none;
}

.md-editor-preview h1,
.md-editor-preview h2,
.md-editor-preview h3,
.md-editor-preview h4,
.md-editor-preview h5,
.md-editor-preview h6 {
  margin: 0 !important;
  padding: 0.35em 0 0.2em !important;
  line-height: 1.35 !important;
}

.md-editor-preview h1:first-child,
.md-editor-preview h2:first-child,
.md-editor-preview h3:first-child,
.md-editor-preview h4:first-child {
  padding-top: 0 !important;
}

.md-editor-preview p {
  margin: 0 !important;
  padding: 0.15em 0 !important;
  line-height: var(--md-line);
}

.md-editor-preview ul,
.md-editor-preview ol,
.md-editor-preview blockquote,
.md-editor-preview pre,
.md-editor-preview table,
.md-editor-preview .md-editor-code {
  margin: 0 !important;
  padding-top: 0.25em !important;
  padding-bottom: 0.25em !important;
  line-height: var(--md-line);
}

.md-editor-preview hr {
  margin: 0.6em 0 !important;
}

.md-editor-preview li+li {
  margin-top: 0.15em !important;
}

/* 图片按占位里的 width/height（px）渲染；块级排列，避免并排成一条线 */
.md-editor-preview img {
  display: block;
  max-width: 100%;
  margin: 0.75em 0;
}

.md-editor-preview img[width]:not([height]) {
  height: auto;
}

div.md-editor-mermaid[data-md-fix="err"] {
  margin: 0.75em 0;
  padding: 8px 10px;
  border: 1px dashed #d4a017;
  border-radius: 6px;
  color: #9a6700;
  font-size: 13px;
  white-space: pre-wrap;
}
</style>
