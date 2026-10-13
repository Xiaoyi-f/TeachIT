import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'

echarts.use([
BarChart, LineChart, PieChart, // 图表
GridComponent, TooltipComponent,
LegendComponent, TitleComponent,
CanvasRenderer // 渲染器
])

/**
* 核心概念
* option 配置对象
* xAxis / yAxis 坐标轴
* series 数据系列
* grid 直角坐标系的容器 (位置、大小)
* tooltip 悬浮提示
* legend 图例
* echarts.init(domElement) 初始化
* setOption() 设置/更新配置
* resize() 容器尺寸变化时调用
* dispose() 销毁实例
*/

const chart = echarts.init(domElement)
chart.setOption({
// 堆叠柱状图
series: [
{
type: 'bar',
stack: 'x',
data: [1, 2, 3],
name: '基础'
},
{
type: 'bar',
stack: 'x',
data: adv.highlight,
name: '堆叠'
}
],

// 横向柱状图
series: [
{
type: 'bar',
data: [1, 2, 3],
barWidth: 20,
itemStyle: {
color: 'red',
borderRadius: 5
},
label: {
show: true,
position: 'top',
color: 'green',
fontSize: 12,
formatter: (params) => params.formatRes
}
}
],

// 折线图
series: [
{
type: 'line',
data: [1, 2, 3],
smooth: true, // 平滑曲线
lineStyle: {
width: 2,
color: 'red'
}
}
],

// 饼图
series: [
{
type: 'pie',
center: ['50%', '50%'], // 圆心位置
data: [
{ value: 1, name: 'A' },
{ value: 2, name: 'B' },
{ value: 3, name: 'C' }
],
label: {
show: true,
formatter: (params) => params.formatRes
}
}
],

// 坐标轴
xAxis: {
type: 'category',
data: [1, 2, 3],
name: 'X轴',
axisLine: { show: true },
axisTick: { show: true },
axisLabel: { rotate: 45 },
boundaryGap: true // 类目轴两端留白
},
yAxis: {
type: 'value',
name: 'Y轴',
min: 0,
max: 100,
splitLine: { show: true }, // 网格线
axisLine: { show: true },
axisTick: { show: true },
},

// 提示框
tooltip: {
trigger: 'item', // 数据项触发 或 'axis' 坐标轴触发
axisPointer: { type: 'shadow' }, // 柱状图用 shadow, 折线图用 line
formatter: (params) => {
const name = params[0].name // x轴类目名
const value = params[0].value
const seriesName = params[0].seriesName
return `系列: ${seriesName}<br>类型: ${name}<br>值: ${value}`
}
},

// 图例
legend: {
data: ['series.name'],
top: 10,
left: 'center',
orient: 'horizontal', // horizontal / vertical
icon: 'circle'
},

// Grid布局
grid: {
top: 10,
left: 10,
right: 10,
bottom: 10,
containLabel: true // 包含坐标轴标签, 避免被裁剪
}
})

window.addEventListener('resize', () => chart.resize())

chart.dispose()
