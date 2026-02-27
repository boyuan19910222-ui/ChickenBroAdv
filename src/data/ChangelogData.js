export const changelogs = [
  {
    version: "v1.6.0",
    date: "2026-02-27",
    title: "服务端权威波次生成 & 断线重连恢复优化",
    content: [
      "新增：服务端 WaveGenerator 在战斗启动时一次性生成全部波次敌人快照（EnemySnapshot[]），写入 battle_state.waves",
      "新增：battle:init 携带 waves[] 字段下发，客户端直接使用，消除各客户端 RNG 偏移导致的波次不一致",
      "新增：DungeonCombatSystem 支持外部波次注入（options.waves），直接使用服务端敌人数据，跳过客户端随机生成",
      "新增：MultiplayerDungeonAdapter 优先使用服务端 waves，initData.waves 缺失时降级走原有 seed 逻辑（向后兼容）",
      "新增：断线重连 battle:init resend 携带 waves，确保重连玩家与队友看到相同波次",
      "新增：battle:restore 场景支持待领奖励弹窗（GameView），断线前通关奖励可在大厅界面领取",
      "修复：战斗结算改为仅等待在线真人玩家，离线玩家不再阻塞结算流程",
      "修复：重连时同步恢复 BattleEngine party unit.isOnline，确保掉落计算包含重连玩家",
      "修复：关闭奖励弹窗后正确清理 userRoomMap（不再因有奖励而跳过清理）",
      "优化：多人模式 dungeon:complete 跳过客户端本地掉落生成，由服务端统一结算"
    ]
  },
  {
    version: "v1.5.0",
    date: "2026-02-26",
    title: "多人联机状态同步与奖励系统",
    content: [
      "新增：战斗结束后的奖励分发系统，副本胜利后为在线真人玩家生成战利品",
      "新增：奖励持久化至 rooms.rewards 列，断线重连后仍可领取",
      "新增：战斗状态同步机制（battle_state JSON），包含怪物位置、血量、回合数",
      "新增：单调递进验证，只接受更新的战斗状态更新，防止状态回退",
      "新增：断线重连时从数据库恢复战斗状态，确保所有玩家看到相同怪物",
      "新增：战斗结束后奖励持久化，通过 battle:reward 事件推送给玩家",
      "新增：支持重连到已结束的战斗，获取战斗结果和奖励",
      "新增：WebSocket 事件文档（battle:init, battle:update, battle:finished, battle:restore, battle:reward）",
      "修复：副本结束后玩家无法获得奖励的问题",
      "修复：断线重连后怪物状态不一致的问题",
      "优化：RoomManager 新增 updateBattleState, updateRoomRewards, getBattleState, getRoomRewards 方法"
    ]
  },
  {
    version: "v1.4.0",
    date: "2026-02-26",
    title: "多人服务端持久化 & 断线重连增强",
    content: [
      "新增：聊天消息持久化至 chat_messages 表，服务重启后大厅历史可恢复（write-behind 异步写库）",
      "新增：职业配置入库（class_configs 表），服务启动时从 DB 加载，支持热重载无需重部署",
      "新增：房间状态持久化（rooms 表），服务重启后自动恢复 waiting 状态房间并重启倒计时",
      "新增：战斗状态持久化（battle_state 列），断线重连时服务端重发 battle:init 恢复战斗",
      "新增：服务重启后自动恢复 in_battle 房间到内存，支持玩家断线重连续战",
      "新增：副本波次进度追踪，断线重连后从正确波次继续，不再从头开始",
      "新增：副本战斗界面顶部显示「第 X / N 波」波次进度徽章",
      "修复：服务重启后创建房间误报「你已经在一个房间中」的问题（stale userRoomMap 清理）",
      "修复：多人模式 dungeon:encounterVictory 事件触发 partyState 空指针崩溃",
      "修复：gameStore.dungeonCombatSystem getter 多人模式下返回错误系统实例",
      "修复：等待房间断线重连后玩家显示离线、开始战斗按钮消失的问题",
      "优化：服务启动改为异步序列（loadClassConfigs → loadHistory → recoverRooms → recoverInBattleRooms）"
    ]
  },
  {
    version: "v1.3.0",
    date: "2026-02-26",
    commit: "5ea4c8e",
    title: "数据库架构重构（MySQL + Sequelize）",
    content: [
      "重构：服务端持久化从本地 SQLite 切换为线上 MySQL，接入 Sequelize ORM",
      "新增：统一数据模型（users / characters / battle_records）与数据库迁移脚本",
      "兼容：保留原 statements 调用语义，通过异步适配层实现接口无感升级",
      "增强：新增数据库健康检查与全局连接异常处理（不可用时返回 503）",
      "新增：SQLite → MySQL 一次性迁移脚本，支持 --dry-run 与 --env=production",
      "优化：启动脚本支持开发/生产环境选择，并按环境加载 .env 配置"
    ]
  }
];
