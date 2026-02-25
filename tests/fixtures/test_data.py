"""
Test fixtures with sample game data for testing.
"""
import pytest

# Sample character data for testing
SAMPLE_CHARACTERS = {
    "warrior_level1": {
        "id": "test_warrior",
        "class": "warrior",
        "name": "TestWarrior",
        "level": 1,
        "stats": {
            "health": 110,
            "mana": 0,
            "rage": 0,
            "strength": 14,
            "agility": 8,
            "intellect": 5,
            "stamina": 12,
            "spirit": 7
        }
    },
    "mage_level1": {
        "id": "test_mage",
        "class": "mage",
        "name": "TestMage",
        "level": 1,
        "stats": {
            "health": 60,
            "mana": 100,
            "strength": 3,
            "agility": 5,
            "intellect": 18,
            "stamina": 6,
            "spirit": 14
        }
    },
    "druid_level1": {
        "id": "test_druid",
        "class": "druid",
        "name": "TestDruid",
        "level": 1,
        "stats": {
            "health": 85,
            "mana": 75,
            "strength": 9,
            "agility": 10,
            "intellect": 12,
            "stamina": 9,
            "spirit": 14
        }
    }
}

# Sample combat scenarios
SAMPLE_COMBAT_SCENARIOS = {
    "warrior_vs_basic_enemy": {
        "attacker": "warrior_level1",
        "defender": {
            "id": "basic_enemy",
            "name": "测试敌人",
            "hp": 50,
            "armor": 0
        },
        "expected_damage_range": (15, 25)
    },
    "mage_fireball": {
        "attacker": "mage_level1",
        "skill": "fireball",
        "defender": {
            "id": "basic_enemy",
            "name": "测试敌人",
            "hp": 50,
            "armor": 0
        },
        "expected_damage_range": (40, 60)
    }
}

# Sample dungeon runs
SAMPLE_DUNGEON_RUNS = {
    "wailing_caverns_full": {
        "dungeon_id": "wailing_caverns",
        "party": [
            {"class": "warrior", "level": 3, "role": "tank"},
            {"class": "priest", "level": 3, "role": "healer"},
            {"class": "mage", "level": 3, "role": "dps"},
            {"class": "rogue", "level": 3, "role": "dps"}
        ],
        "expected_bosses": ["serpentis"]
    }
}

# Sample talent builds
SAMPLE_TALENT_BUILDS = {
    "warrior_arms": {
        "class": "warrior",
        "tree": "arms",
        "talents": {
            "improvedHeroicStrike": 2,
            "deflection": 3,
            "tacticalMastery": 5,
            "impale": 2,
            "cleave": 1,
            "mortalStrike": 1
        }
    },
    "mage_frost": {
        "class": "mage",
        "tree": "frost",
        "talents": {
            "frostbite": 3,
            "improvedFrostbolt": 5,
            "iceShards": 5,
            "piercingIce": 3,
            "coldSnap": 1
        }
    }
}


@pytest.fixture
def sample_characters():
    """Return sample character data"""
    return SAMPLE_CHARACTERS

@pytest.fixture
def sample_combat_scenarios():
    """Return sample combat scenarios"""
    return SAMPLE_COMBAT_SCENARIOS

@pytest.fixture
def sample_dungeon_runs():
    """Return sample dungeon run configurations"""
    return SAMPLE_DUNGEON_RUNS

@pytest.fixture
def sample_talent_builds():
    """Return sample talent build configurations"""
    return SAMPLE_TALENT_BUILDS
