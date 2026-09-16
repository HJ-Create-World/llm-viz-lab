/** BPE 训练过程的完整实现。不依赖任何库 —— 这个模块本身就是教学内容。
 *
 *  算法（Sennrich 2016）：
 *  1. 语料切成词，每个词拆成字符，词尾加 </w> 防止跨词合并
 *  2. 统计所有相邻符号对的频次（按词频加权）
 *  3. 合并频次最高的一对，作为新符号加入词表
 *  4. 重复 2-3，直到达到目标次数或无对可合
 */

/** 词尾标记。加它是为了让 "hug" 和 "hugging" 的 hug 不会被混为一谈 */
export const END = '</w>'

/** 一个词在当前步骤下的分裂状态 */
export interface WordSplit {
  word: string
  parts: string[]
  freq: number
}

/** 训练过程的一步 */
export interface BpeStep {
  index: number
  /** 这一步被合并的符号对 */
  pair: [string, string]
  /** 该符号对在语料中的加权频次 */
  freq: number
  /** 合并产生的新符号 */
  merged: string
  /** 这一步之后所有词的分裂快照 */
  snapshot: WordSplit[]
  /** 这一步之后的词表 */
  vocab: string[]
}

export interface BpeResult {
  initial: WordSplit[]
  initialVocab: string[]
  steps: BpeStep[]
  finalVocab: string[]
}

/** 把语料切成词：连续的字母数字算一个词，其余单个字符各自成词。
 *  这样中英文混排都能合理工作。 */
function splitCorpus(text: string): string[] {
  return text.match(/[A-Za-z0-9]+|[^\sA-Za-z0-9]/g) ?? []
}

function buildInitial(text: string): WordSplit[] {
  const freq = new Map<string, number>()
  for (const w of splitCorpus(text)) {
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }
  return [...freq].map(([word, f]) => ({
    word,
    parts: [...word, END],
    freq: f,
  }))
}

/** 分隔符用不可能出现在文本里的字符，避免歧义 */
const SEP = '\u0000'

function countPairs(splits: WordSplit[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const s of splits) {
    for (let i = 0; i < s.parts.length - 1; i++) {
      const key = s.parts[i] + SEP + s.parts[i + 1]
      m.set(key, (m.get(key) ?? 0) + s.freq)
    }
  }
  return m
}

/** 取频次最高的一对；频次相同时按字典序取小的，保证结果可复现 */
function topPair(pairFreq: Map<string, number>): [[string, string], number] | null {
  let best: [string, string] | null = null
  let bestFreq = 0
  for (const [key, f] of pairFreq) {
    const [a, b] = key.split(SEP) as [string, string]
    if (best === null || f > bestFreq || (f === bestFreq && a + b < best[0] + best[1])) {
      best = [a, b]
      bestFreq = f
    }
  }
  return best ? [best, bestFreq] : null
}

function mergePair(splits: WordSplit[], pair: [string, string]): WordSplit[] {
  return splits.map((s) => {
    const parts: string[] = []
    let i = 0
    while (i < s.parts.length) {
      if (i < s.parts.length - 1 && s.parts[i] === pair[0] && s.parts[i + 1] === pair[1]) {
        parts.push(pair[0] + pair[1])
        i += 2
      } else {
        parts.push(s.parts[i])
        i += 1
      }
    }
    return { ...s, parts }
  })
}

function vocabOf(splits: WordSplit[]): string[] {
  return [...new Set(splits.flatMap((s) => s.parts))].sort()
}

function clone(splits: WordSplit[]): WordSplit[] {
  return splits.map((s) => ({ ...s, parts: [...s.parts] }))
}

/**
 * 跑一遍 BPE 训练，记录每一步。
 * @param text 训练语料（建议短一些，教学用）
 * @param maxMerges 最多合并几步
 */
export function trainBpe(text: string, maxMerges: number): BpeResult {
  let splits = buildInitial(text)

  if (splits.length === 0) {
    return { initial: [], initialVocab: [], steps: [], finalVocab: [] }
  }

  const initial = clone(splits)
  const initialVocab = vocabOf(splits)
  const steps: BpeStep[] = []

  /** 真实 BPE 的词表是累积的：学到的合并规则会永久保留，
   *  哪怕某个符号在当下一步的分裂里暂时不再出现。
   *  所以这里用 Set 累加，而不是每步重新统计当前出现的符号 ——
   *  否则词表会「先增后减」，那是错的。 */
  const vocabSet = new Set(initialVocab)

  for (let i = 0; i < maxMerges; i++) {
    const picked = topPair(countPairs(splits))
    if (!picked) break

    const [pair, freq] = picked
    splits = mergePair(splits, pair)
    vocabSet.add(pair[0] + pair[1])

    steps.push({
      index: i,
      pair,
      freq,
      merged: pair[0] + pair[1],
      snapshot: clone(splits),
      vocab: [...vocabSet].sort(),
    })
  }

  return {
    initial,
    initialVocab,
    steps,
    finalVocab: steps.length ? steps[steps.length - 1].vocab : initialVocab,
  }
}
