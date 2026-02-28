## Context

当前测试工具弹窗已有"测试升级"和"测试死亡"按钮，需要扩展增加"获取装备"和"获取物品"按钮。

### 现有实现
- 测试工具弹窗位于 GameHeader.vue 中
- 弹窗通过 showTestTools 控制显示
- 点击按钮后执行对应函数并关闭弹窗

### 技术方案
- 装备：使用 `rollEquipmentDrop(monsterId)` 生成随机装备，使用 `LootSystem._giveItemToPlayer()` 加入背包
- 物品：直接 push 到 player.inventory

## Goals / Non-Goals

**Goals:**
- 增加"获取装备"按钮，点击随机获取一件装备
- 增加"获取物品"按钮，点击随机获取一个物品

**Non-Goals:**
- 不修改现有按钮逻辑
- 不增加装备强化/物品使用功能

## Decisions

### 1. 装备获取方式
- **决定**: 使用 rollEquipmentDrop 随机生成
- **理由**: 复用现有装备掉落逻辑，保持一致性

### 2. 物品获取方式
- **决定**: 直接添加到 inventory
- **理由**: 物品数据结构简单，无需复杂处理

## Risks / Trade-offs

- [低风险] 背包满时物品添加失败 → 提示用户
