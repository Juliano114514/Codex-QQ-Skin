# 拟物化 · 皮革手账

新增独立 `skeuomorphism` 品牌，随 Codex 外观切换亮暗；不改动其他品牌。

## 参考与取舍

2026-10-22 联网研究了以下设计资料及图片。参考材料与实体隐喻，
不复制截图、商标、纹理素材或第三方代码。全部材质由本地 CSS 渐变绘制。

- [NN/G：Skeuomorphism](https://www.nngroup.com/articles/skeuomorphism/)：实体对象与界面之间的对应关系。
- [IxDF：Skeuomorphism](https://ixdf.org/literature/topics/skeuomorphism)：材质、可辨识的控件和现实隐喻。
- [Justinmind 的拟物界面案例](https://www.justinmind.com/ui-design/skeuomorphic)：早期日历、备忘录、书架的视觉材料。
- [Apple iOS 6 用户指南](https://cdsassets.apple.com/live/6GJYWVAV/user/ma1658_iphone_ios6_user_guide.pdf)：当时的控件及应用界面参考。
- [Apple iOS 6 发布资料](https://www.apple.com/uk/newsroom/2012/06/11Apple-Previews-iOS-6-With-All-New-Maps-Siri-Features-Facebook-Integration-Shared-Photo-Streams-New-Passbook-App/)：Passbook 等功能的时代背景。
- [Things 2 原始发布记录](https://culturedcode.com/things/blog/2012/08/things-2-0-and-things-cloud-available/)：早期桌面生产力软件参考。
- [Reason Rack](https://www.reasonstudios.com/reason-rack)：机架、独立设备面板和仪表隐喻。
- [Reason Rack 官方快速指南](https://www.reasonstudios.com/news/post/reason-rack-plugin-in-any-daw)：实体设备工作流的数字映射。
- [OP-1 原始产品设计](https://teenage.engineering/products/op-1/original/overview)：实体按键与清楚的功能分区。
- [OP-1 field](https://teenage.engineering/products/op-1)：金属外壳和独立显示区域的硬件参考。

## 实现

亮色使用棕色皮革外框、米白纸面、亚麻侧栏、黄铜标题条、陶瓷按键与暖琥珀仪表。
暗色使用咖啡色皮革、炭黑纸面、氧化铜色边沿和暗棕底琥珀仪表。
缝线沿工具栏内沿，细纹理不进入代码编辑器，不添加装饰性按钮。
按下态使用凹陷阴影，键盘焦点保留实线外框；不引入动画或联网资源。

与新拟物的区别：使用多种可辨识的实体材质、明确的包边和材质交界。
新拟物保留同色软表面与柔和阴影。两套选择器互不覆盖。

UI 字体优先 Helvetica Neue/Helvetica，中文采用系统 Microsoft YaHei 或已有 PingFang 回退；
这是本皮肤的设计选择，不宣称为早期 iOS 的完整字体复刻。仪表数字使用本机等宽字体。
不增加字体文件，不更改代码区域字体，不修改事件。

## 第二轮：实体手账结构

2026-10-22 补充检索并查看实体产品照片与一手设计资料：

- [Filofax Malden A5](https://filofax.com/collections/leather-organisers/products/malden-a5-organiser-filofax)：全粒面皮革、对比缝线、六环装订和内袋的结构。
- [Filofax Malden Pocket](https://filofax.com/collections/all-organisers/products/malden-pocket-organiser-modular)：同系列小尺寸结构与皮革细节。
- [Grovemade Notebook Lookbook](https://grovemade.com/journal/notebook-lookbook/)：植鞣皮与黄铜盘式装订的材料对比；部分图片 CDN 返回 403，未绕过访问限制。
- [Grovemade Matte Notebook](https://grovemade.com/product/matte-notebook/?initial=618)：装订盘、纸张和封面的分层说明。
- [TRAVELER’S COMPANY Brass Clip ROAD TRIP](https://shop.travelerscompanyusa.com/products/travelers-notebook-brass-clip-road-trip)：黄铜反光与使用后的包浆。
- [TRAVELER’S COMPANY 数字黄铜夹](https://www.travelers-company.com/products/brass/clips)：索引夹和金属铭牌的实体隐喻。
- [TRAVELER’S COMPANY Brass 产品目录](https://shop.travelerscompanyusa.com/collections/brass-products)：夹子、尺子、书签的材料与比例。
- [Moleskine Classic](https://www.moleskine.com/en-us/shop/notebooks/the-original-notebook/classic-notebook-reef-blue-8058341715543.html)：象牙色纸、缎带书签、圆角和弹性绑带。
- [MIDORI Notebook](https://www.midori-japan.co.jp/english/products/notebook/)：骑马钉、环装与便笺等不同装订形式。
- [Designphil MD 15 周年资料](https://www.designphil.co.jp/presspdf/221214_md15th_en.pdf)：奶油色纸张、衬页和线装平摊结构。
- [Apple Mountain Lion 发布资料](https://www.apple.com/newsroom/2012/07/25Mountain-Lion-Available-Today-From-the-Mac-App-Store/)：早期 Notes/Reminders 的时代背景；不据此声称是像素级复刻。

本轮改为细颗粒皮革，增加带明暗折痕的书脊、边缘黄铜装订环、淡纸页横线和红色页边线、
纸页叠层、金属铆钉、织物缎带书签、纸质索引标签、玻璃反射仪表与凹凸金属包边。
所有装饰用原创 CSS / 内联 SVG，绝对定位装饰不接收指针，不新增可点击的假控件。
装订件占用已有页边和 12px 书脊，不覆盖输入区；暗色使用咖啡色材料并保留纸页结构。
Token 仪表保持已确认的暖琥珀配色。与新拟物同色软表面的语言保持区别。
