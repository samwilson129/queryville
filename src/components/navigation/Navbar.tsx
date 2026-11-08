import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Home as HomeIcon, Route, BarChart3 } from "lucide-react"
import { useProgress } from "@/hooks/useProgress"
import { cn } from "@/utils/cn"

const nav = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/roadmaps", label: "Roadmaps", icon: Route },
  { href: "/progress", label: "My Progress", icon: BarChart3 },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { xp, getRank } = useProgress()
  const [open, setOpen] = React.useState(false)
  const rank = getRank()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-accent/10 px-3 py-1.5 text-accent font-medium text-sm hover:bg-accent/20 transition">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Queryville
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {nav.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted hover:text-text hover:bg-surface-hover"
                )}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-muted text-xs">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            {xp} XP <span className="text-text">• {rank.title}</span>
          </div>
          <button
            className="md:hidden p-2 text-muted hover:text-text"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-40 bg-surface/90 backdrop-blur-lg" onClick={() => setOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-full max-w-xs p-6 border-l border-border shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Menu</span>
              <button className="p-1" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              {nav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => { navigate(item.href); setOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left font-medium transition",
                    location.pathname === item.href
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-text hover:bg-surface-hover"
                  )}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </button>
              ))}
              <div className="pt-6 border-t border-border">
                <div className="text-xs text-dim uppercase tracking-wider mb-3">Progress</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">{xp} XP</span>
                  <span className="ml-auto text-text">{rank.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
