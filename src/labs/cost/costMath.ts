import type { ModelPrice } from './pricing'

/** 一次会话的参数 */
export interface UsageInput {
  /** system prompt 长度 */
  systemTokens: number
  /** 会话轮数 */
  turns: number
  /** 每轮用户输入的 token */
  perTurnInput: number
  /** 每轮助手输出的 token */
  perTurnOutput: number
  /** 每天多少次这样的会话 */
  sessionsPerDay: number
  /** 是否启用 prompt 缓存 */
  useCache: boolean
}

/** 成本构成。四项加起来 = 单次会话总成本 */
export interface CostBreakdown {
  /** 重复发送的历史上下文 */
  history: number
  /** 重复发送的 system prompt */
  system: number
  /** 每轮真正新增的输入 */
  freshInput: number
  /** 模型输出 */
  output: number
  total: number
}

export interface CostResult {
  perSession: CostBreakdown
  perDay: number
  perMonth: number
  /** 整个会话累计处理的 token 数 */
  totalTokens: number
  /** 其中「重复发送」的部分占比 */
  wasteRatio: number
  /** 如果开启缓存能省多少（百分比） */
  cacheSavingRatio: number
}

const M = 1_000_000

export function computeCost(p: ModelPrice, u: UsageInput): CostResult {
  let history = 0
  let system = 0
  let freshInput = 0
  let output = 0
  let totalTokens = 0

  /** 同时算一份「不缓存」的成本，用来给出省多少的建议 */
  let noCacheTotal = 0

  const historyPrice = u.useCache ? p.cacheRead : p.input
  const systemPrice = u.useCache ? p.cacheRead : p.input

  for (let i = 1; i <= u.turns; i++) {
    const hist = (i - 1) * (u.perTurnInput + u.perTurnOutput)

    history += (hist / M) * historyPrice
    system += (u.systemTokens / M) * systemPrice
    freshInput += (u.perTurnInput / M) * p.input
    output += (u.perTurnOutput / M) * p.output

    totalTokens += u.systemTokens + hist + u.perTurnInput + u.perTurnOutput

    noCacheTotal +=
      ((u.systemTokens + hist + u.perTurnInput) / M) * p.input +
      (u.perTurnOutput / M) * p.output
  }

  const total = history + system + freshInput + output
  const repeated = history + system

  return {
    perSession: { history, system, freshInput, output, total },
    perDay: total * u.sessionsPerDay,
    perMonth: total * u.sessionsPerDay * 30,
    totalTokens,
    wasteRatio: total > 0 ? repeated / total : 0,
    cacheSavingRatio: noCacheTotal > 0 ? Math.max(0, 1 - total / noCacheTotal) : 0,
  }
}

/** 优化建议：每条都给出「能省百分之多少」，不是空话 */
export interface Advice {
  title: string
  detail: string
  saving: number
}

export function advice(p: ModelPrice, u: UsageInput, r: CostResult): Advice[] {
  const out: Advice[] = []

  if (!u.useCache && r.cacheSavingRatio > 0.01) {
    out.push({
      title: '开启 prompt 缓存',
      detail: `缓存命中价是正常输入价的 1/${(p.input / p.cacheRead).toFixed(0)}，
        而你这场景里有 ${(r.wasteRatio * 100).toFixed(0)}% 的钱花在重复发送上`,
      saving: r.cacheSavingRatio,
    })
  }

  if (u.systemTokens > 300) {
    const share = r.perSession.system / r.perSession.total
    out.push({
      title: `把 system prompt 砍掉一半`,
      detail: `它是每一轮都要重发的固定成本，目前占单次会话 ${(share * 100).toFixed(0)}%`,
      saving: share * 0.5,
    })
  }

  if (u.turns > 6) {
    const keep = 6
    const curHist = ((u.turns - 1) * u.turns) / 2
    const newHist = ((keep - 1) * keep) / 2
    const ratio = 1 - newHist / curHist
    out.push({
      title: `只保留最近 ${keep} 轮历史`,
      detail: `历史是平方级累积的，第 ${u.turns} 轮时它已经占了输入的大头`,
      saving: (r.perSession.history / r.perSession.total) * ratio,
    })
  }

  return out.sort((a, b) => b.saving - a.saving)
}
