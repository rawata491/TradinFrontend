import { useEffect, useState } from 'react'
import http from '@/services/httpClient'
import { TIMEFRAMES, TIMEFRAME_LABELS, TIMEFRAME_SECONDS } from '@/utils/constants'

export interface TimeframeConfig {
  granularity: string
  interval_seconds: number
  default_bars: number
}

let cachedConfig: Record<string, TimeframeConfig> | null = null

async function fetchTimeframeConfig(): Promise<Record<string, TimeframeConfig>> {
  if (cachedConfig) return cachedConfig
  try {
    const { data } = await http.get<{ timeframes: Record<string, TimeframeConfig> }>(
      '/api/candles/timeframes',
    )
    cachedConfig = data.timeframes
    return cachedConfig
  } catch {
    cachedConfig = Object.fromEntries(
      TIMEFRAMES.map((tf) => [
        tf,
        {
          granularity: tf,
          interval_seconds: TIMEFRAME_SECONDS[tf] ?? 86400,
          default_bars: 300,
        },
      ]),
    )
    return cachedConfig
  }
}

export function useTimeframes() {
  const [timeframes, setTimeframes] = useState<string[]>([...TIMEFRAMES])
  const [config, setConfig] = useState<Record<string, TimeframeConfig> | null>(null)

  useEffect(() => {
    fetchTimeframeConfig().then((cfg) => {
      setConfig(cfg)
      setTimeframes(Object.keys(cfg))
    })
  }, [])

  const labels = { ...TIMEFRAME_LABELS }
  const seconds: Record<string, number> = { ...TIMEFRAME_SECONDS }
  if (config) {
    for (const [tf, entry] of Object.entries(config)) {
      seconds[tf] = entry.interval_seconds
      if (!labels[tf]) labels[tf] = tf
    }
  }

  return { timeframes, config, labels, seconds }
}

export { fetchTimeframeConfig }
