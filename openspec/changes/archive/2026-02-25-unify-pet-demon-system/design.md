## Context

当前宠物/恶魔系统存在两套并行的数据定义：

1. **ClassMechanics.js** — 定义了猎人的默认宠物（狼）+ 3种高级宠物（熊/猪/鹰），术士的 5 种恶魔（小鬼/虚空行者/魅魔/地狱猎犬/地狱火）及 14 种恶魔技能
2. **PetCombatSystem.js** — 硬编码了 `PET_CONFIG`（hunter_pet / warlock_pet），只有基础 HP/伤害和 2 个概率触发技能

ClassMechanics 的数据从未被实际战斗使用。此外：
- 猎人有 `petAttack` 手动技能（与自动攻击冗余）
- 术士 `summonImp` 只能召唤小鬼
- 野外战斗（CombatSystem）的宠物自动攻击是内联实现，副本战斗（DungeonCombatSystem）则委托 PetCombatSystem，两条路径不一致

## Goals / Non-Goals

**Goals:**
- ClassMechanics 作为宠物/恶魔的唯一数据源
- 统一猎人和术士的召唤体系（召唤野兽 / 召唤恶魔）
- 宠物纯自动攻击，删除 petAttack 手动技能
- 术士新增 summonDemon 基础技能，按等级解锁 5 种恶魔
- 宠物拥有独立技能池，自动攻击时智能选择技能
- 统一野外/副本两条宠物自动攻击路径
- 宠物死亡后需重新召唤

**Non-Goals:**
- 灵魂碎片系统（术士召唤暂不消耗碎片，后续单独实现）
- 宠物 AI 复杂行为（如嘲讽、治疗队友等主动策略）
- 宠物装备或宠物升级系统

## Decisions

### D1: 删除 petAttack，宠物纯自动攻击

**决策**: 删除 `petAttack` 技能，宠物每回合主人行动后自动攻击一次。

**理由**: petAttack 作为 AP=1 免费 filler 与宠物自动攻击功能重叠，增加了操作复杂度但无策略深度。删除后猎人基础技能从 5 个变为 4 个（arcaneShot, serpentSting, huntersMark, summonPet），操作更简洁。

**替代方案**: 保留 petAttack 作为"命令宠物额外攻击一次"——增加了复杂度但策略价值有限，放弃。

### D2: 术士新增 summonDemon 基础技能，按等级解锁

**决策**: 删除 `summonImp`，新增 `summonDemon` 基础技能。点击后弹出恶魔选择面板，按玩家等级解锁：

| 等级 | 恶魔 | 定位 |
|------|------|------|
| Lv1 | 小鬼 | 远程 DPS |
| Lv4 | 虚空行者 | 坦克 |
| Lv8 | 魅魔 | 控制 |
| Lv12 | 地狱猎犬 | 反法 |
| Lv16 | 地狱火 | AOE 限时 |

**理由**: 与猎人的「召唤野兽」体验一致（点击 → 弹窗选择 → 召唤），但解锁方式不同：猎人高级宠物通过天赋解锁（默认只有狼），术士通过等级解锁（体现恶魔学渐进掌握）。

**summonDemon 数值**: AP=2, mana=30, cooldown=0（与猎人 summonPet 对齐，略低 mana 因为术士 mana 池也在承担其他技能）

### D3: PetCombatSystem 重构为 ClassMechanics 驱动

**决策**: 删除 PetCombatSystem 中硬编码的 `PET_CONFIG` 和 `CLASS_PET_TYPE`。新增方法从 ClassMechanics 读取宠物/恶魔配置来创建 petInstance。

**petInstance 统一结构**:
```javascript
{
  id: 'wolf' | 'bear' | 'imp' | 'voidwalker' | ...,
  name: '狼' | '巨熊' | '小鬼' | ...,
  emoji: '🐺' | '🐻' | '👿' | ...,
  ownerId: playerId,
  ownerClass: 'hunter' | 'warlock',
  // 战斗属性（从 ClassMechanics 读取 + 等级缩放）
  maxHp: number,
  currentHp: number,
  damage: number,
  armor: number,
  attackSpeed: number,
  attackType: 'physical' | 'shadow' | 'fire' | ...,
  // 技能池
  abilities: [{ id, name, damage, cooldown, currentCooldown, priority, ... }],
  // 状态
  isAlive: true,
  isTimeLimited: false,  // 地狱火为 true
  remainingTurns: -1,    // 地狱火有限
}
```

### D4: 宠物自动攻击技能选择逻辑

**决策**: 每回合宠物自动行动时：
1. 遍历 abilities 按 priority 降序排列
2. 跳过 currentCooldown > 0 的技能
3. 选中第一个可用技能执行，并设置其 cooldown
4. 若无技能可用（全部冷却中），执行普通攻击（base damage）
5. 每回合结束时所有技能 currentCooldown -= 1

### D5: 统一野外/副本自动攻击路径

**决策**: CombatSystem 中删除内联的 `_petAutoAttack()` 方法，改为与 DungeonCombatSystem 一样委托 `PetCombatSystem.performAutoAttack()`。两个战斗系统只负责：接收攻击结果 → 应用伤害 → 记录日志 → 发射事件。

### D6: 召唤面板 UI 复用

**决策**: 猎人和术士共用同一个召唤选择弹窗组件。传入可用宠物/恶魔列表，展示名称、emoji、定位描述、是否已解锁。点击已解锁的选项执行召唤。

- 猎人无天赋时：直接召唤狼（不弹窗）
- 猎人有野兽控制天赋 T4：弹窗选择 狼/熊/猪/鹰
- 术士：弹窗选择已解锁的恶魔列表

### D7: 术士技能列表调整

**决策**: 术士基础技能从 7 个变为 7 个（替换 summonImp → summonDemon）：
`['shadowBolt', 'corruption', 'immolate', 'fear', 'drainLife', 'curseOfAgony', 'summonDemon']`

术士天赋树中引用 summonImp 的节点需适配（如「强化小鬼」天赋保留，但描述改为适用于已召唤的小鬼）。

### D8: 宠物死亡与重新召唤

**决策**:
- 宠物死亡时 `isAlive = false`，`activePet` 保留死亡状态信息
- UI 显示灰化的宠物卡片 + "已阵亡"标签
- 需要消耗 AP/mana 重新使用召唤技能
- 重新召唤会替换死亡的宠物实例
- 地狱火持续时间到期视为死亡，同样需要重新召唤

## Risks / Trade-offs

- **[存档兼容]** 旧存档可能包含 petAttack/summonImp 技能引用 → 存档加载时做迁移：将 skills 数组中的 summonImp 替换为 summonDemon，删除 petAttack
- **[战斗平衡]** 删除 petAttack 后猎人少了一个 filler → arcaneShot 已足够作为 filler，且宠物自动攻击补偿了 DPS
- **[术士天赋兼容]** 恶魔学识天赋树中「强化小鬼」等节点 → 保持不变，这些天赋 buff 特定恶魔类型，与召唤方式解耦

## Open Questions

（无，所有关键决策已确认）
