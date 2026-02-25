## 1. 技能数据重构 (GameData.js)

- [x] 1.1 重写 GameData.js 中所有 skills 定义，按统一 Schema 格式（id, name, description, emoji, unlockLevel, category, skillType, damageType, targetType, range, resourceCost, actionPoints, cooldown, damage, heal, effects[], comboPoints, generatesResource, conditions）
- [x] 1.2 更新 GameData.js 中所有 classes 的 skills 数组引用，确保每个职业引用正确的技能 ID 且按 unlockLevel 排序
- [x] 1.3 更新 WailingCaverns.js 副本敌人技能，统一为新 Schema 格式（补齐 skillType, damageType, targetType, effects[]）

## 2. 效果系统 (EffectSystem.js)

- [x] 2.1 创建 src/systems/EffectSystem.js，实现 applyEffects(source, target, effects[]) 方法，将 effects 数组中的每个效果施加到目标的 buffs/debuffs 列表
- [x] 2.2 实现 processEndOfTurn(allUnits) 方法：按顺序执行 DOT 结算 → HOT 结算 → buff/debuff/shield/cc duration 递减 → 到期移除
- [x] 2.3 实现 shield 伤害吸收拦截逻辑（在伤害计算中优先扣除 shield absorbAmount）
- [x] 2.4 实现 resolveSkillDamage() 归一化函数，兼容 damage 为 number 或 { base, scaling, stat } 格式；实现旧 effect → effects[] 兼容转换

## 3. 战斗系统集成

- [x] 3.1 修改 CombatSystem.js（开放世界），集成 EffectSystem：技能释放时调用 applyEffects，战斗回合结束调用 processEndOfTurn，targetType 降级为单体
- [x] 3.2 修改 DungeonCombatSystem.js（副本），集成 EffectSystem：技能释放时调用 applyEffects，回合结束调用 processEndOfTurn，支持多目标 targetType 解析
- [x] 3.3 修改 ActionPointSystem.js，优先从 skill.actionPoints 读取 AP 消耗，保留原映射表作为 fallback
- [x] 3.4 实现目标选择逻辑：all_enemies 全体、front_2/front_3 按距离排序取前 N、random_3 随机选取、ally/all_allies 友方选择

## 4. UI 适配

- [x] 4.1 修改 CombatView.vue 和 DungeonCombatView.vue，显示技能 emoji 和 damageType 标签，展示 DOT/HOT/buff/debuff 图标和剩余回合数
- [x] 4.2 添加技能 unlockLevel 检查和锁定状态 UI 显示（未解锁技能灰显+锁定图标）

## 5. 副本单体技能目标选择限制

- [x] 5.1 修改 DungeonCombatView.vue 的 onUseSkill()：根据 skillType+targetType 判断目标选择模式（选敌方/选友方/自动释放），引入 `pendingSkillTargetMode` 状态（'enemy'|'ally'|null）
- [x] 5.2 修改 DungeonCombatView.vue 的 selectTarget()：近战单体技能（skillType=melee + targetType=enemy）时，计算存活敌人按 slot 升序取前 2 个，仅允许选择在此集合内的目标；不在集合内则拒绝并提示"近战技能无法攻击后排目标"
- [x] 5.3 DungeonCombatView.vue 增加友方角色 @click 事件：治疗单体技能（skillType=heal + targetType=ally）激活时，友方角色（含自己）可点击选为治疗目标，交互方式与敌方点选一致
- [x] 5.4 DungeonCombatView.vue UI 高亮/灰化：pendingSkill 激活时根据目标模式高亮可选目标（近战→前2敌人高亮/后排灰化，远程→全部敌人高亮，治疗→全部友方高亮/敌方不可点），增加视觉提示样式
- [x] 5.5 修改 PositioningSystem.getValidTargets()：AI 队友使用近战单体技能时，应用相同的"存活敌人按 slot 升序取前 2"限制
