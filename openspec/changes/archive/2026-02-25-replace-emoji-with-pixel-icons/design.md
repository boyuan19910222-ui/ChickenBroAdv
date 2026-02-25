## Context

游戏目前使用 Unicode emoji 作为所有图标（职业、怪物、区域、技能等）。emoji 在不同平台显示不一致，且与游戏的像素街机美术风格不匹配。用户已准备好 9 个职业的 256x256 像素风格 PNG 图标，放在 `icons/class_icons/` 目录中。

当前 emoji 引用拓扑：
- **权威数据源**: `GameData.js` 的 `classes.*.emoji` 字段，9 个职业各有 emoji
- **动态引用**: 大量 Vue 组件通过 `player.emoji` / `cls.emoji` / `unit.emoji` 渲染文本
- **硬编码映射**: SystemPanel.vue 的 `classEmoji` computed（3 处与数据源不一致）、PartyFormationSystem.js 的 `_getClassEmoji()` 和默认队伍配置

## Goals / Non-Goals

**Goals:**
- 建立 `public/icons/` 静态资源目录规范，供当前和未来所有像素图标使用
- 将 GameData.js 中 9 个职业的 `emoji` 字段替换为 `icon` 字段（图片路径）
- 创建 `PixelIcon.vue` 通用组件处理图标渲染
- 将所有 Vue 组件中职业 emoji 文本渲染替换为 PixelIcon 图片渲染
- 消除硬编码 emoji 映射，统一从数据源获取 icon
- 旧存档兼容（无 icon 字段时自动补充）

**Non-Goals:**
- 本次不替换怪物、区域、技能、buff、装备等非职业图标（后续阶段）
- 不修改战斗日志中的 emoji 文本（后续富文本方案）
- 不生成多尺寸图标文件（CSS 缩放 256px 源图即可）

## Decisions

### Decision 1: 静态资源放在 public/icons/ 目录

**选择**: 创建 `public/icons/` 目录，按类别组织子目录

```
public/
└── icons/
    ├── classes/              ← 9 个职业图标 ✅ 已完成
    │   └── {classId}.png
    ├── roles/                ← 战斗角色图标（预留）
    │   └── {roleId}.png
    ├── skills/               ← 技能图标，按职业分组 🔧 进行中
    │   └── {classId}/
    │       └── {skill-kebab-case}.png
    ├── talents/              ← 天赋图标，按职业/分支分组
    │   └── {classId}/
    │       ├── {treeName}.png        ← 天赋分支图标（如 arms.png）
    │       └── {talent-kebab-case}.png  ← 天赋节点图标
    ├── monsters/             ← 野怪图标，按区域分组
    │   └── {areaId}/
    │       └── {monster-kebab-case}.png
    ├── areas/                ← 区域图标
    │   └── {areaId}.png
    ├── dungeons/             ← 副本图标
    │   ├── {dungeonId}.png           ← 副本封面
    │   └── {dungeonId}/
    │       └── {boss-kebab-case}.png  ← 副本 Boss/精英怪图标
    ├── items/                ← 消耗品图标
    │   └── {itemId}.png
    ├── equipment/            ← 装备图标，按槽位/类型分组
    │   ├── slots/
    │   │   └── {slotId}.png          ← 装备槽位图标
    │   └── quality/
    │       └── {qualityId}.png       ← 品质标识图标
    ├── quests/               ← 任务图标
    │   └── {questId}.png
    ├── pets/                 ← 猎人宠物图标
    │   └── {petId}.png
    ├── demons/               ← 术士恶魔图标
    │   └── {demonId}.png
    ├── totems/               ← 萨满图腾图标
    │   └── {totemId}.png
    └── forms/                ← 德鲁伊变形图标
        └── {formId}.png
```

**文件命名规范**:
- **通用规则**: 所有文件名用实体 ID 的 kebab-case 小写，格式统一 `.png`
- **camelCase → kebab-case**: `heroicStrike` → `heroic-strike`, `battleShout` → `battle-shout`
- **路径拼接**: `/icons/{category}/{subcategory?}/{kebab-id}.png`

| 类别 | 路径模板 | 示例 |
|------|---------|------|
| 职业 | `/icons/classes/${classId}.png` | `/icons/classes/warrior.png` |
| 技能 | `/icons/skills/${classId}/${kebab}.png` | `/icons/skills/warrior/heroic-strike.png` |
| 天赋分支 | `/icons/talents/${classId}/${treeName}.png` | `/icons/talents/warrior/arms.png` |
| 天赋节点 | `/icons/talents/${classId}/${kebab}.png` | `/icons/talents/warrior/deep-wounds.png` |
| 野怪 | `/icons/monsters/${areaId}/${kebab}.png` | `/icons/monsters/elwynn_forest/forest-wolf.png` |
| 区域 | `/icons/areas/${areaId}.png` | `/icons/areas/elwynn_forest.png` |
| 副本 | `/icons/dungeons/${dungeonId}.png` | `/icons/dungeons/deadmines.png` |
| 副本怪物 | `/icons/dungeons/${dungeonId}/${kebab}.png` | `/icons/dungeons/deadmines/edwin-vancleef.png` |
| 消耗品 | `/icons/items/${itemId}.png` | `/icons/items/health-potion.png` |
| 装备槽位 | `/icons/equipment/slots/${slotId}.png` | `/icons/equipment/slots/head.png` |
| 品质 | `/icons/equipment/quality/${qualityId}.png` | `/icons/equipment/quality/epic.png` |
| 宠物 | `/icons/pets/${petId}.png` | `/icons/pets/wolf.png` |
| 恶魔 | `/icons/demons/${demonId}.png` | `/icons/demons/imp.png` |
| 图腾 | `/icons/totems/${totemId}.png` | `/icons/totems/searing-totem.png` |
| 变形 | `/icons/forms/${formId}.png` | `/icons/forms/bear.png` |

**理由**: Vite 的 public 目录在 build 时原样复制到 dist/，适合不需要 hash 的美术素材。相比 src/assets/ import 方式，路径可以动态拼接，不需要为每个图标写 import 语句。

**备选方案**: 放在 src/assets/ 下通过 import 引入 — 需要静态 import 每个文件，不便动态扩展，放弃。

### Decision 2: 替换 emoji 字段而非新增 icon 字段

**选择**: 直接将 `emoji` 字段替换为 `icon` 字段

**理由**: 最终目标是全量替换 emoji，保留两个字段会造成混乱和维护负担。一次性替换更干净。通过 PlayerSchema 的 `ensurePlayerFields` 可以在加载旧存档时自动补充 icon 字段。

**备选方案**: 新增 icon 字段保留 emoji 共存 — 增加了状态冲突风险和代码分支，放弃。

### Decision 3: PixelIcon.vue 通用组件

**选择**: 创建 `src/components/common/PixelIcon.vue` 通用组件

```
Props:
  - src: String (必填，图标路径)
  - size: Number (默认 24，像素尺寸)
  - fallback: String (可选，加载失败时显示的文字/emoji)

Features:
  - image-rendering: pixelated (保持像素风清晰锐利)
  - 加载失败时显示 fallback 文本
  - inline-block 布局，可在文本中内联使用
```

**理由**: 统一管理像素渲染模式、尺寸、fallback 逻辑。所有需要渲染图标的地方使用同一个组件，避免重复代码。

### Decision 4: 图标路径约定

**选择**: 在 GameData.js 中存储完整路径字符串

```js
icon: '/icons/classes/warrior.png'
```

**理由**: 简单直接，组件拿到路径直接传给 PixelIcon。未来不同类别的图标（怪物、区域等）路径前缀不同，存完整路径最灵活。

### Decision 5: PartyFormationSystem 战斗角色图标分离

**选择**: 默认队伍配置中的 emoji 字段改为 `roleIcon` 字段，引用 `/icons/roles/{roleId}.png`。`_getClassEmoji()` 改为 `_getClassIcon(classId)` 从 GameData 获取。

**理由**: 战斗角色（tank/healer/dps）和职业是不同概念，应使用不同图标。本次先预留 roles 目录结构，图标素材后续补充时直接放入即可。在素材到位前，roleIcon 使用 fallback emoji。

### Decision 6: 存档兼容策略

**选择**: 在 PlayerSchema.ensurePlayerFields() 中处理 — 如果 player 有 `class` 字段但无 `icon` 字段，根据 classId 自动生成 icon 路径。同时在 GameEngine._sanitizeLoadedState() 中也做一次兼容检查。

**理由**: 不需要存档版本迁移（不改 SaveMigration），利用现有的字段补全机制自然处理。

## Risks / Trade-offs

- **[风险] 256px 图标缩放到小尺寸可能模糊** → `image-rendering: pixelated` CSS 属性确保像素点保持锐利，已在 explore 阶段确认可行
- **[风险] 旧存档加载时 icon 字段缺失** → ensurePlayerFields 自动补全；sanitizeLoadedState 二次保障
- **[风险] 战斗角色图标素材尚未就绪** → 使用 fallback emoji 过渡，目录结构先预留
- **[权衡] 直接替换 emoji 字段而非共存** → 改动面更大但更干净，避免长期维护两套字段
