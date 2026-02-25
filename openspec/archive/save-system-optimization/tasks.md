## 1. 自动存档间隔调整

- [x] 1.1 将 GameEngine.start() 中 startAutoSave 的间隔参数从 600000 改为 300000

## 2. beforeunload 紧急存档

- [x] 2.1 在 GameEngine.start() 中注册 window beforeunload 事件监听器，handler 检查 currentSlot 有效后调用 saveManager.save(stateManager.snapshot(), currentSlot)
- [x] 2.2 在 GameEngine.stop() 中移除 beforeunload 事件监听器
- [x] 2.3 将 handler 保存为实例属性 this._beforeUnloadHandler 以便注销

## 3. 加载存档状态清洗（sanitize）

- [x] 3.1 在 GameEngine.loadGame() 中，stateManager.restore(data) 之后添加 _sanitizeLoadedState() 调用
- [x] 3.2 实现 _sanitizeLoadedState() 方法：设置 game.scene 为 'exploration'，清除 combat 和 dungeonCombat 为 null
- [x] 3.3 实现 HP/Mana 回满逻辑：player.currentHp = player.maxHp，player.currentMana = player.maxMana
- [x] 3.4 实现按职业区分的资源重置：rage → current=0，mana/energy → current=max
- [x] 3.5 清除 buffs/debuffs 为空数组，所有 skillCooldowns 归零，comboPoints.current 归零（如有）
- [x] 3.6 宠物 HP 回满：如 activePet 存在且有 currentHp/maxHp，则恢复满血

## 4. 验证

- [x] 4.1 执行 vite build 确认无编译错误
