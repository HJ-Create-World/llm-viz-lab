<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CrystalCard from '@/components/CrystalCard.vue'
import OrnamentDivider from '@/components/OrnamentDivider.vue'
import { PRICES, FETCHED_AT, SOURCE, ageInDays, cacheDiscount } from './pricing'
import { computeCost, advice } from './costMath'

const STALE_DAYS = 60

const modelIndex = ref(1)
const systemTokens = ref(800)
const turns = ref(10)
const perTurnInput = ref(200)
const perTurnOutput = ref(400)
const sessionsPerDay = ref(50)
const useCache = ref(false)

const price = computed(() => PRICES[modelIndex.value])
const usage = computed(() => ({
  systemTokens: systemTokens.value,
  turns: turns.value,
  perTurnInput: perTurnInput.value,
  perTurnOutput: perTurnOutput.value,
  sessionsPerDay: sessionsPerDay.value,
  useCache: useCache.value,
}))

const result = computed(() => computeCost(price.value, usage.value))
const advices = computed(() => advice(price.value, usage.value, result.value))
const stale = computed(() => ageInDays() > STALE_DAYS)

const parts = computed(() => {
  const b = result.value.perSession
  const all = [
    { key: '重复的历史', v: b.history, tone: 'bad' },
    { key: 'system 重发', v: b.system, tone: 'gold' },
    { key: '本轮新输入', v: b.freshInput, tone: 'sakura' },
    { key: '模型输出', v: b.output, tone: 'lilac' },
  ]
  const max = Math.max(...all.map((a) => a.v), 0.0000001)
  return all.map((a) => ({ ...a, pct: (a.v / max) * 100, share: b.total ? a.v / b.total : 0 }))
})

function money(v: number) {
  if (v >= 100) return '$' + v.toFixed(0)
  if (v >= 1) return '$' + v.toFixed(2)
  if (v >= 0.01) return '$' + v.toFixed(4)
  return '$' + v.toFixed(6)
}
</script>

<template>
  <section>
    <nav class="crumb">
      <RouterLink to="/">← 返回 Token之庭</RouterLink>
    </nav>

    <header class="lab-head">
      <h1 class="title-anime">上下文预算与成本</h1>
      <p class="lead">
        一次对话到底花多少钱？大部分时候，钱不是花在「新说的话」上，而是花在反复重发的旧内容上。
      </p>
    </header>

    <OrnamentDivider tone="gold" />

    <p v-if="stale" class="stale">
      价格数据更新于 {{ FETCHED_AT }}，已超过 {{ STALE_DAYS }} 天，可能已经不准了。
      请对照 {{ SOURCE }} 手动更新 <code>src/labs/cost/pricing.ts</code>
    </p>

    <div class="layout">
      <div class="col-side">
        <CrystalCard title="用量" subtitle="按你自己的场景调" :ready="true">
          <label class="field">
            <span class="flabel">模型</span>
            <select v-model.number="modelIndex" class="sel">
              <option v-for="(p, i) in PRICES" :key="p.id" :value="i">
                {{ p.vendor }} · {{ p.name }}
              </option>
            </select>
          </label>

          <label class="field">
            <span class="flabel">system prompt <i class="num">{{ systemTokens }} tok</i></span>
            <input v-model.number="systemTokens" type="range" min="0" max="4000" step="100" />
          </label>

          <label class="field">
            <span class="flabel">对话轮数 <i class="num">{{ turns }}</i></span>
            <input v-model.number="turns" type="range" min="1" max="40" />
          </label>

          <label class="field">
            <span class="flabel">每轮输入 <i class="num">{{ perTurnInput }} tok</i></span>
            <input v-model.number="perTurnInput" type="range" min="50" max="2000" step="50" />
          </label>

          <label class="field">
            <span class="flabel">每轮输出 <i class="num">{{ perTurnOutput }} tok</i></span>
            <input v-model.number="perTurnOutput" type="range" min="50" max="2000" step="50" />
          </label>

          <label class="field">
            <span class="flabel">每天会话数 <i class="num">{{ sessionsPerDay }}</i></span>
            <input v-model.number="sessionsPerDay" type="range" min="1" max="2000" step="10" />
          </label>

          <label class="check">
            <input v-model="useCache" type="checkbox" />
            <span>启用 prompt 缓存</span>
          </label>
          <p class="hint">
            缓存命中价 ${{ price.cacheRead }}/1M，是正常输入价 ${{ price.input }}/1M 的
            1/{{ cacheDiscount(price).toFixed(0) }}
          </p>
        </CrystalCard>
      </div>

      <div class="col-main">
        <CrystalCard title="花多少" :subtitle="`1 次会话 · ${turns} 轮`" :ready="true">
          <div class="stats">
            <div class="stat">
              <p class="slabel">单次会话</p>
              <p class="sval num">{{ money(result.perSession.total) }}</p>
            </div>
            <div class="stat">
              <p class="slabel">每天</p>
              <p class="sval num">{{ money(result.perDay) }}</p>
            </div>
            <div class="stat">
              <p class="slabel">每月（30 天）</p>
              <p class="sval num accent">{{ money(result.perMonth) }}</p>
            </div>
          </div>

          <p class="waste">
            其中 <span class="num strong">{{ (result.wasteRatio * 100).toFixed(0) }}%</span>
            花在「重复发送的历史 + system」上，只有
            {{ (100 - result.wasteRatio * 100).toFixed(0) }}% 是真正的新内容
          </p>
        </CrystalCard>

        <CrystalCard title="钱花在哪" subtitle="单次会话的成本构成" :ready="true">
          <div class="bars">
            <div v-for="p in parts" :key="p.key" class="bar-row">
              <span class="bkey">{{ p.key }}</span>
              <span class="btrack">
                <i class="bfill" :class="p.tone" :style="{ width: `${p.pct}%` }" />
              </span>
              <span class="bval num">{{ (p.share * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </CrystalCard>

        <CrystalCard title="能省多少" subtitle="按省下的比例排序" :ready="true">
          <div v-for="a in advices" :key="a.title" class="advice">
            <p class="atitle">
              {{ a.title }}
              <span class="asave num">省 {{ (a.saving * 100).toFixed(0) }}%</span>
            </p>
            <p class="adetail">{{ a.detail }}</p>
          </div>
          <p v-if="!advices.length" class="adetail">当前配置已经比较省了</p>
        </CrystalCard>
      </div>
    </div>

    <p class="src">
      价格数据 {{ FETCHED_AT }} 抓取自 {{ SOURCE }}。
      OpenRouter 报价与厂商直连价可能有出入，请以官方为准。
    </p>
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

.stale {
  margin: 16px 0 0;
  padding: 10px 13px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.8;
  color: var(--tone-bad);
  background: rgba(194, 65, 12, 0.08);
  border: 1px solid rgba(194, 65, 12, 0.28);
}

.stale code {
  font-family: var(--font-mono);
  font-size: 11px;
}

.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: start;
  margin-top: 18px;
}

.col-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: block;
  margin-bottom: 13px;
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

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
  cursor: pointer;
}

.check input {
  accent-color: var(--sakura);
}

.hint {
  margin-top: 6px;
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
  font-size: 16px;
  font-weight: 700;
  color: var(--sakura-deep);
}

.sval.accent {
  color: var(--gold);
}

.waste {
  margin-top: 14px;
  font-size: 12px;
  color: var(--ink-soft);
}

.strong {
  font-weight: 700;
  color: var(--tone-bad);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.bar-row {
  display: grid;
  grid-template-columns: 92px 1fr 44px;
  align-items: center;
  gap: 10px;
}

.bkey {
  font-size: 12px;
  color: var(--ink-soft);
}

.btrack {
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 168, 224, 0.18);
}

.bfill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}

.bfill.bad {
  background: linear-gradient(90deg, var(--gold-light), var(--tone-bad));
}

.bfill.gold {
  background: linear-gradient(90deg, var(--gold-light), var(--gold));
}

.bfill.sakura {
  background: var(--grad-sakura);
}

.bfill.lilac {
  background: linear-gradient(90deg, var(--lilac-soft), var(--lilac));
}

.bval {
  font-size: 12px;
  text-align: right;
  color: var(--ink-faint);
}

.advice + .advice {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-crystal);
}

.atitle {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
}

.asave {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--tone-good);
}

.adetail {
  margin-top: 5px;
  font-size: 12px;
  color: var(--ink-soft);
}

.src {
  margin-top: 24px;
  font-size: 11px;
  color: var(--ink-faint);
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
