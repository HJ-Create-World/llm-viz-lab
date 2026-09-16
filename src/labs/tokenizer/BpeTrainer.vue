<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { trainBpe, END } from './bpe'

const presets = [
  { label: '经典英文', value: 'hug hug hug pug pug pun pun pun bun bun hugging' },
  { label: '中文', value: '学习 学习 机器 机器学习 人工智能' },
  { label: '极简', value: 'aa ab aa ab aaab' },
]

const text = ref(presets[0].value)
const maxMerges = ref(10)

/** -1 表示「还没开始合并」的初始状态 */
const cursor = ref(-1)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const result = computed(() => trainBpe(text.value, maxMerges.value))
const total = computed(() => result.value.steps.length)

const splits = computed(() =>
  cursor.value < 0 ? result.value.initial : result.value.steps[cursor.value].snapshot,
)
const vocab = computed(() =>
  cursor.value < 0 ? result.value.initialVocab : result.value.steps[cursor.value].vocab,
)
const step = computed(() => (cursor.value < 0 ? null : result.value.steps[cursor.value]))

watch([text, maxMerges], () => {
  stop()
  cursor.value = -1
})

/** 把词尾标记显示成紧凑符号，完整写法放在图例里 */
function show(symbol: string) {
  return symbol === END ? '⏎' : symbol
}

function isNew(symbol: string) {
  return step.value?.merged === symbol
}

function step1() {
  stop()
  if (cursor.value < total.value - 1) cursor.value++
}

function back() {
  stop()
  if (cursor.value >= 0) cursor.value--
}

function reset() {
  stop()
  cursor.value = -1
}

function stop() {
  playing.value = false
  clearInterval(timer)
}

function toggle() {
  if (playing.value) return stop()
  if (cursor.value >= total.value - 1) cursor.value = -1
  playing.value = true
  timer = setInterval(() => {
    if (cursor.value >= total.value - 1) return stop()
    cursor.value++
  }, 850)
}

onUnmounted(stop)
</script>

<template>
  <div class="trainer">
    <div class="row-top">
      <div class="presets">
        <button
          v-for="p in presets"
          :key="p.label"
          type="button"
          class="preset"
          :class="{ on: text === p.value }"
          @click="text = p.value"
        >
          {{ p.label }}
        </button>
      </div>
      <label class="range">
        合并步数
        <input v-model.number="maxMerges" type="range" min="1" max="30" />
        <span class="num">{{ maxMerges }}</span>
      </label>
    </div>

    <textarea v-model="text" class="corpus" spellcheck="false" rows="2" />

    <div class="controls">
      <button type="button" class="btn primary" @click="toggle">
        {{ playing ? '暂停' : '播放' }}
      </button>
      <button type="button" class="btn" :disabled="cursor < 0" @click="back">上一步</button>
      <button type="button" class="btn" :disabled="cursor >= total - 1" @click="step1">
        下一步
      </button>
      <button type="button" class="btn" @click="reset">重置</button>
      <span class="progress num">
        步 {{ cursor + 1 }} / {{ total }} · 词表 {{ vocab.length }}
      </span>
    </div>

    <div class="now" :class="{ idle: !step }">
      <template v-if="step">
        第 <b>{{ step.index + 1 }}</b> 步：把
        <span class="sym">{{ show(step.pair[0]) }}</span>
        <span class="op">+</span>
        <span class="sym">{{ show(step.pair[1]) }}</span>
        合并成
        <span class="sym new">{{ show(step.merged) }}</span>
        <span class="freq">（这对在语料中共出现 {{ step.freq }} 次）</span>
      </template>
      <template v-else>点「播放」或「下一步」，看词表怎么一步步长出来</template>
    </div>

    <div class="words">
      <div v-for="w in splits" :key="w.word" class="word">
        <span class="wname">{{ w.word }}<i class="num">×{{ w.freq }}</i></span>
        <span class="parts">
          <span
            v-for="(p, i) in w.parts"
            :key="i"
            class="part"
            :class="{ hit: isNew(p), tail: p === END }"
            >{{ show(p) }}</span
          >
        </span>
      </div>
    </div>

    <div class="vocab">
      <p class="vlabel">词表（{{ vocab.length }}）</p>
      <span v-for="v in vocab" :key="v" class="vchip" :class="{ hit: isNew(v) }">{{
        show(v)
      }}</span>
    </div>

    <p class="legend"><span class="k">⏎</span> 是词尾标记 {{ END }}，用来防止跨词合并</p>
  </div>
</template>

<style scoped>
.row-top {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.presets {
  display: flex;
  gap: 7px;
}

.preset,
.btn {
  padding: 4px 12px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 12px;
  color: var(--sakura-deep);
  background: rgba(232, 116, 155, 0.08);
  border: 1px solid var(--border-crystal);
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.preset:hover,
.btn:hover:not(:disabled) {
  background: rgba(232, 116, 155, 0.16);
}

.preset.on {
  color: #fff;
  background: var(--grad-sakura);
  border-color: transparent;
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn.primary {
  color: #fff;
  background: var(--grad-sakura);
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(232, 116, 155, 0.34);
}

.range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-soft);
}

.range input {
  width: 120px;
  accent-color: var(--sakura);
}

.corpus {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-crystal);
  background: rgba(255, 255, 255, 0.75);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 13px;
  resize: vertical;
}

.corpus:focus {
  outline: none;
  border-color: var(--sakura);
  box-shadow: 0 0 0 3px rgba(232, 116, 155, 0.12);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 14px 0;
}

.progress {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-faint);
}

.now {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--ink);
  background: rgba(232, 116, 155, 0.08);
  border: 1px solid var(--border-crystal);
}

.now.idle {
  color: var(--ink-faint);
  background: rgba(201, 168, 224, 0.08);
}

.sym {
  display: inline-block;
  margin: 0 3px;
  padding: 1px 8px;
  border-radius: 7px;
  font-family: var(--font-mono);
  background: #fff;
  border: 1px solid var(--border-crystal);
}

.sym.new {
  color: #fff;
  background: var(--grad-sakura);
  border-color: transparent;
}

.op {
  color: var(--ink-faint);
}

.freq {
  margin-left: 6px;
  font-size: 12px;
  color: var(--ink-soft);
}

.words {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.word {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wname {
  min-width: 96px;
  font-size: 13px;
  color: var(--ink-soft);
}

.wname i {
  margin-left: 5px;
  font-style: normal;
  font-size: 11px;
  color: var(--ink-faint);
}

.parts {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.part {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 7px;
  font-family: var(--font-mono);
  font-size: 12px;
  background: rgba(232, 116, 155, 0.1);
  border: 1px solid var(--border-crystal);
  transition: transform 0.25s, background 0.25s;
}

.part:nth-child(even) {
  background: rgba(201, 168, 224, 0.14);
}

.part.tail {
  background: rgba(212, 175, 106, 0.18);
  border-color: rgba(212, 175, 106, 0.42);
}

.part.hit {
  color: #fff;
  background: var(--grad-sakura);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(232, 116, 155, 0.36);
}

.vocab {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border-crystal);
}

.vlabel {
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--ink-faint);
}

.vchip {
  display: inline-block;
  margin: 0 4px 5px 0;
  padding: 2px 8px;
  border-radius: 7px;
  font-family: var(--font-mono);
  font-size: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-crystal);
}

.vchip.hit {
  color: #fff;
  background: var(--grad-sakura);
  border-color: transparent;
}

.legend {
  margin-top: 12px;
  font-size: 11px;
  color: var(--ink-faint);
}

.legend .k {
  margin-right: 5px;
  color: var(--gold);
  font-family: var(--font-mono);
}
</style>
