import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, Tag, Loader2 } from 'lucide-react'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import type { TemplateCreate, TemplateCategory } from '@/types/broadcast'

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  signal:     'bg-blue-900/30 text-blue-400 border-blue-800',
  ai_insight: 'bg-purple-900/30 text-purple-400 border-purple-800',
  news:       'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  custom:     'bg-dark-700 text-dark-300 border-dark-600',
  alert:      'bg-red-900/30 text-red-400 border-red-800',
}

export function TemplateManager() {
  const { templates, templatesLoading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } =
    useBroadcastStore()

  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<TemplateCreate>({
    name: '',
    category: 'custom',
    content: '',
    variables: [],
    parse_mode: 'Markdown',
  })
  const [saving, setSaving] = useState(false)
  const [variableInput, setVariableInput] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const resetForm = () => {
    setForm({ name: '', category: 'custom', content: '', variables: [], parse_mode: 'Markdown' })
    setVariableInput('')
    setShowCreate(false)
    setEditId(null)
  }

  const startEdit = (id: number) => {
    const tpl = templates.find((t) => t.id === id)
    if (!tpl) return
    setForm({
      name: tpl.name,
      category: tpl.category,
      content: tpl.content,
      variables: [...tpl.variables],
      parse_mode: tpl.parse_mode,
    })
    setEditId(id)
    setShowCreate(false)
  }

  const addVariable = () => {
    const v = variableInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (v && !form.variables.includes(v)) {
      setForm((p) => ({ ...p, variables: [...p.variables, v] }))
    }
    setVariableInput('')
  }

  const removeVariable = (v: string) => {
    setForm((p) => ({ ...p, variables: p.variables.filter((x) => x !== v) }))
  }

  const handleSave = async () => {
    if (!form.name || !form.content) return
    setSaving(true)
    try {
      if (editId) {
        await updateTemplate(editId, form)
      } else {
        await createTemplate(form)
      }
      resetForm()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const FormPanel = () => (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-dark-100">
        {editId ? 'Edit Template' : 'New Template'}
      </h4>

      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        placeholder="Template name"
        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
      />

      <div className="flex gap-3">
        <select
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TemplateCategory }))}
          className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
        >
          {Object.keys(CATEGORY_COLORS).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={form.parse_mode}
          onChange={(e) => setForm((p) => ({ ...p, parse_mode: e.target.value }))}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
        >
          <option>Markdown</option>
          <option>HTML</option>
        </select>
      </div>

      <textarea
        value={form.content}
        onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
        placeholder="Template content… Use {{variable}} for placeholders"
        rows={6}
        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 resize-none font-mono"
      />

      {/* Variables */}
      <div>
        <label className="text-xs text-dark-400 mb-1.5 block flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Variables
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={variableInput}
            onChange={(e) => setVariableInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addVariable()}
            placeholder="variable_name"
            className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-xs text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 font-mono"
          />
          <button
            onClick={addVariable}
            className="px-3 py-1.5 text-xs bg-dark-700 border border-dark-600 hover:border-dark-400 text-dark-300 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        {form.variables.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.variables.map((v) => (
              <span
                key={v}
                className="flex items-center gap-1 text-[11px] font-mono bg-dark-700 text-dark-300 px-2 py-0.5 rounded border border-dark-600"
              >
                {`{{${v}}}`}
                <button onClick={() => removeVariable(v)} className="text-dark-500 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.content}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
        </button>
        <button
          onClick={resetForm}
          className="px-4 py-2 text-sm text-dark-400 hover:text-dark-200 border border-dark-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {(showCreate || editId !== null) && <FormPanel />}

      {templatesLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-dark-500" />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-center text-xs text-dark-500 py-6">No templates yet.</p>
      ) : (
        <div className="space-y-2">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-start justify-between p-3.5 bg-dark-800 border border-dark-700 rounded-xl hover:border-dark-500 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-dark-100">{tpl.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[tpl.category]}`}>
                    {tpl.category}
                  </span>
                  {!tpl.is_active && (
                    <span className="text-[10px] text-dark-500 bg-dark-700 px-1.5 rounded">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-dark-500 mt-1 line-clamp-2 font-mono">{tpl.content}</p>
                {tpl.variables.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {tpl.variables.map((v) => (
                      <span key={v} className="text-[10px] font-mono text-brand-400">{`{{${v}}}`}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                <button
                  onClick={() => startEdit(tpl.id)}
                  className="p-1.5 text-dark-400 hover:text-brand-400 hover:bg-brand-900/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${tpl.name}"?`)) deleteTemplate(tpl.id)
                  }}
                  className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showCreate && editId === null && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-dark-600 rounded-xl text-sm text-dark-400 hover:text-dark-200 hover:border-dark-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      )}
    </div>
  )
}
