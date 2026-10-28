const imageStore = new Map();
let seq = 1;

/** 存入图片，返回短 id（正文里只写 local://id, 不写超长地址） */
export const putImage = (fileOrUrl) => {
  const id = `img_${seq++}`;
  const url =
    fileOrUrl instanceof Blob ? URL.createObjectURL(fileOrUrl) : String(fileOrUrl);
  imageStore.set(id, { url });
  return id;
};

export const getImageUrl = (id) => imageStore.get(id)?.url || "";

export const toLocalSrc = (id) => `local://${id}`;

export const parseLocalId = (src = "") => {
  const m = String(src).match(/^local:\/\/(.+)$/);  // (.+) 正则捕获分组
  return m ? m[1] : "";  // 0 是全内容
};

/** 合法尺寸：正整数；空/非法则不写属性，避免 height=1 变成一条线 */
const normalizeSize = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.round(n);
};

/** 生成可编辑的短占位，可直接改 width / height（单位 px） */
export const buildImagePlaceholder = (id, width, height) => {
  const attrs = [`src="${toLocalSrc(id)}"`, 'alt="📷"'];
  const w = normalizeSize(width);
  const h = normalizeSize(height);
  if (w) attrs.push(`width="${w}"`);
  if (h) attrs.push(`height="${h}"`);
  return `<img ${attrs.join(" ")} />`;
};

/** 把 HTML / Markdown 里的 local:// 还原成真实地址，供预览渲染 */
export const resolveLocalImages = (html) =>
  String(html).replace(
    /(?:src=["']|]\()(local:\/\/[^"' )\]]+)/g,
    (full, src) => {
      const id = parseLocalId(src);
      const url = getImageUrl(id);
      return url ? full.replace(src, url) : full;
    }
  );
