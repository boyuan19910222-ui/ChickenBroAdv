"""
Pytest configuration and fixtures for ChickenBro game testing.
"""
import pytest
import os
import sys
import json
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# Data Fixtures - Load game data for testing
# ============================================================

@pytest.fixture
def game_data_path():
    """Path to GameData.js"""
    return PROJECT_ROOT / "src" / "data" / "GameData.js"

@pytest.fixture
def talent_data_path():
    """Path to TalentData.js"""
    return PROJECT_ROOT / "src" / "data" / "TalentData.js"

@pytest.fixture
def dungeons_path():
    """Path to dungeons directory"""
    return PROJECT_ROOT / "src" / "data" / "dungeons"

@pytest.fixture
def game_data_raw(game_data_path):
    """Read raw GameData.js content"""
    with open(game_data_path, 'r', encoding='utf-8') as f:
        return f.read()

@pytest.fixture
def classes_data():
    """Load classes data from GameData.js"""
    # This is a simplified extraction - in real use you might use a JS parser
    data_path = PROJECT_ROOT / "src" / "data" / "GameData.js"
    with open(data_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract class IDs from the file
    classes = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
    return classes


# ============================================================
# Class Fixtures - Test data for each class
# ============================================================

@pytest.fixture
def warrior_test_data():
    """Test data for Warrior class"""
    return {
        'id': 'warrior',
        'name': '战士',
        'resource': 'rage',
        'expected_skills': [
            'heroicStrike', 'charge', 'rend', 'battleShout',
            'cleave', 'mortalStrike', 'execute', 'bloodthirst',
            'shieldBlock', 'taunt', 'shieldWall'
        ],
        'talent_trees': ['arms', 'fury', 'protection']
    }

@pytest.fixture
def rogue_test_data():
    """Test data for Rogue class"""
    return {
        'id': 'rogue',
        'name': '盗贼',
        'resource': 'energy',
        'expected_skills': [
            'shadowStrike', 'eviscerate', 'stealth', 'ambush', 'evade',
            'deadlyPoison', 'mutilate', 'bladeFlurry', 'killingSpree',
            'vanish', 'shadowDance'
        ],
        'talent_trees': ['assassination', 'combat', 'subtlety']
    }

@pytest.fixture
def druid_test_data():
    """Test data for Druid class"""
    return {
        'id': 'druid',
        'name': '德鲁伊',
        'resource': 'mana',
        'expected_skills': [
            'wrath', 'moonfire', 'rejuvenation', 'healingTouch', 'entanglingRoots',
            'bearForm', 'maul', 'swipe', 'demoralizingRoar', 'bash',
            'catForm', 'claw', 'rake', 'ferociousBite', 'prowl',
            'moonkinForm', 'starfall', 'mangle', 'swiftmend', 'treeOfLifeForm'
        ],
        'talent_trees': ['balance', 'feral', 'restoration']
    }


# ============================================================
# Dungeon Fixtures - Test data for dungeons
# ============================================================

@pytest.fixture
def wailing_caverns_data():
    """Test data for Wailing Caverns dungeon"""
    return {
        'id': 'wailing_caverns',
        'name': '哀嚎洞穴',
        'level_range': (1, 3),
        'bosses': [
            {
                'id': 'serpentis',
                'name': '变异的瑟芬迪斯',
                'hp': 800,
                'phases': 3
            }
        ]
    }

@pytest.fixture
def shadowfang_keep_data():
    """Test data for Shadowfang Keep dungeon"""
    return {
        'id': 'shadowfang_keep',
        'name': '影牙城堡',
        'bosses': [
            {
                'id': 'godfrey',
                'name': '大领主戈弗雷',
                'hp': 1100,
                'has_summon': True,
                'summon_id': 'ghoul'
            }
        ]
    }


# ============================================================
# Playwright Fixtures - Browser automation
# ============================================================

@pytest.fixture(scope="session")
def browser_type_launch_args():
    """Default browser launch arguments"""
    return {
        "headless": True,
        "args": ["--no-sandbox", "--disable-setuid-sandbox"]
    }

@pytest.fixture(scope="session")
def base_url():
    """Base URL for the application"""
    return "http://localhost:5173"


# ============================================================
# Helper Functions
# ============================================================

def extract_skill_ids_from_js(content: str) -> list:
    """Extract skill IDs from GameData.js content"""
    import re
    # Match patterns like: id: 'skillName'
    pattern = r"id:\s*'([^']+)',\s*name:"
    matches = re.findall(pattern, content)
    return matches

def extract_class_skills(content: str, class_id: str) -> list:
    """Extract skill array for a specific class"""
    import re
    # Find the class section and extract skills array
    pattern = rf"{class_id}:.*?skills:\s*\[(.*?)\]"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        skills_str = match.group(1)
        # Extract skill IDs from the array
        skill_pattern = r"'([^']+)'"
        return re.findall(skill_pattern, skills_str)
    return []

def validate_skill_structure(skill_data: dict) -> tuple[bool, list]:
    """
    Validate a skill has required fields.
    Returns (is_valid, list_of_missing_fields)
    """
    required_fields = ['id', 'name', 'description', 'skillType', 'targetType']
    missing = [f for f in required_fields if f not in skill_data]
    return len(missing) == 0, missing
