<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { encode, loadTokenizer, type EncodeResult } from './tokenizer'

/** 同一语义的中英对照。刻意选了不同长度的句式，
 *  避免「只有长句才贵」的误解。 */
const pairs = [
  {
    label: '日常',
    zh: '今天天气很好，我们一起去公园散步吧。',
    en: 'The weather is nice today, let us go for a walk in the park.',
  },
  {
    label: '技术',
    zh: '人工智能正在改变我们编写软件的方式。',
    en: 'Artificial intelligence is changing the way we write software.',
  },
  {
    label: '描写',
    zh: '月光洒在寂静的湖面上，微风拂过，泛起层层涟漪。',
    en: 'Moonlight fell upon the silent lake, and a gentle breeze stirred ripples across its surface.',
  },
]

interface CompareRow {
  label: string
  zh: string
  en: string
  zhResult: EncodeResult
  enResult: EncodeResult
  /** 中文比英文贵多少倍 = 英文压缩比 ÷ 中文压缩比 */
  times: number
}

const rows = ref<CompareRow[]>([])
const loading = ref(true)

const SCALE = 8

onMounted(async () => {
  await loadTokenizer()
  rows.value = await Promise.all(
    pairs.map(async (p) => {
      const zr = await encode(p.zh)
      const er = await encode(p.en)
      return {
        ...p,
        zhResult: zr,
        enResult: er,
        times: zr.ratio === 0 ? 0 : +(er.ratio / zr.ratio).toFixed(2),
      }
    }),
  )
  loading.value = false
})

function width(ratio: number) {
  return `${Math.min(100, (ratio / SCALE) * 100)}%`
}
</script>

<template>
  <div class="compare">
    <div v-if="loading" class="skeleton">
      <span v-for="i in 3" :key="i" class="bar" :style="{ animationDelay: `${i * 0.14}s` }" />
    </div>

    <div v-for="r in rows" :key="r.label" class="pair">
      <p class="pair-label">{{ r.label }}</p>

      <div class="line">
        <span class="lang zh">中文</span>
        <span class="txt">{{ r.zh }}</span>
        <span class="metrics num">
          <b>{{ r.zhResult.count }}</b> tokens · 压缩比
          <b class="warn">{{ r.zhResult.ratio.toFixed(2) }}</b>
        </span>
        <span class="track"><i class="fill warn" :style="{ width: width(r.zhResult.ratio) }" /></span>
      </div>

      <div class="line">
        <span class="lang en">英文</span>
        <span class="txt">{{ r.en }}</span>
        <span class="metrics num">
          <b>{{ r.enResult.count }}</b> tokens · 压缩比
          <b class="ok">{{ r.enResult.ratio.toFixed(2) }}</b>
        </span>
        <span class="track"><i class="fill ok" :style="{ width: width(r.enResult.ratio) }" /></span>
      </div>

      <p class="verdict">
        同样的意思，中文要比英文多花
        <span class="num strong">{{ r.times }} 倍</span> 的 token
      </p>
    </div>
  </div>
</template>

<style scoped>
.pair + .pair {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--border-crystal);
}

.pair-label {
  margin-bottom: 10px;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
}

.line {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 4px 10px;
  align-items: center;
  padding: 7px 0;
}

.lang {
  font-size: 11px;
  text-align: center;
  padding: 1px 0;
  border-radius: 6px;
}

.lang.zh {
  color: #fff;
  background: var(--sakura);
}

.lang.en {
  color: #fff;
  background: var(--lilac);
}

.txt {
  font-size: 13px;
  color: var(--ink);
  word-break: break-word;
}

.metrics {
  grid-column: 2;
  font-size: 12px;
  color: var(--ink-soft);
}

.track {
  grid-column: 2;
  height: 7px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 168, 224, 0.18);
}

.fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.fill.warn {
  background: linear-gradient(90deg, var(--gold-light), var(--gold));
}

.fill.ok {
  background: var(--grad-sakura);
}

b {
  font-weight: 700;
}

.metrics .warn {
  color: var(--tone-bad);
}

.metrics .ok {
  color: var(--tone-good);
}

.verdict {
  margin-top: 10px;
  font-size: 12px;
  color: var(--ink-soft);
}

.strong {
  font-weight: 700;
  color: var(--sakura-deep);
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.bar {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--sakura-pale), var(--sakura-soft), var(--sakura-pale));
  background-size: 220% 100%;
  animation: sweep 1.4s ease-in-out infinite;
}

@keyframes sweep {
  0% {
    background-position: 120% 0;
    opacity: 0.55;
  }
  100% {
    background-position: -20% 0;
    opacity: 0.85;
  }
}
</style>
