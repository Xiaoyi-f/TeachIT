# playwright是python圈的一个浏览器自动化工具,可以使用代码控制浏览器实现爬虫、自动化操作、截图/生成PDF等 

# Playwright 微软 稳定、反爬强、多浏览器、自动等待
# Selenium 开源社区老牌生态庞大，配置繁琐，容易被识别爬虫

# pip install playwright 
# playwright install --help   
# playwright install <浏览器> --> 默认支持无头模式 
# python -m playwright install --list
# python -m playwright uninstall --all

# Playwright
#   └── Browser（浏览器实例）
#         └── Context（浏览器上下文 = 一个隔离的会话，有独立Cookie/Storage）
#               └── Page（一个标签页 = 一个网页）

from playwright.sync_api import sync_playwright 
from playwright.async_api import async_playwright 

# async await 
with ...() as pw:
  browser = pw.chromium.launch(headless=False, slow_mo=500) # 关闭无头模式 每步操作间隔500ms
  page = browser.new_page() 
  page.goto("https://www.baidu.com")

  # 监听即将弹出的新窗口
  with page.expect_popup() as popup_info:
      # 点击会新开标签页的链接
      page.get_text("百度热搜").click()

  # 取出新页面
  new_page = popup_info.value
  print("新页面地址：", new_page.url)
  print("新页面标题：", new_page.title())

  new_page.pause()
  browser.close()

# 文本选择器 
page.click("text=文本") 
page.click("button:has-text('文本')", force=True) # 强势点击,解决元素被遮挡问题 

# css选择器
page.click("css选择器")
page.fill("css选择器", "文本") # input / textarea 

# page.fill 失败时候 备选方案
page.click("css选择器")
page.keyboard.type("文本")

# 上传文件
page.set_input_files("css选择器", "文件路径")

page.inner_text("css选择器") # 获取元素文本
page.get_attribute("css选择器", "属性名") # 获取元素属性
page.query_selector("css选择器") # 获取一个元素
page.query_selector_all("css选择器") # 获取多个元素
page.wait_for_selector("css选择器") # 等待元素加载
page.screenshot(path="图片保存路径", full_page=True) # 截图 
page.content() # 获取页面源代码

input("按回车键继续...") # 常用来暂停代码运行等待人工介入后继续

page.pause() # 会冻结当前页面运行，自动唤起 Playwright Inspector 调试面板

page.on("filechooser", lambda fc: fc.set_files("path")) # 监听页面文件上传弹窗事件，弹窗弹出瞬间，自动给上传框填入本地文件路径，实现自动化文件上传，替代手动点击选择文件

# 永远不要使用time.sleep() 
page.wait_for_selector("css选择器", timeout=5000, state="hidden") # 设置等待最久时长 ms 设置等待元素消失 
page.goto("url", wait_until="networkidle") # 等网络请求完成 稳定 

# cookie & 登录态管理 
context = browser.new_context()
page = context.new_page()
page.goto("https://www.baidu.com")
# 登录操作 

cookies = context.cookies() # 获取cookie列表 
# 将cookies记录到本地json文件中 

context.add_cookies(cookies) # 设置cookies 之后前往对应网页无需登录 

context.storage_state(path="browser_state.json") # 强效果
context = browser.new_context(storage_state="browser_state.json")

# 进入页面时候注入JS脚本配置浏览器,尽量绕过爬虫检测
page.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN','zh','en'] });
    window.chrome = { runtime: {} };
""")

# 人类行为模拟 
import time, random  
# 1.随机延迟
def random_delay(min_s=0.2, max_s=1.5):
  time.sleep(random.uniform(min_s, max_s))

# 2.模拟人类逐字输入 
def human_type(page, selector, text):
  page.click(selector) 
  for char in text:
    page.keyboard.type(char) 
    random_delay()


