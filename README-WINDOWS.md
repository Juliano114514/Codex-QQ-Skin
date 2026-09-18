# ChatGPT QQ Skin for Windows 2.6.3

Windows 10/11 x64 原生 C# GUI 版本。安装器提供“一键安装并启动”“上传图片生成皮肤”“应用内置大黄蜂皮肤”“应用内置霓虹雨夜皮肤”和“安装 Codex 深度皮肤助手”入口，并内置运行引擎与 Node.js，无需用户另外安装依赖。

项目不会修改官方 ChatGPT/Codex 安装目录、`app.asar`、API Key 或 Base URL。皮肤通过仅监听 `127.0.0.1` 的 Chromium DevTools Protocol 注入。

## 下载

从 [GitHub Releases](https://github.com/zhulin025/Codex-QQ-Skin/releases) 下载：

```text
ChatGPT QQ Skin Setup 2.6.3.exe
ChatGPT QQ Skin Setup 2.6.3.exe.sha256
```

当前 EXE 尚未使用商业代码签名，Windows SmartScreen 可能在首次运行时显示提示。请只从本项目正式 Release 下载，并核对 SHA-256。

## 系统要求

- Windows 10/11 x64。
- 已安装 Microsoft Store/MSIX 或普通安装版 ChatGPT/Codex 桌面客户端。
- 官方客户端至少成功启动过一次。
- 建议安装前保存正在进行的任务；安装器可能需要重新启动 ChatGPT。

## 安装与使用

### 当前源码兼容修复（Codex 26.908.9136.0）

源码已适配新版 CSS Modules 主面板、输入框和右侧资料面板，并修复 QQ
模式文字对比度。此修复尚未打包到上述 2.6.3 Release EXE；请从本项目运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\install-qq-skin-windows.ps1 -Force -NoLaunch
```

`-Force` 允许用修复后的源码替换同版本引擎，仍禁止降级覆盖较新版本。
`-NoLaunch` 只安装，不关闭当前 Codex。保存当前工作后，双击桌面的
`ChatGPT QQ Skin.cmd`；该入口会按需重启 Codex、开启本机调试端口并加载皮肤。
以后也使用此入口启动；直接打开官方 Codex 图标不保证加载皮肤。
右上角选择 `浅色` 保留经典蓝银皮肤，选择 `深色` 切换为手机 QQ
2008–2010 风格的藏蓝底、青蓝选中条与渐变工具栏；选择 `原生` 可即时恢复
原生外观。顶部固定为 `原生 / 浅色 / 深色 / 更多`，点击 `更多` 展开爱奇艺、
抖音、快手、腾讯视频、优酷和芒果 TV 六组平台深色配色；更多菜单不再展示大黄蜂与霓虹雨夜自定义皮肤。
菜单展示色块和当前选中项，支持方向键、Home/End、Enter、Esc 和外部点击关闭。
最近选择保存在本机，重新启动皮肤引擎后继续使用。

浅色配置在 `assets/theme.json`，深色配置在 `assets/theme-dark.json`。
`assets/qq-skin.css` 保留原有布局和浅色样式，`assets/qq-dark.css` 仅覆盖深色模式。
QQ 深色属于内置 QQ 模式，不会替换用户的自定义皮肤。此功能随源码引擎安装，
尚未包含在上方链接的 2.6.3 Release EXE 中。

爱奇艺主题配置在 `assets/theme-iqiyi.json`，其他平台配置在 `assets/themes-media.json`，
共用配色覆盖 `assets/qq-media.css`。
配色参考爱奇艺 WebApp 的 `src/index.scss`：`#111214` 页面底色、`#14161a`
浮层、`#1e2126` 次级表面、`#00CC4C` 主色及 `#07f758` 高亮，并参考其按钮
`#00A8E6 → #00B84D` 渐变。复用现有深色框架与 `qq-ui.css` 的布局、字号、
间距和交互；爱奇艺 WebApp 源码仅用于参考，不作为运行时依赖。
其他平台参考 2026-09-18 官网可见界面，具体采样与设计调整见
[2026 平台配色依据](docs/media-palettes-2026.md)。这些是面向 Codex 阅读界面调整的
主题方案，不是各平台官方发布的完整设计规范。

本次在上述 Codex 版本实际检查了首页、任务页和注入验证；未重新构建 GUI
安装器，也未验证关闭应用后重新启动的完整链路。

### Release 安装器

1. 双击 `ChatGPT QQ Skin Setup 2.6.3.exe`。
2. 点击“一键安装并启动”。安装器会安装或升级引擎、启动 ChatGPT、注入并验证皮肤。
3. 点击“应用内置大黄蜂皮肤”或“应用内置霓虹雨夜皮肤”，可从安装器离线预设中直接安装并切换；它们也会进入自定义皮肤库。
4. 深度皮肤助手区域会明确显示“安装”“更新”或“已安装”；按提示完成后，在 Codex 输入一句主题关键词即可生成完整分层皮肤。
5. 点击“上传图片生成皮肤”，仍可选择 PNG、JPEG 或 WebP 图片生成单背景自定义皮肤。
6. ChatGPT 右上角可在 `原版 / 浅色 / 深色` 三种模式间即时切换。

图片分析完全在本机完成，不会上传用户图片。支持最大 16 MB、单边不超过 16384 像素且总像素不超过 5000 万的 PNG、JPEG 和 WebP。

## 个人资料与本机统计

QQ 模式右侧的“个人资料”显示昵称、头像、状态、签名和本机 Token 统计，与保留原生内容的“chat详情”并列。两个窗口可以分别收起，整列支持滚动。等级按历史总 Token（含缓存）计算，每 0.25B 升一级，从 Lv.0 起算。

点击齿轮或底栏昵称编辑个人资料；点击头像选择经典头像，40px 与底栏 16px 版本配对切换。底栏签名支持点击编辑，Enter/失焦保存，Escape 取消。资料保存在本机皮肤设置，不修改 Codex 账号。

统计只读取当前 Windows 用户目录下的 Codex 本地 session 日志，增量缓存保存在 `%APPDATA%\CodexQQSkin\usage`。开启“净用量”可在统计展示中排除缓存，等级计算口径不变。不需要额外登录，不读取 API Key，也不会上传 prompt 或 token 数据。统计是本机口径，不是 OpenAI 官方账单或账号云端等级。

## 2.6.3 更新

- 修复霓虹雨夜主题下用户菜单与设置页对比度问题；设置页回退 Codex 原生浅色样式。
- 雨夜音效开关移到右上角皮肤切换旁；安装器更新下载支持「取消下载」。

## 2.6.2 更新

- 新增内置深度皮肤「霓虹雨夜 · Storm Codex」，安装器提供一键应用入口；预设离线打包并自动加入皮肤库。
- 雨夜主题按任务状态切换疏雨 / 霓虹雨 / 闪电风暴，并对天气层做了限帧与降粒子等性能优化。

## 2.6.1 更新

- 适配 Codex Desktop 首页新增的 `home-banners` 结构，修复 QQ / 自定义皮肤下「新建任务」面板空白。
- 修复切换到原生皮肤或 reinject 时 QQ 企鹅头像残留的问题。
- 旧版无 banners 的 Codex 仍走原来的首页注入路径。

## 2.6.0 更新

- Codex 伙伴升级为交互式桌面房间，电脑、书架、台灯和盆栽统一打开 GitHub 热门项目盲盒。
- 盲盒展示热门仓库名称与中文简介，并提供收藏、打开 GitHub、换一本和减少同类推荐。
- 连续发现 5 个项目会解锁一件房间摆件；收藏、偏好和进度只保存在本机。
- 盲盒按钮使用独立指针事件绑定，修复 Electron 中点击无响应的问题。

## 2.5.2 更新

- 修复超宽 Windows 窗口中对话列延伸到右侧栏下方的问题。
- Windows 安装器新增大黄蜂内置皮肤入口；预设随 EXE 离线打包、安装时自动入库并可一键应用。

## 2.5.1 更新

- 修复皮肤模式切换按钮偶发无响应。
- QQ / 原生模式不再错误选中上次使用的自定义皮肤，Codex 与安装器皮肤库选中态保持一致。
- 深度自定义皮肤现在可以从标题栏正常切换。

## 2.5.0 更新

- 自动更新改为严格的版本号比较：只有服务器版本高于本地版本才更新；版本相同不重复更新，本地版本更高时禁止降级。
- 自动更新会核对目标资源名、SHA-256、下载文件版本；macOS 还会校验应用签名并在替换失败时恢复备份。
- 安装器新增 Codex 深度皮肤助手状态区域：未安装可一键安装、内置新版可更新、已是当前版本时仍明确显示“已安装”和一句话用法。
- 新增安全的 V2 分层主题和 `.codexskin` 导入导出能力，同时兼容旧版单背景主题。
- 大黄蜂主题迁移为通用 V2 预设，Windows 与 macOS 共用渲染协议。

## 2.2.1 更新

- 版本号对齐 macOS 2.2.1。
- 共享注入引擎：自定义背景模糊相关改动。
- 继续包含 2.1.x：语言参数、中文调试提示、窗口拖动与空数组启动误报等修复。

## 2.1 功能

- 原生 WinForms 安装器与 macOS 版相同的应用图标。
- 支持普通 EXE 和 Microsoft Store/MSIX 版 ChatGPT。
- QQ 2007 风格标题栏、工具栏、项目导航、三栏任务布局和伙伴面板。
- Windows 专属标题栏和设置页布局适配。
- 自定义图片作为窗口级 `cover` 背景，连续覆盖新建任务、任务详情和左侧栏。
- 安装成功状态直接反馈到 GUI，不等待常驻注入器退出。
- 升级时安全校验并停止旧注入器，随后重试替换引擎目录。

## 数据位置

- 引擎：`%LOCALAPPDATA%\CodexQQSkin\engine`
- 主题、日志和状态：`%APPDATA%\CodexQQSkin`
- 桌面启动入口：`ChatGPT QQ Skin.cmd`

## 手动入口

完整源码包仍提供以下脚本：

- `Start Codex QQ Skin Windows.cmd`
- `Customize Codex QQ Skin Windows.cmd`
- `Verify Codex QQ Skin Windows.cmd`
- `Restore Codex QQ Skin Windows.cmd`

如果自动检测不到普通 EXE 安装版，可以在 PowerShell 中设置：

```powershell
$env:CODEX_EXE = 'C:\完整路径\ChatGPT.exe'
.\scripts\windows\install-qq-skin-windows.ps1
```

## 构建

需要 **Windows 10/11** 或 GitHub Actions `windows-2022`。macOS 无法直接生成本安装器 `.exe`。

```powershell
.\scripts\windows\build-gui-installer.ps1 -UseInstalledNode -OutputFileName 'ChatGPT QQ Skin Setup 2.6.3.exe'
```

不使用 `-UseInstalledNode` 时，构建脚本会下载官方 Node.js 运行时并校验 SHA-256。输出文件保存在 `release` 目录。

发布时也可在仓库 Actions 中运行 `Publish release assets`，输入已有 draft tag（如 `v2.6.3`），由 CI 构建并上传 EXE。

## 安全说明

- CDP 只绑定 `127.0.0.1`。
- WebSocket 目标必须是本机指定端口下的 `app://` 页面。
- 停止旧注入器前会核验 PID、可执行文件、脚本路径和端口。
- 不修改或重新签名官方 ChatGPT/Codex 文件。
