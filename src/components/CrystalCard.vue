<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  index?: string
  ready?: boolean
}>()
</script>

<template>
  <article class="crystal">
    <span class="sheen" />

    <svg class="deco" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" stroke-width="0.7" />
      <ellipse
        v-for="d in [0, 60, 120, 180, 240, 300]"
        :key="d"
        cx="30"
        cy="13"
        rx="3.4"
        ry="7"
        :transform="`rotate(${d} 30 30)`"
        fill="currentColor"
        fill-opacity="0.16"
        stroke="currentColor"
        stroke-width="0.6"
      />
      <path d="M30 18 L37 30 L30 42 L23 30 Z" fill="currentColor" fill-opacity="0.24" />
    </svg>

    <header>
      <span v-if="index" class="idx num">{{ index }}</span>
      <h3>{{ title }}</h3>
    </header>

    <p v-if="subtitle" class="sub">{{ subtitle }}</p>

    <div class="body">
      <slot />
    </div>

    <footer v-if="!ready">
      <span class="badge">施工中</span>
    </footer>
  </article>
</template>

<style scoped>
.crystal {
  position: relative;
  overflow: hidden;
  height: 100%;
  padding: 26px 22px 22px;
  border-radius: var(--radius);
  border: 1px solid var(--border-crystal);
  background: var(--grad-card);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-card), inset 0 1px 0 var(--border-inner),
    inset 0 0 0 1px rgba(255, 255, 255, 0.45);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s,
    border-color 0.28s;
}

.crystal:hover {
  transform: translateY(-6px);
  border-color: rgba(232, 116, 155, 0.55);
  box-shadow: var(--shadow-card-hover), var(--glow-sakura),
    inset 0 1px 0 var(--border-inner);
}

/* 顶部高光条：悬停时从左扫到右 */
.sheen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--grad-sakura);
  opacity: 0.5;
  transform: scaleX(0.25);
  transform-origin: left;
  transition: transform 0.4s ease, opacity 0.3s;
}

.crystal:hover .sheen {
  transform: scaleX(1);
  opacity: 1;
}

.deco {
  position: absolute;
  right: -14px;
  bottom: -14px;
  width: 104px;
  height: 104px;
  color: var(--sakura);
  opacity: 0.14;
  pointer-events: none;
  transition: transform 0.6s ease, opacity 0.4s;
}

.crystal:hover .deco {
  transform: rotate(22deg) scale(1.08);
  opacity: 0.22;
}

header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.idx {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 13px;
  color: #fff;
  background: var(--grad-sakura);
  box-shadow: 0 3px 10px rgba(232, 116, 155, 0.4);
}

h3 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--ink);
}

.sub {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sakura-deep);
}

.body {
  position: relative;
  margin-top: 12px;
  font-size: 13px;
  color: var(--ink-soft);
}

footer {
  margin-top: 18px;
}

.badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  background: rgba(232, 116, 155, 0.1);
  border: 1px solid var(--border-crystal);
}
</style>
