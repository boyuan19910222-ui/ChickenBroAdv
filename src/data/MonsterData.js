/**
 * 怪物属性公式 (开发辅助参考，实际数据已预计算)
 * baseHp(lv)   = floor(80 + lv*50 + lv²*0.3)
 * baseStr(lv)  = floor(8 + lv*2.2)
 * baseAgi(lv)  = floor(4 + lv*1.2)
 * baseInt(lv)  = floor(3 + lv*0.8)
 * baseSta(lv)  = floor(6 + lv*1.8)
 * baseExp(lv)  = floor(10 + lv*6)
 * baseGoldMin(lv) = floor(3 + lv*1.5)
 * baseGoldMax(lv) = floor(8 + lv*4)
 *
 * melee系数: { hp:1.0, str:1.0, agi:0.6, int:0.3, sta:1.0 }
 * caster系数: { hp:0.7, str:0.4, agi:0.5, int:1.3, sta:0.7 }
 */

// 属性公式函数（开发辅助用）
function genStats(lv, type) {
    const baseHp = Math.floor(80 + lv * 50 + lv * lv * 0.3);
    const baseStr = Math.floor(8 + lv * 2.2);
    const baseAgi = Math.floor(4 + lv * 1.2);
    const baseInt = Math.floor(3 + lv * 0.8);
    const baseSta = Math.floor(6 + lv * 1.8);
    const m = type === 'melee'
        ? { hp: 1.0, str: 1.0, agi: 0.6, int: 0.3, sta: 1.0 }
        : { hp: 0.7, str: 0.4, agi: 0.5, int: 1.3, sta: 0.7 };
    return {
        health: Math.floor(baseHp * m.hp),
        strength: Math.floor(baseStr * m.str),
        agility: Math.floor(baseAgi * m.agi),
        intellect: Math.floor(baseInt * m.int),
        stamina: Math.floor(baseSta * m.sta),
    };
}

function genLoot(lv) {
    return {
        gold: { min: Math.floor(3 + lv * 1.5), max: Math.floor(8 + lv * 4) },
        exp: Math.floor(10 + lv * 6),
    };
}

function M(id, name, emoji, lv, type, skills, items = []) {
    const s = genStats(lv, type);
    const l = genLoot(lv);
    return { id, name, emoji, level: lv, monsterType: type, stats: s, skills, loot: { ...l, items } };
}

export const monsters = {
    // ===== 🌲 艾尔文森林 (Lv 1-10) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('forestWolf', '森林野狼', '🐺', 1, 'melee', ['basicAttack', 'wolfBite']),
        M('koboldMiner', '狗头人矿工', '⛏️', 2, 'melee', ['basicAttack'], ['healthPotion']),
        M('defiantBrother', '叛逆兄弟会匪徒', '🗡️', 3, 'melee', ['basicAttack', 'goblinStab']),
        M('forestSpider', '森林蜘蛛', '🕷️', 5, 'melee', ['basicAttack']),
        M('murloc', '鱼人', '🐸', 7, 'melee', ['basicAttack', 'wolfBite']),
        M('koboldGeomancer', '狗头人地卜师', '🔮', 4, 'caster', ['basicAttack', 'monsterFireball'], ['manaPotion']),
        M('murlocOracle', '鱼人神谕者', '🌊', 8, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterHeal'], ['manaPotion']),
        M('youngThiefMage', '叛逆兄弟会法师', '🧙', 6, 'caster', ['basicAttack', 'monsterFireball']),
        M('forestOrcShaman', '森林兽人萨满', '🪬', 9, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterHeal'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== ❄️ 丹莫罗 (Lv 6-15) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('snowLeopard', '雪豹', '🐆', 6, 'melee', ['basicAttack', 'wolfBite']),
        M('frostmaneTracker', '霜鬃巨魔追踪者', '🧌', 8, 'melee', ['basicAttack', 'trollSmash'], ['healthPotion']),
        M('wendigo', '雪怪', '🦍', 10, 'melee', ['basicAttack', 'orcRage']),
        M('iceCragBoar', '冰脊野猪', '🐗', 7, 'melee', ['basicAttack']),
        M('leperGnome', '麻风侏儒技师', '🔧', 13, 'melee', ['basicAttack', 'goblinStab'], ['healthPotion']),
        M('frostmaneShaman', '霜鬃巨魔萨满', '❄️', 9, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterHeal'], ['manaPotion']),
        M('iceElemental', '寒冰元素', '🧊', 11, 'caster', ['basicAttack', 'monsterFrostBolt']),
        M('leperGnomeMage', '麻风侏儒法师', '⚡', 14, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterFireball'], ['manaPotion']),
        M('frostSeer', '冰霜先知', '🔵', 12, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterCurseOfWeakness'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🌾 西部荒野 (Lv 10-20) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('coyote', '草原土狼', '🐕', 10, 'melee', ['basicAttack', 'wolfBite']),
        M('defiasBandit', '迪菲亚盗贼', '🗡️', 12, 'melee', ['basicAttack', 'goblinStab'], ['healthPotion']),
        M('harvestGolem', '收割傀儡', '🤖', 14, 'melee', ['basicAttack']),
        M('defiasSoldier', '迪菲亚士兵', '⚔️', 16, 'melee', ['basicAttack', 'orcRage'], ['healthPotion']),
        M('dustDevil', '尘暴元素', '🌪️', 19, 'melee', ['basicAttack', 'trollSmash']),
        M('defiasWizard', '迪菲亚法师', '🧙‍♂️', 13, 'caster', ['basicAttack', 'monsterFireball', 'monsterFrostBolt'], ['manaPotion']),
        M('moonbrookWitch', '月溪镇女巫', '🌙', 15, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness'], ['manaPotion']),
        M('skeletonMage', '骷髅法师', '💀', 17, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFireball']),
        M('defiasPillager', '迪菲亚纵火者', '🔥', 18, 'caster', ['basicAttack', 'monsterFireball', 'monsterPoisonCloud'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🌑 暮色森林 (Lv 15-25) — 10怪: 5 melee + 5 caster =====
    ...Object.fromEntries([
        M('nightbaneWorgen', '夜吠狼人', '🐺', 15, 'melee', ['basicAttack', 'wolfBite']),
        M('ghoul', '食尸鬼', '🧟', 17, 'melee', ['basicAttack', 'skeletonSlash']),
        M('skeletonWarrior', '骷髅战士', '💀', 19, 'melee', ['basicAttack', 'skeletonSlash'], ['healthPotion']),
        M('blackWidow', '黑寡妇蜘蛛', '🕸️', 21, 'melee', ['basicAttack', 'goblinStab']),
        M('worgenBerserker', '狼人狂战士', '🌕', 24, 'melee', ['basicAttack', 'orcRage', 'wolfBite'], ['strengthPotion']),
        M('darkNecromancer', '黑暗死灵法师', '☠️', 18, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness'], ['manaPotion']),
        M('bansheeWailer', '哀号女妖', '👻', 20, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFrostBolt'], ['manaPotion']),
        M('nightbaneHexer', '夜吠诅咒师', '🔮', 22, 'caster', ['basicAttack', 'monsterCurseOfWeakness', 'monsterShadowBolt']),
        M('undeadRavager', '亡灵蹂躏者', '🪦', 16, 'caster', ['basicAttack', 'monsterShadowBolt']),
        M('darkRider', '黑暗骑士', '🏇', 25, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness', 'monsterHeal'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🐊 湿地 (Lv 18-28) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('swampCrocolisk', '沼泽鳄鱼', '🐊', 18, 'melee', ['basicAttack', 'wolfBite']),
        M('darkIronDwarf', '黑铁矮人', '⚒️', 20, 'melee', ['basicAttack', 'orcRage'], ['healthPotion']),
        M('mossHide', '苔皮猛兽', '🦏', 22, 'melee', ['basicAttack', 'trollSmash']),
        M('dragonmawOrc', '龙喉兽人', '🗡️', 25, 'melee', ['basicAttack', 'orcRage', 'trollSmash'], ['strengthPotion']),
        M('murlocCoastrunner', '沿海鱼人', '🐟', 19, 'melee', ['basicAttack', 'wolfBite']),
        M('darkIronSorcerer', '黑铁矮人巫师', '🔥', 21, 'caster', ['basicAttack', 'monsterFireball', 'monsterFrostBolt'], ['manaPotion']),
        M('bogBeast', '沼泽元素', '🌿', 24, 'caster', ['basicAttack', 'monsterPoisonCloud', 'monsterHeal']),
        M('murlocTidecaller', '鱼人潮汐祭司', '🌊', 23, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterHeal'], ['manaPotion']),
        M('dragonmawWarlock', '龙喉术士', '💜', 27, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness', 'monsterFireball'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🌿 荆棘谷 (Lv 22-35) — 10怪: 5 melee + 5 caster =====
    ...Object.fromEntries([
        M('bloodscalpHunter', '血顶巨魔猎手', '🏹', 22, 'melee', ['basicAttack', 'trollSmash'], ['healthPotion']),
        M('panther', '丛林黑豹', '🐆', 25, 'melee', ['basicAttack', 'wolfBite']),
        M('jungleRaptor', '丛林迅猛龙', '🦖', 28, 'melee', ['basicAttack', 'wolfBite', 'orcRage']),
        M('gorilla', '丛林猩猩', '🦍', 32, 'melee', ['basicAttack', 'orcRage', 'trollSmash'], ['strengthPotion']),
        M('nagaWarrior', '纳迦战士', '🐍', 34, 'melee', ['basicAttack', 'orcRage', 'skeletonSlash'], ['healthPotion']),
        M('bloodscalpWitch', '血顶巨魔巫医', '🪬', 24, 'caster', ['basicAttack', 'monsterHeal', 'monsterPoisonCloud'], ['manaPotion']),
        M('skullsplitterMystic', '碎颅巨魔密使', '🔮', 27, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness']),
        M('nagaSiren', '纳迦海妖', '🧜', 30, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterLightningBolt'], ['manaPotion']),
        M('basilisk', '石化蜥蜴', '🦎', 33, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterCurseOfWeakness']),
        M('trollShadowcaster', '巨魔暗影祭司', '💀', 35, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterPoisonCloud', 'monsterHeal'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🏜️ 荒芜之地 (Lv 28-38) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('stonevaultTrogg', '石腭怪', '🪨', 28, 'melee', ['basicAttack', 'trollSmash']),
        M('buzzard', '秃鹫', '🦅', 30, 'melee', ['basicAttack', 'wolfBite']),
        M('rockElemental', '岩石元素', '⛰️', 33, 'melee', ['basicAttack', 'orcRage']),
        M('scaldingWhelp', '灼热雏龙', '🐉', 36, 'melee', ['basicAttack', 'orcRage', 'wolfBite'], ['healthPotion']),
        M('dustBelcher', '尘土巨人', '🗿', 38, 'melee', ['basicAttack', 'trollSmash', 'orcRage'], ['strengthPotion']),
        M('stonevaultGeomancer', '石腭地卜师', '🔮', 29, 'caster', ['basicAttack', 'monsterFireball', 'monsterLightningBolt'], ['manaPotion']),
        M('shadowforgeSurveyor', '暗炉矮人测量员', '⚡', 32, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterFireball']),
        M('dustStormElemental', '沙暴元素', '🌪️', 35, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterPoisonCloud']),
        M('wyrmCultist', '龙祭祀', '🐲', 37, 'caster', ['basicAttack', 'monsterFireball', 'monsterShadowBolt', 'monsterHeal'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🌋 灼热峡谷 (Lv 32-42) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('darkIronSentry', '黑铁哨兵', '🛡️', 32, 'melee', ['basicAttack', 'skeletonSlash', 'orcRage'], ['healthPotion']),
        M('fireGuard', '烈焰守卫', '🔥', 35, 'melee', ['basicAttack', 'orcRage']),
        M('heavyWarGolem', '重型战争傀儡', '🤖', 38, 'melee', ['basicAttack', 'trollSmash']),
        M('magmaElemental', '熔岩元素', '🌋', 40, 'melee', ['basicAttack', 'orcRage', 'trollSmash'], ['strengthPotion']),
        M('darkIronTaskmaster', '黑铁监工', '⚒️', 42, 'melee', ['basicAttack', 'orcRage', 'skeletonSlash'], ['healthPotion']),
        M('darkIronChanneler', '黑铁导魔者', '💜', 34, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFireball'], ['manaPotion']),
        M('blazeElemental', '烈焰元素', '☀️', 37, 'caster', ['basicAttack', 'monsterFireball', 'monsterPoisonCloud']),
        M('shadowforgeFlame', '暗炉火法师', '🧙‍♂️', 39, 'caster', ['basicAttack', 'monsterFireball', 'monsterLightningBolt', 'monsterHeal'], ['manaPotion']),
        M('incendosaur', '火焰恐龙', '🦕', 41, 'caster', ['basicAttack', 'monsterFireball', 'monsterPoisonCloud']),
    ].map(m => [m.id, m])),

    // ===== ⛰️ 辛特兰 (Lv 36-46) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('vilebranchBerserker', '邪枝巨魔狂战', '🧌', 36, 'melee', ['basicAttack', 'trollSmash', 'orcRage']),
        M('owlbeast', '枭兽', '🦉', 38, 'melee', ['basicAttack', 'wolfBite', 'orcRage']),
        M('highvaleRanger', '高谷游侠', '🏹', 40, 'melee', ['basicAttack', 'goblinStab'], ['healthPotion']),
        M('jadeOoze', '翡翠软泥怪', '🟢', 43, 'melee', ['basicAttack', 'goblinStab']),
        M('vilebranchAxethrower', '邪枝巨魔掷斧者', '🪓', 45, 'melee', ['basicAttack', 'trollSmash'], ['strengthPotion']),
        M('vilebranchHexer', '邪枝巨魔妖术师', '🔮', 37, 'caster', ['basicAttack', 'monsterCurseOfWeakness', 'monsterShadowBolt'], ['manaPotion']),
        M('mangyHippogryph', '鹰身人', '🦅', 39, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterFrostBolt']),
        M('vilebranchShadowcaster', '邪枝暗影施法者', '💀', 42, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterPoisonCloud'], ['manaPotion']),
        M('highvaleDruid', '高谷德鲁伊', '🍃', 46, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterHeal', 'monsterPoisonCloud'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🍄 费伍德森林 (Lv 40-50) — 10怪: 5 melee + 5 caster =====
    ...Object.fromEntries([
        M('corruptedTreeant', '腐化树人', '🌳', 40, 'melee', ['basicAttack', 'orcRage']),
        M('jadefireRogue', '碧火盗贼', '🗡️', 42, 'melee', ['basicAttack', 'goblinStab', 'wolfBite']),
        M('taintedBear', '污染之熊', '🐻', 44, 'melee', ['basicAttack', 'wolfBite', 'orcRage']),
        M('irontreeStomper', '铁木践踏者', '🦶', 47, 'melee', ['basicAttack', 'trollSmash', 'orcRage'], ['strengthPotion']),
        M('deadwoodWarrior', '死木巨魔武士', '🧌', 49, 'melee', ['basicAttack', 'trollSmash', 'skeletonSlash']),
        M('jadefireHellcaller', '碧火恶魔召唤师', '😈', 41, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFireball', 'monsterCurseOfWeakness'], ['manaPotion']),
        M('corruptedSpirit', '腐化之灵', '👻', 43, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterPoisonCloud']),
        M('shadowSatyress', '暗影萨特女妖', '💜', 46, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness', 'monsterHeal'], ['manaPotion']),
        M('deadwoodShaman', '死木巨魔萨满', '🪬', 48, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterHeal', 'monsterPoisonCloud'], ['manaPotion']),
        M('felguard', '恶魔卫士', '🔥', 50, 'caster', ['basicAttack', 'monsterFireball', 'monsterShadowBolt', 'monsterPoisonCloud'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== ☠️ 东瘟疫之地 (Lv 45-55) — 10怪: 5 melee + 5 caster =====
    ...Object.fromEntries([
        M('plagueGhoul', '瘟疫食尸鬼', '🧟', 45, 'melee', ['basicAttack', 'skeletonSlash']),
        M('deathguard', '亡灵守卫', '⚔️', 47, 'melee', ['basicAttack', 'skeletonSlash', 'orcRage'], ['healthPotion']),
        M('abomination', '憎恶', '🧟‍♂️', 50, 'melee', ['basicAttack', 'orcRage', 'trollSmash'], ['healthPotion']),
        M('deathKnight', '死亡骑士', '🗡️', 53, 'melee', ['basicAttack', 'skeletonSlash', 'orcRage', 'trollSmash'], ['healthPotion', 'strengthPotion']),
        M('plaguebat', '瘟疫蝙蝠', '🦇', 46, 'melee', ['basicAttack', 'wolfBite']),
        M('banshee', '女妖', '👻', 48, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFrostBolt', 'monsterCurseOfWeakness'], ['manaPotion']),
        M('lichApprentice', '巫妖学徒', '🧊', 51, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterShadowBolt', 'monsterHeal'], ['manaPotion']),
        M('darkCultist', '黑暗教徒', '☠️', 49, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness']),
        M('plagueSpewer', '瘟疫喷吐者', '🤢', 52, 'caster', ['basicAttack', 'monsterPoisonCloud', 'monsterShadowBolt']),
        M('necromancerLord', '死灵领主', '💀', 55, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterPoisonCloud', 'monsterHeal', 'monsterCurseOfWeakness'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🐻‍❄️ 冬泉谷 (Lv 48-58) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('frostsaber', '霜刃豹', '🐆', 48, 'melee', ['basicAttack', 'wolfBite', 'orcRage']),
        M('frostmaulGiant', '霜槌巨人', '🗿', 51, 'melee', ['basicAttack', 'trollSmash', 'orcRage'], ['strengthPotion']),
        M('wildkin', '枭兽', '🦉', 53, 'melee', ['basicAttack', 'trollSmash']),
        M('iceThistleYeti', '冰蓟雪人', '🦍', 56, 'melee', ['basicAttack', 'orcRage', 'trollSmash']),
        M('winterfallPathfinder', '冬泉巨魔先锋', '🧌', 48, 'melee', ['basicAttack', 'trollSmash', 'trollRegenerate'], ['healthPotion']),
        M('cobaltMageweaver', '钴蓝织法者', '🔵', 50, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterLightningBolt'], ['manaPotion']),
        M('frostElemental', '寒冰元素', '❄️', 52, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterPoisonCloud']),
        M('winterfallShaman', '冬泉巨魔萨满', '🪬', 55, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterHeal', 'monsterFrostBolt'], ['manaPotion']),
        M('chimeraMatriarch', '奇美拉女族长', '🐲', 58, 'caster', ['basicAttack', 'monsterFrostBolt', 'monsterLightningBolt', 'monsterPoisonCloud'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🔥 燃烧平原 (Lv 50-58) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('blackrockOrc', '黑石兽人', '🗡️', 50, 'melee', ['basicAttack', 'orcRage', 'trollSmash'], ['healthPotion']),
        M('flamescaleWyrm', '烈焰龙', '🐉', 53, 'melee', ['basicAttack', 'orcRage', 'wolfBite']),
        M('firegutBrute', '火喉巨人', '🔥', 55, 'melee', ['basicAttack', 'trollSmash', 'orcRage'], ['strengthPotion']),
        M('blackDragonkin', '黑龙人', '🐲', 57, 'melee', ['basicAttack', 'orcRage', 'skeletonSlash', 'trollSmash'], ['healthPotion']),
        M('blackrockChampion', '黑石勇士', '⚔️', 50, 'melee', ['basicAttack', 'orcRage', 'skeletonSlash']),
        M('blackrockWarlock', '黑石术士', '💜', 52, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFireball', 'monsterCurseOfWeakness'], ['manaPotion']),
        M('smolderingElemental', '阴燃元素', '☀️', 54, 'caster', ['basicAttack', 'monsterFireball', 'monsterPoisonCloud']),
        M('blackDragonMage', '黑龙法师', '🧙', 56, 'caster', ['basicAttack', 'monsterFireball', 'monsterLightningBolt', 'monsterHeal'], ['manaPotion']),
        M('pyromaniacGoblin', '纵火哥布林', '💣', 58, 'caster', ['basicAttack', 'monsterFireball', 'monsterPoisonCloud', 'monsterLightningBolt'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 💀 诅咒之地 (Lv 52-60) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('felguardSentry', '恶魔卫兵', '😈', 52, 'melee', ['basicAttack', 'orcRage', 'trollSmash']),
        M('shadowswornThug', '暗誓暴徒', '🗡️', 54, 'melee', ['basicAttack', 'goblinStab', 'orcRage'], ['healthPotion']),
        M('dreadmaulOgre', '恐锤食人魔', '🧌', 56, 'melee', ['basicAttack', 'trollSmash', 'orcRage']),
        M('doomguard', '末日守卫', '👹', 59, 'melee', ['basicAttack', 'orcRage', 'trollSmash', 'skeletonSlash'], ['healthPotion', 'strengthPotion']),
        M('helboar', '地狱野猪', '🐗', 53, 'melee', ['basicAttack', 'wolfBite']),
        M('shadowswornWarlock', '暗誓术士', '💜', 55, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness', 'monsterFireball'], ['manaPotion']),
        M('voidwalker', '虚空行者', '🟣', 57, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFrostBolt', 'monsterCurseOfWeakness']),
        M('dreadmaulWarlock', '恐锤食人魔术士', '🔮', 58, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterFireball', 'monsterHeal'], ['manaPotion']),
        M('demonSummoner', '恶魔召唤者', '🌀', 60, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterPoisonCloud', 'monsterFireball', 'monsterCurseOfWeakness'], ['manaPotion']),
    ].map(m => [m.id, m])),

    // ===== 🐉 希利苏斯 (Lv 55-60) — 9怪: 5 melee + 4 caster =====
    ...Object.fromEntries([
        M('silithidWorker', '其拉工蜂', '🐛', 55, 'melee', ['basicAttack', 'goblinStab']),
        M('silithidWarrior', '其拉战虫', '🪲', 57, 'melee', ['basicAttack', 'orcRage', 'trollSmash']),
        M('sandworm', '沙虫', '🐍', 58, 'melee', ['basicAttack', 'wolfBite', 'orcRage']),
        M('silithidColossus', '其拉巨像', '🦂', 60, 'melee', ['basicAttack', 'trollSmash', 'orcRage', 'skeletonSlash'], ['healthPotion', 'strengthPotion']),
        M('twilightAvenger', '暮光复仇者', '⚔️', 56, 'melee', ['basicAttack', 'orcRage', 'skeletonSlash']),
        M('twilightGeomancer', '暮光地卜师', '🔮', 55, 'caster', ['basicAttack', 'monsterFireball', 'monsterLightningBolt'], ['manaPotion']),
        M('silithidBrainwasher', '其拉洗脑者', '🧠', 57, 'caster', ['basicAttack', 'monsterShadowBolt', 'monsterCurseOfWeakness', 'monsterPoisonCloud']),
        M('twilightFlamereaver', '暮光裂焰者', '🔥', 59, 'caster', ['basicAttack', 'monsterFireball', 'monsterPoisonCloud', 'monsterLightningBolt'], ['manaPotion']),
        M('desertElemental', '沙漠元素', '🌪️', 60, 'caster', ['basicAttack', 'monsterLightningBolt', 'monsterPoisonCloud', 'monsterFrostBolt'], ['manaPotion']),
    ].map(m => [m.id, m])),
};

export const areas = {
    elwynnForest: {
        id: 'elwynnForest', name: '艾尔文森林', emoji: '🌲',
        levelRange: { min: 1, max: 10 }, environment: 'forest',
        description: '新手冒险者的起始之地，森林中栖息着温和的野兽和少量敌对生物。',
        unlockLevel: 1, unlockRequires: [],
        monsters: ['forestWolf', 'koboldMiner', 'defiantBrother', 'forestSpider', 'murloc', 'koboldGeomancer', 'murlocOracle', 'youngThiefMage', 'forestOrcShaman'],
        rewards: { expBonus: 1.0, goldBonus: 1.0 },
        events: ['merchantEncounter', 'treasureChest']
    },
    dunMorogh: {
        id: 'dunMorogh', name: '丹莫罗', emoji: '❄️',
        levelRange: { min: 6, max: 15 }, environment: 'snow',
        description: '白雪覆盖的矮人领地，霜鬃巨魔和雪怪出没于冰冷的山谷之中。',
        unlockLevel: 5, unlockRequires: ['elwynnForest'],
        monsters: ['snowLeopard', 'frostmaneTracker', 'wendigo', 'iceCragBoar', 'leperGnome', 'frostmaneShaman', 'iceElemental', 'leperGnomeMage', 'frostSeer'],
        rewards: { expBonus: 1.05, goldBonus: 1.0 },
        events: ['blizzardEvent', 'treasureChest']
    },
    westfall: {
        id: 'westfall', name: '西部荒野', emoji: '🌾',
        levelRange: { min: 10, max: 20 }, environment: 'plains',
        description: '广阔的农田和荒野，被盗贼和流浪者占据，适合有一定经验的冒险者。',
        unlockLevel: 10, unlockRequires: ['elwynnForest'],
        monsters: ['coyote', 'defiasBandit', 'harvestGolem', 'defiasSoldier', 'dustDevil', 'defiasWizard', 'moonbrookWitch', 'skeletonMage', 'defiasPillager'],
        rewards: { expBonus: 1.1, goldBonus: 1.1 },
        events: ['caravanEscort', 'banditAmbush']
    },
    duskwood: {
        id: 'duskwood', name: '暮色森林', emoji: '🌑',
        levelRange: { min: 15, max: 25 }, environment: 'darkforest',
        description: '永远笼罩在黑暗中的恐怖森林，狼人和亡灵在暗处徘徊。',
        unlockLevel: 14, unlockRequires: ['westfall'],
        monsters: ['nightbaneWorgen', 'ghoul', 'skeletonWarrior', 'blackWidow', 'worgenBerserker', 'darkNecromancer', 'bansheeWailer', 'nightbaneHexer', 'undeadRavager', 'darkRider'],
        rewards: { expBonus: 1.15, goldBonus: 1.1 },
        events: ['werewolfHowl', 'hauntedGraveyard']
    },
    wetlands: {
        id: 'wetlands', name: '湿地', emoji: '🐊',
        levelRange: { min: 18, max: 28 }, environment: 'swamp',
        description: '潮湿泥泞的沼泽地带，鳄鱼和黑铁矮人在此活动。',
        unlockLevel: 17, unlockRequires: ['dunMorogh'],
        monsters: ['swampCrocolisk', 'darkIronDwarf', 'mossHide', 'dragonmawOrc', 'murlocCoastrunner', 'darkIronSorcerer', 'bogBeast', 'murlocTidecaller', 'dragonmawWarlock'],
        rewards: { expBonus: 1.15, goldBonus: 1.1 },
        events: ['swampFog', 'sunkenTreasure']
    },
    stranglethorn: {
        id: 'stranglethorn', name: '荆棘谷', emoji: '🌿',
        levelRange: { min: 22, max: 35 }, environment: 'jungle',
        description: '危险的热带丛林，充满了凶猛的野兽和古老的遗迹，只有勇敢的冒险者才敢踏足。',
        unlockLevel: 20, unlockRequires: ['duskwood', 'wetlands'],
        monsters: ['bloodscalpHunter', 'panther', 'jungleRaptor', 'gorilla', 'nagaWarrior', 'bloodscalpWitch', 'skullsplitterMystic', 'nagaSiren', 'basilisk', 'trollShadowcaster'],
        rewards: { expBonus: 1.3, goldBonus: 1.2 },
        events: ['ancientRuins', 'junglePredator']
    },
    badlands: {
        id: 'badlands', name: '荒芜之地', emoji: '🏜️',
        levelRange: { min: 28, max: 38 }, environment: 'desert',
        description: '干旱荒凉的沙漠地带，石腭怪和雏龙在岩石间穿行。',
        unlockLevel: 26, unlockRequires: ['stranglethorn'],
        monsters: ['stonevaultTrogg', 'buzzard', 'rockElemental', 'scaldingWhelp', 'dustBelcher', 'stonevaultGeomancer', 'shadowforgeSurveyor', 'dustStormElemental', 'wyrmCultist'],
        rewards: { expBonus: 1.3, goldBonus: 1.2 },
        events: ['sandstorm', 'dragonEgg']
    },
    searingGorge: {
        id: 'searingGorge', name: '灼热峡谷', emoji: '🌋',
        levelRange: { min: 32, max: 42 }, environment: 'volcanic',
        description: '被岩浆和火焰包围的峡谷，黑铁矮人在此大量驻扎。',
        unlockLevel: 30, unlockRequires: ['badlands'],
        monsters: ['darkIronSentry', 'fireGuard', 'heavyWarGolem', 'magmaElemental', 'darkIronTaskmaster', 'darkIronChanneler', 'blazeElemental', 'shadowforgeFlame', 'incendosaur'],
        rewards: { expBonus: 1.35, goldBonus: 1.25 },
        events: ['volcanicEruption', 'darkIronPatrol']
    },
    hinterlands: {
        id: 'hinterlands', name: '辛特兰', emoji: '⛰️',
        levelRange: { min: 36, max: 46 }, environment: 'highland',
        description: '蛮荒高地，邪枝巨魔和枭兽在此出没，鹰身人翱翔天际。',
        unlockLevel: 34, unlockRequires: ['badlands'],
        monsters: ['vilebranchBerserker', 'owlbeast', 'highvaleRanger', 'jadeOoze', 'vilebranchAxethrower', 'vilebranchHexer', 'mangyHippogryph', 'vilebranchShadowcaster', 'highvaleDruid'],
        rewards: { expBonus: 1.35, goldBonus: 1.25 },
        events: ['trollRitual', 'eagleNest']
    },
    felwood: {
        id: 'felwood', name: '费伍德森林', emoji: '🍄',
        levelRange: { min: 40, max: 50 }, environment: 'corrupt',
        description: '被恶魔力量腐化的森林，树人和萨特在腐臭的空气中徘徊。',
        unlockLevel: 38, unlockRequires: ['hinterlands'],
        monsters: ['corruptedTreeant', 'jadefireRogue', 'taintedBear', 'irontreeStomper', 'deadwoodWarrior', 'jadefireHellcaller', 'corruptedSpirit', 'shadowSatyress', 'deadwoodShaman', 'felguard'],
        rewards: { expBonus: 1.4, goldBonus: 1.3 },
        events: ['corruptionSpread', 'moonwell']
    },
    easternPlaguelands: {
        id: 'easternPlaguelands', name: '东瘟疫之地', emoji: '☠️',
        levelRange: { min: 45, max: 55 }, environment: 'plague',
        description: '被瘟疫侵蚀的恐怖之地，亡灵横行，只有最强大的英雄才能在此生存。',
        unlockLevel: 43, unlockRequires: ['felwood', 'stranglethorn'],
        monsters: ['plagueGhoul', 'deathguard', 'abomination', 'deathKnight', 'plaguebat', 'banshee', 'lichApprentice', 'darkCultist', 'plagueSpewer', 'necromancerLord'],
        rewards: { expBonus: 1.5, goldBonus: 1.4 },
        events: ['undeadHorde', 'plaguedTreasure']
    },
    winterspring: {
        id: 'winterspring', name: '冬泉谷', emoji: '🐻‍❄️',
        levelRange: { min: 48, max: 58 }, environment: 'frost',
        description: '极寒的冰雪之地，霜刃豹和巨人在冰风中游荡。',
        unlockLevel: 46, unlockRequires: ['easternPlaguelands'],
        monsters: ['frostsaber', 'frostmaulGiant', 'wildkin', 'iceThistleYeti', 'winterfallPathfinder', 'cobaltMageweaver', 'frostElemental', 'winterfallShaman', 'chimeraMatriarch'],
        rewards: { expBonus: 1.5, goldBonus: 1.4 },
        events: ['blizzardEvent', 'frostSaberDen']
    },
    burningSteppes: {
        id: 'burningSteppes', name: '燃烧平原', emoji: '🔥',
        levelRange: { min: 50, max: 58 }, environment: 'war',
        description: '战火纷飞的平原，黑石兽人和黑龙军团在此交战。',
        unlockLevel: 48, unlockRequires: ['searingGorge', 'easternPlaguelands'],
        monsters: ['blackrockOrc', 'flamescaleWyrm', 'firegutBrute', 'blackDragonkin', 'blackrockChampion', 'blackrockWarlock', 'smolderingElemental', 'blackDragonMage', 'pyromaniacGoblin'],
        rewards: { expBonus: 1.5, goldBonus: 1.4 },
        events: ['blackrockInvasion', 'dragonFlight']
    },
    blstedLands: {
        id: 'blstedLands', name: '诅咒之地', emoji: '💀',
        levelRange: { min: 52, max: 60 }, environment: 'demonic',
        description: '被恶魔力量侵蚀的荒芜之地，虚空行者和末日守卫巡逻于黑暗门户附近。',
        unlockLevel: 50, unlockRequires: ['easternPlaguelands'],
        monsters: ['felguardSentry', 'shadowswornThug', 'dreadmaulOgre', 'doomguard', 'helboar', 'shadowswornWarlock', 'voidwalker', 'dreadmaulWarlock', 'demonSummoner'],
        rewards: { expBonus: 1.5, goldBonus: 1.45 },
        events: ['demonicRift', 'darkPortal']
    },
    silithus: {
        id: 'silithus', name: '希利苏斯', emoji: '🐉',
        levelRange: { min: 55, max: 60 }, environment: 'silithid',
        description: '其拉虫族的巢穴，暮光之锤教徒和巨大的沙虫在沙丘下潜伏。',
        unlockLevel: 53, unlockRequires: ['winterspring', 'blstedLands'],
        monsters: ['silithidWorker', 'silithidWarrior', 'sandworm', 'silithidColossus', 'twilightAvenger', 'twilightGeomancer', 'silithidBrainwasher', 'twilightFlamereaver', 'desertElemental'],
        rewards: { expBonus: 1.6, goldBonus: 1.5 },
        events: ['silithidSwarm', 'ancientQiraji']
    },
};
