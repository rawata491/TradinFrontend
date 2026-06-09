import { useCallback, useEffect, useRef } from 'react'
import Editor, { BeforeMount, Monaco, OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEditorStore } from '@/store/useEditorStore'
import { useThemeStore } from '@/store/useThemeStore'
import { scriptApi } from '@/services/scriptApi'

// ─────────────────────────── Pine Script DSL language config ─────────────────

const PINE_LANGUAGE_ID = 'pinescript-dsl'

/**
 * Called via `beforeMount` so themes are registered BEFORE the editor
 * initialises and tries to apply the `theme` prop.
 */
function setupMonaco(monaco: Monaco) {
  // ── Language registration (idempotent guard) ────────────────────────────
  const alreadyRegistered = monaco.languages
    .getLanguages()
    .some((l: { id: string }) => l.id === PINE_LANGUAGE_ID)

  if (!alreadyRegistered) {
    monaco.languages.register({ id: PINE_LANGUAGE_ID })

    monaco.languages.setMonarchTokensProvider(PINE_LANGUAGE_ID, {
      keywords: ['if', 'else', 'and', 'or', 'not', 'true', 'false', 'na', 'var'],
      builtins: ['close', 'open', 'high', 'low', 'volume', 'hl2', 'hlc3', 'ohlc4', 'bar_index'],
      tokenizer: {
        root: [
          [/\/\/.*$/, 'comment'],
          [/#.*$/, 'comment'],
          [/"([^"\\]|\\.)*"/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'],
          [/\b(ta|strategy)\b(?=\.)/, 'keyword.namespace'],
          [/\b(if|else|and|or|not|true|false|na)\b/, 'keyword'],
          [/\b(close|open|high|low|volume)\b/, 'variable.predefined'],
          [/(?<=\.)[a-zA-Z_][a-zA-Z0-9_]*/, 'support.function'],
          [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],
          [/[=><!+\-*/]+/, 'operator'],
          [/[()[\],.]/, 'delimiter'],
        ],
      },
    })

    monaco.languages.setLanguageConfiguration(PINE_LANGUAGE_ID, {
      comments: { lineComment: '//' },
      brackets: [['(', ')'], ['[', ']']],
      autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    })

    monaco.languages.registerCompletionItemProvider(PINE_LANGUAGE_ID, {
      triggerCharacters: ['.'],
      provideCompletionItems: (
        model: { getWordUntilPosition: (pos: unknown) => { startColumn: number; endColumn: number }; getLineContent: (line: number) => string },
        position: { lineNumber: number; column: number },
      ) => {
        const word = model.getWordUntilPosition(position)
        const line = model.getLineContent(position.lineNumber)
        const beforeCursor = line.substring(0, position.column - 1)
        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        }

        if (beforeCursor.endsWith('ta.')) {
          return {
            suggestions: ['ema', 'sma', 'rsi', 'macd', 'bb', 'atr', 'stoch', 'vwap', 'change', 'highest', 'lowest', 'tr', 'wma', 'stdev', 'rma', 'crossover', 'crossunder'].map(name => ({
              label: name,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${name}($0)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: `ta.${name}()`, range,
            })),
          }
        }
        if (beforeCursor.endsWith('strategy.')) {
          return {
            suggestions: ['entry', 'exit', 'close', 'long', 'short'].map(name => ({
              label: name,
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: `${name}("$1")`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: `strategy.${name}()`, range,
            })),
          }
        }
        if (beforeCursor.endsWith('input.')) {
          return {
            suggestions: ['int', 'float', 'bool', 'source'].map(name => ({
              label: name,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${name}($0)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: `input.${name}()`, range,
            })),
          }
        }
        return {
          suggestions: ['strategy', 'indicator', 'plot', 'hline', 'if', 'else', 'var', 'ta', 'input', 'close', 'open', 'high', 'low', 'volume', 'bar_index'].map(label => ({
            label, kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: label, range,
          })),
        }
      },
    })
  }

  // ── Dark theme ────────────────────────────────────────────────────────────
  // Always (re)define both themes — defineTheme is idempotent
  monaco.editor.defineTheme('pine-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.namespace',    foreground: '61AFEF', fontStyle: 'bold' },
      { token: 'keyword',              foreground: 'C678DD' },
      { token: 'variable.predefined',  foreground: 'E06C75' },
      { token: 'support.function',     foreground: '98C379' },
      { token: 'string',               foreground: '98C379' },
      { token: 'number',               foreground: 'D19A66' },
      { token: 'comment',              foreground: '5C6370', fontStyle: 'italic' },
      { token: 'operator',             foreground: '56B6C2' },
      { token: 'identifier',           foreground: 'ABB2BF' },
    ],
    colors: {
      'editor.background':                  '#0f172a',
      'editor.foreground':                  '#cbd5e1',
      'editor.lineHighlightBackground':     '#1e293b',
      'editorLineNumber.foreground':        '#334155',
      'editorLineNumber.activeForeground':  '#64748b',
      'editor.selectionBackground':         '#1e40af55',
      'editorCursor.foreground':            '#3b82f6',
      'editor.wordHighlightBackground':     '#1e293b',
      'editorWidget.background':            '#0f172a',
      'editorSuggestWidget.background':     '#1e293b',
      'editorSuggestWidget.border':         '#334155',
      'editorSuggestWidget.selectedBackground': '#1e40af',
    },
  })

  // ── Light theme ──────────────────────────────────────────────────────────
  monaco.editor.defineTheme('pine-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.namespace',    foreground: '1d4ed8', fontStyle: 'bold' },
      { token: 'keyword',              foreground: '7c3aed' },
      { token: 'variable.predefined',  foreground: 'be123c' },
      { token: 'support.function',     foreground: '15803d' },
      { token: 'string',               foreground: '166534' },
      { token: 'number',               foreground: 'b45309' },
      { token: 'comment',              foreground: '94a3b8', fontStyle: 'italic' },
      { token: 'operator',             foreground: '0891b2' },
      { token: 'identifier',           foreground: '1e293b' },
    ],
    colors: {
      'editor.background':                  '#ffffff',
      'editor.foreground':                  '#1e293b',
      'editor.lineHighlightBackground':     '#f8fafc',
      'editorLineNumber.foreground':        '#cbd5e1',
      'editorLineNumber.activeForeground':  '#64748b',
      'editor.selectionBackground':         '#bfdbfe',
      'editorCursor.foreground':            '#2563eb',
      'editor.wordHighlightBackground':     '#e0f2fe',
      'editorWidget.background':            '#ffffff',
      'editorSuggestWidget.background':     '#ffffff',
      'editorSuggestWidget.border':         '#e2e8f0',
      'editorSuggestWidget.selectedBackground': '#dbeafe',
    },
  })
}

// ─────────────────────────── Component ───────────────────────────────────────

interface PineEditorProps {
  height?: string
}

export function PineEditor({ height = '400px' }: PineEditorProps) {
  const source             = useEditorStore(s => s.source)
  const setSource          = useEditorStore(s => s.setSource)
  const setValidationResult = useEditorStore(s => s.setValidationResult)
  const setValidating      = useEditorStore(s => s.setValidating)
  const compilerErrors     = useEditorStore(s => s.compilerErrors)
  const isDark             = useThemeStore(s => s.theme) === 'dark'

  const editorRef     = useRef<editor.IStandaloneCodeEditor | null>(null)
  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const monacoTheme = isDark ? 'pine-dark' : 'pine-light'

  // beforeMount: define themes BEFORE editor initialises so the theme prop works immediately
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    setupMonaco(monaco)
  }, [])

  const handleEditorMount: OnMount = useCallback((ed) => {
    editorRef.current = ed
  }, [])

  // Sync compiler errors → Monaco red/yellow gutter markers
  useEffect(() => {
    const ed = editorRef.current
    if (!ed) return
    // Access monaco via the global (it's always loaded by @monaco-editor/react)
    const monaco = (window as unknown as { monaco?: Monaco }).monaco
    if (!monaco) return
    const model = ed.getModel()
    if (!model) return
    monaco.editor.setModelMarkers(model, 'pine-validator',
      compilerErrors.map(err => ({
        severity: err.severity === 'error'
          ? monaco.MarkerSeverity.Error
          : monaco.MarkerSeverity.Warning,
        startLineNumber: err.line || 1,
        startColumn:     err.col  || 1,
        endLineNumber:   err.line || 1,
        endColumn:       (err.col || 1) + 10,
        message:         err.message,
        source:          err.source,
      })),
    )
  }, [compilerErrors])

  // Debounced real-time validation
  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return
      setSource(value)
      if (validateTimer.current) clearTimeout(validateTimer.current)
      validateTimer.current = setTimeout(async () => {
        if (!value.trim()) { setValidationResult(null); return }
        setValidating(true)
        try {
          const result = await scriptApi.validate({ source: value })
          setValidationResult(result)
        } catch { /* ignore network errors */ }
        finally { setValidating(false) }
      }, 800)
    },
    [setSource, setValidationResult, setValidating],
  )

  const errorCount = compilerErrors.filter(e => e.severity === 'error').length
  const warnCount  = compilerErrors.filter(e => e.severity === 'warning').length

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-dark-800">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-950 border-b border-dark-800">
        <span className="text-xs font-mono text-dark-400">Pine Script v5 (compatible subset)</span>
        <div className="flex gap-2 items-center">
          {errorCount > 0 && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-xs text-yellow-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              {warnCount} warning{warnCount !== 1 ? 's' : ''}
            </span>
          )}
          {errorCount === 0 && warnCount === 0 && source.trim() && (
            <span className="text-xs text-positive flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              Valid
            </span>
          )}
        </div>
      </div>

      <Editor
        height={height}
        language={PINE_LANGUAGE_ID}
        value={source}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        theme={monacoTheme}
        options={{
          minimap:              { enabled: false },
          fontSize:             13,
          fontFamily:           '"JetBrains Mono", "Fira Code", monospace',
          fontLigatures:        true,
          lineNumbers:          'on',
          scrollBeyondLastLine: false,
          automaticLayout:      true,
          tabSize:              4,
          insertSpaces:         true,
          wordWrap:             'on',
          renderWhitespace:     'selection',
          cursorBlinking:       'smooth',
          smoothScrolling:      true,
          padding:              { top: 12, bottom: 12 },
          scrollbar:            { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
        }}
      />
    </div>
  )
}
