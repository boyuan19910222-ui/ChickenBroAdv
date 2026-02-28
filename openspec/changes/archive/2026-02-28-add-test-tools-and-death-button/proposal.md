## Why

当前游戏只有"测试升级"按钮用于调试，但随着死亡相关功能（如跑尸模式）的开发，需要增加"测试死亡"按钮来快速触发玩家死亡状态，方便调试死亡/跑尸逻辑。

## What Changes

1. **重构测试按钮位置**：将原"测试升级"按钮替换为"测试工具"按钮，点击后在下方弹出小弹窗
2. **新增测试工具弹窗**：在小弹窗中包含原有的"测试升级"按钮
3. **新增测试死亡按钮**：仅在战斗状态（combat 或 dungeon）下可用，点击后玩家生命值降为0，触发死亡流程（跑尸效果）

## Capabilities

### New Capabilities
- `test-tools-modal`: 测试工具弹窗功能，包含测试升级按钮
- `test-death-button`: 测试死亡按钮，仅在战斗中使用，点击触发玩家死亡

### Modified Capabilities
- (无)

## Impact

- `src/components/layout/GameHeader.vue`: 修改按钮布局
- `src/views/GameView.vue`: 添加弹窗状态和处理函数
