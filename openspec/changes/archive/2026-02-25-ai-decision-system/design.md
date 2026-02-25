## Context

当前项目有两套战斗系统（开放世界 `CombatSystem` + 副本 `DungeonCombatSystem`），AI 行为分散在各自的方法中：
- AI 队友：4 个硬编码方法（`aiTankAction`/`aiHealerAction`/`aiMeleeDpsAction`/`aiRangedDpsAction`），不走技能系统
- 副本敌人：有简单的技能选择（`_selectEnemySkill`），但执行路径与玩家不同
- 野外怪物：纯普攻（`enemyTurn` 直接算伤害）
- 玩家：完整技能系统（`playerUseSkill`），有资源消耗、冷却、效果

AI 队友虽然从 `classData.skills` 拿到了技能 ID 列表，但完全没使用。缺少 `skillCooldowns`、`comboPoints` 等运行时字段。

## Goals / Non-Goals

**Goals:**
- 统一所有战斗单位的决策和执行路径
- 行为树 + 评分混合架构，可扩展、可配置
- AI 队友使用职业真实技能，与玩家体验一致
- 为后续挂机模式（Phase 3）提供基础
- 野外怪物拥有技能，提升战斗深度

**Non-Goals:**
- 不做 AI 个性/性格差异化（先统一"够用就行"版本）
- 不做挂机模式 UI 和自动探索（Phase 3）
- 不改副本关卡数据结构（`WailingCaverns.js` 等）
- 不重构战斗系统本身（只替换 AI 决策和技能执行部分）

## Decisions

### D1: 行为树 + 评分混合架构

**选择**: 顶层固定优先级 Selector → 中层评分 Selector → 底层 Sequence + Condition

**理由**: 纯行为树优先级刚性不够灵活，纯评分系统缺乏结构。混合方案在关键决策（逃跑/保命）用固定优先级保证确定性，在技能选择层用评分保证合理性。

**替代方案**:
- 纯行为树：技能选择时需要大量硬编码优先级条件
- 纯评分/效用系统：缺乏层次结构，难以保证"生存>输出"等硬约束
- 状态机：扩展性差，状态爆炸

### D2: 数据驱动 — JS 对象声明 + 注册表

**选择**: 行为树用 JS 对象字面量声明，条件/动作/评分通过字符串 key 引用注册表中的函数

**理由**: 不硬编码逻辑到树节点中，树结构纯数据可序列化。JS 对象比 JSON 更灵活（可加注释），比 Builder DSL 更直观。

**示例**:
```js
const dungeonAllyTankTree = {
    type: 'selector',
    children: [
        { type: 'sequence', children: [
            { type: 'condition', key: 'selfHpBelow', params: { threshold: 0.3 } },
            { type: 'action', key: 'useSurvivalSkill' }
        ]},
        { type: 'scored', children: [
            { type: 'action', key: 'useTauntSkill', scorer: 'tauntValue' },
            { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' },
        ]}
    ]
}
```

### D3: 三层 Context 结构

**选择**: ContextBuilder 输出三层：self → battlefield → tactical

**理由**: 
- Layer 1 (self): 行动单位状态 + 预处理的 `availableSkills`（综合冷却/资源/目标校验）
- Layer 2 (battlefield): allies/enemies 从行动单位视角相对化，友方AI和敌方AI看到的结构一致
- Layer 3 (tactical): 预计算衍生信息（团队摘要、仇恨分析、AOE 价值等），避免行为树重复计算

### D4: 统一技能执行器

**选择**: 抽取 `SkillExecutor.executeSkill(unit, skill, targets, battleContext)` 作为所有单位共用的执行路径

**理由**: 当前玩家 `playerUseSkill()`、敌人 `_executeEnemyAttack()`、AI 队友硬编码公式三套逻辑重复且不一致。统一后：
- 所有单位走相同的资源消耗 → 冷却设置 → EffectSystem 解析 → 伤害/治疗/效果施加流程
- 敌人技能通过 `normalizeSkill()` 转换为标准格式后进入同一管线
- 玩家手动选技能后也调用同一个执行器

**迁移策略**: 先实现 SkillExecutor，然后逐步替换现有执行路径，保持对外接口不变。

### D5: AI 队友资源恢复与玩家同规则

**选择**: AI 队友的资源恢复逻辑复用玩家的规则（战士受击回怒、盗贼每回合恢复能量、法系自然恢复法力等）

**理由**: 保持一致性，避免 AI 队友"无限资源"破坏平衡。

### D6: 敌人技能格式归一化

**选择**: ContextBuilder 内置 `normalizeSkill()` 适配层

**理由**: 副本敌人技能用 `damage: 40`（数字），玩家技能用 `damage: { base, scaling, stat }`（对象）。归一化后 AI 决策和执行器不需要区分单位类型。skill-schema spec 已规定此兼容逻辑。

### D7: 目录结构

```
src/ai/
├── BehaviorTree.js          # 行为树引擎（节点类型、tick 执行）
├── AIRegistry.js             # 条件/动作/评分注册表
├── ContextBuilder.js         # 三层 context 组装
├── SkillExecutor.js          # 统一技能执行器
├── AIDecisionSystem.js       # 顶层调度（buildContext → tick tree → 返回 action）
├── conditions.js             # 条件函数集
├── actions.js                # 动作函数集
├── scorers.js                # 评分函数集
└── trees/
    ├── dungeonAllyTank.js    # 副本友方坦克
    ├── dungeonAllyHealer.js  # 副本友方治疗
    ├── dungeonAllyDps.js     # 副本友方 DPS
    ├── dungeonEnemy.js       # 副本普通敌人
    ├── bossDefault.js        # BOSS 默认
    ├── overworldEnemy.js     # 野外敌人
    └── petDefault.js         # 宠物
```

## Risks / Trade-offs

- **[性能]** 行为树每回合 tick 增加计算量 → 缓解：回合制游戏非实时，tick 频率极低（每单位每回合一次），无性能压力
- **[复杂度]** 引入新的抽象层 → 缓解：先做"够用就行"版本，条件/动作函数保持简单
- **[回归风险]** 替换 AI 队友和敌人逻辑可能改变战斗平衡 → 缓解：SkillExecutor 走 EffectSystem 已有的伤害公式，数值一致；逐步替换并测试
- **[敌人技能兼容]** normalizeSkill 可能遗漏边界情况 → 缓解：归一化逻辑简单（只处理 damage 字段类型），且有 skill-schema spec 约束
