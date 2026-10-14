<script setup lang="ts">
import { ref } from 'vue'

const level = ref("")
</script>
<template>
  <div id="main-wrap">
    <noscript>
      <div>您的浏览器未启用 JavaScript, 页面部分交互 (菜单、动效、表单反馈) 将不可用</div>
    </noscript>

    <!-- EmmetDemo: element>element*n[class="className"]{$}+element -->
    <header class="site-header">
      <div class="container header-inner">
        <a href="#home" class="brand">
          <span class="brand-mark">&lt;/&gt;</span>FE·Lab
        </a>
        <nav>
          <ul class="nav-list" id="navList">
            <li><a href="#home" class="nav-link">首页</a></li>
            <li><a href="#semantic" class="nav-link">语义化</a></li>
            <li><a href="#table" class="nav-link">表格</a></li>
            <li><a href="#layout" class="nav-link">布局</a></li>
            <li><a href="#form" class="nav-link">表单</a></li>
            <li><a href="#media" class="nav-link">媒体</a></li>
            <li><a href="#about" class="nav-link">关于</a></li>
          </ul>
        </nav>
        <button class="nav-toggle" id="navToggle" aria-label="打开菜单" aria-expanded="false">☰</button>
      </div>
    </header>

    <button class="back-top" id="backTop" aria-label="返回顶部">↑</button>
    <div class="toast" id="toast"></div>

    <main>
      <!-- HERO 封面 -->
      <section class="hero" id="home">
        <div class="container hero-grid">
          <div>
            <span class="hero-kicker">FRONTEND · LEARNING CASE</span>
            <h1 class="hero-title">把笔记敲成页面, <span class="hl">一份案例</span>串起全部基础</h1>
            <p class="hero-desc">这份页面把语义化标签、表格、表单、媒体、布局、定位/层级与动效全部放进真实结构里。</p>
            <div class="hero-actions">
              <a href="#semantic" class="btn btn-primary">开始拆解</a>
              <button class="btn btn-ghost" id="btnTip">查看敲法要点</button>
            </div>
            <div class="stat-row">
              <div>
                <div class="stat-num">7</div>
                <div class="stat-label">核心 Section</div>
              </div>
              <div>
                <div class="stat-num">12+</div>
                <div class="stat-label">语义化标签</div>
              </div>
              <div>
                <div class="stat-num">3</div>
                <div class="stat-label">布局方式</div>
              </div>
              <div>
                <div class="stat-num">100%</div>
                <div class="stat-label">原生可用</div>
              </div>
            </div>
          </div>

          <div class="hero-art" aria-hidden="true">
            <div class="code-window">
              <div class="code-bar">
                <span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span>
              </div>
              <div class="code-body">
                <span class="code-key">&lt;header&gt;</span> 固定导航 z-120<br>
                &nbsp;&nbsp;<span class="code-tag">&lt;main&gt;</span> 语义化主体<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">&lt;section&gt;</span> 分区<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-tag">&lt;article&gt;</span> 独立内容<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-tag">&lt;aside&gt;</span> 侧栏引用<br>
                &nbsp;&nbsp;<span class="code-key">&lt;table&gt;</span> 数据表<br>
                &nbsp;&nbsp;<span class="code-tag">&lt;form&gt;</span> 表单收集<br>
                <span class="code-key">&lt;footer&gt;</span> 页脚 dl/FAQ
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 01 SEMANTIC 语义化 -->
      <section class="section section-alt" id="semantic">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">01 · SEMANTIC</span>
            <h2 class="section-title"><span class="index">01</span>语义化骨架: 一页看懂标签分工</h2>
            <p class="section-sub">header / nav / main / section / article / aside / footer, 各司其职。</p>
          </div>

          <div class="semantic-grid">
            <article class="article-body">
              <h3>&lt;article&gt; 独立内容块</h3>
              <p>HTML5 语义化标签让页面结构自解释, 利于 SEO。页面结构大概是
                <code>&lt;header&gt;</code> 导航 +
                <code>&lt;main&gt;</code> 主体 +
                <code>&lt;footer&gt;</code>页脚。
              </p>
              <p>主体内用
                <code>&lt;section&gt;</code> 分区, 每一区放一篇
                <code>&lt;article&gt;</code> 承载独立内容, 旁侧用
                <code>&lt;aside&gt;</code> 放补充引用, 内嵌
                <code>&lt;blockquote&gt;</code> 与
                <code>&lt;cite&gt;</code> 标注出处。
              </p>
              <p>文本层用
                <code>&lt;p&gt;</code> 段落、
                <code>&lt;strong&gt;</code> 加粗、
                <code>&lt;ins&gt;</code>下划线、
                <code>&lt;em&gt;</code> 斜体、
                <code>&lt;del&gt;</code> 删除线, 语义明确而非单纯改样式
              </p>
            </article>

            <aside class="aside-quote">
              <blockquote>"语义化不是为了让人看懂, 是为了让机器、搜索引擎和无障碍工具看懂你的页面结构。"</blockquote>
              <cite>-- 前端笔记 · 结构篇</cite>
            </aside>
          </div>
        </div>
      </section>

      <!-- 02 TABLE 表格 -->
      <section class="section" id="table">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">02 · TABLE</span>
            <h2 class="section-title"><span class="index">02</span>数据表格: 四件套结构 + 显式列宽</h2>
            <p class="section-sub">caption 标题、thead 表头、tbody 数据、tfoot 脚标: table-layout:fixed 加每列宽度防折行。</p>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <colgroup>
                <col style="width: 22%;">
                <col style="width: 26%;">
                <col style="width: 34%;">
                <col style="width: 18%;">
              </colgroup>
              <caption>技能掌握度表</caption>
              <thead>
                <tr>
                  <th>技能</th>
                  <th>掌握度</th>
                  <th>代表用法</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>HTML 语义化</td>
                  <td><progress class="progress" max="100" value="90">90%</progress></td>
                  <td>article / aside / footer</td>
                  <td><span class="badge-host">熟练<span class="badge-dot">✓</span></span></td>
                </tr>
                <tr>
                  <td>CSS Flex / Grid</td>
                  <td><progress class="progress" max="100" value="80">80%</progress></td>
                  <td>grid-template-areas</td>
                  <td><span class="badge-host">进阶<span class="badge-dot">✓</span></span></td>
                </tr>
                <tr>
                  <td>SCSS 变量嵌套</td>
                  <td><progress class="progress" max="100" value="65">65%</progress></td>
                  <td>$var / @extend / 嵌套</td>
                  <td><span class="badge-host">学习中<span class="badge-dot">·</span></span></td>
                </tr>
                <tr>
                  <td>Vue 组合式 API</td>
                  <td><progress class="progress" max="100" value="55">55%</progress></td>
                  <td>script setup + 响应式</td>
                  <td><span class="badge-host">入门<span class="badge-dot">·</span></span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">数据示例: 进度条用 &lt;progress&gt;, 状态用 position 绝对定位的徽章实现。</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      <!-- 03 LAYOUT 布局 -->
      <section class="section section-alt" id="layout">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">03 · LAYOUT</span>
            <h2 class="section-title"><span class="index">03</span>布局实验室: Grid 与 Flex 对照</h2>
            <p class="section-sub">Grid 负责二维骨架, Flex 负责一维排布: gap 代替 margin 处理间距。</p>
          </div>

          <div class="layout-grid">
            <div class="demo-card">
              <h3>Grid 模板区域</h3>
              <p class="demo-tip">grid-template-areas: "a b" / "c d"</p>
              <div class="mini-grid">
                <div class="g-item g-header">header</div>
                <div class="g-item g-nav">nav</div>
                <div class="g-item g-main">main</div>
                <div class="g-item g-aside">aside</div>
                <div class="g-item g-footer">footer</div>
              </div>
            </div>

            <div class="demo-card">
              <h3>Flex 一维排布</h3>
              <p class="demo-tip">justify-content · align-items · flex: 1 1 120px</p>
              <div class="mini-flex">
                <div class="f-item">item A</div>
                <div class="f-item f-item-grow">item B · flex: 2</div>
                <div class="f-item">item C</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 04 卡片栅格 -->
      <section class="section" id="cases">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">04 · GRID CARDS</span>
            <h2 class="section-title"><span class="index">04</span>卡片栅格: 一套代码适配三种屏幕</h2>
            <p class="section-sub">列数 3 -> 2 -> 1, 媒体查询切换, 最后一行永远不留单卡。</p>
          </div>

          <div class="case-grid">
            <article class="case-card">
              <h3>语义化标签</h3>
              <p>header、nav、main、section、article、aside、footer 的完整骨架与嵌套规范。</p>
              <span class="case-tag">结构</span>
            </article>
            <article class="case-card">
              <h3>Flex 布局</h3>
              <p>flex-direction、justify-content、align-items、flex 简写与 gap 间距。</p>
              <span class="case-tag">布局</span>
            </article>
            <article class="case-card">
              <h3>Grid 栅格</h3>
              <p>grid-template-areas 命名区域、列行尺寸、fr 单位与响应式切换。</p>
              <span class="case-tag">布局</span>
            </article>
            <article class="case-card">
              <h3>z-index 分层</h3>
              <p>口诀 [底导弹浮通顶], 0-99 ~ 800-999 六档层级各司其职。</p>
              <span class="case-tag">规范</span>
            </article>
            <article class="case-card">
              <h3>SCSS 变量</h3>
              <p>$var变量、嵌套规则、@extend 模板继承 与 color.adjust 调色。</p>
              <span class="case-tag">样式</span>
            </article>
            <article class="case-card">
              <h3>过渡与动画</h3>
              <p>transition 交互过渡、keyframes 关键帧、transform 变换与动效开关。</p>
              <span class="case-tag">动效</span>
            </article>
          </div>
        </div>
      </section>

      <!-- 05 表单 -->
      <section class="section section-alt" id="form">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">05 · FORM</span>
            <h2 class="section-title"><span class="index">05</span>表单收集: 输入类型全演示</h2>
            <p class="section-sub">text / email / tel / radio / checkbox / textarea / select, 加 reset 一键清空。</p>
          </div>

          <div class="form-card">
            <form id="demoForm" novalidate>
              <div class="form-row">
                <div class="form-field">
                  <label for="name">姓名 <span class="req">*</span></label>
                  <input class="input" id="name" name="name" type="text" placeholder="请输入姓名" minlength="2"
                    maxlength="12" required>
                </div>
                <div class="form-field">
                  <label for="email">邮箱 <span class="req">*</span></label>
                  <input class="input" id="email" name="email" type="email" placeholder="you@example.com" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label for="phone">手机号</label>
                  <input class="input" id="phone" name="phone" type="tel" placeholder="请输入 11 位手机号"
                    pattern="^1[3-9]\d{9}$">
                </div>
                <div class="form-field">
                  <label for="level">熟练度</label>
                  <el-select v-model="level" class="select" id="level" name="level" placeholder="请选择">
                    <el-option value="junior">入门</el-option>
                    <el-option value="mid">进阶</el-option>
                    <el-option value="senior">熟练</el-option>
                  </el-select>
                </div>
              </div>

              <!-- 表单域 -->
              <fieldset class="fieldset">
                <legend>前端方向 (radio 单选)</legend>
                <div class="option-row">
                  <label><input type="radio" name="track" value="html"> 结构</label>
                  <label><input type="radio" name="track" value="css"> 样式</label>
                  <label><input type="radio" name="track" value="js" checked> 交互</label>
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend>感兴趣内容 (checkbox 多选)</legend>
                <div class="option-row">
                  <label><input type="checkbox" name="interest" value="vue" checked> Vue</label>
                  <label><input type="checkbox" name="interest" value="scss"> SCSS</label>
                  <label><input type="checkbox" name="interest" value="grid"> Grid</label>
                  <label><input type="checkbox" name="interest" value="anime"> 动效</label>
                </div>
              </fieldset>

              <div class="form-field">
                <label for="msg">留言</label>
                <textarea class="textarea" id="msg" name="msg" cols="30" rows="4" placeholder="写下你想巩固的知识点..."
                  minlength="2" maxlength="200"></textarea>
              </div>

              <div class="form-actions">
                <button class="btn btn-primary" type="submit">提交表单</button>
                <button class="btn btn-reset" type="reset">一键清空</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- 06 媒体 -->
      <section class="section" id="media">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">06 · MEDIA</span>
            <h2 class="section-title"><span class="index">06</span>媒体元素: img / video / audio</h2>
            <p class="section-sub">属性齐全: img 的 alt 与 title, video 的 controls / poster, audio 的 controls / loop。</p>
          </div>

          <div class="media-grid">
            <div class="media-card">
              <h3>视频 video</h3>
              <div class="media-frame">
                <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls muted loop
                  poster="https://www.w3schools.com/html/pic_trulli.jpg">
                  您的浏览器不支持 video 标签。
                </video>
              </div>
            </div>

            <div class="media-card">
              <h3>音频 audio</h3>
              <div class="media-frame">
                <audio src="https://www.w3schools.com/html/horse.mp3" controls loop>
                  您的浏览器不支持 audio 标签。
                </audio>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 07 动效 -->
      <section class="section section-alt" id="motion">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">07 · MOTION</span>
            <h2 class="section-title"><span class="index">07</span>动效演示: 进入动画 + hover 脉冲</h2>
            <p class="section-sub">keyframes 逐帧动画 + 逐项延迟错开: hover 触发 pulse: 尊重 reduced-motion。</p>
          </div>

          <div class="motion-box">
            <div class="motion-item">01</div>
            <div class="motion-item">02</div>
            <div class="motion-item">03</div>
            <div class="motion-item">04</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="site-footer" id="about">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>关于本案例</h4>
            <p>一个自包含的 HTML 页面, 用于串联前端基础笔记。源码内嵌注释标注了每个知识点对应的写法, 适合对照逐段敲一遍。</p>
            <dl class="foot-dl">
              <dt>联系方式</dt>
              <dd>Email · you@example.com</dd>
              <dd>GitHub · @yourname</dd>
              <dt>技术栈</dt>
              <dd>原生 HTML5 / CSS3 / 少量 JS</dd>
            </dl>
          </div>

          <div class="footer-col">
            <h4>学习 FAQ (details 折叠)</h4>
            <div class="faq">
              <details>
                <summary>这份页面要背下来吗?</summary>
                <div class="content">不用背, 理解结构分层后按需取用: 先套大骨架, 再逐段填充内容与样式。</div>
              </details>
              <details open>
                <summary>如何把它改成 Vue 页面?</summary>
                <div class="content">把每个 section 拆成 vue 组件, <code>&lt;style scoped&gt;</code> 里的选择器直接用即可, 命名规范不变。</div>
              </details>
              <details>
                <summary>图片一定要内联吗?</summary>
                <div class="content">生产环境用外部资源, 学习阶段用占位即可: img 的 alt 必须保留, 保证失败时有替代文本。</div>
              </details>
            </div>
          </div>

          <div class="footer-col">
            <h4>学习进度</h4>
            <p class="foot-progress-tip">已覆盖笔记要点</p>
            <progress class="progress" max="100" value="80">80%</progress>
            <p class="foot-progress-note">继续: Vue 组件化、路由、工程化构建</p>
            <div class="foot-badge-row">
              <span class="badge-host">
                <span class="badge-label">完成状态</span>
                <span class="badge-dot">80</span>
              </span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 FE·Lab · 一份页面敲通全部基础</span>
          <span>原生 HTML · 自包含 · 可直接打开</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
/* 变量 */
$font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
$color-bg: #f5f7f6;
$color-surface: #ffffff;
$color-ink: #1f2329;
$color-muted: #5a6573;
$color-line: #e3e8e6;
$color-accent: #0e9384;
$color-accent-deep: #0a6f63;
$color-accent-soft: #e4f5f2;
$color-warn: #d97757;
$radius: 10px;
$shadow: 0 8px 24px rgba(15, 40, 36, 0.08);

// calc() 跨单位计算
/* z-index 规范
层级范围	   用途
0 ~ 99	  页面内部的基础层级
100 ~ 199	固定导航、头部（Header）
200 ~ 299	下拉菜单、弹出层
300 ~ 499	模态框（Model/Dialog）
500 ~ 799	通知、消息（Message/Notification）
800 ~ 999	顶层覆盖（Backdrop/Mask）
Tip: 底导弹浮通顶 */

@font-face {
  font-family: "MyFont";
  src: url("path") format("filetype"); // woff2 woff truetype(ttf) opentype(otf)
  font-display: swap;
}

/* 基础 */
#main-wrap {
  font-family: $font-family;
  color: $color-ink;
  background-color: $color-bg;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  // 开启字体抗锯齿, 让字体更加顺滑
  // font-family: "MyFont";
  // backgrund-image background-size background-position
}

.container {
  width: min(1100px, 92vw);
  margin-inline: auto;
}

img,
video,
audio {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

/* 导航 */
.site-header {
  position: sticky;
  z-index: 120;
  top: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $color-line;

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  .brand {
    font-weight: 900;
    font-size: 1.15rem;
    letter-spacing: 0.5px;
    color: #000;

    .brand-mark {
      color: $color-accent;
      display: inline-block;
      margin-right: 10px;
    }
  }

  .nav-list {
    display: flex;
    gap: 8px;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;

    .nav-link {
      display: inline-block;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.92rem;
      color: $color-muted;
      transition: color 0.25s, background 0.25s;
    }

    .nav-link:hover {
      color: $color-accent-deep;
      background: $color-accent-soft;
    }

    .nav-link-active {
      color: $color-accent-deep;
      font-weight: 700;
      background: $color-accent-soft;
    }
  }

  .nav-toggle {
    display: none;
    font-size: 1.5rem;
    color: $color-ink;
    background: none;
    border: none;
    cursor: pointer;
  }
}

/* 首屏 */
.hero {
  padding: 72px 0 56px;

  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 40px;
    align-items: center;
    // grid-template-columns: repeat(auto-fit / auto-fill, minmax(100px, 1fr))
  }

  .hero-kicker {
    color: $color-accent-deep;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 2px;
  }

  .hero-title {
    font-size: clamp(1.8rem, 4vw, 2.9rem);
    font-weight: 900;
    line-height: 1.25;
    margin: 12px 0 16px;

    .hl {
      color: $color-accent;
    }
  }

  .hero-desc {
    color: $color-muted;
    max-width: 34rem;
    margin-bottom: 28px;
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .stat-row {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
    margin-top: 36px;

    .stat-num {
      font-size: 1.6rem;
      font-weight: 900;
      color: $color-accent-deep;
    }

    .stat-label {
      font-size: 0.85rem;
      color: $color-muted;
    }
  }

  .hero-art {
    display: flex;
    justify-content: center;
  }

  .code-window {
    width: 100%;
    max-width: 420px;
    background: #0d2220;
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(15, 40, 36, 0.25);
    overflow: hidden;
    // overflow-x overflow-y overflow-wrap: break-word; text-overflow: "...";
    transform: rotate(1.5deg);
    transition: transform 0.4s;

    .code-bar {
      display: flex;
      gap: 6px;
      padding: 12px 16px;
      background: #12322f;

      .code-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;

        &:nth-child(1) {
          background: #e5675b;
        }

        &:nth-child(2) {
          background: #e8b647;
        }

        &:nth-child(3) {
          background: #3dbb8f;
        }
      }
    }

    .code-body {
      padding: 18px 20px;
      font-family: Consolas, monospace;
      font-size: 0.82rem;
      color: #bfe3dd;
      line-height: 1.9;

      .code-key {
        color: #67d8c4;
      }

      .code-tag {
        color: #f0c674;
      }
    }

    &:hover {
      transform: rotate(0) scale(1.02);
    }
  }
}

/* 通用 Section */
.section {
  padding: 64px 0;
}

.section-alt {
  background: $color-surface;
  border-block: 1px solid $color-line;
  // border-block -> 控制上下边框 border-inline -> 控制左右边框
}

.section-head {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.7rem;
  font-weight: 900;

  .index {
    color: $color-accent;
    margin-right: 8px;
  }
}

.section-sub {
  color: $color-muted;
  margin-top: 6px;
}

.eyebrow {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: $color-accent-deep;
  background: $color-accent-soft;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
}

/* 语义化 */
.semantic-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;

  .article-body {
    background: $color-surface;
    border: 1px solid $color-line;
    border-radius: $radius;
    padding: 28px;

    h3 {
      margin-bottom: 12px;
      font-size: 1.15rem;
    }

    p {
      color: $color-muted;
      margin-bottom: 12px;

      code {
        background: $color-accent-soft;
        color: $color-accent-deep;
        padding: 2px 7px;
        border-radius: 6px;
        font-family: Consolas, monospace;
        font-size: 0.88em;
      }
    }
  }
}

.aside-quote {
  background: $color-accent-soft;
  border-left: 4px solid $color-accent;
  border-radius: $radius;
  padding: 22px 24px;

  blockquote {
    font-style: italic;
    color: $color-accent-deep;
    margin-bottom: 8px;
  }

  cite {
    font-size: 0.85rem;
    color: $color-muted;
    font-style: normal;
  }
}

/* 表格 */
.table-wrap {
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse; // 合并表格单元格边框
  table-layout: fixed; // 固定单元格宽度, 不再由内容撑开
  min-width: 560px;

  caption {
    padding: 14px 20px;
    text-align: left;
    font-weight: 900;
    font-size: 1.02rem;
    color: $color-ink;
    caption-side: top;
  }

  th,
  td {
    padding: 13px 20px;
    text-align: left;
    border-bottom: 1px solid $color-line;
    font-size: 0.93rem;
  }

  thead th {
    background: $color-accent-soft;
    color: $color-accent-deep;
    font-weight: 700;
  }

  tbody tr:hover {
    background: #fafcfb;
  }

  tfoot td {
    background: #f7faf9;
    color: $color-muted;
    font-size: 0.86rem;
  }
}

/* 进度条 */
.progress {
  display: block;
  width: 100%;
  height: 8px;
  appearance: none; // 清除浏览器原生外观
  border-radius: 999px;
  overflow: hidden;
  background: $color-line;

  &::-webkit-progress-bar {
    background: $color-line;
  }

  &::-moz-progress-bar {
    background: $color-accent;
    border-radius: 999px;
  }

  &::-webkit-progress-value {
    background: linear-gradient(90deg, $color-accent, #4fc3b2);
    border-radius: 999px;
  }
}

/* 徽章 */
.badge-host {
  position: relative;
  display: inline-block;
}

.badge-dot {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: $color-warn;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 999px;
  display: grid;
  place-items: center;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.btn-primary {
  background: $color-accent;
  color: #fff;
  box-shadow: $shadow;

  &:hover {
    background: $color-accent-deep;
  }
}

.btn-ghost {
  background: $color-surface;
  color: $color-accent-deep;
  border: 1px solid $color-accent;

  &:hover {
    background: $color-accent-soft;
  }
}

.btn-reset {
  background: $color-line;
  color: $color-ink;

  &:hover {
    background: #d4dcd9;
    transform: none;
  }
}

/* 布局实验室 */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.demo-card {
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius;
  padding: 22px;

  h3 {
    font-size: 1.02rem;
    margin-bottom: 4px;
  }

  .demo-tip {
    font-size: 0.8rem;
    color: $color-muted;
    margin-bottom: 16px;
    font-family: Consolas, monospace;
  }
}

.mini-grid {
  display: grid;
  grid-template-areas:
    "gheader gheader"
    "gnav    gmain"
    "gnav    gaside"
    "gfooter gfooter";
  grid-template-columns: 90px 1fr;
  grid-template-rows: 40px 1fr 1fr 40px;
  gap: 8px;
  height: 260px;
  font-size: 0.82rem;
  font-weight: 700;

  .g-item {
    border-radius: 8px;
    display: grid;
    place-items: center; // 将内容放在水平居中且垂直居中
    color: #fff;
  }

  .g-header {
    grid-area: gheader;
    background: $color-accent;
  }

  .g-nav {
    grid-area: gnav;
    background: $color-accent-deep;
  }

  .g-main {
    grid-area: gmain;
    background: #4fc3b2;
  }

  .g-aside {
    grid-area: gaside;
    background: #7fd0c2;
    color: $color-accent-deep;
  }

  .g-footer {
    grid-area: gfooter;
    background: #12322f;
  }
}

.mini-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: #fafcfb;
  border-radius: 8px;
  min-height: 120px;

  .f-item {
    flex: 1 1 120px;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    background: $color-accent-soft;
    color: $color-accent-deep;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .f-item-grow {
    flex: 2 1 140px;
    background: $color-accent;
    color: #fff;
  }
}

/* 卡片栅格 */
.case-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.case-card {
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius;
  padding: 24px;
  transition: transform 0.3s, box-shadow 0.3s;

  h3 {
    font-size: 1.05rem;
    margin-bottom: 6px;
  }

  p {
    font-size: 0.9rem;
    color: $color-muted;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: $shadow;
  }
}

.case-tag {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.76rem;
  font-weight: 700;
  color: $color-accent-deep;
  background: $color-accent-soft;
  padding: 3px 10px;
  border-radius: 999px;
}

/* 表单 */
.form-card {
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius;
  padding: 30px;
  max-width: 640px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    margin-bottom: 6px;

    .req {
      color: $color-warn;
    }
  }
}

.input,
.select,
.textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid $color-line;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  background: #fbfcfb;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: $color-accent;
    box-shadow: 0 0 0 3px $color-accent-soft;
  }
}

.textarea {
  resize: none;
  min-height: 110px;
}

.fieldset {
  border: 1px solid $color-line;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;

  legend {
    font-size: 0.88rem;
    font-weight: 700;
    padding: 0 6px;
    color: $color-accent-deep;
  }
}

.option-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 0.92rem;

  label {
    display: inline-flex; // 父级盒子有行内特性, 不独占整行
    align-items: center;
    gap: 6px;
    font-weight: 400;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

/* 媒体 */
.media-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.media-card {
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius;
  padding: 18px;

  h3 {
    font-size: 1rem;
    margin-bottom: 12px;
  }
}

.media-frame {
  border-radius: 8px;
  overflow: hidden;
  background: #0d2220;

  img,
  video {
    width: 100%;
    object-fit: cover;
    object-position: center;
  }

  audio {
    width: 100%;
    padding: 8px 0;
  }
}

/* 动效 */
@keyframes floatIn {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

.motion-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.motion-item {
  background: $color-accent;
  color: #fff;
  border-radius: 10px;
  height: 110px;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 1.4rem;
  animation: floatIn 0.7s ease both; // infinite

  &:nth-child(1) {
    animation-delay: 0s;
    background: $color-accent-deep;
  }

  &:nth-child(2) {
    animation-delay: 0.12s;
  }

  &:nth-child(3) {
    animation-delay: 0.24s;
    background: #4fc3b2;
    color: $color-accent-deep;
  }

  &:nth-child(4) {
    animation-delay: 0.36s;
    background: #7fd0c2;
    color: $color-accent-deep;
  }

  &:hover {
    animation: pulse 1s infinite;
  }
}

/* 页脚 */
.site-footer {
  background: #0d2220;
  color: #cfe6e2;
  padding: 48px 0 28px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 32px;
}

.footer-col {
  h4 {
    color: #fff;
    font-size: 1rem;
    margin-bottom: 14px;
  }

  p {
    font-size: 0.9rem;
    opacity: 0.85;
  }
}

.foot-dl {
  dd {
    font-size: 0.9rem;
    opacity: 0.85;
    margin-bottom: 6px;
  }

  dt {
    font-size: 0.78rem;
    font-weight: 700;
    color: #7fd0c2;
    margin-top: 10px;
  }
}

.foot-progress-tip {
  margin-bottom: 8px;
}

.foot-progress-note {
  font-size: 0.85rem;
  margin-top: 10px;
  opacity: 0.8;
}

.foot-badge-row {
  margin-top: 14px;
}

.badge-label {
  color: #fff;
  font-size: 0.9rem;
}

.faq {
  details {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.04);
  }

  summary {
    list-style: none;
    display: block;
    cursor: pointer;
    font-weight: 700;
    color: #fff;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: "+";
      float: right;
      color: #7fd0c2;
      font-weight: 900;
      transition: transform 0.25s;
    }
  }

  details[open] summary::after {
    transform: rotate(45deg);
  }

  .content {
    font-size: 0.88rem;
    opacity: 0.85;
    padding-top: 10px;
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  margin-top: 36px;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.85rem;
  opacity: 0.7;
}

/* 轻提示 */
.toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%) translateY(20px);
  z-index: 600;
  background: #0d2220;
  color: #fff;
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 0.9rem;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.3s, transform 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.toast-show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 回顶按钮 */
.back-top {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 900;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: $color-accent;
  color: #fff;
  font-size: 1.3rem;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: $shadow;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.3s;

  &:hover {
    transform: translateY(-3px);
  }
}

.back-top-show {
  opacity: 1;
  pointer-events: auto;
}

/* 响应式 */
@media (max-width: 900px) {

  .hero .hero-grid,
  .layout-grid,
  .media-grid {
    grid-template-columns: 1fr;
  }

  .semantic-grid {
    grid-template-columns: 1fr;
  }

  .case-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }

  .motion-box {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .nav-list {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    z-index: 250;
    flex-direction: column;
    align-items: stretch;
    background: $color-surface;
    border-bottom: 1px solid $color-line;
    padding: 12px 16px;
    display: none;
  }

  .nav-list-open {
    display: flex;
  }

  .nav-toggle {
    display: block;
  }

  .case-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .stat-row {
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .nav-link {
    font-size: 1rem;
  }

  .section-sub,
  .demo-tip,
  .article-body p,
  .case-card p,
  .data-table th,
  .data-table td {
    font-size: 1rem;
  }

  .input,
  .select,
  .textarea {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }

  html {
    scroll-behavior: auto;
  }
}

/* noscript */
noscript {
  display: block;
  text-align: center;
  padding: 14px;
  background: #fdecea;
  color: #b3261e;
  font-weight: 700;
}
</style>
