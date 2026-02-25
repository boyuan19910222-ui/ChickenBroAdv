/**
 * ClassicEquipment - Batch 1 经典副本装备模板
 * 覆盖副本：怒焰裂谷(Lv13-18) / 死亡矿井(Lv18-23) / 影牙城堡(Lv22-30) / 暴风城监狱(Lv24-32)
 *
 * 设计原则：
 *   1. itemLevel 对齐副本 recommendedLevelMax ± iLvlOffset
 *   2. 品质以 uncommon / rare 为主，少量 epic
 *   3. 覆盖多种槽位和甲种，保证各职业都有收获
 *   4. 需要在 EquipmentData.js 中 Object.assign 合并到 EquipmentDatabase
 */

// ---- 本地常量副本（避免与 EquipmentData.js 循环依赖） ----

const ItemQuality = {
    POOR:      'poor',
    COMMON:    'common',
    UNCOMMON:  'uncommon',
    RARE:      'rare',
    EPIC:      'epic',
    LEGENDARY: 'legendary',
}

const QualityConfig = {
    [ItemQuality.POOR]:      { name: '粗糙', color: '#9d9d9d', emoji: '⬛', statScale: 0.8 },
    [ItemQuality.COMMON]:    { name: '普通', color: '#ffffff', emoji: '⬜', statScale: 1.0 },
    [ItemQuality.UNCOMMON]:  { name: '优秀', color: '#1eff00', emoji: '🟩', statScale: 1.15 },
    [ItemQuality.RARE]:      { name: '稀有', color: '#0070dd', emoji: '🟦', statScale: 1.35 },
    [ItemQuality.EPIC]:      { name: '史诗', color: '#a335ee', emoji: '🟪', statScale: 1.6 },
    [ItemQuality.LEGENDARY]: { name: '传说', color: '#ff8000', emoji: '🟧', statScale: 2.0 },
}

const ArmorCoefficients = {
    cloth:   1.0,
    leather: 2.0,
    mail:    3.5,
    plate:   8.0,
    shield:  12.0,
}

// ---- 工具函数（与 EquipmentData.js 保持一致） ----

function calcArmorValue(armorType, itemLevel, quality) {
    const coeff = ArmorCoefficients[armorType] || 1.0
    const qualityMult = QualityConfig[quality]?.statScale || 1.0
    return Math.floor(coeff * itemLevel * qualityMult)
}

function calcWeaponDamage(itemLevel, quality, weaponHand) {
    const qualityMult = QualityConfig[quality]?.statScale || 1.0
    const weaponWeight = weaponHand === 'two_hand' ? 1.0 : 0.65
    const baseDPS = itemLevel * qualityMult * weaponWeight
    return { min: Math.floor(baseDPS * 0.75), max: Math.floor(baseDPS * 1.25) }
}

// ==================== 怒焰裂谷 (Lv 13-18, iLvl 16-23) ====================

const ragefireEquipment = {
    // 巴扎兰的法杖 - 最终BOSS掉落
    bazalanScepter: {
        id: 'bazalanScepter', name: '巴扎兰的权杖', emoji: '🔮',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 21, requiredLevel: 13,
        weaponType: 'staff', weaponHand: 'two_hand',
        damage: calcWeaponDamage(21, ItemQuality.RARE, 'two_hand'),
        stats: { intellect: 7, stamina: 4, spirit: 3 },
        durability: { current: 60, max: 60 },
        description: '巴扎兰曾用这根权杖统帅怒焰裂谷的恶魔军团',
        sellPrice: 85,
    },
    // 塔拉加曼的焦灼护腕
    taragamanBracers: {
        id: 'taragamanBracers', name: '焦灼护腕', emoji: '⌚',
        type: 'equipment', slot: 'wrists', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 18, requiredLevel: 13,
        armorType: 'mail', armorValue: calcArmorValue('mail', 18, ItemQuality.UNCOMMON),
        stats: { stamina: 3, strength: 2 },
        durability: { current: 35, max: 35 },
        description: '被地狱火灼烧过的锁甲护腕，仍散发余温',
        sellPrice: 35,
    },
    // 奥格芬格的撕裂者
    oggleflintCleaver: {
        id: 'oggleflintCleaver', name: '奥格芬格的撕裂者', emoji: '🪓',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.UNCOMMON, itemLevel: 17, requiredLevel: 13,
        weaponType: 'axe', weaponHand: 'one_hand',
        damage: calcWeaponDamage(17, ItemQuality.UNCOMMON, 'one_hand'),
        stats: { strength: 4, stamina: 2 },
        durability: { current: 45, max: 45 },
        description: '嗜血的战斗武器，刃口仍残留暗红色',
        sellPrice: 40,
    },
    // 熔岩护腿
    moltenLeggings: {
        id: 'moltenLeggings', name: '熔岩护腿', emoji: '👖',
        type: 'equipment', slot: 'legs', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 19, requiredLevel: 13,
        armorType: 'leather', armorValue: calcArmorValue('leather', 19, ItemQuality.UNCOMMON),
        stats: { agility: 4, stamina: 3 },
        durability: { current: 45, max: 45 },
        description: '在怒焰裂谷的岩浆边锻造的皮甲',
        sellPrice: 42,
    },
    // 杰格罗什的暗影披风
    jergoshCloak: {
        id: 'jergoshCloak', name: '暗影织布披风', emoji: '🧣',
        type: 'equipment', slot: 'back', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 18, requiredLevel: 13,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 18, ItemQuality.UNCOMMON),
        stats: { intellect: 3, spirit: 2, stamina: 1 },
        durability: { current: 30, max: 30 },
        description: '杰格罗什的暗影魔法残留在织物中',
        sellPrice: 30,
    },
}

// ==================== 死亡矿井 (Lv 18-23, iLvl 21-31) ====================

const deadminesEquipment = {
    // 范克里夫的战斗短刃
    vancleefBlade: {
        id: 'vancleefBlade', name: '范克里夫的战斗短刃', emoji: '🗡️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 26, requiredLevel: 18,
        weaponType: 'dagger', weaponHand: 'one_hand',
        damage: calcWeaponDamage(26, ItemQuality.RARE, 'one_hand'),
        stats: { agility: 6, strength: 3, stamina: 3 },
        durability: { current: 55, max: 55 },
        description: '迪菲亚兄弟会首领的贴身武器',
        sellPrice: 120,
    },
    // 斯莫特的强力锤
    smiteMightyHammer: {
        id: 'smiteMightyHammer', name: '斯莫特的强力锤', emoji: '🔨',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 25, requiredLevel: 18,
        weaponType: 'mace', weaponHand: 'two_hand',
        damage: calcWeaponDamage(25, ItemQuality.RARE, 'two_hand'),
        stats: { strength: 8, stamina: 4 },
        durability: { current: 65, max: 65 },
        description: '斯莫特在三种武器中最钟爱的巨锤',
        sellPrice: 115,
    },
    // 迪菲亚胸甲
    defiasBreastplate: {
        id: 'defiasBreastplate', name: '迪菲亚板甲', emoji: '🎽',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 24, requiredLevel: 18,
        armorType: 'mail', armorValue: calcArmorValue('mail', 24, ItemQuality.RARE),
        stats: { stamina: 6, strength: 4, agility: 2 },
        durability: { current: 70, max: 70 },
        description: '迪菲亚精英卫兵的制式胸甲',
        sellPrice: 100,
    },
    // 采矿傀儡的机械护手
    rhahkzorGauntlets: {
        id: 'rhahkzorGauntlets', name: '机械护手', emoji: '🧤',
        type: 'equipment', slot: 'hands', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 22, requiredLevel: 18,
        armorType: 'plate', armorValue: calcArmorValue('plate', 22, ItemQuality.UNCOMMON),
        stats: { strength: 4, stamina: 3 },
        durability: { current: 45, max: 45 },
        description: '从采矿傀儡残骸上拆下的金属护手',
        sellPrice: 55,
    },
    // 矿工头盔
    minerHelmet: {
        id: 'minerHelmet', name: '矿工安全头盔', emoji: '👑',
        type: 'equipment', slot: 'head', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 21, requiredLevel: 18,
        armorType: 'leather', armorValue: calcArmorValue('leather', 21, ItemQuality.UNCOMMON),
        stats: { stamina: 4, agility: 2, spirit: 1 },
        durability: { current: 40, max: 40 },
        description: '死亡矿井中工人遗留的皮质安全帽',
        sellPrice: 45,
    },
    // 船长的罗盘（饰品）
    captainCompass: {
        id: 'captainCompass', name: '船长的罗盘', emoji: '🔮',
        type: 'equipment', slot: 'trinket1', category: 'accessory',
        quality: ItemQuality.RARE, itemLevel: 25, requiredLevel: 18,
        unique: true,
        stats: { agility: 4, stamina: 3, spirit: 2 },
        description: '范克里夫私掠船上的精密航海仪器',
        sellPrice: 90,
    },
}

// ==================== 影牙城堡 (Lv 22-30, iLvl 25-38) ====================

const shadowfangEquipment = {
    // 戈弗雷勋爵的皇家短枪
    godferyPistol: {
        id: 'godferyPistol', name: '戈弗雷的皇家短枪', emoji: '🔫',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 33, requiredLevel: 22,
        weaponType: 'gun', weaponHand: 'two_hand',
        damage: calcWeaponDamage(33, ItemQuality.RARE, 'two_hand'),
        stats: { agility: 8, stamina: 5, strength: 2 },
        durability: { current: 55, max: 55 },
        description: '吉尔尼斯贵族的精工手枪，镶嵌银质徽记',
        sellPrice: 160,
    },
    // 影牙之剑 - 经典稀有掉落
    shadowfangBlade: {
        id: 'shadowfangBlade', name: '影牙', emoji: '⚔️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.EPIC, itemLevel: 35, requiredLevel: 22,
        weaponType: 'sword', weaponHand: 'one_hand',
        damage: calcWeaponDamage(35, ItemQuality.EPIC, 'one_hand'),
        unique: true,
        stats: { strength: 8, agility: 5, stamina: 6 },
        durability: { current: 75, max: 75 },
        description: '传说中被暗夜精灵诅咒的古剑，散发幽暗寒光',
        sellPrice: 350,
    },
    // 沃尔登的瓶中毒雾（饰品）
    waldenToxicVial: {
        id: 'waldenToxicVial', name: '沃尔登的剧毒药瓶', emoji: '🔮',
        type: 'equipment', slot: 'trinket1', category: 'accessory',
        quality: ItemQuality.RARE, itemLevel: 30, requiredLevel: 22,
        unique: true,
        stats: { intellect: 5, spirit: 4, stamina: 2 },
        description: '炼金术师沃尔登的研究成果，瓶中液体不断变色',
        sellPrice: 110,
    },
    // 狼人之牙项链
    worgenFangNecklace: {
        id: 'worgenFangNecklace', name: '狼人之牙项链', emoji: '📿',
        type: 'equipment', slot: 'neck', category: 'accessory',
        quality: ItemQuality.UNCOMMON, itemLevel: 28, requiredLevel: 22,
        stats: { strength: 4, stamina: 3, agility: 2 },
        description: '用影牙城堡狼人的尖牙串成的野蛮项链',
        sellPrice: 55,
    },
    // 暗影行者护腿
    shadowwalkerLeggings: {
        id: 'shadowwalkerLeggings', name: '暗影行者护腿', emoji: '👖',
        type: 'equipment', slot: 'legs', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 31, requiredLevel: 22,
        armorType: 'leather', armorValue: calcArmorValue('leather', 31, ItemQuality.RARE),
        stats: { agility: 7, stamina: 5, strength: 2 },
        durability: { current: 60, max: 60 },
        description: '影牙城堡暗影猎手的制式皮甲',
        sellPrice: 130,
    },
    // 月夜布甲长袍
    moonlitRobe: {
        id: 'moonlitRobe', name: '月夜长袍', emoji: '👘',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 30, requiredLevel: 22,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 30, ItemQuality.RARE),
        stats: { intellect: 8, spirit: 5, stamina: 3 },
        durability: { current: 55, max: 55 },
        description: '城堡中不死法师遗留的法袍，月光下泛起微光',
        sellPrice: 125,
    },
}

// ==================== 暴风城监狱 (Lv 24-32, iLvl 27-40) ====================

const stockadeEquipment = {
    // 卡姆的铁拳护手
    kamIronfist: {
        id: 'kamIronfist', name: '卡姆的铁拳', emoji: '🧤',
        type: 'equipment', slot: 'hands', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 34, requiredLevel: 24,
        armorType: 'plate', armorValue: calcArmorValue('plate', 34, ItemQuality.RARE),
        stats: { strength: 7, stamina: 5 },
        durability: { current: 55, max: 55 },
        description: '监狱暴动首领卡姆的标志性铁拳护手',
        sellPrice: 140,
    },
    // 德克斯特的腰带
    dextrenBelt: {
        id: 'dextrenBelt', name: '德克斯特的恐惧腰带', emoji: '🪢',
        type: 'equipment', slot: 'waist', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 30, requiredLevel: 24,
        armorType: 'mail', armorValue: calcArmorValue('mail', 30, ItemQuality.UNCOMMON),
        stats: { stamina: 5, strength: 3 },
        durability: { current: 40, max: 40 },
        description: '德克斯特用来束缚囚犯的铁制腰带',
        sellPrice: 60,
    },
    // 囚犯之怒（武器）
    prisonShiv: {
        id: 'prisonShiv', name: '囚犯之怒', emoji: '🗡️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.UNCOMMON, itemLevel: 29, requiredLevel: 24,
        weaponType: 'dagger', weaponHand: 'one_hand',
        damage: calcWeaponDamage(29, ItemQuality.UNCOMMON, 'one_hand'),
        stats: { agility: 5, strength: 2 },
        durability: { current: 40, max: 40 },
        description: '监狱中磨制的简陋匕首，却异常锋利',
        sellPrice: 55,
    },
    // 暴动者的锁甲肩甲
    rioterPauldrons: {
        id: 'rioterPauldrons', name: '暴动者肩甲', emoji: '🦺',
        type: 'equipment', slot: 'shoulders', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 32, requiredLevel: 24,
        armorType: 'mail', armorValue: calcArmorValue('mail', 32, ItemQuality.RARE),
        stats: { stamina: 6, strength: 4, agility: 2 },
        durability: { current: 55, max: 55 },
        description: '暴风城监狱暴动囚犯从看守那里夺来的肩甲',
        sellPrice: 120,
    },
}

// ==================== 导出合并 ====================

export const ClassicEquipmentBatch1 = {
    ...ragefireEquipment,
    ...deadminesEquipment,
    ...shadowfangEquipment,
    ...stockadeEquipment,
}

// ==================== Batch 2 中级副本装备 ====================
// 覆盖副本：诺莫瑞根(29-38)/剃刀沼泽(29-38)/血色修道院(28-44)/祖尔法拉克(44-54)/玛拉顿(46-55)

// -- 诺莫瑞根 --
const gnomereganEquipment = {
    thermapluggWrench: {
        id: 'thermapluggWrench', name: '瑟玛普拉格的扳手', emoji: '🔧',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 38, requiredLevel: 29,
        weaponType: 'mace', weaponHand: 'one_hand',
        damage: calcWeaponDamage(38, ItemQuality.RARE, 'one_hand'),
        stats: { intellect: 8, stamina: 5, spirit: 3 },
        durability: { current: 60, max: 60 },
        description: '疯狂工程师的特制扳手，蕴含不稳定的能量',
        sellPrice: 160,
    },
    electrocutionerLegguards: {
        id: 'electrocutionerLegguards', name: '电刑器护腿', emoji: '👖',
        type: 'equipment', slot: 'legs', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 36, requiredLevel: 29,
        armorType: 'mail', armorValue: calcArmorValue('mail', 36, ItemQuality.RARE),
        stats: { stamina: 8, agility: 5, strength: 3 },
        durability: { current: 60, max: 60 },
        description: '从电刑器6000残骸中回收的护腿，偶尔会产生静电',
        sellPrice: 140,
    },
    radiationGoggles: {
        id: 'radiationGoggles', name: '辐射防护镜', emoji: '👑',
        type: 'equipment', slot: 'head', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 34, requiredLevel: 29,
        armorType: 'leather', armorValue: calcArmorValue('leather', 34, ItemQuality.UNCOMMON),
        stats: { stamina: 5, spirit: 4, intellect: 3 },
        durability: { current: 45, max: 45 },
        description: '侏儒工程师设计的护目镜，能防辐射但不防愚蠢',
        sellPrice: 80,
    },
}

// -- 剃刀沼泽 --
const razorfenEquipment = {
    charlgaScepter: {
        id: 'charlgaScepter', name: '卡莉瑟的风暴权杖', emoji: '🔮',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 38, requiredLevel: 29,
        weaponType: 'staff', weaponHand: 'two_hand',
        damage: calcWeaponDamage(38, ItemQuality.RARE, 'two_hand'),
        stats: { intellect: 10, spirit: 6, stamina: 4 },
        durability: { current: 65, max: 65 },
        description: '唤风者卡莉瑟用以操控自然之力的权杖',
        sellPrice: 170,
    },
    thornweaverVest: {
        id: 'thornweaverVest', name: '荆棘编织者外衣', emoji: '🎽',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 35, requiredLevel: 29,
        armorType: 'leather', armorValue: calcArmorValue('leather', 35, ItemQuality.UNCOMMON),
        stats: { agility: 6, stamina: 5, strength: 3 },
        durability: { current: 55, max: 55 },
        description: '用剃刀沼泽的荆棘编织而成的皮甲',
        sellPrice: 100,
    },
    quilboarTuskRing: {
        id: 'quilboarTuskRing', name: '野猪人獠牙戒指', emoji: '💍',
        type: 'equipment', slot: 'finger1', category: 'accessory',
        quality: ItemQuality.UNCOMMON, itemLevel: 34, requiredLevel: 29,
        stats: { strength: 4, stamina: 3, agility: 2 },
        description: '用野猪人的巨大獠牙磨制的戒指',
        sellPrice: 60,
    },
}

// -- 血色修道院 --
const scarletEquipment = {
    scarletHelmet: {
        id: 'scarletHelmet', name: '血色十字军头盔', emoji: '👑',
        type: 'equipment', slot: 'head', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 42, requiredLevel: 33,
        armorType: 'plate', armorValue: calcArmorValue('plate', 42, ItemQuality.RARE),
        stats: { strength: 9, stamina: 7, agility: 3 },
        durability: { current: 65, max: 65 },
        description: '血色十字军标志性的赤红头盔，是荣耀与狂热的象征',
        sellPrice: 200,
    },
    mograinesMight: {
        id: 'mograinesMight', name: '莫格莱尼之力', emoji: '⚔️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.EPIC, itemLevel: 46, requiredLevel: 38,
        weaponType: 'mace', weaponHand: 'two_hand',
        damage: calcWeaponDamage(46, ItemQuality.EPIC, 'two_hand'),
        unique: true,
        stats: { strength: 14, stamina: 8, agility: 4 },
        durability: { current: 80, max: 80 },
        description: '指挥官莫格莱尼的圣光战锤，蕴含着圣光与黑暗的双重力量',
        sellPrice: 450,
    },
    righteousRobe: {
        id: 'righteousRobe', name: '正义圣袍', emoji: '👘',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 44, requiredLevel: 38,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 44, ItemQuality.RARE),
        stats: { intellect: 12, spirit: 8, stamina: 5 },
        durability: { current: 60, max: 60 },
        description: '怀特迈恩穿过的圣袍，散发着温暖的圣光',
        sellPrice: 220,
    },
    herodShoulder: {
        id: 'herodShoulder', name: '赫洛德的肩甲', emoji: '🦺',
        type: 'equipment', slot: 'shoulders', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 42, requiredLevel: 36,
        armorType: 'plate', armorValue: calcArmorValue('plate', 42, ItemQuality.RARE),
        stats: { strength: 8, stamina: 6, agility: 2 },
        durability: { current: 60, max: 60 },
        description: '旋风战士赫洛德的标志性肩甲，留有无数剑痕',
        sellPrice: 180,
    },
    doanMantle: {
        id: 'doanMantle', name: '杜安的奥术披肩', emoji: '🧣',
        type: 'equipment', slot: 'back', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 40, requiredLevel: 33,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 40, ItemQuality.RARE),
        stats: { intellect: 8, spirit: 5, stamina: 3 },
        durability: { current: 45, max: 45 },
        description: '大法师杜安的披肩，泛着奥术紫光',
        sellPrice: 150,
    },
    whitemaneChaplet: {
        id: 'whitemaneChaplet', name: '怀特迈恩的圣冠', emoji: '👑',
        type: 'equipment', slot: 'head', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 44, requiredLevel: 38,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 44, ItemQuality.RARE),
        stats: { intellect: 10, spirit: 8, stamina: 4 },
        durability: { current: 50, max: 50 },
        description: '大检察官怀特迈恩的标志性头饰',
        sellPrice: 200,
    },
}

// -- 祖尔法拉克 --
const zulfarrakEquipment = {
    sulthrazeEdge: {
        id: 'sulthrazeEdge', name: '苏尔之击', emoji: '⚔️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.EPIC, itemLevel: 54, requiredLevel: 44,
        weaponType: 'sword', weaponHand: 'two_hand',
        damage: calcWeaponDamage(54, ItemQuality.EPIC, 'two_hand'),
        unique: true,
        stats: { strength: 16, agility: 8, stamina: 10 },
        durability: { current: 85, max: 85 },
        description: '远古巨魔帝国的传世之剑，斩击时发出雷鸣般的轰响',
        sellPrice: 550,
    },
    sandstormCloak: {
        id: 'sandstormCloak', name: '沙地风暴斗篷', emoji: '🧣',
        type: 'equipment', slot: 'back', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 52, requiredLevel: 44,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 52, ItemQuality.RARE),
        stats: { agility: 8, stamina: 6, strength: 4 },
        durability: { current: 50, max: 50 },
        description: '在沙漠风暴中淬炼的斗篷，能抵御飞沙走石',
        sellPrice: 200,
    },
    gahzrillaScale: {
        id: 'gahzrillaScale', name: '加兹瑞拉的鳞甲', emoji: '🎽',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 54, requiredLevel: 44,
        armorType: 'mail', armorValue: calcArmorValue('mail', 54, ItemQuality.RARE),
        stats: { stamina: 12, agility: 8, strength: 5 },
        durability: { current: 70, max: 70 },
        description: '用加兹瑞拉的冰蓝色鳞片打造的锁甲',
        sellPrice: 280,
    },
    gahzrillaTrinket: {
        id: 'gahzrillaTrinket', name: '加兹瑞拉的冰心', emoji: '🔮',
        type: 'equipment', slot: 'trinket1', category: 'accessory',
        quality: ItemQuality.RARE, itemLevel: 54, requiredLevel: 44,
        unique: true,
        stats: { intellect: 8, spirit: 6, stamina: 5 },
        description: '从加兹瑞拉体内取出的冰蓝色宝石，触感冰冷',
        sellPrice: 220,
    },
}

// -- 玛拉顿 --
const maraudonEquipment = {
    princessScepter: {
        id: 'princessScepter', name: '瑟莱德斯之杖', emoji: '🔮',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 55, requiredLevel: 46,
        weaponType: 'staff', weaponHand: 'two_hand',
        damage: calcWeaponDamage(55, ItemQuality.RARE, 'two_hand'),
        stats: { intellect: 14, spirit: 8, stamina: 6 },
        durability: { current: 70, max: 70 },
        description: '瑟莱德斯公主的大地之杖，蕴含元素之力',
        sellPrice: 300,
    },
    stoneMothersRing: {
        id: 'stoneMothersRing', name: '石母之戒', emoji: '💍',
        type: 'equipment', slot: 'finger1', category: 'accessory',
        quality: ItemQuality.RARE, itemLevel: 55, requiredLevel: 46,
        unique: true,
        stats: { stamina: 8, strength: 6, agility: 4 },
        description: '蕴含着大地之力的古老戒指，据说与远古元素有着神秘的联系',
        sellPrice: 220,
    },
    landslideBoots: {
        id: 'landslideBoots', name: '兰斯利德之靴', emoji: '👢',
        type: 'equipment', slot: 'feet', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 54, requiredLevel: 46,
        armorType: 'plate', armorValue: calcArmorValue('plate', 54, ItemQuality.RARE),
        stats: { stamina: 10, strength: 7, agility: 3 },
        durability: { current: 60, max: 60 },
        description: '用兰斯利德的岩石碎片打造的沉重战靴',
        sellPrice: 250,
    },
    noxxionToxicBlade: {
        id: 'noxxionToxicBlade', name: '诺克赛恩的毒刃', emoji: '🗡️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.UNCOMMON, itemLevel: 50, requiredLevel: 46,
        weaponType: 'dagger', weaponHand: 'one_hand',
        damage: calcWeaponDamage(50, ItemQuality.UNCOMMON, 'one_hand'),
        stats: { agility: 8, stamina: 5 },
        durability: { current: 50, max: 50 },
        description: '沾染诺克赛恩毒液的匕首，绿色毒雾缭绕',
        sellPrice: 180,
    },
    celebrasWaistguard: {
        id: 'celebrasWaistguard', name: '塞雷布拉斯之腰', emoji: '🪢',
        type: 'equipment', slot: 'waist', category: 'armor',
        quality: ItemQuality.UNCOMMON, itemLevel: 52, requiredLevel: 46,
        armorType: 'leather', armorValue: calcArmorValue('leather', 52, ItemQuality.UNCOMMON),
        stats: { agility: 7, stamina: 5, spirit: 3 },
        durability: { current: 45, max: 45 },
        description: '堕落德鲁伊塞雷布拉斯遗留的腰带',
        sellPrice: 120,
    },
}

export const ClassicEquipmentBatch2 = {
    ...gnomereganEquipment,
    ...razorfenEquipment,
    ...scarletEquipment,
    ...zulfarrakEquipment,
    ...maraudonEquipment,
}

// ==================== Batch 3 高级副本装备 ====================
// 覆盖副本：阿塔哈卡(50-56)/黑石塔(55-60)/斯坦索姆(58-60)/通灵学院(58-60)/厄运之槌(56-60)

// -- 阿塔哈卡神庙 --
const sunkenTempleEquipment = {
    hakkarShadowBlade: {
        id: 'hakkarShadowBlade', name: '哈卡之影刃', emoji: '🗡️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 56, requiredLevel: 50,
        weaponType: 'dagger', weaponHand: 'one_hand',
        damage: calcWeaponDamage(56, ItemQuality.RARE, 'one_hand'),
        stats: { agility: 12, stamina: 8, strength: 4 },
        durability: { current: 65, max: 65 },
        description: '哈卡之影凝聚的暗影之刃，隐约传来蛇类嘶嘶声',
        sellPrice: 320,
    },
    dreamscytheScales: {
        id: 'dreamscytheScales', name: '梦游者鳞甲', emoji: '🎽',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 56, requiredLevel: 50,
        armorType: 'mail', armorValue: calcArmorValue('mail', 56, ItemQuality.RARE),
        stats: { stamina: 14, agility: 10, intellect: 4 },
        durability: { current: 75, max: 75 },
        description: '用梦游者的翠绿鳞片打造的锁甲，散发梦境气息',
        sellPrice: 300,
    },
    atalaiTotem: {
        id: 'atalaiTotem', name: '阿塔莱图腾', emoji: '🔮',
        type: 'equipment', slot: 'trinket1', category: 'accessory',
        quality: ItemQuality.RARE, itemLevel: 56, requiredLevel: 50,
        unique: true,
        stats: { intellect: 10, spirit: 8, stamina: 5 },
        description: '蕴含远古巨魔神灵力量的图腾',
        sellPrice: 280,
    },
}

// -- 黑石塔 --
const blackrockEquipment = {
    rendBlackhandSword: {
        id: 'rendBlackhandSword', name: '雷德的黑手之刃', emoji: '⚔️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.EPIC, itemLevel: 62, requiredLevel: 58,
        weaponType: 'sword', weaponHand: 'one_hand',
        damage: calcWeaponDamage(62, ItemQuality.EPIC, 'one_hand'),
        unique: true,
        stats: { strength: 16, agility: 10, stamina: 12 },
        durability: { current: 80, max: 80 },
        description: '黑石兽人酋长的佩剑，沾染无数鲜血',
        sellPrice: 650,
    },
    drakkisathBreastplate: {
        id: 'drakkisathBreastplate', name: '达基萨斯的龙鳞胸甲', emoji: '🎽',
        type: 'equipment', slot: 'chest', category: 'armor',
        quality: ItemQuality.EPIC, itemLevel: 63, requiredLevel: 58,
        armorType: 'plate', armorValue: calcArmorValue('plate', 63, ItemQuality.EPIC),
        stats: { stamina: 28, strength: 14, agility: 6 },
        durability: { current: 85, max: 85 },
        description: '达基萨斯将军的龙鳞板甲，坚不可摧',
        sellPrice: 700,
    },
    beastfangBoots: {
        id: 'beastfangBoots', name: '巨兽之牙战靴', emoji: '👢',
        type: 'equipment', slot: 'feet', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 60, requiredLevel: 55,
        armorType: 'plate', armorValue: calcArmorValue('plate', 60, ItemQuality.RARE),
        stats: { stamina: 18, strength: 10, agility: 4 },
        durability: { current: 65, max: 65 },
        description: '从比斯巨兽的牙齿锻造而成的战靴',
        sellPrice: 350,
    },
    omokksClub: {
        id: 'omokksClub', name: '欧莫克的棍棒', emoji: '🏏',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 60, requiredLevel: 55,
        weaponType: 'mace', weaponHand: 'two_hand',
        damage: calcWeaponDamage(60, ItemQuality.RARE, 'two_hand'),
        stats: { strength: 16, stamina: 10 },
        durability: { current: 75, max: 75 },
        description: '食人魔首领的巨大棍棒，沉重无比',
        sellPrice: 380,
    },
}

// -- 斯坦索姆 --
const stratholmeEquipment = {
    rivendareSword: {
        id: 'rivendareSword', name: '瑞文戴尔的符文之剑', emoji: '⚔️',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.EPIC, itemLevel: 63, requiredLevel: 58,
        weaponType: 'sword', weaponHand: 'two_hand',
        damage: calcWeaponDamage(63, ItemQuality.EPIC, 'two_hand'),
        unique: true,
        stats: { strength: 20, stamina: 14, agility: 8 },
        durability: { current: 85, max: 85 },
        description: '死亡骑士的符文巨剑，散发死亡气息',
        sellPrice: 750,
    },
    anastariAmulet: {
        id: 'anastariAmulet', name: '安娜丝塔丽的亡灵项链', emoji: '📿',
        type: 'equipment', slot: 'neck', category: 'accessory',
        quality: ItemQuality.RARE, itemLevel: 62, requiredLevel: 58,
        unique: true,
        stats: { intellect: 12, spirit: 10, stamina: 6 },
        description: '男爵夫人生前珍爱的项链，蕴含幽冥之力',
        sellPrice: 380,
    },
    scourgeHelm: {
        id: 'scourgeHelm', name: '天灾头盔', emoji: '👑',
        type: 'equipment', slot: 'head', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 62, requiredLevel: 58,
        armorType: 'plate', armorValue: calcArmorValue('plate', 62, ItemQuality.RARE),
        stats: { stamina: 22, strength: 10, agility: 4 },
        durability: { current: 70, max: 70 },
        description: '天灾军团精英的标志性头盔',
        sellPrice: 360,
    },
}

// -- 通灵学院 --
const scholomanceEquipment = {
    gandlingStaff: {
        id: 'gandlingStaff', name: '加丁的暗影法杖', emoji: '🔮',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.EPIC, itemLevel: 63, requiredLevel: 58,
        weaponType: 'staff', weaponHand: 'two_hand',
        damage: calcWeaponDamage(63, ItemQuality.EPIC, 'two_hand'),
        unique: true,
        stats: { intellect: 22, spirit: 12, stamina: 10 },
        durability: { current: 80, max: 80 },
        description: '通灵学院校长的权杖，蕴含深渊般的暗影力量',
        sellPrice: 720,
    },
    kirtonosCloak: {
        id: 'kirtonosCloak', name: '基尔图诺斯之翼', emoji: '🧣',
        type: 'equipment', slot: 'back', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 60, requiredLevel: 58,
        armorType: 'cloth', armorValue: calcArmorValue('cloth', 60, ItemQuality.RARE),
        stats: { intellect: 10, stamina: 8, spirit: 6 },
        durability: { current: 55, max: 55 },
        description: '基尔图诺斯的蝙蝠翼膜制成的披风',
        sellPrice: 300,
    },
    rattlegoreRib: {
        id: 'rattlegoreRib', name: '拉特格尔的肋骨盾', emoji: '🛡️',
        type: 'equipment', slot: 'offHand', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 62, requiredLevel: 58,
        armorType: 'plate', armorValue: calcArmorValue('plate', 62, ItemQuality.RARE),
        stats: { stamina: 25, strength: 8 },
        durability: { current: 70, max: 70 },
        description: '从拉特格尔身上拆下的巨型肋骨制成的盾牌',
        sellPrice: 340,
    },
    krastinovGloves: {
        id: 'krastinovGloves', name: '屠夫的血手套', emoji: '🧤',
        type: 'equipment', slot: 'hands', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 60, requiredLevel: 58,
        armorType: 'leather', armorValue: calcArmorValue('leather', 60, ItemQuality.RARE),
        stats: { agility: 10, stamina: 8, strength: 6 },
        durability: { current: 60, max: 60 },
        description: '克拉斯提诺夫做"手术"时佩戴的手套，血迹斑斑',
        sellPrice: 280,
    },
}

// -- 厄运之槌 --
const direMaulEquipment = {
    immoltharEye: {
        id: 'immoltharEye', name: '伊莫塔尔之眼', emoji: '🔮',
        type: 'equipment', slot: 'trinket1', category: 'accessory',
        quality: ItemQuality.EPIC, itemLevel: 63, requiredLevel: 56,
        unique: true,
        stats: { intellect: 14, spirit: 10, stamina: 12 },
        description: '恶魔领主的魔眼，蕴含毁灭性的魔力',
        sellPrice: 600,
    },
    tendrisStaff: {
        id: 'tendrisStaff', name: '托塞德林的奥术长杖', emoji: '🔮',
        type: 'equipment', slot: 'mainHand', category: 'weapon',
        quality: ItemQuality.RARE, itemLevel: 62, requiredLevel: 56,
        weaponType: 'staff', weaponHand: 'two_hand',
        damage: calcWeaponDamage(62, ItemQuality.RARE, 'two_hand'),
        stats: { intellect: 16, spirit: 10, stamina: 8 },
        durability: { current: 70, max: 70 },
        description: '堕落王子用以汲取魔力的奥术长杖',
        sellPrice: 400,
    },
    gordokShield: {
        id: 'gordokShield', name: '戈多克之盾', emoji: '🛡️',
        type: 'equipment', slot: 'offHand', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 60, requiredLevel: 56,
        armorType: 'plate', armorValue: calcArmorValue('plate', 60, ItemQuality.RARE),
        stats: { stamina: 12, strength: 8, agility: 4 },
        durability: { current: 70, max: 70 },
        description: '食人魔大王使用的巨大盾牌，比普通人还高',
        sellPrice: 340,
    },
    illyannaQuiver: {
        id: 'illyannaQuiver', name: '伊利亚纳的月光箭袋', emoji: '🏹',
        type: 'equipment', slot: 'back', category: 'armor',
        quality: ItemQuality.RARE, itemLevel: 60, requiredLevel: 56,
        armorType: 'leather', armorValue: calcArmorValue('leather', 60, ItemQuality.RARE),
        stats: { agility: 12, stamina: 8, strength: 4 },
        durability: { current: 55, max: 55 },
        description: '堕落猎手的精灵箭袋，月光在其上流转',
        sellPrice: 300,
    },
}

export const ClassicEquipmentBatch3 = {
    ...sunkenTempleEquipment,
    ...blackrockEquipment,
    ...stratholmeEquipment,
    ...scholomanceEquipment,
    ...direMaulEquipment,
}
