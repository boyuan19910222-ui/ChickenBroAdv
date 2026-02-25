## ADDED Requirements

### Requirement: 本地像素字体加载
系统 SHALL 使用本地方舟像素字体（Ark Pixel Font 12px 等宽简中版）作为全局唯一字体，通过 `@font-face` 声明加载 `.otf` 文件，不依赖任何外部 CDN。

#### Scenario: 字体文件正确加载
- **WHEN** 用户访问任意页面
- **THEN** 所有文本（中文、英文、数字、符号）均以方舟像素字体渲染

#### Scenario: 离线环境
- **WHEN** 用户在无网络环境下访问游戏
- **THEN** 字体依然正常加载，不降级为系统默认字体

#### Scenario: 字体文件缺失或加载失败
- **WHEN** 字体文件加载失败
- **THEN** 回退到 `monospace` 系统字体

### Requirement: 移除 Google Fonts CDN 依赖
系统 SHALL 移除 `index.html` 中对 Google Fonts `Press Start 2P` 的 CDN 引用，不再加载任何外部字体资源。

#### Scenario: 无外部字体请求
- **WHEN** 页面加载完成
- **THEN** 网络请求中不包含任何 `fonts.googleapis.com` 或 `fonts.gstatic.com` 的请求

### Requirement: 字号体系
系统 SHALL 定义以下 CSS 变量字号体系，所有字号均为 12px 的整数倍：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--fs-xs` | 12px | 时间戳、次要标签 |
| `--fs-sm` | 12px | 按钮文字、标签 |
| `--fs-base` | 12px | 默认正文 |
| `--fs-md` | 24px | 面板标题 |
| `--fs-lg` | 36px | 区域标题 |
| `--fs-xl` | 48px | Logo/大标题 |

#### Scenario: 正文字号
- **WHEN** 渲染普通正文内容
- **THEN** 字号为 12px，像素边缘清晰无模糊

#### Scenario: 面板标题字号
- **WHEN** 渲染面板标题（如"装备"、"背包"、"技能"）
- **THEN** 字号为 24px，像素边缘清晰无模糊

#### Scenario: 禁止非整数倍字号
- **WHEN** 任何组件渲染文本
- **THEN** 字号 MUST 为 12 的整数倍（12/24/36/48），不使用其他值

### Requirement: 字体文件位置
字体文件 SHALL 位于 `src/assets/fonts/` 目录下，通过 Vite 资产引用路径加载。

#### Scenario: 构建时字体文件打包
- **WHEN** 执行 `vite build`
- **THEN** 字体文件被正确打包到 `dist/assets/` 中并可访问

### Requirement: 像素渲染优化
系统 SHALL 在全局样式中设置 `image-rendering: pixelated` 和 `-webkit-font-smoothing: none`（或等效属性）以确保像素字体不被反锯齿平滑。

#### Scenario: 像素字体清晰渲染
- **WHEN** 文本以 12px 或其整数倍渲染
- **THEN** 每个像素点边缘锐利，无亚像素平滑或模糊
