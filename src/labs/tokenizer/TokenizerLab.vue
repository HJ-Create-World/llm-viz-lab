<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import CrystalCard from '@/components/CrystalCard.vue'
import OrnamentDivider from '@/components/OrnamentDivider.vue'
import TextInput from './TextInput.vue'
import TokenChips from './TokenChips.vue'
import StatsPanel from './StatsPanel.vue'
import CompareMode from './CompareMode.vue'
import BpeTrainer from './BpeTrainer.vue'
import { encode, loadTokenizer, type EncodeResult } from './tokenizer'

const text = ref('')
const result = ref<EncodeResult | null>(null)
const busy = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function run() {
  if (!text.value) {
    result.value = null
    busy.value = false
    return
  }
  busy.value = true
  result.value = await encode(text.value)
  busy.value = false
}

/** 输入防抖 220ms，避免每敲一个字符都重算 */
watch(text, () => {
  clearTimeout(timer)
  busy.value = true
  timer = setTimeout(run, 220)
})

/** 词表在页面挂载时就开始拉，与 hover 预热配合 */
onMounted(() => {
  void loadTokenizer()
})

const subtitle = computed(() => {
  if (!text.value) return 'cl100k_base · 等待输入'
  if (busy.value) return '正在分词…'
  return result.value ? `共 ${result.value.count} 个 token` : 'cl100k_base'
})
</script>

<template>
  <section>
    <nav class="crumb">
      <RouterLink to="/">← 返回 Token之庭</RouterLink>
    </nav>

    <header class="lab-head">
      <h1 class="title-anime">BPE 分词实验室</h1>
      <p class="lead">
        模型看到的不是字，是 token。同一段话，不同语言切出来的块数和代价完全不同。
      </p>
    </header>

    <OrnamentDivider tone="sakura" />

    <div class="layout">
      <div class="col-side">
        <CrystalCard title="输入" subtitle="粘贴文本，或选一个预设" :ready="true">
          <TextInput v-model="text" />
        </CrystalCard>

        <CrystalCard title="统计" subtitle="压缩比 = 字符 ÷ token" :ready="true">
          <StatsPanel :result="result" />
        </CrystalCard>
      </div>

      <div class="col-main">
        <CrystalCard title="Token 流" :subtitle="subtitle" :ready="true">
          <p v-if="!text" class="empty">在左边输入点什么，或者点一个预设 →</p>

          <div v-else-if="busy && !result" class="skeleton">
            <span v-for="i in 4" :key="i" class="bar" :style="{ animationDelay: `${i * 0.12}s` }" />
          </div>

          <template v-else-if="result">
            <p class="summary">
              <span class="num strong">{{ result.count }}</span> 个 token ·
              字符 {{ result.chars }} · 压缩比
              <span class="num">{{ result.ratio.toFixed(2) }}</span> ·
              无损 <span class="num">{{ result.lossless ? '✓' : '✗' }}</span>
            </p>

            <TokenChips :tokens="result.tokens" :ids="result.ids" />
          </template>
        </CrystalCard>
      </div>

      <CrystalCard
        class="span-all"
        title="中英对比"
        subtitle="同一句话，两种代价"
        :ready="true"
      >
        <CompareMode />
      </CrystalCard>

      <CrystalCard
        class="span-all"
        title="BPE 词表是怎么长出来的"
        subtitle="单步播放合并过程 · 算法自己实现，不依赖任何库"
        :ready="true"
      >
        <BpeTrainer />
      </CrystalCard>
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

.col-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pending,
.empty {
  font-size: 13px;
  color: var(--ink-faint);
}

.summary {
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--ink-soft);
}

.strong {
  font-size: 15px;
  font-weight: 700;
  color: var(--sakura-deep);
}

/* 跨两列的区块 */
.span-all {
  grid-column: 1 / -1;
  margin-top: 4px;
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

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
