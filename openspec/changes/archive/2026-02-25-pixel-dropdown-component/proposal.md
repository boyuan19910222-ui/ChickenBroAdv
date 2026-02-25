## Why

集合石副本选择使用原生 `<select>` 元素，展开后显示浏览器默认的白色背景和系统蓝高亮样式，与游戏的深蓝像素风 UI 严重不一致。需要用自定义下拉组件替换，保持视觉统一。

## What Changes

- 新增 `PixelDropdown.vue` 通用像素风下拉组件
- 重构 `LobbyModal.vue` 的副本选择，用自定义组件替换原生 `<select>`
- 下拉列表支持显示副本 emoji 和等级范围

## Capabilities

### New Capabilities

- `pixel-dropdown`: 通用像素风下拉选择组件，支持自定义选项渲染、展开/收起动画、点击外部关闭

### Modified Capabilities

<!-- 无需修改现有 spec -->

## Impact

- `src/components/modals/LobbyModal.vue` — 替换副本选择控件
- `src/components/common/PixelDropdown.vue` — 新建通用组件
- 可复用于其他需要下拉选择的场景
