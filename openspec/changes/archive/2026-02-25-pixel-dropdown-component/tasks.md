## 1. 创建 PixelDropdown 组件

- [x] 1.1 创建 `src/components/common/PixelDropdown.vue` 文件
- [x] 1.2 实现 props（modelValue, options, placeholder, disabled）
- [x] 1.3 实现触发器渲染（显示选中项或 placeholder）
- [x] 1.4 实现下拉列表渲染（遍历 options）
- [x] 1.5 实现展开/收起切换逻辑
- [x] 1.6 实现选项点击选择并 emit update:modelValue
- [x] 1.7 实现点击外部关闭（document.click 监听）
- [x] 1.8 实现 disabled 状态

## 2. 样式实现

- [x] 2.1 触发器样式（深蓝背景、金色边框、像素字体、下拉箭头）
- [x] 2.2 下拉列表样式（绝对定位、阴影、z-index）
- [x] 2.3 选项样式（emoji + label + sublabel 布局）
- [x] 2.4 hover 和选中状态高亮
- [x] 2.5 禁用状态样式

## 3. 集成到 LobbyModal

- [x] 3.1 在 LobbyModal.vue 导入 PixelDropdown 组件
- [x] 3.2 替换原生 `<select>` 为 PixelDropdown
- [x] 3.3 构造 options 数组（含 emoji、name、levelRange）
- [x] 3.4 删除原 .dungeon-dropdown 样式

## 4. 测试验证

- [x] 4.1 验证下拉展开/收起交互
- [x] 4.2 验证选项选择和 v-model 绑定
- [x] 4.3 验证点击外部关闭
- [x] 4.4 验证样式与游戏主题一致
