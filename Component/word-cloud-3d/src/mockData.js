/** 演示数据：词频 + 带 tags 的文章，用于共现连线 */

export const DEMO_WORDS = [
  { id: 'java', name: 'Java', value: 48 },
  { id: 'python', name: 'Python', value: 42 },
  { id: 'vue', name: 'Vue', value: 40 },
  { id: '算法', name: '算法', value: 38 },
  { id: '数组', name: '数组', value: 34 },
  { id: '面向对象', name: '面向对象', value: 32 },
  { id: '前端', name: '前端', value: 30 },
  { id: '机器学习', name: '机器学习', value: 28 },
  { id: '笔记', name: '笔记', value: 26 },
  { id: '双指针', name: '双指针', value: 24 },
  { id: '路由', name: '路由', value: 22 },
  { id: '组件', name: '组件', value: 20 },
  { id: '入门', name: '入门', value: 18 },
  { id: '链表', name: '链表', value: 16 },
  { id: '树', name: '树', value: 15 },
]

export const DEMO_ARTICLES = [
  {
    id: 'a1',
    title: '把 Java 面向对象讲成一张地图',
    summary: '类、对象、继承、多态，用一张图串起来。',
    tags: ['Java', '面向对象', '入门', '笔记'],
  },
  {
    id: 'a2',
    title: 'Python 列表最容易踩的三个坑',
    summary: '浅拷贝、默认参数和切片赋值。',
    tags: ['Python', '入门', '笔记'],
  },
  {
    id: 'a3',
    title: '前端路由其实就是地址和组件的对照表',
    summary: '从 hash 到 history，再到页面状态。',
    tags: ['Vue', '前端', '路由', '组件'],
  },
  {
    id: 'a4',
    title: '双指针为什么能少一层循环',
    summary: '有序数组里找两数之和。',
    tags: ['算法', '数组', '双指针'],
  },
  {
    id: 'a5',
    title: '二叉树遍历一次讲完',
    summary: '前序、中序、后序与递归栈。',
    tags: ['算法', '树', '笔记'],
  },
  {
    id: 'a6',
    title: '机器学习入门：从分类邮件开始',
    summary: '特征和监督学习的直觉。',
    tags: ['机器学习', 'Python', '入门'],
  },
  {
    id: 'a7',
    title: 'Vue 组件通信速查',
    summary: 'props / emit / provide 怎么选。',
    tags: ['Vue', '组件', '前端'],
  },
  {
    id: 'a8',
    title: '链表与数组的取舍',
    summary: '随机访问 vs 插入删除。',
    tags: ['算法', '数组', '链表'],
  },
]
