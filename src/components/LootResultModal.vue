<template>
  <div class="modal-overlay show">
    <div class="modal-panel loot-modal">
      <h3 class="modal-title">战利品</h3>

      <div class="loot-list" data-testid="loot-list">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="loot-item"
          :class="'quality-' + (item.quality || 'common')"
        >
          <span class="loot-icon">{{ qualityEmojis[item.quality] || '📦' }}</span>
          <div class="loot-info">
            <span class="loot-name" :class="'q-' + (item.quality || 'common')">
              {{ item.name || '未知物品' }}
            </span>
            <span class="loot-detail" v-if="item.slot">
              {{ slotNames[item.slot] || item.slot }}
              <template v-if="item.itemLevel"> · iLv {{ item.itemLevel }}</template>
            </span>
            <div class="loot-stats" v-if="item.stats">
              <span v-for="(val, stat) in item.stats" :key="stat" class="stat-entry">
                +{{ val }} {{ statNames[stat] || stat }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="items.length === 0" class="no-loot">
          没有掉落物品
        </div>
      </div>

      <div class="modal-buttons">
        <button class="pixel-btn primary" @click="$emit('confirm')" data-testid="loot-confirm">
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    items: {
        type: Array,
        default: () => [],
    },
})

defineEmits(['confirm'])

const qualityEmojis = {
    common: '⬜',
    uncommon: '🟩',
    rare: '🟦',
    epic: '🟪',
    legendary: '🟧',
}

const slotNames = {
    head: '头部',
    shoulders: '肩膀',
    chest: '胸甲',
    legs: '腿部',
    hands: '手套',
    wrists: '护腕',
    waist: '腰带',
    feet: '鞋子',
    back: '披风',
    neck: '项链',
    finger1: '戒指',
    finger2: '戒指',
    trinket1: '饰品',
    trinket2: '饰品',
    mainHand: '主手',
    offHand: '副手',
}

const statNames = {
    strength: '力量',
    agility: '敏捷',
    stamina: '耐力',
    intellect: '智力',
    spirit: '精神',
    armor: '护甲',
    attackPower: '攻击强度',
    spellPower: '法术强度',
    critChance: '暴击率',
    hitChance: '命中率',
}
</script>

<style scoped>
.loot-modal {
    max-width: 450px;
}

.loot-list {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
}

.loot-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    transition: border-color 0.15s;
}

.loot-item.quality-uncommon { border-left: 3px solid #1eff00; }
.loot-item.quality-rare { border-left: 3px solid #0070dd; }
.loot-item.quality-epic { border-left: 3px solid #a335ee; }
.loot-item.quality-legendary { border-left: 3px solid #ff8000; }

.loot-icon {
    font-size: 16px;
    min-width: 24px;
    text-align: center;
}

.loot-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.loot-name {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
}

.q-common { color: #9d9d9d; }
.q-uncommon { color: #1eff00; }
.q-rare { color: #0070dd; }
.q-epic { color: #a335ee; }
.q-legendary { color: #ff8000; }

.loot-detail {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-muted);
}

.loot-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 2px;
}

.stat-entry {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--color-friendly);
}

.no-loot {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-muted);
    text-align: center;
    padding: 20px;
}
</style>
