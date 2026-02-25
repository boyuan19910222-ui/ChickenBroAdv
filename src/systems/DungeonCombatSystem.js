/**
 * 副本战斗系统 - 集成所有战斗子系统的核心管理器
 * 
 * 整合以下系统：
 * - PositioningSystem: 站位管理
 * - TurnOrderSystem: 回合顺序
 * - ActionPointSystem: 行动点
 * - ThreatSystem: 仇恨
 * - BossPhaseSystem: BOSS阶段
 * - PetCombatSystem: 宠物
 * - PartyFormationSystem: 队伍编成
 * - EffectSystem: 统一效果处理
 */
import { EffectSystem } from './EffectSystem.js'
import { PetCombatSystem } from './PetCombatSystem.js'
import { AIDecisionSystem } from '../ai/AIDecisionSystem.js'
import { SkillExecutor } from '../ai/SkillExecutor.js'
import { ContextBuilder } from '../ai/ContextBuilder.js'
import { ClassMechanics } from '../data/ClassMechanics.js'
import { EquipmentSystem } from './EquipmentSystem.js'
import { GameData } from '../data/GameData.js'
import { DungeonData } from '../data/dungeons/WailingCaverns.js'
import { DungeonRegistry } from '../data/dungeons/DungeonRegistry.js'
import { random, randomInt, shuffle } from '../core/RandomProvider.js'

export class DungeonCombatSystem {
    constructor() {
        this.engine = null;
        this.inDungeonCombat = false;
        
        // 战斗状态
        this.battlefield = null;
        this.turnState = null;
        this.threatState = null;
        this.bossState = null;
        this.bossStates = null;  // Map<bossId, bossState> for dual-boss support
        this.petState = null;
        this.partyState = null;
        this.actionPointStates = {};
        
        // 当前副本
        this.currentDungeon = null;
        this.currentEncounter = null;
        this.encounterIndex = 0;
        
        // 当前行动单位
        this.currentActingUnit = null;
        
        // 战斗日志
        this.combatLog = [];
        
        // UI状态
        this.selectedTarget = null;
        this.selectedSkill = null;
        
        // 等待玩家输入标志
        this.waitingForPlayerInput = false;
        
        // 规划阶段状态
        this.planningPhase = false;          // 是否处于规划阶段
        this.plannedAction = null;           // 玩家预设的行动 { type, targetId, skillId }
        this.executingSequence = false;      // 是否正在执行结算序列
        this.encounterVictory = false;       // 遭遇战胜利标记（阻止后续回合处理）
        this.encounterDefeated = false;      // 遭遇战失败标记（防重入）
        
        // 全自动战斗模式（集合石多人模式）
        this.autoPlayMode = false;           // 启用后所有角色由AI自动决策
        
        // 战斗循环中止控制
        this._aborted = false;               // 中止标志，true 时所有延迟回调不再执行
        this._pendingTimers = [];             // 保存所有 setTimeout handle，用于集中清除
    }

    /**
     * 包装 setTimeout，自动注册到 _pendingTimers 并在回调前检查 _aborted
     * @param {Function} fn - 回调
     * @param {number} delay - 延迟毫秒数
     * @returns {number} timer handle
     */
    _setTimeout(fn, delay) {
        const handle = setTimeout(() => {
            this._pendingTimers = this._pendingTimers.filter(h => h !== handle);
            if (this._aborted) return;
            fn();
        }, delay);
        this._pendingTimers.push(handle);
        return handle;
    }

    /**
     * 中止战斗循环：清除所有 pending setTimeout，设置中止标志
     * 在退出副本或多人模式清理时调用
     */
    abortBattle() {
        this._aborted = true;
        this.inDungeonCombat = false;
        for (const handle of this._pendingTimers) {
            clearTimeout(handle);
        }
        this._pendingTimers = [];
        console.log('[DungeonCombatSystem] 战斗循环已中止');
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
        this.engine.eventBus.on('dungeon:start', (dungeonId) => {
            this.startDungeon(dungeonId);
        });

        this.engine.eventBus.on('dungeon:playerAction', (action) => {
            this.handlePlayerAction(action);
        });

        // 玩家确认规划，开始结算
        this.engine.eventBus.on('dungeon:startExecution', () => {
            this.startExecution();
        });

        this.engine.eventBus.on('dungeon:selectTarget', (targetId) => {
            this.selectTarget(targetId);
        });

        this.engine.eventBus.on('dungeon:selectSkill', (skillId) => {
            this.selectSkill(skillId);
        });
    }

    // ==================== 副本流程 ====================

    /**
     * 开始副本
     * @param {string} dungeonId - 副本ID
     */
    async startDungeon(dungeonId) {
        let dungeonData = DungeonData?.[dungeonId];
        
        // 如果 DungeonData 中没有，尝试通过 DungeonRegistry 动态加载
        if (!dungeonData && DungeonRegistry) {
            const registry = DungeonRegistry;
            let entry = registry[dungeonId];
            
            // 检查是否是 multi-wing 的翼/层 ID
            if (!entry) {
                for (const dungeon of Object.values(registry)) {
                    if (dungeon.type === 'multi-wing' && dungeon.wings) {
                        const wing = dungeon.wings.find(w => w.id === dungeonId);
                        if (wing) {
                            entry = wing;
                            break;
                        }
                    }
                }
            }
            
            if (entry?.dataModule) {
                try {
                    const module = await entry.dataModule();
                    console.log('[DungeonCombat] 动态加载模块:', dungeonId, 'module keys:', Object.keys(module));
                    // 模块可能导出默认或命名的副本数据
                    dungeonData = module.default || Object.values(module).find(v => v?.id && v?.encounters);
                    console.log('[DungeonCombat] 加载的副本数据:', dungeonData?.id, dungeonData?.name, 'encounters:', dungeonData?.encounters?.length);
                } catch (e) {
                    console.error(`加载副本数据失败: ${dungeonId}`, e);
                    return;
                }
            }
        }
        
        if (!dungeonData) {
            console.error(`未知副本: ${dungeonId}`);
            return;
        }

        this.currentDungeon = dungeonData;
        this.encounterIndex = 0;
        
        // 创建队伍
        const player = this.engine.stateManager.get('player');
        console.log('[DungeonCombat] 原始玩家数据:', player?.id, player?.name, player?.class);
        
        // 创建玩家数据副本，确保 id 和 classId 正确设置
        // 注意：展开运算符的顺序很重要，后面的会覆盖前面的
        const playerForParty = {
            ...player,                  // 先展开原始玩家数据
            id: 'player',               // 强制设置 id 为 'player'
            classId: player.class,      // 设置 classId
        };
        
        this.partyState = PartyFormationSystem.createDungeonParty(playerForParty, this.currentDungeon);
        
        // 调试：检查队伍成员的 isPlayer 状态
        console.log('[DungeonCombat] 队伍成员:');
        this.partyState.members.forEach(m => {
            console.log(`  - ${m.name}: id=${m.id}, isPlayer=${m.isPlayer}, isAI=${m.isAI}, slot=${m.slot}`);
        });

        this.addLog(`📍 进入副本：${dungeonData.name}`, 'system');
        this.addLog(`👥 队伍组建完成，共${this.partyState.members.length}名成员`, 'system');

        // 开始第一场遭遇战
        this.startNextEncounter();
    }

    /**
     * 多人模式启动副本（集合石）
     * 接受外部注入的队伍和副本数据，设置 autoPlayMode = true，跳过 stateManager 队伍构建
     * @param {string} dungeonId - 副本ID
     * @param {Array} party - 已构建好的战斗队伍数组（来自 PartyFormationSystem.createDungeonPartyFromSnapshots）
     */
    async startDungeonMultiplayer(dungeonId, party) {
        let dungeonData = DungeonData?.[dungeonId];
        
        // 如果 DungeonData 中没有，尝试通过 DungeonRegistry 动态加载
        if (!dungeonData && DungeonRegistry) {
            const registry = DungeonRegistry;
            let entry = registry[dungeonId];
            
            if (!entry) {
                for (const dungeon of Object.values(registry)) {
                    if (dungeon.type === 'multi-wing' && dungeon.wings) {
                        const wing = dungeon.wings.find(w => w.id === dungeonId);
                        if (wing) {
                            entry = wing;
                            break;
                        }
                    }
                }
            }
            
            if (entry?.dataModule) {
                try {
                    const module = await entry.dataModule();
                    dungeonData = module.default || Object.values(module).find(v => v?.id && v?.encounters);
                } catch (e) {
                    console.error(`[MultiplayerDungeon] 加载副本数据失败: ${dungeonId}`, e);
                    return;
                }
            }
        }
        
        if (!dungeonData) {
            console.error(`[MultiplayerDungeon] 未知副本: ${dungeonId}`);
            return;
        }

        // 设置全自动模式
        this.autoPlayMode = true;
        
        this.currentDungeon = dungeonData;
        this.encounterIndex = 0;
        
        // 直接使用外部注入的队伍，不从 stateManager 构建
        this.partyState = { members: party };
        
        console.log('[MultiplayerDungeon] 多人模式队伍:');
        this.partyState.members.forEach(m => {
            console.log(`  - ${m.name}: id=${m.id}, isPlayer=${m.isPlayer}, isAI=${m.isAI}, slot=${m.slot}, role=${m.role}`);
        });

        this.addLog(`📍 [集合石] 进入副本：${dungeonData.name}`, 'system');
        this.addLog(`👥 队伍组建完成，共${this.partyState.members.length}名成员`, 'system');

        // 开始第一场遭遇战
        this.startNextEncounter();
    }

    /**
     * 开始下一场遭遇战
     */
    startNextEncounter() {
        const encounters = this.currentDungeon.encounters;
        
        if (this.encounterIndex >= encounters.length) {
            this.completeDungeon();
            return;
        }

        const encounterInfo = encounters[this.encounterIndex];
        console.log('[DungeonCombat] 遭遇战信息:', encounterInfo);
        
        const encounterData = this.currentDungeon.getEncounter(encounterInfo.id);
        console.log('[DungeonCombat] 遭遇战数据:', encounterData?.id, encounterData?.name, encounterData?.enemies?.length);

        this.currentEncounter = encounterData;
        
        // 显示遭遇战过渡界面
        this.showEncounterTransition(encounterInfo, () => {
            console.log('[DungeonCombat] 过渡完成，开始遭遇战, type=', encounterInfo.type);
            if (encounterInfo.type === 'boss') {
                this.startBossEncounter(encounterData, encounterInfo.id);
            } else {
                this.startTrashEncounter(encounterData);
            }
        });
    }

    /**
     * 显示遭遇战过渡界面
     */
    showEncounterTransition(encounterInfo, callback) {
        const isBoss = encounterInfo.type === 'boss';
        const title = isBoss ? `💀 BOSS战：${encounterInfo.name}` : `⚔️ 遭遇战：${encounterInfo.name}`;
        const subtitle = isBoss ? '准备迎接强大的BOSS！' : '敌人出现了！';
        
        // 触发UI显示过渡
        this.engine.eventBus.emit('dungeon:encounterTransition', {
            title,
            subtitle,
            isBoss,
            encounterInfo
        });
        
        this.addLog(`--- ${title} ---`, 'system');
        
        // 延迟后开始战斗
        this._setTimeout(() => {
            callback();
        }, 1500);
    }

    /**
     * 开始小怪遭遇战（支持补怪至>=3只 + 随机精英怪 + 波次难度递增）
     */
    startTrashEncounter(encounterData) {
        console.log('[DungeonCombat] startTrashEncounter called, encounterData:', encounterData?.id);
        
        // 创建基础敌人实例
        let enemies = this.currentDungeon.createTrashInstance(encounterData.id);
        console.log('[DungeonCombat] createTrashInstance returned:', enemies?.length, 'enemies');
        
        if (!enemies || enemies.length === 0) {
            console.error('[DungeonCombat] 没有敌人数据，跳过遭遇战');
            this.encounterIndex++;
            this.startNextEncounter();
            return;
        }
        
        // === 需求6: 敌方数值缩放到副本推荐上限 ===
        enemies = this._scaleEnemiesToDungeonMax(enemies);
        
        // === 随机精英怪（25%概率，1~2只） ===
        const hasElite = this._rollEliteChance();
        
        // === 每波怪物数量随机 3~5 只；精英波强制满编 5 只 ===
        const targetCount = hasElite ? 5 : (3 + randomInt(0, 2));
        enemies = this._padEnemies(enemies, targetCount, encounterData);
        // 如果基础怪物超过目标数量，随机裁剪（保留前 targetCount 只）
        if (enemies.length > targetCount) {
            enemies = enemies.slice(0, targetCount);
        }
        
        // === 精英怪生成 ===
        if (hasElite) {
            enemies = this._spawnElites(enemies);
        }
        
        // === 波次难度递增 ===
        enemies = this._applyWaveDifficultyScaling(enemies);
        
        this.initializeCombat(enemies, false);
    }

    /**
     * 补怪至最少数量 - 从当前波次的怪物池中随机复制生成新怪
     * @private
     */
    _padEnemies(enemies, minCount, encounterData) {
        if (enemies.length >= minCount) return enemies;
        
        const result = [...enemies];
        const usedSlots = new Set(result.map(e => e.slot));
        let nextSlot = Math.max(...usedSlots, 0) + 1;
        let padIndex = 0;
        
        while (result.length < minCount) {
            // 从已有怪物中随机选一个作为模板
            const template = enemies[padIndex % enemies.length];
            const newEnemy = { ...template };
            newEnemy.id = `${template.id}_pad_${padIndex}`;
            newEnemy.slot = nextSlot++;
            // 深拷贝 skills
            newEnemy.skills = template.skills ? template.skills.map(s => ({ ...s })) : [];
            // 略微随机化属性（±10%）
            const variance = 0.9 + random() * 0.2;
            newEnemy.maxHp = newEnemy.currentHp;
            newEnemy.damage = Math.round(newEnemy.damage * variance);
            
            result.push(newEnemy);
            padIndex++;
        }
        
        return result;
    }

    /**
     * 判定本波是否刷新精英怪（25%概率）
     * @returns {boolean}
     * @private
     */
    _rollEliteChance() {
        return random() < 0.25;
    }

    /**
     * 生成精英怪：将1~2只普通怪升级为精英
     * 精英系数：HP ×2.5, 伤害 ×1.8, 护甲 ×1.5, 经验 ×2
     * @private
     */
    _spawnElites(enemies) {
        const eliteCount = random() < 0.6 ? 1 : 2;
        const nonBoss = enemies.filter(e => !e.isBoss && !e.isElite);
        if (nonBoss.length === 0) return enemies;
        
        // 随机选择要升级的怪物
        const shuffled = shuffle([...nonBoss]);
        const toUpgrade = shuffled.slice(0, Math.min(eliteCount, shuffled.length));
        
        for (const target of toUpgrade) {
            const idx = enemies.findIndex(e => e.id === target.id);
            if (idx === -1) continue;
            enemies[idx] = this._upgradeToElite(enemies[idx]);
        }
        
        this.addLog(`⭐ 精英怪出现了！满编5只敌人迎战！`, 'system');
        return enemies;
    }

    /**
     * 将普通怪升级为精英怪
     * @private
     */
    _upgradeToElite(enemy) {
        const eliteHp = Math.round(enemy.maxHp * 2.5);
        return {
            ...enemy,
            id: `elite_${enemy.id}`,
            name: `精英${enemy.name}`,
            isElite: true,
            currentHp: eliteHp,
            maxHp: eliteHp,
            damage: Math.round(enemy.damage * 1.8),
            armor: Math.round((enemy.armor || 0) * 1.5),
            speed: Math.round((enemy.speed || 50) * 0.9),
            loot: {
                ...enemy.loot,
                exp: Math.round((enemy.loot?.exp || 10) * 2)
            },
            skills: enemy.skills ? enemy.skills.map(s => ({
                ...s,
                damage: typeof s.damage === 'number' ? Math.round(s.damage * 1.5) : s.damage
            })) : [],
            emoji: '⭐' + (enemy.emoji || '👹'),
        };
    }

    /**
     * 波次难度递增：每波次 +5% 属性
     * @private
     */
    _applyWaveDifficultyScaling(enemies) {
        const waveBonus = 1 + this.encounterIndex * 0.05;
        if (waveBonus <= 1.0) return enemies;
        
        return enemies.map(e => ({
            ...e,
            currentHp: Math.round(e.currentHp * waveBonus),
            maxHp: Math.round(e.maxHp * waveBonus),
            damage: Math.round(e.damage * waveBonus),
            armor: Math.round((e.armor || 0) * waveBonus),
        }));
    }

    /**
     * 将敌方单位缩放到副本推荐等级上限
     * 假设副本数据中的硬编码数值对应副本下限等级
     * 缩放公式：stat = base × (1 + (maxLevel - minLevel) × 0.04)
     * @private
     */
    _scaleEnemiesToDungeonMax(enemies) {
        const levelRange = this.currentDungeon?.levelRange;
        if (!levelRange) return enemies;
        
        const { min, max } = levelRange;
        const levelDiff = max - min;
        if (levelDiff <= 0) return enemies;
        
        // 每个等级差增加 4% 属性，副本上限相对下限的倍率
        const scaleFactor = 1 + levelDiff * 0.04;
        const maxLevel = max;
        
        return enemies.map(e => {
            const scaledHp = Math.round(e.maxHp * scaleFactor);
            return {
                ...e,
                level: maxLevel,
                currentHp: scaledHp,
                maxHp: scaledHp,
                damage: Math.round(e.damage * scaleFactor),
                armor: Math.round((e.armor || 0) * scaleFactor),
            };
        });
    }

    /**
     * 开始BOSS遭遇战
     */
    startBossEncounter(bossConfig, encounterId) {
        // 创建BOSS实例（用 encounter key 而非 boss 内部 id）
        const boss = this.currentDungeon.createBossInstance(encounterId || bossConfig.id);
        
        if (!boss) {
            console.error('[DungeonCombat] Failed to create boss instance for:', encounterId, bossConfig.id);
            this.addLog(`❌ BOSS 加载失败`, 'system');
            return;
        }
        
        // 创建BOSS状态（支持双BOSS配置）
        this.bossState = BossPhaseSystem.createBossState(bossConfig);
        this.bossStates = new Map();
        
        const enemies = [boss];
        
        // 检查是否是双BOSS战（bossConfig 中定义了 dualBoss / secondBoss）
        if (bossConfig.dualBoss) {
            const secondBossConf = bossConfig.dualBoss;
            const secondBoss = {
                id: secondBossConf.id || `${bossConfig.id}_partner`,
                name: secondBossConf.name,
                emoji: secondBossConf.emoji || '💀',
                type: 'boss',
                currentHp: secondBossConf.baseStats.hp,
                maxHp: secondBossConf.baseStats.hp,
                damage: secondBossConf.baseStats.damage || 30,
                slot: secondBossConf.slot || 4,
                level: secondBossConf.baseStats.level || bossConfig.baseStats?.level || 40,
                skills: secondBossConf.skills || {},
                isBoss: true
            };
            enemies.push(secondBoss);
            
            // 为两个BOSS各自创建独立的 bossState
            this.bossStates.set(boss.id, this.bossState);
            const secondState = BossPhaseSystem.createBossState(secondBossConf);
            this.bossStates.set(secondBoss.id, secondState);
        } else {
            this.bossStates.set(boss.id, this.bossState);
        }
        
        // === 需求6: BOSS也做等级缩放到副本上限 ===
        const scaledEnemies = this._scaleEnemiesToDungeonMax(enemies);
        
        this.initializeCombat(scaledEnemies, true);
        
        this.addLog(`💀 BOSS战开始：${boss.name}`, 'system');
    }

    /**
     * 初始化战斗
     */
    initializeCombat(enemies, isBossFight) {
        this._aborted = false;  // 重置中止标志
        this.inDungeonCombat = true;
        this.currentEncounterEnemies = enemies; // 保存敌人列表用于经验计算
        
        // 创建战场
        this.battlefield = PositioningSystem.createBattlefield();
        
        // 放置我方单位
        // 注意：玩家角色使用 currentHealth/maxHealth，AI 使用 currentHp/maxHp，需要统一
        this.partyState.members.forEach(member => {
            const currentHp = member.currentHp ?? member.currentHealth ?? 100;
            const maxHp = member.maxHp ?? member.maxHealth ?? 100;
            
            PositioningSystem.placeUnit(this.battlefield, 'player', member.slot, {
                id: member.id,
                name: member.name,
                currentHp: currentHp,
                maxHp: maxHp,
                icon: member.icon || '',
                emoji: member.emoji
            });
        });
        
        // 放置敌方单位
        enemies.forEach(enemy => {
            PositioningSystem.placeUnit(this.battlefield, 'enemy', enemy.slot, {
                id: enemy.id,
                name: enemy.name,
                currentHp: enemy.currentHp,
                maxHp: enemy.maxHp,
                icon: enemy.icon || '',
                emoji: enemy.emoji,
                type: enemy.type,
                speed: enemy.speed,
                damage: enemy.damage,
                armor: enemy.armor,
                skills: enemy.skills
            });
        });
        
        // 创建仇恨系统
        this.threatState = ThreatSystem.createThreatState();
        enemies.forEach(enemy => {
            const playerIds = this.partyState.members.map(m => m.id);
            ThreatSystem.initializeEnemyThreat(this.threatState, enemy.id, playerIds);
        });
        
        // 给坦克初始仇恨加成，让敌人优先攻击坦克
        const tanks = this.partyState.members.filter(m => m.role === 'tank' && m.currentHp > 0);
        if (tanks.length > 0) {
            enemies.forEach(enemy => {
                tanks.forEach(tank => {
                    ThreatSystem.addDamageThreat(this.threatState, enemy.id, tank.id, 50, 'initial_threat');
                });
            });
        }
        
        // 创建宠物系统
        this.petState = PetCombatSystem.createPetState(this.partyState.members);
        
        // 从 player.activePet 带入野外已召唤的宠物（跨系统持久化）
        const player = this.engine.stateManager.get('player');
        if (player?.activePet && player.activePet.isAlive) {
            const playerMember = this.partyState.members.find(m => m.isPlayer);
            if (playerMember) {
                const pet = { ...player.activePet, ownerId: playerMember.id, currentTarget: null };
                pet.id = `pet_${playerMember.id}`;
                this.petState.pets[pet.id] = pet;
                this.petState.ownerPetMap[playerMember.id] = pet.id;
                this.addLog(`${pet.emoji} ${pet.displayName} 跟随进入副本！`, 'system');
            }
        }
        
        // 初始化行动点
        this.actionPointStates = {};
        this.partyState.members.forEach(member => {
            this.actionPointStates[member.id] = ActionPointSystem.createActionPointState(member.id);
        });
        
        // 创建回合顺序
        // 注意：玩家角色使用 currentHealth/maxHealth，AI 使用 currentHp/maxHp，需要统一
        const playerUnits = this.partyState.members.map(m => {
            // 统一使用 currentHp，兼容两种字段名
            const currentHp = m.currentHp ?? m.currentHealth ?? 100;
            const maxHp = m.maxHp ?? m.maxHealth ?? 100;
            
            return {
                unit: { 
                    id: m.id, 
                    name: m.name, 
                    currentHp: currentHp,
                    maxHp: maxHp,
                    icon: m.icon || '',
                    emoji: m.emoji, 
                    classId: m.classId,
                    isPlayer: m.isPlayer === true,
                    role: m.role
                },
                slot: m.slot
            };
        });
        
        console.log('[DungeonCombat] 创建回合顺序，玩家单位:');
        playerUnits.forEach(pu => {
            console.log(`  - ${pu.unit.name}: id=${pu.unit.id}, hp=${pu.unit.currentHp}/${pu.unit.maxHp}, class=${pu.unit.classId}`);
        });
        
        const enemyUnits = enemies.map(e => ({
            unit: e,
            slot: e.slot
        }));
        
        this.turnState = TurnOrderSystem.createTurnState();
        TurnOrderSystem.startNewRound(this.turnState, playerUnits, enemyUnits);
        
        // 检查惊喜机制
        const surpriseMsg = TurnOrderSystem.getSurpriseMessage(this.turnState);
        if (surpriseMsg) {
            this.addLog(surpriseMsg, 'system');
        }
        
        // 保存战斗状态
        this.saveCombatState();
        
        // 触发UI更新
        this.engine.eventBus.emit('dungeon:combatStart', this.getCombatDisplayState());
        
        // 进入规划阶段，等待玩家部署行动
        this.enterPlanningPhase();
    }

    // ==================== 回合处理 ====================

    /**
     * 处理下一个回合
     */
    processNextTurn() {
        if (!this.inDungeonCombat || this.encounterVictory) return;

        // 检查回合是否结束
        if (this.turnState.roundComplete) {
            this.startNewRound();
            return;
        }

        const currentUnit = TurnOrderSystem.getCurrentUnit(this.turnState);
        if (!currentUnit) {
            this.startNewRound();
            return;
        }

        this.addLog(`--- ${currentUnit.unit.name} 的回合 ---`, 'system', currentUnit.side === 'player' ? this._getUnitClassColor(currentUnit.unit) : null);

        if (currentUnit.side === 'player') {
            // 玩家方单位，等待玩家操作
            this.waitingForPlayerInput = true;
            this.handlePlayerTurn(currentUnit);
        } else {
            // 敌方单位，AI行动
            this.waitingForPlayerInput = false;
            this.handleEnemyTurn(currentUnit);
        }
    }

    /**
     * 开始新回合
     */
    startNewRound() {
        // 回合结束结算：DOT/HOT/buff/debuff duration 递减
        this._processRoundEndEffects();

        // 更新嘲讽持续时间
        ThreatSystem.updateTauntDuration(this.threatState);
        
        // BOSS回合开始处理（支持双BOSS）
        const allBossStates = this.bossStates?.size > 0 
            ? [...this.bossStates.values()] 
            : (this.bossState ? [this.bossState] : []);
        for (const bs of allBossStates) {
            const { events } = BossPhaseSystem.onRoundStart(bs);
            events.forEach(event => {
                if (event.type === 'enrage') {
                    this.addLog(event.message, 'system');
                }
            });
            
            // 狂暴AOE
            const aoe = BossPhaseSystem.getEnrageAoe(bs);
            if (aoe) {
                this.applyEnrageAoe(aoe);
            }
        }
        
        // 重新计算回合顺序
        const alivePlayerUnits = this.partyState.members
            .filter(m => m.currentHp > 0)
            .map(m => ({
                unit: { id: m.id, name: m.name, currentHp: m.currentHp, icon: m.icon || '', emoji: m.emoji, classId: m.classId, isPlayer: m.isPlayer === true, role: m.role },
                slot: m.slot
            }));
        
        const aliveEnemyUnits = PositioningSystem.getAliveUnits(this.battlefield, 'enemy')
            .map(pos => ({
                unit: pos.unit,
                slot: pos.slot
            }));
        
        TurnOrderSystem.startNewRound(this.turnState, alivePlayerUnits, aliveEnemyUnits);
        
        // 重置玩家行动点
        this.partyState.members.forEach(member => {
            if (this.actionPointStates[member.id]) {
                ActionPointSystem.resetPoints(this.actionPointStates[member.id]);
            }
        });
        
        // 回合开始资源恢复（能量/法力等）
        this.regenerateResources();
        
        this.addLog(`=== 第 ${this.turnState.currentRound} 回合 ===`, 'system');
        
        // 显示惊喜消息
        const surpriseMsg = TurnOrderSystem.getSurpriseMessage(this.turnState);
        if (surpriseMsg) {
            this.addLog(surpriseMsg, 'system');
        }
        
        this.saveCombatState();
        
        // 回合结束结算后更新 UI（DOT/HOT/buff/debuff 变化需要反映到界面）
        this.engine.eventBus.emit('dungeon:combatUpdate', this.getCombatDisplayState());
        
        // 进入规划阶段，等待玩家部署行动
        this.enterPlanningPhase();
    }

    // ==================== 规划阶段 ====================

    /**
     * 进入规划阶段 — 暂停战斗，等待玩家部署行动
     */
    enterPlanningPhase() {
        // autoPlayMode（集合石多人模式）：跳过规划阶段，直接自动结算
        if (this.autoPlayMode) {
            this.planningPhase = false;
            this.executingSequence = true;
            this.plannedAction = null;
            this.waitingForPlayerInput = false;
            this.currentActingUnit = null;

            this.engine.eventBus.emit('dungeon:executionStart', {
                turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState),
                autoMode: true
            });

            this.processNextTurn();
            return;
        }

        // 找到玩家控制的角色
        const playerMember = this.partyState.members.find(m => m.isPlayer && m.currentHp > 0);

        // 玩家角色已阵亡 — 跳过规划阶段，直接自动结算
        if (!playerMember) {
            this.planningPhase = false;
            this.executingSequence = true;
            this.plannedAction = null;
            this.waitingForPlayerInput = false;
            this.currentActingUnit = null;

            this.addLog('💀 玩家角色已阵亡，自动结算中...', 'system');

            this.engine.eventBus.emit('dungeon:executionStart', {
                turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState),
                autoMode: true
            });

            this.processNextTurn();
            return;
        }

        this.planningPhase = true;
        this.executingSequence = false;
        this.plannedAction = null;
        this.waitingForPlayerInput = true;

        this.currentActingUnit = playerMember;
        
        // 重置行动点
        if (this.actionPointStates[playerMember.id]) {
            ActionPointSystem.resetPoints(this.actionPointStates[playerMember.id]);
        }

        this.addLog('📋 规划阶段 — 请部署你的行动，然后点击"开始结算"', 'system');

        // 通知UI进入规划阶段
        this.engine.eventBus.emit('dungeon:planningPhaseStart', {
            member: playerMember,
            actionPoints: this.actionPointStates[playerMember.id],
            turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState),
            currentRound: this.turnState.currentRound
        });
    }

    /**
     * 处理玩家在规划阶段提交的行动
     */
    handlePlayerAction(action) {
        // 如果在规划阶段，存储行动而不立即执行
        if (this.planningPhase && !this.executingSequence) {
            this.setPlannedAction(action);
            return;
        }

        // 如果在结算阶段且当前是玩家回合，执行预设行动
        if (this.executingSequence) {
            this._executePlayerActionImmediate(action);
            return;
        }

        // 兼容旧逻辑（不在规划阶段时直接执行）
        this._executePlayerActionImmediate(action);
    }

    /**
     * 设置玩家预设行动（规划阶段）
     */
    setPlannedAction(action) {
        this.plannedAction = { ...action };
        
        this.addLog(`📌 已部署行动: ${this._getActionDescription(action)}`, 'system');
        
        // 通知UI行动已部署
        this.engine.eventBus.emit('dungeon:actionPlanned', {
            action: this.plannedAction,
            description: this._getActionDescription(action)
        });
    }

    /**
     * 获取行动描述文本
     */
    _getActionDescription(action) {
        if (action.type === 'attack') {
            const target = this.battlefield.enemy.find(p => p.unitId === action.targetId)?.unit;
            return `⚔️ 攻击 ${target?.name || '未知目标'}`;
        } else if (action.type === 'skill') {
            const skill = GameData?.skills?.[action.skillId];
            const target = this.battlefield.enemy.find(p => p.unitId === action.targetId)?.unit;
            return `⚡ ${skill?.name || '技能'} → ${target?.name || '未知目标'}`;
        } else if (action.type === 'defend') {
            return '🛡️ 防御';
        }
        return '未知行动';
    }

    /**
     * 开始结算序列 — 玩家点击"开始结算"后调用
     */
    startExecution() {
        if (!this.planningPhase) return;

        // 检查玩家是否已部署行动
        if (!this.plannedAction) {
            this.addLog('⚠️ 请先部署你的行动！', 'system');
            return;
        }

        this.planningPhase = false;
        this.executingSequence = true;
        this.waitingForPlayerInput = false;
        this.currentActingUnit = null;

        this.addLog('⚡ 开始结算！', 'system');

        // 通知UI退出规划阶段，进入结算
        this.engine.eventBus.emit('dungeon:executionStart', {
            turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState)
        });

        // 开始按 turnOrder 顺序执行
        this.processNextTurn();
    }

    // ==================== 回合处理 ====================

    /**
     * 处理玩家回合
     * 只有玩家本人需要等待输入，AI队友自动行动
     */
    handlePlayerTurn(turnEntry) {
        const member = this.partyState.members.find(m => m.id === turnEntry.unitId);
        
        if (!member || member.currentHp <= 0) {
            // 单位已死亡，跳过回合
            this.endCurrentUnitTurn();
            return;
        }
        
        // 检查是否被 CC 控制（眩晕、恐惧等），被控制时无法行动
        if (EffectSystem.isUnitCCed(member)) {
            const ccType = EffectSystem.getCCType(member);
            
            // charm（魅惑）：被控队友攻击随机队友
            if (ccType === 'charm') {
                this.addLog(`💜 ${member.name} 被魅惑，攻击了队友！`, 'system', this._getUnitClassColor(member));
                this._executeCharmAttack(member, 'player');
                this.endCurrentUnitTurn();
                return;
            }
            
            const ccText = ccType === 'stun' ? '眩晕' : ccType === 'fear' ? '恐惧' : '控制';
            this.addLog(`${member.name} 被${ccText}，无法行动！`, 'system', this._getUnitClassColor(member));
            this.endCurrentUnitTurn();
            return;
        }
        
        // 标记当前行动单位
        this.currentActingUnit = member;
        
        // 重置行动点
        if (this.actionPointStates[member.id]) {
            ActionPointSystem.resetPoints(this.actionPointStates[member.id]);
        }
        
        // 高亮当前行动单位
        this.engine.eventBus.emit('dungeon:highlightUnit', {
            unitId: member.id,
            side: 'player'
        });
        
        // 判断是玩家控制还是AI控制
        // 使用 isPlayer === true 明确判断，避免 undefined 导致的问题
        // autoPlayMode 时所有角色（含玩家角色）由AI自动决策
        const isPlayerControlled = member.isPlayer === true && !this.autoPlayMode;
        
        console.log(`[DungeonCombat] 回合: ${member.name}, isPlayer=${member.isPlayer}, isAI=${member.isAI}, autoPlayMode=${this.autoPlayMode}, id=${member.id}`);
        
        if (!isPlayerControlled) {
            // AI队友自动行动（或 autoPlayMode 下的玩家角色）
            this.addLog(`🤖 ${member.name} (AI) 行动中...`, 'system', this._getUnitClassColor(member));
            this.waitingForPlayerInput = false;
            this.processAIAllyTurn(member);
        } else {
            // 玩家控制的角色
            if (this.executingSequence && this.plannedAction) {
                // 结算阶段：自动执行预设行动
                this.waitingForPlayerInput = false;
                
                this.engine.eventBus.emit('dungeon:playerTurnStart', {
                    member,
                    actionPoints: this.actionPointStates[member.id],
                    turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState),
                    isPlayerUnit: true,
                    isExecuting: true
                });
                
                this.addLog(`🎮 ${member.name} 执行预设行动...`, 'system', this._getUnitClassColor(member));
                
                // 高亮目标（含 cleave_3 溅射目标）
                if (this.plannedAction.targetId) {
                    const targetingData = {
                        attackerId: member.id,
                        attackerSide: 'player',
                        targetId: this.plannedAction.targetId,
                        targetSide: 'enemy'
                    };
                    // cleave_3 技能：额外发送溅射目标
                    if (this.plannedAction.skillId) {
                        const skill = GameData?.skills?.[this.plannedAction.skillId];
                        if (skill && skill.targetType === 'cleave_3') {
                            const { splash } = PositioningSystem.getAdjacentTargets(this.battlefield, 'enemy', this.plannedAction.targetId);
                            targetingData.splashTargetIds = splash.map(u => u.id);
                        }
                    }
                    this.engine.eventBus.emit('dungeon:unitTargeting', targetingData);
                }
                
                // 延迟执行预设行动，让玩家看到高亮
                this._setTimeout(() => {
                    this._executePlayerActionImmediate({
                        ...this.plannedAction,
                        autoEndTurn: true
                    });
                }, 1500);
            } else if (this.executingSequence && !this.plannedAction) {
                // 自动结算模式（玩家角色阵亡后无预设行动），跳过回合
                this.waitingForPlayerInput = false;
                this.addLog(`⏭️ ${member.name} 无预设行动，跳过回合`, 'system');
                this._setTimeout(() => {
                    this.endCurrentUnitTurn();
                }, 500);
            } else {
                // 非结算阶段（兜底）
                this.waitingForPlayerInput = true;
                
                this.engine.eventBus.emit('dungeon:playerTurnStart', {
                    member,
                    actionPoints: this.actionPointStates[member.id],
                    turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState),
                    isPlayerUnit: true
                });
                
                this.addLog(`🎮 轮到 ${member.name} 行动！`, 'system', this._getUnitClassColor(member));
            }
        }
    }

    /**
     * 处理AI队友回合 — 使用 AIDecisionSystem 行为树驱动
     */
    processAIAllyTurn(member) {
        // 触发UI更新，显示AI正在行动
        this.engine.eventBus.emit('dungeon:aiTurnStart', {
            member,
            isAI: true
        });

        // 构建战斗状态
        const battleState = this._buildBattleState('dungeon');
        // 给 AI 用的 partyMembers / enemies 辅助查找
        battleState.partyMembers = this.partyState.members;
        battleState.enemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(e => e.unit);

        // AI 做决策
        const decision = AIDecisionSystem.decideAction(member, battleState);

        if (decision) {
            // 解析技能和目标
            const skill = this._resolveAISkill(decision.skillId, member, battleState);
            const targets = this._resolveAITargets(decision.targetIds);

            // 预高亮目标
            if (targets.length > 0) {
                const firstTarget = targets[0];
                const isAlly = this.partyState.members.some(m => m.id === firstTarget.id);
                const targetingData = {
                    attackerId: member.id, attackerSide: 'player',
                    targetId: firstTarget.id, targetSide: isAlly ? 'player' : 'enemy'
                };
                // 多目标技能：其余目标作为溅射高亮
                if (targets.length > 1) {
                    targetingData.splashTargetIds = targets.slice(1).map(t => t.id);
                }
                this.engine.eventBus.emit('dungeon:unitTargeting', targetingData);
            }

            this._setTimeout(() => {
                if (skill && targets.length > 0) {
                    // 冷却递减
                    SkillExecutor.tickCooldowns(member);

                    // 使用 SkillExecutor 执行技能
                    const battleContext = {
                        battlefield: this.battlefield,
                        threatState: this.threatState,
                        combatType: 'dungeon'
                    };
                    const result = SkillExecutor.executeSkill(member, skill, targets, battleContext);

                    if (result.success) {
                        // 根据执行结果做 UI 更新
                        this._processAISkillResult(member, skill, targets, result);
                    } else {
                        // 执行失败，降级为基础攻击
                        this._aiBasicAttack(member);
                    }
                } else {
                    // 没有决策结果，降级为基础攻击
                    this._aiBasicAttack(member);
                }

                // 更新战斗状态
                this.saveCombatState();
                this.engine.eventBus.emit('dungeon:combatUpdate', this.getCombatDisplayState());

                this.endCurrentUnitTurn();
            }, 1500);
        } else {
            // AI 没有可用决策，延迟后执行基础攻击
            this._setTimeout(() => {
                this._aiBasicAttack(member);
                this.saveCombatState();
                this.engine.eventBus.emit('dungeon:combatUpdate', this.getCombatDisplayState());
                this.endCurrentUnitTurn();
            }, 1500);
        }
    }

    /**
     * AI 技能执行结果处理（UI更新、日志、战场状态同步）
     */
    _processAISkillResult(unit, skill, targets, result) {
        const normalizedSkill = ContextBuilder.normalizeSkill(skill);
        const skillName = normalizedSkill.name || skill.name || '技能';
        const emoji = normalizedSkill.emoji || '⚡';

        // 处理伤害结果
        for (const res of result.results) {
            if (res.type === 'damage') {
                const target = targets.find(t => t.id === res.targetId) || { name: res.targetName };
                // 同步战场状态
                this._syncUnitHp(target);
                // 仇恨
                ThreatSystem.addDamageThreat(this.threatState, target.id, unit.id, res.damage, skill.id);
                // 检查 BOSS 阶段
                if (this.bossState && target.type === 'boss') {
                    const phaseResult = BossPhaseSystem.updateHp(this.bossState, target.currentHp);
                    if (phaseResult.phaseChanged) {
                        this.addLog(`🔥 ${target.name} 进入 ${phaseResult.newPhase.name}！`, 'system');
                    }
                }
                // UI 事件
                this.engine.eventBus.emit('dungeon:damageDealt', {
                    attacker: unit, target, damage: res.damage,
                    isCrit: res.isCrit, targetHp: target.currentHp, targetMaxHp: target.maxHp
                });
            } else if (res.type === 'heal') {
                const target = targets.find(t => t.id === res.targetId) 
                    || this.partyState.members.find(m => m.id === res.targetId)
                    || { name: res.targetName };
                this._syncUnitHp(target);
                ThreatSystem.addHealingThreat(this.threatState, unit.id, res.heal);
                this.engine.eventBus.emit('dungeon:healingDone', {
                    healer: unit, target, amount: res.heal
                });
            }
        }

        // 日志
        const unitColor = this._getUnitClassColor(unit);
        if (result.totalDamage > 0 && result.totalHeal > 0) {
            this.addLog(`${emoji} ${unit.name} 使用 ${skillName}，造成 ${result.totalDamage} 点伤害并恢复 ${result.totalHeal} 点生命`, 'combat', unitColor);
        } else if (result.totalDamage > 0) {
            if (targets.length === 1) {
                this.addLog(`${emoji} ${unit.name} 使用 ${skillName} 对 ${targets[0].name} 造成 ${result.totalDamage} 点伤害`, 'combat', unitColor);
            } else {
                const names = targets.map(t => t.name).join('、');
                this.addLog(`${emoji} ${unit.name} 使用 ${skillName} 对 ${names} 造成 ${result.totalDamage} 点伤害`, 'combat', unitColor);
            }
        } else if (result.totalHeal > 0) {
            if (targets.length === 1) {
                this.addLog(`${emoji} ${unit.name} 使用 ${skillName}，为 ${targets[0].name} 恢复 ${result.totalHeal} 点生命`, 'combat', unitColor);
            } else {
                this.addLog(`${emoji} ${unit.name} 使用 ${skillName}，恢复 ${result.totalHeal} 点生命`, 'combat', unitColor);
            }
        } else {
            this.addLog(`${emoji} ${unit.name} 使用了 ${skillName}`, 'combat', unitColor);
        }

        // 连击点日志
        if (result.comboInfo?.isBuilder && result.comboInfo.comboPointsGenerated > 0) {
            this.addLog(`🗡️ ${unit.name} 获得 ${result.comboInfo.comboPointsGenerated} 个连击点`, 'system', unitColor);
        }
        if (result.comboInfo?.isFinisher && result.comboInfo.comboPointsUsed > 0) {
            this.addLog(`🗡️ ${unit.name} 消耗 ${result.comboInfo.comboPointsUsed} 连击点`, 'system', unitColor);
        }

        // 检查战斗结束
        this.checkCombatEnd();
    }

    /**
     * AI 基础攻击降级（当行为树无决策时）
     */
    _aiBasicAttack(member) {
        const enemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy');
        if (enemies.length > 0) {
            const target = enemies.sort((a, b) => a.unit.currentHp - b.unit.currentHp)[0].unit;
            this.engine.eventBus.emit('dungeon:unitTargeting', {
                attackerId: member.id, attackerSide: 'player',
                targetId: target.id, targetSide: 'enemy'
            });
            const damage = member.stats?.strength || member.stats?.agility || 20;
            this.applyDamage(member, target, damage);
            this.addLog(`⚔️ ${member.name} 攻击 ${target.name}，造成 ${damage} 点伤害`, 'combat', this._getUnitClassColor(member));
        }
    }

    /**
     * 解析 AI 决策的技能
     */
    _resolveAISkill(skillId, unit, battleState) {
        if (!skillId) return null;
        // 先查 GameData
        const gameData = battleState.gameData || GameData;
        if (gameData?.skills?.[skillId]) return gameData.skills[skillId];
        // 再查单位技能列表
        if (unit.skills) {
            for (const sk of unit.skills) {
                if (typeof sk === 'object' && sk.id === skillId) return sk;
            }
        }
        return null;
    }

    /**
     * 解析 AI 决策的目标 ID → 实际单位对象
     */
    _resolveAITargets(targetIds) {
        if (!targetIds || targetIds.length === 0) return [];
        const targets = [];
        for (const tid of targetIds) {
            // 从队伍成员找
            const member = this.partyState?.members?.find(m => m.id === tid && m.currentHp > 0);
            if (member) { targets.push(member); continue; }
            // 从敌方找
            const enemyPos = this.battlefield?.enemy?.find(p => p.unitId === tid);
            if (enemyPos?.unit && enemyPos.unit.currentHp > 0) { targets.push(enemyPos.unit); continue; }
            // 从 playerPositions 找
            const playerPos = this.battlefield?.player?.find(p => p.unitId === tid);
            if (playerPos?.unit && playerPos.unit.currentHp > 0) { targets.push(playerPos.unit); }
        }
        return targets;
    }

    /**
     * 同步单位 HP 到战场状态
     */
    _syncUnitHp(target) {
        if (!target) return;
        // 同步到敌方战场
        const enemyPos = this.battlefield?.enemy?.find(p => p.unitId === target.id);
        if (enemyPos?.unit) {
            enemyPos.unit.currentHp = target.currentHp;
            if (target.currentHp <= 0) {
                PositioningSystem.markUnitDead(this.battlefield, 'enemy', target.id);
                TurnOrderSystem.removeDeadUnit(this.turnState, target.id);
                this.engine.eventBus.emit('dungeon:unitDied', {
                    unit: target, side: 'enemy', isBoss: !!(target.isBoss || target.type === 'boss')
                });
            }
        }
        // 同步到玩家方战场
        const playerPos = this.battlefield?.player?.find(p => p.unitId === target.id);
        if (playerPos?.unit) {
            playerPos.unit.currentHp = target.currentHp;
            if (target.currentHp <= 0) {
                PositioningSystem.markUnitDead(this.battlefield, 'player', target.id);
                TurnOrderSystem.removeDeadUnit(this.turnState, target.id);
                ThreatSystem.removeDeadPlayer(this.threatState, target.id);
                this.addLog(`💀 ${target.name} 倒下了！`, 'system');
                this.engine.eventBus.emit('dungeon:unitDied', {
                    unit: target, side: 'player', isBoss: false
                });
                // 主人阵亡时宠物也阵亡
                const pet = PetCombatSystem.getPet(this.petState, target.id);
                if (pet && pet.isAlive) {
                    PetCombatSystem.onOwnerDeath(this.petState, target.id);
                    this.addLog(`💀 ${pet.emoji} ${pet.displayName} 随主人一同倒下了！`, 'system');
                }
            }
        }
    }

    /**
     * 构建战斗状态对象（供 AI 系统使用）
     */
    _buildBattleState(combatType) {
        return {
            battlefield: this.battlefield,
            threatState: this.threatState,
            turnState: this.turnState,
            gameData: GameData,
            combatType: combatType || 'dungeon'
        };
    }

    /**
     * 处理敌人回合 — 使用 AIDecisionSystem 行为树驱动
     */
    handleEnemyTurn(turnEntry) {
        const enemy = turnEntry.unit;

        // 检查敌人是否已死亡（可能在其他单位行动时被击杀）
        if (!enemy || enemy.currentHp <= 0) {
            this.endCurrentUnitTurn();
            return;
        }

        // 先高亮敌人（攻击者），通知UI
        this.engine.eventBus.emit('dungeon:enemyTurnStart', {
            unit: enemy,
            unitId: enemy.id,
            side: 'enemy'
        });

        // BOSS 保留原有处理（支持双BOSS）
        const isBoss = (this.bossState || this.bossStates?.size > 0) && enemy.type === 'boss';

        if (!isBoss) {
            // 标记敌人身份
            enemy.isEnemy = true;
            enemy.side = 'enemy';

            // 构建战斗状态
            const battleState = this._buildBattleState('dungeon');
            battleState.partyMembers = this.partyState.members;
            battleState.enemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(e => e.unit);

            // AI 预决策（用于高亮目标）
            const preDecision = AIDecisionSystem.decideAction(enemy, battleState);
            if (preDecision) {
                const preTargets = this._resolveAITargets(preDecision.targetIds);
                if (preTargets.length > 0) {
                    this.engine.eventBus.emit('dungeon:unitTargeting', {
                        attackerId: enemy.id, attackerSide: 'enemy',
                        targetId: preTargets[0].id, targetSide: 'player'
                    });
                }
            }
        }

        this._setTimeout(() => {
            // 检查敌人是否被 CC 控制
            if (EffectSystem.isUnitCCed(enemy)) {
                const ccType = EffectSystem.getCCType(enemy);
                
                // charm（魅惑）：被控敌人攻击随机敌方队友
                if (ccType === 'charm') {
                    this.addLog(`💜 ${enemy.name} 被魅惑，攻击了同伴！`, 'system');
                    this._executeCharmAttack(enemy, 'enemy');
                } else {
                    const ccText = ccType === 'stun' ? '眩晕' : ccType === 'fear' ? '恐惧' : '控制';
                    this.addLog(`${enemy.name} 被${ccText}，无法行动！`, 'system');
                }
            } else if (isBoss) {
                // BOSS特殊处理
                this.processBossTurn(enemy);
            } else {
                // 使用 AI 决策系统执行敌人回合
                this._executeEnemyTurnAI(enemy);
            }
            
            this.endCurrentUnitTurn();
        }, 1500);
    }

    /**
     * 使用 AI 决策系统执行敌人回合
     */
    _executeEnemyTurnAI(enemy) {
        enemy.isEnemy = true;
        enemy.side = 'enemy';

        const battleState = this._buildBattleState('dungeon');
        battleState.partyMembers = this.partyState.members;
        battleState.enemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(e => e.unit);

        // AI 决策
        const decision = AIDecisionSystem.decideAction(enemy, battleState);

        if (decision) {
            const skill = this._resolveAISkill(decision.skillId, enemy, battleState);
            const targets = this._resolveAITargets(decision.targetIds);

            if (skill && targets.length > 0) {
                // 高亮目标
                this.engine.eventBus.emit('dungeon:unitTargeting', {
                    attackerId: enemy.id, attackerSide: 'enemy',
                    targetId: targets[0].id, targetSide: 'player'
                });

                // 冷却递减
                SkillExecutor.tickCooldowns(enemy);

                // 使用 SkillExecutor 执行
                const battleContext = {
                    battlefield: this.battlefield,
                    threatState: this.threatState,
                    combatType: 'dungeon'
                };
                const result = SkillExecutor.executeSkill(enemy, skill, targets, battleContext);

                if (result.success) {
                    this._processEnemySkillResult(enemy, skill, targets, result);
                    return;
                }
            }
        }

        // 降级：默认物理攻击
        this._enemyBasicAttack(enemy);
    }

    /**
     * 处理敌人技能执行结果
     */
    _processEnemySkillResult(enemy, skill, targets, result) {
        const normalizedSkill = ContextBuilder.normalizeSkill(skill);
        const skillName = normalizedSkill.name || skill.name || '攻击';

        // 处理结果
        for (const res of result.results) {
            if (res.type === 'damage') {
                const target = targets.find(t => t.id === res.targetId)
                    || this.partyState.members.find(m => m.id === res.targetId)
                    || { name: res.targetName };
                this._syncUnitHp(target);

                // 受击产生资源
                if (target.currentHp > 0) {
                    this.generateResourceOnCombat(target, 'damaged');
                }

                this.engine.eventBus.emit('dungeon:damageReceived', {
                    attacker: enemy, target, damage: res.damage,
                    isCrit: res.isCrit, targetHp: target.currentHp, targetMaxHp: target.maxHp
                });
            } else if (res.type === 'heal') {
                const target = targets.find(t => t.id === res.targetId) || { name: res.targetName };
                this._syncUnitHp(target);
            }
        }

        // 效果日志
        const effects = EffectSystem.normalizeEffects(normalizedSkill);
        for (const eff of effects) {
            for (const t of targets) {
                if (eff.type === 'dot') {
                    this.addLog(`☠️ ${t.name} 受到了 ${eff.name} 效果`, 'system');
                } else if (eff.type === 'cc') {
                    const ccText = eff.ccType === 'stun' ? '眩晕' : eff.ccType === 'fear' ? '恐惧' : '控制';
                    this.addLog(`💫 ${t.name} 被${ccText}了！`, 'system');
                } else if (eff.type === 'debuff') {
                    this.addLog(`⬇️ ${t.name} 受到 ${eff.name} 效果`, 'system');
                } else if (eff.type === 'buff') {
                    this.addLog(`✨ ${enemy.name} 获得 ${eff.name} 效果！`, 'system');
                }
            }
        }

        // 伤害日志
        if (result.totalDamage > 0) {
            if (targets.length === 1) {
                this.addLog(`👹 ${enemy.name} 使用 ${skillName} 对 ${targets[0].name} 造成 ${result.totalDamage} 点伤害`, 'combat');
            } else {
                const names = targets.map(t => t.name).join('、');
                this.addLog(`👹 ${enemy.name} 使用 ${skillName} 攻击了 ${names}`, 'combat');
            }
        } else {
            this.addLog(`👹 ${enemy.name} 使用了 ${skillName}`, 'combat');
        }

        this.checkCombatEnd();
    }

    /**
     * 敌人基础攻击降级
     */
    _enemyBasicAttack(enemy) {
        const target = this._selectEnemyTarget(enemy, null);
        if (target && target.currentHp > 0) {
            this.engine.eventBus.emit('dungeon:unitTargeting', {
                attackerId: enemy.id, attackerSide: 'enemy',
                targetId: target.id, targetSide: 'player'
            });
            const damage = enemy.damage || 15;
            this.applyDamageToParty(enemy, target, damage);
            this.addLog(`👹 ${enemy.name} 攻击 ${target.name}，造成 ${damage} 点伤害`, 'combat');
        }
    }

    /**
     * 选择敌人攻击目标（基于技能范围限制）
     */
    _selectEnemyTarget(enemy, skill) {
        if (skill) {
            // 根据技能获取合法目标列表
            const validTargets = PositioningSystem.getValidTargets(this.battlefield, enemy, skill);
            if (validTargets.length === 0) return null;

            // 在合法目标中优先选仇恨最高的
            const alivePlayerIds = validTargets.map(t => t.id);
            const targetId = ThreatSystem.getAttackTarget(this.threatState, enemy.id, alivePlayerIds);
            return this.partyState.members.find(m => m.id === targetId) || validTargets[0];
        }

        // 无技能时退回原逻辑
        const alivePlayerIds = this.partyState.members
            .filter(m => m.currentHp > 0)
            .map(m => m.id);
        const targetId = ThreatSystem.getAttackTarget(this.threatState, enemy.id, alivePlayerIds);
        return this.partyState.members.find(m => m.id === targetId) || null;
    }

    /**
     * 执行敌人攻击（使用技能系统）
     */
    _executeEnemyAttack(enemy, preTarget) {
        const skill = this._selectEnemySkill(enemy);

        if (skill) {
            // 根据技能范围重新选择合法目标
            const target = this._selectEnemyTarget(enemy, skill);
            if (!target || target.currentHp <= 0) return;

            // 高亮目标（可能和预选的不同）
            if (!preTarget || preTarget.id !== target.id) {
                this.engine.eventBus.emit('dungeon:unitTargeting', {
                    attackerId: enemy.id, attackerSide: 'enemy',
                    targetId: target.id, targetSide: 'player'
                });
            }

            // 根据 targetType 解析实际目标列表
            const targets = this._resolveEnemySkillTargets(enemy, skill, target);

            // 施加伤害
            const damage = skill.damage || enemy.damage || 15;
            if (damage > 0) {
                targets.forEach(t => {
                    if (t.currentHp > 0) {
                        this.applyDamageToParty(enemy, t, damage);
                    }
                });
            }

            // 施加效果
            const effects = EffectSystem.normalizeEffects(skill);
            if (effects.length > 0) {
                targets.forEach(t => {
                    if (t.currentHp > 0 || damage === 0) {
                        EffectSystem.applyEffects(enemy, t, effects, {});
                        for (const eff of effects) {
                            if (eff.type === 'dot') {
                                this.addLog(`☠️ ${t.name} 受到了 ${eff.name} 效果`, 'system');
                            } else if (eff.type === 'cc') {
                                const ccText = eff.ccType === 'stun' ? '眩晕' : eff.ccType === 'fear' ? '恐惧' : '控制';
                                this.addLog(`💫 ${t.name} 被${ccText}了！`, 'system');
                            } else if (eff.type === 'debuff') {
                                this.addLog(`⬇️ ${t.name} 受到 ${eff.name} 效果`, 'system');
                            } else if (eff.type === 'buff') {
                                this.addLog(`✨ ${enemy.name} 获得 ${eff.name} 效果！`, 'system');
                            }
                        }
                    }
                });
            }

            // 日志
            if (targets.length === 1) {
                if (damage > 0) {
                    this.addLog(`👹 ${enemy.name} 使用 ${skill.name} 对 ${targets[0].name} 造成 ${damage} 点伤害`, 'combat');
                } else {
                    this.addLog(`👹 ${enemy.name} 使用了 ${skill.name}`, 'combat');
                }
            } else if (targets.length > 1) {
                const names = targets.map(t => t.name).join('、');
                this.addLog(`👹 ${enemy.name} 使用 ${skill.name} 攻击了 ${names}`, 'combat');
            }
        } else {
            // 没有可用技能，使用默认攻击（不受范围限制）
            const target = preTarget || this._selectEnemyTarget(enemy, null);
            if (target && target.currentHp > 0) {
                const damage = enemy.damage || 15;
                this.applyDamageToParty(enemy, target, damage);
                this.addLog(`👹 ${enemy.name} 攻击 ${target.name}，造成 ${damage} 点伤害`, 'combat');
            }
        }
    }

    /**
     * 解析敌方技能的实际目标列表
     */
    _resolveEnemySkillTargets(enemy, skill, primaryTarget) {
        const targetType = skill.targetType || 'enemy';
        switch (targetType) {
            case 'self':
                return [enemy];
            case 'enemy':
            case 'single':
                return [primaryTarget];
            case 'front_2':
                return PositioningSystem.getFrontTargets(this.battlefield, 'player', 2)
                    .map(u => this.partyState.members.find(m => m.id === u.id))
                    .filter(t => t && t.currentHp > 0);
            case 'front_3':
                return PositioningSystem.getFrontTargets(this.battlefield, 'player', 3)
                    .map(u => this.partyState.members.find(m => m.id === u.id))
                    .filter(t => t && t.currentHp > 0);
            case 'all_enemies':
                return this.partyState.members.filter(m => m.currentHp > 0);
            case 'random_3': {
                const alive = this.partyState.members.filter(m => m.currentHp > 0);
                return shuffle([...alive]).slice(0, Math.min(3, alive.length));
            }
            case 'cleave_3': {
                const { primary, splash } = PositioningSystem.getAdjacentTargets(this.battlefield, 'player', primaryTarget.id);
                if (!primary) return [primaryTarget];
                return [primary, ...splash].filter(t => t.currentHp > 0);
            }
            default:
                return [primaryTarget];
        }
    }

    /**
     * 处理普通敌人回合（兼容BOSS内部调用）
     */
    processNormalEnemyTurn(enemy) {
        const target = this._selectEnemyTarget(enemy, null);
        if (target) {
            this.engine.eventBus.emit('dungeon:unitTargeting', {
                attackerId: enemy.id, attackerSide: 'enemy',
                targetId: target.id, targetSide: 'player'
            });
            // 默认攻击
            const damage = enemy.damage || 15;
            this.applyDamageToParty(enemy, target, damage);
            this.addLog(`👹 ${enemy.name} 攻击 ${target.name}，造成 ${damage} 点伤害`, 'combat');
        }
    }

    /**
     * 处理BOSS回合
     */
    processBossTurn(boss) {
        // 获取当前BOSS的阶段状态（支持双BOSS）
        const bState = this.bossStates?.get(boss.id) || this.bossState;
        
        // 检查蓄力
        if (bState.isCharging) {
            const result = BossPhaseSystem.updateCharging(bState);
            if (result.shouldRelease) {
                this.releaseBossSkill(boss, result.skill);
                return;
            }
        }

        // 获取行动次数
        const actionsPerTurn = BossPhaseSystem.getActionsPerTurn(bState);
        
        for (let i = 0; i < actionsPerTurn; i++) {
            const skillId = BossPhaseSystem.selectNextSkill(bState, {});
            if (skillId) {
                this.executeBossSkill(boss, skillId);
            } else {
                // 使用 AI 行为树选择技能（BOSS 默认行为树）
                boss.isBoss = true;
                boss.side = 'enemy';
                const battleState = this._buildBattleState('dungeon');
                battleState.partyMembers = this.partyState.members;
                battleState.enemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(e => e.unit);

                const decision = AIDecisionSystem.decideAction(boss, battleState);
                if (decision) {
                    const skill = this._resolveAISkill(decision.skillId, boss, battleState);
                    const targets = this._resolveAITargets(decision.targetIds);
                    if (skill && targets.length > 0) {
                        SkillExecutor.tickCooldowns(boss);
                        const battleContext = {
                            battlefield: this.battlefield,
                            threatState: this.threatState,
                            combatType: 'dungeon'
                        };
                        const result = SkillExecutor.executeSkill(boss, skill, targets, battleContext);
                        if (result.success) {
                            this._processEnemySkillResult(boss, skill, targets, result);
                            continue;
                        }
                    }
                }
                // 最终降级
                this.processNormalEnemyTurn(boss);
            }
        }
    }

    /**
     * 执行BOSS技能
     */
    executeBossSkill(boss, skillId) {
        // 从当前副本的BOSS配置中查找技能（兼容各种副本数据结构）
        const bossData = this.currentDungeon.boss_serpentis || this.currentEncounterBossConfig;
        const skill = bossData?.skills?.[skillId] || boss.skills?.[skillId];
        if (!skill) {
            this.processNormalEnemyTurn(boss);
            return;
        }

        // 检查是否需要蓄力
        const bState = this.bossStates?.get(boss.id) || this.bossState;
        if (BossPhaseSystem.skillNeedsTelegraph(skill)) {
            const { event } = BossPhaseSystem.startCharging(bState, skill);
            if (event) {
                this.addLog(event.message, 'system');
            }
            return;
        }

        this.releaseBossSkill(boss, skill);
    }

    /**
     * 释放BOSS技能
     */
    releaseBossSkill(boss, skill) {
        this.addLog(`💀 ${boss.name} 使用 ${skill.name}！`, 'combat');

        const baseDamage = EffectSystem.resolveSkillDamage(skill, boss);
        const bState = this.bossStates?.get(boss.id) || this.bossState;
        const finalDamage = BossPhaseSystem.calculateDamage(bState, baseDamage);

        // 根据目标类型选择目标
        let targets = [];
        const targetType = skill.targetType || 'single';
        switch (targetType) {
            case 'single':
            case 'enemy': {
                const aliveIds = this.partyState.members.filter(m => m.currentHp > 0).map(m => m.id);
                const targetId = ThreatSystem.getAttackTarget(this.threatState, boss.id, aliveIds);
                const target = this.partyState.members.find(m => m.id === targetId);
                if (target) targets = [target];
                break;
            }
                
            case 'front_2':
                targets = PositioningSystem.getFrontTargets(this.battlefield, 'player', 2)
                    .map(u => this.partyState.members.find(m => m.id === u.id))
                    .filter(Boolean);
                break;

            case 'front_3':
                targets = PositioningSystem.getFrontTargets(this.battlefield, 'player', 3)
                    .map(u => this.partyState.members.find(m => m.id === u.id))
                    .filter(Boolean);
                break;
                
            case 'all_enemies':
                targets = this.partyState.members.filter(m => m.currentHp > 0);
                break;

            case 'random_3': {
                const alive = this.partyState.members.filter(m => m.currentHp > 0);
                const shuffled = shuffle([...alive]);
                targets = shuffled.slice(0, Math.min(3, shuffled.length));
                break;
            }
        }

        // 应用伤害和效果（传递技能的 damageType）
        const skillDamageType = skill.damageType || 'physical';
        targets.forEach(target => {
            if (finalDamage > 0) {
                this.applyDamageToParty(boss, target, finalDamage, { damageType: skillDamageType });
            }
            
            // 使用 EffectSystem 施加效果（兼容旧 effect 和新 effects[]）
            const effects = EffectSystem.normalizeEffects(skill);
            if (effects.length > 0) {
                EffectSystem.applyEffects(boss, target, effects, {});
                for (const eff of effects) {
                    if (eff.type === 'dot') {
                        this.addLog(`☠️ ${target.name} 受到了 ${eff.name} 效果`, 'system');
                    } else if (eff.type === 'cc') {
                        this.addLog(`🌿 ${target.name} 被 ${eff.ccType || eff.name}了！`, 'system');
                    } else if (eff.type === 'debuff') {
                        this.addLog(`⬇️ ${target.name} 受到 ${eff.name} 效果`, 'system');
                    }
                }
            }
        });
    }

    /**
     * 应用技能效果（保留向后兼容，内部委托 EffectSystem）
     */
    applySkillEffect(target, effect) {
        EffectSystem.applySingleEffect(null, target, effect, { onSummon: (source, eff) => this._handlePetSummon(source, eff) });
        if (effect.type === 'dot') {
            this.addLog(`☠️ ${target.name} 受到了 ${effect.name} 效果`, 'system');
        } else if (effect.type === 'cc') {
            this.addLog(`🌿 ${target.name} 被 ${effect.ccType || effect.name}了！`, 'system');
        }
    }

    /**
     * 应用狂暴AOE
     */
    applyEnrageAoe(aoe) {
        this.addLog(aoe.message, 'system');
        
        this.partyState.members.forEach(member => {
            if (member.currentHp > 0) {
                this.applyDamageToParty({ name: 'BOSS狂暴' }, member, aoe.damage);
            }
        });
    }

    // ==================== 伤害/治疗处理 ====================

    /**
     * 暴击判定
     */
    rollCrit(attacker) {
        const agi = attacker.stats?.agility || 0;
        const critChance = Math.min(0.05 + agi / 200, 0.4); // 5%~40%
        const isCrit = random() < critChance;
        return { isCrit, multiplier: isCrit ? 1.5 : 1 };
    }

    /**
     * 对敌人造成伤害
     */
    applyDamage(attacker, target, damage, skillId = null, options = {}) {
        // 暴击判定（可由调用方传入 isCrit 覆盖，否则自动判定）
        let isCrit = options.isCrit;
        if (isCrit === undefined) {
            const crit = this.rollCrit(attacker);
            isCrit = crit.isCrit;
            if (isCrit) damage = Math.floor(damage * crit.multiplier);
        }

        // Shield 吸收（传入 damageType 以支持 physicalImmune/spellReflect）
        const damageType = options.damageType || 'physical';
        const { actualDamage, absorbed, reflected, immune } = EffectSystem.absorbDamage(target, damage, damageType);

        // 免疫处理
        if (immune) {
            this.addLog(`🛡️ ${target.name} 免疫了伤害！`, 'system');
            return;
        }

        // 法术反射处理
        if (reflected && attacker) {
            this.addLog(`🪞 ${target.name} 反射了法术伤害！`, 'system');
            this.applyDamageToParty(target, attacker, damage, { skipArmor: true, damageType: 'arcane' });
            return;
        }

        if (absorbed > 0) {
            this.addLog(`🛡️ ${target.name} 的护盾吸收了 ${absorbed} 点伤害`, 'system');
        }

        target.currentHp = Math.max(0, target.currentHp - actualDamage);
        
        // 更新战场状态
        const pos = this.battlefield.enemy.find(p => p.unitId === target.id);
        if (pos && pos.unit) {
            pos.unit.currentHp = target.currentHp;
            if (target.currentHp <= 0) {
                PositioningSystem.markUnitDead(this.battlefield, 'enemy', target.id);
                TurnOrderSystem.removeDeadUnit(this.turnState, target.id);
                this.engine.eventBus.emit('dungeon:unitDied', {
                    unit: target, side: 'enemy', isBoss: !!(target.isBoss || target.type === 'boss')
                });
            }
        }
        
        // 增加仇恨
        ThreatSystem.addDamageThreat(this.threatState, target.id, attacker.id, damage, skillId);
        
        // 检查BOSS阶段转换（支持双BOSS：优先用 bossStates Map，回退到单 bossState）
        const bossState = this.bossStates?.get(target.id) || (this.bossState && target.type === 'boss' ? this.bossState : null);
        if (bossState) {
            const result = BossPhaseSystem.updateHp(bossState, target.currentHp);
            if (result.phaseChanged) {
                this.addLog(`🔥 ${target.name} 进入 ${result.newPhase.name}！`, 'system');
                this._consumePhaseEvents(result.events, target);
            }
        }
        
        // 检查战斗结束
        this.checkCombatEnd();
        
        // 触发UI更新
        this.engine.eventBus.emit('dungeon:damageDealt', {
            attacker,
            target,
            damage,
            isCrit,
            targetHp: target.currentHp,
            targetMaxHp: target.maxHp
        });
    }

    /**
     * 对队伍成员造成伤害（集成护甲减伤）
     */
    applyDamageToParty(attacker, target, damage, options = {}) {
        // 暴击判定
        let isCrit = options.isCrit;
        if (isCrit === undefined) {
            const crit = this.rollCrit(attacker);
            isCrit = crit.isCrit;
            if (isCrit) damage = Math.floor(damage * crit.multiplier);
        }

        // 护甲减伤（仅物理伤害，目标有装备时生效）
        const dmgType = options.damageType || 'physical';
        if (!options.skipArmor && dmgType === 'physical') {
            const equipSys = this.engine?.systems?.get('equipment');
            if (equipSys && target.equipment) {
                const totalArmor = equipSys.getTotalArmor(target);
                const attackerLevel = attacker.level || 1;
                if (totalArmor > 0) {
                    const reduction = equipSys.getPhysicalReduction(totalArmor, attackerLevel);
                    damage = Math.max(1, Math.floor(damage * (1 - reduction)));
                }
            }
        }

        // Shield 吸收（传入 damageType 以支持免疫/反射）
        const damageType = options.damageType || 'physical';
        const { actualDamage, absorbed, immune } = EffectSystem.absorbDamage(target, damage, damageType);

        // 免疫处理
        if (immune) {
            this.addLog(`🛡️ ${target.name} 免疫了伤害！`, 'system');
            return;
        }

        if (absorbed > 0) {
            this.addLog(`🛡️ ${target.name} 的护盾吸收了 ${absorbed} 点伤害`, 'system');
        }

        target.currentHp = Math.max(0, target.currentHp - actualDamage);
        
        // 更新战场状态
        const pos = this.battlefield.player.find(p => p.unitId === target.id);
        if (pos && pos.unit) {
            pos.unit.currentHp = target.currentHp;
            if (target.currentHp <= 0) {
                PositioningSystem.markUnitDead(this.battlefield, 'player', target.id);
                TurnOrderSystem.removeDeadUnit(this.turnState, target.id);
                ThreatSystem.removeDeadPlayer(this.threatState, target.id);
                this.addLog(`💀 ${target.name} 倒下了！`, 'system');
                this.engine.eventBus.emit('dungeon:unitDied', {
                    unit: target, side: 'player', isBoss: false
                });
                // 主人阵亡时宠物也阵亡
                const pet = PetCombatSystem.getPet(this.petState, target.id);
                if (pet && pet.isAlive) {
                    PetCombatSystem.onOwnerDeath(this.petState, target.id);
                    this.addLog(`💀 ${pet.emoji} ${pet.displayName} 随主人一同倒下了！`, 'system');
                }
            }
        }
        
        // 检查战斗结束
        this.checkCombatEnd();
        
        // 受击产生资源（战士受击产怒气 +5）
        if (target.currentHp > 0) {
            this.generateResourceOnCombat(target, 'damaged');
        }

        // 触发UI更新
        this.engine.eventBus.emit('dungeon:damageReceived', {
            attacker,
            target,
            damage,
            isCrit,
            targetHp: target.currentHp,
            targetMaxHp: target.maxHp
        });
    }

    /**
     * 消费阶段转换事件（summon / buff / resurrect / message）
     */
    _consumePhaseEvents(events, boss) {
        for (const event of events) {
            switch (event.type) {
                case 'summon':
                    this.summonAdd(event.summonId, event.slot);
                    break;
                    
                case 'buff': {
                    // 给BOSS施加buff
                    if (!boss.buffs) boss.buffs = [];
                    boss.buffs.push({
                        name: event.buffName || event.stat,
                        type: 'buff',
                        stat: event.stat,
                        value: event.value || 1,
                        duration: event.duration || 99,
                        remainingDuration: event.duration || 99
                    });
                    if (event.message) {
                        this.addLog(`✨ ${event.message}`, 'system');
                    }
                    break;
                }
                    
                case 'resurrect':
                    this._resurrectBoss(event);
                    break;
                    
                case 'phase_transition':
                    // Already handled by the caller (log message)
                    break;
            }
        }
    }

    /**
     * 魅惑攻击：被 charm 的单位攻击同阵营随机队友
     * @param {Object} unit - 被魅惑的单位
     * @param {string} side - 'player' 或 'enemy'
     */
    _executeCharmAttack(unit, side) {
        const damage = unit.damage || unit.stats?.strength || 20;
        
        if (side === 'player') {
            // 玩家被魅惑，攻击随机队友
            const allies = this.partyState.members.filter(m => m.currentHp > 0 && m.id !== unit.id);
            if (allies.length > 0) {
                const target = allies[randomInt(0, allies.length - 1)];
                this.applyDamageToParty(unit, target, damage);
                this.addLog(`💜 ${unit.name} 在魅惑下攻击了 ${target.name}，造成 ${damage} 点伤害`, 'combat');
            }
        } else {
            // 敌人被魅惑，攻击随机敌方同伴
            const aliveEnemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy')
                .map(e => e.unit)
                .filter(e => e.id !== unit.id && e.currentHp > 0);
            if (aliveEnemies.length > 0) {
                const target = aliveEnemies[randomInt(0, aliveEnemies.length - 1)];
                this.applyDamage(unit, target, damage);
                this.addLog(`💜 ${unit.name} 在魅惑下攻击了 ${target.name}，造成 ${damage} 点伤害`, 'combat');
            }
        }
    }

    /**
     * 复活已倒下的BOSS（resurrect 事件）
     * 用于双BOSS战中一个BOSS复活另一个
     */
    _resurrectBoss(event) {
        const targetId = event.targetId;
        const hpPercent = event.hpPercent || 1.0;
        
        // 在战场上找到已死亡的目标
        const pos = this.battlefield.enemy.find(p => p.unitId === targetId);
        if (!pos || !pos.unit) return;
        
        const target = pos.unit;
        
        // 复活：恢复HP
        target.currentHp = Math.floor(target.maxHp * hpPercent);
        pos.isDead = false;
        
        // 重新加入回合顺序
        const slot = pos.slot || 3;
        TurnOrderSystem.addUnit(this.turnState, target, 'enemy', slot);
        
        // 恢复bossState（如果有的话）
        const bState = this.bossStates?.get(targetId);
        if (bState) {
            bState.currentHp = target.currentHp;
            bState.currentHpPercent = target.currentHp / target.maxHp;
        }
        
        if (event.message) {
            this.addLog(`✝️ ${event.message}`, 'system');
        } else {
            this.addLog(`✝️ ${target.name} 被复活了！`, 'system');
        }
        
        this.engine.eventBus.emit('dungeon:unitResurrected', {
            unit: target, side: 'enemy'
        });
    }
    applyHealing(healer, target, amount) {
        const actualHeal = Math.min(amount, target.maxHp - target.currentHp);
        target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
        
        // 更新战场
        const pos = this.battlefield.player.find(p => p.unitId === target.id);
        if (pos && pos.unit) {
            pos.unit.currentHp = target.currentHp;
        }
        
        // 增加仇恨
        ThreatSystem.addHealingThreat(this.threatState, healer.id, actualHeal);
        
        // 触发UI更新
        this.engine.eventBus.emit('dungeon:healingDone', {
            healer,
            target,
            amount: actualHeal
        });
    }

    /**
     * 召唤小怪
     */
    summonAdd(summonId, slot) {
        const summon = this.currentDungeon.createSummonInstance(summonId, slot);
        if (!summon) return;
        
        PositioningSystem.placeUnit(this.battlefield, 'enemy', slot, summon);
        TurnOrderSystem.addUnit(this.turnState, summon, 'enemy', slot);
        ThreatSystem.addNewEnemy(this.threatState, summon.id, 
            this.partyState.members.map(m => m.id));
        
        this.addLog(`🌱 ${summon.name} 出现了！`, 'system');
    }

    // ==================== 玩家行动处理 ====================

    /**
     * 立即执行玩家行动（结算阶段或兼容旧逻辑）
     */
    _executePlayerActionImmediate(action) {
        const actingMember = this.currentActingUnit;
        if (!actingMember) {
            this.addLog('当前没有可行动的单位！', 'system');
            return;
        }

        const apState = this.actionPointStates[actingMember.id];

        switch (action.type) {
            case 'attack':
                this.playerBasicAttack(actingMember, action.targetId);
                break;
            case 'skill':
                this.playerUseSkill(actingMember, action.skillId, action.targetId);
                break;
            case 'defend':
                this.playerDefend(actingMember);
                break;
            case 'endTurn':
                this.endCurrentUnitTurn();
                return;
        }

        // 更新战斗状态显示
        this.saveCombatState();
        this.engine.eventBus.emit('dungeon:combatUpdate', this.getCombatDisplayState());

        // 检查是否应该结束回合
        const shouldEnd = ActionPointSystem.shouldEndTurn(apState) || action.autoEndTurn === true;
        
        if (shouldEnd) {
            this._setTimeout(() => {
                this.endCurrentUnitTurn();
            }, 800);
        } else {
            this.engine.eventBus.emit('dungeon:actionPointsUpdated', {
                actionPoints: apState,
                member: actingMember
            });
        }
    }

    /**
     * 玩家普通攻击（集成武器伤害 + 护甲减伤）
     */
    playerBasicAttack(attacker, targetId) {
        const apState = this.actionPointStates[attacker.id];
        const canUse = ActionPointSystem.canUseSkill(apState, 'basicAttack');
        
        if (!canUse.canUse) {
            this.addLog(canUse.reason, 'system');
            return;
        }

        const target = this.battlefield.enemy.find(p => p.unitId === targetId)?.unit;
        if (!target) {
            this.addLog('请选择一个有效目标！', 'system');
            return;
        }
        
        if (target.currentHp <= 0) {
            this.addLog('该目标已经死亡！', 'system');
            return;
        }

        ActionPointSystem.consumePoints(apState, 'basicAttack');
        
        // 武器伤害 + 属性加成
        const equipSys = this.engine?.systems?.get('equipment');
        const mainHand = attacker.equipment?.mainHand;
        let damage;
        if (mainHand && mainHand.damage && equipSys) {
            damage = equipSys.rollWeaponDamage(mainHand) + Math.floor((attacker.stats?.strength || 0) * 0.5);
        } else {
            damage = attacker.stats?.strength || attacker.stats?.agility || 20;
        }
        
        // 敌人护甲减伤
        const targetArmor = target.armorValue || 0;
        if (targetArmor > 0 && equipSys) {
            const attackerLevel = attacker.level || 1;
            const reduction = equipSys.getPhysicalReduction(targetArmor, attackerLevel);
            damage = Math.floor(damage * (1 - reduction));
        }
        damage = Math.max(1, damage);

        const crit = this.rollCrit(attacker);
        const finalDamage = crit.isCrit ? Math.floor(damage * crit.multiplier) : damage;
        this.applyDamage(attacker, target, finalDamage, null, { isCrit: crit.isCrit });
        this.addLog(`⚔️ ${attacker.name} 攻击 ${target.name}，造成 ${finalDamage} 点伤害${crit.isCrit ? '（暴击！）' : ''}`, 'combat');

        // 副手攻击（双持）
        const offHand = attacker.equipment?.offHand;
        if (offHand && offHand.damage && offHand.category === 'weapon' && equipSys) {
            let offDmg = equipSys.getOffHandDamage(equipSys.rollWeaponDamage(offHand));
            if (targetArmor > 0) {
                const reduction = equipSys.getPhysicalReduction(targetArmor, attacker.level || 1);
                offDmg = Math.floor(offDmg * (1 - reduction));
            }
            offDmg = Math.max(1, offDmg);
            const offCrit = this.rollCrit(attacker);
            const offFinal = offCrit.isCrit ? Math.floor(offDmg * offCrit.multiplier) : offDmg;
            this.applyDamage(attacker, target, offFinal, null, { isCrit: offCrit.isCrit });
            this.addLog(`⚔️ ${attacker.name} 副手攻击，造成 ${offFinal} 点伤害${offCrit.isCrit ? '（暴击！）' : ''}`, 'combat');
        }

        // 普攻产生资源（战士普攻产怒气 +8，暴击 +12）
        this.generateResourceOnCombat(attacker, 'attack', crit.isCrit);
    }

    /**
     * 玩家使用技能
     */
    playerUseSkill(attacker, skillId, targetId) {
        const apState = this.actionPointStates[attacker.id];
        const canUse = ActionPointSystem.canUseSkill(apState, skillId);
        
        if (!canUse.canUse) {
            this.addLog(canUse.reason, 'system');
            return;
        }

        // 从GameData获取技能数据
        const skill = GameData?.skills?.[skillId];
        if (!skill) {
            this.addLog(`技能 ${skillId} 不存在！`, 'system');
            return;
        }

        // 检查资源消耗（兼容新旧 schema）
        const resourceType = skill.resourceCost?.type || 'mana';
        const resourceCost = skill.resourceCost?.value || skill.manaCost || 0;
        
        // 获取当前资源值
        const currentResource = this.getUnitResource(attacker, resourceType);
        if (currentResource < resourceCost) {
            this.addLog(`${this.getResourceName(resourceType)}不足！需要 ${resourceCost}，当前 ${currentResource}`, 'system');
            return;
        }

        // 检查连击点（兼容新旧 schema: comboPoints.requires 或 requiresComboPoints）
        const requiresCombo = skill.comboPoints?.requires || skill.requiresComboPoints;
        if (requiresCombo) {
            const comboPoints = attacker.comboPoints?.current || 0;
            if (comboPoints <= 0) {
                this.addLog('需要连击点才能使用此技能！', 'system');
                return;
            }
        }

        // 消耗资源
        this.consumeUnitResource(attacker, resourceType, resourceCost);

        // 消耗行动点
        ActionPointSystem.consumePoints(apState, skillId);

        // 根据技能类型执行效果
        const damageTable = skill.comboPoints?.damageTable || skill.comboPointsDamage;
        if (requiresCombo && damageTable) {
            // 终结技（如剔骨）- 根据连击点计算伤害
            this.executeFinisherSkill(attacker, skill, targetId);
        } else if (skill.damage) {
            // 普通伤害技能
            this.executeDamageSkill(attacker, skill, targetId);
            
            // 生成连击点（兼容新旧: comboPoints.generates 或 comboPointsGenerated）
            const generates = skill.comboPoints?.generates || skill.comboPointsGenerated;
            if (generates && attacker.comboPoints) {
                attacker.comboPoints.current = Math.min(
                    attacker.comboPoints.max,
                    attacker.comboPoints.current + generates
                );
                this.addLog(`⚡ ${attacker.name} 获得 ${generates} 个连击点 (${attacker.comboPoints.current}/${attacker.comboPoints.max})`, 'system');
            }
        } else if (skill.heal) {
            // 治疗技能
            this.executeHealSkill(attacker, skill, targetId);
        } else if (skill.effect || (skill.effects && skill.effects.length > 0)) {
            // 纯效果技能（BUFF/DEBUFF/召唤等）
            this.executeEffectSkill(attacker, skill, targetId);
        } else {
            // 未知类型技能
            this.addLog(`⚡ ${attacker.name} 使用了 ${skill.name}`, 'combat');
        }

        // 产生资源（如冲锋产生怒气）
        if (skill.generatesResource) {
            this.addUnitResource(attacker, skill.generatesResource.type, skill.generatesResource.value);
            this.addLog(`💢 ${attacker.name} 获得 ${skill.generatesResource.value} 点${this.getResourceName(skill.generatesResource.type)}`, 'system');
        }
    }

    /**
     * 获取单位当前资源值
     */
    getUnitResource(unit, resourceType) {
        // 优先使用新的 resource 对象
        if (unit.resource && unit.resource.type === resourceType) {
            return unit.resource.current ?? 0;
        }
        
        // 兼容旧字段
        if (resourceType === 'energy') {
            return unit.currentEnergy ?? unit.resource?.current ?? 100;
        }
        if (resourceType === 'rage') {
            return unit.currentRage ?? unit.resource?.current ?? 0;
        }
        if (resourceType === 'mana') {
            return unit.currentMp ?? unit.resource?.current ?? unit.stats?.mana ?? 100;
        }
        return 100;
    }

    /**
     * 消耗单位资源
     */
    consumeUnitResource(unit, resourceType, amount) {
        if (unit.resource && unit.resource.type === resourceType) {
            unit.resource.current = Math.max(0, unit.resource.current - amount);
        } else if (resourceType === 'energy') {
            unit.currentEnergy = Math.max(0, (unit.currentEnergy ?? 100) - amount);
        } else if (resourceType === 'rage') {
            unit.currentRage = Math.max(0, (unit.currentRage ?? 0) - amount);
        } else if (resourceType === 'mana') {
            unit.currentMp = Math.max(0, (unit.currentMp ?? 100) - amount);
        }
    }

    /**
     * 战斗中自动产生资源（普攻/受击触发）
     * @param {Object} unit - 触发的单位
     * @param {'attack'|'damaged'} trigger - 触发类型
     * @param {boolean} isCrit - 是否暴击（仅 attack 时有效）
     */
    generateResourceOnCombat(unit, trigger, isCrit = false) {
        if (!unit.resource) return;

        const resourceType = unit.resource.type;
        const resourceConfig = GameData.resourceSystems?.[resourceType];
        if (!resourceConfig?.generation) return;

        let amount = 0;

        if (trigger === 'attack' && resourceConfig.generation.onAttack) {
            amount = resourceConfig.generation.onAttack;
            if (isCrit && resourceConfig.generation.critMultiplier) {
                amount = Math.floor(amount * resourceConfig.generation.critMultiplier);
            }
        } else if (trigger === 'damaged' && resourceConfig.generation.onHit) {
            amount = resourceConfig.generation.onHit;
        }

        if (amount > 0) {
            this.addUnitResource(unit, resourceType, amount);
            const emoji = resourceConfig.emoji || '🔄';
            this.addLog(`${emoji} ${unit.name} 获得 ${amount} 点${resourceConfig.displayName}`, 'resource');
        }
    }

    /**
     * 增加单位资源
     */
    addUnitResource(unit, resourceType, amount) {
        if (unit.resource && unit.resource.type === resourceType) {
            unit.resource.current = Math.min(unit.resource.max, unit.resource.current + amount);
        } else if (resourceType === 'energy') {
            unit.currentEnergy = Math.min(100, (unit.currentEnergy ?? 100) + amount);
        } else if (resourceType === 'rage') {
            unit.currentRage = Math.min(100, (unit.currentRage ?? 0) + amount);
        } else if (resourceType === 'mana') {
            const max = unit.maxMp || unit.stats?.mana || 100;
            unit.currentMp = Math.min(max, (unit.currentMp ?? 100) + amount);
        }
    }

    /**
     * 回合开始时资源恢复
     * - 能量: 每回合 +perTurn（默认15）
     * - 法力: 每回合 +perTurn（默认5）+ 精神加成
     * - 怒气: 不自动恢复（通过攻击/被击产生）
     */
    regenerateResources() {
        const resourceConfigs = GameData?.resourceSystems;
        if (!resourceConfigs) return;

        this.partyState.members.forEach(member => {
            if (member.currentHp <= 0) return;

            const resType = member.resourceType || member.resource?.type;
            if (!resType) return;

            const config = resourceConfigs[resType];
            if (!config?.generation?.perTurn) return;

            let regenAmount = config.generation.perTurn;

            // 法力可以根据精神加成
            if (resType === 'mana' && config.generation.spiritScaling) {
                const spirit = member.stats?.spirit || 0;
                regenAmount += Math.floor(spirit * config.generation.spiritScaling);
            }

            this.addUnitResource(member, resType, regenAmount);
            
            if (regenAmount > 0) {
                const emoji = config.emoji || '🔄';
                this.addLog(`${emoji} ${member.name} 恢复了 ${regenAmount} 点${config.displayName}`, 'resource', this._getUnitClassColor(member));
            }
        });
    }

    /**
     * 执行终结技（消耗连击点）
     */
    executeFinisherSkill(attacker, skill, targetId) {
        const target = this.battlefield.enemy.find(p => p.unitId === targetId)?.unit;
        if (!target || target.currentHp <= 0) {
            this.addLog('请选择一个有效目标！', 'system');
            return;
        }

        const comboPoints = attacker.comboPoints?.current || 1;
        const damageTable = skill.comboPoints?.damageTable || skill.comboPointsDamage;
        const damageData = damageTable.find(d => d.points === comboPoints) 
            || damageTable[damageTable.length - 1];
        
        const statValue = attacker.stats?.[skill.damage?.stat || 'agility'] || attacker.stats?.agility || 10;
        const damage = Math.floor(damageData.base + (statValue * damageData.scaling));
        
        this.applyDamage(attacker, target, damage, skill.id);
        this.addLog(`💀 ${attacker.name} 使用 ${skill.name} (${comboPoints}连击点)，对 ${target.name} 造成 ${damage} 点伤害！`, 'combat', this._getUnitClassColor(attacker));
        
        // 消耗所有连击点
        if (attacker.comboPoints) {
            attacker.comboPoints.current = 0;
        }

        // 施加附带效果
        this._applySkillEffects(attacker, target, skill);
    }

    /**
     * 执行伤害技能
     */
    executeDamageSkill(attacker, skill, targetId) {
        // 使用 resolveTargets 解析目标（支持多目标）
        const targets = this.resolveTargets(attacker, skill, targetId, 'player');
        if (targets.length === 0) {
            this.addLog('请选择一个有效目标！', 'system');
            return;
        }
        
        // 使用 EffectSystem 归一化伤害计算
        const baseDamage = EffectSystem.resolveSkillDamage(skill, attacker);
        const dmgTypeEmoji = this._getDamageTypeEmoji(skill.damageType);
        let totalDamage = 0;

        for (const target of targets) {
            if (target.currentHp <= 0) continue;
            this.applyDamage(attacker, target, baseDamage, skill.id, { damageType: skill.damageType || 'physical' });
            totalDamage += baseDamage;
            
            // 使用 EffectSystem 施加附带效果（每个目标都施加）
            this._applySkillEffects(attacker, target, skill);
        }

        if (targets.length === 1) {
            this.addLog(`⚡ ${attacker.name} 使用 ${skill.name}，对 ${targets[0].name} 造成 ${baseDamage} 点${dmgTypeEmoji}伤害！`, 'combat');
        } else {
            this.addLog(`⚡ ${attacker.name} 使用 ${skill.name}，对 ${targets.length} 个目标造成 ${baseDamage} 点${dmgTypeEmoji}伤害！`, 'combat');
        }

        // 吸取生命效果
        const effects = EffectSystem.normalizeEffects(skill);
        const lifesteal = effects.find(e => e.type === 'lifesteal');
        if (lifesteal && totalDamage > 0) {
            const healAmount = Math.floor(totalDamage * lifesteal.value);
            if (healAmount > 0) {
                this.applyHealing(attacker, attacker, healAmount);
                this.addLog(`🩸 ${attacker.name} 吸取 ${healAmount} 点生命！`, 'combat');
            }
        }
    }

    /**
     * 执行治疗技能
     */
    executeHealSkill(attacker, skill, targetId) {
        // 使用 resolveTargets 解析目标（支持 all_allies）
        const targets = this.resolveTargets(attacker, skill, targetId, 'player');
        
        // 使用 EffectSystem 归一化治疗计算
        const healAmount = EffectSystem.resolveSkillHeal(skill, attacker);

        for (const healTarget of targets) {
            if (healTarget.currentHp <= 0) continue;
            this.applyHealing(attacker, healTarget, healAmount);

            // 施加附带效果（如恢复术的 HOT）
            this._applySkillEffects(attacker, healTarget, skill);
        }

        if (targets.length === 1) {
            this.addLog(`✨ ${attacker.name} 使用 ${skill.name}，为 ${targets[0].name} 恢复 ${healAmount} 点生命！`, 'combat');
        } else {
            this.addLog(`✨ ${attacker.name} 使用 ${skill.name}，为 ${targets.length} 名队友恢复 ${healAmount} 点生命！`, 'combat');
        }
    }

    /**
     * 执行效果技能
     */
    executeEffectSkill(attacker, skill, targetId) {
        const effects = EffectSystem.normalizeEffects(skill);
        const effectContext = { onSummon: (source, eff) => this._handlePetSummon(source, eff) };
        if (skill.targetType === 'self') {
            EffectSystem.applyEffects(attacker, attacker, effects, effectContext);
            this.addLog(`✨ ${attacker.name} 使用 ${skill.name}！`, 'combat');
        } else if (skill.targetType === 'enemy') {
            const target = this.battlefield.enemy.find(p => p.unitId === targetId)?.unit;
            if (target && target.currentHp > 0) {
                EffectSystem.applyEffects(attacker, target, effects, effectContext);
                this.addLog(`💀 ${attacker.name} 对 ${target.name} 使用 ${skill.name}！`, 'combat');
            }
        } else if (skill.targetType === 'ally') {
            const healTarget = this.partyState.members
                .filter(m => m.currentHp > 0)
                .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
            if (healTarget) {
                EffectSystem.applyEffects(attacker, healTarget, effects, effectContext);
                this.addLog(`✨ ${attacker.name} 对 ${healTarget.name} 使用 ${skill.name}！`, 'combat');
            }
        }
    }

    /**
     * 获取资源名称
     */
    getResourceName(resourceType) {
        const names = {
            rage: '怒气',
            mana: '法力',
            energy: '能量'
        };
        return names[resourceType] || '资源';
    }

    /**
     * 对目标应用技能效果（保留向后兼容，内部委托 EffectSystem）
     */
    applySkillEffectToTarget(target, effect, caster) {
        if (!effect) return;
        EffectSystem.applySingleEffect(caster, target, effect, { onSummon: (source, eff) => this._handlePetSummon(source, eff) });

        // 日志
        if (effect.type === 'buff') {
            this.addLog(`✨ ${target.name} 获得 ${effect.name} 效果！`, 'system');
        } else if (effect.type === 'debuff') {
            const ccName = effect.name === 'stun' ? '眩晕' : effect.name === 'slow' ? '减速' : effect.name === 'fear' ? '恐惧' : effect.name;
            this.addLog(`⬇️ ${target.name} 受到 ${ccName} 效果！`, 'system');
        } else if (effect.type === 'dot') {
            this.addLog(`🔥 ${target.name} 受到 ${effect.name} 效果！`, 'system');
        } else if (effect.type === 'hot') {
            this.addLog(`💚 ${target.name} 获得 ${effect.name} 效果！`, 'system');
        } else if (effect.type === 'cc') {
            const ccText = effect.ccType === 'stun' ? '眩晕' : effect.ccType === 'fear' ? '恐惧' : '控制';
            this.addLog(`💫 ${target.name} 被${ccText}了！`, 'system');
        } else if (effect.type === 'shield') {
            this.addLog(`🛡️ ${target.name} 获得 ${effect.name} 护盾！`, 'system');
        } else if (effect.type === 'summon') {
            this.addLog(`👻 ${caster?.name || '未知'} 召唤了 ${effect.name}！`, 'system');
        }
    }

    /**
     * 施加技能附带的所有效果（统一入口）
     */
    _applySkillEffects(caster, target, skill) {
        const effects = EffectSystem.normalizeEffects(skill);
        if (effects.length === 0) return;

        const effectContext = { onSummon: (source, eff) => this._handlePetSummon(source, eff) };

        for (const effect of effects) {
            if (effect.type === 'lifesteal') continue; // lifesteal 在伤害逻辑中单独处理

            // 确定效果目标
            const effectTarget = (effect.type === 'buff' || effect.type === 'hot' || effect.type === 'shield')
                ? caster
                : target;

            EffectSystem.applySingleEffect(caster, effectTarget, effect, effectContext);

            // 日志
            if (effect.type === 'dot') {
                this.addLog(`🔥 ${effectTarget.name} 受到 ${effect.name} 效果！`, 'system');
            } else if (effect.type === 'hot') {
                this.addLog(`💚 ${effectTarget.name} 获得 ${effect.name} 效果！`, 'system');
            } else if (effect.type === 'buff') {
                this.addLog(`✨ ${effectTarget.name} 获得 ${effect.name} 效果！`, 'system');
            } else if (effect.type === 'debuff') {
                this.addLog(`⬇️ ${effectTarget.name} 受到 ${effect.name} 效果！`, 'system');
            } else if (effect.type === 'cc') {
                const ccText = effect.ccType === 'stun' ? '眩晕' : effect.ccType === 'fear' ? '恐惧' : '控制';
                this.addLog(`💫 ${effectTarget.name} 被${ccText}了！`, 'system');
            } else if (effect.type === 'shield') {
                this.addLog(`🛡️ ${effectTarget.name} 获得 ${effect.name} 护盾！`, 'system');
            }
        }
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
     * 玩家防御
     */
    playerDefend(defender) {
        const apState = this.actionPointStates[defender.id];
        ActionPointSystem.consumePoints(apState, 'defend');
        
        if (!defender.buffs) defender.buffs = [];
        defender.buffs.push({
            name: 'defend',
            value: 0.5,
            duration: 1
        });
        
        this.addLog(`🛡️ ${defender.name} 进入防御姿态`, 'system');
    }

    /**
     * 选择目标
     */
    selectTarget(targetId) {
        this.selectedTarget = targetId;
        this.engine.eventBus.emit('dungeon:targetSelected', { targetId });
    }

    /**
     * 选择技能
     */
    selectSkill(skillId) {
        this.selectedSkill = skillId;
        this.engine.eventBus.emit('dungeon:skillSelected', { skillId });
    }

    /**
     * 回合结束时处理所有单位的 DOT/HOT/buff/debuff 结算
     * 使用 EffectSystem.processEndOfTurn 统一处理
     */
    _processRoundEndEffects() {
        // 收集所有存活单位
        const allUnits = [];

        // 队伍成员
        this.partyState.members.forEach(m => {
            if (m.currentHp > 0) allUnits.push(m);
        });

        // 敌方单位
        const aliveEnemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy');
        aliveEnemies.forEach(pos => {
            if (pos.unit && pos.unit.currentHp > 0) allUnits.push(pos.unit);
        });

        if (allUnits.length === 0) return;

        EffectSystem.processEndOfTurn(allUnits, {
            onDamage: (unit, dmg, source) => {
                this.addLog(`☠️ ${unit.name || '目标'} 受到 ${dmg} 点 ${source} 伤害！`, 'combat');
                // 同步战场 HP
                this._syncBattlefieldHp(unit);
                // DOT伤害浮动数字
                const isPartyMember = this.partyState.members.some(m => m.id === unit.id);
                if (isPartyMember) {
                    this.engine.eventBus.emit('dungeon:damageReceived', {
                        attacker: null, target: unit, damage: dmg, isCrit: false, isDot: true
                    });
                } else {
                    this.engine.eventBus.emit('dungeon:damageDealt', {
                        attacker: null, target: unit, damage: dmg, isCrit: false, isDot: true
                    });
                }
            },
            onHeal: (unit, heal, source) => {
                this.addLog(`💚 ${unit.name || '目标'} 恢复 ${heal} 点生命（${source}）！`, 'combat');
                this._syncBattlefieldHp(unit);
            }
        });

        // 检查是否有单位死亡
        allUnits.forEach(unit => {
            if (unit.currentHp <= 0) {
                this._handleUnitDeath(unit);
            }
        });
    }

    /**
     * 同步单位 HP 到战场状态
     */
    _syncBattlefieldHp(unit) {
        // 尝试在敌方查找
        const enemyPos = this.battlefield.enemy.find(p => p.unitId === unit.id);
        if (enemyPos && enemyPos.unit) {
            enemyPos.unit.currentHp = unit.currentHp;
        }
        // 尝试在玩家方查找
        const playerPos = this.battlefield.player.find(p => p.unitId === unit.id);
        if (playerPos && playerPos.unit) {
            playerPos.unit.currentHp = unit.currentHp;
        }
    }

    /**
     * 处理单位死亡（DOT致死等）
     */
    _handleUnitDeath(unit) {
        // 检查是否为敌方
        const enemyPos = this.battlefield.enemy.find(p => p.unitId === unit.id);
        if (enemyPos) {
            PositioningSystem.markUnitDead(this.battlefield, 'enemy', unit.id);
            TurnOrderSystem.removeDeadUnit(this.turnState, unit.id);
            this.addLog(`💀 ${unit.name} 倒下了！`, 'system');
            this.engine.eventBus.emit('dungeon:unitDied', {
                unit, side: 'enemy', isBoss: !!(unit.isBoss || unit.type === 'boss')
            });
        }
        // 检查是否为队伍成员
        const member = this.partyState.members.find(m => m.id === unit.id);
        if (member && member.currentHp <= 0) {
            const playerPos = this.battlefield.player.find(p => p.unitId === unit.id);
            if (playerPos) {
                PositioningSystem.markUnitDead(this.battlefield, 'player', unit.id);
            }
            TurnOrderSystem.removeDeadUnit(this.turnState, unit.id);
            ThreatSystem.removeDeadPlayer(this.threatState, unit.id);
            this.addLog(`💀 ${unit.name} 倒下了！`, 'system');
            this.engine.eventBus.emit('dungeon:unitDied', {
                unit, side: 'player', isBoss: false
            });
            // 主人阵亡时宠物也阵亡
            const pet = PetCombatSystem.getPet(this.petState, unit.id);
            if (pet && pet.isAlive) {
                PetCombatSystem.onOwnerDeath(this.petState, unit.id);
                this.addLog(`💀 ${pet.emoji} ${pet.displayName} 随主人一同倒下了！`, 'system');
            }
        }
    }

    // ==================== 目标选择逻辑 ====================

    /**
     * 根据 skill.targetType 解析目标列表
     * @param {Object} caster - 施法者
     * @param {Object} skill - 技能数据
     * @param {string} selectedTargetId - 玩家选择的目标ID（可选）
     * @param {string} casterSide - 施法者所在阵营 'player' | 'enemy'
     * @returns {Array} 目标单位数组
     */
    resolveTargets(caster, skill, selectedTargetId, casterSide = 'player') {
        const targetType = skill.targetType || 'enemy';
        const opponentSide = casterSide === 'player' ? 'enemy' : 'player';

        switch (targetType) {
            case 'enemy':
            case 'single': {
                // 单体敌方目标
                if (casterSide === 'player') {
                    const target = this.battlefield.enemy.find(p => p.unitId === selectedTargetId)?.unit;
                    return target && target.currentHp > 0 ? [target] : [];
                } else {
                    const target = this._selectEnemyTarget(caster);
                    return target ? [target] : [];
                }
            }

            case 'all_enemies': {
                // 全体敌方
                if (casterSide === 'player') {
                    return PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(p => p.unit);
                } else {
                    return this.partyState.members.filter(m => m.currentHp > 0);
                }
            }

            case 'front_2': {
                const targets = PositioningSystem.getFrontTargets(this.battlefield, opponentSide === 'enemy' ? 'enemy' : 'player', 2);
                if (casterSide === 'player') {
                    return targets.map(u => this.battlefield.enemy.find(p => p.unitId === u.id)?.unit).filter(Boolean);
                } else {
                    return targets.map(u => this.partyState.members.find(m => m.id === u.id)).filter(Boolean);
                }
            }

            case 'front_3': {
                const targets = PositioningSystem.getFrontTargets(this.battlefield, opponentSide === 'enemy' ? 'enemy' : 'player', 3);
                if (casterSide === 'player') {
                    return targets.map(u => this.battlefield.enemy.find(p => p.unitId === u.id)?.unit).filter(Boolean);
                } else {
                    return targets.map(u => this.partyState.members.find(m => m.id === u.id)).filter(Boolean);
                }
            }

            case 'random_3': {
                let pool;
                if (casterSide === 'player') {
                    pool = PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(p => p.unit);
                } else {
                    pool = this.partyState.members.filter(m => m.currentHp > 0);
                }
                const shuffled = shuffle([...pool]);
                return shuffled.slice(0, Math.min(3, shuffled.length));
            }

            case 'cleave_3': {
                // 选中目标 + 左右相邻单位
                const cleaveSide = casterSide === 'player' ? 'enemy' : 'player';
                let primaryTarget;
                if (casterSide === 'player') {
                    primaryTarget = this.battlefield.enemy.find(p => p.unitId === selectedTargetId)?.unit;
                } else {
                    primaryTarget = this._selectEnemyTarget(caster);
                }
                if (!primaryTarget || primaryTarget.currentHp <= 0) return [];
                const { primary, splash } = PositioningSystem.getAdjacentTargets(this.battlefield, cleaveSide, primaryTarget.id);
                if (!primary) return [];
                // 主目标放第一个，溅射目标在后
                return [primary, ...splash].filter(t => t.currentHp > 0);
            }

            case 'self': {
                return [caster];
            }

            case 'ally': {
                // 单体友方（通常选血量最低的）
                if (casterSide === 'player') {
                    const injured = this.partyState.members
                        .filter(m => m.currentHp > 0 && m.currentHp < m.maxHp)
                        .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
                    return injured.length > 0 ? [injured[0]] : [caster];
                }
                return [caster];
            }

            case 'all_allies': {
                if (casterSide === 'player') {
                    return this.partyState.members.filter(m => m.currentHp > 0);
                }
                return PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(p => p.unit);
            }

            default:
                // 默认单体敌方
                if (casterSide === 'player') {
                    const target = this.battlefield.enemy.find(p => p.unitId === selectedTargetId)?.unit;
                    return target && target.currentHp > 0 ? [target] : [];
                }
                return [];
        }
    }

    // ==================== 宠物召唤处理 ====================

    /**
     * 处理副本中的宠物召唤 — EffectSystem 的 onSummon 回调
     * 统一使用 PetCombatSystem.createPetFromConfig
     */
    _handlePetSummon(source, effect) {
        if (!source) return;
        
        const summonType = effect.summonType;
        const summonId = effect.summonId;
        const ownerId = source.id;
        
        // 如果有指定 summonId，直接召唤
        if (summonId) {
            this._doDungeonSummon(source, summonId);
            return;
        }
        
        // 判断是否需要弹窗选择
        if (summonType === 'pet') {
            const hasBeastMastery = this._hasBeastMasteryTalent(source);
            if (!hasBeastMastery) {
                this._doDungeonSummon(source, 'wolf');
            } else {
                const available = PetCombatSystem.getAvailableSummons(source, true);
                this.engine.eventBus.emit('dungeon:showSummonPanel', {
                    summons: available,
                    callback: (selectedId) => this._doDungeonSummon(source, selectedId)
                });
            }
        } else if (summonType === 'demon') {
            const available = PetCombatSystem.getAvailableSummons(source, false);
            if (available.filter(s => s.unlocked).length === 1) {
                this._doDungeonSummon(source, available.find(s => s.unlocked).id);
            } else {
                this.engine.eventBus.emit('dungeon:showSummonPanel', {
                    summons: available,
                    callback: (selectedId) => this._doDungeonSummon(source, selectedId)
                });
            }
        }
    }

    /**
     * 执行副本中的实际召唤
     */
    _doDungeonSummon(source, summonId) {
        const pet = PetCombatSystem.createPetFromConfig(source, summonId);
        if (!pet) return;
        
        // 自动选择第一个存活的敌方目标
        const aliveEnemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy');
        pet.currentTarget = aliveEnemies.length > 0 ? aliveEnemies[0].unit.id : null;
        
        // 移除旧宠物（如有）
        PetCombatSystem.removePet(this.petState, source.id);
        PetCombatSystem.addPetToState(this.petState, pet);
        
        // 同步回 player.activePet
        const player = this.engine.stateManager.get('player');
        if (player) {
            player.activePet = { ...pet };
            this.engine.stateManager.set('player', player);
        }
        
        this.addLog(`${pet.emoji} ${pet.name} 响应了召唤！`, 'system');
        this.engine.eventBus.emit('dungeon:petSummoned', { pet });
        this.saveCombatState();
    }

    /**
     * 检查是否有野兽控制天赋
     */
    _hasBeastMasteryTalent(source) {
        if (!source.talents) return false;
        return source.talents.some(t => t.id === 'beastMasteryTalent' && t.currentPoints > 0);
    }

    // ==================== 回合结束 ====================

    /**
     * 结束当前单位回合
     */
    endCurrentUnitTurn() {
        // 处理宠物攻击
        const current = TurnOrderSystem.getCurrentUnit(this.turnState);
        if (current && current.side === 'player') {
            // 自动为宠物分配目标（如果没有目标或目标已死亡）
            const pet = PetCombatSystem.getPet(this.petState, current.unitId);
            if (pet && pet.isAlive) {
                const aliveEnemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy');
                if (!pet.currentTarget || !aliveEnemies.find(e => e.unit.id === pet.currentTarget)) {
                    if (aliveEnemies.length > 0) {
                        pet.currentTarget = aliveEnemies[0].unit.id;
                    }
                }
            }
            
            const petAttack = PetCombatSystem.performAutoAttack(this.petState, current.unitId);
            if (petAttack) {
                const target = this.battlefield.enemy.find(p => p.unitId === petAttack.targetId)?.unit;
                if (target) {
                    this.applyDamage({ id: petAttack.petId, name: petAttack.petName }, 
                        target, petAttack.damage);
                    const skillText = petAttack.skill ? ` 使用 ${petAttack.skill.name}，` : ' 攻击 ';
                    this.addLog(`${petAttack.emoji} ${petAttack.petName}${skillText}${target.name}，造成 ${petAttack.damage} 点伤害`, 'combat');
                }
            }
            
            // 宠物技能冷却递减 + 限时检查
            PetCombatSystem.tickCooldowns(this.petState, current.unitId);
            const expired = PetCombatSystem.tickTimeLimited(this.petState, current.unitId);
            if (expired) {
                const expiredPet = PetCombatSystem.getPet(this.petState, current.unitId);
                this.addLog(`💀 ${expiredPet?.displayName || expiredPet?.name || '召唤物'} 的召唤时间结束了！`, 'system');
            }
        }

        // 清除当前行动单位
        this.currentActingUnit = null;
        this.waitingForPlayerInput = false;

        TurnOrderSystem.endCurrentTurn(this.turnState);
        this.saveCombatState();
        
        // 更新UI
        this.engine.eventBus.emit('dungeon:combatUpdate', this.getCombatDisplayState());
        
        // 延迟处理下一个回合（胜利时中断）
        this._setTimeout(() => {
            if (!this.encounterVictory) {
                this.processNextTurn();
            }
        }, 800);
    }

    // ==================== 战斗结束 ====================

    /**
     * 检查战斗结束
     */
    checkCombatEnd() {
        // 防重入：如果已经在处理胜利/失败，不要重复触发
        if (this.encounterVictory || this.encounterDefeated) return true;

        const aliveEnemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy');
        const alivePlayers = this.partyState.members.filter(m => m.currentHp > 0);

        if (aliveEnemies.length === 0) {
            this.handleEncounterVictory();
            return true;
        }

        if (alivePlayers.length === 0) {
            this.handleEncounterDefeat();
            return true;
        }

        return false;
    }

    /**
     * 遭遇战胜利
     */
    handleEncounterVictory() {
        this.addLog(`🎉 遭遇战胜利！`, 'system');
        
        // 立刻中断战斗循环
        this.executingSequence = false;
        this.waitingForPlayerInput = false;
        this.planningPhase = false;
        this.encounterVictory = true; // 标记胜利，阻止后续回合处理
        
        // 计算遭遇战经验奖励（每只敌人 loot.exp，含 ±10% 浮动和等级差惩罚）
        const player = this.engine.stateManager.get('player');
        if (player && this.currentEncounterEnemies) {
            let totalExp = 0;
            let hasPenalty = false;
            const playerLevel = player.level;
            
            for (const enemy of this.currentEncounterEnemies) {
                const baseExp = enemy.loot?.exp || 0;
                if (baseExp <= 0) continue;
                
                const variation = 1 + (random() * 0.2 - 0.1);
                let exp = Math.max(1, Math.floor(baseExp * variation));
                
                // 等级差惩罚（使用副本推荐等级作为怪物等级参考）
                const monsterLevel = enemy.level || this.currentDungeon?.levelRange?.min || 1;
                const levelDiff = playerLevel - monsterLevel;
                let penaltyMultiplier = 1.0;
                if (levelDiff >= 7) penaltyMultiplier = 0;
                else if (levelDiff >= 5) penaltyMultiplier = 0.5;
                else if (levelDiff >= 3) penaltyMultiplier = 0.7;
                
                if (penaltyMultiplier < 1.0) hasPenalty = true;
                totalExp += Math.floor(exp * penaltyMultiplier);
            }
            
            if (totalExp > 0) {
                this.addLog(`⭐ +${totalExp} 经验值${hasPenalty ? ' (等级惩罚)' : ''}`, 'system');
                this.engine.eventBus.emit('exp:gain', totalExp);
            }
        }
        
        this.encounterIndex++;
        
        // 波次结束后立即复活阵亡队友（以20%最大HP复活）
        for (const member of this.partyState.members) {
            if (member.currentHp <= 0) {
                const reviveHp = Math.max(1, Math.floor(member.maxHp * 0.2));
                member.currentHp = reviveHp;
                this.addLog(`🔄 ${member.name} 以 ${reviveHp} 点生命值复活了！`, 'system');
                // 同步战场状态
                const pos = this.battlefield?.player?.find(p => p.unitId === member.id);
                if (pos && pos.unit) {
                    pos.unit.currentHp = reviveHp;
                    pos.unit.isAlive = true;
                }
            }
        }
        this._syncPlayerToState();
        
        const hasNextEncounter = this.encounterIndex < this.currentDungeon.encounters.length;
        
        // 发出遭遇战胜利事件，进入短暂休息界面
        this.engine.eventBus.emit('dungeon:encounterVictory', {
            hasNextEncounter,
            encounterIndex: this.encounterIndex,
            totalEncounters: this.currentDungeon.encounters.length,
            party: this.partyState.members.map(m => ({
                ...m,
                currentHp: m.currentHp,
                maxHp: m.maxHp
            }))
        });
        
        // autoPlayMode（集合石多人模式）：立即恢复至满，然后延迟后继续下一场
        if (this.autoPlayMode) {
            // 一次性恢复所有存活队员的 HP 和资源至满
            for (const member of this.partyState.members) {
                if (member.currentHp <= 0) continue;
                member.currentHp = member.maxHp;
                if (member.resource && member.resource.type !== 'rage') {
                    member.resource.current = member.resource.max;
                }
                // 同步战场状态
                const pos = this.battlefield?.player?.find(p => p.unitId === member.id);
                if (pos && pos.unit) {
                    pos.unit.currentHp = member.currentHp;
                }
            }
            this._syncPlayerToState();
            this.addLog('🏕️ 队伍短暂休息，全员恢复完毕！', 'system');

            const autoDelay = hasNextEncounter ? 2500 : 1500;
            this._setTimeout(() => {
                if (hasNextEncounter) {
                    this.proceedToNextEncounter();
                } else {
                    this.completeDungeon();
                }
            }, autoDelay);
        }
    }

    /**
     * 短暂休息：逐步恢复队伍 HP 和资源至满
     * @param {function} onTick - 每次恢复 tick 回调（用于 UI 更新）
     * @param {function} onComplete - 恢复完成回调
     */
    startShortRest(onTick, onComplete) {
        this.addLog(`🏕️ 队伍进入短暂休息...`, 'system');
        
        const restInterval = setInterval(() => {
            let allFull = true;
            
            for (const member of this.partyState.members) {
                if (member.currentHp <= 0) continue; // 已阵亡的不恢复（波次结束时已以20%HP复活）
                
                // 恢复 HP（每次 10%）
                if (member.currentHp < member.maxHp) {
                    member.currentHp = Math.min(member.maxHp, member.currentHp + Math.ceil(member.maxHp * 0.1));
                    allFull = false;
                }
                
                // 恢复资源（法力/能量，怒气除外）
                if (member.resource && member.resource.type !== 'rage' && member.resource.current < member.resource.max) {
                    member.resource.current = Math.min(member.resource.max, member.resource.current + Math.ceil(member.resource.max * 0.1));
                    allFull = false;
                }
                
                // 同步战场状态
                const pos = this.battlefield?.player?.find(p => p.unitId === member.id);
                if (pos && pos.unit) {
                    pos.unit.currentHp = member.currentHp;
                }
            }
            
            // 同步玩家数据回 stateManager
            this._syncPlayerToState();
            
            if (onTick) onTick(this.partyState.members);
            
            // 恢复宠物 HP
            if (this.petState) {
                for (const pet of Object.values(this.petState.pets)) {
                    if (pet.currentHp < pet.maxHp) {
                        pet.currentHp = Math.min(pet.maxHp, pet.currentHp + Math.ceil(pet.maxHp * 0.1));
                        pet.isAlive = true;
                        allFull = false;
                    }
                }
            }

            if (allFull) {
                clearInterval(restInterval);
                this.addLog(`✅ 队伍恢复完毕！`, 'system');
                if (onComplete) onComplete();
            }
        }, 300);
        
        return restInterval;
    }

    /**
     * 继续下一场遭遇战
     * 清除临时 buff/debuff，重置冷却，保留当前 HP 和资源
     */
    proceedToNextEncounter() {
        this.encounterVictory = false;
        this.encounterDefeated = false;
        
        // 清除临时 buff 和 debuff
        for (const member of this.partyState.members) {
            if (member.buffs) member.buffs = [];
            if (member.debuffs) member.debuffs = [];
            if (member.effects) member.effects = [];
            if (member.shields) member.shields = [];
            // 重置技能冷却
            if (member.skillCooldowns) {
                for (const key of Object.keys(member.skillCooldowns)) {
                    member.skillCooldowns[key] = 0;
                }
            }
        }
        
        // 复活阵亡的友军单位（以20%血量复活）
        for (const member of this.partyState.members) {
            if (member.currentHp <= 0) {
                const reviveHp = Math.max(1, Math.floor(member.maxHp * 0.2));
                member.currentHp = reviveHp;
                this.addLog(`🔄 ${member.name} 以 ${reviveHp} 点生命值复活了！`, 'system');
            }
        }
        
        // 同步玩家数据
        this._syncPlayerToState();
        
        // 检查是否还有下一场
        if (this.encounterIndex < this.currentDungeon.encounters.length) {
            this.startNextEncounter();
        } else {
            this.completeDungeon();
        }
    }

    /**
     * 同步玩家角色数据回 stateManager
     */
    _syncPlayerToState() {
        const playerMember = this.partyState.members.find(m => m.isPlayer);
        if (playerMember) {
            const player = this.engine.stateManager.get('player');
            if (player) {
                player.currentHp = playerMember.currentHp;
                if (playerMember.resource) {
                    player.resource = { ...playerMember.resource };
                }
                // 同步 buff/debuff 状态
                player.buffs = playerMember.buffs ? [...playerMember.buffs] : [];
                player.debuffs = playerMember.debuffs ? [...playerMember.debuffs] : [];
                this.engine.stateManager.set('player', player);
            }
        }
    }

    /**
     * 遭遇战失败
     */
    handleEncounterDefeat() {
        this.encounterDefeated = true;
        this.addLog(`💀 队伍全灭！副本失败...`, 'system');
        this.inDungeonCombat = false;
        
        if (this.autoPlayMode) {
            // 多人模式：不扣经验/金币，不存档，仅触发失败事件
            this.addLog(`💀 [集合石] 副本失败！`, 'system');
            this.engine.eventBus.emit('dungeon:defeat', { isMultiplayer: true });
            // 不自动切场景，由 MultiplayerDungeonAdapter 处理
        } else {
            // 单人模式：原有逻辑
            const player = this.engine.stateManager.get('player');
            if (player) {
                if (player.level >= 60) {
                    const goldLost = Math.floor(player.gold * 0.1);
                    player.gold -= goldLost;
                    if (goldLost > 0) {
                        this.addLog(`💸 损失 ${goldLost} 金币`, 'system');
                    }
                } else {
                    const expLost = Math.floor(player.experience * 0.3);
                    if (expLost > 0) {
                        player.experience = Math.max(0, player.experience - expLost);
                        this.addLog(`💀 损失 ${expLost} 经验值`, 'system');
                    }
                }
                this.engine.stateManager.set('player', player);
            }
            
            // 重置玩家资源状态（连击点清零、启动脱战恢复）
            this.resetPlayerStateAfterDungeon();
            
            this.engine.eventBus.emit('dungeon:defeat');
            
            // 返回主界面
            this._setTimeout(() => {
                this.engine.eventBus.emit('scene:change', 'exploration');
            }, 2000);
        }
    }

    /**
     * 完成副本
     */
    completeDungeon() {
        this.addLog(`🏆 副本通关：${this.currentDungeon.name}！`, 'system');
        this.inDungeonCombat = false;
        
        const rewards = this.currentDungeon.rewards;
        
        if (this.autoPlayMode) {
            // 多人模式：不修改本地玩家状态，不存档，仅触发完成事件
            // 奖励由服务端独立计算并通过 battle:loot 下发
            this.addLog(`🎯 [集合石] 副本通关！等待服务器结算...`, 'system');
            
            this.engine.eventBus.emit('dungeon:complete', {
                dungeon: this.currentDungeon,
                rewards,
                isMultiplayer: true
            });
            // 多人模式不自动切场景，由 MultiplayerDungeonAdapter 处理后续流程
        } else {
            // 单人模式：原有逻辑
            const player = this.engine.stateManager.get('player');
            
            player.gold += rewards.goldBase;
            this.engine.eventBus.emit('exp:gain', rewards.expBase);
            
            this.addLog(`💰 获得 ${rewards.goldBase} 金币`, 'system');
            this.addLog(`✨ 获得 ${rewards.expBase} 经验值`, 'system');
            
            this.engine.eventBus.emit('loot:log', `💰 +${rewards.goldBase} 金币 — ${this.currentDungeon.name}`);
            
            this.engine.stateManager.set('player', player);
            
            // 重置玩家资源状态（连击点清零、启动脱战恢复）
            this.resetPlayerStateAfterDungeon();
            
            this.engine.eventBus.emit('dungeon:complete', {
                dungeon: this.currentDungeon,
                rewards
            });
            
            // 副本通关自动存档（保存到当前活跃槽位）
            this.engine.saveGame();
            this.addLog(`💾 副本通关，自动存档完成`, 'system');
            
            // 返回主界面
            this._setTimeout(() => {
                this.engine.eventBus.emit('scene:change', 'exploration');
            }, 2000);
        }
    }

    // ==================== 副本退出清理 ====================

    /**
     * 副本结束后重置玩家资源状态
     * - 重置连击点（不应带出副本）
     * - 触发脱战能量恢复计时
     * - 同步副本中的资源消耗回主角色
     */
    resetPlayerStateAfterDungeon() {
        const player = this.engine.stateManager.get('player');
        if (!player) return;

        // 副本失败时以20%血量复活（防止0血回到探索界面）
        if (player.currentHp <= 0) {
            player.currentHp = Math.floor(player.maxHp * 0.2);
            this.addLog(`💫 角色以 ${player.currentHp}/${player.maxHp} HP 复活`, 'system');
        }

        // 重置连击点（副本中的连击点不应带到野外）
        if (player.comboPoints) {
            player.comboPoints.current = 0;
        }

        // 副本结束：怒气清零（怒气是战斗资源，不应带出副本）
        if (player.resource && player.resource.type === 'rage') {
            player.resource.current = 0;
        }

        // 清理战斗中产生的临时 buff/debuff
        if (player.buffs) player.buffs = [];
        if (player.debuffs) player.debuffs = [];

        // 确保能量开始脱战恢复：通知 CombatSystem 设置 outOfCombatTime
        const combatSystem = this.engine.getSystem('combat');
        if (combatSystem) {
            combatSystem.outOfCombatTime = Date.now();
            combatSystem.inCombat = false;
        }

        this.engine.stateManager.set('player', player);
    }

    // ==================== 状态管理 ====================

    /**
     * 保存战斗状态
     */
    saveCombatState() {
        this.engine.stateManager.set('dungeonCombat', {
            inCombat: this.inDungeonCombat,
            battlefield: this.battlefield,
            turnState: this.turnState,
            bossState: this.bossState,
            partyState: this.partyState
        });
    }

    /**
     * 获取指定单位的行动预测（用于UI hover提示）
     * @param {string} unitId - 单位ID
     * @returns {Object|null} 行动预测信息
     */
    getActionPreview(unitId) {
        if (!this.turnState || !this.partyState || !this.battlefield) return null;

        // 在 turnOrder 中找到该单位
        const turnEntry = this.turnState.turnOrder.find(e => e.unitId === unitId);
        if (!turnEntry) return null;

        const unit = turnEntry.unit;
        const side = turnEntry.side;

        if (side === 'player') {
            return this._getPlayerActionPreview(unit, unitId);
        } else {
            return this._getEnemyActionPreview(unit);
        }
    }

    /**
     * 获取我方单位行动预测
     */
    _getPlayerActionPreview(unit, unitId) {
        // 找到完整的 member 数据（含 role）
        const member = this.partyState.members.find(m => m.id === unitId);
        if (!member) return null;

        // 玩家控制的角色
        if (member.isPlayer) {
            // 如果规划阶段已部署行动，展示具体行动预览
            if (this.planningPhase && this.plannedAction) {
                return this._buildPlannedActionPreview(member, unitId);
            }
            // 未部署行动
            return {
                attackerId: unitId,
                attackerName: member.name,
                attackerSide: 'player',
                targetId: null,
                targetName: null,
                targetSide: null,
                skillName: null,
                isHeal: false,
                amount: null,
                isPlayerControlled: true,
                hasPlannedAction: false
            };
        }

        const role = member.role;

        // 治疗优先检查
        if (role === 'healer') {
            const injured = this.partyState.members
                .filter(m => m.currentHp > 0 && m.currentHp < m.maxHp)
                .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
            if (injured.length > 0) {
                const target = injured[0];
                const healAmount = Math.floor((member.stats?.intellect || 20) * 1.5);
                return {
                    attackerId: unitId,
                    attackerName: member.name,
                    attackerSide: 'player',
                    targetId: target.id,
                    targetName: target.name,
                    targetSide: 'player',
                    skillName: '治疗术',
                    isHeal: true,
                    amount: healAmount
                };
            }
            // 无人受伤，退回 DPS
        }

        // 选择敌方目标
        const enemies = PositioningSystem.getAliveUnits(this.battlefield, 'enemy');
        if (enemies.length === 0) return null;

        let target, damage, skillName;

        if (role === 'tank') {
            target = enemies[0].unit;
            damage = member.stats?.strength || 20;
            skillName = '嘲讽';
        } else if (role === 'ranged_dps') {
            target = enemies.sort((a, b) =>
                (a.unit.currentHp / a.unit.maxHp) - (b.unit.currentHp / b.unit.maxHp)
            )[0].unit;
            const classId = member.classId;
            if (classId === 'hunter') {
                damage = Math.floor((member.stats?.agility || 20) * 1.3);
                skillName = '稳固射击';
            } else if (classId === 'mage') {
                damage = Math.floor((member.stats?.intellect || 20) * 1.4);
                skillName = '火球术';
            } else if (classId === 'warlock') {
                damage = Math.floor((member.stats?.intellect || 20) * 1.3);
                skillName = '暗影箭';
            } else {
                damage = member.stats?.agility || member.stats?.intellect || 20;
                skillName = '远程攻击';
            }
        } else if (role === 'melee_dps') {
            target = enemies.sort((a, b) => a.unit.currentHp - b.unit.currentHp)[0].unit;
            damage = Math.floor((member.stats?.strength || member.stats?.agility || 20) * 1.2);
            skillName = '近战攻击';
        } else {
            target = enemies.sort((a, b) => a.unit.currentHp - b.unit.currentHp)[0].unit;
            damage = member.stats?.strength || member.stats?.agility || 20;
            skillName = '攻击';
        }

        return {
            attackerId: unitId,
            attackerName: member.name,
            attackerSide: 'player',
            targetId: target.id,
            targetName: target.name,
            targetSide: 'enemy',
            skillName,
            isHeal: false,
            amount: damage
        };
    }

    /**
     * 根据 plannedAction 构建玩家角色的行动预览
     */
    _buildPlannedActionPreview(member, unitId) {
        const action = this.plannedAction;
        const base = {
            attackerId: unitId,
            attackerName: member.name,
            attackerSide: 'player',
            isPlayerControlled: true,
            hasPlannedAction: true
        };

        if (action.type === 'defend') {
            return {
                ...base,
                targetId: unitId,
                targetName: member.name,
                targetSide: 'player',
                skillName: '防御',
                isHeal: false,
                isDefend: true,
                amount: null
            };
        }

        // 攻击或技能 — 找到目标
        let target = null;
        let targetSide = 'enemy';
        if (action.targetId) {
            // 先在敌方找
            const enemyPos = this.battlefield.enemy.find(p => p.unitId === action.targetId);
            if (enemyPos) {
                target = enemyPos.unit;
                targetSide = 'enemy';
            } else {
                // 再在我方找（治疗技能）
                const ally = this.partyState.members.find(m => m.id === action.targetId);
                if (ally) {
                    target = ally;
                    targetSide = 'player';
                }
            }
        }

        if (action.type === 'attack') {
            const damage = member.stats?.strength || member.stats?.agility || 20;
            return {
                ...base,
                targetId: target?.id || null,
                targetName: target?.name || '未知目标',
                targetSide,
                skillName: '普通攻击',
                isHeal: false,
                amount: damage
            };
        }

        if (action.type === 'skill') {
            const skill = GameData?.skills?.[action.skillId];
            const isHeal = skill?.type === 'heal' || skill?.targetType === 'self' || skill?.isHeal;
            let amount = null;
            if (isHeal) {
                amount = Math.floor((member.stats?.intellect || 20) * 1.5);
            } else {
                amount = Math.floor((member.stats?.intellect || member.stats?.strength || member.stats?.agility || 20) * 1.3);
            }
            return {
                ...base,
                targetId: target?.id || unitId,
                targetName: target?.name || member.name,
                targetSide: target ? targetSide : 'player',
                skillName: skill?.name || '技能',
                isHeal,
                amount
            };
        }

        // fallback
        return {
            ...base,
            targetId: null,
            targetName: null,
            targetSide: null,
            skillName: null,
            isHeal: false,
            amount: null,
            hasPlannedAction: false
        };
    }

    /**
     * 获取敌方单位行动预测
     */
    _getEnemyActionPreview(enemy) {
        const target = this._selectEnemyTarget(enemy);
        if (!target) return null;

        const damage = enemy.damage || 15;
        return {
            attackerId: enemy.id,
            attackerName: enemy.name,
            attackerSide: 'enemy',
            targetId: target.id,
            targetName: target.name,
            targetSide: 'player',
            skillName: '攻击',
            isHeal: false,
            amount: damage
        };
    }

    /**
     * 获取战斗显示状态（用于UI）
     */
    getCombatDisplayState() {
        const currentUnit = TurnOrderSystem.getCurrentUnit(this.turnState);
        
        return {
            // 当前行动单位ID
            currentUnitId: currentUnit?.unitId || null,
            
            // 遭遇战名称
            encounterName: this.currentEncounter?.name || '',
            
            // 队伍信息
            party: PartyFormationSystem.getPartyDisplayInfo(this.partyState),
            
            // 敌人信息（包含死亡单位，以支持死亡动画播放）
            enemies: this.battlefield.enemy
                .filter(pos => pos.isOccupied)
                .map(pos => ({
                    id: pos.unit.id,
                    name: pos.unit.name,
                    icon: pos.unit.icon || '',
                    emoji: pos.unit.emoji,
                    type: pos.unit.type,
                    isBoss: pos.unit.isBoss || pos.unit.type === 'boss',
                    slot: pos.slot,
                    currentHp: pos.unit.currentHp,
                    maxHp: pos.unit.maxHp,
                    hp: {
                        current: pos.unit.currentHp,
                        max: pos.unit.maxHp,
                        percent: pos.unit.maxHp > 0 ? Math.round((pos.unit.currentHp / pos.unit.maxHp) * 100) : 0
                    },
                    resource: pos.unit.resource || null,
                    buffs: pos.unit.buffs || [],
                    debuffs: pos.unit.debuffs || []
                })),
            
            // 回合顺序
            turnOrder: TurnOrderSystem.getTurnOrderPreview(this.turnState),
            currentRound: this.turnState?.currentRound || 1,
            
            // BOSS信息
            boss: this.bossState ? BossPhaseSystem.getDisplayInfo(this.bossState) : null,
            
            // 宠物信息
            pets: PetCombatSystem.getAllPetsDisplayInfo(this.petState),
            
            // 当前行动单位的行动点
            playerActionPoints: this.currentActingUnit && this.actionPointStates[this.currentActingUnit.id]
                ? ActionPointSystem.getDisplayInfo(this.actionPointStates[this.currentActingUnit.id])
                : null,
            
            // 仇恨信息（坦克可见）
            threat: this.partyState?.playerMember?.role === 'tank'
                ? ThreatSystem.getThreatDisplayForPlayer(
                    this.threatState,
                    this.partyState.playerMember.id,
                    PositioningSystem.getAliveUnits(this.battlefield, 'enemy').map(p => p.unit.id)
                )
                : null
        };
    }

    /**
     * 获取单位的职业颜色（队友/玩家）
     */
    _getUnitClassColor(unit) {
        if (!unit) return null;
        const classId = unit.classId || unit.class;
        if (!classId) return null;
        const cls = GameData.classes[classId];
        return cls?.color || null;
    }

    /**
     * 添加日志
     */
    addLog(message, type = 'normal', color = null) {
        const entry = {
            message,
            type,
            timestamp: Date.now(),
            color
        };
        this.combatLog.push(entry);
        this.engine.eventBus.emit('dungeon:log', entry);
    }
}

