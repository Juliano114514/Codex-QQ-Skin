# 黑客帝国 · Matrix

2026-10-22 将此前的 CS 1.6 买枪菜单皮肤替换为 `matrix` / `qq-matrix`。
本皮肤只提供暗色。`appearanceMode: dark-only` 在品牌解析时生效，
不更改 Codex 的原生外观偏好；切换到其他品牌后继续跟随原生外观。
旧的 `cs16-buy` 已保存选择会迁移到 Matrix。

## 本轮联网参考

- [Animal Logic：The Matrix](https://animallogic.com/portfolio/projects/matrix/)：制作方的一手记录，包含代码、追踪程序、监视器画面的设计工作。
- [WIRED 对 Simon Whiteley 的采访](https://www.wired.com/story/the-matrix-code-sushi-recipe/)：手绘字符、片假名和纵向排布的来源；观看其代码走廊参考图。
- [WIRED 代码走廊图片](https://media.wired.com/photos/5ca648a330f00e47fd82ae77/3%3A2/w_2560%2Cc_limit/Culture_Matrix_Code_corridor.jpg)：黑底、绿色的层次与高亮分布，只作视觉参考。
- [CNET 对代码设计者的采访](https://www.cnet.com/culture/entertainment/lego-ninjago-movie-simon-whiteley-matrix-code-creator/)：通过 WIRED 的采访交叉引用，不作为独立确认的来源。
- [No Film School：数字雨的设计来源](https://nofilmschool.com/matrix-digital-rain-origin)：用于补充检索与比对，落实以制作方和采访为准。
- [Digital rain](https://en.wikipedia.org/wiki/Digital_rain)：检索入口及符号类型的辅助比对。
- [Matrix Desktop：cascading displays](https://matrix.watch/articles/digital-rain-history-cascading-displays.html)：终端/CRT 背景参考，不把其产品实现视为电影原作。
- [Share Tech Mono 官方字体样张入口](https://fonts.google.com/specimen/Share+Tech+Mono)：比较现代等宽字体方向；最终复用本机 Consolas，不引入字体下载或声称电影同款。

也搜索了终端 UI 和 Matrix 主题设计资料，只提取视觉观察，未加载外部 skill、脚本或第三方代码。

## 落地取舍

接近黑色的底面 `#030705`，高亮磷光绿 `#52f58b`，正文灰绿 `#d0e7d7`，
细绿色边框，直角面板，`>_` 提示符，等宽工具栏/仪表字形。
原创 SVG 字符列只放在工具栏、导航窄栏、底部资料条；静态显示，避免阅读区持续运动。
正文保持平静，仪表保留细坐标网格和少量辉光。保留原有语义状态色与代码字体。
SVG 以内联 data URL 随本地 CSS 提供，不复制电影素材、商标或镜像字体。

## 验证范围

运行时检查原生 light / dark 两种输入均得到 Matrix dark；检查其他品牌恢复跟随原生模式。
检查浅暗手账、正常窗口与窄窗口的溢出和控件可见性。
使用 payload 静态检查与已安装引擎 verifier，不新增测试代码。
