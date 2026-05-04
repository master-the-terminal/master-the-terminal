import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Terminal, ArrowRight, BookOpen, FolderGit2, Database, Clock, Award, Users, Zap, ChevronRight, Sparkles, Lock, Globe, Server, GitBranch } from 'lucide-react'
import { useState, useEffect } from 'react'

function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => prev + text[index])
        setIndex(index + 1)
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [index, text, speed])

  return (
    <span className="font-mono">
      {displayed}
      <span className="cursor-blink text-emerald-400">|</span>
    </span>
  )
}

function AnimatedCounter({ target, label, icon: Icon, color }: { target: number; label: string; icon: any; color: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCount(c => {
          if (c >= target) { clearInterval(interval); return target }
          return c + 1
        })
      }, 80)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [target])

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{count}</div>
      <div className="text-[11px] text-white/40 font-mono uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}

export default function Home() {
  const { data: courses } = trpc.course.list.useQuery()

  const courseIcons: Record<string, any> = {
    'terminal-mastery': Terminal,
    'git-github': GitBranch,
    'backend-hono': Server,
    'database-drizzle': Database,
    'deployment-devops': Globe,
    'authentication': Lock,
  }

  return (
    <div className="bg-[#050505]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(52,211,153,0.07),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(168,85,247,0.05),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[85vh] py-16">
            {/* Left: Copy */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400/80 text-[11px] font-mono mb-6">
                <Zap className="w-3 h-3" />
                Now with interactive terminal simulator
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="text-white">Master the</span>
                <br />
                <span className="text-emerald-400">Terminal.</span>
                <br />
                <span className="text-white/30 text-3xl sm:text-4xl lg:text-5xl font-semibold">Become job-ready.</span>
              </h1>

              <p className="text-base sm:text-lg text-white/50 mb-3 font-mono">
                <TypewriterText text="curl https://mastertheterminal.com/api/job-ready" speed={50} />
              </p>

              <p className="text-white/40 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
                The premium course platform taking developers from zero to production-grade fullstack engineer.
                Terminal, Git, backend APIs, databases, deployment, and authentication.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link to="/courses">
                  <Button size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold px-6 h-11">
                    Explore Courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/knowledgebase">
                  <Button size="lg" variant="outline" className="border-white/[0.12] text-white/70 hover:bg-white/[0.04] hover:text-white px-6 h-11 bg-transparent">
                    <Database className="w-4 h-4 mr-2" />
                    Free Knowledgebase
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-10 pt-8 border-t border-white/[0.04] grid grid-cols-4 gap-4 max-w-md">
                <AnimatedCounter target={6} label="Courses" icon={BookOpen} color="#34D399" />
                <AnimatedCounter target={30} label="Lessons" icon={FolderGit2} color="#A855F7" />
                <AnimatedCounter target={4} label="Projects" icon={Award} color="#F472B6" />
                <AnimatedCounter target={28} label="Hours" icon={Clock} color="#FBBF24" />
              </div>
            </div>

            {/* Right: Terminal mockup */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg">
                <div className="rounded-lg border border-white/[0.08] bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-emerald-500/5">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                    <span className="ml-4 text-[11px] text-white/30 font-mono">master@terminal:~</span>
                  </div>
                  {/* Terminal body */}
                  <div className="p-5 font-mono text-[13px] leading-[1.8]">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500/70 shrink-0 select-none">$</span>
                      <span className="text-emerald-400/90">whoami</span>
                    </div>
                    <div className="text-white/30 mb-1">aspiring-fullstack-dev</div>

                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500/70 shrink-0 select-none">$</span>
                      <span className="text-emerald-400/90">curl /api/courses</span>
                    </div>
                    <div className="text-emerald-300/50 text-xs mb-1">{'{ courses: 6, lessons: 30 }'}</div>

                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500/70 shrink-0 select-none">$</span>
                      <span className="text-emerald-400/90">git status</span>
                    </div>
                    <div className="text-white/30 text-xs mb-1">On branch main / nothing to commit</div>

                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500/70 shrink-0 select-none">$</span>
                      <span className="text-emerald-400/90">docker compose up career</span>
                    </div>
                    <div className="text-emerald-300/40 text-xs mb-1">[+] Container career running</div>

                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500/70 shrink-0 select-none">$</span>
                      <span className="text-emerald-400/90">hono start --port 3000</span>
                    </div>
                    <div className="text-emerald-300/40 text-xs mb-1">Listening on http://localhost:3000</div>

                    <div className="flex items-start gap-2 mt-1">
                      <span className="text-emerald-500/70 shrink-0 select-none">$</span>
                      <span className="cursor-blink text-emerald-400">|</span>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="flex justify-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-white/[0.06] text-[10px] text-white/40 font-mono">
                    <Terminal className="w-3 h-3 text-emerald-400/60" />
                    Interactive
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-white/[0.06] text-[10px] text-white/40 font-mono">
                    <Sparkles className="w-3 h-3 text-purple-400/60" />
                    Hands-on
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-white/[0.06] text-[10px] text-white/40 font-mono">
                    <Globe className="w-3 h-3 text-cyan-400/60" />
                    Job Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE GRID ── */}
      <section className="py-20 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-emerald-400/60 font-mono text-[11px] uppercase tracking-widest mb-2">Curriculum</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">6 carefully crafted courses</h2>
            </div>
            <Link to="/courses" className="text-white/40 hover:text-emerald-400 text-xs font-mono flex items-center gap-1 transition-colors">
              View all courses <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses?.map((course, idx) => {
              const Icon = courseIcons[course.slug] || Terminal
              return (
                <Link key={course.id} to={`/courses/${course.slug}`} className="group">
                  <div className="relative rounded-lg border border-white/[0.06] bg-[#080808] p-5 h-full hover:border-white/[0.12] hover:bg-[#0a0a0a] transition-all duration-300">
                    {/* Number indicator */}
                    <div className="absolute top-4 right-4 text-[10px] font-mono text-white/[0.08]">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${course.color}15`, border: `1px solid ${course.color}30` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: course.color || '#34D399' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5">5 lessons / 2 free</p>
                      </div>
                    </div>

                    <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">
                      {course.shortDescription}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/25 group-hover:text-emerald-400/60 transition-colors">
                      <span>Start course</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-400/60 font-mono text-[11px] uppercase tracking-widest mb-2">Why us</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Built for real-world skills</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Terminal, title: 'Interactive Terminal', desc: 'Real VFS-backed terminal with lesson-specific filesystems and SSH-style sessions.', color: '#34D399' },
              { icon: FolderGit2, title: 'Project-Based', desc: 'Apply what you learn through hands-on projects that mirror real production workflows.', color: '#A855F7' },
              { icon: Award, title: 'Job-Ready Stack', desc: 'Terminal, Git, Hono, Drizzle, Docker, Nginx, OAuth — the modern fullstack toolkit.', color: '#F472B6' },
              { icon: Users, title: 'Lifetime Access', desc: 'Pay once, keep forever. All future course updates included at no extra cost.', color: '#FBBF24' },
            ].map((f, i) => (
              <div key={i} className="rounded-lg border border-white/[0.06] bg-[#080808] p-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  <f.icon className="w-4 h-4" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.04),transparent_70%)]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-lg border border-white/[0.08] bg-[#080808] p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Ready to level up?</h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              First 2 lessons of every course are completely free. Unlock all 30 lessons + 4 hands-on projects for a one-time payment of R299.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/courses">
                <Button size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold px-8 h-11">
                  Start Learning Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-white/20 text-[11px] font-mono mt-5">No subscription. No recurring fees. Lifetime access.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
