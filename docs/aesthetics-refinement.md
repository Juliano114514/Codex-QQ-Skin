# 美学主题细化 · 2026-10-23

在当前设计基础上修改新拟物、蓝天白云、Aero、Matrix 和皮革手账。
千禧年机箱仅按后续要求补充聊天三键 SVG 和通用七日图尺寸调整，其余保持原样。新增样式集中在 `assets/qq-aesthetics.css`，由现有媒体主题载荷加载。

## 参考与落实

| 主题 | 参考 | 实现 |
| --- | --- | --- |
| 新拟物 | [Google Fonts Nunito 说明](https://github.com/google/fonts/blob/main/ofl/nunito/DESCRIPTION.en_us.html)、[上游许可](https://github.com/googlefonts/nunito/blob/main/OFL.txt) | Nunito 圆润端点、内凹导航窄栏、凸起分组盖板、圆角立体柱和绿色柱顶。中文保留原有回退字体。 |
| 蓝天白云 | [XP Explorer 截图](https://www.screensaversplanet.com/help/guides/windows/how-to-remove-a-screensaver-on-windows-xp-52)、[XP.css 展示](https://botoxparty.github.io/XP.css/) | Explorer 分组任务窗格、淡蓝内容层、金色文件夹轮廓、Luna 蓝按钮。摘要与个人资料用最大化/还原 SVG 表达展开/收起，不再显示加号。 |
| Aero | [微软 Segoe UI 字体记录](https://learn.microsoft.com/en-us/typography/font-list/segoe-ui)、[微软 Vista/7 字体规范](https://learn.microsoft.com/en-us/windows/win32/uxguide/vis-fonts)、[Vista Explorer 图](https://www.kodyaz.com/photos/windows_vista_ultimate_edition_rc1_screenshots/picture437.aspx) | 保留 Segoe UI / Microsoft YaHei，新增玻璃导航框、浅阅读内层、玻璃分组条和三枚小玻璃按钮。 |
| Matrix | [制作方 Animal Logic](https://animallogic.com/portfolio/projects/matrix/)、[WIRED 对设计者的采访](https://www.wired.com/story/the-matrix-code-sushi-recipe/) | 原创 28 列片假名/数字静态图案，错位长度、部分镜像、淡绿亮头与渐暗尾部。局部磷光文字，完整覆盖个人设置、输入字段、页签和头像选择页。 |
| 皮革手账 | [既有实体参考](skeuomorphism-references.md) | 木质柜体、书脊、分组层板、纸页聊天条目和纸张叠边。浅色书脊/分组/导航图标用米金文字，纸面用深棕文字；聊天三键为深铜底、浅金图形。 |

上述资料只用于视觉研究，没有复制第三方截图、电影素材或 CSS 框架。
Nunito 字体与原始 OFL 许可随仓库提供，来源和 SHA-256 见 `assets/fonts/README.md`。

## 控件与范围

- 聊天标题栏的更多、摘要、新标签页使用原创 SVG mask。沿用原按钮、可访问名称、焦点、点击区域和事件。
- 原生最小化/最大化/关闭由 Electron / Windows 绘制，未替换字形或事件。
  手账通过 Window Controls Overlay 的 `env()` 区域绘制带铆钉、折边和金属反光的黄铜书扣，亮暗模式分别配色。
  无此能力时底板宽度为零。CDP 截图不包含原生字形。
- 用户资料的修改、保存、头像和统计数据行为不变；renderer 新增图表布局尺寸计算及固定明暗主题的原生设置同步。
- 纸张、木纹、书脊和代码雨均为静态 CSS/SVG；未增加定时器、Canvas 循环、DOM 装饰节点或滚动区滤镜。
  新字体约 270 KiB，替代原约 558 KiB 的字体载荷。未进行帧率或 GPU 压测。

## 检查记录

- JavaScript 语法和现有 `--check-payload` 检查通过。
- 在真实 Codex 窗口检查五套主题；新拟物、Aero、手账覆盖亮暗外观，XP/Matrix 保持各自固定外观。
- 聊天三键的 SVG 呈现、点击命中区域和页面横向溢出检查；展开图形与个人设置页截图检查。
- 五套主题均补查 960 × 720 窗口：无横向溢出，输入区可见，聊天三键中心命中正常；XP 两个面板的展开/收起状态可往返恢复。
- 浅色手账文字已按实际叶子节点复核：书脊 `#fff2cd`、分组 `#fff1cf`、纸面聊天 `#362c23`。
- 截图与观测保存在本地 `output/aesthetics-refine-20261023/`；不纳入 Git。
- 经用户确认，已将本次 8 个相关文件备份后同步到本机已安装引擎，逐项 SHA-256 一致；仅刷新皮肤后台进程，安装版载荷检查和当前窗口验证通过。未重启 Codex。
- 未新增测试代码，未运行构建或完整自动化测试。

## 后续细化

- XP 侧栏参照用户提供的资源管理器截图，调整为蓝色底、淡紫任务窗格、白色渐变标题和圆形双箭头；移除重复框体，保留原有分组折叠行为。
- 所有个人资料七日图按各自现有图高增加 20%，与上方三个统计数字的间距增加 6px。保留折线、柱状、LCD 各自呈现；仅在主题、宽度或状态内容变化时重新计算尺寸。
- 新拟物采用圆角字形，千禧年机箱采用直线蚀刻字形；两套聊天三键均为原创 SVG mask，并沿用现有事件和可访问名称。
- 单一明暗主题通过既有 `appearanceTheme` 设置通道同步 Codex 外观；切换请求串行处理，以最后选择为准。双外观主题继续跟随原生设置。
- 滚动条按用户最终要求全部回退，未保留本轮特化样式。
- 现场对比 14 套内置配色，七日图高度比值均为 1.200（像素取整误差除外）；XP/Matrix 的原生明暗同步及连续切换最后选择已检查。
- 本轮截图和观测位于 `output/aesthetics-second-pass-20261023/`，不纳入 Git。
- 后续细化的五个文件已备份并同步安装引擎，逐项 SHA-256 一致；安装版窗口检查通过，未重启 Codex。

## 版本归档

本批实现纳入 2.8.0，更新范围见 [CHANGELOG](../CHANGELOG.md)。上述截图和观测记录针对实现阶段的本机窗口；版本整理仅同步版本元数据和说明，不代表安装器重建或完整自动化测试。
