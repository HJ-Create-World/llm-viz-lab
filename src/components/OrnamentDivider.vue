<script setup lang="ts">
/** 装饰性分隔线：中央水晶花 + 两侧渐隐线 + 小铃铛点 */
defineProps<{ tone?: 'sakura' | 'lilac' | 'gold' }>()
</script>

<template>
  <div class="divider" :class="tone ?? 'sakura'" aria-hidden="true">
    <span class="line" />
    <span class="dot" />
    <svg class="bloom" viewBox="0 0 34 34">
      <path
        d="M17 3 C20 9 25 12 31 17 C25 22 20 25 17 31 C14 25 9 22 3 17 C9 12 14 9 17 3 Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      />
      <path d="M17 3 L17 31 M3 17 L31 17" fill="none" stroke="currentColor" stroke-width="0.6" />
      <circle cx="17" cy="17" r="3.2" fill="currentColor" opacity="0.5" />
    </svg>
    <span class="dot" />
    <span class="line" />
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 30px 0;
  color: var(--sakura);
}

.divider.lilac {
  color: var(--lilac);
}

.divider.gold {
  color: var(--gold);
}

.line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 45%, transparent);
  opacity: 0.5;
}

.bloom {
  width: 22px;
  height: 22px;
  opacity: 0.85;
  filter: drop-shadow(0 0 6px currentColor);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
  box-shadow: 0 0 6px currentColor;
}
</style>
