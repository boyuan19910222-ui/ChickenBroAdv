#!/usr/bin/env python3
"""
多人联机副本战斗 E2E 测试 - 同步版（P0 场景）
- 单人：怒焰裂谷（Lv15）
- 双人：死亡矿井（Lv20）
"""

import sys
sys.path.insert(0, '/Users/boyuan/ChickenBro/tests')

from playwright.sync_api import sync_playwright
import random
import re
import json
import time
from datetime import datetime

# ==================== 配置 ====================
TEST_CASES = [
    {'id': 'ragefire_chasm', 'name': '怒焰裂谷', 'level': 15, 'players': 1},
    {'id': 'deadmines', 'name': '死亡矿井', 'level': 20, 'players': 2},
]

CLASSES = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']

# ==================== 工具函数 ====================

def create_player_session(browser, index):
    context = browser.new_context()
    page = context.new_page()
    return {
        'index': index,
        'context': context,
        'page': page,
        'username': None,
    }

def goto_game(session):
    page = session['page']
    page.goto('http://localhost:5173/#/game')
    page.wait_for_timeout(1200)

def register_player(session, index):
    page = session['page']
    suffix = random.randint(1000, 9999)
    username = f"test_p{index}_{suffix}"
    session['username'] = username

    page.goto('http://localhost:5173')
    page.wait_for_timeout(800)

    # 切换到注册
    register_tab = page.locator('.tab-btn:has-text("注册")')
    if register_tab.count() > 0:
        register_tab.click()
        page.wait_for_timeout(200)

    # 填写表单
    page.fill('input[data-testid="reg-username"]', username)
    page.fill('input[data-testid="reg-password"]', '123456')
    page.fill('input[data-testid="reg-nickname"]', f'测试{index}')
    page.click('button[data-testid="reg-submit"]')
    page.wait_for_timeout(1500)

    print(f"  [P{index}] 注册: {username}")
    return True


def create_character(session, class_index):
    page = session['page']

    create_card = page.locator('.create-card')
    if create_card.count() > 0:
        create_card.click()
        page.wait_for_timeout(600)

    name_input = page.locator('input[placeholder*="名称"], input[placeholder*="角色"]')
    if name_input.count() > 0:
        name_input.fill(f"角色{session['index']}")

    class_cards = page.locator('.class-card')
    if class_cards.count() > 0:
        class_cards.nth(class_index % class_cards.count()).click()
        page.wait_for_timeout(300)

    start_btn = page.locator('button:has-text("开始冒险")')
    for _ in range(10):
        if start_btn.is_enabled():
            break
        page.wait_for_timeout(200)
    if start_btn.is_enabled():
        start_btn.click()
        page.wait_for_timeout(2000)

    # 如果没进入，尝试点击“进入游戏”
    game_scene = page.locator('.game-scene')
    if game_scene.count() == 0:
        char_cards = page.locator('.character-card:not(.create-card)')
        if char_cards.count() > 0:
            char_cards.first.click()
            page.wait_for_timeout(400)
            enter_btn = page.locator('button:has-text("进入游戏")')
            if enter_btn.count() > 0:
                enter_btn.click()
                page.wait_for_timeout(1500)

    print(f"  [P{session['index']}] 创建角色完成")
    return True


def get_level(session):
    page = session['page']
    char_panel = page.locator('.character-panel, .stats-panel')
    if char_panel.count() > 0:
        text = char_panel.first.text_content()
        match = re.search(r'Lv\.?\s*(\d+)', text)
        if match:
            return int(match.group(1))
    return 1


def level_to(session, target):
    page = session['page']
    goto_game(session)
    current = get_level(session)
    attempts = 0
    while current < target and attempts < 180:
        debug_btn = page.locator('button.debug-btn:has-text("测试升级")')
        if debug_btn.count() == 0:
            page.wait_for_timeout(200)
            attempts += 1
            continue
        debug_btn.click()
        page.wait_for_timeout(120)
        new_level = get_level(session)
        if new_level == current:
            attempts += 1
            continue
        current = new_level
    print(f"  [P{session['index']}] 升级到 Lv.{current}")


def open_lobby(session):
    page = session['page']
    goto_game(session)
    lobby_btn = page.locator('button:has-text("集合石")')
    if lobby_btn.count() > 0:
        lobby_btn.click()
        page.wait_for_timeout(800)
        return True
    return False


def create_room(session, dungeon_id, dungeon_name):
    page = session['page']
    selects = page.locator('select')
    if selects.count() > 0:
        try:
            selects.first.select_option(dungeon_id)
            page.wait_for_timeout(300)
        except Exception:
            pass
    else:
        dungeon_option = page.locator(f'text={dungeon_name}')
        if dungeon_option.count() > 0:
            dungeon_option.first.click()
            page.wait_for_timeout(300)

    create_btn = page.locator('button.create-btn:has-text("创建")').first
    if create_btn.count() == 0:
        create_btn = page.locator('button:has-text("创建房间")').first
    if create_btn.count() > 0:
        create_btn.click()
        page.wait_for_timeout(1500)

    url = page.url
    match = re.search(r'/waiting/(\w+)', url)
    room_id = match.group(1) if match else None
    print(f"  [P{session['index']}] 房间ID: {room_id}")
    return room_id


def goto_waiting_with_room(session, room_id):
    page = session['page']
    page.goto(f'http://localhost:5173/#/waiting/{room_id}')
    page.wait_for_timeout(1500)


def start_battle(session):
    page = session['page']
    start_btn = page.locator('.start-btn:has-text("开始"), button:has-text("开始")')
    for _ in range(60):
        if start_btn.is_enabled():
            start_btn.click()
            page.wait_for_timeout(1200)
            print(f"  [P{session['index']}] 开始战斗")
            return True
        page.wait_for_timeout(200)
    print(f"  [P{session['index']}] 开始按钮未启用")
    return False


def wait_battle_end(session, timeout=240):
    page = session['page']
    start = time.time()
    in_battle = False

    while time.time() - start < timeout:
        url = page.url
        if '/battle/' in url:
            in_battle = True

        victory = page.locator('text=胜利, text=战斗胜利, text=通关成功')
        defeat = page.locator('text=失败, text=战斗失败')
        if victory.count() > 0:
            return True
        if defeat.count() > 0:
            return False

        # 如果已经在 battle 里且跳回 /game，认为战斗结束
        if in_battle and '/battle/' not in url and '/waiting/' not in url:
            return True

        page.wait_for_timeout(1500)
    return False


def check_loot(session):
    page = session['page']
    loot = page.locator('text=获得, text=掉落, text=拾取')
    return loot.count() > 0


def save_game(session):
    page = session['page']
    save_btn = page.locator('button:has-text("保存")')
    if save_btn.count() > 0:
        save_btn.click()
        page.wait_for_timeout(500)


def close_session(session):
    if session['context']:
        session['context'].close()

# ==================== 测试函数 ====================

def test_single_player(test_case):
    print(f"\n{'='*50}\n测试: {test_case['name']} (单人)\n{'='*50}")
    result = {'name': test_case['name'], 'players': 1, 'success': False}
    start_time = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        session = create_player_session(browser, 0)
        try:
            register_player(session, 0)
            create_character(session, 0)
            level_to(session, test_case['level'])

            open_lobby(session)
            room_id = create_room(session, test_case['id'], test_case['name'])

            started = start_battle(session)
            if not started:
                result['error'] = '开始按钮未启用'
            else:
                success = wait_battle_end(session)
                result['success'] = success
                result['loot'] = check_loot(session)
                print(f"  掉落: {'有' if result['loot'] else '无'}")
            save_game(session)
        except Exception as e:
            result['error'] = str(e)
            print(f"❌ 错误: {e}")
        finally:
            close_session(session)
            browser.close()

    result['duration'] = time.time() - start_time
    return result


def test_two_players(test_case):
    print(f"\n{'='*50}\n测试: {test_case['name']} (双人)\n{'='*50}")
    result = {'name': test_case['name'], 'players': 2, 'success': False}
    start_time = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        sessions = [create_player_session(browser, i) for i in range(2)]
        try:
            for i, s in enumerate(sessions):
                register_player(s, i)
                create_character(s, i)
                level_to(s, test_case['level'])
                s['page'].wait_for_timeout(400)

            open_lobby(sessions[0])
            room_id = create_room(sessions[0], test_case['id'], test_case['name'])

            goto_waiting_with_room(sessions[1], room_id)
            sessions[1]['page'].wait_for_timeout(1500)

            started = start_battle(sessions[0])
            if not started:
                result['error'] = '开始按钮未启用'
            else:
                res0 = wait_battle_end(sessions[0])
                res1 = wait_battle_end(sessions[1])
                result['success'] = res0 and res1
                result['loot_p0'] = check_loot(sessions[0])
                result['loot_p1'] = check_loot(sessions[1])
                print(f"  掉落 P0: {'有' if result['loot_p0'] else '无'} | P1: {'有' if result['loot_p1'] else '无'}")

            for s in sessions:
                save_game(s)
        except Exception as e:
            result['error'] = str(e)
            print(f"❌ 错误: {e}")
        finally:
            for s in sessions:
                close_session(s)
            browser.close()

    result['duration'] = time.time() - start_time
    return result


# ==================== 主程序 ====================

def main():
    print("=" * 50)
    print("多人联机副本战斗 E2E 测试 (P0)")
    print(f"时间: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 50)

    results = []
    results.append(test_single_player(TEST_CASES[0]))
    results.append(test_two_players(TEST_CASES[1]))

    print("\n" + "=" * 50)
    print("测试汇总")
    print("=" * 50)
    for r in results:
        status = "✅" if r.get('success') else "❌"
        print(f"{status} {r['name']} ({r['players']}人) - {r.get('duration',0):.1f}秒" + (f" - {r.get('error')}" if r.get('error') else ""))

    passed = sum(1 for r in results if r.get('success'))
    print(f"\n总计: {passed}/{len(results)} 通过")

    with open('/tmp/multiplayer_test_report.json', 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print("报告: /tmp/multiplayer_test_report.json")


if __name__ == '__main__':
    main()
