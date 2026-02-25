## Overview

重设计圣骑士技能与天赋体系，引入圣印/审判核心机制，对齐战士的 4+9=13 技能结构。

## Key Decisions

### Decision 1: 圣印机制采用方案A（圣印=buff）

**Context**: 圣印是圣骑士最有辨识度的机制，但回合制中需要简化。

**Options**:
- A: 圣印作为 self-buff（持续N回合），审判消耗圣印爆发 ✅
- B: 圣印作为"姿态"（零成本切换）
- C: 不做圣印系统

**Decision**: 方案 A。圣印消耗 15 mana 激活，持续 3 回合，期间攻击附带效果。审判消耗当前圣印，造成高额伤害+特殊效果。

**Rationale**: 回合制中 buff+消耗的循环创造了决策点——何时审判、何时续圣印，比姿态被动切换更有策略深度。

### Decision 2: 3 圣印分别对应 3 棵天赋树

**Context**: 需要让 3 棵天赋树各自有鲜明的圣印体验。

**Decision**:
- 正义圣印(基础): 攻击+圣光伤害，审判=高额纯伤。通用型，不需天赋。
- 光明圣印(神圣T2): 攻击+吸血，审判=伤害+自身治疗。治疗向。
- 命令圣印(惩戒T2): 攻击+30%概率额外伤害，审判=伤害+眩晕。爆发向。

**Rationale**: 正义圣印保底，天赋圣印有明确方向性，玩家不需要点天赋也能体验圣印/审判循环。

### Decision 3: 基础技能精简为 4 个

**Context**: 现有 7 个基础技能过多，战士只有 4 个。

**Decision**: 保留十字军打击(filler)、正义圣印(buff)、审判(burst)、圣光术(heal)。其余移入天赋解锁。

**Rationale**: 4 个基础技能覆盖：输出/buff/爆发/治疗，形成完整的基础循环。天赋解锁提供成长动力。

### Decision 4: specialMechanic 注册圣印系统

**Context**: 圣印的激活/覆盖/消耗逻辑需要在战斗系统中处理。

**Decision**: 在 ClassMechanics.js 中注册 `seal` 类型，定义 3 种圣印的 onHit 效果和 onJudge 效果。战斗系统通过 effect type 'seal' 识别并处理。

**Rationale**: 复用现有 specialMechanic 架构（pet/demon/totem/shapeshift），保持一致性。

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| 战斗系统尚未适配 seal effect type | 确定 | 中 | 本次仅做数据层定义，战斗逻辑适配作为后续变更 |
| 审判无圣印时伤害过低 | 低 | 低 | 无圣印审判仍有基础伤害，仅缺少特殊效果 |
| 天赋解锁技能数据但UI未适配 | 低 | 低 | 现有 unlock_skill 天赋类型已被战士验证可用 |
