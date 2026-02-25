"""
Test runner script for ChickenBro game.
Provides convenient commands to run different test suites.
"""
#!/usr/bin/env python3

import subprocess
import sys
import os
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent.parent


def run_unit_tests():
    """Run unit tests only"""
    print("🧪 Running unit tests...")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/unit/", "-v", "-m", "unit"],
        cwd=PROJECT_ROOT,
        capture_output=False
    )
    return result.returncode


def run_e2e_tests():
    """Run end-to-end tests (requires running server)"""
    print("🎭 Running E2E tests...")
    print("⚠️  Make sure the dev server is running: npm run dev")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/e2e/", "-v", "-m", "e2e"],
        cwd=PROJECT_ROOT,
        capture_output=False
    )
    return result.returncode


def run_all_tests():
    """Run all tests"""
    print("🚀 Running all tests...")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/", "-v"],
        cwd=PROJECT_ROOT,
        capture_output=False
    )
    return result.returncode


def run_with_server():
    """Start dev server and run E2E tests"""
    print("🖥️  Starting dev server and running E2E tests...")
    
    # Use with_server.py helper if available
    helper_path = Path.home() / ".codebuddy" / "skills" / "webapp-testing" / "scripts" / "with_server.py"
    
    if helper_path.exists():
        result = subprocess.run(
            [
                sys.executable, str(helper_path),
                "--server", "npm run dev",
                "--port", "5173",
                "--",
                sys.executable, "-m", "pytest", "tests/e2e/", "-v"
            ],
            cwd=PROJECT_ROOT,
            capture_output=False
        )
        return result.returncode
    else:
        print("❌ with_server.py helper not found")
        print("   Please start server manually: npm run dev")
        print("   Then run: pytest tests/e2e/ -v")
        return 1


def run_dungeon_tests():
    """Run dungeon-specific tests"""
    print("🏰 Running dungeon tests...")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/e2e/test_dungeon_data.py", "tests/e2e/test_dungeon_boss.py", "-v"],
        cwd=PROJECT_ROOT,
        capture_output=False
    )
    return result.returncode


def run_dungeon_e2e_tests():
    """Run dungeon E2E tests (requires running server and long execution time)"""
    print("🎮 Running dungeon E2E tests...")
    print("⚠️  Make sure the dev server is running: npm run dev")
    print("⚠️  These tests may take several minutes to complete")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/e2e/test_dungeon_flow.py", "-v", "--tb=short"],
        cwd=PROJECT_ROOT,
        capture_output=False
    )
    return result.returncode


def run_quick_validation():
    """Quick validation of data integrity"""
    print("⚡ Running quick data validation...")
    
    import re
    
    # Read game data
    game_data_path = PROJECT_ROOT / "src" / "data" / "GameData.js"
    talent_data_path = PROJECT_ROOT / "src" / "data" / "TalentData.js"
    
    with open(game_data_path, 'r', encoding='utf-8') as f:
        game_content = f.read()
    
    with open(talent_data_path, 'r', encoding='utf-8') as f:
        talent_content = f.read()
    
    print("\n📊 Testing skill data integrity...")
    
    # Test all class skills have definitions
    classes = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
    all_passed = True
    
    for class_id in classes:
        pattern = rf"{class_id}:\s*\{{.*?skills:\s*\[(.*?)\]"
        match = re.search(pattern, game_content, re.DOTALL)
        if match:
            skills_str = match.group(1)
            skill_ids = re.findall(r"'([^']+)'", skills_str)
            
            for skill_id in skill_ids:
                definition_pattern = rf"{skill_id}:\s*\{{\s*id:\s*['\"]" + skill_id + r"['\"]"
                if not re.search(definition_pattern, game_content):
                    print(f"  ❌ Skill '{skill_id}' in class '{class_id}' has no definition")
                    all_passed = False
    
    if all_passed:
        print("  ✅ All class skills have definitions")
    
    print("\n📊 Testing talent tree structure...")
    all_talents_passed = True
    
    for class_id in classes:
        pattern = rf"{class_id}:\s*\{{"
        if not re.search(pattern, talent_content):
            print(f"  ❌ Class '{class_id}' not found in talent data")
            all_talents_passed = False
    
    if all_talents_passed:
        print("  ✅ All classes have talent trees")
    
    print("\n📊 Testing dungeon files exist...")
    dungeons_path = PROJECT_ROOT / "src" / "data" / "dungeons"
    dungeon_files = list(dungeons_path.glob("*.js"))
    if len(dungeon_files) >= 19:  # Registry + 18 dungeons
        print(f"  ✅ Found {len(dungeon_files)} dungeon files")
    else:
        print(f"  ⚠️  Only {len(dungeon_files)} dungeon files found")

    print("\n✨ Quick validation complete!")
    return 0


def print_usage():
    """Print usage information"""
    print("""
ChickenBro Test Runner
======================

Usage: python tests/run_tests.py [command]

Commands:
  unit       Run unit tests only (data validation)
  e2e        Run E2E tests (requires running server)
  all        Run all tests
  server     Start dev server and run E2E tests
  dungeon    Run dungeon data tests (no server needed)
  dungeone2e Run dungeon E2E tests (requires server, long running)
  quick      Quick data validation
  help       Show this help message

Examples:
  python tests/run_tests.py unit
  python tests/run_tests.py quick
  python tests/run_tests.py dungeon
  python tests/run_tests.py server
""")


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print_usage()
        return 0
    
    command = sys.argv[1].lower()
    
    if command == "unit":
        return run_unit_tests()
    elif command == "e2e":
        return run_e2e_tests()
    elif command == "all":
        return run_all_tests()
    elif command == "server":
        return run_with_server()
    elif command == "dungeon":
        return run_dungeon_tests()
    elif command == "dungeone2e":
        return run_dungeon_e2e_tests()
    elif command == "quick":
        return run_quick_validation()
    elif command in ["help", "-h", "--help"]:
        print_usage()
        return 0
    else:
        print(f"Unknown command: {command}")
        print_usage()
        return 1


if __name__ == "__main__":
    sys.exit(main())
