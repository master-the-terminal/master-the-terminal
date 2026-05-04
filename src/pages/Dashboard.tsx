import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { BookOpen, CheckCircle, Clock, ArrowRight, Terminal, GitBranch, Server, Database, Rocket, Shield, FolderGit2 } from 'lucide-react'

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true })
  const { data: stats, isLoading: statsLoading } = trpc.progress.myStats.useQuery(undefined, { enabled: isAuthenticated })
  const { data: progressData } = trpc.progress.myProgress.useQuery(undefined, { enabled: isAuthenticated, retry: false })
  const { data: courses } = trpc.course.list.useQuery()

  if (authLoading || statsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  const completedLessons = stats?.completedLessons ?? 0
  const totalLessons = stats?.totalLessons ?? 1
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)

  const courseProgressMap = new Map((stats?.courseProgress ?? []).map(cp => [cp.courseId, cp.completed]))

  const courseIcons: Record<string, any> = {
    'terminal-mastery': Terminal,
    'git-github': GitBranch,
    'backend-hono': Server,
    'database-drizzle': Database,
    'deployment-devops': Rocket,
    'authentication': Shield,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-white/50 font-mono">$ whoami <span className="text-emerald-400">{user?.role ?? 'student'}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6 terminal-glow">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-mono text-white/40">Lessons</span>
          </div>
          <div className="text-3xl font-bold text-white">{completedLessons}/{totalLessons}</div>
          <div className="text-sm text-white/50 mt-1">Completed</div>
        </div>
        <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6 terminal-glow-purple">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-mono text-white/40">Progress</span>
          </div>
          <div className="text-3xl font-bold text-white">{progressPercent}%</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-3">
            <div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6 terminal-glow-pink">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-yellow-400" />
            <span className="text-xs font-mono text-white/40">Streak</span>
          </div>
          <div className="text-3xl font-bold text-white">1</div>
          <div className="text-sm text-white/50 mt-1">Day streak</div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-6">Course Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses?.map(course => {
            const Icon = courseIcons[course.slug] ?? Terminal
            const completed = courseProgressMap.get(course.id) ?? 0
            const total = 5 // Each course has 5 lessons
            const pct = Math.round((completed / total) * 100)
            return (
              <Link key={course.id} to={`/courses/${course.slug}`} className="rounded-md border border-white/[0.06] bg-[#080808] p-5 hover:bg-white/[0.02] hover:border-white/[0.10] transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${course.color}15`, border: `1px solid ${course.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: course.color || '#34D399' }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-2">
                  <span>{completed}/{total} lessons</span>
                  <span className={pct === 100 ? 'text-emerald-400' : ''}>{pct}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#34D399' : (course.color || '#34D399') }} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Hands-on Projects</h2>
          <Link to="/projects" className="text-sm text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { slug: 'terminal-cheatsheet-app', title: 'Terminal Cheatsheet CLI App', difficulty: 'Beginner', course: 'Terminal Mastery', color: '#34D399' },
            { slug: 'git-history-visualizer', title: 'Git History Visualizer', difficulty: 'Intermediate', course: 'Git & GitHub', color: '#A855F7' },
            { slug: 'hono-api-boilerplate', title: 'Production Hono API Boilerplate', difficulty: 'Advanced', course: 'Backend Hono', color: '#F472B6' },
            { slug: 'personal-devops-dashboard', title: 'Personal DevOps Dashboard', difficulty: 'Advanced', course: 'Deployment & DevOps', color: '#FBBF24' },
          ].map(project => (
            <Link key={project.slug} to={`/projects/${project.slug}`} className="rounded-md border border-white/[0.06] bg-[#080808] p-5 hover:bg-white/[0.02] hover:border-white/[0.10] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}15`, border: `1px solid ${project.color}30` }}>
                  <FolderGit2 className="w-5 h-5" style={{ color: project.color }} />
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  project.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                  project.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {project.difficulty}
                </span>
              </div>
              <h3 className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors mb-1">{project.title}</h3>
              <p className="text-white/30 text-xs font-mono">{project.course}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link to="/courses" className="text-sm text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1">
            Continue Learning <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {progressData && progressData.length > 0 ? (
          <div className="space-y-3">
            {progressData.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/60 truncate min-w-0">
                  <span className="text-white/80">{p.lessonTitle || 'Lesson'}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-white/40">{p.courseTitle || 'Course'}</span>
                </span>
                <span className="text-white/30 font-mono text-xs ml-auto shrink-0">{p.completedAt ? new Date(p.completedAt).toLocaleDateString() : 'Today'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/40 text-sm">No activity yet. Start learning!</p>
        )}
      </div>
    </div>
  )
}
