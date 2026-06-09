import type { OnchainChain } from '@/types/onchain'

export interface TrackedOnchainToken {
  id: string
  name: string
  symbol: string
  chain: OnchainChain
  address: string
}

/** Curated tokens available for on-chain analysis. */
export const ONCHAIN_TRACKED_TOKENS: TrackedOnchainToken[] = [
  {
    id: 'troll',
    name: 'Troll',
    symbol: 'TROLL',
    chain: 'solana',
    address: '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2',
  },
  {
    id: 'rave',
    name: 'Rave',
    symbol: 'RAVE',
    chain: 'ethereum',
    address: '0x17205fab260a7a6383a81452cE6315A39370Db97',
  },
  {
    id: 'labusdt',
    name: 'Labusdt',
    symbol: 'LABUSDT',
    chain: 'bsc',
    address: '0x7ec43Cf65F1663F820427C62A5780b8f2E25593A',
  },
  {
    id: 'pippinusdt',
    name: 'Pippinusdt',
    symbol: 'PIPPINUSDT',
    chain: 'solana',
    address: 'Dfh5DzRgSvvCFDoYc2ciTkMrbDfRKybA4SoFbPmApump',
  },
  {
    id: 'power',
    name: 'Power',
    symbol: 'POWER',
    chain: 'ethereum',
    address: '0x9dC44ae5BE187ECA9e2A67e33f27A4c91cEA1223',
  },
]

export const DEFAULT_ONCHAIN_TOKEN = ONCHAIN_TRACKED_TOKENS[0]

function normalizeAddress(address: string): string {
  return address.startsWith('0x') ? address.toLowerCase() : address
}

export function findTrackedTokenById(id: string): TrackedOnchainToken | undefined {
  return ONCHAIN_TRACKED_TOKENS.find((t) => t.id === id.toLowerCase())
}

export function findTrackedTokenByChainAddress(
  chain: string,
  address: string,
): TrackedOnchainToken | undefined {
  const normalized = normalizeAddress(address)
  return ONCHAIN_TRACKED_TOKENS.find(
    (t) => t.chain === chain && normalizeAddress(t.address) === normalized,
  )
}

export function isTrackedOnchainToken(chain: string, address: string): boolean {
  return !!findTrackedTokenByChainAddress(chain, address)
}

export function onchainPageUrl(token: TrackedOnchainToken, tab = 'overview'): string {
  return `/onchain?token=${token.id}&tab=${tab}`
}
