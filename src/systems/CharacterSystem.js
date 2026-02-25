/**
 * 角色系统 - 管理玩家角色和属性
 * @class CharacterSystem
 */
import { createDefaultPlayer } from '../core/PlayerSchema.js'
import { random } from '../core/RandomProvider.js'
import { GameData } from '../data/GameData.js'

// 护甲类型枚举
export const ArmorTypes = {
    CLOTH: 'cloth',
    LEATHER: 'leather',
    MAIL: 'mail',
    PLATE: 'plate'
};

// 武器类型枚举
export const WeaponTypes = {
    SWORD: 'sword',
    AXE: 'axe',
    MACE: 'mace',
    DAGGER: 'dagger',
    FIST: 'fist',
    POLEARM: 'polearm',
    STAFF: 'staff',
    WAND: 'wand',
    BOW: 'bow',
    CROSSBOW: 'crossbow',
    GUN: 'gun',
    SHIELD: 'shield'
};

// 资源类型枚举
export const ResourceTypes = {
    MANA: 'mana',
    RAGE: 'rage',
    ENERGY: 'energy'
};

export class CharacterSystem {
    constructor() {
        this.engine = null;
    }

    /**
     * 初始化系统
     * @param {GameEngine} engine - 游戏引擎实例
     */
    init(engine) {
        this.engine = engine;
        this.setupEventListeners();
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听经验获取
        this.engine.eventBus.on('exp:gain', (amount) => {
            this.addExperience(amount);
        });

        // 监听属性变化
        this.engine.eventBus.on('stat:modify', (data) => {
            this.modifyStat(data.stat, data.amount);
        });

        // 监听装备变更，重新计算属性
        this.engine.eventBus.on('equipment:statsChanged', ({ player }) => {
            if (player) {
                this.recalculateStats(player);
            }
        });
    }

    /**
     * 创建新角色
     * @param {string} name - 角色名称
     * @param {string} classId - 职业ID
     * @returns {Object} 角色数据
     */
    createCharacter(name, classId) {
        const character = createDefaultPlayer(name, classId)

        // 保存到状态
        this.engine.stateManager.set('player', character)
        this.engine.eventBus.emit('character:created', character)
        
        return character
    }

    /**
     * 获取当前角色
     * @returns {Object} 角色数据
     */
    getCharacter() {
        return this.engine.stateManager.get('player');
    }

    /**
     * 添加经验值
     * @param {number} amount - 经验值数量
     */
    addExperience(amount) {
        const player = this.getCharacter();
        if (!player) return;

        // 满级玩家不获得经验
        if (player.level >= 60) return;

        player.experience += amount;
        
        // 检查升级
        while (player.experience >= player.experienceToNext && player.level < 60) {
            this.levelUp(player);
        }

        this.engine.stateManager.set('player', player);
        this.engine.eventBus.emit('character:expGained', { amount, total: player.experience });
    }

    /**
     * 角色升级
     * @param {Object} player - 玩家数据
     */
    levelUp(player) {
        const classData = GameData.classes[player.class];
        
        player.level++;
        player.experience -= player.experienceToNext;

        // 满级处理：经验清零，experienceToNext 设为 0
        if (player.level >= 60) {
            player.experience = 0;
            player.experienceToNext = 0;
        } else {
            player.experienceToNext = GameData.expTable[player.level];
        }

        // 属性成长
        Object.keys(classData.growthPerLevel).forEach(stat => {
            player.baseStats[stat] += classData.growthPerLevel[stat];
        });

        // 重新计算属性
        this.recalculateStats(player);

        // 恢复满血，法力类型也恢复满
        player.currentHp = player.maxHp;
        if (player.resource && player.resource.type === 'mana') {
            player.resource.current = player.resource.max;
        }
        player.currentMana = player.maxMana;

        // 升级时同步恢复宠物满血（仅当宠物存活时）
        if (player.activePet && player.activePet.isAlive) {
            player.activePet.currentHp = player.activePet.maxHp;
        }

        this.engine.eventBus.emit('character:levelUp', {
            level: player.level,
            stats: player.stats
        });
        
        console.log(`🎉 升级! 等级 ${player.level}`);
    }

    /**
     * 重新计算角色属性
     * @param {Object} player - 玩家数据
     */
    recalculateStats(player) {
        // 从基础属性开始
        player.stats = { ...player.baseStats };

        // 加上装备属性（优先使用 EquipmentSystem 计算）
        const equipSystem = this.engine?.getSystem('equipment')
        if (equipSystem) {
            const equipStats = equipSystem.calculateEquipmentStats(player)
            for (const [stat, value] of Object.entries(equipStats)) {
                player.stats[stat] = (player.stats[stat] || 0) + value
            }
        } else {
            // 降级兼容：直接遍历装备 stats
            Object.values(player.equipment).forEach(item => {
                if (item && item.stats) {
                    Object.keys(item.stats).forEach(stat => {
                        player.stats[stat] = (player.stats[stat] || 0) + item.stats[stat];
                    });
                }
            });
        }

        // 应用被动技能效果
        this._applyPassiveSkills(player);

        // 应用天赋加成
        this._applyTalentBonuses(player);

        // 应用buff
        player.buffs.forEach(buff => {
            if (buff.stat && player.stats[buff.stat]) {
                player.stats[buff.stat] = Math.floor(player.stats[buff.stat] * (1 + buff.value));
            }
        });

        // 更新最大生命 - 新公式: health = baseHealth + (stamina × 30) + (level × 15)
        // 坦克职业（战士/圣骑士/德鲁伊熊形态）基础血量不再额外加成
        const baseHealth = player.baseStats.health || 100;
        const stamina = player.stats.stamina || 0;
        const level = player.level || 1;
        
        // 计算有效基础血量
        const effectiveBaseHealth = baseHealth;
        
        // 新公式计算（取整避免浮点精度问题）
        const calculatedHealth = Math.floor(effectiveBaseHealth + (stamina * 30) + (level * 15));
        player.stats.health = calculatedHealth;
        player.maxHp = calculatedHealth;

        // 更新资源上限（如果是法力类型）
        if (player.resource && player.resource.type === 'mana') {
            player.resource.max = player.stats.mana;
            player.resource.baseMax = player.baseStats.mana;
        }
        
        // 保持旧字段兼容
        player.maxMana = player.stats.mana;

        // 确保当前值不超过最大值
        player.currentHp = Math.min(player.currentHp, player.maxHp);
        if (player.resource) {
            player.resource.current = Math.min(player.resource.current, player.resource.max);
        }
        player.currentMana = Math.min(player.currentMana, player.maxMana);
    }

    /**
     * 应用被动技能效果到角色属性
     * @param {Object} player - 玩家数据
     */
    _applyPassiveSkills(player) {
        if (!player.skills) return;

        for (const skillId of player.skills) {
            const skill = GameData.skills[skillId];
            if (!skill || skill.skillType !== 'passive' || !skill.passive) continue;
            if (skill.unlockLevel && player.level < skill.unlockLevel) continue;

            const passive = skill.passive;
            if (passive.trigger !== 'always') continue;

            const effect = passive.effect;
            if (effect.type === 'stat_percent') {
                // 百分比加成
                const base = player.stats[effect.stat] || 0;
                player.stats[effect.stat] = Math.floor(base * (1 + effect.value));
            } else if (effect.type === 'stat_flat') {
                // 固定值加成
                for (const [stat, value] of Object.entries(effect.stats)) {
                    player.stats[stat] = (player.stats[stat] || 0) + value;
                }
            }
        }
    }

    /**
     * 应用天赋加成到角色属性
     * @param {Object} player - 玩家数据
     */
    _applyTalentBonuses(player) {
        const talentSystem = this.engine?.getSystem('talent');
        if (!talentSystem) return;

        // stat 类型的天赋加成
        const statBonus = talentSystem.getTalentBonus(player, 'stat');
        // stat_percent 类型天赋
        // 遍历每个具体属性的加成
        const statTypes = ['strength', 'agility', 'intellect', 'stamina', 'spirit', 'health', 'mana'];
        for (const stat of statTypes) {
            const flatBonus = talentSystem.getTalentBonus(player, 'stat', stat);
            if (flatBonus > 0) {
                player.stats[stat] = (player.stats[stat] || 0) + flatBonus;
            }
        }
    }

    /**
     * 修改角色属性
     * @param {string} stat - 属性名
     * @param {number} amount - 变化量
     */
    modifyStat(stat, amount) {
        const player = this.getCharacter();
        if (!player) return;

        if (stat === 'currentHp') {
            player.currentHp = Math.max(0, Math.min(player.maxHp, player.currentHp + amount));
        } else if (stat === 'currentMana') {
            player.currentMana = Math.max(0, Math.min(player.maxMana, player.currentMana + amount));
        } else if (stat === 'gold') {
            player.gold = Math.max(0, player.gold + amount);
        }

        this.engine.stateManager.set('player', player);
    }

    /**
     * 治疗角色
     * @param {number} amount - 治疗量
     */
    heal(amount) {
        this.modifyStat('currentHp', amount);
        const player = this.getCharacter();
        this.engine.eventBus.emit('character:healed', { amount, currentHp: player.currentHp });
    }

    /**
     * 造成伤害
     * @param {number} amount - 伤害量
     * @returns {boolean} 是否存活
     */
    takeDamage(amount) {
        this.modifyStat('currentHp', -amount);
        const player = this.getCharacter();
        
        this.engine.eventBus.emit('character:damaged', { amount, currentHp: player.currentHp });
        
        if (player.currentHp <= 0) {
            this.engine.eventBus.emit('character:death');
            return false;
        }
        return true;
    }

    /**
     * 消耗法力
     * @param {number} amount - 消耗量
     * @returns {boolean} 是否成功
     */
    useMana(amount) {
        const player = this.getCharacter();
        if (player.currentMana < amount) return false;
        
        this.modifyStat('currentMana', -amount);
        return true;
    }

    /**
     * 添加buff
     * @param {Object} buff - buff数据
     */
    addBuff(buff) {
        const player = this.getCharacter();
        player.buffs.push({
            ...buff,
            remainingDuration: buff.duration
        });
        this.recalculateStats(player);
        this.engine.stateManager.set('player', player);
    }

    /**
     * 更新buff持续时间
     */
    updateBuffs() {
        const player = this.getCharacter();
        if (!player) return;

        // 减少buff持续时间
        player.buffs = player.buffs.filter(buff => {
            buff.remainingDuration--;
            return buff.remainingDuration > 0;
        });

        // 减少debuff持续时间
        player.debuffs = player.debuffs.filter(debuff => {
            debuff.remainingDuration--;
            return debuff.remainingDuration > 0;
        });

        this.recalculateStats(player);
        this.engine.stateManager.set('player', player);
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return 'char_' + Date.now() + '_' + random().toString(36).substr(2, 9);
    }

    // ========== 以下方法已迁移至 EquipmentSystem.js，统一由 EquipmentSystem 负责 ==========
    // canEquipArmor() → EquipmentSystem.canEquip()
    // canEquipWeapon() → EquipmentSystem.canEquip()
    // equipItem() → EquipmentSystem.equipItem()
    // unequipItem() → EquipmentSystem.unequipItem()

    /**
     * 获取护甲类型的中文名称
     */
    getArmorTypeName(armorType) {
        const names = {
            'cloth': '布甲',
            'leather': '皮甲',
            'mail': '锁甲',
            'plate': '板甲'
        };
        return names[armorType] || armorType;
    }

    /**
     * 获取武器类型的中文名称
     */
    getWeaponTypeName(weaponType) {
        const names = {
            'sword': '剑',
            'axe': '斧',
            'mace': '锤',
            'dagger': '匕首',
            'fist': '拳套',
            'polearm': '长柄武器',
            'staff': '法杖',
            'wand': '魔杖',
            'bow': '弓',
            'crossbow': '弩',
            'gun': '枪械',
            'shield': '盾牌'
        };
        return names[weaponType] || weaponType;
    }

    /**
     * 获取角色可用的护甲类型列表
     * @param {Object} character - 角色数据
     * @returns {Array} 护甲类型列表
     */
    getAvailableArmorTypes(character) {
        const classData = GameData.classes[character.class];
        return classData ? classData.armorTypes || [] : [];
    }

    /**
     * 获取角色可用的武器类型列表
     * @param {Object} character - 角色数据
     * @returns {Array} 武器类型列表
     */
    getAvailableWeaponTypes(character) {
        const classData = GameData.classes[character.class];
        return classData ? classData.weaponTypes || [] : [];
    }

    /**
     * 获取角色的资源类型
     * @param {Object} character - 角色数据
     * @returns {string} 资源类型
     */
    getResourceType(character) {
        const classData = GameData.classes[character.class];
        return classData ? classData.resourceType || ResourceTypes.MANA : ResourceTypes.MANA;
    }

    /**
     * 系统更新
     * @param {number} deltaTime - 帧间隔
     */
    update(deltaTime) {
        // 角色系统的定时更新逻辑
    }
}

// 导出枚举常量
