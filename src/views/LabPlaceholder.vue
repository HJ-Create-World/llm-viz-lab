<script setup lang="ts">
import { useRoute } from 'vue-router'
import HeroOrnament from '@/components/HeroOrnament.vue'

const route = useRoute()
</script>

<template>
  <section class="wrap">
    <p class="hint num">/labs/{{ route.params.name }}</p>
    <h2 class="title-anime">这个实验还在做</h2>
    <p class="desc">
      按 SPEC 的里程碑顺序来，做完一个才开下一个。当前进度见项目根目录的 NOW.md。
    </p>
    <div class="art">
      <HeroOrnament />
    </div>
  </section>
</template>

<style scoped>
.wrap {
  position: relative;
  padding: 40px 0;
  text-align: center;
}

.hint {
  font-size: 12px;
  color: var(--ink-faint);
  letter-spacing: 0.08em;
}

h2 {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
}

.desc {
  margin-top: 10px;
  font-size: 13px;
  color: var(--ink-soft);
}

.art {
  width: 200px;
  height: 180px;
  margin: 12px auto 0;
  opacity: 0.4;
}
</style>
