import mermaid from "mermaid";

/**
 * md-editor-v3 会对每张图同时调用 mermaid.render。
 * mermaid 11 共用一个渲染容器，并发时只有最后一张成功，其余块会一直停在源码。
 * 这里把 render 串成队列。
 */
export const patchMermaid = (instance = mermaid) => {
  if (instance.__mdPatched) return instance;
  const rawRender = instance.render.bind(instance);
  let queue = Promise.resolve();  // 创建一个已经处于成功状态的Promise
  instance.render = (...args) => {
    const job = queue.then(() => rawRender(...args));
    queue = job.then(
      () => undefined,
      () => undefined
    );
    return job;
  };
  instance.__mdPatched = true;
  return instance;
};

const svgCache = new Map();
let seq = 0;

const norm = (code) => String(code || "").replace(/\r\n/g, "\n").trim();

/** 把已经画成功的图写回 HTML，避免编辑器刷新时又变回源码 */
export const applyCachedMermaid = (html) => {
  if (!svgCache.size || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  let changed = false;
  doc.querySelectorAll("div.md-editor-mermaid").forEach((el) => {
    if (el.getAttribute("data-closed") === "false") return;
    const svg = svgCache.get(norm(el.textContent));
    if (!svg) return;
    const block = doc.createElement("p");
    block.className = "md-editor-mermaid";
    block.setAttribute("data-processed", "");
    const line = el.getAttribute("data-line");
    if (line) block.setAttribute("data-line", line);
    block.innerHTML = svg;
    el.replaceWith(block);
    changed = true;
  });
  return changed ? doc.body.innerHTML : html;
};

const renderToSvg = async (code) => {
  const cached = svgCache.get(norm(code));
  if (cached) return cached;

  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:1024px;height:768px;overflow:hidden;pointer-events:none;";
  document.body.appendChild(host);
  const id = `mdm${Date.now().toString(36)}${seq++}`;
  try {
    const { svg } = await mermaid.render(id, norm(code), host);
    svgCache.set(norm(code), svg);
    return svg;
  } finally {
    host.remove();
  }
};

const mountSvg = (el, svg) => {
  if (!(el instanceof HTMLElement) || !el.isConnected) return;
  const block = document.createElement("p");
  block.className = "md-editor-mermaid";
  block.dataset.processed = "";
  block.dataset.mdFix = "ok";
  if (el.dataset.line) block.dataset.line = el.dataset.line;
  block.innerHTML = svg;
  block.querySelector("svg")?.removeAttribute("height");
  el.replaceWith(block);
};

const sourceBlocks = () =>
  [...document.querySelectorAll("div.md-editor-mermaid")].filter(
    (el) =>
      el.dataset.closed !== "false" &&
      el.dataset.mdFix !== "err" &&
      el.dataset.mdFix !== "pending"
  );

/**
 * 库渲染失败或增量更新把 SVG 盖回源码时，按源码把每一张图都补上。
 * 相同源码共用一次渲染结果，避免只留下最后一张。
 */
export const installMermaidPreviewFix = () => {
  if (
    typeof document === "undefined" ||
    document.documentElement.dataset.mdMermaidFix
  ) {
    return () => { };
  }
  document.documentElement.dataset.mdMermaidFix = "1";
  patchMermaid();
  mermaid.initialize?.({ startOnLoad: false });

  let flushing = false;
  let scheduled = false;

  const drain = async () => {
    for (; ;) {
      const el = sourceBlocks()[0];
      if (!el) return;

      const code = norm(el.textContent);
      if (!code) {
        el.dataset.mdFix = "err";
        continue;
      }

      if (svgCache.has(code)) {
        const svg = svgCache.get(code);
        document.querySelectorAll("div.md-editor-mermaid").forEach((node) => {
          if (node.dataset.closed !== "false" && norm(node.textContent) === code) {
            mountSvg(node, svg);
          }
        });
        continue;
      }

      el.dataset.mdFix = "pending";
      try {
        const svg = await renderToSvg(code);
        document.querySelectorAll("div.md-editor-mermaid").forEach((node) => {
          if (node.dataset.closed !== "false" && norm(node.textContent) === code) {
            mountSvg(node, svg);
          }
        });
      } catch (error) {
        if (!el.isConnected) continue;
        const message = error?.message || "mermaid render failed";
        if (message === "skip") {
          delete el.dataset.mdFix;
          continue;
        }
        el.dataset.mdFix = "err";
        el.dataset.mdErr = message;
        el.textContent = `图表语法错误：${message}`;
      } finally {
        if (el.isConnected && el.dataset.mdFix === "pending") {
          delete el.dataset.mdFix;
        }
      }
    }
  };

  const kick = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (flushing) return;
      flushing = true;
      drain()
        .catch(() => { })
        .finally(() => {
          flushing = false;
          if (sourceBlocks().length) kick();
        });
    });
  };

  const observer = new MutationObserver(kick);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-closed", "class"],
  });
  kick();
  return () => observer.disconnect();
};
