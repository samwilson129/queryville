import { useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"
import { sql } from "@codemirror/lang-sql"
import { lineNumbers } from "@codemirror/view"
import { highlightSelectionMatches } from "@codemirror/search"
import { defaultKeymap } from "@codemirror/commands"

interface SQLEditorProps {
  value: string
  onChange: (sql: string) => void
  onRun?: () => void
  readOnly?: boolean
}

/**
 * CodeMirror 6 SQL editor with line numbers, syntax highlighting, and a dark theme.
 * Runs Ctrl+Enter / Cmd+Enter to trigger onRun.
 */
export function SQLEditor({ value, onChange, onRun, readOnly = false }: SQLEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onRunRef = useRef(onRun)
  onChangeRef.current = onChange
  onRunRef.current = onRun

  useEffect(() => {
    if (!editorRef.current) return

    const runHandler = () => {
      onRunRef.current?.()
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        sql(),
        oneDark,
        highlightSelectionMatches(),
        EditorState.readOnly.of(readOnly),
        EditorState.allowMultipleSelections.of(true),
        keymap.of([
          { key: "Mod-Enter", run: () => { runHandler(); return true } },
          ...defaultKeymap,
        ]),
        EditorView.updateListener.of((upd) => {
          if (upd.docChanged) {
            onChangeRef.current(upd.state.doc.toString())
          }
        }),
      ],
    })

    const view = new EditorView({ state, parent: editorRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [value, readOnly])

  return <div className="h-full w-full" ref={editorRef} />
}
