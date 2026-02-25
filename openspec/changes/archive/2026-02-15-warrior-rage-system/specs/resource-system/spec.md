# 通用资源系统规格

## 概述

定义通用资源系统的数据结构和行为规范，支持怒气、法力、能量等不同资源类型。

## 数据结构

### Requirement: 资源系统配置

GameData SHALL 包含 `resourceSystems` 对象，定义各资源类型的配置。

```javascript
resourceSystems: {
    rage: {
        displayName: string,    // '怒气'
        emoji: string,          // '💢'
        color: string,          // '#FF4444'
        defaultMax: number,     // 100
        startValue: number,     // 0
        generation: object,     // 产生规则
        decay: object           // 衰减规则
    }
}
```

### Requirement: 角色资源字段

角色数据 SHALL 包含 `resource` 对象而非 `currentMana/maxMana`。

```javascript
player.resource: {
    type: 'rage' | 'mana' | 'energy',
    current: number,
    max: number,
    baseMax: number
}
```

### Requirement: 技能资源消耗

技能数据 SHALL 使用 `resourceCost` 而非 `manaCost`。

```javascript
skill.resourceCost: {
    type: 'rage' | 'mana' | 'energy',
    value: number
}
```

## 行为规范

### Feature: 怒气产生

#### Scenario: 普通攻击产生怒气
- **GIVEN** 玩家是战士职业
- **WHEN** 玩家进行普通攻击且命中
- **THEN** 怒气增加 8 点

#### Scenario: 暴击产生额外怒气
- **GIVEN** 玩家是战士职业
- **WHEN** 玩家普通攻击产生暴击
- **THEN** 怒气增加 8 × 1.5 = 12 点

#### Scenario: 被击中产生怒气
- **GIVEN** 玩家是战士职业
- **WHEN** 玩家被敌人攻击命中
- **THEN** 怒气增加 5 点

#### Scenario: 怒气上限
- **GIVEN** 玩家当前怒气为 95
- **WHEN** 产生 10 点怒气
- **THEN** 怒气变为 100（不超过上限）

### Feature: 怒气消耗

#### Scenario: 技能消耗怒气
- **GIVEN** 玩家有 50 点怒气
- **AND** 技能需要 15 点怒气
- **WHEN** 玩家使用该技能
- **THEN** 怒气减少到 35 点
- **AND** 技能成功释放

#### Scenario: 怒气不足
- **GIVEN** 玩家有 10 点怒气
- **AND** 技能需要 15 点怒气
- **WHEN** 玩家尝试使用该技能
- **THEN** 显示 "怒气不足" 提示
- **AND** 技能不释放

### Feature: 怒气衰减

#### Scenario: 脱战后延迟衰减
- **GIVEN** 玩家有 50 点怒气
- **WHEN** 战斗结束后 2 秒
- **THEN** 怒气保持 50 点（延迟期内不衰减）

#### Scenario: 脱战后开始衰减
- **GIVEN** 玩家有 50 点怒气
- **WHEN** 战斗结束后超过 3 秒
- **THEN** 怒气开始以每秒 2 点的速度衰减

#### Scenario: 进入战斗停止衰减
- **GIVEN** 玩家怒气正在衰减中
- **WHEN** 进入新战斗
- **THEN** 怒气停止衰减
- **AND** 保留当前怒气值

### Feature: 战斗初始化

#### Scenario: 战士连续战斗
- **GIVEN** 玩家是战士职业
- **AND** 当前怒气为 50
- **WHEN** 开始新战斗
- **THEN** 怒气保持 50（继承当前值）
- **AND** 怒气衰减停止

#### Scenario: 战士首次战斗
- **GIVEN** 玩家是战士职业
- **AND** 刚创建角色或怒气已衰减为 0
- **WHEN** 开始首次战斗
- **THEN** 怒气从 0 开始积累

#### Scenario: 法师战斗开始
- **GIVEN** 玩家是法师职业
- **WHEN** 开始新战斗
- **THEN** 法力保持当前值（不重置）

### Feature: 资源上限修改

#### Scenario: 天赋提升上限
- **GIVEN** 玩家学习了提升怒气上限的天赋（+10/级，3级）
- **WHEN** 天赋满级
- **THEN** 怒气上限变为 130
- **AND** baseMax 保持 100

## UI 规范

### Requirement: 资源条显示

资源条 SHALL 根据 `player.resource.type` 显示对应的颜色和图标。

| 资源类型 | 颜色 | 图标 | 显示名称 |
|---------|------|------|----------|
| rage | #FF4444 | 💢 | 怒气 |
| mana | #4444FF | 💧 | 法力 |
| energy | #FFFF00 | ⚡ | 能量 |

### Requirement: 资源不足提示

当技能资源不足时，SHALL 显示 "{资源名称}不足！需要 {cost}，当前 {current}"。
