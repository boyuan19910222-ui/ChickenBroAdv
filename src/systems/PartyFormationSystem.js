/**
 * 队伍编成系统 - 管理副本队伍组建和站位分配
 * 
 * 特性:
 * - 5定位随机职业选择（1T + 1H + 1近战DPS + 2远程DPS）
 * - AI等级缩放（副本推荐等级下限）
 * - 动态玩家替换AI
 * - 职业→定位→站位自动映射
 * - 混合职业按天赋判断定位
 */
import { randomChoice } from '../core/RandomProvider.js'
import { GameData } from '../data/GameData.js'

export const PartyFormationSystem = {
    // 队伍定位模板（定位固定，职业随机）
    PARTY_ROLE_TEMPLATE: [
        { slot: 1, role: 'tank', roleIcon: '/icons/roles/tank.png' },
        { slot: 2, role: 'melee_dps', roleIcon: '/icons/roles/melee_dps.png' },
        { slot: 3, role: 'ranged_dps', roleIcon: '/icons/roles/ranged_dps.png' },
        { slot: 4, role: 'ranged_dps', roleIcon: '/icons/roles/ranged_dps.png' },
        { slot: 5, role: 'healer', roleIcon: '/icons/roles/healer.png' },
    ],

    // 每个定位可用的职业+天赋组合
    ROLE_CLASS_POOL: {
        tank: [
            { classId: 'warrior', talent: 'protection', name: 'AI防战' },
            { classId: 'paladin', talent: 'protection', name: 'AI防骑' },
            { classId: 'druid', talent: 'feral', name: 'AI熊德' },
        ],
        healer: [
            { classId: 'priest', talent: 'holy', name: 'AI神牧' },
            { classId: 'paladin', talent: 'holy', name: 'AI奶骑' },
            { classId: 'shaman', talent: 'restoration', name: 'AI奶萨' },
            { classId: 'druid', talent: 'restoration', name: 'AI奶德' },
        ],
        melee_dps: [
            { classId: 'rogue', talent: null, name: 'AI盗贼' },
            { classId: 'warrior', talent: 'arms', name: 'AI武战' },
            { classId: 'warrior', talent: 'fury', name: 'AI狂战' },
            { classId: 'paladin', talent: 'retribution', name: 'AI惩戒骑' },
            { classId: 'shaman', talent: 'enhancement', name: 'AI增强萨' },
            { classId: 'druid', talent: 'feral', name: 'AI猫德' },
        ],
        ranged_dps: [
            { classId: 'hunter', talent: null, name: 'AI猎人' },
            { classId: 'mage', talent: null, name: 'AI法师' },
            { classId: 'warlock', talent: null, name: 'AI术士' },
            { classId: 'priest', talent: 'shadow', name: 'AI暗牧' },
            { classId: 'shaman', talent: 'elemental', name: 'AI元素萨' },
            { classId: 'druid', talent: 'balance', name: 'AI平衡德' },
        ],
    },

    // 兼容旧引用
    DEFAULT_PARTY_TEMPLATE: [
        { slot: 1, role: 'tank', defaultClass: 'warrior', name: 'AI坦克', roleIcon: '/icons/roles/tank.png' },
        { slot: 2, role: 'melee_dps', defaultClass: 'rogue', name: 'AI近战', roleIcon: '/icons/roles/melee_dps.png' },
        { slot: 3, role: 'ranged_dps', defaultClass: 'hunter', name: 'AI猎人', roleIcon: '/icons/roles/ranged_dps.png' },
        { slot: 4, role: 'ranged_dps', defaultClass: 'warlock', name: 'AI术士', roleIcon: '/icons/roles/ranged_dps.png' },
        { slot: 5, role: 'healer', defaultClass: 'priest', name: 'AI治疗', roleIcon: '/icons/roles/healer.png' },
    ],

    // 职业默认角色定位
    CLASS_DEFAULT_ROLE: {
        warrior: 'tank',
        paladin: 'tank',        // 默认坦克，可变
        rogue: 'melee_dps',
        hunter: 'ranged_dps',
        mage: 'ranged_dps',
        warlock: 'ranged_dps',
        priest: 'healer',
        shaman: 'healer',       // 默认治疗，可变
        druid: 'healer',        // 默认治疗，可变
    },

    // 天赋定位覆盖
    TALENT_ROLE_OVERRIDE: {
        // 圣骑士
        paladin_holy: 'healer',
        paladin_protection: 'tank',
        paladin_retribution: 'melee_dps',
        
        // 德鲁伊
        druid_balance: 'ranged_dps',
        druid_feral: 'melee_dps',  // 可也是tank
        druid_restoration: 'healer',
        
        // 萨满
        shaman_elemental: 'ranged_dps',
        shaman_enhancement: 'melee_dps',
        shaman_restoration: 'healer',
        
        // 战士
        warrior_arms: 'melee_dps',
        warrior_fury: 'melee_dps',
        warrior_protection: 'tank',
        
        // 牧师
        priest_discipline: 'healer',
        priest_holy: 'healer',
        priest_shadow: 'ranged_dps',
    },

    // 角色定位到站位映射
    ROLE_TO_SLOT: {
        tank: [1],
        melee_dps: [2],
        ranged_dps: [3, 4],
        healer: [5],
    },

    /**
     * 根据职业和天赋确定角色定位
     * @param {string} classId - 职业ID
     * @param {string|null} primaryTalent - 显式指定的主天赋树（可选）
     * @param {Object|null} talents - 角色天赋点分配数据（可选，用于动态计算主天赋）
     * @returns {string} 角色定位
     */
    determineRole(classId, primaryTalent = null, talents = null) {
        // 1. 如果显式指定了 primaryTalent，直接使用
        let effectiveTalent = primaryTalent;
        
        // 2. 如果没有显式指定，从天赋点分配中动态计算投入最多的天赋树
        if (!effectiveTalent && talents) {
            effectiveTalent = this._calculatePrimaryTalent(talents);
        }
        
        // 3. 如果有有效天赋，使用天赋定位覆盖
        if (effectiveTalent) {
            const talentKey = `${classId}_${effectiveTalent}`;
            if (this.TALENT_ROLE_OVERRIDE[talentKey]) {
                console.log(`[PartyFormation] 定位判定: ${classId} + ${effectiveTalent} → ${this.TALENT_ROLE_OVERRIDE[talentKey]}`);
                return this.TALENT_ROLE_OVERRIDE[talentKey];
            }
        }
        
        // 4. 否则使用职业默认定位
        return this.CLASS_DEFAULT_ROLE[classId] || 'melee_dps';
    },

    /**
     * 根据天赋点分配数据计算投入点数最多的天赋树
     * @param {Object} talents - 天赋数据，格式: { treeName: { talentId: points, ... }, ... }
     * @returns {string|null} 投入最多的天赋树名称
     * @private
     */
    _calculatePrimaryTalent(talents) {
        if (!talents || typeof talents !== 'object') return null;
        
        let maxPoints = 0;
        let primaryTree = null;
        
        for (const [treeName, treeData] of Object.entries(talents)) {
            if (!treeData || typeof treeData !== 'object') continue;
            const totalPoints = Object.values(treeData).reduce((sum, pts) => sum + (pts || 0), 0);
            if (totalPoints > maxPoints) {
                maxPoints = totalPoints;
                primaryTree = treeName;
            }
        }
        
        return primaryTree;
    },

    /**
     * 根据角色定位确定站位
     * @param {string} role - 角色定位
     * @param {Array} occupiedSlots - 已占用的站位
     * @returns {number} 站位编号
     */
    determineSlot(role, occupiedSlots = []) {
        const availableSlots = this.ROLE_TO_SLOT[role] || [2];
        
        // 找到第一个未被占用的站位
        for (const slot of availableSlots) {
            if (!occupiedSlots.includes(slot)) {
                return slot;
            }
        }
        
        // 如果所有首选站位都被占用，找任意空位
        for (let i = 1; i <= 5; i++) {
            if (!occupiedSlots.includes(i)) {
                return i;
            }
        }
        
        // 不应该到这里
        return 1;
    },

    /**
     * 创建随机AI队伍（定位固定，职业随机）
     * @param {Object} options - 可选配置
     * @param {number} options.dungeonMinLevel - 副本推荐最低等级（AI等级=此值）
     * @param {string} options.playerClassId - 玩家职业ID（避免AI重复选择同一职业+天赋）
     * @param {string} options.playerTalent - 玩家主天赋
     * @returns {Array} AI队员列表
     */
    createDefaultParty(options = {}) {
        const { dungeonMinLevel = 1, playerClassId, playerTalent } = options;
        const usedClasses = new Set(); // 跟踪已选职业，尽量避免重复

        return this.PARTY_ROLE_TEMPLATE.map(template => {
            const pool = this.ROLE_CLASS_POOL[template.role] || [];
            const chosen = this._pickRandomFromPool(pool, usedClasses, playerClassId, playerTalent);
            
            usedClasses.add(chosen.classId);

            const aiId = `ai_${chosen.classId}_${template.slot}`;
            return {
                id: aiId,
                name: chosen.name,
                classId: chosen.classId,
                primaryTalent: chosen.talent,
                role: template.role,
                slot: template.slot,
                isPlayer: false,
                isAI: true,
                icon: this._getClassIcon(chosen.classId),
                emoji: this._getClassIcon(chosen.classId) ? '' : '❓',
                ...this._createAIStats(chosen.classId, dungeonMinLevel)
            };
        });
    },

    /**
     * 从职业池中随机选择，尽量不重复
     * @private
     */
    _pickRandomFromPool(pool, usedClasses, playerClassId, playerTalent) {
        if (pool.length === 0) {
            return { classId: 'warrior', talent: null, name: 'AI战士' };
        }

        // 优先选未使用过的职业（也排除与玩家完全相同的职业+天赋组合）
        const preferred = pool.filter(p => {
            if (usedClasses.has(p.classId)) return false;
            if (p.classId === playerClassId && p.talent === playerTalent) return false;
            return true;
        });

        const candidates = preferred.length > 0 ? preferred : pool;
        return randomChoice(candidates);
    },

    /**
     * 创建AI单位的基础属性（支持等级缩放）
     * @param {string} classId - 职业ID
     * @param {number} level - AI等级（副本推荐下限）
     * @private
     */
    _createAIStats(classId, level = 1) {
        const classData = GameData?.classes?.[classId];
        if (!classData) {
            return {
                level: level,
                currentHp: 100,
                maxHp: 100,
                currentMana: 50,
                maxMana: 50,
                stats: {},
                skills: [],
                skillCooldowns: {},
                buffs: [],
                debuffs: []
            };
        }
        
        // 使用 growthPerLevel 计算等级缩放后的属性
        const baseStats = { ...classData.baseStats };
        const growth = classData.growthPerLevel || {};
        const stats = {};
        
        for (const [stat, baseValue] of Object.entries(baseStats)) {
            const growthRate = growth[stat] || 0;
            stats[stat] = Math.round(baseValue + growthRate * (level - 1));
        }
        
        const resType = classData.resourceType || 'mana';
        const hp = stats.health || 100;
        const mana = stats.mana || 50;
        
        const result = {
            level,
            classId,
            currentHp: hp,
            maxHp: hp,
            currentMana: mana,
            maxMana: mana,
            resourceType: resType,
            resource: {
                type: resType,
                current: resType === 'rage' ? 0 : (resType === 'energy' ? 100 : mana),
                max: resType === 'energy' ? 100 : (resType === 'rage' ? 100 : mana)
            },
            stats,
            skills: classData.skills || [],
            skillCooldowns: {},
            buffs: [],
            debuffs: []
        };

        // 盗贼需要连击点系统
        if (classId === 'rogue') {
            result.comboPoints = { current: 0, max: 5 };
        }

        return result;
    },

    /**
     * 将玩家整合到队伍中（替换对应AI）
     * @param {Array} aiParty - AI队伍
     * @param {Object} player - 玩家角色
     * @returns {Object} { party, playerSlot }
     */
    integratePlayer(aiParty, player) {
        const party = [...aiParty];
        
        // 确定玩家的角色定位（传入天赋点数据，动态计算主天赋）
        const playerRole = this.determineRole(player.classId, player.primaryTalent, player.talents);
        
        // 确定玩家的站位
        const playerSlot = this.determineSlot(playerRole, []);
        
        // 找到对应站位的AI并替换
        const aiIndex = party.findIndex(member => member.slot === playerSlot);
        
        // 统一字段名：玩家角色使用 currentHealth/maxHealth，需要转换为 currentHp/maxHp
        const currentHp = player.currentHp ?? player.currentHealth ?? 100;
        const maxHp = player.maxHp ?? player.maxHealth ?? 100;
        
        // 创建玩家成员对象，确保 isPlayer 和 isAI 正确设置
        const playerMember = {
            ...player,
            role: playerRole,
            slot: playerSlot,
            isPlayer: true,     // 明确设置为true
            isAI: false,        // 明确设置为false
            currentHp: currentHp,   // 统一使用 currentHp
            maxHp: maxHp            // 统一使用 maxHp
        };
        
        console.log(`[PartyFormation] 整合玩家: id=${playerMember.id}, name=${playerMember.name}, isPlayer=${playerMember.isPlayer}, hp=${currentHp}/${maxHp}, slot=${playerSlot}`);
        
        if (aiIndex !== -1) {
            // 替换AI
            party[aiIndex] = playerMember;
        } else {
            // 如果没找到，添加到队伍
            party.push(playerMember);
            // 按站位排序
            party.sort((a, b) => a.slot - b.slot);
        }
        
        return { party, playerSlot };
    },

    /**
     * 创建完整的副本队伍
     * @param {Object} player - 玩家角色
     * @param {Object} dungeonData - 副本数据（含 levelRange）
     * @returns {Object} 队伍状态
     */
    createDungeonParty(player, dungeonData = null) {
        // 获取副本推荐等级下限
        const dungeonMinLevel = dungeonData?.levelRange?.min || 1;
        
        // 计算玩家实际主天赋（优先用显式字段，否则动态计算）
        const playerEffectiveTalent = player.primaryTalent || this._calculatePrimaryTalent(player.talents);
        
        // 创建随机AI队伍（等级=副本下限）
        const aiParty = this.createDefaultParty({
            dungeonMinLevel,
            playerClassId: player.classId,
            playerTalent: playerEffectiveTalent
        });
        
        // 整合玩家
        const { party, playerSlot } = this.integratePlayer(aiParty, player);
        
        return {
            members: party,
            playerSlot,
            playerMember: party.find(m => m.isPlayer),
            aiMembers: party.filter(m => m.isAI),
            
            // 队伍配置信息
            composition: {
                tank: party.filter(m => m.role === 'tank').length,
                melee_dps: party.filter(m => m.role === 'melee_dps').length,
                ranged_dps: party.filter(m => m.role === 'ranged_dps').length,
                healer: party.filter(m => m.role === 'healer').length
            }
        };
    },

    /**
     * 获取站位对应的角色信息
     * @param {Array} party - 队伍成员列表
     * @param {number} slot - 站位编号
     * @returns {Object|null} 角色信息
     */
    getMemberBySlot(party, slot) {
        return party.find(m => m.slot === slot) || null;
    },

    /**
     * 获取指定角色定位的成员
     * @param {Array} party - 队伍成员列表
     * @param {string} role - 角色定位
     * @returns {Array} 成员列表
     */
    getMembersByRole(party, role) {
        return party.filter(m => m.role === role);
    },

    /**
     * 检查队伍配置是否合理
     * @param {Array} party - 队伍成员列表
     * @returns {Object} { isValid, warnings }
     */
    validatePartyComposition(party) {
        const warnings = [];
        
        const tanks = party.filter(m => m.role === 'tank');
        const healers = party.filter(m => m.role === 'healer');
        
        if (tanks.length === 0) {
            warnings.push('队伍没有坦克！BOSS可能会攻击脆弱的队友。');
        }
        
        if (healers.length === 0) {
            warnings.push('队伍没有治疗！需要依赖药水恢复生命。');
        }
        
        return {
            isValid: tanks.length > 0 && healers.length > 0,
            warnings
        };
    },

    /**
     * 获取队伍显示信息（用于UI）
     * @param {Object} partyState - 队伍状态
     * @returns {Array} 显示信息列表
     */
    getPartyDisplayInfo(partyState) {
        return partyState.members.map(member => ({
            id: member.id,
            name: member.name,
            classId: member.classId,
            role: member.role,
            roleLabel: this._getRoleLabel(member.role),
            slot: member.slot,
            isPlayer: member.isPlayer,
            isAI: member.isAI,
            icon: member.icon || this._getClassIcon(member.classId),
            emoji: member.emoji || '',
            hp: {
                current: member.currentHp,
                max: member.maxHp,
                percent: Math.round((member.currentHp / member.maxHp) * 100)
            },
            resource: member.resource || null,
            buffs: member.buffs || [],
            debuffs: member.debuffs || []
        }));
    },

    /**
     * 获取角色定位标签
     * @private
     */
    _getRoleLabel(role) {
        const labels = {
            tank: '坦克',
            melee_dps: '近战',
            ranged_dps: '远程',
            healer: '治疗'
        };
        return labels[role] || role;
    },

    /**
     * 获取职业图标路径
     * @private
     */
    _getClassIcon(classId) {
        if (!classId) return '';
        return `/icons/classes/${classId}.png`;
    },

    /**
     * 联机模式：根据真人玩家列表 + AI 补位生成完整队伍
     * @param {Array} humanPlayers - 真人玩家列表 [{classId, talent, level, nickname, userId, snapshot, ...}]
     * @param {string} dungeonId - 副本ID（用于获取推荐等级）
     * @param {Object} [dungeonMeta] - 副本元数据（含 levelRange）
     * @returns {Object} { members, composition }
     */
    generateMultiplayerParty(humanPlayers, dungeonId, dungeonMeta = null) {
        const dungeonMinLevel = dungeonMeta?.levelRange?.min || 1;
        const template = [...this.PARTY_ROLE_TEMPLATE];
        const occupiedSlots = [];
        const members = [];
        const usedRoles = { tank: 0, healer: 0, melee_dps: 0, ranged_dps: 0 };

        // 1. 将真人玩家按 role 分配到对应槽位
        for (const hp of humanPlayers) {
            const role = hp.role || this.determineRole(hp.classId || 'warrior', hp.talent || null);
            const slot = this.determineSlot(role, occupiedSlots);
            occupiedSlots.push(slot);

            // 从模板中移除已占用的槽位
            const templateIdx = template.findIndex(t => t.slot === slot);
            if (templateIdx !== -1) template.splice(templateIdx, 1);

            usedRoles[role] = (usedRoles[role] || 0) + 1;

            const currentHp = hp.snapshot?.currentHp ?? hp.snapshot?.currentHealth ?? (100 + (hp.level || 1) * 20);
            const maxHp = hp.snapshot?.maxHp ?? hp.snapshot?.maxHealth ?? (100 + (hp.level || 1) * 20);

            members.push({
                id: `human_${hp.userId}`,
                name: hp.nickname || `Player_${hp.userId}`,
                classId: hp.classId || 'warrior',
                primaryTalent: hp.talent || null,
                role,
                slot,
                level: hp.level || 1,
                isPlayer: true,
                isAI: false,
                isOnline: true,
                ownerId: hp.userId,
                icon: this._getClassIcon(hp.classId || 'warrior'),
                emoji: '',
                currentHp,
                maxHp,
                ...(hp.snapshot?.stats ? { stats: hp.snapshot.stats } : {}),
                ...(hp.snapshot?.skills ? { skills: hp.snapshot.skills } : {}),
                ...(hp.snapshot?.equipment ? { equipment: hp.snapshot.equipment } : {}),
                ...(hp.snapshot?.talents ? { talents: hp.snapshot.talents } : {}),
                ...(hp.snapshot?.resource ? { resource: hp.snapshot.resource } : {}),
            });
        }

        // 2. 空余槽位用 AI 补位
        const usedClasses = new Set(members.map(m => m.classId));
        for (const remaining of template) {
            const pool = this.ROLE_CLASS_POOL[remaining.role] || [];
            const chosen = this._pickRandomFromPool(pool, usedClasses, null, null);
            usedClasses.add(chosen.classId);

            const aiId = `ai_${chosen.classId}_${remaining.slot}`;
            members.push({
                id: aiId,
                name: chosen.name,
                classId: chosen.classId,
                primaryTalent: chosen.talent,
                role: remaining.role,
                slot: remaining.slot,
                isPlayer: false,
                isAI: true,
                isOnline: true,
                ownerId: null,
                icon: this._getClassIcon(chosen.classId),
                emoji: this._getClassIcon(chosen.classId) ? '' : '❓',
                ...this._createAIStats(chosen.classId, dungeonMinLevel),
            });

            usedRoles[remaining.role] = (usedRoles[remaining.role] || 0) + 1;
        }

        // 按 slot 排序
        members.sort((a, b) => a.slot - b.slot);

        return {
            members,
            composition: { ...usedRoles },
            humanCount: humanPlayers.length,
            aiCount: members.filter(m => m.isAI).length,
        };
    },
    /**
     * 集合石客户端：将服务端下发的队伍快照数组转换为战斗用 party 数组
     * 服务端快照包含完整的角色属性、技能、装备等数据
     * 
     * @param {Array} snapshots - 服务端下发的队伍快照数组
     *   每个元素: { id, name, classId, role, slot, level, isPlayer, isAI, ownerId,
     *              currentHp, maxHp, stats, skills, resource, primaryTalent, ... }
     * @param {string} currentUserId - 当前客户端用户ID（用于标记 isPlayer）
     * @returns {Array} 战斗用 party 成员数组
     */
    createDungeonPartyFromSnapshots(snapshots, currentUserId) {
        if (!snapshots || !Array.isArray(snapshots) || snapshots.length === 0) {
            console.error('[PartyFormation] createDungeonPartyFromSnapshots: 无效快照数据');
            return [];
        }

        const party = snapshots.map(snapshot => {
            const currentHp = snapshot.currentHp ?? snapshot.currentHealth ?? 100;
            const maxHp = snapshot.maxHp ?? snapshot.maxHealth ?? 100;
            const classId = snapshot.classId || 'warrior';
            
            // 确定该成员对于当前客户端是否是"自己的角色"
            // 注意：在多人模式 autoPlayMode 下，isPlayer 仅影响 UI 高亮，不影响操作
            // 所有角色都由 AI 控制
            const isCurrentUser = String(snapshot.ownerId) === String(currentUserId);
            
            const member = {
                id: snapshot.id,
                name: snapshot.name || `角色_${snapshot.id}`,
                classId,
                primaryTalent: snapshot.primaryTalent || null,
                role: snapshot.role || this.determineRole(classId, snapshot.primaryTalent),
                slot: snapshot.slot || 1,
                level: snapshot.level || 1,
                isPlayer: isCurrentUser,  // 当前用户的角色标记为 isPlayer
                isAI: snapshot.isAI !== undefined ? snapshot.isAI : !isCurrentUser,
                isOnline: snapshot.isOnline !== undefined ? snapshot.isOnline : true,
                ownerId: snapshot.ownerId || null,
                icon: snapshot.icon || this._getClassIcon(classId),
                emoji: snapshot.emoji || '',
                currentHp,
                maxHp,
                stats: snapshot.stats || {},
                skills: snapshot.skills || [],
                skillCooldowns: {},
                buffs: [],
                debuffs: [],
                effects: [],
                shields: [],
            };

            // 资源系统（法力/能量/怒气）
            if (snapshot.resource) {
                member.resource = { ...snapshot.resource };
            } else {
                const classData = GameData?.classes?.[classId];
                const resType = classData?.resourceType || 'mana';
                const maxRes = resType === 'energy' ? 100 : (resType === 'rage' ? 100 : (snapshot.stats?.mana || 50));
                member.resource = {
                    type: resType,
                    current: resType === 'rage' ? 0 : maxRes,
                    max: maxRes
                };
            }

            // 盗贼连击点
            if (classId === 'rogue') {
                member.comboPoints = snapshot.comboPoints || { current: 0, max: 5 };
            }

            // 装备属性（如果快照中包含）
            if (snapshot.equipment) {
                member.equipment = snapshot.equipment;
            }

            return member;
        });

        // 按 slot 排序
        party.sort((a, b) => a.slot - b.slot);

        console.log(`[PartyFormation] 从快照构建队伍: ${party.length} 人`);
        party.forEach(m => {
            console.log(`  - ${m.name}: id=${m.id}, role=${m.role}, slot=${m.slot}, isPlayer=${m.isPlayer}, ownerId=${m.ownerId}`);
        });

        return party;
    },
};

// 导出到全局
