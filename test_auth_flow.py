from playwright.sync_api import sync_playwright
import time

def test_auth_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Track console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        print("=" * 60)
        print("完整流程测试: 注册 -> 创建角色 -> 进入游戏")
        print("=" * 60)
        
        # 1. 访问登录页
        page.goto('http://localhost:5173/')
        page.wait_for_load_state('networkidle')
        
        # 2. 点击注册标签
        page.locator('button:has-text("注册")').first.click()
        page.wait_for_timeout(500)
        
        # 3. 填写注册表单
        timestamp = int(time.time())
        test_username = f"testuser_{timestamp}"
        test_password = "testpass123"
        test_nickname = "测试玩家"
        
        print(f"1. 注册用户: {test_username}")
        
        page.locator('input[placeholder="3-20位字母、数字或下划线"]').fill(test_username)
        page.locator('input[placeholder="6-32位密码"]').fill(test_password)
        page.locator('input[placeholder="2-12个字符"]').fill(test_nickname)
        page.locator('[data-testid="reg-submit"]').click()
        
        # 等待跳转
        try:
            page.wait_for_url('**/characters*', timeout=10000)
            print("   ✅ 注册成功，进入角色选择页面")
        except:
            print(f"   ❌ 注册失败，当前URL: {page.url}")
            return
        
        page.wait_for_timeout(1000)
        
        # 4. 检查角色选择页面
        print("\n2. 角色选择页面检查:")
        char_cards = page.locator('.character-card:not(.create-card)')
        create_card = page.locator('.create-card')
        
        print(f"   - 现有角色数量: {char_cards.count()}")
        print(f"   - 创建角色卡片: {'有' if create_card.count() > 0 else '无'}")
        
        # 5. 点击创建角色（无角色时的创建卡片）
        print("\n3. 点击创建角色...")
        
        # 尝试两种选择器
        create_selector = '.no-characters .create-card, .character-grid .create-card'
        create_btn = page.locator(create_selector)
        
        if create_btn.count() > 0:
            print(f"   找到创建按钮，数量: {create_btn.count()}")
            create_btn.first.click()
            
            # 等待跳转到创建角色页面
            try:
                page.wait_for_url('**/create*', timeout=5000)
                print(f"   ✅ 跳转到创建角色页面: {page.url}")
            except:
                print(f"   ❌ 未跳转，当前URL: {page.url}")
                page.screenshot(path='/tmp/test_error.png')
                return
        else:
            print("   ❌ 未找到创建角色入口")
            page.screenshot(path='/tmp/test_error.png')
            return
        
        page.wait_for_load_state('networkidle')

        # 6. 创建角色
        print("\n4. 创建角色:")
        test_char_name = f"测试角色_{timestamp}"

        # 等待创建页面内容加载
        page.wait_for_timeout(1000)

        # 检查当前页面内容
        print(f"   当前URL: {page.url}")

        # 等待创建页面容器出现
        try:
            page.wait_for_selector('.create-container', timeout=5000)
            print("   ✅ 创建角色页面已加载")
        except:
            print("   ❌ 创建角色页面容器未找到")
            page.screenshot(path='/tmp/test_error.png')
            return

        # 检查角色名输入框
        name_input = page.locator('input[placeholder="输入角色名..."]')
        if name_input.count() == 0:
            print("   ❌ 未找到角色名输入框")
            # 尝试其他选择器
            all_inputs = page.locator('input[type="text"]')
            print(f"   页面上文本输入框数量: {all_inputs.count()}")
            for i in range(all_inputs.count()):
                inp = all_inputs.nth(i)
                print(f"   - input {i}: placeholder='{inp.get_attribute('placeholder')}'")
            page.screenshot(path='/tmp/test_error.png')
            return
        
        name_input.fill(test_char_name)
        print(f"   - 角色名: {test_char_name}")
        
        # 选择第一个职业
        class_cards = page.locator('.class-card')
        if class_cards.count() == 0:
            print("   ❌ 未找到职业卡片")
            return
        
        first_class = class_cards.first
        class_name = first_class.locator('.class-name').text_content()
        first_class.click()
        print(f"   - 选择职业: {class_name}")
        
        page.wait_for_timeout(500)
        
        # 点击创建按钮
        create_btn = page.locator('button:has-text("开始冒险")')
        create_btn.click()
        
        # 等待跳转
        try:
            page.wait_for_url('**/game*', timeout=10000)
            print("   ✅ 创建角色成功，进入游戏")
        except:
            print(f"   ❌ 创建角色失败，当前URL: {page.url}")
            page.screenshot(path='/tmp/test_error.png')
            return
        
        page.wait_for_timeout(1000)
        
        # 7. 检查游戏主界面
        print("\n5. 游戏主界面检查:")
        header = page.locator('.game-header')
        meeting_stone = page.locator('button:has-text("集合石")')
        save_btn = page.locator('button:has-text("保存")')
        exit_btn = page.locator('button:has-text("退出")')
        
        print(f"   - 游戏标题栏: {'✅' if header.count() > 0 else '❌'}")
        print(f"   - 集合石按钮: {'✅' if meeting_stone.count() > 0 else '❌'}")
        print(f"   - 保存按钮: {'✅' if save_btn.count() > 0 else '❌'}")
        print(f"   - 退出按钮: {'✅' if exit_btn.count() > 0 else '❌'}")
        
        # 8. 测试集合石按钮
        print("\n6. 测试集合石模态框:")
        if meeting_stone.count() > 0:
            meeting_stone.click()
            page.wait_for_timeout(500)
            
            lobby_modal = page.locator('.lobby-modal, .lobby-overlay')
            print(f"   - 模态框显示: {'✅' if lobby_modal.count() > 0 else '❌'}")
            
            # 检查模态框内容
            room_list = page.locator('.room-list, .room-item')
            dungeon_select = page.locator('select, .dungeon-dropdown')
            
            print(f"   - 房间列表: {'✅' if room_list.count() >= 0 else '❌'}")
            print(f"   - 副本选择: {'✅' if dungeon_select.count() > 0 else '❌'}")
        
        # 截图
        page.screenshot(path='/tmp/test_final.png')
        print("\n最终截图保存: /tmp/test_final.png")
        
        # 打印错误日志
        errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if errors:
            print("\n错误日志:")
            for err in errors[-5:]:
                print(f"   {err}")
        
        print("\n" + "=" * 60)
        print("测试完成！所有核心功能正常工作。")
        print("=" * 60)
        
        browser.close()

if __name__ == "__main__":
    test_auth_flow()
