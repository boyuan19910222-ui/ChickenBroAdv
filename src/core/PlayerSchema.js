/**
 * PlayerSchema - 玩家角色数据的权威 Schema 定义
 * 所有角色创建和存档迁移都参照此模块
 */
import { GameData } from '../data/GameData.js'
import { SLOT_IDS, BAG_CAPACITY } from '../data/EquipmentData.js'
import { random } from './RandomProvider.js'

/**
 * 装备槽位定义（WoW 经典 16 槽位）
 */
export const EQUIPMENT_SLOTS = SLOT_IDS

/** 16 槽位默认值工厂 */
function createDefaultEquipment() {
    return {
        head: null, shoulders: null, chest: null, legs: null,
        hands: null, wrists: null, waist: null, feet: null,
        back: null, neck: null, finger1: null, finger2: null,
        trinket1: null, trinket2: null, mainHand: null, offHand: null,
    }
}

/**
 * 完整玩家字段定义表
 */
export const PLAYER_FIELDS = {
    id:               { type: 'string',  default: '' },
    name:             { type: 'string',  default: '' },
    class:            { type: 'string',  default: '' },
    className:        { type: 'string',  default: '' },
    icon:             { type: 'string',  default: '' },
    isPlayer:         { type: 'boolean', default: true },
    level:            { type: 'number',  default: 1 },
    experience:       { type: 'number',  default: 0 },
    experienceToNext: { type: 'number',  default: 100 },
    baseStats:        { type: 'object',  factory: () => ({ health: 100, mana: 50, strength: 10, agility: 10, intellect: 10, stamina: 10, spirit: 10 }) },
    stats:            { type: 'object',  factory: () => ({ health: 100, mana: 50, strength: 10, agility: 10, intellect: 10, stamina: 10, spirit: 10 }) },
    currentHp:        { type: 'number',  default: 100 },
    maxHp:            { type: 'number',  default: 100 },
    resource:         { type: 'object',  factory: () => ({ type: 'mana', current: 50, max: 50, baseMax: 50 }) },
    currentMana:      { type: 'number',  default: 50 },
    maxMana:          { type: 'number',  default: 50 },
    skills:           { type: 'array',   factory: () => [] },
    skillCooldowns:   { type: 'object',  factory: () => ({}) },
    equipment:        { type: 'object',  factory: createDefaultEquipment },
    buffs:            { type: 'array',   factory: () => [] },
    debuffs:          { type: 'array',   factory: () => [] },
    statistics:       { type: 'object',  factory: () => ({ monstersKilled: 0, damageDealt: 0, damageTaken: 0, healingDone: 0, goldEarned: 0, questsCompleted: 0 }) },
    gold:             { type: 'number',  default: 100 },
    inventory:        { type: 'array',   factory: () => [] },
    talents:          { type: 'object',  factory: () => ({}) },
    comboPoints:      { type: 'object',  default: null },
    activePet:        { type: 'object',  default: null },
    activeQuests:     { type: 'array',   factory: () => [] },
    completedQuests:  { type: 'array',   factory: () => [] },
    dailyQuestsCompleted: { type: 'array', factory: () => [] },
    dailyQuestReset:  { type: 'string',  default: '' },
    createdAt:        { type: 'string',  default: '' },
}

function getFieldDefault(fieldName) {
    const field = PLAYER_FIELDS[fieldName]
    if (!field) return undefined
    if (field.factory) return field.factory()
    return field.default
}

/**
 * 旧版 5 槽 → 新版映射
 */
const OLD_SLOT_MIGRATION = {
    weapon:    'mainHand',
    armor:     'chest',
    helmet:    'head',
    boots:     'feet',
    accessory: null,
}

/**
 * 9 槽 → 16 槽的新增槽位
 */
const NEW_16_SLOTS = ['wrists', 'waist', 'back', 'neck', 'finger1', 'finger2', 'trinket1', 'trinket2']

/**
 * 规范化 equipment 对象，确保所有 16 槽位存在
 * 兼容旧版 5 槽位和 9 槽位数据的自动迁移
 */
function normalizeEquipment(equipment) {
    const defaultEquip = createDefaultEquipment()
    if (!equipment || typeof equipment !== 'object') {
        return { normalized: defaultEquip, overflow: [] }
    }
    
    const normalized = { ...defaultEquip }
    const overflow = []
    
    // 检测旧版 5 槽格式
    const hasOldSlots = 'weapon' in equipment || 'armor' in equipment || 'helmet' in equipment
    
    if (hasOldSlots) {
        for (const [oldSlot, item] of Object.entries(equipment)) {
            if (!item) continue
            const newSlot = OLD_SLOT_MIGRATION[oldSlot]
            if (newSlot) {
                normalized[newSlot] = item
            } else if (oldSlot === 'accessory' && item) {
                overflow.push(item)
            }
        }
    } else {
        // 新版格式，拷贝已有槽位
        for (const slot of EQUIPMENT_SLOTS) {
            if (slot in equipment) {
                normalized[slot] = equipment[slot]
            }
        }
        // 如果旧 9 槽有 ranged，移入溢出
        if ('ranged' in equipment && equipment.ranged) {
            overflow.push(equipment.ranged)
        }
    }
    
    return { normalized, overflow }
}

/**
 * 创建完整的默认玩家角色数据
 */
export function createDefaultPlayer(name, classId) {
    const classData = GameData.classes[classId]
    if (!classData) {
        throw new Error(`未知职业: ${classId}`)
    }

    const resourceType = classData.resourceType || 'mana'
    const resourceConfig = GameData.resourceSystems[resourceType]
    let resourceMax, resourceCurrent
    if (resourceType === 'mana') {
        resourceMax = classData.baseStats.mana
        resourceCurrent = classData.baseStats.mana
    } else {
        resourceMax = resourceConfig.defaultMax
        resourceCurrent = resourceConfig.startValue === 'full' ? resourceMax : (resourceConfig.startValue || 0)
    }

    // 新血量公式: health = baseHealth + (stamina × 30) + (level × 15)
    // 坦克职业（战士/圣骑士/德鲁伊）基础血量不再额外加成
    const baseHealth = classData.baseStats.health
    const stamina = classData.baseStats.stamina || 0
    const level = 1  // 创建时等级为1
    
    const effectiveBaseHealth = baseHealth
    const calculatedHealth = effectiveBaseHealth + (stamina * 30) + (level * 15)

    const player = {
        id: 'char_' + Date.now() + '_' + random().toString(36).substr(2, 9),
        name: name,
        class: classId,
        classId: classId,
        className: classData.name,
        icon: classData.icon,
        isPlayer: true,
        level: 1,
        experience: 0,
        experienceToNext: GameData.expTable[1],
        baseStats: { ...classData.baseStats },
        stats: { ...classData.baseStats, health: calculatedHealth },
        currentHp: calculatedHealth,
        maxHp: calculatedHealth,
        resource: {
            type: resourceType,
            current: resourceCurrent,
            max: resourceMax,
            baseMax: resourceMax
        },
        currentMana: classData.baseStats.mana,
        maxMana: classData.baseStats.mana,
        // 使用 baseSkills（基础技能），天赋解锁的技能不在此列表
        skills: [...(classData.baseSkills || classData.skills)],
        skillCooldowns: {},
        equipment: createDefaultEquipment(),
        buffs: [],
        debuffs: [],
        statistics: {
            monstersKilled: 0,
            damageDealt: 0,
            damageTaken: 0,
            healingDone: 0,
            goldEarned: 0,
            questsCompleted: 0
        },
        gold: 100,
        inventory: [],
        talents: {},
        comboPoints: classId === 'rogue' ? { current: 0, max: 5 } : null,
        activePet: null,
        createdAt: new Date().toISOString(),
    }

    return player
}

/**
 * 补全玩家数据的缺失字段
 */
export function ensurePlayerFields(playerData) {
    const result = { ...playerData }

    for (const [fieldName, fieldDef] of Object.entries(PLAYER_FIELDS)) {
        if (!(fieldName in result) || result[fieldName] === undefined) {
            result[fieldName] = getFieldDefault(fieldName)
        }
    }

    // 规范化 equipment 槽位（兼容旧版 5 槽/9 槽 → 新版 16 槽）
    const { normalized, overflow } = normalizeEquipment(result.equipment)
    result.equipment = normalized
    
    if (overflow.length > 0) {
        if (!Array.isArray(result.inventory)) result.inventory = []
        result.inventory.push(...overflow)
    }

    // emoji → icon 兼容：旧存档可能有 emoji 没有 icon
    if (!result.icon && result.class) {
        result.icon = `/icons/classes/${result.class}.png`
    }
    delete result.emoji

    return result
}
