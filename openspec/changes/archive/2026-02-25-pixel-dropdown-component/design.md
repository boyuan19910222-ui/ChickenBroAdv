## Context

`LobbyModal.vue` 的副本选择使用原生 `<select>` 元素。触发器样式可通过 CSS 控制，但下拉列表（options）由浏览器渲染，无法自定义。现状是白色背景 + 系统蓝高亮，与游戏深蓝像素风格严重不符。

项目已有类似模式参考：`SummonPanel.vue` 用 `<div>` 列表实现召唤选择，样式与游戏一致。

## Goals / Non-Goals

**Goals:**
- 创建通用 `PixelDropdown.vue` 组件，完全自定义下拉样式
- 替换 `LobbyModal.vue` 中的原生 `<select>`
- 下拉列表显示副本 emoji + 名称 + 等级范围
- 样式与游戏主题一致（深蓝背景、金色边框、像素字体）

**Non-Goals:**
- 搜索/筛选功能（副本数量少，暂不需要）
- 多选支持（当前场景仅需单选）
- 键盘导航（后续可扩展）

## Decisions

### D1: 组件结构

用 `<div>` 模拟下拉框：
- 触发器（trigger）：显示当前选中项，点击展开/收起
- 下拉列表（dropdown）：绝对定位，展开时显示所有选项

```
┌────────────────────────────────────────┐
│  ⛏️ 死亡矿井  Lv.17-26            ▼   │  ← trigger
└────────────────────────────────────────┘
      ↓ 展开
┌────────────────────────────────────────┐
│ ⛏️ 死亡矿井         Lv.17-26    ✓     │  ← selected
├────────────────────────────────────────┤
│ 🐺 哀嚎洞穴         Lv.17-24          │
├────────────────────────────────────────┤
│ 🏰 影牙城堡         Lv.22-30          │
└────────────────────────────────────────┘
```

**理由**：与 `SummonPanel.vue` 模式一致，完全控制样式。

### D2: Props 设计

```js
props: {
  modelValue: String | Number,  // v-model 绑定
  options: Array,               // [{ value, label, emoji?, sublabel? }]
  placeholder: String,          // 未选择时显示
  disabled: Boolean
}
```

**理由**：保持简洁通用，`emoji` 和 `sublabel` 可选。

### D3: 样式变量

复用项目现有 CSS 变量：
- 背景：`--bg-tertiary` (#243447)
- 边框：`--border-primary` (#3D5A80)
- hover 边框：`--primary-gold` (#FFD700)
- 字体：`--pixel-font`
- 选中项背景：`rgba(255, 215, 0, 0.1)`

### D4: 点击外部关闭

使用 `@click.self` 或 `v-click-outside` 指令。

**决定**：直接在组件内监听 `document.click`，判断是否点击在组件外部，简单高效。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 下拉列表可能超出视口 | 初版固定向下展开，后续可增加自动翻转 |
| z-index 层叠问题 | 下拉列表使用 `z-index: 100`，在 modal 内足够 |
