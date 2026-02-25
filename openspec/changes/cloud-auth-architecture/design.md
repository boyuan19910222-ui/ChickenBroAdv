# 架构设计文档

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              系统架构图                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌─────────────┐                               │
│                              │   客户端    │                               │
│                              │  (Vue 3)    │                               │
│                              └──────┬──────┘                               │
│                                     │                                       │
│                    ┌────────────────┼────────────────┐                     │
│                    │ HTTP (REST API)│  Socket.IO     │                     │
│                    ▼                ▼                ▼                     │
│              ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│              │ 认证API  │    │ 角色API  │    │ 联机服务 │                 │
│              │ /api/auth│    │ /api/char│    │ 房间/战斗│                 │
│              └────┬─────┘    └────┬─────┘    └────┬─────┘                 │
│                   │               │               │                        │
│                   └───────────────┼───────────────┘                        │
│                                   ▼                                        │
│                            ┌───────────┐                                   │
│                            │  SQLite   │                                   │
│                            │ 数据库    │                                   │
│                            └───────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. 用户流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户流程图                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                           │
│  │   启动游戏  │                                                           │
│  └──────┬──────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐     有有效token      ┌─────────────┐                      │
│  │ 检查本地    │─────────────────────▶│ 自动登录    │                      │
│ │ token       │                       └──────┬──────┘                      │
│  └──────┬──────┘                              │                             │
│         │ 无token或过期                       │                             │
│         ▼                                     │                             │
│  ┌─────────────┐                              │                             │
│  │  登录界面   │◀─────────────────────────────┘                             │
│  │ - 用户名    │                                                           │
│  │ - 密码      │                                                           │
│  │ - 自动登录☑│                                                           │
│  │ - 反馈二维码│                                                           │
│  └──────┬──────┘                                                           │
│         │ 登录成功                                                          │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ 角色选择    │                                                           │
│  │ - 显示角色  │                                                           │
│  │ - 创建角色  │                                                           │
│  │ - 删除角色  │                                                           │
│  └──────┬──────┘                                                           │
│         │ 选择角色                                                          │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ 游戏主界面  │                                                           │
│  │ ┌─────────┐ │                                                           │
│  │ │左:角色状│ │                                                           │
│  │ │中:战斗区│ │                                                           │
│  │ │右:装备等│ │                                                           │
│  │ └─────────┘ │                                                           │
│  │ 底部:日志   │                                                           │
│  └──────┬──────┘                                                           │
│         │ 点击集合石                                                        │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │集合石模态框 │                                                           │
│  │ - 房间列表  │                                                           │
│  │ - 创建房间  │                                                           │
│  │ - 加入房间  │                                                           │
│  └──────┬──────┘                                                           │
│         │ 加入房间                                                          │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ 等待房间    │                                                           │
│  │ - 队伍成员  │                                                           │
│  │ - 倒计时    │                                                           │
│  └──────┬──────┘                                                           │
│         │ 开始战斗                                                          │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ 战斗界面    │                                                           │
│  │ (复用单机UI)│                                                           │
│  │ 底部+聊天Tab│                                                           │
│  └──────┬──────┘                                                           │
│         │ 战斗结束                                                          │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ 掉落结算    │                                                           │
│  └──────┬──────┘                                                           │
│         │ 确认                                                              │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ 返回游戏    │                                                           │
│  │ 主界面      │                                                           │
│  └─────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. 数据库设计

### 3.1 新增 characters 表

```sql
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    game_state TEXT NOT NULL,  -- JSON: 完整游戏状态
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_played_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_last_played ON characters(user_id, last_played_at DESC);

-- 触发器：限制每用户最多5个角色
CREATE TRIGGER limit_characters_per_user
BEFORE INSERT ON characters
WHEN (SELECT COUNT(*) FROM characters WHERE user_id = NEW.user_id) >= 5
BEGIN
    SELECT RAISE(ABORT, 'Character limit reached (max 5)');
END;
```

### 3.2 修改 users 表

```sql
-- 添加字段
ALTER TABLE users ADD COLUMN auto_login INTEGER DEFAULT 0;
```

### 3.3 game_state JSON 结构

```json
{
  "version": "1.0",
  "player": {
    "name": "鸡哥",
    "class": "warrior",
    "level": 15,
    "experience": 5000,
    "currentHp": 100,
    "maxHp": 150,
    "resource": { "type": "rage", "current": 0, "max": 100 },
    "stats": { "strength": 20, "agility": 15, ... },
    "equipment": { "mainHand": {...}, "chest": {...}, ... },
    "inventory": [...],
    "skills": ["slash", "taunt", ...],
    "talents": { "arms": 5, "fury": 3 },
    "gold": 500,
    "activePet": null
  },
  "quest": {
    "activeQuests": [...],
    "completedQuests": [...],
    "questProgress": {...}
  },
  "exploration": {
    "currentArea": "forest",
    "discoveredAreas": ["forest", "cave"],
    "defeatedEnemies": {...}
  }
}
```

## 4. API 设计

### 4.1 认证相关（已有，需调整）

| 方法 | 端点 | 说明 | 调整 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 添加 auto_login 参数 |
| POST | /api/auth/login | 登录 | 添加 auto_login 参数，token 有效期30天 |
| POST | /api/auth/logout | 登出 | 新增 |

### 4.2 角色相关（新增）

| 方法 | 端点 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/characters | 获取角色列表 | - | `{ characters: [...] }` |
| GET | /api/characters/:id | 获取角色详情 | - | `{ character: {...} }` |
| POST | /api/characters | 创建角色 | `{ name, class }` | `{ character: {...} }` |
| PUT | /api/characters/:id | 更新角色（存档） | `{ game_state }` | `{ success: true }` |
| DELETE | /api/characters/:id | 删除角色 | - | `{ success: true }` |

### 4.3 房间相关（已有，需调整）

| 方法 | 端点 | 说明 | 调整 |
|------|------|------|------|
| Socket | room:join | 加入房间 | 验证角色等级是否符合副本要求 |

## 5. 前端路由设计

```javascript
const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('@/views/CharacterSelectView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/CreateCharacterView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
    meta: { requiresAuth: true, requiresCharacter: true },
  },
  {
    path: '/waiting/:roomId',
    name: 'waiting',
    component: () => import('@/views/WaitingRoomView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/battle/:roomId',
    name: 'battle',
    component: () => import('@/views/BattleView.vue'),
    meta: { requiresAuth: true },
  },
  // 删除 /lobby 路由
]
```

## 6. 组件设计

### 6.1 新增组件

| 组件 | 路径 | 说明 |
|------|------|------|
| CharacterSelectView.vue | src/views/ | 角色选择界面 |
| LobbyModal.vue | src/components/modals/ | 集合石模态框 |

### 6.2 改造组件

| 组件 | 改造内容 |
|------|----------|
| LoginView.vue | 添加自动登录勾选框，保留反馈二维码 |
| GameView.vue | 添加集合石按钮，加载集合石模态框 |
| GameHeader.vue | 调整按钮布局，添加集合石按钮 |
| BattleView.vue | 复用单机UI布局，底部添加条件聊天Tab |
| MessageLog.vue | 添加条件显示的聊天Tab |

### 6.3 删除组件

| 组件 | 原因 |
|------|------|
| MenuView.vue | 不再需要主菜单，登录即入口 |
| LobbyView.vue | 改为模态框形式 |

## 7. 状态管理

### 7.1 新增 authStore

从 multiplayerStore 中分离认证逻辑：

```javascript
// src/stores/authStore.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    autoLogin: localStorage.getItem('autoLogin') === 'true',
  }),
  actions: {
    async login(username, password, autoLogin) { ... },
    async register(username, password, nickname, autoLogin) { ... },
    logout() { ... },
    checkAuth() { ... },
  },
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
  },
})
```

### 7.2 改造 gameStore

存档相关方法改为调用云端API：

```javascript
// src/stores/gameStore.js
export const useGameStore = defineStore('game', {
  actions: {
    // 改为云端
    async saveGame() {
      const gameState = this.exportGameState()
      await api.updateCharacter(this.characterId, gameState)
    },
    async loadCharacter(characterId) {
      const response = await api.getCharacter(characterId)
      this.importGameState(response.character.game_state)
    },
  },
})
```

## 8. 存档同步策略

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              存档同步策略                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  关键节点同步（立即上传）:                                                   │
│  ───────────────────────────────────────────────────────────────────────    │
│  ✓ 退出游戏                                                                 │
│  ✓ 战斗结束                                                                 │
│  ✓ 获得新装备                                                               │
│  ✓ 升级                                                                     │
│  ✓ 完成任务                                                                 │
│  ✓ 购买/出售物品                                                            │
│  ✓ 学习新技能                                                               │
│                                                                             │
│  定时同步（每60秒）:                                                         │
│  ───────────────────────────────────────────────────────────────────────    │
│  ✓ 自动保存当前状态                                                         │
│                                                                             │
│  本地缓存:                                                                   │
│  ───────────────────────────────────────────────────────────────────────    │
│  ✓ 保存最近一次游戏状态到 localStorage（防止网络中断）                       │
│  ✓ 下次登录时检测并提示恢复                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 9. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 网络断开 | 显示重连提示，本地缓存游戏状态 |
| Token 过期 | 自动跳转登录页，提示重新登录 |
| 服务器错误 | 显示错误提示，保留本地缓存 |
| 角色加载失败 | 显示错误，允许选择其他角色 |
| 存档冲突 | 以服务器数据为准（单设备策略） |

## 10. 安全考虑

1. **Token 安全**
   - JWT 签名验证
   - HttpOnly Cookie 存储（可选升级）
   - Token 30天有效期

2. **数据验证**
   - 服务端验证所有角色数据
   - 防止非法数据注入

3. **单设备登录**
   - 新登录生成新 token，旧 token 失效
   - Socket.IO 连接验证 token
