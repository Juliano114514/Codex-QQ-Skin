# AI 娘 QQ 秀

右侧「详细信息」栏按摘要、上班状态、个人资料、QQ 秀排列。QQ 秀卡片可以独立收起，不改动工资、打卡和个人资料的数据。

展示框使用 LLM-show 的 classic v2 分层资源：140×226 原生画布、透明部件、发型前后两层、按 z 顺序合成。支持场景与部件 GIF；前景闪光沿用原项目导出的 8 阶段透明度循环，每轮 1.92 秒。减少动态时，场景回退静态 PNG，闪光保持静态。人物本体沿用原静态分层，像素资源不裁切、不施加主题滤镜。

QQ 秀在左，设置栏在右，设置项独立垂直滚动。首项为「角色」；场景及部件选项仅显示所属角色名，如 ChatGPT、DeepSeek、Claude。保留混搭、还原、本机保存与同源窗口同步，存储键为 `codex-qq-skin-qqshow-v1`。

外框、标题、文字、按钮和下拉列表沿用当前皮肤的变量。经典 QQ、七套平台配色及浅深外观保持一致的布局；XP、98、千禧年机箱、皮革手账、Aero、Matrix、拟态主题分别适配展示框材质。原生模式及设置页沿用现有侧栏的隐藏和清理规则。

## 本地导入

在仓库根目录执行：

```powershell
node scripts/qqshow-assets.mjs --import "D:/LLM-show/LLM-chan-asset/public/assets-classic"
node scripts/injector.mjs --check-payload --theme-dir presets/preset-classic-codex
```

导入器只读取原项目，不修改其资源；校验清单、PNG/GIF 格式、尺寸与资源路径后，将运行时部件、场景及原 `ATTRIBUTION.md` 整理为 `assets/qqshow.local.json`。无需 React、Vite 或新增依赖。重新加载皮肤即可使用；已有注入器可监听资源包变化。原资源更新后再次导入。

本地安装器会随 assets 目录复制该文件。没有资源包时只显示导入提示；资源包损坏时记录告警并降级，不阻断已有个人资料与工资功能。

## 来源

美术来自用户提供的 LLM-show / LLM-chan-asset classic v2。参考角色设计署名及具体来源保存在导入包内的 `attribution` 字段，原始说明见 LLM-show 的 `LLM-chan-asset/ATTRIBUTION.md` 与 `COMPLIANCE.md`。此接入不改变原有素材许可。生成的本地资源包已加入 Git 忽略，未将图像纳入源码发布。
