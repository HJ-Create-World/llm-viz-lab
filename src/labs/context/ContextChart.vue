<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  values: number[]
  unit: string
  /** 水平参考线，比如显存上限 */
  limit?: number | null
  limitLabel?: string
  tone?: 'sakura' | 'lilac' | 'gold'
}>()

const W = 320
const H = 132
const PAD_L = 6
const PAD_R = 6
const PAD_T = 12
const PAD_B = 20

const max = computed(() => {
  const m = Math.max(...props.values, props.limit ?? 0)
  return m > 0 ? m : 1
})

const innerW = W - PAD_L - PAD_R
const innerH = H - PAD_T - PAD_B

function x(i: number) {
  const n = Math.max(1, props.values.length - 1)
  return PAD_L + (i / n) * innerW
}

function y(v: number) {
  return PAD_T + innerH - (v / max.value) * innerH
}

const line = computed(() =>
  props.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '),
)

const area = computed(() => {
  if (!props.values.length) return ''
  const first = `${x(0).toFixed(1)},${(PAD_T + innerH).toFixed(1)}`
  const last = `${x(props.values.length - 1).toFixed(1)},${(PAD_T + innerH).toFixed(1)}`
  return `${first} ${line.value.replace('M', 'L')} ${last} Z`
})

const limitY = computed(() => (props.limit ? y(props.limit) : null))
const stroke = computed(() =>
  props.tone === 'lilac' ? '#c9a8e0' : props.tone === 'gold' ? '#d4af6a' : '#e8749b',
)

function fmt(v: number) {
  if (v >= 1000) return v.toFixed(0)
  if (v >= 10) return v.toFixed(1)
  if (v >= 1) return v.toFixed(2)
  return v.toFixed(3)
}
</script>

<template>
  <svg class="chart" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
    <path :d="area" :fill="stroke" fill-opacity="0.13" />
    <path :d="line" fill="none" :stroke="stroke" stroke-width="1.8" stroke-linejoin="round" />

    <line
      v-if="limitY !== null"
      :x1="PAD_L"
      :x2="W - PAD_R"
      :y1="limitY"
      :y2="limitY"
      stroke="#a8939f"
      stroke-width="0.8"
      stroke-dasharray="4 3"
    />
    <text
      v-if="limitY !== null && limitLabel"
      :x="W - PAD_R"
      :y="limitY - 4"
      text-anchor="end"
      font-size="9"
      fill="#a8939f"
    >
      {{ limitLabel }}
    </text>

    <text :x="PAD_L" :y="H - 6" font-size="9" fill="#a8939f">第 1 轮</text>
    <text :x="W - PAD_R" :y="H - 6" text-anchor="end" font-size="9" fill="#a8939f">
      第 {{ values.length }} 轮 · 峰值 {{ fmt(max) }} {{ unit }}
    </text>
  </svg>
</template>

<style scoped>
.chart {
  display: block;
  width: 100%;
  height: 132px;
  overflow: visible;
}
</style>
