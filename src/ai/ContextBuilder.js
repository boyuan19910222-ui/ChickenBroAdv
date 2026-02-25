/**
 * ContextBuilder - AI 决策 Context 组装器
 * 
 * 三层结构：
 * - self:        行动单位自身状态 + availableSkills
 * - battlefield: allies/enemies（从行动单位视角相对化）
 * - tactical:    预计算衍生信息
 */

import { PositioningSystem } from '../systems/PositioningSystem.js';
import { ThreatSystem } from '../systems/ThreatSystem.js';
import { EffectSystem } from '../systems/EffectSystem.js';

const ContextBuilder = {

    /**
     * 构建 AI 决策 context
     * @param {Object} unit - 行动单位
     * @param {Object} battleState - 战斗状态 { battlefield, threatState, turnState, gameData, combatType }
     * @returns {{ self, battlefield, tactical }}
     */
    build(unit, battleState) {
        const { battlefield, threatState, turnState, gameData } = battleState;

        const self = this._buildSelfLayer(unit, battleState);
        const battlefieldLayer = this._buildBattlefieldLayer(unit, battlefield);
        const tactical = this._buildTacticalLayer(unit, battlefieldLayer, threatState, turnState);

        return { self, battlefield: battlefieldLayer, tactical };
    },

    // ===== Layer 1: Self =====

    _buildSelfLayer(unit, battleState) {
        const { battlefield, gameData } = battleState;

        return {
            id: unit.id,
            name: unit.name,
            classId: unit.classId,
            role: unit.role,
            hp: unit.currentHp,
            maxHp: unit.maxHp,
            hpPercent: unit.maxHp > 0 ? unit.currentHp / unit.maxHp : 0,
            resource: unit.resource ? { ...unit.resource } : null,
            stats: { ...unit.stats },
            position: unit.position || null,
            buffs: unit.buffs || [],
            debuffs: unit.debuffs || [],
            comboPoints: unit.comboPoints || null,
            isCCed: EffectSystem.isUnitCCed ? EffectSystem.isUnitCCed(unit) : false,
            availableSkills: this._buildAvailableSkills(unit, battleState)
        };
    },

    /**
     * 构建可用技能列表，综合冷却/资源/目标校验
     */
    _buildAvailableSkills(unit, battleState) {
        const { battlefield, gameData } = battleState;
        const skills = unit.skills || [];
        const cooldowns = unit.skillCooldowns || {};
        const available = [];

        for (const skillRef of skills) {
            const skill = this._resolveSkill(skillRef, gameData);
            if (!skill) continue;

            const normalized = this.normalizeSkill(skill);

            // 等级解锁检查（仅对有 level 属性的单位生效，如玩家/队友；怪物跳过）
            if (normalized.unlockLevel && unit.level) {
                if (unit.level < normalized.unlockLevel) continue;
            }

            const cooldownReady = !cooldowns[normalized.id] || cooldowns[normalized.id] <= 0;
            const canAfford = this._checkResource(unit, normalized);
            const meetsComboReq = this._checkComboRequirement(unit, normalized);

            // 获取合法目标
            let validTargets = [];
            if (battlefield && cooldownReady && canAfford && meetsComboReq) {
                try {
                    validTargets = PositioningSystem.getValidTargets(battlefield, unit, normalized)
                        .filter(t => t.currentHp > 0)
                        .map(t => t.id);
                } catch (e) {
                    validTargets = [];
                }
            }

            available.push({
                id: normalized.id,
                name: normalized.name,
                emoji: normalized.emoji,
                category: normalized.category,
                skillType: normalized.skillType,
                damageType: normalized.damageType,
                targetType: normalized.targetType,
                range: normalized.range,
                resourceCost: normalized.resourceCost,
                actionPoints: normalized.actionPoints,
                cooldown: normalized.cooldown,
                cooldownRemaining: cooldowns[normalized.id] || 0,
                cooldownReady,
                canAfford,
                meetsComboReq,
                validTargets,
                isUsable: cooldownReady && canAfford && meetsComboReq && validTargets.length > 0,
                damage: normalized.damage,
                heal: normalized.heal,
                effects: normalized.effects || [],
                comboPoints: normalized.comboPoints,
                conditions: normalized.conditions,
                generatesResource: normalized.generatesResource
            });
        }

        return available;
    },

    /**
     * 解析技能引用 → 完整技能对象
     * 支持字符串 ID（查 GameData.skills）和内联对象
     */
    _resolveSkill(skillRef, gameData) {
        if (typeof skillRef === 'string') {
            return gameData?.skills?.[skillRef] || null;
        }
        if (typeof skillRef === 'object' && skillRef !== null) {
            return skillRef;
        }
        return null;
    },

    /**
     * 技能格式归一化：敌人 damage: number → { base, scaling, stat }
     */
    normalizeSkill(skill) {
        if (!skill) return skill;
        const normalized = { ...skill };

        if (typeof normalized.damage === 'number') {
            normalized.damage = { base: normalized.damage, scaling: 0, stat: 'attack' };
        }
        if (typeof normalized.heal === 'number') {
            normalized.heal = { base: normalized.heal, scaling: 0, stat: 'intellect' };
        }

        // 兼容旧 effect (单数) → effects (数组)
        if (normalized.effect && !normalized.effects) {
            normalized.effects = [normalized.effect];
            delete normalized.effect;
        }
        if (!normalized.effects) {
            normalized.effects = [];
        }

        return normalized;
    },

    _checkResource(unit, skill) {
        const cost = skill.resourceCost;
        if (!cost || !cost.value || cost.value <= 0) return true;
        if (!unit.resource) return true;
        return unit.resource.current >= cost.value;
    },

    _checkComboRequirement(unit, skill) {
        const requires = skill.comboPoints?.requires;
        if (!requires) return true;
        return unit.comboPoints && unit.comboPoints.current > 0;
    },

    // ===== Layer 2: Battlefield =====

    _buildBattlefieldLayer(unit, battlefield) {
        if (!battlefield) {
            return { allies: [], enemies: [] };
        }

        const unitSide = this._findUnitSide(unit.id, battlefield);
        const allySide = unitSide === 'player' ? 'player' : 'enemy';
        const enemySide = unitSide === 'player' ? 'enemy' : 'player';

        const allyUnits = this._getUnitsFromSide(battlefield, allySide);
        const enemyUnits = this._getUnitsFromSide(battlefield, enemySide);

        return {
            allies: allyUnits.map(u => this._buildUnitSummary(u)),
            enemies: enemyUnits.map(u => this._buildUnitSummary(u))
        };
    },

    _findUnitSide(unitId, battlefield) {
        // 检查 player side
        const playerPositions = battlefield.playerPositions || {};
        for (const pos of Object.values(playerPositions)) {
            if (pos && pos.id === unitId) return 'player';
        }
        // 检查 enemy side
        const enemyPositions = battlefield.enemyPositions || {};
        for (const pos of Object.values(enemyPositions)) {
            if (pos && pos.id === unitId) return 'enemy';
        }
        return 'player'; // 默认
    },

    _getUnitsFromSide(battlefield, side) {
        const positions = side === 'player' 
            ? (battlefield.playerPositions || {})
            : (battlefield.enemyPositions || {});
        
        return Object.values(positions).filter(u => u && u.currentHp !== undefined);
    },

    _buildUnitSummary(unit) {
        return {
            id: unit.id,
            name: unit.name,
            classId: unit.classId,
            role: unit.role,
            hp: unit.currentHp,
            maxHp: unit.maxHp,
            hpPercent: unit.maxHp > 0 ? unit.currentHp / unit.maxHp : 0,
            position: unit.position || null,
            buffs: unit.buffs || [],
            debuffs: unit.debuffs || [],
            isAlive: unit.currentHp > 0,
            resource: unit.resource ? { ...unit.resource } : null,
            isPlayer: !!unit.isPlayer,
            isBoss: !!unit.isBoss
        };
    },

    // ===== Layer 3: Tactical =====

    _buildTacticalLayer(unit, battlefieldLayer, threatState, turnState) {
        const allies = battlefieldLayer.allies;
        const enemies = battlefieldLayer.enemies;

        return {
            teamSummary: this._buildTeamSummary(allies),
            enemySummary: this._buildTeamSummary(enemies),
            threatInfo: this._buildThreatInfo(unit, threatState, enemies),
            aoeValue: this._calcAoeValue(enemies),
            currentRound: turnState?.currentRound || 0
        };
    },

    _buildTeamSummary(units) {
        const alive = units.filter(u => u.isAlive);
        const hpPercents = alive.map(u => u.hpPercent);
        const avgHp = hpPercents.length > 0 
            ? hpPercents.reduce((a, b) => a + b, 0) / hpPercents.length 
            : 0;

        return {
            totalCount: units.length,
            aliveCount: alive.length,
            lowHpCount: alive.filter(u => u.hpPercent < 0.5).length,
            criticalHpCount: alive.filter(u => u.hpPercent < 0.3).length,
            avgHpPercent: avgHp,
            lowestHpUnit: alive.length > 0 
                ? alive.reduce((a, b) => a.hpPercent < b.hpPercent ? a : b)
                : null
        };
    },

    _buildThreatInfo(unit, threatState, enemies) {
        if (!threatState) return { hasTaunt: false, threatenedEnemies: [], topThreatTarget: null };

        const unitId = unit.id;
        const tauntState = threatState.tauntState || {};

        // 检查哪些敌人被嘲讽锁定在自己身上
        const tauntedOnSelf = enemies
            .filter(e => tauntState[e.id]?.tauntedBy === unitId)
            .map(e => e.id);

        // 检查哪些敌人仇恨最高是自己
        const threatenedEnemies = [];
        const threatTable = threatState.threatTable || {};
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            const table = threatTable[enemy.id];
            if (!table) continue;
            let maxThreat = -1;
            let topTarget = null;
            for (const [pid, val] of Object.entries(table)) {
                if (val > maxThreat) { maxThreat = val; topTarget = pid; }
            }
            if (topTarget === unitId) {
                threatenedEnemies.push(enemy.id);
            }
        }

        // 为当前单位计算仇恨最高的目标（用于敌方AI选目标）
        // 如果当前单位在 threatTable 中有记录，找出仇恨最高的对象
        let topThreatTarget = null;
        const myThreatTable = threatTable[unitId];
        if (myThreatTable) {
            // 先检查嘲讽
            const tauntInfo = tauntState[unitId];
            if (tauntInfo && tauntInfo.tauntedBy && tauntInfo.remainingRounds > 0) {
                // 被嘲讽了，优先攻击嘲讽者
                const tauntTarget = enemies.find(e => e.id === tauntInfo.tauntedBy && e.isAlive);
                if (tauntTarget) {
                    topThreatTarget = tauntTarget.id;
                }
            }
            
            if (!topThreatTarget) {
                let maxThreat = -1;
                for (const [targetId, val] of Object.entries(myThreatTable)) {
                    // 确保目标还活着
                    const targetAlive = enemies.find(e => e.id === targetId && e.isAlive);
                    if (targetAlive && val > maxThreat) {
                        maxThreat = val;
                        topThreatTarget = targetId;
                    }
                }
            }
        }

        return {
            hasTaunt: tauntedOnSelf.length > 0,
            tauntedOnSelf,
            threatenedEnemies,
            isTopThreatCount: threatenedEnemies.length,
            topThreatTarget
        };
    },

    _calcAoeValue(enemies) {
        const alive = enemies.filter(e => e.isAlive);
        if (alive.length <= 1) return 0;

        // AOE 价值：存活敌人数 / 总数，考虑 HP
        const avgHp = alive.reduce((a, b) => a + b.hpPercent, 0) / alive.length;
        return Math.min(1, alive.length / 5) * (1 - avgHp * 0.3);
    }
};

export { ContextBuilder };
