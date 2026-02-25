## Why

游戏当前 UI 存在多个视觉问题：字体依赖 Google Fonts CDN（离线不可用，中文无像素风格）、字号普遍偏小（5-8px）、大量硬编码颜色值（200+处）、缺少职业色系统、面板配色与 WoW 原版风格偏差（暖棕 vs 冷蓝黑）、组件留白过多。需要建立统一的视觉设计系统，为后续移动端适配（Phase 3）和像素图标替换（Phase 4）打好基础。

## What Changes

- 引入方舟像素字体（Ark Pixel Font 12px 等宽）作为全局唯一字体，移除 Google Fonts CDN 依赖
- 建立 12/24/36/48px 四档字号体系（像素字体要求 12 的整数倍）
- 全面替换 CSS 变量系统：面板底色从深棕改为 WoW 原版深蓝黑冷色调，新增职业色、字号变量、间距变量
- 新增 9 个 WoW 官方职业颜色映射，应用到角色面板、战斗卡片、职业选择等组件
- 放大组件尺寸、增加间距，减少留白感
- 统一所有组件中硬编码的颜色值为 CSS 变量引用

## Capabilities

### New Capabilities
- `font-system`: 本地像素字体引入、@font-face 声明、字号体系（12/24/36/48px）
- `color-system`: WoW 原版冷色调配色、职业色映射、功能色、CSS 变量统一化
- `component-sizing`: 组件尺寸放大、间距调整、面板宽度优化

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- **样式文件**: `variables.css`（大改）、`base.css`、`pixel-ui.css`、`animations.css`
- **入口文件**: `index.html`（移除 Google Fonts CDN link）
- **资源文件**: `fonts/ark-pixel-12px-monospaced-zh_cn.otf`（已存在，需移到 src/assets/fonts/）
- **全部 17 个 .vue 组件**: 替换硬编码颜色和字号为 CSS 变量
- **数据文件**: `GameData.js` 新增职业 color 字段
- **依赖**: 移除 Google Fonts 外部依赖，改为本地字体
