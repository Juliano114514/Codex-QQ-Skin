# 主题字体来源与用途

核对日期：2026-09-18。字体文件保存在本目录，均未安装到系统字体目录。

| 主题 | 实际接入字体 | 来源 |
| --- | --- | --- |
| 爱奇艺 | HarmonyOS Sans SC Regular / Bold；个人资料数字用 IQYHT | [华为官方原包](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip)；本地 WebApp `src/index.scss` 声明的 [IQYHT CDN](https://static-d.iqiyi.com/lequ/20251127/IQYHT-Regular.ttf) |
| 抖音 | DFP King Gothic GB Regular / Medium | [字节字体 CDN](https://fonts.bytedance.com/dfd/api/v1/css?family=DFPKingGothicGB-Regular&display=swap)；Medium 对应 `family=DFPKingGothicGB-Medium:500` |
| 快手 | PingFang SC Regular / Semibold | 当前官网 CSS 首选 PingFang SC；见下方 OTF 来源 |
| 腾讯视频、优酷、芒果 | PingFang SC Regular / Semibold | [ZWolken/PingFang](https://github.com/ZWolken/PingFang) 的 Windows OTF 存档（第三方提取转换版，不是 Apple 官方下载包） |
| 优酷数字 | QY_Digital Regular / SemiBold | [优酷 CDN](https://g.alicdn.com/youkuvip_fe/vip-fe-assets/1.1.4/iconfont/QY_Digital-Regular.ttf) |

HarmonyOS Sans 按原包保留原始 TTF 和 `LICENSE-HarmonyOS-Sans.txt`。
其他字体保留原始文件；公开可下载不表示其许可变成了本项目的 MIT。
PingFang 存档明确不拥有字体版权，本目录记录来源，不作开放授权声明。

IQYHT 和 QY_Digital 是官网数字子集，不能替代完整中文字体。
DFP CDN 返回 108 个分片：保留每段 unicode-range，将原始字节嵌入
`DFPKingGothicGB.css`，供离线加载；本次下载的原始分片另存于
`D:/Codex-QQ-Skin/output/font-downloads/DFPKingGothicGB/`。
PingFang 在 CSS 中使用 `QQ Media PingFang SC` 别名隔离作用域，实际字体仍为
PingFang SC，避免六个主题的字体资源影响经典浅色/深色的字体选择。

仅对应媒体主题使用这些字体；代码、终端维持等宽字体。
完整版字体增加约 45 MiB 文件资源；注入载荷约 65 MiB，字体不需联网加载。

## 文件校验

| 文件 | SHA-256 |
| --- | --- |
| `HarmonyOS_Sans_SC_Bold.ttf` | `43a424b85e47fb53a17b3b32026a71801f86f8e022ca6798d186b47d39fa5f01` |
| `HarmonyOS_Sans_SC_Regular.ttf` | `297b088424be212207df2ce8b98e335468b782aa6b96832af0b8b773d711e2b1` |
| `IQYHT-Bold.ttf` | `56eaba0324fe91880067cf5df26e472f63f6c59e0ea5feeba944afbb644e512a` |
| `IQYHT-Medium.ttf` | `1ed816db487b09c572d94fdcb7fe501507eddcbc6cae263979333989515b4e1b` |
| `IQYHT-Regular.ttf` | `a7a0ca8761a8d59d7316bd6c0d6b4a2068b468fd3380387ef97b876c13c79a39` |
| `PingFangSC-Regular.otf` | `3e433ee51427151880326de7101c11b68a4ba8bf695515296ff24286f69bedd4` |
| `PingFangSC-Semibold.otf` | `488a6b6e8684ac9ebe7eb915c9bbf39e275a5e8f5348f992c952324fc57cf792` |
| `QY_Digital-Regular.ttf` | `21c558122d466e606808dd0dc846cf2a1feb4dcb23b109becc943d10ce32bb5a` |
| `QY_Digital-SemiBold.ttf` | `6ee18e1d4b45904df8fe4c4791320fbd37ff0b2299c4b08d96749c851e638ea4` |
