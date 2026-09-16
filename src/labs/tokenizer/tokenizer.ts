type Tokenizer = typeof import('gpt-tokenizer')

let pending: Promise<Tokenizer> | null = null
let loaded = false

/**
 * 后台加载 cl100k 词表。重复调用只会真正加载一次。
 * 词表约 1MB（gzip），所以在页面挂载后异步拉，不阻塞首屏。
 */
export function loadTokenizer(): Promise<Tokenizer> {
  if (!pending) {
    pending = import('gpt-tokenizer').then((mod) => {
      loaded = true
      return mod
    })
  }
  return pending
}

/** 词表是否已就绪。页面用它决定显示骨架还是结果。 */
export function isLoaded(): boolean {
  return loaded
}

/** 一次分词的结果。纯数据，不含任何渲染信息。 */
export interface EncodeResult {
  /** token id 序列 */
  ids: number[]
  /** 每个 token 对应的原始字符串 */
  tokens: string[]
  /** token 数量（= ids.length） */
  count: number
  /** 输入字符数（按 UTF-16 code unit 计） */
  chars: number
  /** 压缩比：每个 token 平均承载几个字符。越大越省 */
  ratio: number
  /** 把 tokens 拼回去是否与原文完全一致（P1-2 的验收依据） */
  lossless: boolean
}

const EMPTY: EncodeResult = {
  ids: [],
  tokens: [],
  count: 0,
  chars: 0,
  ratio: 0,
  lossless: true,
}

export function emptyResult(): EncodeResult {
  return EMPTY
}

/**
 * 把文本切成 token。cl100k_base 词表（GPT-4 / ChatGPT 同款）。
 * 异步：首次调用会等词表加载完，之后是纯计算。
 */
export async function encode(text: string): Promise<EncodeResult> {
  if (!text) return EMPTY

  const { encode: clEncode, decode: clDecode } = await loadTokenizer()

  const ids = clEncode(text)
  const tokens = ids.map((id) => clDecode([id]))
  const chars = text.length

  return {
    ids,
    tokens,
    count: ids.length,
    chars,
    ratio: ids.length === 0 ? 0 : chars / ids.length,
    lossless: tokens.join('') === text,
  }
}
