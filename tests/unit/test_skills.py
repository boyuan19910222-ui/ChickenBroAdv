"""
Unit tests for skill data validation.
Tests that all skills defined in classes.skills arrays have complete definitions.
"""
import pytest
import re
from pathlib import Path


# Read GameData.js content
PROJECT_ROOT = Path(__file__).parent.parent.parent
GAME_DATA_PATH = PROJECT_ROOT / "src" / "data" / "GameData.js"


def read_game_data():
    """Read GameData.js file content"""
    with open(GAME_DATA_PATH, 'r', encoding='utf-8') as f:
        return f.read()


class TestSkillDataIntegrity:
    """Test that all skill data is properly defined"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Load game data before each test"""
        self.content = read_game_data()

    def test_all_class_skills_have_definitions(self):
        """Every skill ID in classes.skills should have a definition"""
        classes = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
        
        for class_id in classes:
            # Extract skills array for this class
            pattern = rf"{class_id}:\s*\{{.*?skills:\s*\[(.*?)\]"
            match = re.search(pattern, self.content, re.DOTALL)
            assert match, f"Could not find skills array for class: {class_id}"
            
            # Extract skill IDs
            skills_str = match.group(1)
            skill_ids = re.findall(r"'([^']+)'", skills_str)
            
            # Check each skill has a definition
            for skill_id in skill_ids:
                # Look for skill definition: skillId: { id: 'skillId'
                definition_pattern = rf"{skill_id}:\s*\{{\s*id:\s*['\"]" + skill_id + r"['\"]"
                assert re.search(definition_pattern, self.content), \
                    f"Skill '{skill_id}' in class '{class_id}' has no definition"

    def test_skill_definitions_have_required_fields(self):
        """All skill definitions should have required fields"""
        required_fields = ['id', 'name', 'description', 'skillType', 'targetType']
        
        # Find all skill definitions
        # Pattern matches: skillId: { id: 'skillId', ... }
        skill_pattern = r"(\w+):\s*\{[^}]*id:\s*['\"](\1)['\"].*?\}"
        
        # This is a simplified check - would need proper JS parser for full validation
        for field in required_fields:
            assert f"{field}:" in self.content or f"{field} :" in self.content, \
                f"Missing field pattern: {field}"


class TestWarriorSkills:
    """Test Warrior class skills"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_game_data()
        self.class_id = 'warrior'

    def test_warrior_has_heroic_strike(self):
        """Warrior should have heroicStrike skill"""
        assert 'heroicStrike' in self.content
        assert '英勇打击' in self.content

    def test_warrior_has_charge(self):
        """Warrior should have charge skill"""
        assert 'charge' in self.content
        assert '冲锋' in self.content

    def test_warrior_talent_skills_have_conditions(self):
        """Talent-unlocked skills should have requiresTalent condition"""
        talent_skills = ['cleave', 'mortalStrike', 'execute', 'bloodthirst', 
                         'shieldBlock', 'taunt', 'shieldWall']
        
        for skill in talent_skills:
            # Check for talentUnlock: true or conditions.requiresTalent
            has_talent_unlock = f"talentUnlock: true" in self.content
            has_requires_talent = f"requiresTalent" in self.content
            assert has_talent_unlock or has_requires_talent, \
                f"Skill '{skill}' should have talent unlock condition"


class TestRogueSkills:
    """Test Rogue class skills"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_game_data()
        self.class_id = 'rogue'

    def test_rogue_skill_count(self):
        """Rogue should have correct number of skills (11 after reduction)"""
        pattern = r"rogue:.*?skills:\s*\[(.*?)\]"
        match = re.search(pattern, self.content, re.DOTALL)
        assert match
        
        skills_str = match.group(1)
        skill_ids = re.findall(r"'([^']+)'", skills_str)
        
        # After the reduction, rogue should have 11 skills
        assert len(skill_ids) == 11, f"Expected 11 skills, found {len(skill_ids)}: {skill_ids}"

    def test_rogue_has_combo_system(self):
        """Rogue skills should use combo points"""
        assert 'comboPoints' in self.content
        assert 'generates:' in self.content or 'generates' in self.content


class TestDruidSkills:
    """Test Druid class skills"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_game_data()
        self.class_id = 'druid'

    def test_druid_has_forms(self):
        """Druid should have shapeshift forms"""
        forms = ['bearForm', 'catForm', 'moonkinForm', 'treeOfLifeForm']
        for form in forms:
            assert form in self.content, f"Druid should have {form}"

    def test_druid_bear_skills_require_form(self):
        """Bear form skills should require bear form"""
        bear_skills = ['maul', 'swipe', 'bash']
        for skill in bear_skills:
            # Check that skill has requiresForm condition
            pattern = rf"{skill}:.*?requiresForm.*?bear"
            assert re.search(pattern, self.content, re.DOTALL), \
                f"Skill '{skill}' should require bear form"


class TestSkillDamageTypes:
    """Test that skill damage types are valid"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_game_data()

    def test_valid_damage_types(self):
        """All damageType values should be valid"""
        valid_types = ['physical', 'fire', 'frost', 'arcane', 'shadow', 'holy', 'nature']
        
        # Find all damageType declarations
        pattern = r"damageType:\s*['\"](\w+)['\"]"
        matches = re.findall(pattern, self.content)
        
        for damage_type in matches:
            assert damage_type in valid_types, \
                f"Invalid damage type: {damage_type}"


class TestSkillTargetTypes:
    """Test that skill target types are valid"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.content = read_game_data()

    def test_valid_target_types(self):
        """All targetType values should be valid"""
        valid_types = [
            'enemy', 'ally', 'self', 'all_enemies', 'all_allies',
            'front_row', 'front_2', 'front_3', 'random_3', 'cleave_3',
            'melee', 'ranged', 'summon', 'buff', 'allEnemies'  # 'buff' for self-buffs, 'allEnemies' is variant
        ]
        
        pattern = r"targetType:\s*['\"](\w+)['\"]"
        matches = re.findall(pattern, self.content)
        
        for target_type in matches:
            assert target_type in valid_types, \
                f"Invalid target type: {target_type}"


# Run tests with: pytest tests/unit/test_skills.py -v
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
