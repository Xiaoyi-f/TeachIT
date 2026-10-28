# Bilibili 风格播放器 Demo

从主项目抽出并增强的学习播放器：

- `EnhancedVideoPlayer.vue`：Artplayer、加载层、知识点进度标记、笔记
- `Player.vue`：`artplayer-plugin-danmuku` 弹幕

## 功能

**保留原始能力**

- Artplayer 播放（截图 / 画中画 / 倍速 / 翻转 / 比例 / 迷你进度条 / 自动回放）
- 弹幕加载与显示
- 加载过渡层
- 知识点进度条标记跳转
- 笔记面板（按时间戳保存并跳转）

**Demo 增强（更像 B 站）**

- 粉色主题 `#fb7299`
- 底部栏：笔记 → 弹幕开/关（图标）→ 输入 → 发送
- 分 P 列表，播完自动下一 P
- 快捷键：空格、←→、F、M
- 仅窗口全屏（无网页全屏）
- 在线人数角标、点赞/投币/收藏区

## 启动

```bash
cd demos/bilibili-player
npm install
npm run dev
```

默认地址：`http://localhost:5178`

## 核心文件

- `src/components/BilibiliPlayer.vue` — 播放器本体
- `src/App.vue` — 分 P / 互动演示页
- `src/mockData.js` — 示例视频、弹幕、知识点
