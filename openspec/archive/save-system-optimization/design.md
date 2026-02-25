## Context

当前存档系统由 `SaveManager`（持久化读写）、`StateManager`（内存状态快照/恢复）、`GameEngine`（协调）三层组成。自动存档间隔 10 分钟，无 `beforeunload` 保护。加载存档时直接恢复快照的精确状态（包括战斗中、残血、技能冷却等），导致"副本打到一半退出再进来"体验不连贯。

9 个职业的资源类型：
- **rage**（怒气）：战士 — 战斗产生，脱战应归零
- **energy**（能量）：盗贼 — 脱战满值
- **mana**（法力）：圣骑士、猎人、牧师、萨满、法师、术士、德鲁伊 — 脱战满值

## Goals / Non-Goals

**Goals:**
- 自动存档间隔缩短为 5 分钟（300,000ms）
- 浏览器关闭/刷新时通过 `beforeunload` 执行紧急存档
- 加载存档后总是以满状态从野外探索（exploration）场景进入
- 按职业区分资源重置逻辑：rage 归零，mana/energy 回满

**Non-Goals:**
- 不修改存档数据格式（不触发版本迁移 v5→v6）
- 不修改手动存档或事件触发存档的行为
- 不实现副本战斗进度的跨加载恢复
- 不改变 `SaveManager.save()` / `SaveManager.load()` 的存储结构

## Decisions

### D1: sanitize 逻辑放在 GameEngine.loadGame() 中

**选择**: 在 `GameEngine.loadGame()` 中，`stateManager.restore(data)` 之后、`eventBus.emit('game:loaded')` 之前，执行状态清洗。

**替代方案**:
- SaveManager.load() 层面清洗 — 但 SaveManager 职责是 I/O，不该了解游戏语义
- StateManager.restore() 中清洗 — 但 StateManager 是通用状态容器，不该有游戏逻辑
- 新建独立 sanitizer 模块 — 改动量太小不值得新文件

**理由**: GameEngine 是唯一加载入口，了解游戏语义，改动集中且最小。

### D2: 存档保持原始快照，加载时清洗（策略 A）

**选择**: 存档时保存精确状态不做修改，加载时执行 sanitize。

**理由**: 保留了"当时在哪"的信息，未来如需恢复战斗状态可逆向实现。

### D3: 按职业 resourceType 区分资源重置

**选择**: 从 `GameData.classes[player.class].resourceType` 或 `player.resource.type` 读取资源类型：
- `rage` → `resource.current = 0`（战士怒气从零开始）
- `mana` → `currentMana = maxMana`，`resource.current = resource.max`
- `energy` → `resource.current = resource.max`

**理由**: 符合 WoW 经典机制——怒气是战斗产生的，脱战归零；能量和法力脱战回满。

### D4: beforeunload 使用同步 localStorage 写入

**选择**: 在 `GameEngine.start()` 中注册 `window.addEventListener('beforeunload', handler)`，`stop()` 中注销。handler 直接调用 `saveManager.save(snapshot, slot)` —— localStorage 写入是同步操作，在 `beforeunload` 中可靠执行。

**替代方案**:
- `navigator.sendBeacon()` — 适用于发送到服务器，不适用于 localStorage
- `visibilitychange` 监听 — 可作为补充但不够可靠（用户可能直接关闭标签页）

**理由**: localStorage.setItem 是同步 API，在 beforeunload 事件中执行可靠且不会被中断。

### D5: 清洗内容清单

加载后执行以下清洗：

| 字段 | 清洗动作 |
|------|---------|
| `game.scene` | → `'exploration'` |
| `player.currentHp` | → `player.maxHp` |
| `player.currentMana` | → `player.maxMana` |
| `player.resource.current` | → `0`（rage）或 `resource.max`（mana/energy）|
| `player.buffs` | → `[]` |
| `player.debuffs` | → `[]` |
| `player.skillCooldowns` | → 所有冷却归零 |
| `player.comboPoints` | → `{ current: 0, max: 5 }`（如有）|
| `player.activePet` | → HP 回满（如有宠物且有 currentHp/maxHp）|
| `combat` | → `null` |
| `dungeonCombat` | → `null` |

## Risks / Trade-offs

- **[Risk] beforeunload 不保证执行** → 5 分钟自动存档作为兜底；可考虑未来加 `visibilitychange` 补充
- **[Risk] 德鲁伊变身状态下存档后加载** → sanitize 重置为基础 mana 形态，变身状态不保留。这是可接受的，因为加载即回到野外
- **[Risk] CombatSystem._restoreCombatState() 仍存在** → combat 被清为 null 后该方法自然不触发，无需修改但需确认不会报错
