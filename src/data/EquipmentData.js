/**
 * EquipmentData - 装备系统数据定义
 * 包含：品质枚举、槽位定义、装备物品库、套装定义、怪物装备掉落表
 */

import { random, randomInt, randomChoice } from '../core/RandomProvider.js'

import { ClassicEquipmentBatch1, ClassicEquipmentBatch2, ClassicEquipmentBatch3 } from './dungeons/ClassicEquipment.js'

// ==================== 品质系统 ====================

/**
 * 装备品质等级（WoW 原版 6 级阶梯）
 */
export const ItemQuality = {
    POOR:      'poor',       // 粗糙 - 灰色
    COMMON:    'common',     // 普通 - 白色
    UNCOMMON:  'uncommon',   // 优秀 - 绿色
    RARE:      'rare',       // 稀有 - 蓝色
    EPIC:      'epic',       // 史诗 - 紫色
    LEGENDARY: 'legendary',  // 传说 - 橙色
}

/**
 * 品质配置：颜色、名称、属性缩放倍率
 */
export const QualityConfig = {
    [ItemQuality.POOR]:      { name: '粗糙', color: '#9d9d9d', emoji: '⬛', statScale: 0.8 },
    [ItemQuality.COMMON]:    { name: '普通', color: '#ffffff', emoji: '⬜', statScale: 1.0 },
    [ItemQuality.UNCOMMON]:  { name: '优秀', color: '#1eff00', emoji: '🟩', statScale: 1.15 },
    [ItemQuality.RARE]:      { name: '稀有', color: '#0070dd', emoji: '🟦', statScale: 1.35 },
    [ItemQuality.EPIC]:      { name: '史诗', color: '#a335ee', emoji: '🟪', statScale: 1.6 },
    [ItemQuality.LEGENDARY]: { name: '传说', color: '#ff8000', emoji: '🟧', statScale: 2.0 },
}

/** 品质排序数组，用于品质上限比较和钳位 */
export const QUALITY_ORDER = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary']

/** 将品质钳位到指定上限 */
export function clampQuality(quality, cap) {
    const qi = QUALITY_ORDER.indexOf(quality)
    const ci = QUALITY_ORDER.indexOf(cap)
    if (qi < 0 || ci < 0) return quality
    return qi <= ci ? quality : cap
}

/** 饰品类槽位集合（品质下限 uncommon，无灰/白） */
export const ACCESSORY_SLOTS = new Set(['neck', 'finger1', 'finger2', 'trinket1', 'trinket2'])

// ==================== 装备类别枚举 ====================

/**
 * 装备类别（与槽位解耦）
 */
export const EquipmentCategory = {
    ARMOR:     'armor',      // 护甲（头/肩/胸/腿/手/腕/腰/脚/披风）
    WEAPON:    'weapon',     // 武器（主手/副手武器）
    SHIELD:    'shield',     // 盾牌（副手）
    OFFHAND:   'offhand',    // 副手物品（书/水晶球等，纯属性）
    ACCESSORY: 'accessory',  // 饰品类（项链/戒指/饰品）
}

// ==================== 槽位系统 ====================

/**
 * 装备槽位定义（WoW 经典 16 槽位）
 * slotWeight: 属性预算权重（大件 1.0 / 中件 0.75 / 小件 0.56）
 */
export const EQUIPMENT_SLOTS = {
    head:     { id: 'head',     label: '头部', icon: '👑', category: 'armor',     slotWeight: 0.75 },
    shoulders:{ id: 'shoulders',label: '肩部', icon: '🦺', category: 'armor',     slotWeight: 0.75 },
    chest:    { id: 'chest',    label: '胸甲', icon: '🎽', category: 'armor',     slotWeight: 1.0  },
    legs:     { id: 'legs',     label: '腿甲', icon: '👖', category: 'armor',     slotWeight: 1.0  },
    hands:    { id: 'hands',    label: '手套', icon: '🧤', category: 'armor',     slotWeight: 0.75 },
    wrists:   { id: 'wrists',   label: '手腕', icon: '⌚', category: 'armor',     slotWeight: 0.56 },
    waist:    { id: 'waist',    label: '腰带', icon: '🪢', category: 'armor',     slotWeight: 0.56 },
    feet:     { id: 'feet',     label: '靴子', icon: '👢', category: 'armor',     slotWeight: 0.75 },
    back:     { id: 'back',     label: '披风', icon: '🧣', category: 'armor',     slotWeight: 0.56 },
    neck:     { id: 'neck',     label: '项链', icon: '📿', category: 'accessory', slotWeight: 0.56 },
    finger1:  { id: 'finger1',  label: '戒指1',icon: '💍', category: 'accessory', slotWeight: 0.56 },
    finger2:  { id: 'finger2',  label: '戒指2',icon: '💍', category: 'accessory', slotWeight: 0.56 },
    trinket1: { id: 'trinket1', label: '饰品1',icon: '🔮', category: 'accessory', slotWeight: 0.56 },
    trinket2: { id: 'trinket2', label: '饰品2',icon: '🔮', category: 'accessory', slotWeight: 0.56 },
    mainHand: { id: 'mainHand', label: '主手', icon: '⚔️', category: 'weapon',    slotWeight: 0.75 },
    offHand:  { id: 'offHand',  label: '副手', icon: '🛡️', category: 'weapon',    slotWeight: 0.56 },
}

export const SLOT_IDS = Object.keys(EQUIPMENT_SLOTS)

/**
 * 武器子类型到槽位的映射
 * 弓/枪/弩改为双手武器，占 mainHand（offHand 自动锁定）
 */
export const WeaponSlotMap = {
    sword:    ['mainHand', 'offHand'],
    axe:      ['mainHand', 'offHand'],
    mace:     ['mainHand', 'offHand'],
    dagger:   ['mainHand', 'offHand'],
    fist:     ['mainHand', 'offHand'],
    polearm:  ['mainHand'],  // 双手
    staff:    ['mainHand'],  // 双手
    wand:     ['mainHand'],  // 单手（主手限定）
    bow:      ['mainHand'],  // 双手
    crossbow: ['mainHand'],  // 双手
    gun:      ['mainHand'],  // 双手
    shield:   ['offHand'],
}

/**
 * 护甲子类型到槽位的映射
 */
export const ArmorSlotMap = {
    head:      'head',
    shoulders: 'shoulders',
    chest:     'chest',
    hands:     'hands',
    legs:      'legs',
    feet:      'feet',
    wrists:    'wrists',
    waist:     'waist',
    back:      'back',
}

// ==================== 护甲值系数 ====================

/**
 * 护甲类型 → baseCoeff
 * armorValue = floor(baseCoeff × itemLevel × qualityMultiplier)
 */
export const ArmorCoefficients = {
    cloth:   1.0,
    leather: 2.0,
    mail:    3.5,
    plate:   8.0,
    shield:  12.0,   // 盾牌特殊系数
}

/**
 * 物理减伤公式参数
 * reduction% = totalArmor / (totalArmor + K_LEVEL × attackerLevel + K_BASE)
 * 减伤上限 75%
 */
export const ARMOR_REDUCTION_K_LEVEL = 85
export const ARMOR_REDUCTION_K_BASE = 400
export const ARMOR_REDUCTION_CAP = 0.75

// ==================== 背包容量 ====================

export const BAG_CAPACITY = 40

// ==================== 天生双持职业 ====================

export const INNATE_DUAL_WIELD_CLASSES = ['warrior', 'rogue', 'hunter']

// ==================== 耐久度配置 ====================

export const DurabilityConfig = {
    /** 耐久度损坏阈值（低于此值显示警告） */
    warningThreshold: 0.2,
    /** 每次战斗中被攻击时耐久度损耗（护甲） */
    combatArmorLoss: 1,
    /** 每次战斗中攻击时耐久度损耗（武器） */
    combatWeaponLoss: 1,
    /** 修理费用系数（基于物品等级和品质） */
    repairCostBase: 2,
    /** 品质修理费用倍率 */
    repairCostByQuality: {
        [ItemQuality.POOR]:      0.5,
        [ItemQuality.COMMON]:    1.0,
        [ItemQuality.UNCOMMON]:  1.5,
        [ItemQuality.RARE]:      2.5,
        [ItemQuality.EPIC]:      4.0,
        [ItemQuality.LEGENDARY]: 6.0,
    },
}

// ==================== 工具函数：计算护甲值和武器伤害 ====================

/**
 * 计算护甲值: floor(baseCoeff × itemLevel × qualityMultiplier)
 */
function calcArmorValue(armorType, itemLevel, quality) {
    const coeff = ArmorCoefficients[armorType] || 1.0
    const qualityMult = QualityConfig[quality]?.statScale || 1.0
    return Math.floor(coeff * itemLevel * qualityMult)
}

/**
 * 计算武器伤害范围: { min, max }
 * baseDPS = itemLevel × qualityMultiplier × weaponWeight
 * weaponWeight: 双手=1.0, 单手=0.65
 */
function calcWeaponDamage(itemLevel, quality, weaponHand) {
    const qualityMult = QualityConfig[quality]?.statScale || 1.0
    const weaponWeight = weaponHand === 'two_hand' ? 1.0 : 0.65
    const baseDPS = itemLevel * qualityMult * weaponWeight
    return {
        min: Math.floor(baseDPS * 0.75),
        max: Math.floor(baseDPS * 1.25),
    }
}

// ==================== 装备物品数据库 ====================

/**
 * 所有装备物品定义
 * 
 * 新增字段:
 *   category: string,      // 装备类别 (armor/weapon/shield/offhand/accessory)
 *   weaponHand?: string,   // 武器握持 (one_hand/two_hand)
 *   armorValue?: number,   // 护甲值（护甲/盾牌类）
 *   damage?: { min, max }, // 武器伤害范围
 *   unique?: boolean,      // 是否唯一（默认 false）
 */
export const EquipmentDatabase = {
    // ==================== 布甲（法师/牧师/术士）====================
    
    // -- 头部 --
    apprenticeHat: {
        id: 'apprenticeHat',
        name: '学徒法帽',
        emoji: '🎩',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 3, ItemQuality.COMMON),
        stats: { intellect: 2, spirit: 1 },
        durability: { current: 30, max: 30 },
        description: '新手法师的标准帽子',
        sellPrice: 5,
    },
    shadowHood: {
        id: 'shadowHood',
        name: '暗影兜帽',
        emoji: '🎩',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 8, ItemQuality.UNCOMMON),
        stats: { intellect: 4, spirit: 2, mana: 1 },
        durability: { current: 40, max: 40 },
        description: '编织着暗影魔法的兜帽',
        sellPrice: 25,
    },
    
    // -- 胸甲 --
    apprenticeRobe: {
        id: 'apprenticeRobe',
        name: '学徒长袍',
        emoji: '👘',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 3, ItemQuality.COMMON),
        stats: { intellect: 2, stamina: 1 },
        durability: { current: 35, max: 35 },
        description: '朴素但实用的法师长袍',
        sellPrice: 8,
    },
    shadowweaveRobe: {
        id: 'shadowweaveRobe',
        name: '暗影织布长袍',
        emoji: '👘',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 12, ItemQuality.RARE),
        stats: { intellect: 8, stamina: 4, spirit: 4 },
        durability: { current: 55, max: 55 },
        setId: 'shadowweave',
        description: '暗影织布套装的长袍，散发着不祥的光芒',
        sellPrice: 80,
    },
    
    // ==================== 皮甲（盗贼/德鲁伊）====================
    
    // -- 头部 --
    leatherHelm: {
        id: 'leatherHelm',
        name: '皮革头盔',
        emoji: '⛑️',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 3, ItemQuality.COMMON),
        stats: { agility: 2, stamina: 1 },
        durability: { current: 35, max: 35 },
        description: '轻便的皮革头盔',
        sellPrice: 6,
    },
    banditMask: {
        id: 'banditMask',
        name: '盗匪面罩',
        emoji: '🥷',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 8, ItemQuality.UNCOMMON),
        stats: { agility: 4, stamina: 2, strength: 1 },
        durability: { current: 45, max: 45 },
        description: '西部荒野盗匪使用的面罩',
        sellPrice: 22,
    },
    
    // -- 胸甲 --
    leatherTunic: {
        id: 'leatherTunic',
        name: '皮甲外衣',
        emoji: '🦺',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 3, ItemQuality.COMMON),
        stats: { agility: 2, stamina: 1 },
        durability: { current: 40, max: 40 },
        description: '标准的皮甲外衣',
        sellPrice: 8,
    },
    nightslayerTunic: {
        id: 'nightslayerTunic',
        name: '夜幕杀手外衣',
        emoji: '🦺',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 12, ItemQuality.RARE),
        stats: { agility: 8, stamina: 5, strength: 3 },
        durability: { current: 60, max: 60 },
        setId: 'nightslayer',
        description: '夜幕杀手套装外衣，让穿戴者如影随形',
        sellPrice: 85,
    },
    
    // ==================== 锁甲（猎人/萨满）====================
    
    // -- 头部 --
    chainCoif: {
        id: 'chainCoif',
        name: '链甲头巾',
        emoji: '⛑️',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'mail',
        armorValue: calcArmorValue('mail', 3, ItemQuality.COMMON),
        stats: { agility: 1, stamina: 1 },
        durability: { current: 40, max: 40 },
        description: '锁链编织的头巾',
        sellPrice: 7,
    },
    
    // -- 胸甲 --
    chainmail: {
        id: 'chainmail',
        name: '链甲胸甲',
        emoji: '🛡️',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'mail',
        armorValue: calcArmorValue('mail', 3, ItemQuality.COMMON),
        stats: { stamina: 2, agility: 1 },
        durability: { current: 45, max: 45 },
        description: '标准的锁链甲胸甲',
        sellPrice: 10,
    },
    beaststalkerTunic: {
        id: 'beaststalkerTunic',
        name: '猎兽者外衣',
        emoji: '🦺',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        armorType: 'mail',
        armorValue: calcArmorValue('mail', 12, ItemQuality.RARE),
        stats: { agility: 7, stamina: 5, intellect: 4 },
        durability: { current: 65, max: 65 },
        setId: 'beaststalker',
        description: '猎兽者套装胸甲，散发着自然的气息',
        sellPrice: 90,
    },
    
    // ==================== 板甲（战士/圣骑士）====================
    
    // -- 头部 --
    ironHelm: {
        id: 'ironHelm',
        name: '铁质头盔',
        emoji: '⛑️',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 3, ItemQuality.COMMON),
        stats: { stamina: 2, strength: 1 },
        durability: { current: 50, max: 50 },
        description: '沉重但坚固的铁盔',
        sellPrice: 8,
    },
    valorHelm: {
        id: 'valorHelm',
        name: '英勇头盔',
        emoji: '⛑️',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 12, ItemQuality.RARE),
        stats: { stamina: 5, strength: 4, health: 3 },
        durability: { current: 70, max: 70 },
        setId: 'valor',
        description: '英勇套装头盔，战士荣耀的象征',
        sellPrice: 95,
    },
    
    // -- 胸甲 --
    ironBreastplate: {
        id: 'ironBreastplate',
        name: '铁质胸甲',
        emoji: '🛡️',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 3, ItemQuality.COMMON),
        stats: { stamina: 2, strength: 1 },
        durability: { current: 55, max: 55 },
        description: '标准的铁制胸甲',
        sellPrice: 12,
    },
    valorBreastplate: {
        id: 'valorBreastplate',
        name: '英勇胸甲',
        emoji: '🛡️',
        type: 'equipment',
        slot: 'chest',
        category: 'armor',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 12, ItemQuality.RARE),
        stats: { stamina: 8, strength: 6, health: 2 },
        durability: { current: 75, max: 75 },
        setId: 'valor',
        description: '英勇套装胸甲，铭刻着古老的符文',
        sellPrice: 100,
    },
    
    // ==================== 通用护甲（手套/腿甲/鞋子/肩部）====================
    
    clothGloves: {
        id: 'clothGloves',
        name: '布质手套',
        emoji: '🧤',
        type: 'equipment',
        slot: 'hands',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 2, ItemQuality.COMMON),
        stats: { intellect: 1, spirit: 1 },
        durability: { current: 20, max: 20 },
        description: '简单的布质手套',
        sellPrice: 3,
    },
    leatherGloves: {
        id: 'leatherGloves',
        name: '皮革手套',
        emoji: '🧤',
        type: 'equipment',
        slot: 'hands',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 2, ItemQuality.COMMON),
        stats: { agility: 1, stamina: 1 },
        durability: { current: 25, max: 25 },
        description: '轻便的皮革手套',
        sellPrice: 4,
    },
    ironGauntlets: {
        id: 'ironGauntlets',
        name: '铁质护手',
        emoji: '🧤',
        type: 'equipment',
        slot: 'hands',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 2, ItemQuality.COMMON),
        stats: { strength: 1, stamina: 1 },
        durability: { current: 30, max: 30 },
        description: '沉重的铁质护手',
        sellPrice: 5,
    },
    
    clothLeggings: {
        id: 'clothLeggings',
        name: '布质裤装',
        emoji: '👖',
        type: 'equipment',
        slot: 'legs',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 2, ItemQuality.COMMON),
        stats: { intellect: 1, stamina: 1 },
        durability: { current: 25, max: 25 },
        description: '简单的布质裤子',
        sellPrice: 4,
    },
    leatherLeggings: {
        id: 'leatherLeggings',
        name: '皮革护腿',
        emoji: '👖',
        type: 'equipment',
        slot: 'legs',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 2, ItemQuality.COMMON),
        stats: { agility: 1, stamina: 1 },
        durability: { current: 30, max: 30 },
        description: '灵活的皮质护腿',
        sellPrice: 5,
    },
    ironLegplates: {
        id: 'ironLegplates',
        name: '铁质腿甲',
        emoji: '👖',
        type: 'equipment',
        slot: 'legs',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 2, ItemQuality.COMMON),
        stats: { stamina: 1, strength: 1 },
        durability: { current: 35, max: 35 },
        description: '坚固的铁质腿甲',
        sellPrice: 6,
    },
    
    clothBoots: {
        id: 'clothBoots',
        name: '布质鞋',
        emoji: '👢',
        type: 'equipment',
        slot: 'feet',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 2, ItemQuality.COMMON),
        stats: { spirit: 1, stamina: 1 },
        durability: { current: 20, max: 20 },
        description: '简单的布鞋',
        sellPrice: 3,
    },
    leatherBoots: {
        id: 'leatherBoots',
        name: '皮靴',
        emoji: '👢',
        type: 'equipment',
        slot: 'feet',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 2, ItemQuality.COMMON),
        stats: { agility: 1, stamina: 1 },
        durability: { current: 25, max: 25 },
        description: '轻便的皮靴',
        sellPrice: 4,
    },
    ironBoots: {
        id: 'ironBoots',
        name: '铁靴',
        emoji: '👢',
        type: 'equipment',
        slot: 'feet',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 2, ItemQuality.COMMON),
        stats: { stamina: 2 },
        durability: { current: 30, max: 30 },
        description: '沉重的铁制战靴',
        sellPrice: 5,
    },
    
    clothShoulders: {
        id: 'clothShoulders',
        name: '布质护肩',
        emoji: '🦺',
        type: 'equipment',
        slot: 'shoulders',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 3, ItemQuality.COMMON),
        stats: { intellect: 1, spirit: 1 },
        durability: { current: 25, max: 25 },
        description: '薄薄的布质护肩',
        sellPrice: 4,
    },
    leatherPauldrons: {
        id: 'leatherPauldrons',
        name: '皮质肩甲',
        emoji: '🦺',
        type: 'equipment',
        slot: 'shoulders',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 3, ItemQuality.COMMON),
        stats: { agility: 1, stamina: 1 },
        durability: { current: 30, max: 30 },
        description: '轻便的皮质肩甲',
        sellPrice: 5,
    },
    ironPauldrons: {
        id: 'ironPauldrons',
        name: '铁质肩甲',
        emoji: '🦺',
        type: 'equipment',
        slot: 'shoulders',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 3, ItemQuality.COMMON),
        stats: { stamina: 2, strength: 1 },
        durability: { current: 35, max: 35 },
        description: '厚重的铁质肩甲',
        sellPrice: 6,
    },
    
    // ==================== 手腕/腰带/披风（Task 1.8）====================
    
    // -- 手腕 --
    clothWristbands: {
        id: 'clothWristbands',
        name: '布质护腕',
        emoji: '⌚',
        type: 'equipment',
        slot: 'wrists',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 2, ItemQuality.COMMON),
        stats: { intellect: 1 },
        durability: { current: 20, max: 20 },
        description: '简单的布质护腕',
        sellPrice: 2,
    },
    leatherBracers: {
        id: 'leatherBracers',
        name: '皮革护腕',
        emoji: '⌚',
        type: 'equipment',
        slot: 'wrists',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 2, ItemQuality.COMMON),
        stats: { agility: 1 },
        durability: { current: 25, max: 25 },
        description: '轻便的皮革护腕',
        sellPrice: 3,
    },
    ironVambraces: {
        id: 'ironVambraces',
        name: '铁质臂甲',
        emoji: '⌚',
        type: 'equipment',
        slot: 'wrists',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 2, ItemQuality.COMMON),
        stats: { stamina: 1 },
        durability: { current: 30, max: 30 },
        description: '沉重的铁质臂甲',
        sellPrice: 3,
    },
    
    // -- 腰带 --
    clothBelt: {
        id: 'clothBelt',
        name: '布质腰带',
        emoji: '🪢',
        type: 'equipment',
        slot: 'waist',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 2, ItemQuality.COMMON),
        stats: { spirit: 1 },
        durability: { current: 20, max: 20 },
        description: '简单的布质腰带',
        sellPrice: 2,
    },
    leatherBelt: {
        id: 'leatherBelt',
        name: '皮革腰带',
        emoji: '🪢',
        type: 'equipment',
        slot: 'waist',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'leather',
        armorValue: calcArmorValue('leather', 2, ItemQuality.COMMON),
        stats: { agility: 1 },
        durability: { current: 25, max: 25 },
        description: '结实的皮革腰带',
        sellPrice: 3,
    },
    ironGirdle: {
        id: 'ironGirdle',
        name: '铁质腰带',
        emoji: '🪢',
        type: 'equipment',
        slot: 'waist',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 2, ItemQuality.COMMON),
        stats: { strength: 1 },
        durability: { current: 30, max: 30 },
        description: '坚固的铁质腰带',
        sellPrice: 3,
    },
    
    // -- 披风（通用，cloth 系数，不限职业）--
    travelersCloak: {
        id: 'travelersCloak',
        name: '旅行者披风',
        emoji: '🧣',
        type: 'equipment',
        slot: 'back',
        category: 'armor',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 3, ItemQuality.COMMON),
        stats: { stamina: 1, spirit: 1 },
        durability: { current: 25, max: 25 },
        description: '一件朴素但保暖的旅行者披风',
        sellPrice: 4,
    },
    shadowCloak: {
        id: 'shadowCloak',
        name: '暗影斗篷',
        emoji: '🧣',
        type: 'equipment',
        slot: 'back',
        category: 'armor',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        armorType: 'cloth',
        armorValue: calcArmorValue('cloth', 8, ItemQuality.UNCOMMON),
        stats: { agility: 2, stamina: 2 },
        durability: { current: 35, max: 35 },
        description: '染着暗影的斗篷，在黑暗中几乎不可见',
        sellPrice: 18,
    },
    
    // ==================== 武器 ====================
    
    // -- 单手剑 --
    rustySword: {
        id: 'rustySword',
        name: '生锈的剑',
        emoji: '🗡️',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        weaponType: 'sword',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(2, ItemQuality.COMMON, 'one_hand'),
        stats: {},
        durability: { current: 30, max: 30 },
        description: '一把生锈但仍能使用的剑',
        sellPrice: 5,
    },
    militiaSword: {
        id: 'militiaSword',
        name: '民兵之剑',
        emoji: '🗡️',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 6,
        requiredLevel: 2,
        weaponType: 'sword',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(6, ItemQuality.UNCOMMON, 'one_hand'),
        stats: { strength: 3, stamina: 2 },
        durability: { current: 40, max: 40 },
        description: '暴风城民兵使用的标准配剑',
        sellPrice: 20,
    },
    swordOfValor: {
        id: 'swordOfValor',
        name: '英勇之剑',
        emoji: '⚔️',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.RARE,
        itemLevel: 14,
        requiredLevel: 5,
        weaponType: 'sword',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(14, ItemQuality.RARE, 'one_hand'),
        stats: { strength: 5, stamina: 3, health: 4 },
        durability: { current: 60, max: 60 },
        setId: 'valor',
        description: '英勇套装之剑，刃锋闪烁着金色光芒',
        sellPrice: 120,
    },
    
    // -- 双手剑 --
    brawlersGreatsword: {
        id: 'brawlersGreatsword',
        name: '决斗者巨剑',
        emoji: '⚔️',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        weaponType: 'sword',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(8, ItemQuality.UNCOMMON, 'two_hand'),
        stats: { strength: 5, stamina: 2 },
        durability: { current: 50, max: 50 },
        description: '决斗场上常见的巨型双手剑',
        sellPrice: 30,
    },
    
    // -- 单手斧 --
    woodcutterAxe: {
        id: 'woodcutterAxe',
        name: '伐木斧',
        emoji: '🪓',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        weaponType: 'axe',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(2, ItemQuality.COMMON, 'one_hand'),
        stats: {},
        durability: { current: 30, max: 30 },
        description: '原本用于伐木，也能用于战斗',
        sellPrice: 4,
    },
    
    // -- 双手斧 --
    executionersAxe: {
        id: 'executionersAxe',
        name: '行刑者巨斧',
        emoji: '🪓',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        weaponType: 'axe',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(8, ItemQuality.UNCOMMON, 'two_hand'),
        stats: { strength: 4, stamina: 3 },
        durability: { current: 50, max: 50 },
        description: '沉重的双手战斧，令人闻风丧胆',
        sellPrice: 28,
    },
    
    // -- 单手锤 --
    ironMace: {
        id: 'ironMace',
        name: '铁锤',
        emoji: '🔨',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        weaponType: 'mace',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(3, ItemQuality.COMMON, 'one_hand'),
        stats: {},
        durability: { current: 35, max: 35 },
        description: '沉甸甸的铁锤',
        sellPrice: 6,
    },
    
    // -- 双手锤 --
    crushingMaul: {
        id: 'crushingMaul',
        name: '碎骨巨锤',
        emoji: '🔨',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        weaponType: 'mace',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(8, ItemQuality.UNCOMMON, 'two_hand'),
        stats: { strength: 3, stamina: 4 },
        durability: { current: 55, max: 55 },
        description: '沉重到令人窒息的双手战锤',
        sellPrice: 28,
    },
    
    // -- 匕首（仅单手）--
    sharpDagger: {
        id: 'sharpDagger',
        name: '锋利匕首',
        emoji: '🔪',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        weaponType: 'dagger',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(2, ItemQuality.COMMON, 'one_hand'),
        stats: {},
        durability: { current: 25, max: 25 },
        description: '锋利的短匕首',
        sellPrice: 4,
    },
    nightslayerBlade: {
        id: 'nightslayerBlade',
        name: '夜幕杀手之刃',
        emoji: '🔪',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.RARE,
        itemLevel: 14,
        requiredLevel: 5,
        weaponType: 'dagger',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(14, ItemQuality.RARE, 'one_hand'),
        stats: { agility: 6, strength: 3, stamina: 3 },
        durability: { current: 50, max: 50 },
        setId: 'nightslayer',
        description: '夜幕杀手套装利刃，淬了致命的毒素',
        sellPrice: 110,
    },
    
    // -- 法杖（双手）--
    apprenticeStaff: {
        id: 'apprenticeStaff',
        name: '学徒法杖',
        emoji: '🪄',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        weaponType: 'staff',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(3, ItemQuality.COMMON, 'two_hand'),
        stats: {},
        durability: { current: 30, max: 30 },
        description: '法师学徒的标准法杖',
        sellPrice: 6,
    },
    shadowweaveStaff: {
        id: 'shadowweaveStaff',
        name: '暗影织布法杖',
        emoji: '🪄',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.RARE,
        itemLevel: 14,
        requiredLevel: 5,
        weaponType: 'staff',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(14, ItemQuality.RARE, 'two_hand'),
        stats: { intellect: 10, spirit: 4, mana: 5 },
        durability: { current: 50, max: 50 },
        setId: 'shadowweave',
        description: '暗影织布套装法杖，顶端闪烁着幽暗火焰',
        sellPrice: 115,
    },
    
    // -- 长柄武器（双手）--
    ironPolearm: {
        id: 'ironPolearm',
        name: '铁质长戟',
        emoji: '🔱',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        weaponType: 'polearm',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(3, ItemQuality.COMMON, 'two_hand'),
        stats: {},
        durability: { current: 35, max: 35 },
        description: '沉重的铁制长戟',
        sellPrice: 7,
    },
    
    // -- 魔杖（单手）--
    simpleWand: {
        id: 'simpleWand',
        name: '简易魔杖',
        emoji: '🪄',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        weaponType: 'wand',
        weaponHand: 'one_hand',
        damage: calcWeaponDamage(2, ItemQuality.COMMON, 'one_hand'),
        stats: {},
        durability: { current: 20, max: 20 },
        description: '一根蕴含微弱魔力的魔杖',
        sellPrice: 4,
    },
    
    // -- 弓（双手）--
    shortBow: {
        id: 'shortBow',
        name: '短弓',
        emoji: '🏹',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        weaponType: 'bow',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(2, ItemQuality.COMMON, 'two_hand'),
        stats: {},
        durability: { current: 25, max: 25 },
        description: '简单但实用的短弓',
        sellPrice: 5,
    },
    beaststalkerBow: {
        id: 'beaststalkerBow',
        name: '猎兽者之弓',
        emoji: '🏹',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.RARE,
        itemLevel: 14,
        requiredLevel: 5,
        weaponType: 'bow',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(14, ItemQuality.RARE, 'two_hand'),
        stats: { agility: 6, stamina: 3 },
        durability: { current: 50, max: 50 },
        setId: 'beaststalker',
        description: '猎兽者套装之弓，瞄准时从不动摇',
        sellPrice: 100,
    },
    
    // -- 盾牌 --
    woodenShield: {
        id: 'woodenShield',
        name: '木盾',
        emoji: '🛡️',
        type: 'equipment',
        slot: 'offHand',
        category: 'shield',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        weaponType: 'shield',
        armorValue: calcArmorValue('shield', 2, ItemQuality.COMMON),
        stats: { stamina: 1 },
        durability: { current: 40, max: 40 },
        description: '简陋但能挡箭的木盾',
        sellPrice: 4,
    },
    valorShield: {
        id: 'valorShield',
        name: '英勇盾牌',
        emoji: '🛡️',
        type: 'equipment',
        slot: 'offHand',
        category: 'shield',
        quality: ItemQuality.RARE,
        itemLevel: 14,
        requiredLevel: 5,
        weaponType: 'shield',
        armorValue: calcArmorValue('shield', 14, ItemQuality.RARE),
        stats: { stamina: 5, strength: 3, health: 4 },
        durability: { current: 70, max: 70 },
        setId: 'valor',
        description: '英勇套装盾牌，坚不可摧',
        sellPrice: 105,
    },
    
    // ==================== 副手物品（Task 1.6）====================
    
    tomeOfKnowledge: {
        id: 'tomeOfKnowledge',
        name: '知识之书',
        emoji: '📖',
        type: 'equipment',
        slot: 'offHand',
        category: 'offhand',
        quality: ItemQuality.COMMON,
        itemLevel: 3,
        requiredLevel: 1,
        stats: { intellect: 1, spirit: 1 },
        description: '蕴含知识的古书，可持于副手',
        sellPrice: 5,
    },
    crystalOrb: {
        id: 'crystalOrb',
        name: '水晶球',
        emoji: '🔮',
        type: 'equipment',
        slot: 'offHand',
        category: 'offhand',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        stats: { intellect: 3, spirit: 2 },
        description: '闪烁着淡蓝色光芒的水晶球',
        sellPrice: 20,
    },
    holyRelic: {
        id: 'holyRelic',
        name: '神圣圣物',
        emoji: '✝️',
        type: 'equipment',
        slot: 'offHand',
        category: 'offhand',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        stats: { intellect: 4, spirit: 3, mana: 3 },
        description: '散发着神圣光芒的圣物',
        sellPrice: 60,
    },
    
    // ==================== 饰品/项链/戒指（Task 1.7）====================
    
    // -- 项链 --
    copperNecklace: {
        id: 'copperNecklace',
        name: '铜质项链',
        emoji: '📿',
        type: 'equipment',
        slot: 'neck',
        category: 'accessory',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        stats: { stamina: 1 },
        description: '简单的铜质项链',
        sellPrice: 3,
    },
    pendantOfWisdom: {
        id: 'pendantOfWisdom',
        name: '智慧吊坠',
        emoji: '📿',
        type: 'equipment',
        slot: 'neck',
        category: 'accessory',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        stats: { intellect: 3, spirit: 2 },
        description: '蕴含古老智慧的吊坠',
        sellPrice: 18,
    },
    
    // -- 戒指 --
    copperRing: {
        id: 'copperRing',
        name: '铜戒指',
        emoji: '💍',
        type: 'equipment',
        slot: 'finger1',
        category: 'accessory',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        stats: { stamina: 1 },
        description: '朴素的铜质戒指',
        sellPrice: 2,
    },
    bandOfProtection: {
        id: 'bandOfProtection',
        name: '守护指环',
        emoji: '💍',
        type: 'equipment',
        slot: 'finger1',
        category: 'accessory',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        stats: { stamina: 3, health: 3 },
        description: '刻有守护符文的指环',
        sellPrice: 15,
    },
    ringOfPower: {
        id: 'ringOfPower',
        name: '力量之戒',
        emoji: '💍',
        type: 'equipment',
        slot: 'finger1',
        category: 'accessory',
        quality: ItemQuality.RARE,
        itemLevel: 12,
        requiredLevel: 5,
        unique: true,
        stats: { strength: 3, agility: 3, stamina: 3 },
        description: '蕴含强大力量的稀有戒指，只能佩戴一枚',
        sellPrice: 50,
    },
    
    // -- 饰品 --
    luckyCharm: {
        id: 'luckyCharm',
        name: '幸运符',
        emoji: '🍀',
        type: 'equipment',
        slot: 'trinket1',
        category: 'accessory',
        quality: ItemQuality.COMMON,
        itemLevel: 2,
        requiredLevel: 1,
        stats: { stamina: 1 },
        description: '据说能带来好运的小饰品',
        sellPrice: 3,
    },
    markOfTheWild: {
        id: 'markOfTheWild',
        name: '野性印记徽章',
        emoji: '🌿',
        type: 'equipment',
        slot: 'trinket1',
        category: 'accessory',
        quality: ItemQuality.UNCOMMON,
        itemLevel: 8,
        requiredLevel: 3,
        stats: { stamina: 2, spirit: 2, agility: 1 },
        description: '刻有自然印记的徽章',
        sellPrice: 16,
    },
    
    // ==================== 史诗装备 ====================
    
    crownOfDestruction: {
        id: 'crownOfDestruction',
        name: '毁灭之冠',
        emoji: '👑',
        type: 'equipment',
        slot: 'head',
        category: 'armor',
        quality: ItemQuality.EPIC,
        itemLevel: 20,
        requiredLevel: 8,
        armorType: 'plate',
        armorValue: calcArmorValue('plate', 20, ItemQuality.EPIC),
        stats: { strength: 8, stamina: 7 },
        durability: { current: 90, max: 90 },
        description: '传说中暗黑骑士的王冠，散发着毁灭的气息',
        sellPrice: 250,
    },
    staffOfDominance: {
        id: 'staffOfDominance',
        name: '统御法杖',
        emoji: '🪄',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.EPIC,
        itemLevel: 20,
        requiredLevel: 8,
        weaponType: 'staff',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(20, ItemQuality.EPIC, 'two_hand'),
        stats: { intellect: 12, spirit: 8, mana: 12 },
        durability: { current: 70, max: 70 },
        description: '蕴含着强大奥术能量的法杖，据说能控制元素之力',
        sellPrice: 300,
    },
    
    // ==================== 传说装备 ====================
    
    ashbringer: {
        id: 'ashbringer',
        name: '灰烬使者',
        emoji: '⚔️',
        type: 'equipment',
        slot: 'mainHand',
        category: 'weapon',
        quality: ItemQuality.LEGENDARY,
        itemLevel: 30,
        requiredLevel: 10,
        weaponType: 'sword',
        weaponHand: 'two_hand',
        damage: calcWeaponDamage(30, ItemQuality.LEGENDARY, 'two_hand'),
        unique: true,
        stats: { strength: 20, stamina: 12, health: 28 },
        durability: { current: 120, max: 120 },
        description: '传说中的圣光之剑，净化一切邪恶',
        sellPrice: 0,
    },

    // ==================== 经典副本装备（动态合并） ====================
    ...ClassicEquipmentBatch1,
    ...ClassicEquipmentBatch2,
    ...ClassicEquipmentBatch3,
}

// ==================== 套装定义 ====================

export const SetBonuses = {
    // 英勇套装（战士/圣骑士 板甲）
    valor: {
        id: 'valor',
        name: '英勇套装',
        pieces: ['valorHelm', 'valorBreastplate', 'swordOfValor', 'valorShield'],
        bonuses: {
            2: { name: '2件套', description: '力量+5', stats: { strength: 5 } },
            4: { name: '4件套', description: '生命上限+50', stats: { health: 50 } },
        },
    },
    // 夜幕杀手套装（盗贼 皮甲）
    nightslayer: {
        id: 'nightslayer',
        name: '夜幕杀手套装',
        pieces: ['banditMask', 'nightslayerTunic', 'nightslayerBlade'],
        bonuses: {
            2: { name: '2件套', description: '敏捷+5', stats: { agility: 5 } },
            3: { name: '3件套', description: '暴击提升，力量+3', stats: { strength: 3, agility: 3 } },
        },
    },
    // 暗影织布套装（法师/术士 布甲）
    shadowweave: {
        id: 'shadowweave',
        name: '暗影织布套装',
        pieces: ['shadowHood', 'shadowweaveRobe', 'shadowweaveStaff'],
        bonuses: {
            2: { name: '2件套', description: '智力+5', stats: { intellect: 5 } },
            3: { name: '3件套', description: '法力上限+40', stats: { mana: 40 } },
        },
    },
    // 猎兽者套装（猎人 锁甲）
    beaststalker: {
        id: 'beaststalker',
        name: '猎兽者套装',
        pieces: ['chainCoif', 'beaststalkerTunic', 'beaststalkerBow'],
        bonuses: {
            2: { name: '2件套', description: '敏捷+4', stats: { agility: 4 } },
            3: { name: '3件套', description: '敏捷+3，体力+3', stats: { agility: 3, stamina: 3 } },
        },
    },
}

// ==================== 怪物装备掉落表 ====================

/**
 * 怪物掉落装备配置
 * dropChance: 掉落概率 (0-1)
 * items: [{ id, weight }] 加权掉落池
 */
export const MonsterEquipmentDrops = {
    forestOrc: {
        dropChance: 0.25,
        items: [
            { id: 'rustySword', weight: 30 },
            { id: 'woodcutterAxe', weight: 30 },
            { id: 'ironHelm', weight: 15 },
            { id: 'ironBreastplate', weight: 10 },
            { id: 'militiaSword', weight: 10 },
            { id: 'ironPauldrons', weight: 5 },
        ],
    },
    goblin: {
        dropChance: 0.20,
        items: [
            { id: 'sharpDagger', weight: 30 },
            { id: 'leatherHelm', weight: 25 },
            { id: 'leatherTunic', weight: 20 },
            { id: 'banditMask', weight: 15 },
            { id: 'leatherGloves', weight: 10 },
        ],
    },
    wolf: {
        dropChance: 0.15,
        items: [
            { id: 'leatherBoots', weight: 40 },
            { id: 'leatherLeggings', weight: 30 },
            { id: 'leatherGloves', weight: 30 },
        ],
    },
    skeleton: {
        dropChance: 0.30,
        items: [
            { id: 'rustySword', weight: 20 },
            { id: 'ironHelm', weight: 20 },
            { id: 'woodenShield', weight: 15 },
            { id: 'ironBreastplate', weight: 15 },
            { id: 'ironGauntlets', weight: 10 },
            { id: 'ironLegplates', weight: 10 },
            { id: 'ironBoots', weight: 10 },
        ],
    },
    troll: {
        dropChance: 0.40,
        items: [
            { id: 'ironMace', weight: 15 },
            { id: 'militiaSword', weight: 15 },
            { id: 'ironBreastplate', weight: 10 },
            { id: 'ironHelm', weight: 10 },
            { id: 'nightslayerTunic', weight: 8 },
            { id: 'shadowweaveRobe', weight: 8 },
            { id: 'beaststalkerTunic', weight: 8 },
            { id: 'valorBreastplate', weight: 8 },
            { id: 'nightslayerBlade', weight: 6 },
            { id: 'shadowweaveStaff', weight: 6 },
            { id: 'swordOfValor', weight: 6 },
        ],
    },
    // BOSS 掉落
    serpentis: {
        dropChance: 1.0,
        items: [
            { id: 'shadowweaveRobe', weight: 15 },
            { id: 'shadowweaveStaff', weight: 15 },
            { id: 'nightslayerTunic', weight: 15 },
            { id: 'nightslayerBlade', weight: 15 },
            { id: 'beaststalkerTunic', weight: 15 },
            { id: 'valorBreastplate', weight: 15 },
            { id: 'staffOfDominance', weight: 5 },
            { id: 'crownOfDestruction', weight: 5 },
        ],
    },
    mutanus: {
        dropChance: 1.0,
        items: [
            { id: 'swordOfValor', weight: 12 },
            { id: 'valorHelm', weight: 12 },
            { id: 'valorShield', weight: 12 },
            { id: 'beaststalkerBow', weight: 12 },
            { id: 'shadowHood', weight: 12 },
            { id: 'staffOfDominance', weight: 10 },
            { id: 'crownOfDestruction', weight: 10 },
            { id: 'ashbringer', weight: 3 },
        ],
    },
}

/**
 * 根据加权掉落池随机选择一件装备
 * @param {string} monsterId - 怪物ID
 * @returns {Object|null} 装备物品数据的深拷贝，或 null（未掉落）
 */
export function rollEquipmentDrop(monsterId) {
    const dropConfig = MonsterEquipmentDrops[monsterId]
    if (!dropConfig) return null
    
    if (random() > dropConfig.dropChance) return null
    
    // 加权随机
    const totalWeight = dropConfig.items.reduce((sum, i) => sum + i.weight, 0)
    let roll = random() * totalWeight
    for (const entry of dropConfig.items) {
        roll -= entry.weight
        if (roll <= 0) {
            const template = EquipmentDatabase[entry.id]
            if (!template) return null
            // 返回深拷贝，每件装备是独立实例
            return {
                ...template,
                instanceId: 'eq_' + Date.now() + '_' + random().toString(36).substring(2, 8),
                durability: { ...template.durability },
                stats: { ...template.stats },
            }
        }
    }
    return null
}

// ==================== 装备生成器 ====================

/**
 * 槽位属性偏好池
 * 权重越高，该属性被选中的概率越大
 */
const slotStatBias = {
    // 护甲件
    head:      { stamina: 2, intellect: 2, strength: 1, spirit: 1 },
    shoulders: { stamina: 2, strength: 2, agility: 1, intellect: 1 },
    chest:     { stamina: 3, strength: 2, agility: 1 },
    legs:      { stamina: 3, agility: 2, strength: 1 },
    hands:     { agility: 2, strength: 2, stamina: 1 },
    wrists:    { stamina: 2, intellect: 1, spirit: 1 },
    waist:     { stamina: 2, strength: 1, agility: 1 },
    feet:      { agility: 2, stamina: 2, spirit: 1 },
    back:      { stamina: 2, agility: 1, spirit: 1 },
    // 武器（物理系默认）
    mainHand:  { strength: 3, agility: 2, stamina: 1 },
    offHand:   { intellect: 2, stamina: 2, spirit: 1 },
    // 饰品类
    neck:      { intellect: 2, spirit: 2, stamina: 1 },
    finger1:   { stamina: 1, strength: 1, agility: 1, intellect: 1 },
    finger2:   { stamina: 1, strength: 1, agility: 1, intellect: 1 },
    trinket1:  { intellect: 2, spirit: 2, stamina: 1, agility: 1 },
    trinket2:  { intellect: 2, spirit: 2, stamina: 1, agility: 1 },
}

/**
 * 武器类型属性偏好覆写
 * 法系武器（魔杖/法杖）只出智力/精神/耐力
 * 远程物理武器（弓/弩/枪）出敏捷为主
 * 匕首出敏捷为主
 */
const weaponStatBias = {
    wand:     { intellect: 3, spirit: 2, stamina: 1 },
    staff:    { intellect: 3, spirit: 2, stamina: 1 },
    bow:      { agility: 3, stamina: 2, strength: 1 },
    crossbow: { agility: 3, stamina: 2, strength: 1 },
    gun:      { agility: 3, stamina: 2, strength: 1 },
    dagger:   { agility: 3, strength: 2, stamina: 1 },
}

/**
 * 装备名称池
 * 按 {armorType/weaponType}.{slot} 组织
 */
const EquipmentNamePool = {
    // 布甲
    'cloth.head':      ['法师帽', '巫师头巾', '符文法冠', '织布兜帽', '秘法帽'],
    'cloth.shoulders': ['布质护肩', '法纹护肩', '符文肩垫', '织布肩铠'],
    'cloth.chest':     ['长袍', '法袍', '丝绸外袍', '织布法衣', '秘法法袍'],
    'cloth.legs':      ['布裤', '法师裤装', '织布短裤', '丝绸护腿'],
    'cloth.hands':     ['布手套', '丝绸手套', '织纹手套', '法纹护手'],
    'cloth.wrists':    ['布护腕', '丝绸护腕', '织布腕带'],
    'cloth.waist':     ['布腰带', '丝绸腰带', '法纹束腰'],
    'cloth.feet':      ['布鞋', '丝绸长靴', '法纹之靴'],
    'cloth.back':      ['布质斗篷', '旅行者披风', '丝绸斗篷'],
    // 皮甲
    'leather.head':    ['皮盔', '皮革头盔', '兽皮面罩', '硬化皮冠'],
    'leather.shoulders':['皮肩', '兽皮肩铠', '皮革护肩'],
    'leather.chest':   ['皮甲', '皮制胸甲', '兽皮外衣', '硬化皮甲'],
    'leather.legs':    ['皮裤', '皮革护腿', '兽皮护腿'],
    'leather.hands':   ['皮手套', '皮革护手', '兽皮手套'],
    'leather.wrists':  ['皮护腕', '兽皮护腕', '皮革腕带'],
    'leather.waist':   ['皮腰带', '兽皮腰带', '皮革束腰'],
    'leather.feet':    ['皮靴', '兽皮长靴', '皮革战靴'],
    'leather.back':    ['皮斗篷', '兽皮披风', '暗影斗篷'],
    // 锁甲
    'mail.head':       ['链甲头巾', '锁甲面罩', '链环头盔'],
    'mail.shoulders':  ['锁甲护肩', '链甲肩铠', '链环肩垫'],
    'mail.chest':      ['锁甲', '链甲胸甲', '锁环外衣'],
    'mail.legs':       ['锁甲护腿', '链甲裤甲', '链环护腿'],
    'mail.hands':      ['锁甲手套', '链甲护手', '链环手套'],
    'mail.wrists':     ['锁甲护腕', '链甲腕带'],
    'mail.waist':      ['锁甲腰带', '链甲束腰'],
    'mail.feet':       ['锁甲战靴', '链甲长靴'],
    'mail.back':       ['锁甲斗篷', '链甲披风'],
    // 板甲
    'plate.head':      ['铁盔', '板甲头盔', '钢质头冠', '秘银头盔'],
    'plate.shoulders': ['铁肩铠', '板甲护肩', '钢质肩甲'],
    'plate.chest':     ['铁甲', '板甲胸甲', '钢质胸甲', '锻铁铠甲'],
    'plate.legs':      ['铁腿甲', '板甲护腿', '钢质腿铠'],
    'plate.hands':     ['铁护手', '板甲手套', '钢质护手'],
    'plate.wrists':    ['铁臂甲', '板甲护腕', '钢质腕甲'],
    'plate.waist':     ['铁腰带', '板甲束腰', '钢质腰带'],
    'plate.feet':      ['铁靴', '板甲战靴', '钢质战靴'],
    'plate.back':      ['铁披风', '板甲斗篷'],
    // 武器
    'sword.one_hand':  ['短剑', '宽刃剑', '秘银剑', '利刃', '战剑'],
    'sword.two_hand':  ['巨剑', '大剑', '双手阔剑', '斩首大剑'],
    'axe.one_hand':    ['手斧', '战斧', '铁斧', '利斧'],
    'axe.two_hand':    ['巨斧', '双手战斧', '斩骨巨斧'],
    'mace.one_hand':   ['铁锤', '战锤', '钉锤', '晨星锤'],
    'mace.two_hand':   ['巨锤', '碎骨大锤', '双手战锤'],
    'dagger.one_hand': ['匕首', '小刀', '刺客之刃', '暗影短刃'],
    'staff.two_hand':  ['法杖', '橡木法杖', '秘法杖', '元素法杖'],
    'polearm.two_hand':['长戟', '长矛', '战戟', '三叉戟'],
    'wand.one_hand':   ['魔杖', '水晶魔杖', '符文魔杖'],
    'bow.two_hand':    ['长弓', '短弓', '复合弓', '猎弓'],
    'crossbow.two_hand':['弩', '轻弩', '重弩'],
    'gun.two_hand':    ['火枪', '燧发枪', '手铳'],
    // 盾牌
    'shield':          ['木盾', '圆盾', '铁盾', '塔盾', '壁垒之盾'],
    // 饰品类
    'neck':            ['项链', '吊坠', '护符', '链坠'],
    'finger':          ['戒指', '指环', '宝石戒', '符文戒'],
    'trinket':         ['徽章', '饰品', '护符', '信物', '圣物'],
    // 副手
    'offhand':         ['典籍', '水晶球', '圣物', '魔法之书'],
}

/** 品质前缀映射（用于结构化拼接兜底） */
const QualityPrefix = {
    poor:      '破旧的',
    common:    '',
    uncommon:  '精致的',
    rare:      '卓越的',
    epic:      '无暇的',
    legendary: '传奇的',
}

/** 甲种材质名映射（用于结构化拼接兜底） */
const ArmorMaterialName = {
    cloth:   '布质',
    leather: '皮革',
    mail:    '锁甲',
    plate:   '板甲',
}

/**
 * 生成装备名称
 */
function generateEquipmentName(slot, quality, armorType, weaponType, weaponHand) {
    // 确定名称池 key
    let poolKey = null
    const slotDef = EQUIPMENT_SLOTS[slot]
    const category = slotDef?.category

    if (category === 'weapon' && weaponType) {
        if (weaponType === 'shield') {
            poolKey = 'shield'
        } else {
            poolKey = `${weaponType}.${weaponHand || 'one_hand'}`
        }
    } else if (category === 'armor' && armorType) {
        poolKey = `${armorType}.${slot}`
    } else if (category === 'accessory') {
        if (slot.startsWith('finger')) poolKey = 'finger'
        else if (slot.startsWith('trinket')) poolKey = 'trinket'
        else poolKey = slot
    } else if (category === 'offhand') {
        poolKey = 'offhand'
    }

    // 尝试从名称池选取
    const pool = poolKey ? EquipmentNamePool[poolKey] : null
    if (pool && pool.length > 0) {
        const baseName = randomChoice(pool)
        const prefix = QualityPrefix[quality] || ''
        return prefix ? `${prefix}${baseName}` : baseName
    }

    // 兜底：结构化拼接
    const prefix = QualityPrefix[quality] || ''
    const slotLabel = slotDef?.label || '装备'
    if (armorType) {
        const material = ArmorMaterialName[armorType] || ''
        return `${prefix}${material}${slotLabel}`
    }
    return `${prefix}${slotLabel}`
}

/** 槽位 → emoji 映射（用于生成器输出） */
const SlotEmoji = {
    head: '👑', shoulders: '🦺', chest: '🎽', legs: '👖', hands: '🧤',
    wrists: '⌚', waist: '🪢', feet: '👢', back: '🧣',
    neck: '📿', finger1: '💍', finger2: '💍', trinket1: '🔮', trinket2: '🔮',
    mainHand: '⚔️', offHand: '🛡️',
}

/**
 * 程序化装备生成器
 * @param {Object} params
 * @param {string} params.slot - 装备槽位
 * @param {number} params.itemLevel - 物品等级 (1~60)
 * @param {string} params.quality - 品质 (poor~legendary)
 * @param {string} [params.armorType] - 护甲类型 (cloth/leather/mail/plate)
 * @param {string} [params.weaponType] - 武器类型 (sword/axe/mace/dagger/staff/...)
 * @param {string} [params.weaponHand] - 武器握持 (one_hand/two_hand)
 * @returns {Object} 完整装备对象
 */
export function generateEquipment(params) {
    let { slot, itemLevel, quality, armorType, weaponType, weaponHand } = params

    const slotDef = EQUIPMENT_SLOTS[slot]
    if (!slotDef) throw new Error(`Unknown slot: ${slot}`)

    const category = slotDef.category

    // === 品质约束 ===
    // 饰品类品质下限 uncommon
    if (ACCESSORY_SLOTS.has(slot) && QUALITY_ORDER.indexOf(quality) < QUALITY_ORDER.indexOf('uncommon')) {
        quality = 'uncommon'
    }
    // 生成器不产出 legendary
    if (quality === 'legendary') {
        quality = 'epic'
    }

    const qualityCfg = QualityConfig[quality]
    const statScale = qualityCfg?.statScale || 1.0
    const slotWeight = slotDef.slotWeight

    // === 护甲值 ===
    let armorValue = 0
    if ((category === 'armor' || category === 'shield') && armorType) {
        armorValue = calcArmorValue(armorType, itemLevel, quality)
    }

    // === 武器伤害 ===
    let damage = null
    if (category === 'weapon' && weaponType && weaponType !== 'shield') {
        const hand = weaponHand || 'one_hand'
        damage = calcWeaponDamage(itemLevel, quality, hand)
    }

    // === 属性分配 ===
    let stats = {}
    const hasStats = QUALITY_ORDER.indexOf(quality) >= QUALITY_ORDER.indexOf('uncommon')

    if (hasStats) {
        // 双手武器 slotWeight 用 1.0，单手武器用 0.75
        let effectiveWeight = slotWeight
        if (category === 'weapon') {
            effectiveWeight = (weaponHand === 'two_hand') ? 1.0 : 0.75
        }

        const budget = Math.floor(itemLevel * effectiveWeight * statScale)

        if (budget > 0) {
            // 武器根据 weaponType 使用专属属性偏好，其他槽位用默认偏好
            let bias
            if (category === 'weapon' && weaponType && weaponStatBias[weaponType]) {
                bias = weaponStatBias[weaponType]
            } else {
                bias = slotStatBias[slot] || { stamina: 1, strength: 1 }
            }
            const biasEntries = Object.entries(bias)

            // 随机选 2~3 个属性
            const numStats = Math.min(biasEntries.length, 2 + (random() < 0.5 ? 1 : 0))
            const selected = weightedSample(biasEntries, numStats)

            // 按权重比例分配 budget
            const selectedTotalWeight = selected.reduce((s, [, w]) => s + w, 0)
            let allocated = {}
            let remaining = budget

            for (let i = 0; i < selected.length; i++) {
                const [statName, weight] = selected[i]
                if (i === selected.length - 1) {
                    // 最后一个拿剩余
                    allocated[statName] = Math.max(1, remaining)
                } else {
                    const base = Math.floor(budget * (weight / selectedTotalWeight))
                    // ±15% 浮动
                    const variance = 1 + (random() * 0.3 - 0.15)
                    const value = Math.max(1, Math.round(base * variance))
                    allocated[statName] = value
                    remaining -= value
                }
            }

            // 保证总和 = budget
            const currentTotal = Object.values(allocated).reduce((s, v) => s + v, 0)
            if (currentTotal !== budget && selected.length > 0) {
                const diff = budget - currentTotal
                const firstStat = selected[0][0]
                allocated[firstStat] = Math.max(1, allocated[firstStat] + diff)
            }

            stats = allocated
        }
    }

    // === 名称生成 ===
    const name = generateEquipmentName(slot, quality, armorType, weaponType, weaponHand)

    // === 耐久度 ===
    let durability = null
    if (!ACCESSORY_SLOTS.has(slot)) {
        const baseDur = Math.floor(20 + itemLevel * 1.5)
        const qualityBonus = { poor: 0.7, common: 1.0, uncommon: 1.2, rare: 1.5, epic: 2.0 }
        const maxDur = Math.floor(baseDur * (qualityBonus[quality] || 1.0))
        durability = { current: maxDur, max: maxDur }
    }

    // === 售价 ===
    const sellPriceBase = Math.floor(itemLevel * (QUALITY_ORDER.indexOf(quality) + 1) * 1.5)
    const sellPrice = Math.max(1, sellPriceBase)

    // === 所需等级 ===
    const requiredLevel = Math.max(1, Math.floor(itemLevel * 0.6))

    // === 组装装备对象 ===
    const item = {
        id: `gen_${slot}_${Date.now()}_${random().toString(36).substring(2, 6)}`,
        instanceId: `eq_${Date.now()}_${random().toString(36).substring(2, 8)}`,
        name,
        emoji: SlotEmoji[slot] || '📦',
        type: 'equipment',
        slot,
        category,
        quality,
        itemLevel,
        requiredLevel,
        stats,
        durability,
        sellPrice,
        generated: true, // 标记为生成器产出
    }

    if (armorType) item.armorType = armorType
    if (armorValue > 0) item.armorValue = armorValue
    if (weaponType) item.weaponType = weaponType
    if (weaponHand) item.weaponHand = weaponHand
    if (damage) item.damage = damage

    // 生成描述
    item.description = generateItemDescription(item)

    return item
}

/** 加权随机采样（不放回） */
function weightedSample(entries, count) {
    const pool = entries.map(([k, w]) => ({ key: k, weight: w }))
    const result = []
    for (let i = 0; i < count && pool.length > 0; i++) {
        const totalW = pool.reduce((s, p) => s + p.weight, 0)
        let roll = random() * totalW
        for (let j = 0; j < pool.length; j++) {
            roll -= pool[j].weight
            if (roll <= 0) {
                result.push([pool[j].key, pool[j].weight])
                pool.splice(j, 1)
                break
            }
        }
    }
    return result
}

/** 生成物品描述 */
function generateItemDescription(item) {
    const qualityName = QualityConfig[item.quality]?.name || '普通'
    const slotLabel = EQUIPMENT_SLOTS[item.slot]?.label || '装备'
    if (item.armorType) {
        const material = ArmorMaterialName[item.armorType] || ''
        return `${qualityName}品质的${material}${slotLabel}`
    }
    if (item.weaponType) {
        return `${qualityName}品质的${item.name}`
    }
    return `${qualityName}品质的${slotLabel}`
}

// ==================== 掉落系统配置数据 ====================

/**
 * 职业甲种亲和表
 * primary: 80%概率掉落的甲种
 * all: 该职业可穿的所有甲种
 */
export const ClassArmorAffinity = {
    warrior:  { primary: 'plate',   all: ['cloth', 'leather', 'mail', 'plate'] },
    paladin:  { primary: 'plate',   all: ['cloth', 'leather', 'mail', 'plate'] },
    hunter:   { primary: 'mail',    all: ['cloth', 'leather', 'mail'] },
    shaman:   { primary: 'mail',    all: ['cloth', 'leather', 'mail'] },
    rogue:    { primary: 'leather', all: ['cloth', 'leather'] },
    druid:    { primary: 'leather', all: ['cloth', 'leather'] },
    mage:     { primary: 'cloth',   all: ['cloth'] },
    warlock:  { primary: 'cloth',   all: ['cloth'] },
    priest:   { primary: 'cloth',   all: ['cloth'] },
}

/**
 * 区域掉落配置
 * dropChance: 每只怪掉装备的概率
 * iLvlOffset: [min, max] 相对怪物等级的 iLvl 偏移
 * qualityWeights: 品质权重（野外上限 rare）
 * maxDrops: 每次最多掉几件
 */
export const AreaLootConfig = {
    elwynnForest: {
        dropChance: 0.25,
        iLvlOffset: [-1, 2],
        qualityWeights: { poor: 45, common: 35, uncommon: 18, rare: 2 },
        maxDrops: 1,
    },
    westfall: {
        dropChance: 0.28,
        iLvlOffset: [-1, 2],
        qualityWeights: { poor: 40, common: 32, uncommon: 23, rare: 5 },
        maxDrops: 1,
    },
    stranglethorn: {
        dropChance: 0.30,
        iLvlOffset: [-1, 3],
        qualityWeights: { poor: 35, common: 28, uncommon: 28, rare: 9 },
        maxDrops: 1,
    },
    easternPlaguelands: {
        dropChance: 0.33,
        iLvlOffset: [-1, 3],
        qualityWeights: { poor: 30, common: 25, uncommon: 30, rare: 15 },
        maxDrops: 1,
    },
}

/**
 * 怪物级掉落覆写（可选，覆盖区域默认值）
 */
export const MonsterLootOverrides = {
    plaguewyrm: {
        dropChance: 0.45,
        iLvlOffset: [0, 5],
        qualityWeights: { poor: 15, common: 20, uncommon: 35, rare: 25, epic: 5 },
    },
    deathKnight: {
        dropChance: 0.40,
        iLvlOffset: [0, 4],
        qualityWeights: { poor: 20, common: 22, uncommon: 33, rare: 20, epic: 5 },
    },
    abomination: {
        dropChance: 0.38,
        iLvlOffset: [0, 3],
        qualityWeights: { poor: 22, common: 25, uncommon: 33, rare: 18, epic: 2 },
    },
}

/**
 * 副本通关奖励配置
 * bossCount: BOSS 数量（用于计算 totalDrops = 1 + floor(bossCount/2)）
 * recommendedLevelMax: 推荐等级上限（iLvl 基准）
 * iLvlOffset: [min, max] 相对 recommendedLevelMax 的偏移
 * qualityWeights: 品质权重（副本可出 epic，不出 legendary）
 * exclusiveDrops: 专属掉落列表
 */
export const DungeonLootConfig = {
    wailing_caverns: {
        dungeonId: 'wailing_caverns',
        bossCount: 2,
        recommendedLevelMax: 24,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 35, rare: 50, epic: 15 },
        exclusiveDrops: [
            { templateId: 'staffOfDominance', chance: 0.15 },
            { templateId: 'crownOfDestruction', chance: 0.15 },
        ],
    },
    ragefire_chasm: {
        dungeonId: 'ragefire_chasm',
        bossCount: 4,
        recommendedLevelMax: 18,
        iLvlOffset: [2, 5],
        qualityWeights: { uncommon: 45, rare: 40, epic: 15 },
        exclusiveDrops: [
            { templateId: 'bazalanScepter', chance: 0.20 },
            { templateId: 'oggleflintCleaver', chance: 0.18 },
        ],
    },
    deadmines: {
        dungeonId: 'deadmines',
        bossCount: 5,
        recommendedLevelMax: 23,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 35, rare: 50, epic: 15 },
        exclusiveDrops: [
            { templateId: 'vancleefBlade', chance: 0.18 },
            { templateId: 'smiteMightyHammer', chance: 0.15 },
            { templateId: 'captainCompass', chance: 0.10 },
        ],
    },
    shadowfang_keep: {
        dungeonId: 'shadowfang_keep',
        bossCount: 5,
        recommendedLevelMax: 30,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 30, rare: 50, epic: 20 },
        exclusiveDrops: [
            { templateId: 'shadowfangBlade', chance: 0.08 },
            { templateId: 'godferyPistol', chance: 0.15 },
            { templateId: 'waldenToxicVial', chance: 0.12 },
        ],
    },
    stormwind_stockade: {
        dungeonId: 'stormwind_stockade',
        bossCount: 3,
        recommendedLevelMax: 32,
        iLvlOffset: [2, 8],
        qualityWeights: { uncommon: 40, rare: 45, epic: 15 },
        exclusiveDrops: [
            { templateId: 'kamIronfist', chance: 0.20 },
            { templateId: 'rioterPauldrons', chance: 0.18 },
        ],
    },

    // ==================== Batch 2 中级副本 ====================
    gnomeregan: {
        dungeonId: 'gnomeregan',
        bossCount: 4,
        recommendedLevelMax: 38,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 35, rare: 50, epic: 15 },
        exclusiveDrops: [
            { templateId: 'thermapluggWrench', chance: 0.18 },
            { templateId: 'electrocutionerLegguards', chance: 0.15 },
            { templateId: 'radiationGoggles', chance: 0.12 },
        ],
    },
    razorfen_kraul: {
        dungeonId: 'razorfen_kraul',
        bossCount: 4,
        recommendedLevelMax: 38,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 35, rare: 50, epic: 15 },
        exclusiveDrops: [
            { templateId: 'charlgaScepter', chance: 0.18 },
            { templateId: 'thornweaverVest', chance: 0.15 },
            { templateId: 'quilboarTuskRing', chance: 0.12 },
        ],
    },
    scarlet_monastery_gy: {
        dungeonId: 'scarlet_monastery_gy',
        bossCount: 1,
        recommendedLevelMax: 38,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 40, rare: 48, epic: 12 },
        exclusiveDrops: [],
    },
    scarlet_monastery_lib: {
        dungeonId: 'scarlet_monastery_lib',
        bossCount: 2,
        recommendedLevelMax: 40,
        iLvlOffset: [3, 8],
        qualityWeights: { uncommon: 35, rare: 50, epic: 15 },
        exclusiveDrops: [
            { templateId: 'doanMantle', chance: 0.18 },
        ],
    },
    scarlet_monastery_arm: {
        dungeonId: 'scarlet_monastery_arm',
        bossCount: 1,
        recommendedLevelMax: 42,
        iLvlOffset: [3, 10],
        qualityWeights: { uncommon: 30, rare: 50, epic: 20 },
        exclusiveDrops: [
            { templateId: 'scarletHelmet', chance: 0.22 },
            { templateId: 'herodShoulder', chance: 0.18 },
        ],
    },
    scarlet_monastery_cath: {
        dungeonId: 'scarlet_monastery_cath',
        bossCount: 3,
        recommendedLevelMax: 44,
        iLvlOffset: [4, 10],
        qualityWeights: { uncommon: 25, rare: 50, epic: 25 },
        exclusiveDrops: [
            { templateId: 'mograinesMight', chance: 0.08 },
            { templateId: 'righteousRobe', chance: 0.15 },
            { templateId: 'whitemaneChaplet', chance: 0.15 },
        ],
    },
    zulfarrak: {
        dungeonId: 'zulfarrak',
        bossCount: 5,
        recommendedLevelMax: 54,
        iLvlOffset: [4, 10],
        qualityWeights: { uncommon: 25, rare: 50, epic: 25 },
        exclusiveDrops: [
            { templateId: 'sulthrazeEdge', chance: 0.06 },
            { templateId: 'gahzrillaScale', chance: 0.15 },
            { templateId: 'gahzrillaTrinket', chance: 0.12 },
            { templateId: 'sandstormCloak', chance: 0.15 },
        ],
    },
    maraudon: {
        dungeonId: 'maraudon',
        bossCount: 5,
        recommendedLevelMax: 55,
        iLvlOffset: [4, 10],
        qualityWeights: { uncommon: 25, rare: 50, epic: 25 },
        exclusiveDrops: [
            { templateId: 'princessScepter', chance: 0.15 },
            { templateId: 'stoneMothersRing', chance: 0.12 },
            { templateId: 'landslideBoots', chance: 0.15 },
            { templateId: 'noxxionToxicBlade', chance: 0.18 },
        ],
    },

    // ==================== Batch 3 高级副本 ====================
    sunken_temple: {
        dungeonId: 'sunken_temple',
        bossCount: 5,
        recommendedLevelMax: 56,
        iLvlOffset: [4, 10],
        qualityWeights: { uncommon: 20, rare: 50, epic: 30 },
        exclusiveDrops: [
            { templateId: 'hakkarShadowBlade', chance: 0.15 },
            { templateId: 'dreamscytheScales', chance: 0.15 },
            { templateId: 'atalaiTotem', chance: 0.10 },
        ],
    },
    brs_lower: {
        dungeonId: 'brs_lower',
        bossCount: 6,
        recommendedLevelMax: 60,
        iLvlOffset: [4, 10],
        qualityWeights: { uncommon: 15, rare: 55, epic: 30 },
        exclusiveDrops: [
            { templateId: 'omokksClub', chance: 0.18 },
            { templateId: 'beastfangBoots', chance: 0.15 },
        ],
    },
    brs_upper: {
        dungeonId: 'brs_upper',
        bossCount: 5,
        recommendedLevelMax: 60,
        iLvlOffset: [5, 12],
        qualityWeights: { uncommon: 10, rare: 50, epic: 40 },
        exclusiveDrops: [
            { templateId: 'rendBlackhandSword', chance: 0.08 },
            { templateId: 'drakkisathBreastplate', chance: 0.06 },
        ],
    },
    stratholme: {
        dungeonId: 'stratholme',
        bossCount: 6,
        recommendedLevelMax: 60,
        iLvlOffset: [5, 12],
        qualityWeights: { uncommon: 10, rare: 50, epic: 40 },
        exclusiveDrops: [
            { templateId: 'rivendareSword', chance: 0.06 },
            { templateId: 'anastariAmulet', chance: 0.12 },
            { templateId: 'scourgeHelm', chance: 0.15 },
        ],
    },
    scholomance: {
        dungeonId: 'scholomance',
        bossCount: 6,
        recommendedLevelMax: 60,
        iLvlOffset: [5, 12],
        qualityWeights: { uncommon: 10, rare: 50, epic: 40 },
        exclusiveDrops: [
            { templateId: 'gandlingStaff', chance: 0.06 },
            { templateId: 'kirtonosCloak', chance: 0.15 },
            { templateId: 'rattlegoreRib', chance: 0.12 },
            { templateId: 'krastinovGloves', chance: 0.15 },
        ],
    },
    dire_maul: {
        dungeonId: 'dire_maul',
        bossCount: 5,
        recommendedLevelMax: 60,
        iLvlOffset: [5, 12],
        qualityWeights: { uncommon: 10, rare: 50, epic: 40 },
        exclusiveDrops: [
            { templateId: 'immoltharEye', chance: 0.06 },
            { templateId: 'tendrisStaff', chance: 0.12 },
            { templateId: 'gordokShield', chance: 0.15 },
            { templateId: 'illyannaQuiver', chance: 0.15 },
        ],
    },
}
