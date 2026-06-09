import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StrategyWorkspace } from '@/components/strategy/StrategyWorkspace'
import { useEditorStore } from '@/store/useEditorStore'

export function StrategyPage() {
  const [searchParams] = useSearchParams()
  const symbolParam = searchParams.get('symbol')
  const setSymbol = useEditorStore((s) => s.setSymbol)

  useEffect(() => {
    if (symbolParam) {
      setSymbol(symbolParam.toUpperCase())
    }
  }, [symbolParam, setSymbol])

  return (
    <StrategyWorkspace
      lockSymbol={symbolParam?.toUpperCase() ?? undefined}
      embedded={false}
      showHeader
    />
  )
}
