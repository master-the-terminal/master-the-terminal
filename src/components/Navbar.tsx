import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Terminal, Menu, X, User, LayoutDashboard, BookOpen, FolderGit2, Database, LogOut, Shield } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  const navLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/knowledgebase', label: 'Knowledgebase', icon: Database },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Terminal className="w-6 h-6 text-emerald-400 group-hover:terminal-glow transition-all" />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-white">master</span>
              <span className="text-emerald-400">_the</span>
              <span className="text-cyan-400">_terminal</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link flex items-center gap-1.5 ${isActive(link.to) ? 'text-white' : ''}`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className={`nav-link flex items-center gap-1.5 ${isActive('/dashboard') ? 'text-white' : ''}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user?.role === 'superadmin' && (
                  <Link to="/admin" className={`nav-link flex items-center gap-1.5 ${isActive('/admin') ? 'text-white' : ''}`}>
                    <Shield className="w-4 h-4 text-purple-400" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.avatar && (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                )}
                <span className="text-sm text-white/70">{user?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 text-white/70 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user?.role === 'superadmin' && (
                  <Link to="/admin" className="flex items-center gap-2 text-white/70 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
                    <Shield className="w-4 h-4 text-purple-400" /> Admin
                  </Link>
                )}
              </>
            )}
            {isAuthenticated ? (
              <button onClick={logout} className="flex items-center gap-2 text-red-400 py-2 w-full">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-emerald-400 py-2" onClick={() => setMobileOpen(false)}>
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
