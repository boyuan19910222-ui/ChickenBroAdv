# ChickenBro 测试框架

## 概述

本测试框架提供两种测试类型：

- **单元测试 (Unit Tests)**: 验证数据完整性和结构正确性
- **端到端测试 (E2E Tests)**: 使用 Playwright 进行浏览器自动化测试

## 目录结构

```
tests/
├── __init__.py
├── conftest.py           # Pytest 配置和固件
├── pytest.ini            # Pytest 设置
├── run_tests.py          # 测试运行脚本
├── unit/                 # 单元测试
│   ├── test_skills.py    # 技能数据验证
│   ├── test_talents.py   # 天赋树验证
│   └── test_dungeons.py  # 副本数据验证
├── e2e/                  # 端到端测试
│   └── test_game.py      # Playwright 浏览器测试
└── fixtures/             # 测试数据
    └── test_data.py      # 示例数据
```

## 安装依赖

```bash
# 安装 pytest
pip install pytest

# 安装 Playwright (E2E 测试需要)
pip install playwright
playwright install chromium
```

## 运行测试

### 方式 1: 使用测试运行脚本

```bash
# 运行单元测试
python tests/run_tests.py unit

# 运行 E2E 测试 (需要先启动开发服务器)
python tests/run_tests.py e2e

# 运行所有测试
python tests/run_tests.py all

# 启动服务器并运行 E2E 测试
python tests/run_tests.py server

# 快速数据验证
python tests/run_tests.py quick
```

### 方式 2: 直接使用 pytest

```bash
# 运行所有单元测试
pytest tests/unit/ -v

# 运行特定测试文件
pytest tests/unit/test_skills.py -v

# 运行带标记的测试
pytest tests/ -m combat -v

# 运行 E2E 测试
pytest tests/e2e/ -v -m e2e
```

## 测试标记

| 标记 | 说明 |
|------|------|
| `unit` | 单元测试 |
| `e2e` | 端到端测试 |
| `combat` | 战斗系统测试 |
| `dungeon` | 副本和 BOSS 测试 |
| `skill` | 技能系统测试 |
| `talent` | 天赋系统测试 |
| `slow` | 运行较慢的测试 |

## 示例：添加新测试

### 单元测试示例

```python
# tests/unit/test_new_feature.py
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent

class TestNewFeature:
    def test_something(self):
        """测试描述"""
        assert 1 + 1 == 2
```

### E2E 测试示例

```python
# tests/e2e/test_new_ui.py
import pytest
from playwright.sync_api import sync_playwright

@pytest.mark.e2e
def test_ui_element():
    """测试 UI 元素"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        
        # 添加测试逻辑
        
        browser.close()
```

## CI/CD 集成

在 CI/CD 流程中运行测试：

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install pytest
      - run: pytest tests/unit/ -v

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - uses: actions/setup-node@v3
      - run: npm install
      - run: pip install pytest playwright
      - run: playwright install chromium
      - run: npm run dev &
      - run: sleep 5
      - run: pytest tests/e2e/ -v
```
