/**
 * Demo 视频 / 弹幕假数据
 * 视频源使用公开可播的示例 MP4，便于本地演示。
 */

export const EPISODES = [
  {
    id: 'ep1',
    title: 'P1 开场与环境准备',
    duration: '00:10',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    cover: '',
  },
  {
    id: 'ep2',
    title: 'P2 核心概念演示',
    duration: '00:13',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    cover: '',
  },
  {
    id: 'ep3',
    title: 'P3 实操小练习',
    duration: '00:10',
    url: 'https://www.w3schools.com/html/movie.mp4',
    cover: '',
  },
]

/** 初始弹幕：对齐 artplayer-plugin-danmuku 字段 */
export const DEMO_DANMAKU = [
  { text: '来了来了', time: 1, color: '#ffffff', border: false, mode: 0 },
  { text: '画质不错', time: 2.5, color: '#66ccff', border: false, mode: 0 },
  { text: '这个节奏好评', time: 4, color: '#fb7299', border: false, mode: 0 },
  { text: '笔记记下了', time: 6, color: '#a3ff99', border: false, mode: 0 },
  { text: '前方高能', time: 8, color: '#ffd700', border: true, mode: 1 },
  { text: '再看一遍', time: 3, color: '#ffffff', border: false, mode: 0 },
]

export const VIDEO_META = {
  title: '【Demo】像 Bilibili 一样的学习播放器',
  author: '演示 UP 主',
  views: '12.8万',
  danmakuCount: DEMO_DANMAKU.length,
  publishDate: '2026-09-19',
  intro: '控制栏含点赞/投币/收藏、截图、倍速、全屏；倍速直接改写 video.playbackRate。',
}
