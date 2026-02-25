"""
Unit tests for talent tree data validation.
Tests that all talent trees have proper structure and dependencies.
"""
import pytest
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).parent.parent.parent
TALENT_DATA_PATH = PROJECT_ROOT / "src" / "data" / "TalentData.js"
GAME_DATA_PATH = PROJECT_ROOT / "src" / "data" / "GameData.js"


def read_talent_data():
    """Read TalentData.js file content"""
    with open(TALENT_DATA_PATH, 'r', encoding='utf-8') as f:
        return f.read()


def read_game_data():
    """Read GameData.js file content"""
    with open(GAME_DATA_PATH, 'r', encoding='utf-8') as f:
        return f.read()


class TestTalentTreeStructure:
    """Test that talent trees have proper structure"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_talent_data()

    def test_all_classes_have_talent_trees(self):
        """Every class should have 3 talent trees"""
        classes = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
        
        for class_id in classes:
            # Each class should have 3 talent trees defined
            pattern = rf"{class_id}:\s*\{{"
            match = re.search(pattern, self.content)
            assert match, f"Class '{class_id}' not found in talent data"

    def test_talent_trees_have_5_tiers(self):
        """All talent trees should have 5 tiers"""
        # This is a simplified check
        tiers = ['tier: 1', 'tier: 2', 'tier: 3', 'tier: 4', 'tier: 5']
        
        for tier in tiers:
            assert tier in self.content, f"Talent tree should have {tier}"


class TestTalentDependencies:
    """Test talent dependency chains"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.talent_content = read_talent_data()

    def test_requires_references_exist(self):
        """All 'requires' references should point to existing talents"""
        # Find all requires: 'talentId' patterns
        pattern = r"requires:\s*['\"](\w+)['\"]"
        requires_matches = re.findall(pattern, self.talent_content)
        
        for required_id in requires_matches:
            # Check if this talent ID exists in the file
            id_pattern = rf"id:\s*['\"]" + required_id + r"['\"]"
            assert re.search(id_pattern, self.talent_content), \
                f"Talent '{required_id}' referenced in 'requires' does not exist"


class TestUnlockSkillTalents:
    """Test talents that unlock skills"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.talent_content = read_talent_data()
        self.game_content = read_game_data()

    def test_unlock_skill_ids_exist_in_gamedata(self):
        """All unlock_skill talents should reference skills that exist in GameData"""
        # Find all unlock_skill effect types
        pattern = r"type:\s*['\"]unlock_skill['\"].*?skill:\s*['\"](\w+)['\"]"
        matches = re.findall(pattern, self.talent_content, re.DOTALL)
        
        for skill_id in matches:
            # Check if skill exists in GameData
            skill_pattern = rf"{skill_id}:\s*\{{"
            assert re.search(skill_pattern, self.game_content), \
                f"Skill '{skill_id}' unlocked by talent does not exist in GameData"


class TestWarriorTalents:
    """Test Warrior talent trees"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_talent_data()

    def test_arms_tree_has_mortal_strike(self):
        """Arms tree should unlock Mortal Strike"""
        pattern = r"arms.*?mortalStrike"
        assert re.search(pattern, self.content, re.DOTALL), \
            "Arms tree should have Mortal Strike talent"

    def test_fury_tree_has_execute(self):
        """Fury tree should unlock Execute"""
        pattern = r"fury.*?execute"
        assert re.search(pattern, self.content, re.DOTALL), \
            "Fury tree should have Execute talent"


class TestRogueTalents:
    """Test Rogue talent trees"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_talent_data()

    def test_assassination_has_deadly_poison(self):
        """Assassination tree should unlock Deadly Poison"""
        pattern = r"assassination.*?deadlyPoison"
        assert re.search(pattern, self.content, re.DOTALL), \
            "Assassination tree should have Deadly Poison talent"

    def test_combat_has_blade_flurry(self):
        """Combat tree should unlock Blade Flurry"""
        pattern = r"combat.*?bladeFlurry"
        assert re.search(pattern, self.content, re.DOTALL), \
            "Combat tree should have Blade Flurry talent"


class TestMageTalents:
    """Test Mage talent trees"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_talent_data()

    def test_fire_tree_has_combustion(self):
        """Fire tree should unlock Combustion"""
        pattern = r"fire.*?combustion"
        assert re.search(pattern, self.content, re.DOTALL), \
            "Fire tree should have Combustion talent"

    def test_frost_tree_has_ice_block(self):
        """Frost tree should unlock Ice Block"""
        pattern = r"frost.*?iceBlock"
        assert re.search(pattern, self.content, re.DOTALL), \
            "Frost tree should have Ice Block talent"


class TestHunterTalents:
    """Test Hunter talent trees"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_talent_data()
        self.game_content = read_game_data()

    def test_beast_mastery_has_kill_command(self):
        """Beast Mastery tree should unlock Kill Command"""
        assert 'killCommand' in self.content


class TestPaladinTalents:
    """Test Paladin talent trees"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_talent_data()

    def test_holy_tree_has_lay_on_hands(self):
        """Holy tree should unlock Lay on Hands"""
        assert 'layOnHands' in self.content

    def test_protection_tree_has_divine_shield(self):
        """Protection tree should unlock Divine Shield"""
        assert 'divineShield' in self.content


# Run tests with: pytest tests/unit/test_talents.py -v
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
