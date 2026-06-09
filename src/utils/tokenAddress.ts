import type { OnchainChain } from '@/types/onchain'

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export function looksLikeTokenAddress(value: string, chain: OnchainChain): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  if (chain === 'ethereum' || chain === 'base' || chain === 'bsc') {
    return EVM_ADDRESS.test(trimmed)
  }

  return SOLANA_ADDRESS.test(trimmed)
}

export function looksLikeSymbol(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.includes(' ')) return false
  if (looksLikeTokenAddress(trimmed, 'ethereum') || looksLikeTokenAddress(trimmed, 'solana')) {
    return false
  }
  return /^[A-Za-z0-9./_-]{1,20}$/.test(trimmed)
}
