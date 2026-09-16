<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tokens: string[]
  ids: number[]
}>()

/** 不可打印 / 肉眼看不见的字符，替换成可见符号。
 *  这是「拼接后与原文一致」能被肉眼验证的前提 —— 看不见不等于不存在。 */
const SYMBOLS: Record<string, string> = {
  ' ': '·',
  '\n': '↵',
  '\t': '⇥',
  '\r': '⏎',
}

const MAX_RENDER = 1200

/** 超过上限时只渲染前一部分，避免长文把页面卡死（P2-2 会补虚拟滚动） */
const shown = computed(() => props.tokens.slice(0, MAX_RENDER))
const hidden = computed(() => Math.max(0, props.tokens.length - MAX_RENDER))

function display(t: string): string {
  if (t === '') return '∅'
  return t.replace(/[ \n\t\r]/g, (c) => SYMBOLS[c])
}

/** 悬停提示：id + 长度 + 是否含不可打印字符 */
function tip(t: string, i: number): string {
  const id = props.ids[i]
  const hasHidden = /[ \n\t\r]/.test(t) || t === ''
  return `#${id} · ${t.length} 字符${hasHidden ? ' · 含不可见字符' : ''}`
}
</script>

<template>
  <div class="wrap">
    <div class="chips">
      <span
        v-for="(t, i) in shown"
        :key="i"
        class="chip"
        :class="{ alt: i % 2 === 1, blank: t === '' }"
      >
        <span class="txt">{{ display(t) }}</span>
        <span class="tip num">{{ tip(t, i) }}</span>
      </span>
    </div>

    <p v-if="hidden" class="more">
      还有 <span class="num">{{ hidden }}</span> 个 token 未渲染（上限 {{ MAX_RENDER }}）
    </p>

    <p class="legend">
      <span class="k">·</span> 空格
      <span class="k">↵</span> 换行
      <span class="k">⇥</span> 制表符
      <span class="k">∅</span> 不可打印片段
    </p>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  position: relative;
  display: inline-block;
  padding: 2px 9px;
  border-radius: 8px;
  border: 1px solid var(--border-crystal);
  background: rgba(232, 116, 155, 0.1);
  transition: transform 0.15s, box-shadow 0.15s;
}

/* 相邻 token 交替底色，边界一眼可辨 */
.chip.alt {
  background: rgba(201, 168, 224, 0.16);
  border-color: rgba(201, 168, 224, 0.34);
}

.chip.blank {
  background: rgba(212, 175, 106, 0.14);
  border-color: rgba(212, 175, 106, 0.4);
}

.chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(232, 116, 155, 0.24);
  z-index: 2;
}

.txt {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink);
  white-space: pre;
}

.tip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  z-index: 5;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  white-space: nowrap;
  color: #fff;
  background: var(--ink);
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(3px);
  transition: opacity 0.15s, transform 0.15s;
}

.chip:hover .tip {
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
}

.more {
  margin-top: 14px;
  font-size: 12px;
  color: var(--ink-faint);
}

.legend {
  margin-top: 12px;
  font-size: 11px;
  color: var(--ink-faint);
}

.legend .k {
  display: inline-block;
  min-width: 16px;
  margin: 0 4px 0 10px;
  text-align: center;
  color: var(--sakura-deep);
  font-family: var(--font-mono);
}
</style>
