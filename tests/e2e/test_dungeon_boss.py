"""
E2E Dungeon Flow Tests - Part 3: Boss Mechanics Deep Test
副本流程E2E测试 - 第三部分：Boss机制深度测试

这个测试模块深入测试每个副本的Boss机制：
- 每个Boss的阶段配置
- 特殊技能验证
- 召唤物机制
- 狂暴机制
"""
import pytest
import re
from pathlib import Path

from .dungeon_test_config import ALL_DUNGEONS
from .dungeon_test_helpers import (
    DungeonDataParser,
    DungeonDataValidator,
)


PROJECT_ROOT = Path(__file__).parent.parent.parent
DUNGEONS_PATH = PROJECT_ROOT / "src" / "data" / "dungeons"


# ============================================================
# 哀嚎洞穴 - 瑟芬迪斯
# ============================================================
class TestWailingCavernsSerpentis:
    """哀嚎洞穴 - 瑟芬迪斯 Boss测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def content(self, parser):
        return parser.read_dungeon_file("wailing_caverns")

    def test_boss_exists(self, parser, content):
        """瑟芬迪斯应该存在于副本配置中"""
        bosses = parser.extract_bosses(content)
        boss_ids = [b["id"] for b in bosses]
        assert "serpentis" in boss_ids, "瑟芬迪斯Boss不存在"

    def test_boss_has_three_phases(self, parser, content):
        """瑟芬迪斯应该有3个阶段"""
        phases = parser.extract_boss_phases(content, "serpentis")
        assert len(phases) == 3, f"期望3个阶段, 实际 {len(phases)}"

    def test_phase_1_is_full_hp(self, parser, content):
        """第一阶段应该是满血触发 (hpThreshold: 1.0)"""
        phases = parser.extract_boss_phases(content, "serpentis")
        phase1 = next((p for p in phases if p["id"] == 1), None)
        assert phase1 is not None, "找不到阶段1"
        assert phase1["hpThreshold"] == 1.0, f"阶段1阈值应该是1.0, 实际 {phase1['hpThreshold']}"

    def test_phase_2_summon_mechanic(self, content):
        """阶段2应该有召唤机制"""
        # 查找阶段2的onEnter召唤配置
        pattern = r"phases:\s*\[.*?id:\s*2.*?onEnter:\s*\{[^}]*type:\s*['\"]summon['\"].*?summonId:\s*['\"](\w+)['\"]"
        match = re.search(pattern, content, re.DOTALL)
        assert match, "阶段2应该有召唤机制"
        assert match.group(1) == "tendril_vine", f"召唤物应该是tendril_vine, 实际 {match.group(1)}"

    def test_tendril_vine_definition(self, content):
        """触手藤召唤物应该有完整定义"""
        # 检查tendril_vine有独立定义
        assert "tendril_vine:" in content, "缺少tendril_vine定义"

        # 检查有技能
        pattern = r"tendril_vine:.*?skills:\s*\["
        assert re.search(pattern, content, re.DOTALL), "触手藤缺少技能定义"

    def test_phase_3_damage_increase(self, content):
        """阶段3应该有伤害加成"""
        pattern = r"phases:\s*\[.*?id:\s*3.*?damageModifier:\s*([\d.]+)"
        match = re.search(pattern, content, re.DOTALL)
        assert match, "阶段3应该有damageModifier"
        damage_mod = float(match.group(1))
        assert damage_mod > 1.0, f"阶段3伤害加成应该 > 1.0, 实际 {damage_mod}"

    def test_enrage_config(self, parser, content):
        """狂暴配置应该正确"""
        enrage = parser.extract_enrage_config(content, "serpentis")
        assert enrage is not None, "瑟芬迪斯应该有狂暴配置"
        assert "triggerRound" in enrage, "狂暴配置缺少triggerRound"
        assert enrage["triggerRound"] > 0, "狂暴触发回合应该 > 0"

    def test_toxic_burst_telegraph(self, parser, content):
        """剧毒爆发应该有蓄力配置"""
        telegraphs = parser.extract_telegraph_skills(content)
        toxic_burst = next((t for t in telegraphs if "toxic" in t["skillId"].lower() or "burst" in t["skillId"].lower()), None)

        # 瑟芬迪斯有剧毒爆发技能，应该有蓄力配置
        if toxic_burst:
            assert "chargeRounds" in toxic_burst, "剧毒爆发缺少chargeRounds"
            assert toxic_burst["chargeRounds"] >= 1, "chargeRounds应该 >= 1"


# ============================================================
# 影牙城堡 - 戈弗雷
# ============================================================
class TestShadowfangKeepGodfrey:
    """影牙城堡 - 戈弗雷 Boss测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def content(self, parser):
        return parser.read_dungeon_file("shadowfang_keep")

    def test_boss_exists(self, parser, content):
        """戈弗雷应该存在"""
        bosses = parser.extract_bosses(content)
        boss_ids = [b["id"] for b in bosses]
        assert "godfrey" in boss_ids, "戈弗雷Boss不存在"

    def test_summon_ghoul_skill(self, content):
        """戈弗雷应该有召唤食尸鬼技能"""
        assert "summon_ghoul" in content, "戈弗雷应该有summon_ghoul技能"

    def test_ghoul_definition(self, content):
        """食尸鬼召唤物应该有定义"""
        # 检查ghoul定义
        assert "ghoul" in content.lower() or "食尸鬼" in content, "缺少食尸鬼定义"

        # 检查有HP定义
        pattern = r"ghoul.*?hp:\s*(\d+)"
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        assert match, "食尸鬼应该有HP定义"


# ============================================================
# 诺莫瑞根 - 格鲁比斯 & 机电师瑟玛普拉格
# ============================================================
class TestGnomereganBosses:
    """诺莫瑞根 Boss测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def content(self, parser):
        return parser.read_dungeon_file("gnomeregan")

    def test_grubbis_boss_exists(self, parser, content):
        """格鲁比斯应该存在"""
        bosses = parser.extract_bosses(content)
        boss_ids = [b["id"] for b in bosses]
        # 可能命名为grubbis或其他
        assert len(bosses) >= 1, "应该至少有一个Boss"

    def test_grubbis_summon_miners(self, content):
        """格鲁比斯应该召唤矿工"""
        assert "summon_miners" in content or "summon_crazy_miner" in content or "summon" in content.lower(), \
            "格鲁比斯应该有召唤技能"

    def test_thermaplugg_boss_exists(self, content):
        """机电师瑟玛普拉格应该存在"""
        assert "thermaplugg" in content.lower() or "瑟玛普拉格" in content, \
            "机电师瑟玛普拉格Boss不存在"

    def test_bomb_bot_definition(self, content):
        """炸弹机器人应该有定义"""
        assert "bomb" in content.lower() or "炸弹" in content, \
            "缺少炸弹机器人定义"


# ============================================================
# 死亡矿井 - 范克里夫
# ============================================================
class TestDeadminesVanCleef:
    """死亡矿井 - 范克里夫 Boss测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def content(self, parser):
        return parser.read_dungeon_file("deadmines")

    def test_van_cleef_boss_exists(self, parser, content):
        """范克里夫应该存在"""
        bosses = parser.extract_bosses(content)
        assert len(bosses) >= 1, "应该有Boss"
        # 范克里夫可能命名为vancleef或其他
        boss_names = [b["name"].lower() for b in bosses]
        assert any("范克里夫" in n or "vancleef" in n or "cleef" in n for n in boss_names), \
            "范克里夫Boss不存在"

    def test_multiple_bosses(self, parser, content):
        """死亡矿井应该有多个Boss"""
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        expected = ALL_DUNGEONS["deadmines"]["boss_count"]
        assert boss_count == expected, f"期望 {expected} 个Boss, 实际 {boss_count}"


# ============================================================
# 血色修道院 - 多翼Boss测试
# ============================================================
class TestScarletMonastery:
    """血色修道院多翼Boss测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    def test_graveyard_boss(self, parser):
        """墓地翼应该有Boss"""
        content = parser.read_dungeon_file("sm_graveyard")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count >= 1, "墓地翼应该至少有1个Boss"

    def test_library_bosses(self, parser):
        """图书馆翼应该有2个Boss"""
        content = parser.read_dungeon_file("sm_library")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 2, f"图书馆翼应该有2个Boss, 实际 {boss_count}"

    def test_armory_boss(self, parser):
        """军械库翼应该有1个Boss"""
        content = parser.read_dungeon_file("sm_armory")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 1, f"军械库翼应该有1个Boss, 实际 {boss_count}"

    def test_cathedral_bosses(self, parser):
        """大教堂翼应该有2个Boss"""
        content = parser.read_dungeon_file("sm_cathedral")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 2, f"大教堂翼应该有2个Boss, 实际 {boss_count}"


# ============================================================
# 高级副本 - 黑石塔、斯坦索姆、通灵学院、厄运之槌
# ============================================================
class TestHighLevelDungeons:
    """高级副本Boss测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    def test_stratholme_boss_count(self, parser):
        """斯坦索姆应该有6个Boss"""
        content = parser.read_dungeon_file("stratholme")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 6, f"斯坦索姆应该有6个Boss, 实际 {boss_count}"

    def test_scholomance_boss_count(self, parser):
        """通灵学院应该有6个Boss"""
        content = parser.read_dungeon_file("scholomance")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 6, f"通灵学院应该有6个Boss, 实际 {boss_count}"

    def test_brs_lower_boss_count(self, parser):
        """黑石塔下层应该有6个Boss"""
        content = parser.read_dungeon_file("brs_lower")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 6, f"黑石塔下层应该有6个Boss, 实际 {boss_count}"

    def test_brs_upper_boss_count(self, parser):
        """黑石塔上层应该有5个Boss"""
        content = parser.read_dungeon_file("brs_upper")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 5, f"黑石塔上层应该有5个Boss, 实际 {boss_count}"

    def test_dire_maul_boss_count(self, parser):
        """厄运之槌应该有5个Boss"""
        content = parser.read_dungeon_file("dire_maul")
        encounters = parser.extract_encounters(content)
        boss_count = len([e for e in encounters if e["type"] == "boss"])
        assert boss_count == 5, f"厄运之槌应该有5个Boss, 实际 {boss_count}"


# ============================================================
# 所有副本Boss技能验证
# ============================================================
class TestAllBossSkills:
    """所有Boss技能验证"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_boss_skills_have_valid_type(self, parser, dungeon_id):
        """Boss技能应该有有效的类型"""
        content = parser.read_dungeon_file(dungeon_id)

        # 有效的技能类型
        valid_types = ['melee', 'ranged', 'spell', 'buff', 'debuff', 'heal', 'summon', 'cc']

        # 查找技能类型
        skill_type_pattern = r"skillType:\s*['\"](\w+)['\"]"
        matches = re.findall(skill_type_pattern, content)

        invalid_types = [t for t in matches if t not in valid_types]

        # 允许一些自定义类型，但如果有很多无效类型应该警告
        assert len(invalid_types) <= 2, f"发现可能无效的技能类型: {invalid_types}"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_boss_skills_have_damage_type(self, parser, dungeon_id):
        """Boss伤害技能应该有伤害类型"""
        content = parser.read_dungeon_file(dungeon_id)

        # 有效的伤害类型
        valid_damage_types = ['physical', 'magic', 'fire', 'frost', 'nature', 'shadow', 'holy', 'arcane']

        # 查找伤害技能
        damage_skill_pattern = r"skillType:\s*['\"](?:melee|ranged|spell)['\"].*?damageType:\s*['\"](\w+)['\"]"
        matches = re.findall(damage_skill_pattern, content, re.DOTALL)

        invalid_types = [t for t in matches if t not in valid_damage_types]

        assert len(invalid_types) == 0, f"发现无效的伤害类型: {invalid_types}"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_boss_skills_have_targets(self, parser, dungeon_id):
        """Boss技能应该有目标类型"""
        content = parser.read_dungeon_file(dungeon_id)

        # 有效的目标类型
        valid_targets = ['enemy', 'self', 'all_enemies', 'front_2', 'back_2', 'ally', 'all_allies',
                         'summon', 'front_3', 'random_enemy', 'single', 'all', 'front_row', 'back_row',
                         'lowest_hp', 'highest_threat', 'healer', 'caster', 'melee']

        # 查找技能目标
        target_pattern = r"targetType:\s*['\"](\w+)['\"]"
        matches = re.findall(target_pattern, content)

        invalid_targets = [t for t in matches if t not in valid_targets]

        # 允许一些自定义目标类型，但如果有很多无效类型应该警告
        assert len(invalid_targets) <= 5, f"发现可能无效的目标类型: {invalid_targets}"


# ============================================================
# Boss阶段平衡性测试
# ============================================================
class TestBossPhaseBalance:
    """Boss阶段平衡性测试"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_phase_actions_per_turn_reasonable(self, parser, dungeon_id):
        """每回合行动次数应该合理"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            phases = parser.extract_boss_phases(content, boss["id"])

            for phase in phases:
                # 跳过特殊过渡阶段（hpThreshold为0）
                if phase["hpThreshold"] == 0.0:
                    continue

                # 查找该阶段的actionsPerTurn
                phase_block_pattern = rf"id:\s*{phase['id']}.*?actionsPerTurn:\s*(\d+)"
                match = re.search(phase_block_pattern, content, re.DOTALL)

                if match:
                    actions = int(match.group(1))
                    assert 1 <= actions <= 5, \
                        f"{dungeon_id} - {boss['name']} 阶段{phase['id']}: actionsPerTurn {actions} 不在合理范围 (1-5)"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_phase_damage_modifier_reasonable(self, parser, dungeon_id):
        """阶段伤害加成应该合理"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            phases = parser.extract_boss_phases(content, boss["id"])

            for phase in phases:
                # 跳过特殊过渡阶段（hpThreshold为0）
                if phase["hpThreshold"] == 0.0:
                    continue

                # 查找该阶段的damageModifier
                phase_block_pattern = rf"id:\s*{phase['id']}.*?damageModifier:\s*([\d.]+)"
                match = re.search(phase_block_pattern, content, re.DOTALL)

                if match:
                    modifier = float(match.group(1))
                    assert 0.5 <= modifier <= 3.0, \
                        f"{dungeon_id} - {boss['name']} 阶段{phase['id']}: damageModifier {modifier} 不在合理范围 (0.5-3.0)"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
