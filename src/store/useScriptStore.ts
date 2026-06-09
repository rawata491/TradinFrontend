import { create } from 'zustand'
import { scriptApi } from '@/services/scriptApi'
import type { Script, ScriptCreate, ScriptUpdate } from '@/types/script'

interface ScriptStore {
  scripts: Script[]
  activeScript: Script | null
  loading: boolean
  error: string | null

  loadScripts: () => Promise<void>
  createScript: (payload: ScriptCreate) => Promise<Script>
  updateScript: (id: number, payload: ScriptUpdate) => Promise<void>
  deleteScript: (id: number) => Promise<void>
  setActive: (script: Script | null) => void
  clearError: () => void
}

export const useScriptStore = create<ScriptStore>((set) => ({
  scripts: [],
  activeScript: null,
  loading: false,
  error: null,

  loadScripts: async () => {
    set({ loading: true, error: null })
    try {
      const resp = await scriptApi.list()
      set({ scripts: resp.scripts, loading: false })
    } catch (err) {
      set({ loading: false, error: String(err) })
    }
  },

  createScript: async (payload) => {
    const script = await scriptApi.create(payload)
    set(s => ({ scripts: [script, ...s.scripts] }))
    return script
  },

  updateScript: async (id, payload) => {
    const updated = await scriptApi.update(id, payload)
    set(s => ({
      scripts: s.scripts.map(sc => sc.id === id ? updated : sc),
      activeScript: s.activeScript?.id === id ? updated : s.activeScript,
    }))
  },

  deleteScript: async (id) => {
    await scriptApi.delete(id)
    set(s => ({
      scripts: s.scripts.filter(sc => sc.id !== id),
      activeScript: s.activeScript?.id === id ? null : s.activeScript,
    }))
  },

  setActive: (script) => set({ activeScript: script }),
  clearError: () => set({ error: null }),
}))
