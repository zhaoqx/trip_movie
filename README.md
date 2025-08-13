# trip_movie - 黑龙江互动分支旅行 Demo

一个可在微信中打开的 9:16 H5 互动体验 Demo：观看开场 → 19 秒出现选择 → 进入极地馆或东北虎林园分支 → 汇合结尾。  
支持：分段视频、字幕(SRT)、埋点、重播/切换分支、Service Worker、（可扩展）微信分享。

## 功能特性
- Intro / Branch / Outro 分段视频加载与切换
- 交互选择（极地馆 / 东北虎林园）按钮
- 动态 SRT 字幕解析与显示
- 简易埋点（console，可扩展 sendBeacon）
- Service Worker 缓存首段
- 竖屏适配、字幕安全区域、按钮模糊玻璃风格
- GitHub Pages 自动部署（工作流见 `.github/workflows/pages.yml`）

## 快速开始
```bash
git clone git@github.com:zhaoqx/trip_movie.git
cd trip_movie
# 安装可选本地静态服务器
npm install
npm run dev   # 等价 npx serve . （package.json 已内置）
# 或 python3 -m http.server 5173
```
访问 http://localhost:3000 或 5173（视工具而定）。

## 局域网手机预览
1. 电脑与手机同一 Wi-Fi  
2. 查看电脑 IP，例如 192.168.1.8  
3. 手机浏览器 / 微信内访问 http://192.168.1.8:3000  

## 目录说明
```
.
├── index.html
├── sw.js
├── src/
│   ├── style.css
│   ├── main.js
│   ├── subtitle-loader.js
│   ├── metrics.js
│   └── wechat-share.js
├── assets/
│   ├── video/ (intro.mp4, branch_polar.mp4, branch_tiger.mp4, outro.mp4 占位)
│   ├── subtitles/ (各段 srt)
│   └── img/ (封面、logo、loading.svg)
├── scripts/
│   └── ffmpeg_concat_examples.md
├── license/
│   └── SOURCES_TEMPLATE.md
├── .github/workflows/pages.yml
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

## 配置出现选择时间
`src/main.js` 中 `introChoiceTime = 19`（单位秒）。

## 替换视频与字幕
- 把你的 mp4 放在 `assets/video/`，保持 1080x1920, H.264, 4~8 Mbps。
- 修改 `FILES` 映射（如需更多分支）。
- 字幕：将 SRT 中的时间按各分段文件内部时间，从 00:00:00 开始。

## GitHub Pages 部署
1. Push 代码  
2. Workflow 会自动构建并部署（静态直接复制）  
3. 成功后访问 `https://zhaoqx.github.io/trip_movie/`

## 微信内注意
- iOS 可能需要首次用户点击才允许 autoplay
- 如果要用微信 JS-SDK 自定义分享：需备案域名 / 公众号配置 JS 安全域名 / 后端签名

## 扩展路线 (见 ROADMAP Issue 或参考下方 TODO)
- JSON 描述的多层分支
- 双语字幕与语言切换按钮
- p5.js / Three.js 粒子文字开场
- HLS 切片 + 自适应码率
- 小程序版本（WXML/WXSS/JS）
- 后端埋点（用户分支选择统计）
- 素材授权校验脚本

## 开源许可
MIT (见 LICENSE)。

## 致谢
示例脚本与结构基于对哈尔滨/黑龙江四季与科普/生态场景的抽象，不包含实际素材。素材替换时请确保版权合规。