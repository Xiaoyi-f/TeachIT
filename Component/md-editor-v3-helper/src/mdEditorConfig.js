import { config } from "md-editor-v3";
import mermaid from "mermaid";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { getImageUrl, parseLocalId, resolveLocalImages } from "./imageStore";
import { applyCachedMermaid, installMermaidPreviewFix, patchMermaid } from "./mermaidFix";

patchMermaid(mermaid);
installMermaidPreviewFix();

/** 编辑器自带渲染和补画抢同一个容器，失败的图会停在源码。这里关掉自带渲染。 */
const editorMermaidStub = {
  initialize() {},
  render() {
    return Promise.reject(new Error("skip"));
  },
};

/**
 * Markdown 结构上的单个空行（块与块分隔）不额外插占位，交给元素自身 padding。
 * 只有「多出来的空行」才 1:1 保留：编辑区 2 个空行 → 1 个占位，3 个 → 2 个，以此类推。
 */
const preserveBlankLines = (src) => {
  const normalized = String(src).replace(/\r\n/g, "\n");
  const parts = normalized.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part.replace(/\n(?:[ \t]*\n)+/g, (match) => {
        const blankLines = (match.match(/\n/g) || []).length - 1;
        if (blankLines <= 1) return "\n\n";
        return `\n\n${'<div class="md-blank-line">&nbsp;</div>\n\n'.repeat(
          blankLines - 1
        )}`;
      });
    })
    .join("");
};

const bindLocalImageRenderer = (md) => {
  const defaultImage =
    md.renderer.rules.image ||
    ((tokens, idx, options, _env, self) =>
      self.renderToken(tokens, idx, options));

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet("src") || "";
    const id = parseLocalId(src);
    if (id) {
      const url = getImageUrl(id);
      if (url) token.attrSet("src", url);
    }
    return defaultImage(tokens, idx, options, env, self);
  };
};

config({
  editorExtensions: {
    mermaid: {
      instance: editorMermaidStub,
    },
    cropper: {
      instance: Cropper,
    },
  },
  // 编辑区右侧预览 + 预览模式 统一走这里，避免只改了一边
  markdownItConfig(md) {
    bindLocalImageRenderer(md);
    const render = md.render.bind(md);
    md.render = (src, env) => {
      const next = preserveBlankLines(src);
      // 空行占位会改行号。目录/闭合判断必须用同一份行，否则前面的 mermaid 会被当成未闭合，只剩最后一张能画。
      const nextEnv = env ? { ...env, srcLines: String(next).split("\n") } : env;
      return applyCachedMermaid(resolveLocalImages(render(next, nextEnv)));
    };
  },
});

export { preserveBlankLines };
