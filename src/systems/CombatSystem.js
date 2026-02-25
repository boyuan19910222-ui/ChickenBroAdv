/**
 * 战斗系统 - 回合制战斗核心逻辑
 * @class CombatSystem
 */
import { EffectSystem } from './EffectSystem.js'
import { AIDecisionSystem } from '../ai/AIDecisionSystem.js'
import { SkillExecutor } from '../ai/SkillExecutor.js'
import { ContextBuilder } from '../ai/ContextBuilder.js'
import { PetCombatSystem } from './PetCombatSystem.js'
import { ClassMechanics } from '../data/ClassMechanics.js'
import { EquipmentSystem } from './EquipmentSystem.js'
import { GameData } from '../data/GameData.js'
import { random, randomInt, randomChoice } from '../core/RandomProvider.js'

export class CombatSystem {
    constructor() {
        this.engine = null;
        this.inCombat = false;
        this.currentTurn = 'player'; // player | enemy
        this.turnCount = 0;
        this.enemy = null;
        this.combatLog = [];
        this.outOfCombatTime = null; // 脱战时间追踪
        this.activePet = null; // 当前战斗中的宠物实例
        this._rageDecayTimer = null; // 怒气衰减定时器
    }

    /**
     * 初始化系统
     * @param {GameEngine} engine - 游戏引擎实例
     */
    init(engine) {
        this.engine = engine;
        this.setupEventListeners();
        // 从存档恢复战斗状态（玩家可能在战斗中存档/加载）
        this._restoreCombatState();
    }

    /**
     * 从 stateManager 恢复战斗状态
     * 解决加载存档时 CombatSystem 实例状态未同步的问题
     */
    _restoreCombatState() {
        const combat = this.engine.stateManager?.get('combat');
        if (combat && combat.inCombat && combat.enemy) {
            this.inCombat = true;
            this.enemy = combat.enemy;
            this.currentTurn = combat.turn || 'player';
            this.turnCount = combat.turnCount || 1;
            this.combatLog = combat.log || [];
            this.activePet = combat.pet || null;
            console.log('[CombatSystem] 从存档恢复战斗状态:', { turn: this.currentTurn, enemy: this.enemy?.name, pet: this.activePet?.displayName });
        }
    }

    /**
     * 启动怒气衰减定时器（脱战后调用）
     * 简单可靠的定时器方案，不依赖帧循环
     */
    _startRageDecay() {
        this._stopRageDecay(); // 先清理已有定时器

        const player = this.engine.stateManager.get('player');
        if (!player?.resource || player.resource.type !== 'rage') return;
        if (player.resource.current <= 0) return;

        const rageConfig = GameData.resourceSystems.rage;
        if (!rageConfig?.decay?.enabled) return;

        const delay = (rageConfig.decay.delay || 3) * 1000; // 脱战延迟（ms）
        const rate = rageConfig.decay.rate || 2; // 每秒衰减量
        const TICK_MS = 500; // 每 500ms 衰减一次

        // 延迟后开始衰减
        this._rageDecayTimer = setTimeout(() => {
            this._rageDecayTimer = setInterval(() => {
                const p = this.engine.stateManager.get('player');
                if (!p?.resource || p.resource.type !== 'rage' || this.inCombat) {
                    this._stopRageDecay();
                    return;
                }

                if (p.resource.current <= 0) {
                    p.resource.current = 0;
                    this.engine.stateManager.set('player', p);
                    this._stopRageDecay();
                    return;
                }

                const decayAmount = rate * (TICK_MS / 1000);
                p.resource.current = Math.max(0, p.resource.current - decayAmount);
                this.engine.stateManager.set('player', p);

                if (p.resource.current <= 0) {
                    this._stopRageDecay();
                }
            }, TICK_MS);
        }, delay);
    }

    /**
     * 停止怒气衰减定时器
     */
    _stopRageDecay() {
        if (this._rageDecayTimer) {
            clearTimeout(this._rageDecayTimer);
            clearInterval(this._rageDecayTimer);
            this._rageDecayTimer = null;
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听战斗相关事件
        this.engine.eventBus.on('combat:start', (enemyId) => {
            this.startCombat(enemyId);
        });

        this.engine.eventBus.on('combat:playerAction', (action) => {
            this.handlePlayerAction(action);
        });

        this.engine.eventBus.on('combat:flee', () => {
            this.attemptFlee();
        });
    }

    /**
     * 开始战斗
     * @param {string} enemyId - 敌人ID
     */
    startCombat(enemyId) {
        this._stopRageDecay(); // 进入战斗时停止怒气衰减

        const enemyTemplate = GameData.monsters[enemyId];
        if (!enemyTemplate) {
            console.error(`未知敌人: ${enemyId}`);
            return;
        }

        const player = this.engine.stateManager.get('player');
        
        // 安全初始化（兼容旧存档缺少的字段）
        if (!player.skillCooldowns) player.skillCooldowns = {};
        if (!player.statistics) player.statistics = { monstersKilled: 0, damageDealt: 0, damageTaken: 0, healingDone: 0, goldEarned: 0 };
        if (!player.buffs) player.buffs = [];
        if (!player.debuffs) player.debuffs = [];
        
        // 根据区域等级范围缩放敌人属性
        // 怪物实际等级 = 区域等级范围内随机浮动，不会因玩家等级无限膨胀
        const currentArea = this.engine.stateManager.get('currentArea');
        const areaLevelRange = currentArea?.levelRange || { min: enemyTemplate.level, max: enemyTemplate.level };
        
        // 怪物实际等级：在区域等级范围内，以模板等级为基准小幅随机浮动（±1级）
        const minLevel = Math.max(areaLevelRange.min, enemyTemplate.level - 1);
        const maxLevel = Math.min(areaLevelRange.max, enemyTemplate.level + 1);
        const actualLevel = minLevel + random() * (maxLevel - minLevel);
        
        // 缩放因子 = 实际等级 / 模板等级（保证在合理范围内）
        const scaleFactor = enemyTemplate.level > 0 ? actualLevel / enemyTemplate.level : 1;

        // 创建敌人实例
        this.enemy = {
            ...enemyTemplate,
            level: Math.round(actualLevel),
            currentHp: Math.floor(enemyTemplate.stats.health * scaleFactor),
            maxHp: Math.floor(enemyTemplate.stats.health * scaleFactor),
            currentMana: enemyTemplate.stats.mana,
            maxMana: enemyTemplate.stats.mana,
            stats: {
                ...enemyTemplate.stats,
                strength: Math.floor(enemyTemplate.stats.strength * scaleFactor),
                agility: Math.floor(enemyTemplate.stats.agility * scaleFactor)
            },
            buffs: [],
            debuffs: []
        };

        this.inCombat = true;
        this.currentTurn = 'player';
        this.turnCount = 1;
        this.combatLog = [];
        
        // 停止脱战计时，防止怒气衰减
        // 所有资源类型（怒气/法力/能量）在连续战斗中都保持当前值
        this.outOfCombatTime = null;

        // 从 player state 恢复宠物（跨战斗持久化）
        this.activePet = null;
        if (player.activePet && player.activePet.isAlive) {
            this.activePet = { ...player.activePet };
            this.activePet.currentTarget = this.enemy.id;
            this.addLog(`${this.activePet.emoji} ${this.activePet.displayName} 准备战斗！`, 'system');
        }

        // 保存战斗状态
        this.engine.stateManager.set('combat', {
            inCombat: true,
            enemy: this.enemy,
            turn: this.currentTurn,
            turnCount: this.turnCount,
            log: this.combatLog,
            pet: this.activePet
        });

        // 切换到战斗场景
        this.engine.eventBus.emit('scene:change', 'combat');
        
        this.addLog(`⚔️ 战斗开始！遭遇 ${this.enemy.name}！`, 'system');
        // 延迟发射 combat:started，确保 Vue 完成 CombatView 组件挂载后再触发
        // （scene:change 会导致 v-if 切换，Vue 需要下一个 tick 才完成渲染）
        setTimeout(() => {
            this.engine.eventBus.emit('combat:started', { enemy: this.enemy });
        }, 50);
    }

    /**
     * 处理玩家行动
     * @param {Object} action - 行动数据
     */
    handlePlayerAction(action) {
        if (!this.inCombat || this.currentTurn !== 'player') return;

        const player = this.engine.stateManager.get('player');

        try {
            switch (action.type) {
                case 'attack':
                    this.playerAttack(player);
                    break;
                case 'skill':
                    this.playerUseSkill(player, action.skillId);
                    break;
                case 'defend':
                    this.playerDefend(player);
                    break;
                case 'item':
                    this.playerUseItem(player, action.itemId);
                    break;
            }
        } catch (e) {
            console.error('[CombatSystem] action error:', e);
            console.error('[CombatSystem] action error:', e);
        }

        // 检查战斗是否结束
        if (this.checkCombatEnd()) return;

        // 宠物自动攻击（玩家回合结束时）
        this._petAutoAttackNew();

        // 宠物技能冷却递减 + 限时检查
        this._petEndOfTurnTick();

        // 检查宠物攻击后战斗是否结束
        if (this.checkCombatEnd()) return;

        // 切换到敌人回合
        this.currentTurn = 'enemy';
        this.updateCombatState();
        
        // 延迟执行敌人回合
        setTimeout(() => {
            this.enemyTurn();
        }, 1000);
    }

    /**
     * 玩家普通攻击（集成武器伤害 + 护甲减伤）
     * @param {Object} player - 玩家数据
     */
    playerAttack(player) {
        const equipSys = this._getEquipmentSystem();
        const mainHand = player.equipment?.mainHand;

        // 基础伤害 = 武器伤害 + 力量/敏捷加成
        let baseDamage;
        if (mainHand && mainHand.damage) {
            baseDamage = equipSys ? equipSys.rollWeaponDamage(mainHand) : (mainHand.damage.min + randomInt(0, mainHand.damage.max - mainHand.damage.min));
            baseDamage += Math.floor((player.stats.strength || 0) * 0.5);
        } else {
            // 无武器：拳头伤害 = strength
            baseDamage = (player.stats.strength || player.stats.agility || 10);
        }

        // 护甲减伤
        const enemyArmor = this.enemy.armorValue || 0;
        const playerLevel = player.level || 1;
        if (equipSys && enemyArmor > 0) {
            const reduction = equipSys.getPhysicalReduction(enemyArmor, playerLevel);
            baseDamage = Math.floor(baseDamage * (1 - reduction));
        }

        // ±10% 浮动
        const variance = 0.9 + random() * 0.2;
        baseDamage = Math.max(1, Math.floor(baseDamage * variance));

        const isCrit = random() < (player.stats.agility / 100);
        const finalDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

        this.enemy.currentHp = Math.max(0, this.enemy.currentHp - finalDamage);
        
        const critText = isCrit ? '💥暴击！' : '';
        this.addLog(`${player.name} 普通攻击 ${this.enemy.name}，${critText}造成 ${finalDamage} 点伤害！`, 'combat', this._getPlayerClassColor());
        
        // 副手攻击（双持）
        const offHand = player.equipment?.offHand;
        if (offHand && offHand.damage && offHand.category === 'weapon' && equipSys) {
            const offDmg = equipSys.getOffHandDamage(equipSys.rollWeaponDamage(offHand));
            let offFinal = Math.max(1, Math.floor(offDmg * variance));
            const offCrit = random() < (player.stats.agility / 100);
            if (offCrit) offFinal = Math.floor(offFinal * 1.5);
            this.enemy.currentHp = Math.max(0, this.enemy.currentHp - offFinal);
            const offCritText = offCrit ? '💥暴击！' : '';
            this.addLog(`${player.name} 副手攻击，${offCritText}造成 ${offFinal} 点伤害！`, 'combat', this._getPlayerClassColor());
            player.statistics.damageDealt += offFinal;
        }
        
        // 生成资源（普攻产生怒气）
        this.generateResource(player, 'attack', isCrit);
        
        // 更新统计
        player.statistics.damageDealt += finalDamage;
        this.engine.stateManager.set('player', player);
        
        this.engine.eventBus.emit('combat:playerAttack', { damage: finalDamage, isCrit, skillName: '普通攻击' });
    }

    /**
     * 生成资源（怒气/能量等）
     * @param {Object} player - 玩家数据
     * @param {string} trigger - 触发类型 ('attack' | 'damaged' | 'skill')
     * @param {boolean} isCrit - 是否暴击
     * @param {number} customAmount - 自定义产生量（可选）
     */
    generateResource(player, trigger, isCrit = false, customAmount = null) {
        if (!player.resource) return;
        
        const resourceType = player.resource.type;
        const resourceConfig = GameData.resourceSystems[resourceType];
        
        if (!resourceConfig || !resourceConfig.generation) return;
        
        let amount = 0;
        
        if (customAmount !== null) {
            amount = customAmount;
        } else if (trigger === 'attack' && resourceConfig.generation.onAttack) {
            amount = resourceConfig.generation.onAttack;
            if (isCrit && resourceConfig.generation.critMultiplier) {
                amount = Math.floor(amount * resourceConfig.generation.critMultiplier);
            }
        } else if (trigger === 'damaged' && resourceConfig.generation.onHit) {
            amount = resourceConfig.generation.onHit;
        }
        
        if (amount > 0) {
            const oldValue = player.resource.current;
            player.resource.current = Math.min(player.resource.max, player.resource.current + amount);
            const actualGain = player.resource.current - oldValue;
            
            if (actualGain > 0) {
                const emoji = resourceConfig.emoji || '⚡';
                this.addLog(`${emoji} +${actualGain} ${resourceConfig.displayName}`, 'system', this._getPlayerClassColor());
            }
        }
    }

    /**
     * 玩家使用技能
     * @param {Object} player - 玩家数据
     * @param {string} skillId - 技能ID
     */
    playerUseSkill(player, skillId) {
        const skill = GameData.skills[skillId];
        if (!skill) {
            this.addLog('未知技能！', 'system');
            return;
        }

        // 检查等级解锁
        if (skill.unlockLevel && (player.level || 1) < skill.unlockLevel) {
            this.addLog(`${skill.name} 需要等级 ${skill.unlockLevel} 才能使用！`, 'system');
            return;
        }

        // 检查冷却
        if (player.skillCooldowns[skillId] > 0) {
            this.addLog(`${skill.name} 正在冷却中（${player.skillCooldowns[skillId]}回合）`, 'system');
            return;
        }

        // 检查终结技连击点（新 schema: comboPoints.requires）
        const requiresCombo = skill.comboPoints?.requires || skill.requiresComboPoints;
        if (requiresCombo) {
            if (!player.comboPoints || player.comboPoints.current <= 0) {
                this.addLog(`需要连击点！`, 'system');
                return;
            }
        }

        // 检查资源消耗
        const resourceCost = skill.resourceCost;
        if (resourceCost && resourceCost.value > 0) {
            if (player.resource && (!resourceCost.type || resourceCost.type === player.resource.type)) {
                const resourceConfig = GameData.resourceSystems[player.resource.type];
                const resourceName = resourceConfig ? resourceConfig.displayName : '资源';
                if (player.resource.current < resourceCost.value) {
                    this.addLog(`${resourceName}不足！需要 ${resourceCost.value}，当前 ${Math.floor(player.resource.current)}`, 'system');
                    return;
                }
                player.resource.current -= resourceCost.value;
            } else if (player.currentMana !== undefined) {
                const manaCost = skill.manaCost || resourceCost.value;
                if (player.currentMana < manaCost) {
                    this.addLog(`法力不足！需要 ${manaCost}，当前 ${player.currentMana}`, 'system');
                    return;
                }
                player.currentMana -= manaCost;
            }
        }

        // 设置冷却
        player.skillCooldowns[skillId] = skill.cooldown;

        // 处理技能产生资源
        if (skill.generatesResource) {
            this.generateResource(player, 'skill', false, skill.generatesResource.value);
        }

        let skillDamage = 0;
        let skillIsCrit = false;
        const critChance = (player.stats.agility || 10) / 100;

        // 检查 vanish buff（下次暴击）
        if (EffectSystem.hasBuff(player, 'vanish')) {
            skillIsCrit = true;
            player.buffs = player.buffs.filter(b => b.name !== 'vanish');
        }

        // 处理终结技（连击点消耗技能）
        const damageTable = skill.comboPoints?.damageTable || skill.comboPointsDamage;
        if (requiresCombo && damageTable) {
            const comboPoints = player.comboPoints.current;
            const damageData = damageTable.find(d => d.points === comboPoints) || damageTable[0];
            const baseStat = player.stats[skill.damage?.stat || 'agility'] || player.stats.agility || 10;
            let damage = Math.floor(damageData.base + baseStat * damageData.scaling);
            
            if (!skillIsCrit) skillIsCrit = random() < critChance;
            if (skillIsCrit) damage = Math.floor(damage * 1.5);
            
            // Shield 吸收
            const { actualDamage } = EffectSystem.absorbDamage(this.enemy, damage);
            this.enemy.currentHp = Math.max(0, this.enemy.currentHp - actualDamage);
            skillDamage = actualDamage;
            
            const critText = skillIsCrit ? '💥暴击！' : '';
            this.addLog(`${player.name} 使用 ${skill.name}（${comboPoints}连击点），${critText}造成 ${actualDamage} 点伤害！`, 'combat', this._getPlayerClassColor());
            this.addLog(`🗡️ 消耗 ${comboPoints} 连击点`, 'system', this._getPlayerClassColor());
            player.statistics.damageDealt += actualDamage;
            player.comboPoints.current = 0;
        } else if (skill.damage) {
            // 普通伤害技能
            let damage = EffectSystem.resolveSkillDamage(skill, player);
            
            // 斩杀条件：目标低于阈值时伤害翻倍
            if (skill.conditions?.targetBelowHp) {
                const hpPercent = this.enemy.currentHp / this.enemy.maxHp;
                if (hpPercent <= skill.conditions.targetBelowHp) {
                    damage = Math.floor(damage * 2);
                    this.addLog(`💀 斩杀！目标血量低于${skill.conditions.targetBelowHp * 100}%，伤害翻倍！`, 'system', this._getPlayerClassColor());
                }
            }
            
            if (!skillIsCrit) skillIsCrit = random() < critChance;
            if (skillIsCrit) damage = Math.floor(damage * 1.5);
            
            // Shield 吸收
            const { actualDamage } = EffectSystem.absorbDamage(this.enemy, damage);
            this.enemy.currentHp = Math.max(0, this.enemy.currentHp - actualDamage);
            skillDamage = actualDamage;
            
            const critText = skillIsCrit ? '💥暴击！' : '';
            const dmgTypeEmoji = this._getDamageTypeEmoji(skill.damageType);
            this.addLog(`${player.name} 使用 ${skill.name}，${critText}造成 ${actualDamage} 点${dmgTypeEmoji}伤害！`, 'combat', this._getPlayerClassColor());
            player.statistics.damageDealt += actualDamage;
            
            // Builder 产生连击点（新 schema: comboPoints.generates）
            const generates = skill.comboPoints?.generates || skill.comboPointsGenerated;
            if (generates && player.comboPoints) {
                const oldCombo = player.comboPoints.current;
                player.comboPoints.current = Math.min(player.comboPoints.max, player.comboPoints.current + generates);
                const actualGain = player.comboPoints.current - oldCombo;
                if (actualGain > 0) {
                    this.addLog(`🗡️ +${actualGain} 连击点`, 'system', this._getPlayerClassColor());
                }
            }
            
            // 吸取生命效果
            const lifesteal = EffectSystem.normalizeEffects(skill).find(e => e.type === 'lifesteal');
            if (lifesteal) {
                const healAmount = Math.floor(actualDamage * lifesteal.value);
                player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
                this.addLog(`🩸 ${player.name} 吸取 ${healAmount} 点生命！`, 'combat', this._getPlayerClassColor());
                player.statistics.healingDone += healAmount;
            }
        }

        // 治疗效果（开放世界中治疗自己）
        if (skill.heal) {
            const healAmount = EffectSystem.resolveSkillHeal(skill, player);
            player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
            this.addLog(`${player.name} 使用 ${skill.name}，恢复 ${healAmount} 点生命！`, 'combat', this._getPlayerClassColor());
            player.statistics.healingDone += healAmount;
        }

        // 施加效果（使用 EffectSystem）
        const effects = EffectSystem.normalizeEffects(skill);
        if (effects.length > 0) {
            for (const effect of effects) {
                if (effect.type === 'lifesteal') continue; // 已处理
                
                // 确定效果目标
                const effectTarget = (effect.type === 'buff' || effect.type === 'hot' || effect.type === 'shield')
                    ? player 
                    : (skill.targetType === 'self' ? player : this.enemy);
                
                EffectSystem.applySingleEffect(player, effectTarget, effect, {
                    onSummon: (source, eff) => this._handleSummon(source, eff)
                });
                
                if (effect.type === 'buff' || effect.type === 'hot' || effect.type === 'shield') {
                    this.addLog(`${player.name} 获得了 ${skill.name} 效果！`, 'system');
                } else if (effect.type === 'dot') {
                    this.addLog(`${this.enemy.name} 受到了 ${effect.name} 效果！`, 'system');
                } else if (effect.type === 'cc') {
                    this.addLog(`${this.enemy.name} 被${effect.ccType === 'stun' ? '眩晕' : effect.ccType === 'fear' ? '恐惧' : '控制'}了！`, 'system');
                } else if (effect.type === 'debuff') {
                    this.addLog(`${this.enemy.name} 受到了 ${effect.name} 效果！`, 'system');
                }
            }
        }

        this.engine.stateManager.set('player', player);

        // 攻击触发型资源生成（如普通攻击产生怒气）
        if (skill.attackResourceGen) {
            this.generateResource(player, 'attack', skillIsCrit);
        }

        this.engine.eventBus.emit('combat:skillUsed', { skill, player, damage: skillDamage, isCrit: skillIsCrit, skillName: skill.name });
    }

    /**
     * 获取伤害类型 emoji
     */
    _getDamageTypeEmoji(damageType) {
        const emojis = {
            physical: '',
            fire: '🔥',
            frost: '❄️',
            nature: '🌿',
            arcane: '✨',
            holy: '✝️',
            shadow: '🌑'
        };
        return emojis[damageType] || '';
    }

    /**
     * 获取玩家职业颜色
     */
    _getPlayerClassColor() {
        const player = this.engine.stateManager.get('player');
        const classId = player?.class || player?.classId;
        const cls = GameData.classes[classId];
        return cls?.color || null;
    }

    /**
     * 玩家防御
     * @param {Object} player - 玩家数据
     */
    playerDefend(player) {
        player.buffs.push({
            name: 'defend',
            value: 0.5,
            remainingDuration: 1
        });
        
        this.addLog(`${player.name} 进入防御姿态，下次受到的伤害减少50%！`, 'system', this._getPlayerClassColor());
        this.engine.stateManager.set('player', player);
    }

    /**
     * 玩家使用物品
     * @param {Object} player - 玩家数据
     * @param {string} itemId - 物品ID
     */
    playerUseItem(player, itemId) {
        const inventory = this.engine.stateManager.get('inventory') || [];
        const itemIndex = inventory.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) {
            this.addLog('物品不存在！', 'system');
            return;
        }

        const item = GameData.items[itemId];
        if (!item) return;

        // 应用物品效果
        if (item.effect.type === 'heal') {
            player.currentHp = Math.min(player.maxHp, player.currentHp + item.effect.value);
            this.addLog(`${player.name} 使用 ${item.name}，恢复 ${item.effect.value} 点生命！`, 'system', this._getPlayerClassColor());
        } else if (item.effect.type === 'mana') {
            player.currentMana = Math.min(player.maxMana, player.currentMana + item.effect.value);
            this.addLog(`${player.name} 使用 ${item.name}，恢复 ${item.effect.value} 点法力！`, 'system', this._getPlayerClassColor());
        }

        // 移除物品
        inventory.splice(itemIndex, 1);
        this.engine.stateManager.set('inventory', inventory);
        this.engine.stateManager.set('player', player);
    }

    /**
     * 敌人回合 — 使用 AI 决策系统
     */
    enemyTurn() {
        if (!this.inCombat) return;

        const player = this.engine.stateManager.get('player');
        
        // 检查敌人是否被 CC 控制（使用 EffectSystem）
        if (EffectSystem.isUnitCCed(this.enemy)) {
            const ccType = EffectSystem.getCCType(this.enemy);
            const ccText = ccType === 'stun' ? '眩晕' : ccType === 'fear' ? '恐惧' : '控制';
            this.addLog(`${this.enemy.name} 被${ccText}，无法行动！`, 'system');
        } else {
            // 初始化敌人运行时字段
            if (!this.enemy.skillCooldowns) this.enemy.skillCooldowns = {};
            if (!this.enemy.buffs) this.enemy.buffs = [];
            if (!this.enemy.debuffs) this.enemy.debuffs = [];

            // 冷却递减
            SkillExecutor.tickCooldowns(this.enemy);

            // 构建 AI 战斗状态（野外 1v1）
            const battleState = this._buildOverworldBattleState(player);

            // AI 决策
            const decision = AIDecisionSystem.decideAction(this.enemy, battleState);

            if (decision) {
                const skill = this._resolveEnemySkill(decision.skillId);
                if (skill) {
                    // 执行技能（目标是玩家）
                    const battleContext = { combatType: 'overworld' };
                    const result = SkillExecutor.executeSkill(this.enemy, skill, [player], battleContext);

                    if (result.success) {
                        const normalizedSkill = ContextBuilder.normalizeSkill(skill);
                        const skillName = normalizedSkill.name || '技能';
                        
                        // 处理结果
                        for (const res of result.results) {
                            if (res.type === 'damage') {
                                player.statistics.damageTaken += res.damage;
                                const critText = res.isCrit ? '💥暴击！' : '';
                                this.addLog(`${this.enemy.name} 使用 ${skillName}，${critText}造成 ${res.damage} 点伤害！`, 'combat');
                                this.engine.eventBus.emit('combat:enemyAttack', { damage: res.damage, isCrit: res.isCrit, target: 'player' });
                                // 玩家被击中产生怒气
                                this.generateResource(player, 'damaged');
                            } else if (res.type === 'heal') {
                                this.addLog(`${this.enemy.name} 恢复了 ${res.heal} 点生命！`, 'combat');
                            }
                        }

                        // 效果日志
                        const effects = EffectSystem.normalizeEffects(normalizedSkill);
                        for (const eff of effects) {
                            if (eff.type === 'dot') {
                                this.addLog(`${player.name} 受到了 ${eff.name} 效果！`, 'system');
                            } else if (eff.type === 'cc') {
                                this.addLog(`${player.name} 被${eff.ccType === 'stun' ? '眩晕' : '控制'}了！`, 'system');
                            } else if (eff.type === 'debuff') {
                                this.addLog(`${player.name} 受到了 ${eff.name} 效果！`, 'system');
                            } else if (eff.type === 'buff') {
                                this.addLog(`${this.enemy.name} 获得了 ${eff.name} 效果！`, 'system');
                            }
                        }
                    } else {
                        // 技能执行失败，降级为物理攻击
                        this._enemyBasicPhysicalAttack(player);
                    }
                } else {
                    this._enemyBasicPhysicalAttack(player);
                }
            } else {
                // 无 AI 决策，使用基础物理攻击
                this._enemyBasicPhysicalAttack(player);
            }
        }

        // 回合结束结算：使用 EffectSystem 统一处理 DOT/HOT/buff/debuff
        const endOfTurnLogs = EffectSystem.processEndOfTurn([player, this.enemy], {
            onDamage: (unit, dmg, source) => {
                this.addLog(`${unit.name || '目标'} 受到 ${dmg} 点 ${source} 伤害！`, 'combat');
                if (unit === player) {
                    player.statistics.damageTaken += dmg;
                    // DOT伤害浮动数字 - 玩家受到伤害
                    this.engine.eventBus.emit('combat:enemyAttack', { damage: dmg, isCrit: false, target: 'player', isDot: true });
                }
                if (unit === this.enemy) {
                    player.statistics.damageDealt += dmg;
                    // DOT伤害浮动数字 - 敌人受到伤害
                    this.engine.eventBus.emit('combat:skillUsed', { skill: null, player, damage: dmg, isCrit: false, isDot: true });
                }
            },
            onHeal: (unit, heal, source) => {
                this.addLog(`${unit.name || '目标'} 恢复 ${heal} 点生命（${source}）！`, 'combat');
                if (unit === player) player.statistics.healingDone += heal;
            }
        });
        
        // 能量回合恢复
        this.regenerateEnergyPerTurn(player);
        
        this.engine.stateManager.set('player', player);

        // 检查战斗是否结束
        if (this.checkCombatEnd()) return;

        // 减少技能冷却
        Object.keys(player.skillCooldowns).forEach(skillId => {
            if (player.skillCooldowns[skillId] > 0) {
                player.skillCooldowns[skillId]--;
            }
        });

        // 切换回玩家回合
        this.turnCount++;
        this.currentTurn = 'player';
        this.updateCombatState();
        
        this.addLog(`--- 第 ${this.turnCount} 回合 ---`, 'system');
        this.engine.eventBus.emit('combat:turnChange', { turn: 'player', turnCount: this.turnCount });
    }

    /**
     * 敌人基础物理攻击（降级方案，集成护甲减伤）
     */
    _enemyBasicPhysicalAttack(player) {
        // 方案 D：根据宠物类型决定敌人攻击目标
        const target = this._pickEnemyTarget(player);
        
        if (target === 'pet' && this.activePet) {
            this._enemyAttackPet();
            return;
        }
        
        // 敌人基础伤害
        let baseDamage = (this.enemy.stats.strength || 15) * 2;
        
        // 玩家护甲减伤
        const equipSys = this._getEquipmentSystem();
        if (equipSys && player.equipment) {
            const totalArmor = equipSys.getTotalArmor(player);
            const enemyLevel = this.enemy.level || 1;
            const reduction = equipSys.getPhysicalReduction(totalArmor, enemyLevel);
            baseDamage = Math.floor(baseDamage * (1 - reduction));
        }
        
        // ±10% 浮动
        const variance = 0.9 + random() * 0.2;
        baseDamage = Math.max(1, Math.floor(baseDamage * variance));
        
        const isCrit = random() < (this.enemy.stats.agility / 150);
        const critDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;
        
        const { actualDamage } = EffectSystem.absorbDamage(player, critDamage);
        
        player.currentHp -= actualDamage;
        player.statistics.damageTaken += actualDamage;
        
        const critText = isCrit ? '💥暴击！' : '';
        this.addLog(`${this.enemy.name} 攻击 ${player.name}，${critText}造成 ${actualDamage} 点伤害！`, 'combat');
        
        this.engine.eventBus.emit('combat:enemyAttack', { damage: actualDamage, isCrit, target: 'player' });
        this.generateResource(player, 'damaged');
    }

    /**
     * 构建野外战斗 AI 状态
     */
    _buildOverworldBattleState(player) {
        // 构建一个简化的 battlefield 用于 ContextBuilder
        // 野外 1v1：玩家方 1 人 vs 敌方 1 人
        return {
            battlefield: {
                playerPositions: {
                    1: { id: player.id || 'player', ...player }
                },
                enemyPositions: {
                    1: { id: this.enemy.id, ...this.enemy }
                }
            },
            threatState: null,
            turnState: { currentRound: this.turnCount },
            gameData: GameData,
            combatType: 'overworld',
            partyMembers: [player],
            enemies: [this.enemy]
        };
    }

    /**
     * 解析敌人技能 ID
     */
    _resolveEnemySkill(skillId) {
        if (!skillId) return null;
        // 查 GameData
        if (GameData?.skills?.[skillId]) return GameData.skills[skillId];
        // 查单位自带
        if (this.enemy.skills) {
            for (const sk of this.enemy.skills) {
                if (typeof sk === 'object' && sk.id === skillId) return sk;
            }
        }
        return null;
    }

    /**
     * 更新buff和debuff（保留向后兼容，实际逻辑已移至 EffectSystem.processEndOfTurn）
     * @param {Object} player - 玩家数据
     */
    updateBuffsAndDebuffs(player) {
        // 此方法保留但不再主动调用
        // 效果结算已在 enemyTurn 中通过 EffectSystem.processEndOfTurn 处理
    }

    /**
     * 能量回合恢复
     * @param {Object} player - 玩家数据
     */
    regenerateEnergyPerTurn(player) {
        if (!player.resource || player.resource.type !== 'energy') return;
        
        const resourceConfig = GameData.resourceSystems.energy;
        if (!resourceConfig || !resourceConfig.generation || !resourceConfig.generation.perTurn) return;
        
        const regenAmount = resourceConfig.generation.perTurn;
        const oldValue = player.resource.current;
        player.resource.current = Math.min(player.resource.max, player.resource.current + regenAmount);
        const actualGain = player.resource.current - oldValue;
        
        if (actualGain > 0) {
            this.addLog(`⚡ +${actualGain} 能量`, 'system');
        }
    }

    /**
     * 计算伤害（集成护甲减伤系统）
     * 物理伤害: strength * 2 → 护甲减伤（getPhysicalReduction）
     * 法术伤害: intellect * 2.5 → 魔抗减伤（保留旧逻辑）
     * @param {Object} attackerStats - 攻击者属性
     * @param {Object} defenderStats - 防御者属性
     * @param {string} damageType - 伤害类型
     * @param {Object} [context] - 可选上下文 { defender, attackerLevel }
     * @returns {number} 最终伤害
     */
    calculateDamage(attackerStats, defenderStats, damageType, context = {}) {
        let baseDamage;
        
        if (damageType === 'physical') {
            baseDamage = attackerStats.strength * 2;
            // 护甲减伤 — 优先使用 EquipmentSystem 的护甲公式
            const equipSys = this._getEquipmentSystem();
            const defender = context.defender;
            if (equipSys && defender && defender.equipment) {
                const totalArmor = equipSys.getTotalArmor(defender);
                const attackerLevel = context.attackerLevel || 1;
                const reduction = equipSys.getPhysicalReduction(totalArmor, attackerLevel);
                baseDamage = Math.floor(baseDamage * (1 - reduction));
            } else {
                // 敌人没有装备系统时，用 armorValue 或 stamina 降级
                const armor = defenderStats.armorValue || defenderStats.stamina || 0;
                const attackerLevel = context.attackerLevel || 1;
                const reduction = armor / (armor + 400 * attackerLevel);
                baseDamage = Math.floor(baseDamage * (1 - reduction));
            }
        } else {
            baseDamage = attackerStats.intellect * 2.5;
            // 魔抗减伤（保留旧逻辑）
            const resist = defenderStats.intellect / 2 || 0;
            const reduction = resist / (resist + 100);
            baseDamage = Math.floor(baseDamage * (1 - reduction));
        }

        // 随机浮动 ±10%
        const variance = 0.9 + random() * 0.2;
        return Math.max(1, Math.floor(baseDamage * variance));
    }

    /**
     * 获取 EquipmentSystem 实例
     */
    _getEquipmentSystem() {
        return this.engine?.systems?.get('equipment') || null;
    }

    /**
     * 检查战斗是否结束
     * @returns {boolean} 是否结束
     */
    checkCombatEnd() {
        const player = this.engine.stateManager.get('player');

        // 玩家死亡
        if (player.currentHp <= 0) {
            this.endCombat(false);
            return true;
        }

        // 敌人死亡
        if (this.enemy.currentHp <= 0) {
            this.endCombat(true);
            return true;
        }

        return false;
    }

    /**
     * 结束战斗
     * @param {boolean} victory - 是否胜利
     */
    endCombat(victory) {
        this.inCombat = false;
        this.outOfCombatTime = Date.now(); // 开始脱战计时
        this._startRageDecay(); // 脱战后启动怒气衰减
        const player = this.engine.stateManager.get('player');

        // 战斗结束时清空连击点
        if (player.comboPoints) {
            player.comboPoints.current = 0;
        }

        // 清理战斗中产生的临时 buff/debuff
        if (player.buffs) player.buffs = [];
        if (player.debuffs) player.debuffs = [];

        // 保存宠物状态回 player（跨战斗持久化，保持战斗结束时的状态）
        if (this.activePet) {
            player.activePet = {
                ...this.activePet,
                currentTarget: null  // 清除战斗目标
            };
        }

        if (victory) {
            // 计算奖励
            const loot = this.enemy.loot;
            const goldEarned = randomInt(loot.gold.min, loot.gold.max);
            
            // 经验值计算：基础值 → ±10%浮动 → 等级差惩罚
            const baseExp = loot.exp;
            const variation = 1 + (random() * 0.2 - 0.1); // ±10%
            let expAfterVariation = Math.max(1, Math.floor(baseExp * variation));
            
            // 等级差惩罚
            const levelDiff = player.level - (this.enemy.level || 1);
            let penaltyMultiplier = 1.0;
            if (levelDiff >= 7) penaltyMultiplier = 0;
            else if (levelDiff >= 5) penaltyMultiplier = 0.5;
            else if (levelDiff >= 3) penaltyMultiplier = 0.7;
            
            const expEarned = Math.floor(expAfterVariation * penaltyMultiplier);
            const hasPenalty = penaltyMultiplier < 1.0;

            player.gold += goldEarned;
            player.statistics.goldEarned += goldEarned;
            player.statistics.monstersKilled++;

            this.addLog(`🎉 战斗胜利！`, 'system');
            if (expEarned > 0) {
                this.addLog(`⭐ +${expEarned} 经验值${hasPenalty ? ' (等级惩罚)' : ''}`, 'system');
            } else if (penaltyMultiplier === 0) {
                this.addLog(`⭐ 经验值太低，未获得经验`, 'system');
            }

            // 金币掉落 → 仅写入掉落日志
            this.engine.eventBus.emit('loot:log', `💰 +${goldEarned} 金币 — ${this.enemy.name}`);

            this.engine.stateManager.set('player', player);
            
            // 添加经验
            if (expEarned > 0) {
                this.engine.eventBus.emit('exp:gain', expEarned);
            }

            // 掉落物品
            if (loot.items && loot.items.length > 0) {
                const droppedItem = randomChoice(loot.items);
                if (random() < 0.5) { // 50%掉落率
                    const inventory = this.engine.stateManager.get('inventory') || [];
                    inventory.push({ id: droppedItem, quantity: 1 });
                    this.engine.stateManager.set('inventory', inventory);
                    // 物品掉落 → 仅写入掉落日志
                    this.engine.eventBus.emit('loot:log', `📦 ${GameData.items[droppedItem]?.name || droppedItem} — ${this.enemy.name}`);
                }
            }

            this.engine.eventBus.emit('combat:victory', { enemy: this.enemy, gold: goldEarned, exp: expEarned });
        } else {
            this.addLog(`💀 战斗失败...`, 'system');
            
            // 死亡惩罚：满级扣10%金币，否则扣30%经验
            if (player.level >= 60) {
                const goldLost = Math.floor(player.gold * 0.1);
                player.gold -= goldLost;
                if (goldLost > 0) {
                    this.addLog(`💸 损失 ${goldLost} 金币`, 'system');
                    this.engine.eventBus.emit('loot:log', `💸 -${goldLost} 金币（死亡惩罚）`);
                }
            } else {
                const expLost = Math.floor(player.experience * 0.3);
                if (expLost > 0) {
                    player.experience = Math.max(0, player.experience - expLost);
                    this.addLog(`💀 损失 ${expLost} 经验值`, 'system');
                    this.engine.eventBus.emit('loot:log', `💀 -${expLost} 经验值（死亡惩罚）`);
                }
            }
            
            player.currentHp = Math.floor(player.maxHp * 0.2); // 复活时20%血量

            // 死亡复活：怒气清零（怒气是战斗资源，死亡后不应保留）
            if (player.resource && player.resource.type === 'rage') {
                player.resource.current = 0;
            }
            
            this.engine.stateManager.set('player', player);
            this.engine.eventBus.emit('combat:defeat', {});
        }

        // 清理战斗状态
        this.engine.stateManager.set('combat', null);
        this.enemy = null;
        this.activePet = null;

        // 切换回探索场景
        setTimeout(() => {
            this.engine.eventBus.emit('scene:change', 'exploration');
        }, 2000);
    }

    /**
     * 尝试逃跑
     */
    attemptFlee() {
        if (!this.inCombat || this.currentTurn !== 'player') return;

        const player = this.engine.stateManager.get('player');
        const fleeChance = 0.3 + (player.stats.agility / 100);

        if (random() < fleeChance) {
            this.addLog(`🏃 ${player.name} 成功逃跑了！`, 'system');
            this.inCombat = false;
            this.outOfCombatTime = Date.now(); // 开始脱战计时（怒气衰减等）
            this._startRageDecay(); // 逃跑后启动怒气衰减
            
            // 逃跑时清空连击点
            if (player.comboPoints) {
                player.comboPoints.current = 0;
            }
            
            // 清理战斗中产生的临时 buff/debuff
            if (player.buffs) player.buffs = [];
            if (player.debuffs) player.debuffs = [];
            
            // 保存宠物状态回 player
            if (this.activePet) {
                player.activePet = { ...this.activePet, currentTarget: null };
            }
            
            this.engine.stateManager.set('player', player);
            
            this.engine.stateManager.set('combat', null);
            this.enemy = null;
            this.activePet = null;
            this.engine.eventBus.emit('combat:fled');
            this.engine.eventBus.emit('scene:change', 'exploration');
        } else {
            this.addLog(`🏃 ${player.name} 逃跑失败！`, 'system');
            // 逃跑失败，敌人获得一次免费攻击
            this.currentTurn = 'enemy';
            this.updateCombatState();
            setTimeout(() => this.enemyTurn(), 500);
        }
    }

    // ═══════════════════════════════════════════
    // 宠物系统方法
    // ═══════════════════════════════════════════

    /**
     * 处理召唤效果 — EffectSystem 的 onSummon 回调
     * 统一使用 PetCombatSystem.createPetFromConfig
     */
    _handleSummon(source, effect) {
        const player = this.engine.stateManager.get('player');
        const summonType = effect.summonType; // 'pet' or 'demon'
        const summonId = effect.summonId;

        // 如果有指定 summonId，直接召唤
        if (summonId) {
            this._doSummon(player, summonId);
            return;
        }

        // 判断是否需要弹窗选择
        if (summonType === 'pet') {
            // 猎人：检查是否有野兽控制天赋T4
            const hasBeastMastery = this._hasBeastMasteryTalent(player);
            if (!hasBeastMastery) {
                // 无天赋，直接召唤狼
                this._doSummon(player, 'wolf');
            } else {
                // 有天赋，需要弹窗选择 — 通过事件通知 UI
                const available = PetCombatSystem.getAvailableSummons(player, true);
                this.engine.eventBus.emit('combat:showSummonPanel', {
                    summons: available,
                    callback: (selectedId) => this._doSummon(player, selectedId)
                });
            }
        } else if (summonType === 'demon') {
            // 术士：弹窗选择恶魔
            const available = PetCombatSystem.getAvailableSummons(player, false);
            if (available.filter(s => s.unlocked).length === 1) {
                // 只有一个可选，直接召唤
                this._doSummon(player, available.find(s => s.unlocked).id);
            } else {
                this.engine.eventBus.emit('combat:showSummonPanel', {
                    summons: available,
                    callback: (selectedId) => this._doSummon(player, selectedId)
                });
            }
        }
    }

    /**
     * 执行实际召唤
     */
    _doSummon(player, summonId) {
        const pet = PetCombatSystem.createPetFromConfig(player, summonId);
        if (!pet) return;

        pet.currentTarget = this.enemy?.id;
        this.activePet = pet;

        player.activePet = { ...this.activePet };
        this.engine.stateManager.set('player', player);

        this.addLog(`${pet.emoji} ${pet.name} 响应了召唤！`, 'system');
        this.updateCombatState();
        this.engine.eventBus.emit('combat:petSummoned', { pet: this.activePet });
    }

    /**
     * 检查猎人是否有野兽控制天赋T4（enhance_skill 类型的 beastMasteryTalent）
     */
    _hasBeastMasteryTalent(player) {
        if (!player.talents) return false;
        return player.talents.some(t => t.id === 'beastMasteryTalent' && t.currentPoints > 0);
    }

    /**
     * 宠物自动攻击 — 委托 PetCombatSystem
     */
    _petAutoAttackNew() {
        if (!this.activePet || !this.activePet.isAlive || !this.enemy) return;

        // 确保宠物有目标
        this.activePet.currentTarget = this.enemy.id;

        // 构建临时 petState 供 PetCombatSystem 使用
        const petState = {
            pets: { [this.activePet.id]: this.activePet },
            ownerPetMap: { [this.activePet.ownerId]: this.activePet.id }
        };

        const result = PetCombatSystem.performAutoAttack(petState, this.activePet.ownerId);
        if (!result) return;

        // 应用伤害
        this.enemy.currentHp = Math.max(0, this.enemy.currentHp - result.damage);

        // 日志
        if (result.skill) {
            this.addLog(`${result.emoji} ${this.activePet.displayName || this.activePet.name} 使用 ${result.skill.name}，造成 ${result.damage} 点伤害！`, 'combat');
        } else {
            this.addLog(`${result.emoji} ${this.activePet.displayName || this.activePet.name} 攻击 ${this.enemy.name}，造成 ${result.damage} 点伤害！`, 'combat');
        }

        this.engine.eventBus.emit('combat:petAttack', { damage: result.damage, pet: this.activePet });
        this.updateCombatState();
    }

    /**
     * 回合结束时递减宠物技能冷却 + 检查限时
     */
    _petEndOfTurnTick() {
        if (!this.activePet || !this.activePet.isAlive) return;

        const petState = {
            pets: { [this.activePet.id]: this.activePet },
            ownerPetMap: { [this.activePet.ownerId]: this.activePet.id }
        };

        PetCombatSystem.tickCooldowns(petState, this.activePet.ownerId);

        const expired = PetCombatSystem.tickTimeLimited(petState, this.activePet.ownerId);
        if (expired) {
            this.addLog(`💀 ${this.activePet.displayName || this.activePet.name} 的召唤时间结束了！`, 'system');
            this.engine.eventBus.emit('combat:petDied', { pet: this.activePet });
            const player = this.engine.stateManager.get('player');
            if (player) {
                player.activePet = { ...this.activePet };
                this.engine.stateManager.set('player', player);
            }
        }
    }

    /**
     * 方案 D：根据宠物 role 决定敌人攻击目标
     * @returns {'player'|'pet'} 攻击目标
     */
    _pickEnemyTarget(player) {
        if (!this.activePet || !this.activePet.isAlive) return 'player';

        // 根据宠物 role 决定概率
        const role = this.activePet.role;
        let petTargetChance;
        switch (role) {
            case 'tank':        petTargetChance = 0.70; break;  // 虚空行者
            case 'aoe_damage':  petTargetChance = 0.50; break;  // 地狱火
            case 'anti_caster': petTargetChance = 0.30; break;  // 地狱猎犬
            case 'control':     petTargetChance = 0.20; break;  // 魅魔
            case 'ranged_dps':  petTargetChance = 0.10; break;  // 小鬼
            default:            petTargetChance = 0.15; break;  // 猎人宠物等
        }

        return random() < petTargetChance ? 'pet' : 'player';
    }

    /**
     * 敌人攻击宠物
     */
    _enemyAttackPet() {
        if (!this.activePet || !this.activePet.isAlive) return;

        // 宠物固定低护甲
        let baseDamage = (this.enemy.stats.strength || 15) * 2;
        const petArmor = 20;
        const enemyLevel = this.enemy.level || 1;
        const reduction = petArmor / (petArmor + 400 * enemyLevel);
        baseDamage = Math.max(1, Math.floor(baseDamage * (1 - reduction)));

        const variance = 0.9 + random() * 0.2;
        baseDamage = Math.max(1, Math.floor(baseDamage * variance));

        const isCrit = random() < (this.enemy.stats.agility / 150);
        const finalDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

        this.activePet.currentHp -= finalDamage;
        
        const critText = isCrit ? '💥暴击！' : '';
        this.addLog(`${this.enemy.name} 攻击 ${this.activePet.displayName}，${critText}造成 ${finalDamage} 点伤害！`, 'combat');
        
        this.engine.eventBus.emit('combat:enemyAttack', { damage: finalDamage, isCrit, target: 'pet' });

        if (this.activePet.currentHp <= 0) {
            this.activePet.currentHp = 0;
            this.activePet.isAlive = false;
            this.addLog(`💀 ${this.activePet.displayName} 阵亡了！`, 'system');
            this.engine.eventBus.emit('combat:petDied', { pet: this.activePet });
            
            // 更新 player state
            const player = this.engine.stateManager.get('player');
            if (player) {
                player.activePet = { ...this.activePet };
                this.engine.stateManager.set('player', player);
            }
        }

        this.updateCombatState();
    }

    /**
     * 添加战斗日志
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     */
    addLog(message, type = 'normal', color = null) {
        const logEntry = {
            message,
            type,
            timestamp: Date.now(),
            color
        };
        this.combatLog.push(logEntry);
        this.engine.eventBus.emit('combat:log', logEntry);
    }

    /**
     * 更新战斗状态
     */
    updateCombatState() {
        this.engine.stateManager.set('combat', {
            inCombat: this.inCombat,
            enemy: this.enemy,
            turn: this.currentTurn,
            turnCount: this.turnCount,
            log: this.combatLog,
            pet: this.activePet
        });
    }

    /**
     * 系统更新
     * @param {number} deltaTime - 帧间隔（毫秒）
     */
    update(deltaTime) {
        // 脱战状态下的资源处理
        if (!this.inCombat) {
            // 副本战斗中由 DungeonCombatSystem 管理资源恢复，跳过脱战恢复
            const dungeonSystem = this.engine.systems.get('dungeonCombat');
            if (dungeonSystem && dungeonSystem.inDungeonCombat) return;

            // 确保脱战计时器已初始化（处理游戏加载、副本返回等边界情况）
            if (!this.outOfCombatTime) {
                this.outOfCombatTime = Date.now();
                // 游戏加载时如果有怒气，也启动衰减
                this._startRageDecay();
            }

            const player = this.engine.stateManager.get('player');
            if (!player) return;
            
            // 兼容旧存档：若 player.resource 不存在，尝试触发迁移
            if (!player.resource) {
                const charSystem = this.engine.systems.get('character');
                if (charSystem) charSystem.getCharacter();
                return;
            }
            
            const resourceConfig = GameData.resourceSystems[player.resource.type];
            if (!resourceConfig) return;

            const timeSinceOutOfCombat = (Date.now() - this.outOfCombatTime) / 1000;
            
            // 能量脱战恢复（始终在非战斗状态恢复）
            if (resourceConfig.generation && resourceConfig.generation.outOfCombat && resourceConfig.generation.outOfCombat.enabled) {
                const outOfCombatConfig = resourceConfig.generation.outOfCombat;
                
                // 检查是否超过延迟时间
                if (timeSinceOutOfCombat < outOfCombatConfig.delay) return;
                
                // 计算恢复量（基于 deltaTime）
                const regenRate = outOfCombatConfig.rate || 20;
                const regenAmount = regenRate * (deltaTime / 1000);
                
                if (player.resource.current < player.resource.max) {
                    player.resource.current = Math.min(player.resource.max, player.resource.current + regenAmount);
                    this.engine.stateManager.set('player', player);
                }
            }
            // 怒气衰减已改为独立定时器方案（_startRageDecay / _stopRageDecay）
            // 不再在帧循环中处理，避免性能开销
        } else {
            // 进入战斗时清除脱战计时，确保下次脱战时重新开始计时
            this.outOfCombatTime = null;
        }
    }
}

