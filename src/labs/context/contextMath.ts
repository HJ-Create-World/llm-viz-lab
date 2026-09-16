/** 上下文与 KV Cache 的计算内核。纯函数，不依赖任何库。
 *
 *  三个公式（都是业界标准写法，可核对）：
 *
 *  1. KV cache 显存
 *     bytes = 2 × layers × kvHeads × headDim × seqLen × bytesPerParam
 *     （×2 是因为 K 和 V 各一份）
 *
 *  2. Attention 计算量（prefill 整个序列）
 *     FLOPs = 4 × seqLen² × hidden × layers
 *     （4 = QKᵀ 两个矩阵乘各 2 FLOPs：QKᵀ 与 AV）
 *
 *  3. 上下文长度 = 对话轮数 × 每轮 token 数
 */

export interface ModelSpec {
  name: string
  layers: number
  /** KV head 数。GQA 模型它小于 query head 数，这是省显存的关键 */
  kvHeads: number
  headDim: number
  hidden: number
  contextWindow: number
  note: string
}

export const MODELS: ModelSpec[] = [
  {
    name: 'LLaMA-3 8B',
    layers: 32,
    kvHeads: 8,
    headDim: 128,
    hidden: 4096,
    contextWindow: 8192,
    note: 'GQA：32 个 query head 共享 8 个 KV head',
  },
  {
    name: 'Qwen2.5-7B',
    layers: 28,
    kvHeads: 4,
    headDim: 128,
    hidden: 3584,
    contextWindow: 32768,
    note: 'KV head 只有 4 个，显存很省',
  },
  {
    name: 'LLaMA-3 70B',
    layers: 80,
    kvHeads: 8,
    headDim: 128,
    hidden: 8192,
    contextWindow: 131072,
    note: '层数 80，KV cache 涨得飞快',
  },
  {
    name: 'GPT-3 175B',
    layers: 96,
    kvHeads: 96,
    headDim: 128,
    hidden: 12288,
    contextWindow: 2048,
    note: 'MHA：KV head = query head = 96，没有 GQA 优化',
  },
]

export const PRECISIONS = [
  { label: 'fp16', bytes: 2 },
  { label: 'fp8', bytes: 1 },
  { label: 'int8', bytes: 1 },
]

export interface ContextStats {
  /** 当前上下文长度（token） */
  seqLen: number
  /** 累计实际处理的 token 数（每轮都要重发历史） */
  cumulativeTokens: number
  kvBytes: number
  kvGB: number
  attentionFlops: number
  attentionTFLOPs: number
  /** 是否超出模型上下文窗口 */
  overflow: boolean
  /** 已用窗口比例，可能 > 1 */
  windowUsage: number
}

export function compute(
  model: ModelSpec,
  turns: number,
  perTurn: number,
  bytesPerParam: number,
): ContextStats {
  const seqLen = turns * perTurn
  const cumulativeTokens = (perTurn * turns * (turns + 1)) / 2

  const kvBytes = 2 * model.layers * model.kvHeads * model.headDim * seqLen * bytesPerParam

  const attentionFlops = 4 * seqLen * seqLen * model.hidden * model.layers

  return {
    seqLen,
    cumulativeTokens,
    kvBytes,
    kvGB: kvBytes / 1024 ** 3,
    attentionFlops,
    attentionTFLOPs: attentionFlops / 1e12,
    overflow: seqLen > model.contextWindow,
    windowUsage: seqLen / model.contextWindow,
  }
}

/** 生成曲线数据点。返回归一化的相对值，方便在同一张图里对比增长形态。 */
export interface CurvePoint {
  turn: number
  seqLen: number
  kvGB: number
  attentionTFLOPs: number
}

export function curve(
  model: ModelSpec,
  maxTurns: number,
  perTurn: number,
  bytesPerParam: number,
): CurvePoint[] {
  const pts: CurvePoint[] = []
  for (let t = 1; t <= maxTurns; t++) {
    const s = compute(model, t, perTurn, bytesPerParam)
    pts.push({
      turn: t,
      seqLen: s.seqLen,
      kvGB: s.kvGB,
      attentionTFLOPs: s.attentionTFLOPs,
    })
  }
  return pts
}
