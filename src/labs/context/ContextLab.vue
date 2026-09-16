<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CrystalCard from '@/components/CrystalCard.vue'
import OrnamentDivider from '@/components/OrnamentDivider.vue'
import ContextChart from './ContextChart.vue'
import { MODELS, PRECISIONS, compute, curve } from './contextMath'

const modelIndex = ref(0)
const precisionIndex = ref(0)
const perTurn = ref(512)
const turns = ref(16)
/** 用来对比的相对基准：第 1 轮 */
const MAX_TURNS = 40

const model = computed(() => MODELS[modelIndex.value])
const bytes = computed(() => PRECISIONS[precisionIndex.value].bytes)

const stats = computed(() => compute(model.value, turns.value, perTurn.value, bytes.value))

const points = computed(() => curve(model.value, MAX_TURNS, perTurn.value, bytes.value))
const kvValues = computed(() => points.value.map((p) => p.kvGB))
const attnValues = computed(() => points.value.map((p) => p.attentionTFLOPs))

/** 相对第 1 轮涨了多少倍 —— 这个对比是整页要讲的核心 */
const base = computed(() => points.value[0])
const growth = computed(() => {
  const cur = points.value[Math.min(turns.value, MAX_TURNS) - 1]
  if (!base.value || !cur) return null
  return {
    kv: +(cur.kvGB / base.value.kvGB).toFixed(1),
    attn: +(cur.attentionTFLOPs / base.value.attentionTFLOPs).toFixed(1),
    turn: cur.turn,
  }
})

const GPU_GB = 24
</script>

<template>
  <section>
    <nav class="crumb">
      <RouterLink to="/">← 返回 Token之庭</RouterLink>
    </nav>

    <header class="lab-head">
      <h1 class="title-anime">上下文与 KV Cache</h1>
      <p class="lead">
        对话越聊越久，代价不是线性涨的 —— 显存顺着涨，计算量按平方涨。
      </p>
    </header>

    <OrnamentDivider tone="lilac" />

    <div class="layout">
      <div class="col-side">
        <CrystalCard title="参数" subtitle="选模型与精度" :ready="true">
          <label class="field">
            <span class="flabel">模型</span>
            <select v-model.number="modelIndex" class="sel">
              <option v-for="(m, i) in MODELS" :key="m.name" :value="i">{{ m.name }}</option>
            </select>
          </label>
          <p class="note">{{ model.note }}</p>

          <label class="field">
            <span class="flabel">缓存精度</span>
            <select v-model.number="precisionIndex" class="sel">
              <option v-for="(p, i) in PRECISIONS" :key="p.label" :value="i">{{ p.label }}</option>
            </select>
          </label>

          <label class="field">
            <span class="flabel">每轮 token <i class="num">{{ perTurn }}</i></span>
            <input v-model.number="perTurn" type="range" min="64" max="2048" step="64" />
          </label>

          <label class="field">
            <span class="flabel">对话轮数 <i class="num">{{ turns }}</i></span>
            <input v-model.number="turns" type="range" min="1" :max="MAX_TURNS" />
          </label>
        </CrystalCard>
      </div>

      <div class="col-main">
        <CrystalCard title="当前状态" :subtitle="`第 ${turns} 轮结束时`" :ready="true">
          <div class="stats">
            <div class="stat">
              <p class="slabel">上下文长度</p>
              <p class="sval num">{{ stats.seqLen.toLocaleString() }}<i>tok</i></p>
              <p class="shint">窗口用掉 {{ (stats.windowUsage * 100).toFixed(0) }}%</p>
            </div>
            <div class="stat">
              <p class="slabel">KV cache 显存</p>
              <p class="sval num">{{ stats.kvGB.toFixed(2) }}<i>GB</i></p>
              <p class="shint">线性增长</p>
            </div>
            <div class="stat">
              <p class="slabel">Attention 计算量</p>
              <p class="sval num accent">{{ stats.attentionTFLOPs.toFixed(2) }}<i>TFLOPs</i></p>
              <p class="shint">按平方增长</p>
            </div>
          </div>

          <div class="vram">
            <p class="vlabel">
              显存占用（对照 {{ GPU_GB }}GB 显卡）
              <span class="num">{{ ((stats.kvGB / GPU_GB) * 100).toFixed(0) }}%</span>
            </p>
            <div class="vbar">
              <span
                class="vfill"
                :class="{ over: stats.kvGB > GPU_GB }"
                :style="{ width: `${Math.min(100, (stats.kvGB / GPU_GB) * 100)}%` }"
              />
            </div>
          </div>

          <p v-if="stats.overflow" class="alert">
            已超出该模型 {{ model.contextWindow.toLocaleString() }} 的上下文窗口，
            真实场景会把最早的内容截断或丢掉
          </p>
        </CrystalCard>

        <CrystalCard title="增长曲线" subtitle="横轴是轮数，两张图各自的纵轴刻度不同" :ready="true">
          <div class="charts">
            <figure>
              <figcaption>KV cache 显存（GB）· 线性</figcaption>
              <ContextChart :values="kvValues" unit="GB" :limit="GPU_GB" limit-label="24GB 卡" />
            </figure>
            <figure>
              <figcaption>Attention 计算量（TFLOPs）· 平方</figcaption>
              <ContextChart :values="attnValues" unit="TF" tone="lilac" />
            </figure>
          </div>

          <p v-if="growth" class="verdict">
            从第 1 轮到第 <span class="num">{{ growth.turn }}</span> 轮：<br />
            显存涨到 <span class="num strong">{{ growth.kv }} 倍</span>，
            计算量涨到 <span class="num accent">{{ growth.attn }} 倍</span>
          </p>
        </CrystalCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.crumb {
  font-size: 12px;
  letter-spacing: 0.06em;
}

.lab-head {
  margin-top: 14px;
}

h1 {
  font-size: 26px;
}

.lead {
  margin-top: 8px;
  max-width: 620px;
  font-size: 13px;
  color: var(--ink-soft);
}

.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: start;
}

.col-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: block;
  margin-bottom: 14px;
}

.flabel {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: var(--ink-soft);
}

.flabel i {
  font-style: normal;
  color: var(--sakura-deep);
}

.sel {
  width: 100%;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-crystal);
  background: rgba(255, 255, 255, 0.8);
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--sakura);
}

.note {
  margin: -8px 0 14px;
  font-size: 11px;
  color: var(--ink-faint);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border-crystal);
}

.slabel {
  font-size: 11px;
  color: var(--ink-faint);
}

.sval {
  margin-top: 3px;
  font-size: 17px;
  font-weight: 700;
  color: var(--sakura-deep);
}

.sval i {
  margin-left: 3px;
  font-style: normal;
  font-size: 11px;
  font-weight: 400;
  color: var(--ink-faint);
}

.sval.accent {
  color: var(--gold);
}

.shint {
  margin-top: 3px;
  font-size: 11px;
  color: var(--ink-faint);
}

.vram {
  margin-top: 18px;
}

.vlabel {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ink-soft);
  margin-bottom: 6px;
}

.vbar {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 168, 224, 0.18);
}

.vfill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--grad-sakura);
  transition: width 0.3s;
}

.vfill.over {
  background: linear-gradient(90deg, var(--gold), var(--tone-bad));
}

.alert {
  margin-top: 14px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--tone-bad);
  background: rgba(194, 65, 12, 0.08);
  border: 1px solid rgba(194, 65, 12, 0.28);
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

figcaption {
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--ink-faint);
}

.verdict {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-crystal);
  font-size: 13px;
  line-height: 1.9;
  color: var(--ink-soft);
}

.strong {
  font-weight: 700;
  color: var(--sakura-deep);
}

.accent {
  font-weight: 700;
  color: var(--gold);
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .charts {
    grid-template-columns: 1fr;
  }
}
</style>
