# Windows XP 与拟物化千禧年机箱

2026-10-23。两个独立内置美学皮肤：`windows-xp`、`millennium-pc`，入口为右上角“美学风格”。
XP 保持 `light-only`；机箱主题现名「拟物化 · 千禧年机箱」，支持日夜两种外观。切换皮肤不改 Codex 自身的外观偏好，日夜按钮沿用本机外观设置。保留现有皮革手账皮肤。
日夜切换对这两个皮肤禁用并置灰。XP 新建会话的风景背景叠加约 85% 白色，使风景可见度约为 15%，控件和文字不随之变淡。

## 用户给出的方向

- XP 以所附 Luna 蓝色桌面截图为准：蓝天、白云、绿丘、蓝色标题栏、奶油白控件。
- 千禧年电脑以所附米白台式机、CRT、键鼠照片为准；主体质朴，粗面 ABS 塑料。
- 半透明天蓝塑料、玻璃和亚克力只作为局部材料；不要 Mac 风格的科技感。

## XP：界面、图片与代码

| 资料 | 看什么 | 本次采用 |
| --- | --- | --- |
| [Microsoft：Bliss 主题回顾](https://blogs.windows.com/windowsexperience/2023/11/28/windows-brings-nostalgia-to-the-holidays-with-the-return-of-windows-ugly-sweaters-this-year-featuring-the-bliss-backdrop/) | 蓝天、白云与绿丘的整体关系 | 本次 AI 生成的风景壁纸；不是原版 Bliss 照片 |
| [Microsoft：XP 回顾](https://news.microsoft.com/es-xl/gracias-windows-xp/) | XP 的历史界面和自然桌面意象 | 蓝、绿、米白的主次关系 |
| [XP.css GitHub](https://github.com/botoxparty/XP.css) | 可运行的 Luna 控件实现 | 只研究，不引入整套框架 |
| [XP.css 组件展示](https://botoxparty.github.io/XP.css/) | 按钮、输入框、页签、窗口、进度条 | 控件边沿、按下态、白色输入井 |
| [XP.css 颜色变量](https://github.com/botoxparty/XP.css/blob/main/themes/XP/_variables.scss) | 暖灰工具栏与系统蓝的搭配 | 奶油色工具栏，与蓝色标题分层 |
| [XP.css 按钮源码](https://github.com/botoxparty/XP.css/blob/main/themes/XP/_buttons.scss) | 高光、下沿、按下反馈 | 原创渐变和凹陷阴影 |
| [XP.css 窗口源码](https://github.com/botoxparty/XP.css/blob/main/themes/XP/_window.scss) | 蓝色渐变标题栏和边框 | 有高光的蓝色现有标题区域 |
| [98.css GitHub](https://github.com/jdan/98.css) | 更早的凸起/凹陷视觉语法 | 只借鉴层次，不把 XP 做成 Windows 98 |
| [98.css 组件展示](https://jdan.github.io/98.css/) | 字段、树、状态栏与按键示例 | 检查小尺寸控件仍可识别 |
| [98.css 原始 CSS](https://github.com/jdan/98.css/blob/main/style.css) | 高光边与阴影边的方向 | 自行实现，不复制第三方代码 |

XP 的绿色用于发送按钮和分段仪表，侧栏借鉴 Explorer 任务窗格。任务正文使用近白阅读面，
风景留在外层和主页，不把强烈的绿丘直接铺到代码与正文下面。保留真实的窗口控件和点击行为。

## 米白电脑：外壳、显示器与键鼠

| 资料 | 看什么 | 本次采用 |
| --- | --- | --- |
| 用户附件中的米白台式电脑 | CRT 厚边框、键帽、机箱分缝、散热槽 | 最高权重；决定整体比例和朴素气质 |
| [ePOWER EPC-102B 产品图](https://www.newegg.com/e-power-atx-mid-tower-steel-computer-case-beige-blue-epc-102b/p/N82E16811202008) | 普通米白/蓝色装机机箱的前面板与槽位 | 少量蓝色条带，而非全透明机身 |
| [Compaq Presario 馆藏照片](https://www.computinghistory.org.uk/det/6114/Compaq%20Introduces%20Presario) | 同色 CRT、键盘、鼠标与主机的完整组合 | 家用设备的一致材料语言；不是精确年份复刻 |
| [Compaq MV520 实物照片](https://crtdatabase.com/crts/compaq/compaq-presario-mv520) | 晚九十年代 CRT 边框、按键和圆角 | 阅读区的内凹边沿，仪表的玻璃反光 |
| [IBM 原始 PC 历史与照片](https://www.ibm.com/history/personal-computer) | 米白箱体、明确的功能分区与凹陷部件 | 辅助观察结构，不作为千禧年机型证据 |
| [普通米白/蓝色 ATX 机箱实物](https://www.ebay.com/itm/256936099325) | 蓝色透明盖、实体 POWER/RESET 和机箱接缝 | 只参考照片，不采信卖家对年代的推定 |
| [米白机箱与蓝色半透明门板实物](https://www.bobshop.co.za/retro-beige-tower-pc-case-sliding-semi-transparent-door-with-drives-and-motherboard/p/670225296) | 不透明外壳与透明小窗的占比 | 蓝色不侵占大面积正文；不复刻照片中的标贴 |

## 材质素材与讲解

| 资料 | 用途 | 落地方式 |
| --- | --- | --- |
| [ambientCG 塑料材质分类与预览](https://commons.wikimedia.org/wiki/Category:Plastic_textures_by_ambientCG) | 粗糙度、色彩图和法线的区别 | 只作材料观察，没有打包第三方贴图 |
| [Plastic002 粗糙度图](https://commons.wikimedia.org/wiki/File:Plastic002_4K_Roughness.png) | 细颗粒表面的变化尺度 | 观察颗粒尺度；细化版改用原创照片式纹理，不进入阅读面 |
| [cgbookcase 素材库](https://www.cgbookcase.com/) | 纹理与材料预览 | 后续材料研究入口，本次没有下载资源 |
| [cgbookcase 材质教程](https://www.cgbookcase.com/learn) | 颜色、粗糙度与表面起伏的分工 | 把颗粒、体积阴影、透明边沿分开设计 |
| [Poly Haven 材质库](https://polyhaven.com/textures) | 材质分类和实物表面观察 | 资料入口，不宣称已找到特定 ABS 型号贴图 |

补充检索了蓝白 G3、透明键鼠、SoundSticks 等，但用户明确不要 Mac 的科技感，
因此这些没有成为造型依据；也没有据照片推定塑料的真实化学成分。

## 实现边界

- ABS：暖米白基底、很轻的原创颗粒、注塑接缝、硬朗的包边与散热槽。
- 键帽：上沿亮、下沿厚，按下时凹陷；不添加假的电源按钮或额外功能。
- 玻璃：浅灰绿的小型仪表显示面、有方向的反光和内侧阴影；正文保持平整清楚。
- 透明塑料：淡天蓝、小面积、可见细肋与边缘高光，不做满屏玻璃、动态模糊或霓虹。
- XP 字体使用本机 Tahoma / SimSun 等回退；米白电脑后来接入本地 Fusion Pixel 12px 比例宽度简体中文字体，缺字回退宋体。保留代码/终端的原有等宽字体。
- 材质为原创 CSS 与生成纹理，风景原图为 `assets/windows-xp-meadow.png`；注入器使用压缩展示副本 `assets/windows-xp-meadow.jpg` 与 `assets/millennium-ivory-abs.jpg` 并转为内联数据，无外部请求、额外字体依赖或第三方图片再分发。
- 新主题的材质选择器按品牌隔离；XP 使用 `light-only`，机箱复用既有的双模式颜色配置与原生日夜切换。
- 这是内置菜单主题，不是 V2 人物分层包，因此不生成不适用的 `.codexskin` 人物素材。

组件预览位于 `output/retro-skins-preview.html`，使用实际主题 CSS 和示例内容；
预览截图不代表已部署到运行中的 Codex，也不能证明所有原生路由和控件的实际表现。

## 壁纸生成记录

使用内置 `imagegen` 生成，保存在 `assets/windows-xp-meadow.png`。提示词如下：

> Generate an original photographic desktop wallpaper for a nostalgic early-2000s Windows XP Luna inspired light theme. Wide 16:10 landscape image, at least 1600 pixels across. A simple smooth rolling green grassy hill in the lower third, deep clean saturated azure-blue sky filling upper two thirds, a few naturally shaped soft white cumulus clouds, warm clear afternoon daylight, subtle actual grass texture, ordinary countryside, quiet and optimistic. A low horizon, hill rises slightly on the left then rolls down to the right, another very faint distant hill. Authentic landscape photography from a medium-format film camera, believable photographic fine detail, vivid but natural. Keep middle area calm for white application panels. No computer, no desktop UI, no text, no logos, no flowers, no trees, no buildings, no roads, no person, no mountains, no fantasy, no illustration. This must be a new original landscape, not a pixel-identical reconstruction of an existing photograph.

## 第二轮细节研究：Luna 与任务管理器

本轮补看了原始系统截图、2001 年设计规范的镜像、控件源码和当年硬件评测。
下面区分截图的视觉证据、代码参考与未采用的方向。不是把搜索结果数量当作还原程度。

| 资料 | 实际观察与采用 |
| --- | --- |
| [Microsoft Windows XP Visual Guidelines 2001 镜像](https://doczz.net/doc/1057735/welcome-to-the-windows-xp-visual-guidelines) | 系统字体与窗口标题字体有区分，暖灰对话框搭配蓝色标题。XP 使用 Tahoma / 宋体，资料标题使用 Trebuchet MS 回退。镜像不是现行微软托管页。 |
| [同一规范的 PDF 镜像](https://ofifacil.com/ideas-ejemplos/manuales-identidad-imagen-corporativa-corporative-manuals/243-217-Microsoft-Windows-XP-corporate-identity-manual-identidad-corporativa-brand-guidelines.pdf) | 供核对完整原文的补充入口；本轮直接阅读的是上方转录。 |
| [XP.css 页签源码](https://github.com/botoxparty/XP.css/blob/main/themes/XP/_tabs.scss) | 选中页签的橙色细边、下沿与页身相接；个人设置复用原来的两个真实功能页签。 |
| [XP.css 窗口源码](https://github.com/botoxparty/XP.css/blob/main/themes/XP/_window.scss) | 蓝色标题不是单一双色渐变；收窄亮带，并区分标题外框、内侧亮边。 |
| [XP.css 按钮源码](https://github.com/botoxparty/XP.css/blob/main/themes/XP/_buttons.scss) | 按钮是薄边、克制高光的浅色表面，悬停偏暖；减少此前接近 Windows 98 的厚凸边。 |
| [TechwareLabs 原始处理器评测](https://www.techwarelabs.com/reviews/processors/e6300/) · [任务管理器原截图](https://www.techwarelabs.com/reviews/processors/e6300/images/013.jpg) | 已查看 Luna 蓝标题、米灰底、黑底绿网格和细折线、分组数字、底部凹槽状态栏。个人资料面板的主要结构参考。 |
| [Stardock 原截图](https://www.stardock.com/screenshots/task1.jpg) | 已查看性能图和分组排版；这张为银色窗口，只参考内部结构，不拿它的标题颜色替代 Luna 蓝。 |
| [COPS/GEMPACK 原始任务管理器教程](https://www.copsmodels.com/gp-taskman.htm) | 核对实际性能页的内容布局；不在 Codex 中伪造进程、CPU、内存或系统负载。 |
| [GUIdebook 任务管理器截图索引](https://guidebookgallery.org/screenshots/tasks/) | 对比不同系统版本的资料入口，避免把 Windows 2000 / 新版任务管理器混进 XP 方向。 |
| [ShizukuIchi/winXP](https://github.com/ShizukuIchi/winXP) | 阅读项目入口，参考桌面、窗口与应用之间的视觉关系，没有引入应用代码或依赖。 |
| [aduncandev/web-xp](https://github.com/aduncandev/web-xp) | 项目包含 Task Manager，可作交互参考；本轮未导入、运行或采纳其具体实现。 |
| [Cyanoxide/react-xp](https://github.com/Cyanoxide/react-xp) | 补充 React 风格复刻案例；不是原版 XP 的像素或字体依据。 |

实际落地：`#ECE9D8` 仪表底、细灰分组边、蓝色标题、绿色细折线与暗绿网格、细分段进度条、
凹槽状态栏。近七天折线读取已有 `snapshot.chart` 的同一组每日 Token 数据，按本组最大值归一化，
不是 CPU 百分比，不插入模拟点，不循环播放假活动。切换到其他皮肤时移除这条专属折线，恢复现有柱状图。
统计为空时保留空网格和既有空态说明；加载、索引、错误、过期数据提示沿用已有状态。

## 第二轮细节研究：真实塑料、旧机壳与 CRT

| 资料 | 查看重点与边界 |
| --- | --- |
| [BBC Micro 原始机壳图集](https://bbcmicro.computer/case) | 已下载并查看粗颗粒、细颗粒、接缝、内侧卡扣与后沿特写。表面颗粒不规则，装配缝暗线旁有窄亮边。该机器早于千禧年，只作材料与工艺参照。 |
| [粗纹理特写](https://bbcmicro.computer/images/case-coarse-texture.jpg) | 注塑起伏、圆角过渡、上下壳接缝及外露处的偏黄颜色。 |
| [细纹理特写](https://bbcmicro.computer/images/case-fine-texture.jpg) | 对照更细、更均匀的哑光颗粒，避免把 UI 塑料做成水泥或皮革。 |
| [内侧卡扣与外沿](https://bbcmicro.computer/images/case-fine-keyboard-lugs.jpg) | 内部偏浅、外沿偏暖的色差；用作轻微泛黄与凹槽层次的视觉依据，不据照片推定老化化学机制。 |
| [后沿与接缝](https://bbcmicro.computer/images/case-coarse-rear-vent.jpg) | 狭窄接缝、开口背后的深暗部和圆角上的柔和高光。 |
| [Compaq Presario MV520 实物图集](https://crtdatabase.com/crts/compaq/compaq-presario-mv520) | 已查看 1999 年 CRT 实物：外壳哑光，玻璃较深、内框有厚度，实体按键高光集中在窄边。照片仅研究使用，未随皮肤分发。 |
| [Dell M780 实物销售图集](https://woo.gordogato.com/product/dell-m780-crt-monitor/) | 普通米白 CRT 与轻微老化的补充参考；卖家的年份、材料描述不等同厂商材料证明。 |
| [PCSTATS：AOpen HX45，2000-06-26](https://www.pcstats.com/articles/273/index.html) | 已读当年评测并查看前后实拍。普通机箱前面板很朴素，光驱和软驱盖板、圆按键、面板分缝清楚；不做大面积未来感透明外壳。 |
| [AOpen 前面板原图](https://www.pcstats.com/articleimages/hx45_front.jpg) · [后部原图](https://www.pcstats.com/articleimages/hx45_rear.jpg) | 图片较小，只用来判断整体结构与槽位关系，不声称据此看清微观颗粒。 |
| [Dan's Data：HX45 原始评测](https://dansdata.com/hx45.htm) | 检索到前面板圆角、实体按钮、卡扣和装配结构的说明；正文抓取失败，不作为本轮已通读资料。 |
| [iFixit：Compaq Deskpro EN 拆解](https://www.ifixit.com/Teardown/Compaq+Deskpro+EN+Teardown/55804) | 阅读拆解图文，参考塑料面板与金属盖板的分工、卡扣和拼接方式；不是将内部结构移植成装饰。 |
| [IBM 4704 原始修复记录](https://ndeast.com/posts/ibm-4704-107-key/) · [键帽特写](https://images.ndeast.com/posts/ibm-4704-107-key/full/ndeast-4704-107-2.jpg) | 已查看浅色键帽的细颗粒、较亮顶面、较暗侧壁和键隙。更早期键盘，只借材料层次，不推定其塑料成分。 |
| [RetroHax：旧壳修复原始图文](https://retrohax.net/extreme-deyellowing-atari-1040-stf/) | 只观察外露壳面与遮挡区域的颜色差，不采纳文中的化学处理流程作为建议。 |
| [Protolabs：模具纹理与表面处理](https://www.protolabs.com/resources/design-tips/mold-texture-standards-and-finishes/) | 制造商对模具纹理与表面光泽的讲解入口；区分材料颜色、纹理尺度和高光范围，不把颜色变黄当成全部材质。 |
| [Fictiv：SPI 表面处理指南](https://www.fictiv.com/articles/spi-guidelines-for-injection-mold-surface-finish) | 补充注塑表面处理与观感的原始厂商说明；未据此宣称某一历史机器采用了确定的 SPI 等级。 |

采用的材料分工：机壳为略暖的米白细颗粒；接缝用细暗线而非大面积污渍；键帽有较亮顶面、
较厚下沿与按压凹陷；CRT 阅读区有多层内凹包边；仪表玻璃微微偏灰绿，边缘阴影比表面反光更明显；
淡蓝透明塑料保留细肋和较深的边沿。所有颗粒和老化颜色都限于结构表面，不覆盖代码与正文。

参考图本地查看：`output/retro-detail-references-20261023/index.html`。该目录是忽略的研究输出，
不进入皮肤资源包；图册给每张照片保留原始页面链接与“实际观察 / 使用边界”。

## 原创塑料纹理与资源记录

使用内置 `imagegen`，两张 BBC 机壳照片仅作为材质观察参考，生成一个新的平面纹理，
没有直接裁取或再分发原照片。生成原图留在本机 generated_images 与忽略的研究输出中，
项目使用 `assets/millennium-ivory-abs.jpg`（JPEG quality 88 的展示副本，364538 bytes）。
壁纸同样使用压缩展示副本（277046 bytes），避免过长的内联图片使渲染器 CSS 自定义属性失效。
纹理、机壳体积光、接缝、玻璃反射分开实现；没有新增下载请求或模糊动画。

完整生成提示词：

> Use case: photorealistic-natural. Asset type: seamless square material texture tile for a skeuomorphic 1999 beige desktop computer UI. Generate a new original macro photograph-like tile of molded aged warm ivory ABS plastic. The two attached photos are material references ONLY: observe their fine irregular rounded stipple molded grain, NOT their keyboard, geometry, colors or objects. Full image must be one continuous flat surface, orthographic overhead, uniformly softly lit. Warm off-white / very pale gray beige, very slight aged yellow cast, tiny irregular pebbled shallow grain, gently worn tiny highlights, realistic matte molded computer casing, plain unassuming office PC. Texture scale: hundreds of tiny irregular grains across the tile, each around 2-4 pixels, subtle depth. Very restrained microscopic aging, not stains. Must tile seamlessly all four edges. No objects, no seam, no grooves, no bevel, no cast shadow, no directional lighting gradient, no vignette, no dirt specks, no cracks, no text, no logos, no shiny metal, no fabric, no paper fibers, no leather, no sci-fi, no Apple look. A usable physically convincing warm ivory plastic albedo-like tile, full bleed square.

## 本机验证记录

2026-10-23 通过现有本机调试端口热更新，未重启应用。源码与安装引擎中本轮使用的六个文件 SHA-256 一致；
JavaScript 语法、payload 加载及现有 `--verify` 检查通过。没有新增测试代码或执行打包。

- 1920 × 1032 实际主窗口：XP 和米白电脑均为浅色，没有横向溢出；设置、刷新、折叠及顶部末端按钮可命中。
- XP 黑底图有七个实际样本的折线；经典皮肤恢复七根原柱状图。后续米白电脑改为同一组数据的 LCD 点阵图，离开该主题后移除专属画布。
- XP 设置：个人资料 / 更换头像均实际切换并截图；活动页签计算颜色为 `rgb(230,139,44)`，表单未改值或保存。
- 1280 × 720 临时视口：两者没有横向溢出，资料卡继续使用现有右栏滚动容器；检查后恢复原窗口视口与千禧年电脑皮肤。
- 保留连续标题栏画布和统一原生头部背景，避免重新出现顶部左右边条及末端按钮区的材质断层。

截图：`output/retro-detail-windows-xp.png`、`output/retro-detail-millennium-pc.png`、
`output/xp-taskmanager-profile-live.png`、`output/xp-settings-profile-live.png`、`output/xp-settings-avatar-live.png`。
证据 JSON 位于同一 output 目录。上述为特定本机视口和当前路径的结果，没有执行应用完整重启或所有原生路由回归。

## 第三轮：硬件按钮、鹅黄塑料、LCD 与像素字体

用户提供的 CRT 实拍为按钮形态的主要依据：圆润键帽嵌在暗色装配槽中，上缘柔和高光、下缘轻微阴影；
文字按钮采用同一材质的椭圆长键，不照搬照片中的品牌标识。机壳偏亮的奶油鹅黄，接缝偏灰绿，避免棕色脏污感。
顶部快捷键、资料卡、输入区、侧栏悬停与当前项、个人设置的页签和表单使用同一套材质。
输入区调整内边距、模型与语音/发送组间距，并保持所有原生操作与点击目标。

| 补充来源 | 实际用途与边界 |
| --- | --- |
| [TargetPC：InWin S500 原始评测](https://www.targetpc.com/hardware/cases/inwins500/) | 朴素前面板、偏右实体开关、底部通风槽；不将装饰孔放在正文上。 |
| [TargetPC：InWin A500 原始评测](https://targetpc.com/hardware/cases/inwina500/) | 圆按键、LED 透镜、压印面板与装配边的关系。 |
| [PCSTATS：InWin Q500，2001-02-28](https://www.pcstats.com/articles/570/index.html) | 当年的机壳分区和开关布置，补充几何结构参考。 |
| [Winstar WO2002A 字符 LCD](https://www.winstar.com.tw/products/lcd-display/cog-lcd-module-display/20x2-lcd.html) | 5×8 字符单元与独立的点尺寸、点间距。只借视觉结构，不声称 UI 对应某一真机型号。 |
| [Newhaven 原始 LCD 手册，2007](https://newhavendisplay.com/content/specs/NHD-02161Z-FSY-YBW.pdf) | 黄绿色 STN、字符点阵和模块凹槽。年份晚于主题年代，作为类似 LCD 的技术/外观补充。 |
| [Fusion Pixel 原始仓库](https://github.com/TakWolf/fusion-pixel-font) · [2026.10.16 版本](https://github.com/TakWolf/fusion-pixel-font/releases/tag/2026.10.16) | 12px 比例宽度简体中文点阵字体。是现代开源复古字体，不是当年 Windows 原装字体。原始字节、固定版本、SHA-256 和随附许可见 assets/fonts/README.md。 |
| [W3C Filter Effects：feDisplacementMap](https://www.w3.org/TR/filter-effects-1/#feDisplacementMapElement) · [web.dev 绘制开销说明](https://web.dev/articles/animations-guide) | 用于评估真实桶形形变；本机短测后未保留该滤镜。 |

LCD 初版 SVG 使用小数方点，且折线横纵拉伸比例不同，导致模糊和不均匀。
现改为四个小型 Canvas，结合当前 UI 缩放和屏幕像素比，在整数设备像素上绘制等大方点。
数字用自绘 5×7 字形，缩窄小数点间距；真实文本仍保留供选择和辅助功能读取。
折线仍由最近七天真实数据栅格化而来；保留原有每日悬停值、空态与加载提示。
只在统计更新、主题切换或显示尺寸改变时重绘，没有轮询绘图或动画。

CRT 加强静态扫描线、微弱磷光栅格、玻璃高光和内沿吸光；不对正文做模糊处理。
真实弧面形变只在忽略的 output 目录短测：三段各约 1.8 秒的小幅往返滚动中，
Paint 总时长约 11.7 / 83.9 / 2.7 ms（基线 / 位移滤镜 / 恢复），受并发应用状态干扰，不能作为稳定帧率结论。
按用户“开销太大就不做”的条件，已移除试验滤镜与临时节点；正式界面 filter 为 none。

第三轮本机验证（2026-10-23）：

- JavaScript 语法、payload 静态加载、现有 `--verify` 通过；当前为 `qq-millennium-pc` / light，统计 ready。
- 浏览器实际字体诊断为 `Fusion Pixel 12px Prop zh-Hans`，不是只检查 CSS 字体声明。
- 数字画布仅有完全不透明的方点；图表另有 alpha 12 的弱底网格。1920×1032 原窗口下四个画布均为设备像素 1:1。
- 1280×720、DPR 1.25 临时视口中，发送正常 resize 通知后四个画布同样为设备像素 1:1；没有测试真实跨显示器拖动。原窗口视口与皮肤均已恢复。
- XP → 经典 → 米白切换后，专属 SVG / Canvas 正确互换，经典数字恢复正常颜色。输入区各按钮均在视口内且可命中。
- 个人资料 / 更换头像两个设置页均实际打开、切换、截图、关闭，没有改值或提交；两页无横向溢出。
- 源码与本机安装引擎的 CSS、渲染脚本、主题 metadata、injector、字体五项 SHA-256 一致。没有新增测试代码或执行打包。

最新截图：`output/millennium-settings-profile-live.png`、`output/millennium-settings-avatar-live.png`、
`output/millennium-lcd-controls-live.png`、`output/millennium-composer-controls-live.png`、
`output/millennium-crt-reading-live.png`。现场证据见 `output/pc-controls-evidence.json` 与 `output/pc-controls-final-verify.json`。

## 第四轮：黑色机壳与双模式

主题 ID 继续使用 `qq-millennium-pc`，显示名称改为「拟物化 · 千禧年机箱」。浅色保留奶油鹅黄塑料，
深色改用接近中性的炭黑外壳、石墨灰键帽、墨黑装配缝和暗色亚克力。两种模式共用布局、按钮形状、
散热孔与字体，深色单独定义材质颜色，不对整页反色，不给正文加滤镜或模糊。

补充核对了 [IBM 官方显示器选件列表](https://www.ibm.com/support/pages/monitor-and-video-accessories-ibm-intellistation-pro-type-6217)
中的黑色 CRT 选件，以及 [Dell M992 的 CRT Database 条目](https://crtdatabase.com/crts/dell/dell-m992)
中深色、防眩玻璃与塑料外壳的记录。后者为资料库记录，非厂商材料证明；不把本设计宣称为某一机型的精确复刻。

深色显示区使用静态扫描线、微弱 RGB 栅格、宽反光与较深的玻璃内沿；底色比外壳更暗。
统计区域是单独的暗底 LCD，数字、折线与标签用淡灰绿色。画布从当前模式的 CSS 颜色读取墨色，
渲染缓存包含当前外观，避免日夜切换后残留另一模式的低对比度点阵。
个人资料、更换头像、侧栏、输入区、上下文用量图标和菜单沿用同一颜色体系。

日夜能力在 `assets/theme-appearances.json` 中登记；取消机箱的 `light-only` 限制，XP 限制保留。
本机界面已确认新名称、日夜按钮可用、暗底亮色点阵与个人设置两页；详细切换与窗口证据记录在
`output/pc-dark-mode-evidence.json` 和 `output/pc-dark-pc-controls-evidence.json`。
深色截图为 `output/pc-case-dark-final-live.png`、`output/pc-dark-millennium-lcd-controls-live.png`、
`output/pc-dark-millennium-settings-profile-live.png`。
