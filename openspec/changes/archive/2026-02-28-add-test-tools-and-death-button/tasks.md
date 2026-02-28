## 1. 修改 GameHeader.vue

- [x] 1.1 将原"测试升级"按钮替换为"测试工具"按钮
- [x] 1.2 添加"测试死亡"按钮，仅在战斗状态显示

## 2. 修改 GameView.vue

- [x] 2.1 添加测试工具弹窗状态 (showTestTools)
- [x] 2.2 添加测试工具弹窗 HTML（包含测试升级按钮）
- [x] 2.3 添加 debugDeath() 函数，调用 characterSystem.takeDamage(player.maxHp)
- [x] 2.4 在 GameHeader 中添加事件处理
