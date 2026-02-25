"""
Dungeon Test Configuration
副本测试配置 - 包含所有副本的元数据和测试参数
"""

# 所有副本配置（从 DungeonRegistry.js 同步）
ALL_DUNGEONS = {
    # ==================== 低级副本 (Lv 13-32) ====================
    "ragefire_chasm": {
        "id": "ragefire_chasm",
        "name": "怒焰裂谷",
        "level_range": {"min": 13, "max": 18},
        "unlock_level": 13,
        "boss_count": 4,
        "file": "RagefireChasm.js",
        "type": "standard",
    },
    "deadmines": {
        "id": "deadmines",
        "name": "死亡矿井",
        "level_range": {"min": 17, "max": 26},
        "unlock_level": 17,
        "boss_count": 5,
        "file": "Deadmines.js",
        "type": "standard",
    },
    "wailing_caverns": {
        "id": "wailing_caverns",
        "name": "哀嚎洞穴",
        "level_range": {"min": 17, "max": 24},
        "unlock_level": 17,
        "boss_count": 1,
        "file": "WailingCaverns.js",
        "type": "standard",
    },
    "shadowfang_keep": {
        "id": "shadowfang_keep",
        "name": "影牙城堡",
        "level_range": {"min": 22, "max": 30},
        "unlock_level": 22,
        "boss_count": 5,
        "file": "ShadowfangKeep.js",
        "type": "standard",
    },
    "stormwind_stockade": {
        "id": "stormwind_stockade",
        "name": "暴风城监狱",
        "level_range": {"min": 24, "max": 32},
        "unlock_level": 24,
        "boss_count": 3,
        "file": "StormwindStockade.js",
        "type": "standard",
    },

    # ==================== 中级副本 (Lv 29-55) ====================
    "gnomeregan": {
        "id": "gnomeregan",
        "name": "诺莫瑞根",
        "level_range": {"min": 29, "max": 38},
        "unlock_level": 29,
        "boss_count": 4,
        "file": "Gnomeregan.js",
        "type": "standard",
    },
    "razorfen_kraul": {
        "id": "razorfen_kraul",
        "name": "剃刀沼泽",
        "level_range": {"min": 29, "max": 38},
        "unlock_level": 29,
        "boss_count": 4,
        "file": "RazorfenKraul.js",
        "type": "standard",
    },
    # 血色修道院 - 多翼副本
    "sm_graveyard": {
        "id": "sm_graveyard",
        "name": "血色修道院-墓地",
        "level_range": {"min": 28, "max": 38},
        "unlock_level": 28,
        "boss_count": 1,
        "file": "ScarletMonastery_GY.js",
        "type": "wing",
        "parent": "scarlet_monastery",
    },
    "sm_library": {
        "id": "sm_library",
        "name": "血色修道院-图书馆",
        "level_range": {"min": 33, "max": 40},
        "unlock_level": 33,
        "boss_count": 2,
        "file": "ScarletMonastery_Lib.js",
        "type": "wing",
        "parent": "scarlet_monastery",
    },
    "sm_armory": {
        "id": "sm_armory",
        "name": "血色修道院-军械库",
        "level_range": {"min": 36, "max": 42},
        "unlock_level": 36,
        "boss_count": 1,
        "file": "ScarletMonastery_Arm.js",
        "type": "wing",
        "parent": "scarlet_monastery",
    },
    "sm_cathedral": {
        "id": "sm_cathedral",
        "name": "血色修道院-大教堂",
        "level_range": {"min": 38, "max": 44},
        "unlock_level": 38,
        "boss_count": 2,  # 弗尔席恩、莫格莱尼
        "file": "ScarletMonastery_Cath.js",
        "type": "wing",
        "parent": "scarlet_monastery",
    },
    "zulfarrak": {
        "id": "zulfarrak",
        "name": "祖尔法拉克",
        "level_range": {"min": 44, "max": 54},
        "unlock_level": 44,
        "boss_count": 5,
        "file": "ZulFarrak.js",
        "type": "standard",
    },
    "maraudon": {
        "id": "maraudon",
        "name": "玛拉顿",
        "level_range": {"min": 46, "max": 55},
        "unlock_level": 46,
        "boss_count": 5,
        "file": "Maraudon.js",
        "type": "standard",
    },

    # ==================== 高级副本 (Lv 50-60) ====================
    "sunken_temple": {
        "id": "sunken_temple",
        "name": "阿塔哈卡神庙",
        "level_range": {"min": 50, "max": 56},
        "unlock_level": 50,
        "boss_count": 5,
        "file": "SunkenTemple.js",
        "type": "standard",
    },
    # 黑石塔 - 多翼副本
    "brs_lower": {
        "id": "brs_lower",
        "name": "黑石塔-下层",
        "level_range": {"min": 55, "max": 60},
        "unlock_level": 55,
        "boss_count": 6,
        "file": "BlackrockSpire_Lower.js",
        "type": "wing",
        "parent": "blackrock_spire",
    },
    "brs_upper": {
        "id": "brs_upper",
        "name": "黑石塔-上层",
        "level_range": {"min": 58, "max": 60},
        "unlock_level": 58,
        "boss_count": 5,
        "file": "BlackrockSpire_Upper.js",
        "type": "wing",
        "parent": "blackrock_spire",
    },
    "stratholme": {
        "id": "stratholme",
        "name": "斯坦索姆",
        "level_range": {"min": 58, "max": 60},
        "unlock_level": 58,
        "boss_count": 6,
        "file": "Stratholme.js",
        "type": "standard",
    },
    "scholomance": {
        "id": "scholomance",
        "name": "通灵学院",
        "level_range": {"min": 58, "max": 60},
        "unlock_level": 58,
        "boss_count": 6,
        "file": "Scholomance.js",
        "type": "standard",
    },
    "dire_maul": {
        "id": "dire_maul",
        "name": "厄运之槌",
        "level_range": {"min": 56, "max": 60},
        "unlock_level": 56,
        "boss_count": 5,
        "file": "DireMaul.js",
        "type": "standard",
    },
}

# 按难度分组的测试配置
DUNGEON_TEST_GROUPS = {
    "low_level": {
        "description": "低级副本 (13-32级)",
        "dungeons": ["ragefire_chasm", "deadmines", "wailing_caverns", "shadowfang_keep", "stormwind_stockade"],
        "test_level": 25,  # 测试角色等级
    },
    "mid_level": {
        "description": "中级副本 (29-55级)",
        "dungeons": ["gnomeregan", "razorfen_kraul", "sm_graveyard", "sm_library", "sm_armory", "sm_cathedral", "zulfarrak", "maraudon"],
        "test_level": 45,
    },
    "high_level": {
        "description": "高级副本 (50-60级)",
        "dungeons": ["sunken_temple", "brs_lower", "brs_upper", "stratholme", "scholomance", "dire_maul"],
        "test_level": 60,
    },
}

# 测试角色配置
TEST_CHARACTERS = {
    "warrior": {"name": "TestWarrior", "class": "warrior"},
    "mage": {"name": "TestMage", "class": "mage"},
    "priest": {"name": "TestPriest", "class": "priest"},
    "hunter": {"name": "TestHunter", "class": "hunter"},
    "rogue": {"name": "TestRogue", "class": "rogue"},
    "paladin": {"name": "TestPaladin", "class": "paladin"},
    "shaman": {"name": "TestShaman", "class": "shaman"},
    "warlock": {"name": "TestWarlock", "class": "warlock"},
    "druid": {"name": "TestDruid", "class": "druid"},
}

# Boss 机制测试配置
BOSS_MECHANICS_CHECKS = {
    "phases": {
        "description": "Boss阶段转换",
        "check": "验证Boss在不同血量阈值下切换阶段",
    },
    "summons": {
        "description": "召唤物机制",
        "check": "验证Boss召唤小怪/召唤物的能力",
    },
    "enrage": {
        "description": "狂暴机制",
        "check": "验证Boss在特定回合数后进入狂暴状态",
    },
    "telegraph": {
        "description": "蓄力技能",
        "check": "验证Boss蓄力技能的预警和释放",
    },
    "special_skills": {
        "description": "特殊技能",
        "check": "验证Boss独有技能的正确性",
    },
}
