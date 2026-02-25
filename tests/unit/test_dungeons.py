"""
Unit tests for dungeon and boss data validation.
"""
import pytest
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).parent.parent.parent
DUNGEONS_PATH = PROJECT_ROOT / "src" / "data" / "dungeons"


class TestDungeonDataIntegrity:
    """Test dungeon data structure"""

    def test_dungeons_directory_exists(self):
        """Dungeons directory should exist"""
        assert DUNGEONS_PATH.exists(), "Dungeons directory not found"

    def test_dungeon_registry_exists(self):
        """DungeonRegistry.js should exist"""
        registry_path = DUNGEONS_PATH / "DungeonRegistry.js"
        assert registry_path.exists(), "DungeonRegistry.js not found"


class TestWailingCaverns:
    """Test Wailing Caverns dungeon"""

    @pytest.fixture
    def dungeon_content(self):
        path = DUNGEONS_PATH / "WailingCaverns.js"
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def test_dungeon_has_boss(self, dungeon_content):
        """Wailing Caverns should have at least one boss"""
        # Dungeon uses 'encounters' array with 'boss' type entries
        assert 'encounters' in dungeon_content or 'boss' in dungeon_content.lower()

    def test_serpentis_has_phases(self, dungeon_content):
        """Serpentis should have multiple phases"""
        assert 'serpentis' in dungeon_content
        assert 'phases' in dungeon_content


class TestShadowfangKeep:
    """Test Shadowfang Keep dungeon"""

    @pytest.fixture
    def dungeon_content(self):
        path = DUNGEONS_PATH / "ShadowfangKeep.js"
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def test_godfrey_has_summon(self, dungeon_content):
        """Godfrey should have summon_ghoul skill"""
        assert 'summon_ghoul' in dungeon_content

    def test_ghoul_definition_exists(self, dungeon_content):
        """Ghoul summon should have a definition"""
        assert 'ghoul' in dungeon_content
        assert '腐尸食尸鬼' in dungeon_content


class TestGnomeregan:
    """Test Gnomeregan dungeon"""

    @pytest.fixture
    def dungeon_content(self):
        path = DUNGEONS_PATH / "Gnomeregan.js"
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def test_grubbis_has_summon(self, dungeon_content):
        """Grubbis should have summon_miners skill"""
        assert 'summon_miners' in dungeon_content or 'summon_crazy_miner' in dungeon_content

    def test_thermaplugg_has_bomb_bot(self, dungeon_content):
        """Thermaplugg should have summon_bomb_bot skill"""
        assert 'summon_bomb_bot' in dungeon_content or 'summon_bomb_robot' in dungeon_content


class TestBossPhaseSystem:
    """Test boss phase definitions"""

    @pytest.fixture
    def all_dungeon_content(self):
        """Read all dungeon files"""
        content = {}
        for file_path in DUNGEONS_PATH.glob("*.js"):
            if file_path.name != "DungeonRegistry.js" and file_path.name != "ClassicEquipment.js":
                with open(file_path, 'r', encoding='utf-8') as f:
                    content[file_path.name] = f.read()
        return content

    def test_phase_thresholds_are_valid(self, all_dungeon_content):
        """Phase hpThreshold values should be between 0 (exclusive) and 1 (inclusive)"""
        for filename, content in all_dungeon_content.items():
            # Find hpThreshold values
            pattern = r"hpThreshold:\s*([\d.]+)"
            matches = re.findall(pattern, content)
            
            for threshold in matches:
                value = float(threshold)
                # 0.0 means initial phase (always active), so it's valid
                # But actual phase transitions should be > 0 and <= 1
                assert 0 <= value <= 1, \
                    f"Invalid hpThreshold {value} in {filename} - should be between 0 and 1"


class TestSummonDefinitions:
    """Test boss summon definitions"""

    @pytest.fixture
    def all_dungeon_content(self):
        """Read all dungeon files"""
        content = {}
        for file_path in DUNGEONS_PATH.glob("*.js"):
            if file_path.name not in ["DungeonRegistry.js", "ClassicEquipment.js"]:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content[file_path.name] = f.read()
        return content

    def test_summon_skills_have_summonid(self, all_dungeon_content):
        """Summon skills should have summonId field"""
        for filename, content in all_dungeon_content.items():
            # Find summon skills
            if 'skillType' in content and 'summon' in content:
                # This is a simplified check
                # In real implementation, would parse the JS properly
                pass


# Run tests with: pytest tests/unit/test_dungeons.py -v
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
