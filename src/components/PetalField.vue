<script setup lang="ts">
/** 飘落花瓣 + 浮动光点。纯 CSS 动画，固定伪随机，刷新不跳变。 */
const rnd = (i: number, m: number) => ((i * 37 + 11) % m) / m

const petals = Array.from({ length: 14 }, (_, i) => ({
  id: `p${i}`,
  style: {
    left: `${rnd(i, 97) * 100}%`,
    animationDelay: `${-rnd(i + 5, 22) * 22}s`,
    animationDuration: `${13 + rnd(i + 3, 9) * 11}s`,
    '--dx': `${(rnd(i + 7, 10) - 0.5) * 160}px`,
    '--sz': `${9 + rnd(i + 2, 8) * 9}px`,
    opacity: 0.28 + rnd(i + 9, 10) * 0.34,
  },
}))

const sparks = Array.from({ length: 18 }, (_, i) => ({
  id: `s${i}`,
  style: {
    left: `${rnd(i + 13, 96) * 100}%`,
    top: `${8 + rnd(i + 21, 80) * 80}%`,
    animationDelay: `${-rnd(i + 17, 8) * 8}s`,
    animationDuration: `${5 + rnd(i + 11, 7) * 6}s`,
    '--sz': `${3 + rnd(i + 4, 6) * 5}px`,
  },
}))
</script>

<template>
  <div class="field" aria-hidden="true">
    <span v-for="p in petals" :key="p.id" class="petal" :style="p.style" />
    <span v-for="s in sparks" :key="s.id" class="spark" :style="s.style" />
  </div>
</template>

<style scoped>
.field {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.petal {
  position: absolute;
  top: -8vh;
  width: var(--sz);
  height: var(--sz);
  border-radius: 50% 0 50% 0;
  background: linear-gradient(135deg, var(--sakura-light), var(--sakura-pale));
  box-shadow: 0 0 8px rgba(232, 116, 155, 0.28);
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% {
    transform: translate3d(0, -12vh, 0) rotate(0deg);
    opacity: 0;
  }
  8% {
    opacity: 0.6;
  }
  92% {
    opacity: 0.45;
  }
  100% {
    transform: translate3d(var(--dx), 108vh, 0) rotate(560deg);
    opacity: 0;
  }
}

.spark {
  position: absolute;
  width: var(--sz);
  height: var(--sz);
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, var(--gold-light) 45%, transparent 72%);
  animation-name: drift;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes drift {
  0%,
  100% {
    transform: translateY(0) scale(0.85);
    opacity: 0.25;
  }
  50% {
    transform: translateY(-16px) scale(1.15);
    opacity: 0.85;
  }
}
</style>
