/**
 * 宠物战斗系统 - 统一管理猎人宠物和术士恶魔的战斗
 * 
 * 数据源: ClassMechanics (唯一数据源)
 * 特性:
 * - 附属单位（不占格子）
 * - 跟随主人攻击目标
 * - 独立技能池 + 优先级自动攻击
 * - 独立HP
 * - 地狱火限时逻辑
 */
import { ClassMechanics } from '../data/ClassMechanics.js';
import { random } from '../core/RandomProvider.js';

// 宠物职业列表
const PET_CLASSES = ['hunter', 'warlock'];

export const PetCombatSystem = {

    /**
     * 检查职业是否有宠物
     */
    hasPet(classId) {
        return PET_CLASSES.includes(classId);
    },

    /**
     * 获取可召唤的宠物/恶魔列表
     * @param {Object} owner - 宠物主人 { classId, level, talents? }
     * @param {boolean} hasBeastMasteryTalent - 猎人是否有野兽控制天赋T4
     * @returns {Array} 可选宠物列表 [{ id, name, emoji, role, description, unlocked, unlockLevel }]
     */
    getAvailableSummons(owner, hasBeastMasteryTalent = false) {
        const list = [];
        if (owner.classId === 'hunter') {
            const def = ClassMechanics.pet.defaultPet;
            list.push({
                id: def.id, name: def.name, emoji: def.emoji,
                role: 'default', roleDescription: '默认战斗伙伴',
                description: def.description, unlocked: true, unlockLevel: 1
            });
            if (hasBeastMasteryTalent) {
                for (const [key, pet] of Object.entries(ClassMechanics.pet.advancedPets)) {
                    list.push({
                        id: pet.id, name: pet.name, emoji: pet.emoji,
                        role: pet.role, roleDescription: pet.roleDescription,
                        description: pet.description, unlocked: true, unlockLevel: null
                    });
                }
            }
        } else if (owner.classId === 'warlock') {
            const ownerLevel = owner.level || 1;
            for (const [key, demon] of Object.entries(ClassMechanics.demon.demonTypes)) {
                list.push({
                    id: demon.id, name: demon.name, emoji: demon.emoji,
                    role: demon.role, roleDescription: demon.description,
                    description: demon.description,
                    unlocked: ownerLevel >= (demon.unlockLevel || 1),
                    unlockLevel: demon.unlockLevel || 1
                });
            }
        }
        return list;
    },

    /**
     * 从 ClassMechanics 创建宠物实例
     * @param {Object} owner - { id, name, classId, level }
     * @param {string} summonId - 要召唤的宠物/恶魔ID (如 'wolf', 'bear', 'imp', 'voidwalker')
     * @returns {Object|null} petInstance
     */
    createPetFromConfig(owner, summonId) {
        const level = owner.level || 1;
        let config = null;
        let abilitiesSource = null;
        let ownerClass = owner.classId;

        if (ownerClass === 'hunter') {
            if (summonId === 'wolf' || summonId === ClassMechanics.pet.defaultPet.id) {
                config = ClassMechanics.pet.defaultPet;
            } else {
                config = ClassMechanics.pet.advancedPets[summonId];
            }
            abilitiesSource = ClassMechanics.pet.petAbilities;
        } else if (ownerClass === 'warlock') {
            config = ClassMechanics.demon.demonTypes[summonId];
            abilitiesSource = ClassMechanics.demon.demonAbilities;
        }

        if (!config) return null;

        // 构建技能池
        const abilities = this._buildAbilities(config, abilitiesSource);

        // 计算属性（等级缩放）
        const baseStats = config.baseStats;
        const hpScale = 1 + (level - 1) * 0.12;
        const dmgScale = 1 + (level - 1) * 0.1;
        const maxHp = Math.floor((baseStats.health || baseStats.hp || 100) * hpScale);
        const damage = Math.floor((baseStats.damage || 15) * dmgScale);

        // 判断是否限时（地狱火）
        const isTimeLimited = config.isTimed || false;
        const remainingTurns = isTimeLimited ? 10 : -1; // 地狱火10回合

        return {
            id: `pet_${owner.id}_${summonId}`,
            summonId,
            ownerId: owner.id,
            ownerClass,
            name: config.name,
            displayName: config.name,
            fullName: `${owner.name}的${config.name}`,
            emoji: config.emoji,

            level,
            maxHp,
            currentHp: maxHp,
            damage,
            armor: baseStats.armor || 0,
            attackSpeed: baseStats.attackSpeed || 1.5,
            attackType: this._getAttackType(ownerClass, config),

            isAlive: true,
            currentTarget: null,

            // 技能池
            abilities,

            // 限时
            isTimeLimited,
            remainingTurns,

            // 统计
            stats: {
                totalDamage: 0,
                attackCount: 0,
                specialSkillsUsed: 0
            }
        };
    },

    /**
     * 兼容旧接口：创建默认宠物
     */
    createPet(owner) {
        if (owner.classId === 'hunter') {
            return this.createPetFromConfig(owner, 'wolf');
        } else if (owner.classId === 'warlock') {
            return this.createPetFromConfig(owner, 'imp');
        }
        return null;
    },

    /**
     * 构建宠物技能池
     * @private
     */
    _buildAbilities(config, abilitiesSource) {
        const abilityIds = config.abilities || [];
        const abilities = [];
        let priority = abilityIds.length;

        for (const abilityId of abilityIds) {
            const abilityDef = abilitiesSource[abilityId];
            if (!abilityDef) continue;

            // 特殊技能（有cooldown>0的）优先级更高
            const isSpecial = (abilityDef.cooldown || 0) > 0;

            abilities.push({
                id: abilityId,
                name: abilityDef.name,
                damageMultiplier: abilityDef.damage || 1.0,
                cooldown: abilityDef.cooldown || 0,
                currentCooldown: 0,
                effect: abilityDef.effect || null,
                school: abilityDef.school || abilityDef.damageType || null,
                priority: isSpecial ? priority + 10 : priority
            });
            priority--;
        }

        // 按 priority 降序排列
        abilities.sort((a, b) => b.priority - a.priority);
        return abilities;
    },

    /**
     * 获取攻击类型
     * @private
     */
    _getAttackType(ownerClass, config) {
        if (ownerClass === 'warlock') {
            // 术士恶魔默认暗影，特殊情况根据config
            if (config.id === 'imp' || config.id === 'infernal') return 'fire';
            return 'shadow';
        }
        // 猎人宠物
        if (config.id === 'eagle') return 'nature';
        return 'physical';
    },

    /**
     * 创建宠物战斗状态（副本用）
     */
    createPetState(partyMembers) {
        const petState = {
            pets: {},
            ownerPetMap: {},
        };
        // 副本初始化时不自动创建宠物，需要战斗中手动召唤
        return petState;
    },

    /**
     * 将宠物添加到 petState
     */
    addPetToState(petState, pet) {
        if (!pet) return petState;
        petState.pets[pet.id] = pet;
        petState.ownerPetMap[pet.ownerId] = pet.id;
        return petState;
    },

    /**
     * 获取主人的宠物
     */
    getPet(petState, ownerId) {
        const petId = petState.ownerPetMap[ownerId];
        return petId ? petState.pets[petId] : null;
    },

    /**
     * 更新宠物攻击目标
     */
    updatePetTarget(petState, ownerId, targetId) {
        const pet = this.getPet(petState, ownerId);
        if (pet && pet.isAlive) {
            pet.currentTarget = targetId;
        }
        return petState;
    },

    /**
     * 宠物执行自动攻击（技能池优先级选择）
     * @returns {Object|null} { petId, petName, targetId, damage, damageType, skill, effects, emoji }
     */
    performAutoAttack(petState, ownerId) {
        const pet = this.getPet(petState, ownerId);
        if (!pet || !pet.isAlive || !pet.currentTarget) {
            return null;
        }

        let damage = pet.damage;
        let effects = [];
        let skillUsed = null;

        // 从技能池选择：按优先级降序，选第一个未冷却的
        if (pet.abilities && pet.abilities.length > 0) {
            for (const ability of pet.abilities) {
                if (ability.currentCooldown <= 0 && ability.cooldown > 0) {
                    // 使用特殊技能
                    skillUsed = ability;
                    damage = Math.floor(pet.damage * (ability.damageMultiplier || 1.0));
                    ability.currentCooldown = ability.cooldown;
                    pet.stats.specialSkillsUsed++;

                    // 处理效果
                    if (ability.effect) {
                        effects.push({
                            type: ability.effect,
                            id: ability.id,
                            name: ability.name,
                            source: 'pet'
                        });
                    }
                    break;
                }
            }

            // 若所有特殊技能冷却中，用第一个无CD基础技能
            if (!skillUsed) {
                const basicAbility = pet.abilities.find(a => a.cooldown === 0);
                if (basicAbility) {
                    skillUsed = basicAbility;
                    damage = Math.floor(pet.damage * (basicAbility.damageMultiplier || 1.0));
                }
            }
        }

        // 加点随机波动 ±10%
        const variance = 0.9 + random() * 0.2;
        damage = Math.floor(damage * variance);

        // 更新统计
        pet.stats.totalDamage += damage;
        pet.stats.attackCount++;

        return {
            petId: pet.id,
            petName: pet.fullName || pet.name,
            targetId: pet.currentTarget,
            damage,
            damageType: pet.attackType,
            skill: skillUsed ? { id: skillUsed.id, name: skillUsed.name } : null,
            effects,
            emoji: pet.emoji
        };
    },

    /**
     * 回合结束时递减所有技能冷却
     */
    tickCooldowns(petState, ownerId) {
        const pet = this.getPet(petState, ownerId);
        if (!pet || !pet.isAlive || !pet.abilities) return;

        for (const ability of pet.abilities) {
            if (ability.currentCooldown > 0) {
                ability.currentCooldown--;
            }
        }
    },

    /**
     * 处理限时宠物（地狱火）回合递减
     * @returns {boolean} true 如果宠物因时间到期而死亡
     */
    tickTimeLimited(petState, ownerId) {
        const pet = this.getPet(petState, ownerId);
        if (!pet || !pet.isAlive || !pet.isTimeLimited) return false;

        pet.remainingTurns--;
        if (pet.remainingTurns <= 0) {
            pet.isAlive = false;
            pet.currentHp = 0;
            return true;
        }
        return false;
    },

    /**
     * 宠物受到伤害
     */
    damagePet(petState, petId, damage) {
        const pet = petState.pets[petId];
        if (!pet) return { petState, died: false };

        pet.currentHp = Math.max(0, pet.currentHp - damage);

        let died = false;
        if (pet.currentHp <= 0) {
            pet.isAlive = false;
            died = true;
        }

        return { petState, died };
    },

    /**
     * 治疗宠物
     */
    healPet(petState, petId, amount) {
        const pet = petState.pets[petId];
        if (!pet || !pet.isAlive) return petState;

        pet.currentHp = Math.min(pet.maxHp, pet.currentHp + amount);
        return petState;
    },

    /**
     * 移除宠物（死亡后清理，重新召唤前需要调用）
     */
    removePet(petState, ownerId) {
        const petId = petState.ownerPetMap[ownerId];
        if (petId) {
            delete petState.pets[petId];
            delete petState.ownerPetMap[ownerId];
        }
        return petState;
    },

    /**
     * 主人死亡时处理宠物
     */
    onOwnerDeath(petState, ownerId) {
        const pet = this.getPet(petState, ownerId);
        if (pet && pet.isAlive) {
            pet.isAlive = false;
            pet.currentHp = 0;
            pet.currentTarget = null;
        }
        return petState;
    },

    /**
     * 获取所有存活的宠物
     */
    getAlivePets(petState) {
        return Object.values(petState.pets).filter(pet => pet.isAlive);
    },

    /**
     * 获取宠物显示信息
     */
    getPetDisplayInfo(petState, ownerId) {
        const pet = this.getPet(petState, ownerId);
        if (!pet) return null;

        return {
            id: pet.id,
            name: pet.displayName || pet.name,
            fullName: pet.fullName || pet.name,
            emoji: pet.emoji,
            summonId: pet.summonId,

            hp: {
                current: pet.currentHp,
                max: pet.maxHp,
                percent: Math.round((pet.currentHp / pet.maxHp) * 100)
            },

            isAlive: pet.isAlive,
            damage: pet.damage,
            attackType: pet.attackType,
            isTimeLimited: pet.isTimeLimited,
            remainingTurns: pet.remainingTurns,

            stats: pet.stats,

            abilities: (pet.abilities || []).map(a => ({
                name: a.name,
                cooldown: a.cooldown,
                currentCooldown: a.currentCooldown,
                effect: a.effect
            }))
        };
    },

    /**
     * 获取所有宠物的显示信息列表
     */
    getAllPetsDisplayInfo(petState) {
        return Object.values(petState.pets).map(pet => ({
            id: pet.id,
            ownerId: pet.ownerId,
            name: pet.displayName || pet.name,
            emoji: pet.emoji,
            hp: {
                current: pet.currentHp,
                max: pet.maxHp,
                percent: Math.round((pet.currentHp / pet.maxHp) * 100)
            },
            isAlive: pet.isAlive,
            isTimeLimited: pet.isTimeLimited,
            remainingTurns: pet.remainingTurns
        }));
    }
};

// 导出到全局
