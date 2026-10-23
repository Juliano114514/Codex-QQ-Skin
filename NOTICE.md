# Notices

Codex QQ Skin is an unofficial customization project. It is not affiliated with, endorsed by, or sponsored by OpenAI, Tencent, or QQ.

## Source attribution

This repository is derived from the macOS implementation of [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin), including its loopback CDP launcher/injector architecture, configuration protection, signature checks, theme lifecycle, and restore workflow. The upstream project is distributed under the MIT License.

Codex QQ Skin adds a new retro two-row title area, classic three-pane layout, native summary alignment, Codex companion panel, QQ-style online profile card, responsive frame treatment, generated visual assets, and associated regression tests.

## Trademarks and assets

The MIT License applies to this repository's software source code. It does not grant rights to OpenAI, Codex, ChatGPT, Tencent, QQ, their trademarks, product names, logos, or trade dress.

The QQ-style penguin avatar and retro frame are AI-generated, unofficial visual assets. They are not official Tencent or QQ artwork and do not imply endorsement. Downstream commercial distribution requires an independent rights review.

The Windows XP-inspired landscape (`assets/windows-xp-meadow.png`, compressed display copy `.jpg`) and ivory plastic texture (`assets/millennium-ivory-abs.jpg`) were AI-generated for this project. The landscape is not the original Microsoft/Charles O'Rear Bliss photograph. Retro PC materials combine the original texture with CSS lighting and seams; linked hardware photos and third-party CSS frameworks are research references and are not redistributed in the theme. Reference sources and generation prompts are recorded in `docs/retro-pc-references.md`.

This project does not redistribute the official Codex application. The macOS build validates and uses the Node.js executable already signed and bundled inside the official desktop application. The Windows portable ZIP includes an unmodified Node.js executable downloaded from nodejs.org, verified against the official SHA-256 manifest, and accompanied by the Node.js license and provenance record.

## Media theme fonts

The iQIYI theme uses HarmonyOS Sans SC, copyright Huawei Device Co., Ltd.,
with the original [HarmonyOS Sans Fonts License Agreement](assets/fonts/LICENSE-HarmonyOS-Sans.txt).
Other media font resources retain their respective owners' rights and are not
covered by the source-code MIT license. Download sources, font scope, and file
hashes are recorded in [assets/fonts/README.md](assets/fonts/README.md).

The millennium PC theme uses the unmodified Simplified Chinese 12px proportional
Fusion Pixel Font by TakWolf, release 2026.10.16, under SIL OFL 1.1.
Its copyright, license and bundled source-font notices are preserved in
[assets/fonts/fusion-pixel-licenses](assets/fonts/fusion-pixel-licenses).

The neumorphism theme uses the unmodified Nunito variable font, copyright
2014 The Nunito Project Authors, under SIL OFL 1.1. The original license is
preserved in [assets/fonts/LICENSE-Nunito.txt](assets/fonts/LICENSE-Nunito.txt).
The aesthetic control SVGs, Matrix character composition and material gradients
are original implementations. Research screenshots and film imagery are not bundled.
