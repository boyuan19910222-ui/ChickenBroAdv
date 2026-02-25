"""
Dungeon Test Helpers
副本测试辅助函数 - 提供测试框架的核心工具函数
"""
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any


PROJECT_ROOT = Path(__file__).parent.parent.parent
DUNGEONS_PATH = PROJECT_ROOT / "src" / "data" / "dungeons"


class DungeonDataParser:
    """解析副本数据文件的辅助类"""

    @staticmethod
    def read_dungeon_file(dungeon_id: str) -> str:
        """读取副本数据文件内容"""
        from .dungeon_test_config import ALL_DUNGEONS

        if dungeon_id not in ALL_DUNGEONS:
            raise ValueError(f"Unknown dungeon: {dungeon_id}")

        file_name = ALL_DUNGEONS[dungeon_id]["file"]
        file_path = DUNGEONS_PATH / file_name

        if not file_path.exists():
            raise FileNotFoundError(f"Dungeon file not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    @staticmethod
    def extract_bosses(content: str) -> List[Dict]:
        """从副本文件中提取Boss列表"""
        bosses = []

        # 查找所有boss配置 (boss_xxx: { ... })
        boss_pattern = r"boss_\w+:\s*\{[^}]*id:\s*['\"](\w+)['\"][^}]*name:\s*['\"]([^'\"]+)['\"]"
        matches = re.findall(boss_pattern, content)

        for boss_id, boss_name in matches:
            bosses.append({
                "id": boss_id,
                "name": boss_name,
            })

        return bosses

    @staticmethod
    def extract_boss_phases(content: str, boss_id: str) -> List[Dict]:
        """提取Boss的阶段配置"""
        phases = []

        # 更好的方法：找到boss配置的起始位置，然后提取phases数组
        # 首先找到包含该boss_id的boss_配置开始位置
        boss_start_pattern = rf"boss_\w+:\s*\{{\s*id:\s*['\"]({boss_id})['\"]"
        boss_match = re.search(boss_start_pattern, content)

        if not boss_match:
            # 尝试另一种模式：boss配置中id不在最前面
            boss_start_pattern = rf"boss_\w+:\s*\{{[^{{]*id:\s*['\"]({boss_id})['\"]"
            boss_match = re.search(boss_start_pattern, content)

        if boss_match:
            # 从boss配置开始，找到phases数组
            start_pos = boss_match.start()
            # 查找phases: [ ... ]
            phases_pattern = r"phases:\s*\[(.*?)\]\s*,?\s*(?:enrage|skills|getEncounter|createBoss|//|loot)"
            phases_match = re.search(phases_pattern, content[start_pos:], re.DOTALL)

            if not phases_match:
                # 备用方法：找到phases开始，手动匹配到闭合的 ]
                phases_start = content.find("phases: [", start_pos)
                if phases_start != -1:
                    # 计算括号平衡来找到正确的结束位置
                    bracket_count = 1
                    pos = phases_start + len("phases: [")
                    start = pos
                    while pos < len(content) and bracket_count > 0:
                        if content[pos] == '[':
                            bracket_count += 1
                        elif content[pos] == ']':
                            bracket_count -= 1
                        pos += 1
                    phases_content = content[start:pos-1]
                else:
                    phases_content = ""
            else:
                phases_content = phases_match.group(1)

            # 提取每个阶段
            if phases_content:
                # 格式1: 有 id, name, hpThreshold 的阶段
                phase_blocks = re.findall(r'\{\s*id:\s*(\d+).*?name:\s*[\'"]([^\'"]+)[\'"].*?hpThreshold:\s*([\d.]+)', phases_content, re.DOTALL)

                for phase_id, phase_name, hp_threshold in phase_blocks:
                    phases.append({
                        "id": int(phase_id),
                        "name": phase_name,
                        "hpThreshold": float(hp_threshold),
                    })

                # 格式2: 只有 hpPercent (没有id和name的阶段) - 简化格式
                if not phases:
                    # 匹配 { hpPercent: 100, ... } 格式
                    simple_phases = re.findall(r'\{\s*hpPercent:\s*(\d+)', phases_content)
                    for i, hp_percent in enumerate(simple_phases):
                        phases.append({
                            "id": i + 1,
                            "name": f"阶段{i + 1}",
                            "hpThreshold": float(hp_percent) / 100.0,
                        })

        return phases

    @staticmethod
    def extract_summons(content: str) -> List[Dict]:
        """提取副本中的召唤物定义"""
        summons = []

        # 查找召唤物配置 (type: 'add' 且不是 wave_x 或 boss_)
        # 召唤物通常有 stats 和 skills，并且 type: 'add'
        # 改进的正则：匹配召唤物的key（通常以summon_开头，但不一定）
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # 查找可能是召唤物定义的行（xxx: { 格式）
            key_match = re.match(r'\s*(\w+):\s*\{\s*$', line)
            if key_match:
                key = key_match.group(1)
                # 排除 wave_ 和 boss_
                if key.startswith('wave_') or key.startswith('boss_'):
                    continue

                # 查找这个块中是否有 type: 'add'
                # 从当前行开始，找到闭合的 }
                bracket_count = 0
                block_lines = []
                for j in range(i, len(lines)):
                    block_lines.append(lines[j])
                    bracket_count += lines[j].count('{') - lines[j].count('}')
                    if bracket_count == 0 and j > i:
                        break

                block = '\n'.join(block_lines)

                # 检查是否有 type: 'add' 或者 key 以 summon_ 开头且有 stats 和 skills
                is_summon = False
                if "type: 'add'" in block or 'type: "add"' in block:
                    is_summon = True
                elif key.startswith('summon_'):
                    # 检查是否有 stats 和 skills（召唤物的特征）
                    if 'stats:' in block and 'skills:' in block:
                        is_summon = True

                if is_summon:
                    # 提取id和name
                    id_match = re.search(r"id:\s*['\"](\w+)['\"]", block)
                    name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", block)
                    if id_match and name_match:
                        summons.append({
                            "key": key,
                            "id": id_match.group(1),
                            "name": name_match.group(1),
                        })

        return summons

    @staticmethod
    def extract_enrage_config(content: str, boss_id: str) -> Optional[Dict]:
        """提取Boss的狂暴配置"""
        # 查找enrage配置
        enrage_pattern = rf"boss_\w+:\s*\{{[^}}]*id:\s*['\"]({boss_id})['\"].*?enrage:\s*\{{([^}}]+)\}}"
        match = re.search(enrage_pattern, content, re.DOTALL)

        if match:
            enrage_content = match.group(2)

            enrage = {}
            trigger_round = re.search(r"triggerRound:\s*(\d+)", enrage_content)
            if trigger_round:
                enrage["triggerRound"] = int(trigger_round.group(1))

            damage_mod = re.search(r"damageModifier:\s*([\d.]+)", enrage_content)
            if damage_mod:
                enrage["damageModifier"] = float(damage_mod.group(1))

            return enrage if enrage else None

        return None

    @staticmethod
    def extract_telegraph_skills(content: str) -> List[Dict]:
        """提取蓄力技能"""
        telegraphs = []

        # 查找telegraph配置
        telegraph_pattern = r"id:\s*['\"](\w+)['\"].*?telegraph:\s*\{{([^}}]+)\}}"
        matches = re.findall(telegraph_pattern, content, re.DOTALL)

        for skill_id, telegraph_content in matches:
            telegraph = {"skillId": skill_id}

            charge_rounds = re.search(r"chargeRounds:\s*(\d+)", telegraph_content)
            if charge_rounds:
                telegraph["chargeRounds"] = int(charge_rounds.group(1))

            charge_msg = re.search(r"chargeMessage:\s*['\"]([^'\"]+)['\"]", telegraph_content)
            if charge_msg:
                telegraph["chargeMessage"] = charge_msg.group(1)

            telegraphs.append(telegraph)

        return telegraphs

    @staticmethod
    def extract_encounters(content: str) -> List[Dict]:
        """提取遭遇战列表"""
        encounters = []

        # 查找encounters数组
        encounters_pattern = r"encounters:\s*\[(.*?)\]"
        match = re.search(encounters_pattern, content, re.DOTALL)

        if match:
            encounters_content = match.group(1)

            # 提取每个遭遇战
            encounter_pattern = r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?type:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"]"
            matches = re.findall(encounter_pattern, encounters_content)

            for enc_id, enc_type, enc_name in matches:
                encounters.append({
                    "id": enc_id,
                    "type": enc_type,
                    "name": enc_name,
                })

        return encounters


class DungeonDataValidator:
    """副本数据验证器"""

    @staticmethod
    def validate_boss_phases(phases: List[Dict]) -> Tuple[bool, List[str]]:
        """验证Boss阶段配置的有效性"""
        errors = []

        if not phases:
            errors.append("Boss没有定义任何阶段")
            return False, errors

        # 检查阶段ID连续性
        phase_ids = [p["id"] for p in phases]
        expected_ids = list(range(1, len(phases) + 1))
        if phase_ids != expected_ids:
            errors.append(f"阶段ID不连续: {phase_ids}, 期望: {expected_ids}")

        # 检查血量阈值递减（允许0.0作为特殊过渡阶段）
        thresholds = [p["hpThreshold"] for p in phases]
        # 过滤掉0.0（特殊过渡阶段）后检查递减
        non_zero_thresholds = [t for t in thresholds if t > 0]
        if non_zero_thresholds != sorted(non_zero_thresholds, reverse=True):
            errors.append(f"血量阈值应递减: {thresholds}")

        # 检查阈值范围（允许0.0作为特殊过渡阶段）
        for phase in phases:
            # hpThreshold为0.0表示特殊过渡阶段（如Boss倒下召唤新Boss）
            if phase["hpThreshold"] == 0.0:
                continue
            if not (0 < phase["hpThreshold"] <= 1):
                errors.append(f"阶段{phase['id']}的hpThreshold {phase['hpThreshold']} 不在有效范围 (0, 1]")

        return len(errors) == 0, errors

    @staticmethod
    def validate_summon_definition(content: str, summon_id: str) -> Tuple[bool, List[str]]:
        """验证召唤物定义是否完整"""
        errors = []

        # 检查召唤物是否有独立定义
        summon_def_pattern = rf"{summon_id}:\s*\{{"
        match = re.search(summon_def_pattern, content)
        if not match:
            errors.append(f"召唤物 {summon_id} 没有独立定义")
            return False, errors

        # 找到召唤物定义的起始位置
        start_pos = match.start()

        # 使用括号平衡来找到召唤物定义的结束位置
        bracket_count = 0
        pos = content.find("{", start_pos)
        block_start = pos
        while pos < len(content):
            if content[pos] == "{":
                bracket_count += 1
            elif content[pos] == "}":
                bracket_count -= 1
                if bracket_count == 0:
                    break
            pos += 1

        summon_block = content[block_start:pos+1]

        # 检查必要字段
        required_fields = ["hp", "damage"]
        for field in required_fields:
            if field not in summon_block:
                errors.append(f"召唤物 {summon_id} 缺少字段: {field}")

        # 检查skills字段 (可以是 skills: [ 或 skills: {)
        if "skills:" not in summon_block:
            errors.append(f"召唤物 {summon_id} 缺少字段: skills")

        return len(errors) == 0, errors

    @staticmethod
    def validate_enrage_config(enrage: Optional[Dict]) -> Tuple[bool, List[str]]:
        """验证狂暴配置"""
        errors = []

        if enrage is None:
            return True, []  # 狂暴不是必须的

        if "triggerRound" not in enrage:
            errors.append("狂暴配置缺少triggerRound")

        if "damageModifier" not in enrage:
            errors.append("狂暴配置缺少damageModifier")

        return len(errors) == 0, errors

    @staticmethod
    def validate_skill_definition(content: str, skill_id: str) -> Tuple[bool, List[str]]:
        """验证技能定义"""
        errors = []

        # 查找技能定义
        skill_pattern = rf"id:\s*['\"]({skill_id})['\"].*?skillType:\s*['\"](\w+)['\"]"
        match = re.search(skill_pattern, content)

        if not match:
            errors.append(f"技能 {skill_id} 没有定义")
            return False, errors

        return True, errors


class DungeonTestReporter:
    """副本测试报告生成器"""

    def __init__(self):
        self.results = []
        self.current_dungeon = None
        self.current_test = None

    def start_dungeon(self, dungeon_id: str, dungeon_name: str):
        """开始测试一个副本"""
        self.current_dungeon = {
            "id": dungeon_id,
            "name": dungeon_name,
            "tests": [],
            "passed": 0,
            "failed": 0,
            "skipped": 0,
        }

    def start_test(self, test_name: str):
        """开始一个测试项"""
        self.current_test = {
            "name": test_name,
            "status": "running",
            "details": [],
        }

    def pass_test(self, message: str = ""):
        """标记测试通过"""
        self.current_test["status"] = "passed"
        self.current_test["message"] = message
        self.current_dungeon["tests"].append(self.current_test)
        self.current_dungeon["passed"] += 1

    def fail_test(self, message: str):
        """标记测试失败"""
        self.current_test["status"] = "failed"
        self.current_test["message"] = message
        self.current_dungeon["tests"].append(self.current_test)
        self.current_dungeon["failed"] += 1

    def skip_test(self, reason: str):
        """标记测试跳过"""
        self.current_test["status"] = "skipped"
        self.current_test["message"] = reason
        self.current_dungeon["tests"].append(self.current_test)
        self.current_dungeon["skipped"] += 1

    def end_dungeon(self):
        """结束副本测试"""
        self.results.append(self.current_dungeon)
        return self.current_dungeon

    def get_summary(self) -> Dict:
        """获取测试摘要"""
        total_passed = sum(r["passed"] for r in self.results)
        total_failed = sum(r["failed"] for r in self.results)
        total_skipped = sum(r["skipped"] for r in self.results)

        return {
            "total_dungeons": len(self.results),
            "total_passed": total_passed,
            "total_failed": total_failed,
            "total_skipped": total_skipped,
            "dungeons": self.results,
        }

    def print_report(self):
        """打印测试报告"""
        summary = self.get_summary()

        print("\n" + "=" * 60)
        print("副本测试报告")
        print("=" * 60)

        for dungeon in summary["dungeons"]:
            status_icon = "✅" if dungeon["failed"] == 0 else "❌"
            print(f"\n{status_icon} {dungeon['name']} ({dungeon['id']})")
            print(f"   通过: {dungeon['passed']}, 失败: {dungeon['failed']}, 跳过: {dungeon['skipped']}")

            for test in dungeon["tests"]:
                icon = {"passed": "✓", "failed": "✗", "skipped": "○"}[test["status"]]
                print(f"   {icon} {test['name']}: {test.get('message', '')}")

        print("\n" + "-" * 60)
        print(f"总计: {summary['total_dungeons']}个副本, "
              f"{summary['total_passed']}通过, "
              f"{summary['total_failed']}失败, "
              f"{summary['total_skipped']}跳过")
        print("=" * 60)

        return summary["total_failed"] == 0
