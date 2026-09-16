<script setup lang="ts">
/** 半透明装饰插图：花环 + 光翼 + 水晶 + 蝴蝶结。
    只用几何图形营造角色氛围，不使用任何真人/角色立绘素材。 */

const petals = Array.from({ length: 12 }, (_, i) => i * 30)
const stars = [
  { x: 34, y: 40, s: 1 },
  { x: 186, y: 52, s: 0.8 },
  { x: 26, y: 150, s: 0.7 },
  { x: 192, y: 146, s: 1.1 },
]
</script>

<template>
  <svg class="ornament" viewBox="0 0 220 200" aria-hidden="true">
    <g class="wing">
      <path d="M110 98 C82 62 46 52 20 62 C38 76 46 98 50 124 C68 110 90 102 110 98 Z" />
      <path d="M110 98 C138 62 174 52 200 62 C182 76 174 98 170 124 C152 110 130 102 110 98 Z" />
    </g>

    <g class="ring">
      <ellipse
        v-for="deg in petals"
        :key="deg"
        cx="110"
        cy="56"
        rx="7"
        ry="16"
        :transform="`rotate(${deg} 110 110)`"
      />
    </g>

    <path class="crystal" d="M110 76 L129 104 L110 144 L91 104 Z" />
    <path class="crystal-line" d="M110 76 L110 144 M91 104 L129 104" />

    <g class="ribbon">
      <path d="M110 164 L94 152 L94 176 Z" />
      <path d="M110 164 L126 152 L126 176 Z" />
      <circle cx="110" cy="164" r="3.6" />
    </g>

    <path
      v-for="(s, i) in stars"
      :key="i"
      class="star"
      :d="`M${s.x} ${s.y - 6 * s.s} L${s.x + 1.6 * s.s} ${s.y - 1.6 * s.s} L${s.x + 6 * s.s} ${s.y} L${s.x + 1.6 * s.s} ${s.y + 1.6 * s.s} L${s.x} ${s.y + 6 * s.s} L${s.x - 1.6 * s.s} ${s.y + 1.6 * s.s} L${s.x - 6 * s.s} ${s.y} L${s.x - 1.6 * s.s} ${s.y - 1.6 * s.s} Z`"
    />
  </svg>
</template>

<style scoped>
.ornament {
  width: 100%;
  height: 100%;
  color: var(--sakura);
  animation: floaty 7s ease-in-out infinite;
}

.wing path,
.ring ellipse,
.crystal,
.ribbon path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.1;
  stroke-linejoin: round;
}

.wing path {
  fill: currentColor;
  fill-opacity: 0.07;
  stroke-width: 0.9;
}

.ring ellipse {
  fill: currentColor;
  fill-opacity: 0.12;
  stroke-width: 0.8;
}

.crystal {
  fill: currentColor;
  fill-opacity: 0.16;
}

.crystal-line {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.6;
  opacity: 0.7;
}

.ribbon path {
  fill: currentColor;
  fill-opacity: 0.2;
}

.ribbon circle {
  fill: currentColor;
  fill-opacity: 0.5;
}

.star {
  fill: var(--gold);
  opacity: 0.7;
}

@keyframes floaty {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1.2deg);
  }
}
</style>
