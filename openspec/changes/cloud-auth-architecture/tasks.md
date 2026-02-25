# 任务清单

## 阶段1：后端改造

### 1.1 数据库改造

- [x] **T1.1.1** 创建 characters 表
  - 添加表结构、索引、触发器（限制5个角色）
  - 文件：`server/db.js`

- [x] **T1.1.2** 修改 users 表
  - 添加 auto_login 字段
  - 文件：`server/db.js`

### 1.2 角色API

- [x] **T1.2.1** 创建角色路由文件
  - 文件：`server/characters.js`

- [x] **T1.2.2** 实现 GET /api/characters
  - 获取当前用户的角色列表

- [x] **T1.2.3** 实现 GET /api/characters/:id
  - 获取单个角色详情
  - 验证角色归属

- [x] **T1.2.4** 实现 POST /api/characters
  - 创建角色
  - 验证角色数量限制（最多5个）
  - 初始化游戏状态

- [x] **T1.2.5** 实现 PUT /api/characters/:id
  - 更新角色（存档同步）
  - 验证角色归属

- [x] **T1.2.6** 实现 DELETE /api/characters/:id
  - 删除角色（永久删除）
  - 验证角色归属

### 1.3 认证API调整

- [x] **T1.3.1** 修改登录接口
  - 支持 auto_login 参数
  - auto_login=true 时 token 有效期30天
  - 文件：`server/auth.js`

- [x] **T1.3.2** 修改注册接口
  - 支持 auto_login 参数
  - 文件：`server/auth.js`

- [x] **T1.3.3** 添加登出接口
  - POST /api/auth/logout
  - 使 token 失效（可选：维护黑名单）

### 1.4 房间逻辑调整

- [x] **T1.4.1** 加入房间等级验证
  - 验证角色等级是否符合副本要求
  - 文件：`server/rooms.js`

---

## 阶段2：前端基础设施

### 2.1 新增 authStore

- [x] **T2.1.1** 创建 authStore
  - 从 multiplayerStore 分离认证逻辑
  - 文件：`src/stores/authStore.js`

- [x] **T2.1.2** 实现登录/注册/登出方法

- [x] **T2.1.3** 实现自动登录检查

### 2.2 API 服务层

- [x] **T2.2.1** 创建 API 服务模块
  - 封装 fetch 调用
  - 统一错误处理
  - 文件：`src/services/api.js`

- [x] **T2.2.2** 实现角色相关API调用
  - getCharacters, getCharacter, createCharacter, updateCharacter, deleteCharacter

### 2.3 路由改造

- [x] **T2.3.1** 修改路由配置
  - / 改为 LoginView
  - 新增 /characters 路由
  - 删除 /lobby 路由
  - 文件：`src/router/index.js`

- [x] **T2.3.2** 调整路由守卫
  - requiresAuth 验证 token
  - requiresCharacter 验证已选择角色

---

## 阶段3：登录界面改造

### 3.1 LoginView 改造

- [x] **T3.1.1** 添加自动登录勾选框
  - 登录和注册表单都添加
  - 文件：`src/views/LoginView.vue`

- [x] **T3.1.2** 保留反馈二维码
  - 右上角显示

- [x] **T3.1.3** 调整登录成功跳转
  - 跳转到 /characters

- [x] **T3.1.4** 修改页面标题
  - 从"集合石"改为"鸡哥大冒险"

---

## 阶段4：角色选择界面

### 4.1 创建 CharacterSelectView

- [x] **T4.1.1** 创建组件文件
  - 文件：`src/views/CharacterSelectView.vue`

- [x] **T4.1.2** 实现角色列表展示
  - 显示角色卡片（名称、职业、等级、最后游玩时间）
  - 最多显示5个 + 创建按钮

- [x] **T4.1.3** 实现角色选择功能
  - 点击角色卡片选择
  - 加载角色数据到 gameStore
  - 跳转到 /game

- [x] **T4.1.4** 实现角色创建入口
  - 点击"+"按钮跳转到 /create

- [x] **T4.1.5** 实现角色删除功能
  - 删除确认弹窗
  - 永久删除

- [x] **T4.1.6** 添加退出登录按钮
  - 清除 token，跳转到登录页

---

## 阶段5：游戏主界面改造

### 5.1 GameHeader 改造

- [x] **T5.1.1** 添加集合石按钮
  - 位置：测试升级按钮左侧
  - 图标：🪨
  - 文件：`src/components/layout/GameHeader.vue`

- [x] **T5.1.2** 调整按钮布局
  - 移除或保留测试升级按钮（待定）

### 5.2 GameView 改造

- [x] **T5.2.1** 添加集合石模态框状态
  - 文件：`src/views/GameView.vue`

- [x] **T5.2.2** 加载集合石模态框组件

- [x] **T5.2.3** 改造存档逻辑
  - saveGame 改为调用云端API
  - loadCharacter 从云端加载

### 5.3 创建集合石模态框

- [x] **T5.3.1** 创建 LobbyModal 组件
  - 文件：`src/components/modals/LobbyModal.vue`

- [x] **T5.3.2** 实现房间列表
  - 显示：副本名、人数、房主、平均等级、状态
  - 刷新按钮

- [x] **T5.3.3** 实现创建房间
  - 弹出副本选择
  - 创建成功后进入等待房间

- [x] **T5.3.4** 实现加入房间
  - 等级验证
  - 加入成功后进入等待房间

- [x] **T5.3.5** 删除大厅聊天
  - 不显示聊天区域

---

## 阶段6：等待房间改造

### 6.1 WaitingRoomView 改造

- [x] **T6.1.1** 删除聊天功能
  - 文件：`src/views/WaitingRoomView.vue`

- [x] **T6.1.2** 简化界面
  - 只显示队伍成员和倒计时

---

## 阶段7：战斗界面改造

### 7.1 BattleView 改造

- [x] **T7.1.1** 复用单机战斗UI布局
  - 左侧：队伍状态面板（类似CharacterPanel）
  - 中间：战斗区域（CombatView样式）
  - 右侧：不显示聊天面板
  - 底部：日志区域
  - 文件：`src/views/BattleView.vue`

- [x] **T7.1.2** 调整数据源
  - 从 multiplayerStore 获取战斗数据
  - 保持与单机战斗相似的视觉效果

### 7.2 MessageLog 改造

- [x] **T7.2.1** 添加条件显示的聊天Tab
  - 仅在副本战斗中显示
  - 文件：`src/components/common/MessageLog.vue`

- [x] **T7.2.2** 实现Tab切换
  - 系统日志 | 掉落记录 | 聊天（条件显示）

---

## 阶段8：清理工作

### 8.1 删除废弃组件

- [x] **T8.1.1** 删除 MenuView.vue

- [x] **T8.1.2** 删除 LobbyView.vue

- [x] **T8.1.3** 删除导入/导出存档相关代码

### 8.2 更新 multiplayerStore

- [x] **T8.2.1** 移除认证相关状态
  - 已移至 authStore
  - 文件：`src/stores/multiplayerStore.js`

- [x] **T8.2.2** 保留联机相关逻辑
  - 房间、战斗、Socket.IO 连接

---

## 阶段9：测试与优化

### 9.1 功能测试

- [ ] **T9.1.1** 测试注册流程

- [ ] **T9.1.2** 测试登录流程（含自动登录）

- [ ] **T9.1.3** 测试角色创建（上限验证）

- [ ] **T9.1.4** 测试角色选择和加载

- [ ] **T9.1.5** 测试角色删除

- [ ] **T9.1.6** 测试存档同步

- [ ] **T9.1.7** 测试集合石匹配

- [ ] **T9.1.8** 测试副本战斗

- [ ] **T9.1.9** 测试多设备登录（踢人）

### 9.2 边界测试

- [ ] **T9.2.1** 测试网络断开处理

- [ ] **T9.2.2** 测试Token过期处理

- [ ] **T9.2.3** 测试角色数量上限

- [ ] **T9.2.4** 测试等级限制加入房间

### 9.3 优化

- [ ] **T9.3.1** 优化存档同步性能

- [ ] **T9.3.2** 添加加载状态提示

- [ ] **T9.3.3** 添加错误提示优化

---

## 依赖关系

```
阶段1 (后端) ─────┬──▶ 阶段2 (前端基础) ───┬──▶ 阶段3 (登录)
                 │                        │
                 │                        ├──▶ 阶段4 (角色选择)
                 │                        │
                 │                        └──▶ 阶段5 (游戏主界面) ───▶ 阶段6 (等待房间)
                 │                                                         │
                 └─────────────────────────────────────────────────────────┴──▶ 阶段7 (战斗)
                                                                                  
阶段8 (清理) ◀─── 所有功能完成后 ✅

阶段9 (测试) ◀─── 清理完成后
```
