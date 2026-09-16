<script setup lang="ts">
import { computed } from 'vue'
import type { EncodeResult } from './tokenizer'

const props = defineProps<{
  result: EncodeResult | null
}>()

/** 压缩比量程：0 ~ 8 字符/token。
 *  英文好句子通常 5~7，中文约 1.5~2，纯 emoji 是 1.0 —— 这个范围刚好覆盖全部典型情况。 */
const SCALE = 8

const ratio = computed(() => props.result?.ratio ?? 0)
const pct = computed(() => Math.min(100, (ratio.value / SCALE) * 100))

/** 定性提示：把抽象数字翻译成人能判断的话 */
const level = computed(() => {
  const r = ratio.value
  if (!r) return ''
  if (r >= 5) return '高效 · 每个 token 装了 5 个以上字符'
  if (r >= 3) return '中等 · 还有优化空间'
  if (r >= 2) return '偏贵 · 每个 token 只装 2~3 个字符'
  return '很贵 · 几乎一个 token 装一个字'
})

const levelTone = computed(() => {
  const r = ratio.value
  if (!r) return ''
  if (r >= 5) return 'good'
  if (r >= 3) return 'mid'
  return 'bad'
})
</script>

<template>
  <div class="stats">
    <dl class="grid">
      <div class="cell">
        <dt>字符</dt>
        <dd class="num">{{ result?.chars ?? 0 }}</dd>
      </div>
      <div class="cell">
        <dt>token</dt>
        <dd class="num strong">{{ result?.count ?? 0 }}</dd>
      </div>
      <div class="cell">
        <dt>压缩比</dt>
        <dd class="num accent">{{ ratio ? ratio.toFixed(2) : '—' }}</dd>
      </div>
    </dl>

    <div class="meter">
      <p class="meter-label">每个 token 平均承载</p>
      <div class="track">
        <span class="fill" :style="{ width: `${pct}%` }" />
      </div>
      <div class="scale num">
        <span>0</span>
        <span>{{ SCALE }} 字符</span>
      </div>
    </div>

    <p v-if="level" class="note" :class="levelTone">{{ level }}</p>
    <p v-else class="note muted">输入文本后这里会给出判断</p>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.cell {
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border-crystal);
}

dt {
  font-size: 11px;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
}

dd {
  margin-top: 2px;
  font-size: 16px;
}

.strong {
  font-weight: 700;
  color: var(--sakura-deep);
}

.accent {
  font-weight: 700;
  color: var(--gold);
}

.meter-label {
  font-size: 11px;
  color: var(--ink-faint);
  margin-bottom: 6px;
}

.track {
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 168, 224, 0.18);
}

.fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--grad-sakura);
  box-shadow: 0 0 10px rgba(232, 116, 155, 0.5);
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.scale {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 11px;
  color: var(--ink-faint);
}

.note {
  margin-top: 14px;
  font-size: 12px;
}

.note.good {
  color: var(--tone-good);
}

.note.mid {
  color: var(--tone-mid);
}

.note.bad {
  color: var(--tone-bad);
}

.note.muted {
  color: var(--ink-faint);
}
</style>
