# 3D 词云 Demo

从主项目 `src/app/components/StudyPlanet/SPRightSidebar.vue` 抽出的 **Three.js 3D 词云**，单独成项目方便学习。

## 功能

- 拖拽旋转 / 滚轮缩放 / 自动旋转
- 点击词语高亮关联连线
- 触发检索，过滤右侧文章列表
- 基于文章 tags 共现生成关系边

## 启动

```bash
cd demos/word-cloud-3d
npm install
npm run dev
```

浏览器打开提示的本地地址（默认 `http://localhost:5177`）。

## 核心文件

- `src/components/WordCloud3D.vue` — 词云引擎（Sprite / Raycaster / OrbitControls）
- `src/App.vue` — 演示页：点击检索联动
- `src/mockData.js` — 词频与文章假数据
