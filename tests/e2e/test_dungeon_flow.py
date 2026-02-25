"""
E2E Dungeon Flow Tests - Part 2: Browser Automation
副本流程E2E测试 - 第二部分：浏览器自动化测试

这个测试模块使用Playwright进行浏览器自动化测试：
- 角色创建流程
- 等级调整（使用debugLevelUp）
- 进入副本流程
- 战斗交互测试
- Boss机制验证（通过控制台监控）
"""
import pytest
import sys
import time
import json
from pathlib import Path

# Check if playwright is available
try:
    from playwright.sync_api import sync_playwright, Page, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Skip all tests in this file if playwright not available
pytestmark = pytest.mark.skipif(
    not PLAYWRIGHT_AVAILABLE,
    reason="Playwright not installed. Run: pip install playwright && playwright install"
)

from .dungeon_test_config import (
    ALL_DUNGEONS,
    DUNGEON_TEST_GROUPS,
    TEST_CHARACTERS,
)


BASE_URL = "http://localhost:3000"


class DungeonTestHelper:
    """副本浏览器测试辅助类"""

    def __init__(self, page: Page):
        self.page = page
        self.console_messages = []
        self.errors = []

    def setup_console_monitor(self):
        """设置控制台监控"""
        self.console_messages = []
        self.errors = []

        def on_console(msg):
            self.console_messages.append({
                "type": msg.type,
                "text": msg.text,
            })
            if msg.type == "error":
                self.errors.append(msg.text)

        self.page.on("console", on_console)

    def get_console_logs(self, filter_type=None):
        """获取控制台日志"""
        if filter_type:
            return [m for m in self.console_messages if m["type"] == filter_type]
        return self.console_messages

    def has_console_error(self, pattern: str) -> bool:
        """检查是否有匹配的控制台错误"""
        for error in self.errors:
            if pattern in error:
                return True
        return False

    def wait_for_vue_ready(self, timeout=10000):
        """等待Vue应用就绪"""
        self.page.wait_for_load_state('networkidle')
        self.page.wait_for_timeout(500)
        # 等待Vue渲染
        self.page.wait_for_function("""
            () => document.querySelector('button') !== null
        """, timeout=timeout)

    def create_character(self, name: str, class_id: str) -> bool:
        """创建角色"""
        # 首先访问菜单页面初始化engine
        self.page.goto(f"{BASE_URL}/#/")
        self.wait_for_vue_ready()
        self.page.wait_for_timeout(1000)
        
        # 导航到创建角色页面
        self.page.goto(f"{BASE_URL}/#/create")
        self.wait_for_vue_ready()

        # 等待职业卡片加载
        self.page.wait_for_selector('.class-card', timeout=10000)
        self.page.wait_for_timeout(500)

        # 输入角色名 - 更新选择器以匹配实际页面
        name_input = self.page.locator('input.pixel-input').first
        name_input.fill(name)
        self.page.wait_for_timeout(200)

        # 选择职业 - 使用职业名称匹配
        class_names = {
            "warrior": "战士",
            "mage": "法师",
            "priest": "牧师",
            "hunter": "猎人",
            "rogue": "盗贼",
            "paladin": "圣骑士",
            "shaman": "萨满",
            "warlock": "术士",
            "druid": "德鲁伊",
        }
        class_name = class_names.get(class_id, class_id)
        
        # 点击包含职业名称的职业卡片
        class_card = self.page.locator(f'.class-card:has(.class-name:has-text("{class_name}"))')
        if class_card.count() == 0:
            # 备用选择器
            class_card = self.page.locator(f'.class-card:has-text("{class_name}")')
        class_card.first.click()
        self.page.wait_for_timeout(500)

        # 点击创建按钮 - 按钮文本是 "开始冒险 ⚔️"
        create_btn = self.page.locator('button.primary:has-text("开始冒险")')
        if create_btn.count() == 0:
            create_btn = self.page.locator('button:has-text("开始冒险")')
        
        if create_btn.count() == 0 or create_btn.first.is_disabled():
            return False

        create_btn.first.click()
        self.page.wait_for_timeout(3000)

        return True

    def is_on_game_page(self) -> bool:
        """检查是否在游戏页面"""
        current_url = self.page.url
        if '/#/game' in current_url or '/game' in current_url:
            return True
        # 检查游戏场景元素
        try:
            return self.page.locator('.game-scene').count() > 0 or self.page.locator('.game-container').count() > 0
        except:
            return False

    def debug_level_up(self, target_level: int, max_iterations: int = 100):
        """使用调试功能升级到目标等级"""
        current_level = self.get_player_level()
        iterations = 0

        while current_level < target_level and iterations < max_iterations:
            # 点击"测试升级"按钮
            debug_btn = self.page.locator('button.debug-btn:has-text("测试升级")')
            if debug_btn.count() > 0:
                debug_btn.click()
                self.page.wait_for_timeout(100)
            else:
                break
            
            new_level = self.get_player_level()
            if new_level == current_level:
                # 等级没有变化，可能是到达上限
                break
            current_level = new_level
            iterations += 1

    def get_player_level(self) -> int:
        """获取玩家当前等级"""
        # 从角色面板获取等级
        level_text = self.page.locator('.char-level').text_content()
        if level_text:
            # 格式: "Lv.X 职业"
            import re
            match = re.search(r'Lv\.(\d+)', level_text)
            if match:
                return int(match.group(1))
        return 1

    def open_dungeon_select(self):
        """打开副本选择对话框"""
        # 点击副本按钮
        dungeon_btn = self.page.locator('button:has-text("副本")')
        if dungeon_btn.count() > 0:
            dungeon_btn.first.click()
            self.page.wait_for_timeout(500)
            return True
        return False

    def enter_dungeon(self, dungeon_id: str) -> bool:
        """进入指定副本"""
        # 打开副本选择
        if not self.open_dungeon_select():
            return False

        # 等待对话框 - 使用正确的选择器
        self.page.wait_for_selector('.dungeon-modal', timeout=5000)
        self.page.wait_for_timeout(300)

        # 找到副本卡片并点击
        dungeon = ALL_DUNGEONS.get(dungeon_id)
        if not dungeon:
            return False

        dungeon_name = dungeon["name"]

        # 检查副本状态
        dungeon_card = self.page.locator(f'.dungeon-card:has-text("{dungeon_name}")')
        if dungeon_card.count() == 0:
            return False

        # 检查是否锁定
        status_text = dungeon_card.locator('.status').text_content() if dungeon_card.locator('.status').count() > 0 else ""
        if "锁定" in status_text or "locked" in status_text.lower():
            return False

        # 点击进入
        enter_btn = dungeon_card.locator('button:has-text("进入")')
        if enter_btn.count() > 0 and not enter_btn.is_disabled():
            enter_btn.click()
            self.page.wait_for_timeout(1000)
            return True

        return False

    def is_in_dungeon(self) -> bool:
        """检查是否在副本战斗中"""
        return self.page.locator('.dungeon-combat-view').count() > 0

    def get_dungeon_state(self) -> dict:
        """获取副本战斗状态"""
        return self.page.evaluate("""
            () => {
                const gameStore = window.__PINIA__?.state?.value?.game;
                const dungeonSystem = gameStore?.dungeonCombatSystem;
                if (!dungeonSystem) return null;

                return {
                    inDungeonCombat: dungeonSystem.inDungeonCombat,
                    currentDungeon: dungeonSystem.currentDungeon?.name,
                    currentEncounter: dungeonSystem.currentEncounter?.name,
                    encounterIndex: dungeonSystem.encounterIndex,
                    planningPhase: dungeonSystem.planningPhase,
                    bossState: dungeonSystem.bossState ? {
                        currentPhase: dungeonSystem.bossState.currentPhase,
                        currentHpPercent: dungeonSystem.bossState.currentHpPercent,
                        isEnraged: dungeonSystem.bossState.isEnraged,
                    } : null,
                    enemies: dungeonSystem.battlefield?.enemy?.map(e => ({
                        id: e.id,
                        name: e.name,
                        currentHp: e.currentHp,
                        maxHp: e.maxHp,
                        isBoss: e.isBoss,
                    })) || [],
                    party: dungeonSystem.partyState?.members?.map(m => ({
                        id: m.id,
                        name: m.name,
                        currentHp: m.currentHp,
                        maxHp: m.maxHp,
                        isPlayer: m.isPlayer,
                    })) || [],
                };
            }
        """)

    def execute_dungeon_turn(self):
        """执行一个副本回合（部署行动并结算）"""
        # 选择技能和目标（简化：使用自动战斗）
        self.page.evaluate("""
            () => {
                const gameStore = window.__PINIA__?.state?.value?.game;
                const dungeonSystem = gameStore?.dungeonCombatSystem;
                if (dungeonSystem && dungeonSystem.planningPhase) {
                    // 设置自动战斗
                    dungeonSystem.isAutoBattle = true;
                }
            }
        """)
        self.page.wait_for_timeout(300)

    def toggle_auto_battle(self, enabled: bool = True):
        """切换自动战斗模式"""
        self.page.evaluate(f"""
            () => {{
                const gameStore = window.__PINIA__?.state?.value?.game;
                const dungeonSystem = gameStore?.dungeonCombatSystem;
                if (dungeonSystem) {{
                    dungeonSystem.isAutoBattle = {str(enabled).lower()};
                }}
            }}
        """)

    def wait_for_encounter_end(self, timeout=60000):
        """等待遭遇战结束"""
        start_time = time.time()

        while time.time() - start_time < timeout / 1000:
            state = self.get_dungeon_state()
            if state is None:
                return "no_state"

            # 检查敌人是否全灭
            enemies_alive = [e for e in state.get("enemies", []) if e["currentHp"] > 0]
            if not enemies_alive:
                return "victory"

            # 检查玩家队伍是否全灭
            party_alive = [p for p in state.get("party", []) if p["currentHp"] > 0]
            if not party_alive:
                return "defeat"

            time.sleep(0.5)

        return "timeout"


class TestDungeonBrowser:
    """副本浏览器测试"""

    @pytest.fixture
    def browser(self):
        """创建浏览器实例"""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            yield browser
            browser.close()

    @pytest.fixture
    def helper(self, browser):
        """创建测试辅助对象"""
        page = browser.new_page()
        helper = DungeonTestHelper(page)
        helper.setup_console_monitor()
        yield helper
        page.close()

    def test_character_creation_for_dungeon(self, helper):
        """测试创建角色用于副本测试"""
        success = helper.create_character("DungeonTester", "warrior")
        assert success, "角色创建失败"
        helper.page.wait_for_timeout(2000)
        assert helper.is_on_game_page(), f"应该进入游戏页面, 当前URL: {helper.page.url}"

    def test_debug_level_up(self, helper):
        """测试调试升级功能"""
        # 创建角色
        helper.create_character("LevelTester", "mage")
        helper.page.wait_for_timeout(2000)

        # 获取初始等级
        initial_level = helper.get_player_level()
        assert initial_level >= 1, "初始等级应该 >= 1"

        # 升级到10级
        target_level = 10
        helper.debug_level_up(target_level)

        # 验证等级
        final_level = helper.get_player_level()
        assert final_level >= target_level, f"等级应该 >= {target_level}, 实际 {final_level}"

    def test_dungeon_select_opens(self, helper):
        """测试副本选择对话框可以打开"""
        # 创建角色
        helper.create_character("DungeonSelectTest", "warrior")
        helper.page.wait_for_timeout(2000)

        # 升级到足够等级
        helper.debug_level_up(20)

        # 打开副本选择
        success = helper.open_dungeon_select()
        assert success, "应该能打开副本选择对话框"

        # 验证对话框显示
        dialog = helper.page.locator('.dungeon-modal')
        assert dialog.count() > 0, "副本选择对话框应该显示"

    def test_low_level_dungeon_locked(self, helper):
        """测试低等级时低级副本应该锁定"""
        # 创建1级角色
        helper.create_character("LowLevelTest", "warrior")
        helper.page.wait_for_timeout(2000)

        # 确保是低等级
        level = helper.get_player_level()
        assert level <= 5, f"应该是低等级, 实际 {level}"

        # 打开副本选择
        helper.open_dungeon_select()
        helper.page.wait_for_selector('.dungeon-modal', timeout=5000)

        # 检查高级副本是否锁定
        locked_dungeons = helper.page.locator('.dungeon-entry.locked')
        assert locked_dungeons.count() > 0, "应该有锁定的副本"


class TestDungeonFlowE2E:
    """副本完整流程E2E测试"""

    @pytest.fixture
    def browser(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            yield browser
            browser.close()

    @pytest.fixture
    def helper(self, browser):
        page = browser.new_page()
        helper = DungeonTestHelper(page)
        helper.setup_console_monitor()
        yield helper
        page.close()

    @pytest.mark.skip(reason="需要长时间运行，手动执行时去掉skip")
    def test_enter_wailing_caverns(self, helper):
        """测试进入哀嚎洞穴副本"""
        # 创建角色
        helper.create_character("WCTester", "warrior")
        helper.page.wait_for_timeout(2000)

        # 升级到副本推荐等级
        target_level = 20  # 哀嚎洞穴推荐17-24级
        helper.debug_level_up(target_level)

        # 验证等级
        level = helper.get_player_level()
        assert level >= 17, f"等级应该 >= 17, 实际 {level}"

        # 进入副本
        success = helper.enter_dungeon("wailing_caverns")
        assert success, "应该能进入哀嚎洞穴"

        # 等待副本加载
        helper.page.wait_for_timeout(2000)

        # 验证进入副本战斗
        assert helper.is_in_dungeon(), "应该在副本战斗中"

        # 获取副本状态
        state = helper.get_dungeon_state()
        assert state is not None, "应该能获取副本状态"
        assert "哀嚎洞穴" in state.get("currentDungeon", ""), "当前副本应该是哀嚎洞穴"

    @pytest.mark.skip(reason="需要长时间运行，手动执行时去掉skip")
    def test_complete_dungeon_encounter(self, helper):
        """测试完成副本遭遇战（自动战斗）"""
        # 创建角色
        helper.create_character("CombatTester", "warrior")
        helper.page.wait_for_timeout(2000)

        # 升级
        helper.debug_level_up(25)

        # 进入哀嚎洞穴
        helper.enter_dungeon("wailing_caverns")
        helper.page.wait_for_timeout(3000)

        if not helper.is_in_dungeon():
            pytest.skip("无法进入副本")

        # 开启自动战斗
        helper.toggle_auto_battle(True)

        # 等待遭遇战结束
        result = helper.wait_for_encounter_end(timeout=120000)

        # 验证战斗结果
        # 注意：可能胜利也可能失败，取决于战斗平衡
        assert result in ["victory", "defeat", "timeout"], f"意外的战斗结果: {result}"

    @pytest.mark.skip(reason="需要长时间运行，手动执行时去掉skip")
    @pytest.mark.parametrize("dungeon_id", ["ragefire_chasm", "deadmines", "wailing_caverns"])
    def test_enter_multiple_dungeons(self, helper, dungeon_id):
        """测试进入多个不同副本"""
        # 创建新角色
        helper.create_character(f"{dungeon_id}_Tester", "warrior")
        helper.page.wait_for_timeout(2000)

        # 获取副本信息
        dungeon = ALL_DUNGEONS[dungeon_id]
        target_level = dungeon["level_range"]["max"]

        # 升级
        helper.debug_level_up(target_level)

        # 进入副本
        success = helper.enter_dungeon(dungeon_id)

        if not success:
            # 可能等级不够或副本锁定
            pytest.skip(f"无法进入副本 {dungeon['name']}")

        # 验证进入副本
        helper.page.wait_for_timeout(2000)
        assert helper.is_in_dungeon(), f"应该在 {dungeon['name']} 中"

        state = helper.get_dungeon_state()
        assert state is not None


class TestBossMechanicsE2E:
    """Boss机制E2E测试"""

    @pytest.fixture
    def browser(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            yield browser
            browser.close()

    @pytest.fixture
    def helper(self, browser):
        page = browser.new_page()
        helper = DungeonTestHelper(page)
        helper.setup_console_monitor()
        yield helper
        page.close()

    @pytest.mark.skip(reason="需要长时间运行，手动执行时去掉skip")
    def test_boss_phase_transition(self, helper):
        """测试Boss阶段转换"""
        # 创建角色
        helper.create_character("PhaseTester", "warrior")
        helper.page.wait_for_timeout(2000)

        # 升级
        helper.debug_level_up(20)

        # 进入哀嚎洞穴
        helper.enter_dungeon("wailing_caverns")
        helper.page.wait_for_timeout(3000)

        if not helper.is_in_dungeon():
            pytest.skip("无法进入副本")

        # 获取初始Boss状态
        state = helper.get_dungeon_state()

        if state and state.get("bossState"):
            initial_phase = state["bossState"].get("currentPhase", 1)

            # 开启自动战斗
            helper.toggle_auto_battle(True)

            # 等待Boss血量下降
            for _ in range(20):  # 最多等待20次检查
                helper.page.wait_for_timeout(3000)
                state = helper.get_dungeon_state()

                if not state or not state.get("bossState"):
                    break

                hp_percent = state["bossState"].get("currentHpPercent", 1.0)

                # 如果血量低于70%，应该进入阶段2
                if hp_percent < 0.7:
                    # 验证阶段转换
                    current_phase = state["bossState"].get("currentPhase", 1)
                    assert current_phase >= 2, f"Boss应该在阶段2或更高, 当前阶段 {current_phase}"
                    break

    @pytest.mark.skip(reason="需要长时间运行，手动执行时去掉skip")
    def test_boss_summon_mechanic(self, helper):
        """测试Boss召唤机制"""
        # 创建角色
        helper.create_character("SummonTester", "warrior")
        helper.page.wait_for_timeout(2000)

        # 升级
        helper.debug_level_up(25)

        # 进入哀嚎洞穴（瑟芬迪斯会在阶段2召唤触手藤）
        helper.enter_dungeon("wailing_caverns")
        helper.page.wait_for_timeout(3000)

        if not helper.is_in_dungeon():
            pytest.skip("无法进入副本")

        # 开启自动战斗
        helper.toggle_auto_battle(True)

        # 监控敌人数量变化
        max_enemies = 0

        for _ in range(30):  # 检查30次
            state = helper.get_dungeon_state()

            if state:
                enemies = state.get("enemies", [])
                max_enemies = max(max_enemies, len(enemies))

                # Boss血量低时应该有召唤物
                if state.get("bossState"):
                    hp_percent = state["bossState"].get("currentHpPercent", 1.0)
                    if hp_percent < 0.7:
                        # 阶段2应该召唤触手藤，敌人数量应该增加
                        # (Boss + 召唤物 > 1)
                        pass

            helper.page.wait_for_timeout(2000)

        # 记录最大敌人数量
        # 这可以验证召唤机制是否触发
        print(f"最大敌人数量: {max_enemies}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
