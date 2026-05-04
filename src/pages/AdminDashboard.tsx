import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Shield, Users, BookOpen, CreditCard, Activity, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true })
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === 'superadmin' })
  const { data: usersList } = trpc.admin.listUsers.useQuery(undefined, { enabled: user?.role === 'superadmin' })

  if (authLoading) return <div className="py-20 text-center text-white/50">Loading...</div>
  
  if (user?.role !== 'superadmin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-white/50">This area is restricted to superadmin users only.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/dashboard" className="text-white/40 hover:text-white text-sm font-mono flex items-center gap-1 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> cd ../dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/50 font-mono">$ sudo admin --stats <span className="text-purple-400"># restricted area</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Users', value: stats?.users ?? 0, icon: Users, color: 'text-cyan-400' },
          { label: 'Courses', value: stats?.courses ?? 0, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Lessons', value: stats?.lessons ?? 0, icon: BookOpen, color: 'text-purple-400' },
          { label: 'Payments', value: stats?.payments ?? 0, icon: CreditCard, color: 'text-yellow-400' },
          { label: 'Progress', value: stats?.progressEntries ?? 0, icon: Activity, color: 'text-pink-400' },
        ].map(stat => (
          <div key={stat.label} className="rounded-md border border-white/[0.06] bg-[#080808] p-5 terminal-glow">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs font-mono text-white/40">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" /> All Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-white/40 font-mono">ID</th>
                <th className="pb-3 text-white/40 font-mono">Name</th>
                <th className="pb-3 text-white/40 font-mono">Email</th>
                <th className="pb-3 text-white/40 font-mono">Role</th>
                <th className="pb-3 text-white/40 font-mono">Joined</th>
              </tr>
            </thead>
            <tbody>
              {usersList?.map(u => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-3 text-white/60 font-mono">{u.id}</td>
                  <td className="py-3 text-white">{u.name ?? 'N/A'}</td>
                  <td className="py-3 text-white/60">{u.email ?? 'N/A'}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded font-mono ${
                      u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/40'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-white/40 font-mono text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
