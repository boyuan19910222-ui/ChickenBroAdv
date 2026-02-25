"""
多人联机战斗功能测试
测试流程：
1. 创建两个玩家账号并登录
2. 创建角色并设置等级（达到可进入副本的等级）
3. 玩家1创建房间
4. 玩家2加入房间
5. 开始战斗
6. 验证战斗结果
"""
from playwright.sync_api import sync_playwright
import time
import re
import urllib.request
import urllib.error
import json

API_BASE = 'http://127.0.0.1:3001'

def api_request(method, path, token=None, data=None):
    """发送API请求"""
    url = f'{API_BASE}{path}'
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    body = json.dumps(data).encode('utf-8') if data else None
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8'))

def get_token_from_page(page):
    """从页面获取认证token"""
    token = page.evaluate('() => localStorage.getItem("mp_token")')
    return token

def get_character_id(page):
    """从页面获取当前角色ID（从Pinia store）"""
    char_id = page.evaluate('''() => {
        const app = document.querySelector('#app').__vueParentComponent;
        if (app && app.ctx && app.ctx.$pinia) {
            const stores = app.ctx.$pinia._s;
            const gameStore = stores.get('game');
            if (gameStore) {
                return gameStore.currentCharacterId;
            }
        }
        return null;
    }''')
    return char_id

def get_character_list(token):
    """获取用户的角色列表"""
    result = api_request('GET', '/api/characters', token)
    return result.get('characters', [])

def upgrade_character_level(token, char_id, level=15):
    """通过API升级角色等级"""
    # 首先获取当前角色数据
    result = api_request('GET', f'/api/characters/{char_id}', token)
    if 'error' in result:
        print(f"   获取角色失败: {result}")
        return False
    
    char_data = result['character']
    game_state = char_data['game_state']
    
    # 更新等级
    game_state['player']['level'] = level
    game_state['player']['experience'] = level * 1000  # 设置经验
    
    # 计算新的HP（根据等级增长）
    base_health = game_state['player']['maxHp']
    new_health = base_health + (level - 1) * 20
    game_state['player']['maxHp'] = new_health
    game_state['player']['currentHp'] = new_health
    
    # 更新角色
    result = api_request('PUT', f'/api/characters/{char_id}', token, {
        'game_state': game_state,
        'level': level
    })
    
    return result.get('success', False)

def test_multiplayer_battle():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        
        # 创建两个独立的浏览器上下文（模拟两个玩家）
        context1 = browser.new_context()
        context2 = browser.new_context()
        
        page1 = context1.new_page()
        page2 = context2.new_page()
        
        # 跟踪控制台消息
        console1, console2 = [], []
        page1.on("console", lambda msg: console1.append(f"[{msg.type}] {msg.text}"))
        page2.on("console", lambda msg: console2.append(f"[{msg.type}] {msg.text}"))
        
        timestamp = int(time.time())
        
        print("=" * 70)
        print("多人联机战斗功能测试")
        print("=" * 70)
        
        # ═══════════════════════════════════════════════════════════════
        # 第一部分：两个玩家注册并创建角色
        # ═══════════════════════════════════════════════════════════════
        
        print("\n【第一部分：玩家注册与角色创建】")
        
        # 玩家1注册
        print("\n1. 玩家1注册...")
        user1 = f"player1_{timestamp}"
        page1.goto('http://localhost:5173/')
        page1.wait_for_load_state('networkidle')
        page1.locator('button:has-text("注册")').first.click()
        page1.wait_for_timeout(300)
        page1.locator('input[placeholder="3-20位字母、数字或下划线"]').fill(user1)
        page1.locator('input[placeholder="6-32位密码"]').fill("password123")
        page1.locator('input[placeholder="2-12个字符"]').fill("战士玩家")
        page1.locator('[data-testid="reg-submit"]').click()
        
        try:
            page1.wait_for_url('**/characters*', timeout=10000)
            print(f"   ✅ 玩家1 ({user1}) 注册成功")
        except:
            print(f"   ❌ 玩家1注册失败，URL: {page1.url}")
            return
        
        # 玩家1创建角色（战士）
        page1.wait_for_selector('.create-card', timeout=5000)
        page1.locator('.create-card').first.click()
        page1.wait_for_url('**/create*', timeout=5000)
        page1.wait_for_selector('.create-container', timeout=5000)
        
        page1.locator('input[placeholder="输入角色名..."]').fill("战神阿瑞斯")
        page1.locator('.class-card').first.click()  # 选择战士
        page1.wait_for_timeout(300)
        page1.locator('button:has-text("开始冒险")').click()
        
        try:
            page1.wait_for_url('**/game*', timeout=10000)
            print("   ✅ 玩家1创建角色成功（战士）")
        except:
            print(f"   ❌ 玩家1创建角色失败，URL: {page1.url}")
            return
        
        # 获取玩家1的token和角色ID
        token1 = get_token_from_page(page1)
        chars1 = get_character_list(token1)
        char1_id = chars1[0]['id'] if chars1 else None
        print(f"   角色ID: {char1_id}")
        
        # 玩家2注册
        print("\n2. 玩家2注册...")
        user2 = f"player2_{timestamp}"
        page2.goto('http://localhost:5173/')
        page2.wait_for_load_state('networkidle')
        page2.locator('button:has-text("注册")').first.click()
        page2.wait_for_timeout(300)
        page2.locator('input[placeholder="3-20位字母、数字或下划线"]').fill(user2)
        page2.locator('input[placeholder="6-32位密码"]').fill("password123")
        page2.locator('input[placeholder="2-12个字符"]').fill("法师玩家")
        page2.locator('[data-testid="reg-submit"]').click()
        
        try:
            page2.wait_for_url('**/characters*', timeout=10000)
            print(f"   ✅ 玩家2 ({user2}) 注册成功")
        except:
            print(f"   ❌ 玩家2注册失败，URL: {page2.url}")
            return
        
        # 玩家2创建角色（法师）
        page2.wait_for_selector('.create-card', timeout=5000)
        page2.locator('.create-card').first.click()
        page2.wait_for_url('**/create*', timeout=5000)
        page2.wait_for_selector('.create-container', timeout=5000)
        
        page2.locator('input[placeholder="输入角色名..."]').fill("魔法师梅林")
        # 选择法师（第7个职业卡片，索引6）
        class_cards = page2.locator('.class-card')
        if class_cards.count() >= 7:
            class_cards.nth(6).click()  # 法师
        else:
            class_cards.nth(1).click()  # 备用
        page2.wait_for_timeout(300)
        page2.locator('button:has-text("开始冒险")').click()
        
        try:
            page2.wait_for_url('**/game*', timeout=10000)
            print("   ✅ 玩家2创建角色成功（法师）")
        except:
            print(f"   ❌ 玩家2创建角色失败，URL: {page2.url}")
            return
        
        # 获取玩家2的token和角色ID
        token2 = get_token_from_page(page2)
        chars2 = get_character_list(token2)
        char2_id = chars2[0]['id'] if chars2 else None
        print(f"   角色ID: {char2_id}")
        
        # ═══════════════════════════════════════════════════════════════
        # 第二部分：升级角色等级
        # ═══════════════════════════════════════════════════════════════
        
        print("\n【第二部分：升级角色等级】")
        print("\n3. 将角色升级到15级以进入副本...")
        
        # 升级玩家1角色
        if upgrade_character_level(token1, char1_id, 15):
            print("   ✅ 玩家1角色已升级到15级")
        else:
            print("   ❌ 玩家1角色升级失败")
            return
        
        # 升级玩家2角色
        if upgrade_character_level(token2, char2_id, 15):
            print("   ✅ 玩家2角色已升级到15级")
        else:
            print("   ❌ 玩家2角色升级失败")
            return
        
        # 刷新页面以加载新等级 - 从角色选择页面重新选择角色
        print("\n4. 刷新页面加载新等级...")
        
        # 玩家1: 返回角色选择，重新选择角色
        page1.goto('http://localhost:5173/#/characters')
        page1.wait_for_load_state('networkidle')
        page1.wait_for_timeout(500)
        
        # 点击第一个角色卡片（不是创建卡片）
        char_cards1 = page1.locator('.character-card:not(.create-card)')
        if char_cards1.count() > 0:
            # 先检查角色列表显示的等级
            char_text1 = char_cards1.first.locator('.char-class').text_content()
            print(f"   玩家1角色列表显示: {char_text1}")
            char_cards1.first.click()
            page1.wait_for_url('**/game*', timeout=10000)
            print("   玩家1已重新加载角色")
        page1.wait_for_timeout(1000)
        
        # 玩家2: 返回角色选择，重新选择角色
        page2.goto('http://localhost:5173/#/characters')
        page2.wait_for_load_state('networkidle')
        page2.wait_for_timeout(500)
        
        # 点击第一个角色卡片（不是创建卡片）
        char_cards2 = page2.locator('.character-card:not(.create-card)')
        if char_cards2.count() > 0:
            # 先检查角色列表显示的等级
            char_text2 = char_cards2.first.locator('.char-class').text_content()
            print(f"   玩家2角色列表显示: {char_text2}")
            char_cards2.first.click()
            page2.wait_for_url('**/game*', timeout=10000)
            print("   玩家2已重新加载角色")
        page2.wait_for_timeout(1000)
        
        # 额外等待确保数据加载完成
        page1.wait_for_timeout(2000)
        page2.wait_for_timeout(2000)
        
        # 验证等级（使用正确的选择器 - CharacterPanel中的char-class）
        print("\n   验证角色等级...")
        level_display1 = page1.locator('.character-panel .char-class')
        if level_display1.count() > 0:
            print(f"   玩家1: {level_display1.first.text_content()}")
        else:
            # 备用选择器
            level_display1 = page1.locator('.char-class')
            if level_display1.count() > 0:
                print(f"   玩家1: {level_display1.first.text_content()}")
        
        level_display2 = page2.locator('.character-panel .char-class')
        if level_display2.count() > 0:
            print(f"   玩家2: {level_display2.first.text_content()}")
        else:
            level_display2 = page2.locator('.char-class')
            if level_display2.count() > 0:
                print(f"   玩家2: {level_display2.first.text_content()}")
        
        # ═══════════════════════════════════════════════════════════════
        # 第三部分：房间创建与加入
        # ═══════════════════════════════════════════════════════════════
        
        print("\n【第三部分：房间创建与加入】")
        
        # 玩家1打开集合石，创建房间
        print("\n5. 玩家1打开集合石...")
        page1.wait_for_selector('button:has-text("集合石")', timeout=10000)
        page1.wait_for_timeout(500)  # 等待页面稳定
        page1.locator('button:has-text("集合石")').click()
        page1.wait_for_timeout(1000)  # 增加等待时间让模态框显示
        
        # 检查集合石模态框
        lobby_modal1 = page1.locator('.lobby-modal, .lobby-overlay')
        if lobby_modal1.count() == 0:
            print("   ❌ 玩家1集合石模态框未显示")
            page1.screenshot(path='/tmp/test_multi_p1_lobby.png')
            return
        print("   ✅ 集合石模态框已打开")
        
        # 选择副本并创建房间
        print("\n6. 玩家1创建副本房间...")
        
        # 检查副本下拉框
        dungeon_dropdown = page1.locator('.dungeon-dropdown, select')
        if dungeon_dropdown.count() == 0:
            print("   ❌ 未找到副本下拉框")
            page1.screenshot(path='/tmp/test_multi_p1_dropdown.png')
            return
        
        # 获取下拉框选项数量
        options = dungeon_dropdown.first.locator('option')
        opt_count = options.count()
        print(f"   可用副本数量: {opt_count}")
        
        if opt_count < 2:  # 第一个是"选择副本..."
            print("   ❌ 没有可用副本（等级可能不够）")
            page1.screenshot(path='/tmp/test_multi_no_dungeon.png')
            return
        
        # 选择第一个可用副本（跳过"选择副本..."）
        dungeon_dropdown.first.select_option(index=1)
        page1.wait_for_timeout(500)
        
        # 点击创建房间按钮
        create_btn = page1.locator('button.create-btn, button:has-text("创建房间")')
        if create_btn.count() == 0:
            print("   ❌ 未找到创建房间按钮")
            return
        
        # 检查按钮是否可用
        is_disabled = create_btn.first.is_disabled()
        if is_disabled:
            print("   ❌ 创建房间按钮被禁用")
            page1.screenshot(path='/tmp/test_multi_btn_disabled.png')
            return
        
        create_btn.first.click()
        print("   已点击创建房间按钮")
        
        # 等待房间创建响应
        page1.wait_for_timeout(2000)
        
        # 检查控制台错误
        console_errors = [msg for msg in console1 if 'error' in msg.lower()]
        if console_errors:
            print(f"   控制台错误: {console_errors[-3:]}")
        
        # 检查当前URL和页面状态
        print(f"   当前URL: {page1.url}")
        
        # 检查是否有错误提示
        error_msg = page1.locator('.error-msg, .error-message')
        if error_msg.count() > 0:
            print(f"   错误提示: {error_msg.first.text_content()}")
        
        # 检查是否关闭了模态框
        lobby_closed = page1.locator('.lobby-modal, .lobby-overlay').count() == 0
        print(f"   集合石模态框已关闭: {lobby_closed}")
        
        # 检查 mpStore 状态
        mp_state = page1.evaluate('''() => {
            const app = document.querySelector('#app').__vueParentComponent;
            if (app && app.ctx && app.ctx.$pinia) {
                const stores = app.ctx.$pinia._s;
                const mpStore = stores.get('multiplayer');
                if (mpStore) {
                    return {
                        connected: mpStore.connected,
                        currentRoom: mpStore.currentRoom ? mpStore.currentRoom.id : null,
                        error: mpStore.error
                    };
                }
            }
            return null;
        }''')
        print(f"   mpStore状态: {mp_state}")
        
        # 检查是否进入等待房间
        try:
            page1.wait_for_url('**/waiting*', timeout=5000)
            print(f"   ✅ 玩家1进入等待房间: {page1.url}")
            
            # 提取房间ID
            url_match = re.search(r'/waiting/([^/?]+)', page1.url)
            if url_match:
                room_id = url_match.group(1)
                print(f"   房间ID: {room_id}")
        except:
            # 可能在游戏界面内显示等待状态
            waiting_indicator = page1.locator('.waiting-room, .room-info, .player-list')
            if waiting_indicator.count() > 0:
                print("   ✅ 玩家1在当前页面显示等待房间状态")
            else:
                print(f"   ⚠️ 未能确认等待房间状态，URL: {page1.url}")
                page1.screenshot(path='/tmp/test_multi_p1_waiting.png')
        
        # 玩家2打开集合石，加入房间
        print("\n7. 玩家2加入房间...")
        page2.wait_for_selector('button:has-text("集合石")', timeout=5000)
        page2.locator('button:has-text("集合石")').click()
        page2.wait_for_timeout(1000)
        
        # 检查房间列表
        room_list = page2.locator('.room-item')
        room_count = room_list.count()
        print(f"   可用房间数量: {room_count}")
        
        if room_count == 0:
            # 尝试刷新
            refresh_btn = page2.locator('button:has-text("刷新"), .refresh-btn')
            if refresh_btn.count() > 0:
                refresh_btn.first.click()
                page2.wait_for_timeout(1000)
                room_count = room_list.count()
                print(f"   刷新后房间数量: {room_count}")
        
        if room_count > 0:
            # 检查房间状态
            room_status = page2.locator('.room-status').first
            if room_status.count() > 0:
                status_text = room_status.text_content()
                print(f"   房间状态: {status_text}")
            
            # 检查玩家数量
            room_players = page2.locator('.room-players').first
            if room_players.count() > 0:
                players_text = room_players.text_content()
                print(f"   房间玩家: {players_text}")
            
            # 尝试找到可用的加入按钮
            join_btns = page2.locator('.room-item .join-btn:not([disabled]), button.join-btn:not([disabled])')
            if join_btns.count() > 0:
                join_btns.first.click()
                page2.wait_for_timeout(1000)
            else:
                # 所有按钮都被禁用，检查原因
                all_join_btns = page2.locator('.room-item .join-btn')
                for i in range(all_join_btns.count()):
                    btn = all_join_btns.nth(i)
                    is_disabled = btn.is_disabled()
                    print(f"   加入按钮 {i}: disabled={is_disabled}")
                
                print("   ❌ 所有房间的加入按钮都被禁用")
                page2.screenshot(path='/tmp/test_multi_all_disabled.png')
                return
        
        # 检查玩家2是否加入成功
        try:
            page2.wait_for_url('**/waiting*', timeout=5000)
            print(f"   ✅ 玩家2加入等待房间: {page2.url}")
        except:
            waiting_indicator = page2.locator('.waiting-container, .waiting-scene')
            if waiting_indicator.count() > 0:
                print("   ✅ 玩家2已加入等待房间")
            else:
                print(f"   ⚠️ 玩家2加入状态未知，URL: {page2.url}")
                page2.screenshot(path='/tmp/test_multi_p2_join.png')
        
        # 等待两个玩家都稳定在等待房间
        page1.wait_for_timeout(2000)
        page2.wait_for_timeout(2000)
        
        # ═══════════════════════════════════════════════════════════════
        # 第四部分：开始战斗
        # ═══════════════════════════════════════════════════════════════
        
        print("\n【第四部分：战斗测试】")
        
        # 检查等待房间状态
        print("\n8. 检查等待房间状态...")
        
        # 检查成员列表
        member_cards1 = page1.locator('.member-card')
        member_cards2 = page2.locator('.member-card')
        print(f"   玩家1看到 {member_cards1.count()} 个成员")
        print(f"   玩家2看到 {member_cards2.count()} 个成员")
        
        # 玩家1点击开始战斗
        print("\n9. 玩家1开始战斗...")
        start_btn = page1.locator('button:has-text("开始战斗")')
        if start_btn.count() > 0:
            start_btn.first.click()
            print("   已点击开始战斗按钮")
            page1.wait_for_timeout(2000)
        else:
            print("   ⚠️ 未找到开始战斗按钮")
            # 检查是否有开始按钮（可能只是叫"开始"）
            start_btn = page1.locator('button.start-btn, button:has-text("开始")')
            if start_btn.count() > 0:
                start_btn.first.click()
                print("   已点击开始按钮")
                page1.wait_for_timeout(2000)
            else:
                page1.screenshot(path='/tmp/test_multi_no_start_btn.png')
        
        # 等待战斗开始
        print("\n10. 等待战斗开始...")
        battle_started = False
        
        for i in range(30):  # 最多等待30秒
            page1.wait_for_timeout(1000)
            
            # 检查玩家1
            url1 = page1.url
            in_battle1 = '/battle' in url1 or page1.locator('.battle-arena, .battle-view, .combat-area').count() > 0
            
            # 检查玩家2
            url2 = page2.url
            in_battle2 = '/battle' in url2 or page2.locator('.battle-arena, .battle-view, .combat-area').count() > 0
            
            if in_battle1 and in_battle2:
                battle_started = True
                print(f"   ✅ 两个玩家都进入战斗！")
                print(f"      玩家1: {url1}")
                print(f"      玩家2: {url2}")
                break
            elif in_battle1 or in_battle2:
                print(f"   部分玩家进入战斗，继续等待... ({i+1}/30)")
            else:
                # 检查是否有等待倒计时
                countdown = page1.locator(':text("秒"), :text("倒计时"), .countdown')
                if countdown.count() > 0:
                    print(f"   等待倒计时中... ({i+1}/30)")
                else:
                    print(f"   等待战斗开始... ({i+1}/30)")
        
        if not battle_started:
            print("   ❌ 战斗未能开始")
            page1.screenshot(path='/tmp/test_multi_battle_fail_p1.png')
            page2.screenshot(path='/tmp/test_multi_battle_fail_p2.png')
        
        # ═══════════════════════════════════════════════════════════════
        # 第五部分：战斗进行与结果
        # ═══════════════════════════════════════════════════════════════
        
        if battle_started:
            print("\n【第五部分：战斗进行中】")
            
            # 等待战斗完成
            print("\n11. 等待战斗完成...")
            battle_finished = False
            
            for i in range(120):  # 战斗最多2分钟
                page1.wait_for_timeout(1000)
                
                # 检查战斗结果
                result1 = page1.locator('.victory-modal, .defeat-modal, .battle-result, .result-modal, :text("胜利"), :text("失败")')
                result2 = page2.locator('.victory-modal, .defeat-modal, .battle-result, .result-modal, :text("胜利"), :text("失败")')
                
                if result1.count() > 0 or result2.count() > 0:
                    battle_finished = True
                    
                    # 判断胜负
                    victory1 = page1.locator(':text("胜利"), :text("Victory")')
                    defeat1 = page1.locator(':text("失败"), :text("Defeat")')
                    
                    if victory1.count() > 0:
                        print(f"   ✅ 战斗胜利！用时约 {i+1} 秒")
                    elif defeat1.count() > 0:
                        print(f"   ❌ 战斗失败！用时约 {i+1} 秒")
                    else:
                        print(f"   战斗结束！用时约 {i+1} 秒")
                    
                    # 检查战利品
                    loot1 = page1.locator('.loot-item, .loot-list, .loot-result')
                    loot2 = page2.locator('.loot-item, .loot-list, .loot-result')
                    print(f"   玩家1战利品显示: {'✅' if loot1.count() > 0 else '❌'}")
                    print(f"   玩家2战利品显示: {'✅' if loot2.count() > 0 else '❌'}")
                    
                    break
                
                if i % 10 == 9:
                    print(f"   战斗进行中... ({i+1}/120秒)")
            
            if not battle_finished:
                print("   ⚠️ 战斗超时，可能仍在进行中")
            
            # 截图
            page1.screenshot(path='/tmp/test_multi_battle_p1.png')
            page2.screenshot(path='/tmp/test_multi_battle_p2.png')
            print("\n   截图已保存: /tmp/test_multi_battle_p1.png, /tmp/test_multi_battle_p2.png")
        
        # ═══════════════════════════════════════════════════════════════
        # 错误日志
        # ═══════════════════════════════════════════════════════════════
        
        errors1 = [msg for msg in console1 if 'error' in msg.lower()]
        errors2 = [msg for msg in console2 if 'error' in msg.lower()]
        
        if errors1 or errors2:
            print("\n【错误日志】")
            if errors1:
                print("玩家1错误:")
                for err in errors1[-5:]:
                    print(f"   {err}")
            if errors2:
                print("玩家2错误:")
                for err in errors2[-5:]:
                    print(f"   {err}")
        
        print("\n" + "=" * 70)
        print("多人联机战斗测试完成！")
        print("=" * 70)
        
        browser.close()

if __name__ == "__main__":
    test_multiplayer_battle()
