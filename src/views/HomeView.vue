<script setup lang="ts">
import { RouterLink } from 'vue-router'
import CrystalCard from '@/components/CrystalCard.vue'
import { loadTokenizer } from '@/labs/tokenizer/tokenizer'

interface LabMeta {
  name: string
  index: string
  title: string
  subtitle: string
  body: string
  ready: boolean
}

const labs: LabMeta[] = [
  {
    name: 'tokenizer',
    index: '01',
    title: 'BPE 分词实验室',
    subtitle: '模型看到的不是字，是 token',
    body: '粘贴任意文本，看它被切成什么样子；中英文并列对比，直观理解为什么中文更"贵"。还能一步步播放 BPE 词表是怎么长出来的。',
    ready: true,
  },
  {
    name: 'context',
    index: '02',
    title: '上下文与 KV Cache',
    subtitle: '我的上下文为什么会越聊越爆',
    body: '拖动对话轮数，看上下文长度、attention 计算量、显存占用怎么分道扬镳 —— 平方项会迅速甩开其他所有东西。',
    ready: true,
  },
  {
    name: 'cost',
    index: '03',
    title: '上下文预算与成本',
    subtitle: '一次对话到底花多少钱',
    body: '输入用量参数，算出单次与月度成本，看清钱到底花在哪 —— 大部分时候，是花在反复重发的那部分历史上。',
    ready: true,
  },
]

/** hover / focus 时静默预热词表，点进去就不必再等。
 *  loadTokenizer 幂等，重复调用只会真正加载一次。 */
let prefetched = false

function prefetch(name: string) {
  if (prefetched || name !== 'tokenizer') return
  prefetched = true
  void loadTokenizer()
}
</script>

<template>
  <section>
    <div class="intro">
      <h2 class="section-title">
        <svg viewBox="0 0 24 24" class="gem" aria-hidden="true">
          <path d="M12 2 L17 9 L12 22 L7 9 Z" />
          <path d="M7 9 L17 9" />
        </svg>
        <span class="title-anime">三个实验</span>
      </h2>
      <p class="lead">
        每个实验相互独立，可以从任意一个开始。全部在你自己的浏览器里计算，不发一个请求。
      </p>
    </div>

    <div class="grid">
      <RouterLink
        v-for="lab in labs"
        :key="lab.name"
        :to="lab.ready ? `/labs/${lab.name}` : '/'"
        class="card-link"
        :class="{ 'is-off': !lab.ready }"
        @mouseenter="prefetch(lab.name)"
        @focus="prefetch(lab.name)"
      >
        <CrystalCard
          :index="lab.index"
          :title="lab.title"
          :subtitle="lab.subtitle"
          :ready="lab.ready"
        >
          <p class="body">{{ lab.body }}</p>
        </CrystalCard>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.intro {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
}

.gem {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: var(--sakura);
  stroke-width: 1.4;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 6px rgba(232, 116, 155, 0.55));
}

.lead {
  margin-top: 8px;
  padding-left: 32px;
  font-size: 13px;
  color: var(--ink-soft);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.card-link {
  display: block;
  color: inherit;
}

/* 未开放的实验：视觉上退到次要层级，且不做 hover 位移 */
.is-off {
  cursor: default;
  opacity: 0.72;
}

.is-off :deep(.crystal:hover) {
  transform: none;
  border-color: var(--border-crystal);
  box-shadow: var(--shadow-card), inset 0 1px 0 var(--border-inner),
    inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.body {
  font-size: 13px;
  color: var(--ink-soft);
}

@media (max-width: 720px) {
  .lead {
    padding-left: 0;
  }
}
</style>
