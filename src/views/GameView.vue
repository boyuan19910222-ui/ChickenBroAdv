<template>
  <div class="game-scene">
    <!-- 游戏标题栏 -->
    <GameHeader
      @open-areas="showAreaSelection = true"
      @open-dungeon="enterDungeon"
      @open-talents="showTalents = true"
      @open-lobby="showLobbyModal = true"
      @save-game="saveGame"
      @exit-game="exitGame"
      @debug-levelup="debugLevelUp"
    />

    <!-- 主游戏区域 -->
    <div class="game-container">
      <!-- 左侧 - 角色信息面板 -->
      <CharacterPanel />

      <!-- 中间 - 主区域 -->
      <div class="main-area">
        <ExplorationView v-if="gameStore.currentScene === 'exploration'" />
        <CombatView v-else-if="gameStore.currentScene === 'combat'" />
        <DungeonCombatView v-else-if="gameStore.currentScene === 'dungeon'" />
      </div>

      <!-- 右侧 - 系统面板 -->
      <SystemPanel />
    </div>

    <!-- 底部 - 日志 -->
    <MessageLog />

    <!-- 浮层 -->
    <AreaSelectionModal v-if="showAreaSelection" @close="showAreaSelection = false" />
    <TalentModal v-if="showTalents" @close="showTalents = false" />
    <DungeonSelectDialog
      v-if="showDungeonSelect"
      @close="showDungeonSelect = false"
      @enter-dungeon="onEnterDungeon"
    />

    <!-- 集合石模态框 -->
    <LobbyModal
      v-if="showLobbyModal"
      @close="showLobbyModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts.js'

import GameHeader from '@/components/layout/GameHeader.vue'
import CharacterPanel from '@/components/character/CharacterPanel.vue'
import SystemPanel from '@/components/layout/SystemPanel.vue'
import MessageLog from '@/components/common/MessageLog.vue'
import ExplorationView from '@/components/exploration/ExplorationView.vue'
import CombatView from '@/components/combat/CombatView.vue'
import DungeonCombatView from '@/components/dungeon/DungeonCombatView.vue'
import AreaSelectionModal from '@/components/modals/AreaSelectionModal.vue'
import TalentModal from '@/components/modals/TalentModal.vue'
import DungeonSelectDialog from '@/components/modals/DungeonSelectDialog.vue'
import LobbyModal from '@/components/modals/LobbyModal.vue'

const router = useRouter()
const gameStore = useGameStore()

const showAreaSelection = ref(false)
const showTalents = ref(false)
const showDungeonSelect = ref(false)
const showLobbyModal = ref(false)

// 注册键盘快捷键
useKeyboardShortcuts({
  showAreaSelection,
  showTalents,
  saveGame,
  enterDungeon,
  exitGame,
})

onMounted(() => {
  if (!gameStore.engine) {
    gameStore.initEngine()
  }
  if (!gameStore.player) {
    router.push('/')
    return
  }
})

function enterDungeon() {
  showDungeonSelect.value = true
}

function onEnterDungeon(dungeonId) {
  gameStore.changeScene('dungeon')
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (dungeonSystem) {
    gameStore.addLog('🏰 进入副本...', 'system')
    // 存储选择的副本ID供 DungeonCombatView 使用
    gameStore.selectedDungeonId = dungeonId
  }
}

function saveGame() {
  gameStore.saveGame()
}

function exitGame() {
  if (confirm('确定要退出游戏吗？未保存的进度将丢失！')) {
    gameStore.saveGame()
    gameStore.exitToMenu()
    router.push('/')
  }
}

function debugLevelUp() {
  const player = gameStore.player
  if (!player) return
  if (player.level >= 60) {
    gameStore.addLog('⚠️ 已满级，无法继续升级', 'system')
    return
  }
  const charSystem = gameStore.characterSystem
  if (charSystem) {
    const needed = player.experienceToNext - player.experience
    charSystem.addExperience(needed)
    gameStore.syncFromEngine()
    gameStore.addLog(`⬆️ [测试] 升级到 ${gameStore.player.level} 级!`, 'system')
  }
}
</script>

<style scoped>
.game-scene {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-container {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 0;
  overflow: hidden;
}

.main-area {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 2px;
  display: flex;
  flex-direction: column;
}

.main-area > * {
  flex: 1;
}

@media (max-width: 1024px) {
  .game-container {
    grid-template-columns: 240px 1fr 260px;
  }
}

@media (max-width: 768px) {
  .game-container {
    grid-template-columns: 1fr;
  }
}
</style>
