<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

/** 四个预设都刻意选了「同一类内容的不同表达」，
 *  方便后面 P1-4 做中英对比时直接感受到压缩比的差距。 */
const presets = [
  { label: '中文', value: '人工智能正在改变我们编写软件的方式。' },
  { label: 'English', value: 'Artificial intelligence is changing the way we write software.' },
  { label: '代码', value: 'function greet(name) {\n  return `Hello, ${name}!`\n}' },
  { label: 'Emoji', value: '🌸✨🎉💖🎀' },
]

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

function apply(value: string) {
  emit('update:modelValue', value)
}

function isActive(value: string) {
  return props.modelValue === value
}
</script>

<template>
  <div class="input">
    <div class="presets">
      <button
        v-for="p in presets"
        :key="p.label"
        type="button"
        class="preset"
        :class="{ on: isActive(p.value) }"
        @click="apply(p.value)"
      >
        {{ p.label }}
      </button>
    </div>

    <textarea
      class="ta"
      :value="modelValue"
      :placeholder="placeholder ?? '在这里粘贴任意文本…'"
      spellcheck="false"
      @input="onInput"
    />

    <div class="foot">
      <span class="num count">{{ modelValue.length }} 字符</span>
      <button v-if="modelValue" type="button" class="clear" @click="apply('')">清空</button>
    </div>
  </div>
</template>

<style scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.preset {
  padding: 4px 12px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 12px;
  color: var(--sakura-deep);
  background: rgba(232, 116, 155, 0.08);
  border: 1px solid var(--border-crystal);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.preset:hover {
  background: rgba(232, 116, 155, 0.16);
  transform: translateY(-1px);
}

.preset.on {
  color: #fff;
  background: var(--grad-sakura);
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(232, 116, 155, 0.34);
}

.ta {
  width: 100%;
  min-height: 132px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-crystal);
  background: rgba(255, 255, 255, 0.75);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ta:focus {
  outline: none;
  border-color: var(--sakura);
  box-shadow: 0 0 0 3px rgba(232, 116, 155, 0.12);
}

.ta::placeholder {
  color: var(--ink-faint);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ink-faint);
}

.clear {
  padding: 2px 10px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 12px;
  color: var(--ink-soft);
  background: transparent;
  border: 1px solid var(--border-crystal);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.clear:hover {
  color: var(--sakura-deep);
  border-color: var(--sakura);
}
</style>
