"""
E2E Dungeon Flow Tests - Part 1: Data Validation
副本流程E2E测试 - 第一部分：数据验证

这个测试模块验证所有副本的数据结构是否正确：
- 副本文件存在性
- Boss配置完整性
- 阶段转换有效性
- 召唤物定义
- 狂暴配置
- 蓄力技能配置
"""
import pytest
import re
from pathlib import Path

from .dungeon_test_config import ALL_DUNGEONS, DUNGEON_TEST_GROUPS
from .dungeon_test_helpers import (
    DungeonDataParser,
    DungeonDataValidator,
    DungeonTestReporter,
)


PROJECT_ROOT = Path(__file__).parent.parent.parent
DUNGEONS_PATH = PROJECT_ROOT / "src" / "data" / "dungeons"


class TestDungeonDataIntegrity:
    """测试副本数据完整性"""

    def test_dungeons_directory_exists(self):
        """副本目录应该存在"""
        assert DUNGEONS_PATH.exists(), f"Dungeons directory not found: {DUNGEONS_PATH}"

    def test_dungeon_registry_exists(self):
        """DungeonRegistry.js 应该存在"""
        registry_path = DUNGEONS_PATH / "DungeonRegistry.js"
        assert registry_path.exists(), f"DungeonRegistry.js not found"

    def test_all_dungeon_files_exist(self):
        """所有注册的副本文件应该存在"""
        for dungeon_id, dungeon_info in ALL_DUNGEONS.items():
            file_path = DUNGEONS_PATH / dungeon_info["file"]
            assert file_path.exists(), f"Dungeon file not found: {dungeon_info['file']} ({dungeon_id})"


class TestDungeonEncounterStructure:
    """测试副本遭遇战结构"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_dungeon_has_encounters(self, parser, dungeon_id):
        """每个副本应该有遭遇战列表"""
        content = parser.read_dungeon_file(dungeon_id)
        encounters = parser.extract_encounters(content)

        assert len(encounters) > 0, f"{dungeon_id} 没有定义任何遭遇战"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_dungeon_has_boss(self, parser, dungeon_id):
        """每个副本应该至少有一个Boss"""
        content = parser.read_dungeon_file(dungeon_id)
        encounters = parser.extract_encounters(content)

        boss_encounters = [e for e in encounters if e["type"] == "boss"]
        assert len(boss_encounters) > 0, f"{dungeon_id} 没有Boss遭遇战"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_boss_count_matches_registry(self, parser, dungeon_id):
        """Boss数量应该与注册表一致"""
        content = parser.read_dungeon_file(dungeon_id)
        encounters = parser.extract_encounters(content)

        expected_count = ALL_DUNGEONS[dungeon_id]["boss_count"]
        actual_count = len([e for e in encounters if e["type"] == "boss"])

        assert actual_count == expected_count, \
            f"{dungeon_id} Boss数量不匹配: 期望 {expected_count}, 实际 {actual_count}"


class TestBossPhaseSystem:
    """测试Boss阶段系统"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def validator(self):
        return DungeonDataValidator()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_bosses_have_phases(self, parser, dungeon_id):
        """每个Boss应该有阶段定义"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            phases = parser.extract_boss_phases(content, boss["id"])
            assert len(phases) > 0, f"{dungeon_id} - {boss['name']} 没有定义阶段"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_phase_thresholds_valid(self, parser, validator, dungeon_id):
        """阶段血量阈值应该有效"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            phases = parser.extract_boss_phases(content, boss["id"])
            is_valid, errors = validator.validate_boss_phases(phases)

            assert is_valid, f"{dungeon_id} - {boss['name']}: {errors}"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_phase_thresholds_order(self, parser, dungeon_id):
        """阶段阈值应该递减 (1.0 -> 0.x -> 0.y)"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            phases = parser.extract_boss_phases(content, boss["id"])

            # 第一个阶段的阈值应该是1.0（满血）
            if phases:
                first_threshold = phases[0]["hpThreshold"]
                assert first_threshold == 1.0, \
                    f"{dungeon_id} - {boss['name']}: 第一阶段阈值应该是1.0, 实际 {first_threshold}"

            # 阈值应该递减
            thresholds = [p["hpThreshold"] for p in phases]
            sorted_thresholds = sorted(thresholds, reverse=True)
            assert thresholds == sorted_thresholds, \
                f"{dungeon_id} - {boss['name']}: 阈值应递减, 实际 {thresholds}"


class TestBossEnrageSystem:
    """测试Boss狂暴系统"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def validator(self):
        return DungeonDataValidator()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_enrage_config_valid(self, parser, validator, dungeon_id):
        """狂暴配置应该有效"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            enrage = parser.extract_enrage_config(content, boss["id"])
            is_valid, errors = validator.validate_enrage_config(enrage)

            # 狂暴是可选的，但如果定义了就要验证
            if enrage:
                assert is_valid, f"{dungeon_id} - {boss['name']}: {errors}"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_enrage_trigger_round_reasonable(self, parser, dungeon_id):
        """狂暴触发回合应该在合理范围内"""
        content = parser.read_dungeon_file(dungeon_id)
        bosses = parser.extract_bosses(content)

        for boss in bosses:
            enrage = parser.extract_enrage_config(content, boss["id"])

            if enrage and "triggerRound" in enrage:
                trigger_round = enrage["triggerRound"]
                # 狂暴触发应该在5-30回合之间
                assert 5 <= trigger_round <= 30, \
                    f"{dungeon_id} - {boss['name']}: 狂暴回合 {trigger_round} 不在合理范围 (5-30)"


class TestBossSummonSystem:
    """测试Boss召唤系统"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.fixture
    def validator(self):
        return DungeonDataValidator()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_summon_skills_have_definitions(self, parser, validator, dungeon_id):
        """召唤技能应该有对应的召唤物定义"""
        content = parser.read_dungeon_file(dungeon_id)

        # 查找召唤技能
        summon_skill_pattern = r"type:\s*['\"]summon['\"].*?summonId:\s*['\"](\w+)['\"]"
        summon_ids = re.findall(summon_skill_pattern, content, re.DOTALL)

        for summon_id in set(summon_ids):
            is_valid, errors = validator.validate_summon_definition(content, summon_id)
            assert is_valid, f"{dungeon_id} - 召唤物 {summon_id}: {errors}"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_summon_definitions_have_skills(self, parser, dungeon_id):
        """召唤物定义应该有技能"""
        content = parser.read_dungeon_file(dungeon_id)
        summons = parser.extract_summons(content)

        for summon in summons:
            # 使用validate_summon_definition来检查技能
            validator = DungeonDataValidator()
            is_valid, errors = validator.validate_summon_definition(content, summon['key'])
            # 只检查是否有skills
            if "skills:" not in content[content.find(f"{summon['key']}:"):content.find(f"{summon['key']}:") + 2000]:
                assert False, f"{dungeon_id} - 召唤物 {summon['name']} 没有技能定义"


class TestBossTelegraphSystem:
    """测试Boss蓄力技能系统"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_telegraph_skills_have_charge_rounds(self, parser, dungeon_id):
        """蓄力技能应该有蓄力回合数"""
        content = parser.read_dungeon_file(dungeon_id)
        telegraphs = parser.extract_telegraph_skills(content)

        for telegraph in telegraphs:
            assert "chargeRounds" in telegraph, \
                f"{dungeon_id} - 蓄力技能 {telegraph['skillId']} 没有定义chargeRounds"
            assert telegraph["chargeRounds"] >= 1, \
                f"{dungeon_id} - 蓄力技能 {telegraph['skillId']} 的chargeRounds应该 >= 1"

    @pytest.mark.parametrize("dungeon_id", list(ALL_DUNGEONS.keys()))
    def test_telegraph_skills_have_messages(self, parser, dungeon_id):
        """蓄力技能应该有预警消息"""
        content = parser.read_dungeon_file(dungeon_id)
        telegraphs = parser.extract_telegraph_skills(content)

        for telegraph in telegraphs:
            assert "chargeMessage" in telegraph, \
                f"{dungeon_id} - 蓄力技能 {telegraph['skillId']} 没有定义chargeMessage"


class TestDungeonMechanics:
    """测试副本特殊机制"""

    @pytest.fixture
    def parser(self):
        return DungeonDataParser()

    # 特定副本的特殊测试
    def test_wailing_caverns_serpentis_phases(self, parser):
        """哀嚎洞穴瑟芬迪斯应该有3个阶段"""
        content = parser.read_dungeon_file("wailing_caverns")
        phases = parser.extract_boss_phases(content, "serpentis")

        assert len(phases) == 3, f"瑟芬迪斯应该有3个阶段, 实际 {len(phases)}"

        # 验证阶段名称
        phase_names = [p["name"] for p in phases]
        assert "毒蛇之怒" in phase_names
        assert "触手召唤" in phase_names
        assert "狂暴蜕变" in phase_names

    def test_wailing_caverns_serpentis_summon(self, parser):
        """瑟芬迪斯第二阶段应该召唤触手藤"""
        content = parser.read_dungeon_file("wailing_caverns")

        # 验证阶段有召唤配置
        summon_pattern = r"onEnter:\s*\{[^}]*type:\s*['\"]summon['\"].*?summonId:\s*['\"]tendril_vine['\"]"
        assert re.search(summon_pattern, content, re.DOTALL), \
            "瑟芬迪斯第二阶段应该召唤tendril_vine"

        # 验证触手藤有定义
        assert "tendril_vine" in content, "触手藤定义不存在"

    def test_shadowfang_keep_godfrey_summon(self, parser):
        """影牙城堡戈弗雷应该召唤食尸鬼"""
        content = parser.read_dungeon_file("shadowfang_keep")

        # 验证有summon_ghoul技能
        assert "summon_ghoul" in content, "戈弗雷应该有summon_ghoul技能"

        # 验证食尸鬼定义
        assert "腐尸食尸鬼" in content or "ghoul" in content.lower(), \
            "戈弗雷的食尸鬼召唤物定义不存在"

    def test_gnomeregan_grubbis_summon(self, parser):
        """诺莫瑞根格鲁比斯应该召唤矿工"""
        content = parser.read_dungeon_file("gnomeregan")

        # 验证召唤技能
        assert "summon_miners" in content or "summon_crazy_miner" in content, \
            "格鲁比斯应该有召唤矿工的技能"


class TestDungeonFullScan:
    """完整扫描所有副本"""

    def test_all_dungeons_complete_validation(self):
        """对所有副本进行完整验证"""
        parser = DungeonDataParser()
        validator = DungeonDataValidator()
        reporter = DungeonTestReporter()

        for dungeon_id, dungeon_info in ALL_DUNGEONS.items():
            reporter.start_dungeon(dungeon_id, dungeon_info["name"])

            try:
                content = parser.read_dungeon_file(dungeon_id)

                # 测试遭遇战
                reporter.start_test("遭遇战结构")
                encounters = parser.extract_encounters(content)
                if len(encounters) > 0:
                    reporter.pass_test(f"{len(encounters)}个遭遇战")
                else:
                    reporter.fail_test("没有遭遇战")

                # 测试Boss数量
                reporter.start_test("Boss数量")
                expected = dungeon_info["boss_count"]
                actual = len([e for e in encounters if e["type"] == "boss"])
                if actual == expected:
                    reporter.pass_test(f"{actual}个Boss")
                else:
                    reporter.fail_test(f"期望{expected}, 实际{actual}")

                # 测试Boss阶段
                reporter.start_test("Boss阶段")
                bosses = parser.extract_bosses(content)
                all_phases_valid = True
                for boss in bosses:
                    phases = parser.extract_boss_phases(content, boss["id"])
                    is_valid, _ = validator.validate_boss_phases(phases)
                    all_phases_valid = all_phases_valid and is_valid

                if all_phases_valid:
                    reporter.pass_test(f"{len(bosses)}个Boss阶段配置正确")
                else:
                    reporter.fail_test("部分Boss阶段配置有问题")

                # 测试召唤物
                reporter.start_test("召唤物定义")
                summons = parser.extract_summons(content)
                # 检查是否有召唤技能但没有召唤物定义
                summon_skills = re.findall(r"type:\s*['\"]summon['\"]", content)
                if summon_skills and not summons:
                    reporter.fail_test("有召唤技能但缺少召唤物定义")
                else:
                    reporter.pass_test(f"{len(summons)}个召唤物定义")

                # 测试狂暴
                reporter.start_test("狂暴配置")
                enrage_valid = True
                for boss in bosses:
                    enrage = parser.extract_enrage_config(content, boss["id"])
                    if enrage:
                        is_valid, _ = validator.validate_enrage_config(enrage)
                        enrage_valid = enrage_valid and is_valid

                if enrage_valid:
                    reporter.pass_test("狂暴配置有效")
                else:
                    reporter.fail_test("狂暴配置有问题")

            except Exception as e:
                reporter.start_test("文件读取")
                reporter.fail_test(str(e))

            reporter.end_dungeon()

        # 打印报告
        success = reporter.print_report()

        # 断言所有测试通过
        summary = reporter.get_summary()
        assert summary["total_failed"] == 0, f"有 {summary['total_failed']} 个测试失败"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
