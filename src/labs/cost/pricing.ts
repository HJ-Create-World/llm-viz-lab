/**
 * 模型价格表 · 静态数据
 *
 * 【怎么手动更新】
 * 1. 拉一次 OpenRouter 的公开接口（无需鉴权）：
 *      https://openrouter.ai/api/v1/models
 *    它返回的是「每 1 个 token」的美元价，本表存的是「每 100 万 token」，记得 × 1e6
 * 2. 改下面 PRICES 里对应的数字，然后**把 FETCHED_AT 改成当天日期**（页面靠它判断过期）
 * 3. 跑一次 npm run build 确认没报错
 *
 * 【口径说明】
 * 这里用的是 OpenRouter 的公开报价，与厂商直连价格可能有出入
 * （例如 OpenAI 官方 GPT-5.6 Sol 是 $4/1M，OpenRouter 上是 $2）。
 * 页面会明确标注来源，不假装是官方直连价。
 */

/** 价格抓取日期。页面据此判断是否过期（超过 60 天会告警） */
export const FETCHED_AT = '2026-09-15'

export const SOURCE = 'OpenRouter 公开接口 openrouter.ai/api/v1/models'

export interface ModelPrice {
  id: string
  vendor: string
  name: string
  /** 每 100 万 token 的输入价（美元） */
  input: number
  /** 每 100 万 token 的输出价（美元） */
  output: number
  /** 每 100 万 token 的缓存命中价（美元） */
  cacheRead: number
  /** 上下文窗口（token） */
  context: number
}

export const PRICES: ModelPrice[] = [
  {
    id: 'openai/gpt-6-astra',
    vendor: 'OpenAI',
    name: 'GPT-6 Astra',
    input: 10,
    output: 50,
    cacheRead: 1,
    context: 1_050_000,
  },
  {
    id: 'openai/gpt-5.6-sol',
    vendor: 'OpenAI',
    name: 'GPT-5.6 Sol',
    input: 2,
    output: 10,
    cacheRead: 0.2,
    context: 1_050_000,
  },
  {
    id: 'openai/gpt-5.6-luna',
    vendor: 'OpenAI',
    name: 'GPT-5.6 Luna',
    input: 0.2,
    output: 1.2,
    cacheRead: 0.02,
    context: 1_050_000,
  },
  {
    id: 'anthropic/claude-opus-5',
    vendor: 'Anthropic',
    name: 'Claude Opus 5',
    input: 5,
    output: 25,
    cacheRead: 0.5,
    context: 1_000_000,
  },
  {
    id: 'anthropic/claude-sonnet-5',
    vendor: 'Anthropic',
    name: 'Claude Sonnet 5',
    input: 2,
    output: 10,
    cacheRead: 0.2,
    context: 1_000_000,
  },
  {
    id: 'google/gemini-3.5-flash',
    vendor: 'Google',
    name: 'Gemini 3.5 Flash',
    input: 1.5,
    output: 9,
    cacheRead: 0.15,
    context: 1_048_576,
  },
  {
    id: 'deepseek/deepseek-v4-pro',
    vendor: 'DeepSeek',
    name: 'DeepSeek V4 Pro',
    input: 1.6,
    output: 3.2,
    cacheRead: 0.135,
    context: 1_048_576,
  },
  {
    id: 'qwen/qwen3.8-max-0902',
    vendor: 'Qwen',
    name: 'Qwen3.8 Max',
    input: 2,
    output: 6,
    cacheRead: 0.25,
    context: 1_000_000,
  },
]

/** 缓存价比正常输入便宜多少倍 —— 页面要讲的核心 */
export function cacheDiscount(p: ModelPrice): number {
  return p.cacheRead > 0 ? p.input / p.cacheRead : 1
}

/** 距今天数，用于过期告警 */
export function ageInDays(): number {
  const then = new Date(FETCHED_AT + 'T00:00:00Z').getTime()
  return Math.floor((Date.now() - then) / 86_400_000)
}
