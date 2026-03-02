## Why

在测试工具弹窗中增加"获取装备"和"获取物品"按钮，方便开发调试时快速获取装备和物品进行测试。

## What Changes

1. 在测试工具弹窗中增加"获取装备"按钮，点击后随机生成一件装备并加入背包
2. 在测试工具弹窗中增加"获取物品"按钮，点击后随机获取一个消耗品/材料并加入背包

## Capabilities

### New Capabilities
- `test-equipment-button`: 测试获取装备功能
- `test-item-button`: 测试获取物品功能

### Modified Capabilities
- `test-tools-modal`: 扩展现有测试工具弹窗，增加新按钮

## Impact

- `src/components/layout/GameHeader.vue`: 增加按钮
- `src/views/GameView.vue`: 添加获取装备/物品的处理函数
