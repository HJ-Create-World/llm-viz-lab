<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import PetalField from '@/components/PetalField.vue'
import HeroOrnament from '@/components/HeroOrnament.vue'
import OrnamentDivider from '@/components/OrnamentDivider.vue'
</script>

<template>
  <PetalField />

  <div class="shell">
    <header class="topbar">
      <div class="hero">
        <div class="hero-text">
          <RouterLink to="/" class="brand">
            <span class="mark">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 3 C19 10 25 13 29 16 C25 19 19 22 16 29 C13 22 7 19 3 16 C7 13 13 10 16 3 Z" />
                <circle cx="16" cy="16" r="3.4" />
              </svg>
            </span>
            <span class="brand-name title-anime">Token之庭</span>
          </RouterLink>
          <p class="tagline">
            把大模型的底层原理，拆成<em>能上手玩</em>的东西
          </p>
        </div>

        <div class="hero-art">
          <HeroOrnament />
        </div>
      </div>

      <OrnamentDivider tone="sakura" />
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="foot">
      <OrnamentDivider tone="lilac" />
      <p>纯前端 · 不联网 · 不传数据</p>
      <p class="foot-note">在浏览器里计算一切 ♪</p>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  z-index: 1;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.topbar {
  padding: 44px 0 8px;
}

.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.mark {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--sakura);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: var(--glow-sakura), inset 0 0 0 1px var(--border-inner);
  animation: pulse 4.5s ease-in-out infinite;
}

.mark svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
  fill-opacity: 0.22;
  stroke: currentColor;
  stroke-width: 1.1;
}

.mark svg circle {
  fill: currentColor;
  fill-opacity: 0.75;
  stroke: none;
}

.brand-name {
  font-size: 28px;
}

.tagline {
  margin-top: 10px;
  font-size: 14px;
  color: var(--ink-soft);
}

.tagline em {
  font-style: normal;
  font-weight: 700;
  color: var(--sakura-deep);
}

.hero-art {
  width: 190px;
  height: 172px;
  opacity: 0.5;
}

.foot {
  margin-top: 64px;
  font-size: 12px;
  color: var(--ink-faint);
  text-align: center;
}

.foot .foot-note {
  margin-top: 4px;
  color: var(--lilac);
  letter-spacing: 0.08em;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: var(--glow-sakura), inset 0 0 0 1px var(--border-inner);
  }
  50% {
    box-shadow: 0 0 34px rgba(232, 116, 155, 0.62), inset 0 0 0 1px var(--border-inner);
  }
}

@media (max-width: 720px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-art {
    display: none;
  }

  .brand-name {
    font-size: 24px;
  }
}
</style>
