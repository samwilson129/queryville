export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent selection:text-[rgba(0,16,24,1)]">
      {children}
    </div>
  )
}
