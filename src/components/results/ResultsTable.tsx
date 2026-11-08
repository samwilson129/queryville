import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ResultsTableProps {
  columns: string[]
  rows: unknown[][]
  rowCount: number
  executionTimeMs: number
  error?: string
}

export function ResultsTable({ columns, rows, rowCount, executionTimeMs, error }: ResultsTableProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-danger shrink-0">!</div>
          <div className="text-sm text-danger">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="border-b border-border bg-surface-hover px-4 py-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="font-mono">{rows.length}</span>
          <span>rows</span>
          <span className="hidden md:inline">•</span>
          <span className="font-mono">{rowCount}</span>
          <span className="hidden md:inline">total</span>
          <span className="hidden md:inline">•</span>
          <span className="font-mono">{executionTimeMs.toFixed(0)} ms</span>
        </div>
      </div>
      <div className="overflow-auto max-h-[64vh]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="text-xs text-muted uppercase tracking-wider font-medium">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rIdx) => (
              <TableRow key={rIdx}>
                {row.map((cell, cIdx) => (
                  <TableCell key={cIdx} className="text-xs font-mono text-text">
                    {cell === null || cell === undefined ? (
                      <span className="text-dim italic">NULL</span>
                    ) : (
                      String(cell)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
