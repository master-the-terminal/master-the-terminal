import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  CheckCircle, Lock, Loader2, ChevronLeft, ChevronRight,
  BookOpen, Play, Terminal as TerminalIcon, HelpCircle,
  Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ── types ── */
interface QuizQuestion { question: string; options: string[]; correct: number; explanation: string }
interface LessonNode { id: number; title: string; slug: string; isFree: boolean }
function safeJsonParse<T>(v: unknown): T | null { if (!v) return null; if (typeof v === 'string') { try { return JSON.parse(v) as T } catch { return null } } return v as T }
function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(' ') }

/* ── HTML renderer ── */
function htmlToReact(html: string): React.ReactNode {
  const doc = new DOMParser().parseFromString(`<r>${html}</r>`, 'text/html')
  const root = doc.querySelector('r')
  if (!root) return null
  return walk(root.childNodes)
}
function walk(nodes: NodeListOf<ChildNode>): React.ReactNode[] {
  return Array.from(nodes).map((n, i) => nodeToEl(n, i)).filter(Boolean)
}
function nodeToEl(n: Node, k: number): React.ReactNode {
  if (n.nodeType === Node.TEXT_NODE) return n.textContent?.trim() || null
  if (n.nodeType !== Node.ELEMENT_NODE) return null
  const e = n as HTMLElement, tag = e.tagName.toLowerCase(), kids = walk(e.childNodes)
  switch (tag) {
    case 'h2': return <h2 key={k} className="text-lg sm:text-xl font-bold text-white mt-8 mb-3 tracking-tight">{kids}</h2>
    case 'h3': return <h3 key={k} className="text-base font-semibold text-white/85 mt-6 mb-2 flex items-center gap-2"><span className="w-1 h-4 bg-emerald-500/50 rounded-full inline-block shrink-0" />{kids}</h3>
    case 'p': return <p key={k} className="text-white/55 leading-[1.7] mb-3 text-sm sm:text-[15px]">{kids}</p>
    case 'ul': return <ul key={k} className="space-y-1.5 mb-4 ml-0.5">{kids}</ul>
    case 'li': return <li key={k} className="text-white/50 text-sm leading-[1.7] flex items-start gap-2"><span className="text-emerald-500/40 mt-1.5 shrink-0 text-[10px]">&gt;</span><span>{kids}</span></li>
    case 'ol': { let idx = 0; return <ol key={k} className="space-y-1.5 mb-4 ml-0.5">{Array.from(e.childNodes).map((c, ci) => { if (c.nodeType !== Node.ELEMENT_NODE || (c as HTMLElement).tagName.toLowerCase() !== 'li') return null; idx++; return <li key={ci} className="text-white/50 text-sm leading-[1.7] flex items-start gap-2"><span className="text-emerald-500/30 font-mono text-[10px] mt-1 shrink-0 w-4">{String(idx).padStart(2,'0')}</span><span>{walk(c.childNodes)}</span></li> })}</ol> }
    case 'pre': return <CodeBlock key={k} text={e.textContent || ''} />
    case 'code': return <code key={k} className="text-emerald-400/80 bg-emerald-500/[0.07] px-1 py-0.5 rounded text-[11px] sm:text-[13px] font-mono break-words">{e.textContent}</code>
    case 'strong': return <strong key={k} className="text-white/85 font-semibold">{kids}</strong>
    case 'em': return <em key={k} className="text-white/70 italic">{kids}</em>
    case 'a': return <a key={k} href={e.getAttribute('href')||'#'} className="text-emerald-400/70 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500/20">{kids}</a>
    case 'blockquote': return <blockquote key={k} className="border-l-2 border-emerald-500/20 pl-3 my-3 text-white/40 italic text-sm">{kids}</blockquote>
    case 'br': return <br key={k} />
    case 'hr': return <hr key={k} className="border-white/[0.05] my-6" />
    default: return <span key={k}>{kids}</span>
  }
}

/* ── code block ── */
function CodeBlock({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  return (
    <div className="my-4 rounded-md overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.05]">
        <div className="w-2 h-2 rounded-full bg-red-500/30" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
        <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
      </div>
      <div className="p-3 sm:p-4 font-mono text-[11px] sm:text-[13px] leading-[1.8] overflow-x-auto">
        {lines.map((line, i) => {
          const t = line.trimStart()
          if (t.startsWith('$ ')) return <div key={i} className="flex items-start gap-2 min-w-max"><span className="text-emerald-500/70 shrink-0 select-none">$</span><span className="text-emerald-400/85">{t.slice(2)}</span></div>
          if (t.startsWith('#')) return <div key={i} className="text-white/20 min-w-max">{line}</div>
          if (line.includes('#')) { const x = line.indexOf('#'); return <div key={i} className="min-w-max"><span className="text-white/60 whitespace-pre">{line.slice(0,x)}</span><span className="text-white/20 whitespace-pre">{line.slice(x)}</span></div> }
          return <div key={i} className="text-white/40 whitespace-pre min-w-max">{line}</div>
        })}
      </div>
    </div>
  )
}

/* ── typewriter demo ── */
function TypewriterDemo({ steps }: { steps: string[] }) {
  const [line, setLine] = useState(0), [txt, setTxt] = useState(''), [out, setOut] = useState(false), [done, setDone] = useState(false)
  useEffect(() => { if (done) return; const s = steps[line]; if (!s) { setDone(true); return }; if (s.startsWith('$')) { const c = s.slice(2); let i = 0; const t = setInterval(() => { i++; setTxt(c.slice(0,i)); if (i >= c.length) { clearInterval(t); setTimeout(() => { setOut(true); setTimeout(() => { setLine(p=>p+1); setTxt(''); setOut(false) }, 700) }, 350) } }, 38); return () => clearInterval(t) } else { setOut(true); const tm = setTimeout(() => { setLine(p=>p+1); setOut(false) }, 550); return () => clearTimeout(tm) } }, [line, steps, done])
  const vis = steps.slice(0, line + 1)
  return (
    <div className="my-4 rounded-md overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.05]"><div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-emerald-500/30" /></div>
      <div className="p-3 sm:p-4 font-mono text-[11px] sm:text-[13px] leading-[1.8] min-h-[200px]">
        {vis.map((s, i) => { if (i === line && !out && s.startsWith('$')) return <div key={i} className="flex items-start gap-2"><span className="text-emerald-500/70 shrink-0 select-none">$</span><span className="text-emerald-400/85">{txt}<span className="cursor-blink text-emerald-400">|</span></span></div>; if (s.startsWith('$')) return <div key={i} className="flex items-start gap-2"><span className="text-emerald-500/70 shrink-0 select-none">$</span><span className="text-emerald-400/85">{s.slice(2)}</span></div>; return <div key={i} className="text-white/30">{s}</div> })}
        {done && <div className="flex items-start gap-2 mt-1"><span className="text-emerald-500/70 shrink-0 select-none">$</span><span className="cursor-blink text-emerald-400">|</span></div>}
      </div>
    </div>
  )
}

/* ── interactive terminal (VFS-backed) ── */
import { VFS, getTerminalPreset } from '@/lib/vfs'

function TerminalSimulator({ slug }: { slug: string }) {
  const preset = getTerminalPreset(slug)
  const [lines, setLines] = useState<{ type: 'prompt' | 'output'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [allDone, setAllDone] = useState(false)
  const [vfs] = useState(() => new VFS(preset.hostname, 'user', preset.files))
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines, completed])

  const checkTasks = () => {
    const newlyDone = new Set<number>()
    preset.tasks.forEach((task, i) => {
      if (!completed.has(i) && task.check(vfs)) {
        newlyDone.add(i)
      }
    })
    if (newlyDone.size > 0) {
      setCompleted(prev => {
        const next = new Set(prev)
        newlyDone.forEach(i => next.add(i))
        if (next.size === preset.tasks.length && !allDone) {
          setAllDone(true)
        }
        return next
      })
    }
  }

  const run = (cmdline: string) => {
    const trimmed = cmdline.trim()
    const out = vfs.exec(trimmed)

    if (out === '__CLEAR__') {
      setLines([{ type: 'prompt', text: '' }])
      return
    }

    const newLines: { type: 'prompt' | 'output'; text: string }[] = []
    newLines.push({ type: 'prompt', text: trimmed })
    if (out) {
      out.split('\n').forEach(line => newLines.push({ type: 'output', text: line }))
    }

    setLines(prev => [...prev, ...newLines])

    // Check tasks after command executes
    requestAnimationFrame(() => {
      checkTasks()
    })
  }

  return (
    <div className="my-4 rounded-md overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.05]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        <span className="ml-3 text-[11px] text-white/25 font-mono select-none">{vfs.hostname} — ssh</span>
      </div>

      {/* Terminal scroll area */}
      <div className="p-4 h-[380px] overflow-y-auto font-mono text-[12px] sm:text-[13px] leading-[1.85]">
        {/* Welcome header */}
        <div className="text-white/60 font-semibold tracking-wide">  Master The Terminal — Practice Session</div>
        <div className="text-emerald-500/50">  host: {preset.hostname}</div>
        <div className="h-[6px]" />
        <div className="text-emerald-400/70 font-semibold">  OBJECTIVE</div>
        <div className="text-white/40">  {preset.objective}</div>
        <div className="h-[6px]" />
        <div className="text-white/20 text-[11px]">  Type commands to explore the filesystem and complete the tasks below.</div>
        <div className="h-[6px]" />

        {/* Tasks */}
        {preset.tasks.map((task, i) => {
          const done = completed.has(i)
          return (
            <div key={i} className={done ? 'text-emerald-400/60' : 'text-white/35'}>
              <span className={done ? 'text-emerald-400/80 mr-1' : 'text-white/20 mr-1'}>{done ? '[✓]' : '[ ]'}</span>
              <span className={done ? 'line-through opacity-60' : ''}>{i + 1}. {task.description}</span>
            </div>
          )
        })}

        {/* Success banner */}
        {allDone && (
          <>
            <div className="h-[6px]" />
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2">
              <div className="text-emerald-400 font-semibold text-[12px]">  MISSION COMPLETE — All tasks done!</div>
              <div className="text-emerald-400/50 text-[11px]">  Well done. You can keep exploring or move to the next lesson.</div>
            </div>
          </>
        )}

        <div className="h-[6px]" />
        <div className="text-white/15 text-[11px]">  Tip: ls, cat, mkdir, touch, cp, rm, cd, tree, pwd, help</div>
        <div className="h-[6px]" />

        {/* Command history */}
        {lines.map((line, i) => {
          if (line.type === 'prompt') {
            return (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-500/60 shrink-0 select-none">$</span>
                <span className="text-emerald-400/85">{line.text}</span>
              </div>
            )
          }
          return <div key={i} className="text-white/35 whitespace-pre-wrap break-words">{line.text}</div>
        })}

        {/* Active prompt */}
        <div className="flex items-start gap-1.5">
          <span className="text-emerald-500/60 shrink-0 select-none">$</span>
          <span className="cursor-blink text-emerald-400">|</span>
        </div>

        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={e => { e.preventDefault(); run(input); setInput('') }}
        className="flex items-center border-t border-white/[0.06] px-4 py-2.5"
      >
        <span className="text-emerald-500/50 font-mono mr-2 text-[12px] sm:text-[13px] select-none shrink-0">$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-grow bg-transparent text-emerald-400/90 font-mono text-[12px] sm:text-[13px] outline-none placeholder:text-white/10 min-w-0"
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </div>
  )
}

/* ── quiz ── */
function QuizComponent({ quiz }: { quiz: QuizQuestion[] }) {
  const [q, setQ] = useState(0), [sel, setSel] = useState<number|null>(null), [show, setShow] = useState(false), [score, setScore] = useState(0), [done, setDone] = useState(false)
  const cur = quiz[q]; if (!cur) return null
  const ans = (i: number) => { if (show) return; setSel(i); setShow(true); if (i === cur.correct) setScore(s=>s+1) }
  const next = () => { if (q + 1 >= quiz.length) setDone(true); else { setQ(c=>c+1); setSel(null); setShow(false) } }
  if (done) { const pct = Math.round((score / quiz.length) * 100); return <div className="my-4 rounded-md border border-white/[0.06] bg-[#080808] p-6 sm:p-8 text-center"><div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-6 h-6 text-emerald-400" /></div><h3 className="text-lg font-bold text-white mb-1">Quiz Complete</h3><p className="text-white/30 font-mono text-xs mb-1">{score}/{quiz.length} correct</p><p className="text-emerald-400 font-mono text-xl font-bold">{pct}%</p><p className="text-white/25 text-xs mt-2">{pct === 100 ? 'Perfect score.' : 'Review and try again.'}</p></div> }
  return (
    <div className="my-4 rounded-md border border-white/[0.06] bg-[#080808] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-5 text-[11px] font-mono"><span className="text-white/20">Q{q+1}/{quiz.length}</span><span className="text-emerald-400/50">{score} pts</span></div>
      <p className="text-white/75 text-sm leading-relaxed mb-5">{cur.question}</p>
      <div className="space-y-2">{cur.options.map((opt, i) => (<button key={i} onClick={()=>ans(i)} className={cn('w-full text-left px-3.5 py-2.5 rounded-md border text-[12px] sm:text-[13px] font-mono transition-all',show ? i===cur.correct?'border-emerald-500/25 bg-emerald-500/[0.05] text-emerald-400':i===sel?'border-red-500/25 bg-red-500/[0.05] text-red-400':'border-white/[0.04] bg-white/[0.015] text-white/20':'border-white/[0.05] bg-white/[0.02] text-white/55 hover:bg-white/[0.04]')}><span className="text-white/15 mr-2">{String.fromCharCode(97+i)}.</span>{opt}</button>))}</div>
      {show && <div className="mt-4 pt-4 border-t border-white/[0.05]"><p className="text-xs text-white/40 leading-relaxed">{cur.explanation}</p><Button onClick={next} className="mt-3 bg-emerald-500 text-black hover:bg-emerald-400 text-[11px] h-7 px-3">{q+1 >= quiz.length ? 'Finish' : 'Next'}</Button></div>}
    </div>
  )
}

/* ── exercises ── */
function ExercisesSection({ exercises }: { exercises: string[] }) {
  if (!exercises.length) return null
  return <div className="mt-8 pt-6 border-t border-white/[0.05]"><h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-purple-500/40 rounded-full inline-block shrink-0" />Exercises</h3><ol className="space-y-2">{exercises.map((ex,i)=><li key={i} className="flex items-start gap-2.5 text-sm text-white/45 leading-relaxed"><span className="text-emerald-500/25 font-mono text-[10px] mt-0.5 shrink-0 w-5">{String(i+1).padStart(2,'0')}</span>{ex}</li>)}</ol></div>
}

/* ── mobile sidebar drawer ── */
function MobileLessonDrawer({
  open, onClose, lessons, currentSlug, courseSlug, completedIds
}: {
  open: boolean; onClose: () => void; lessons: LessonNode[]; currentSlug: string; courseSlug: string; completedIds: Set<number>
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0a0a0a] border-r border-white/[0.08] z-50 md:hidden overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Lessons</span>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-2 space-y-0.5">{lessons.map((l, idx) => {
          const active = l.slug === currentSlug
          const done = completedIds.has(l.id)
          return <Link key={l.id} to={`/courses/${courseSlug}/lessons/${l.slug}`} onClick={onClose} className={cn('flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] transition-all',active?'bg-white/[0.06] text-white':'text-white/40 hover:bg-white/[0.03] hover:text-white/60')}><span className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-mono',done?'bg-emerald-500/15 text-emerald-400':active?'bg-white/10 text-white/50':'bg-white/[0.03] text-white/20')}>{done?<CheckCircle className="w-3 h-3" />:String(idx+1).padStart(2,'0')}</span><span className="truncate leading-tight">{l.title}</span>{!l.isFree&&<Lock className="w-2.5 h-2.5 text-white/10 shrink-0 ml-auto" />}</Link>
        })}</div>
      </div>
    </>
  )
}

/* ── desktop sidebar ── */
function DesktopSidebar({ lessons, currentSlug, courseSlug, completedIds }: {
  lessons: LessonNode[]; currentSlug: string; courseSlug: string; completedIds: Set<number>
}) {
  return <aside className="hidden md:block w-60 shrink-0 border-r border-white/[0.06] bg-[#080808]/40 overflow-y-auto"><div className="p-2.5 space-y-0.5">{lessons.map((l, idx) => { const active = l.slug === currentSlug; const done = completedIds.has(l.id); return <Link key={l.id} to={`/courses/${courseSlug}/lessons/${l.slug}`} className={cn('flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] transition-all',active?'bg-white/[0.06] text-white':'text-white/40 hover:bg-white/[0.03] hover:text-white/60')}><span className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-mono',done?'bg-emerald-500/15 text-emerald-400':active?'bg-white/10 text-white/50':'bg-white/[0.03] text-white/20')}>{done?<CheckCircle className="w-3 h-3" />:String(idx+1).padStart(2,'0')}</span><span className="truncate leading-tight">{l.title}</span>{!l.isFree&&<Lock className="w-2.5 h-2.5 text-white/10 shrink-0 ml-auto" />}</Link>
      })}</div></aside>
}


/* ── MAIN ── */
export default function LessonView() {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>()
  const [activeTab, setActiveTab] = useState<'learn' | 'demo' | 'practice' | 'quiz'>('learn')
  const [justCompleted, setJustCompleted] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const { data: course, isLoading: courseLoading, error: courseError } = trpc.course.getBySlug.useQuery(
    { slug: courseSlug! }, { enabled: !!courseSlug }
  )
  const { data: progressData } = trpc.progress.myProgress.useQuery(undefined, { enabled: true, retry: false })
  const { isAuthenticated } = useAuth()
  const utils = trpc.useUtils()
  const markComplete = trpc.lesson.markComplete.useMutation({
    onSuccess: () => { utils.progress.myProgress.invalidate(); setJustCompleted(true) }
  })

  const lesson = course?.lessons?.find((l: { slug: string }) => l.slug === lessonSlug)
  const lessonIndex = course?.lessons?.findIndex((l: { slug: string }) => l.slug === lessonSlug) ?? -1
  const prevLesson = lessonIndex > 0 ? course?.lessons?.[lessonIndex - 1] : null
  const nextLesson = lessonIndex < (course?.lessons?.length ?? 0) - 1 ? course?.lessons?.[lessonIndex + 1] : null
  const completedIds = useMemo(() => new Set(progressData?.filter(p => p.isCompleted).map(p => p.lessonId) ?? []), [progressData])

  const demoSteps = safeJsonParse<string[]>(lesson?.demoSteps) ?? []
  const quizData = safeJsonParse<QuizQuestion[]>(lesson?.quiz) ?? []
  const exercises = safeJsonParse<string[]>(lesson?.exercises) ?? []
  const renderedContent = useMemo(() => lesson?.content ? htmlToReact(lesson.content) : null, [lesson?.content])

  /* reset on navigation */
  useEffect(() => { setJustCompleted(false); setActiveTab('learn'); setMobileDrawerOpen(false) }, [lessonSlug])

  /* loading */
  if (courseLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-emerald-400/40 animate-spin" /></div>
  if (courseError) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-red-400/60 font-mono text-xs">$ error: {courseError.message}</p></div>
  if (!course || !lesson) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-white/20 font-mono text-xs">$ lesson_not_found</p></div>

  /* locked */
  if (!lesson.isFree && !isAuthenticated) return (
    <div className="flex items-center justify-center min-h-[60vh] px-4"><div className="text-center"><Lock className="w-8 h-8 text-white/15 mx-auto mb-3" /><p className="text-white/30 font-mono text-xs mb-1">$ permission_denied</p><p className="text-white/40 text-xs mb-5">Enroll to unlock all lessons</p><Link to="/courses"><Button className="bg-emerald-500 text-black hover:bg-emerald-400 text-[11px] h-7 px-3">Enroll — R299 Lifetime</Button></Link></div></div>
  )

  const tabs = [
    { key: 'learn' as const, label: 'Learn', icon: BookOpen },
    { key: 'demo' as const, label: 'Demo', icon: Play },
    { key: 'practice' as const, label: 'Practice', icon: TerminalIcon },
    { key: 'quiz' as const, label: 'Quiz', icon: HelpCircle },
  ]

  const allLessons = course.lessons as LessonNode[]

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Mobile drawer overlay */}
      <MobileLessonDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        lessons={allLessons}
        currentSlug={lessonSlug!}
        courseSlug={courseSlug!}
        completedIds={completedIds}
      />

      {/* Desktop sidebar */}
      <DesktopSidebar lessons={allLessons} currentSlug={lessonSlug!} courseSlug={courseSlug!} completedIds={completedIds} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/20 mb-3">
            <Link to={`/courses/${course.slug}`} className="hover:text-white/45 transition-colors">{course.title}</Link>
            <span>/</span>
            <span className="text-emerald-400/50 truncate">{lesson.title}</span>
          </div>

          {/* Mobile hamburger + Title */}
          <div className="flex items-start gap-3 mb-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden shrink-0 mt-1 p-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/70"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug break-words">
                  {lesson.title}
                </h1>
                {isAuthenticated && (
                  <Button
                    onClick={() => { if (!completedIds.has(lesson.id) && !justCompleted) markComplete.mutate({ lessonId: lesson.id, courseId: course.id }) }}
                    disabled={completedIds.has(lesson.id) || justCompleted}
                    className={cn('shrink-0 text-[10px] h-6 px-2.5 rounded font-mono transition-all mt-0.5',
                      completedIds.has(lesson.id) || justCompleted
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default'
                        : 'bg-white/[0.03] text-white/40 border border-white/[0.08] hover:bg-white/[0.06] hover:text-white/60'
                    )}
                  >
                    <CheckCircle className={cn('w-3 h-3 mr-1', (completedIds.has(lesson.id) || justCompleted) && 'fill-emerald-500/20')} />
                    {(completedIds.has(lesson.id) || justCompleted) ? 'done' : 'mark'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500/30 rounded-full transition-all duration-500" style={{ width: `${((lessonIndex + 1) / course.lessons.length) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono text-white/15 shrink-0">{String(lessonIndex + 1).padStart(2, '0')}/{String(course.lessons.length).padStart(2, '0')}</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 mb-6 border-b border-white/[0.05] overflow-x-auto scrollbar-hide">
            {tabs.map(t => {
              const Icon = t.icon
              const a = activeTab === t.key
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn('flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono whitespace-nowrap transition-all border-b-2 -mb-[1px]',a?'text-emerald-400 border-emerald-500/30':'text-white/25 border-transparent hover:text-white/45')}>
                  <Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              )
            })}
          </div>

          {/* ── LEARN ── */}
          {activeTab === 'learn' && <article>{renderedContent}<ExercisesSection exercises={exercises} /></article>}

          {/* ── DEMO ── */}
          {activeTab === 'demo' && <div><p className="text-[11px] font-mono text-white/15 mb-2">$ typewriter --lesson={lesson.slug}</p><TypewriterDemo steps={demoSteps.length > 0 ? demoSteps : ['$ echo "No demo available"', 'No demo available']} /></div>}

          {/* ── PRACTICE ── */}
          {activeTab === 'practice' && <div><p className="text-[11px] font-mono text-white/15 mb-2">$ ssh practice@mastertheterminal</p><TerminalSimulator slug={lesson.slug} /></div>}

          {/* ── QUIZ ── */}
          {activeTab === 'quiz' && (quizData.length > 0 ? <QuizComponent quiz={quizData} /> : <div className="my-4 rounded-md border border-white/[0.06] bg-[#080808] p-8 text-center"><p className="text-white/15 font-mono text-xs">$ echo "No quiz for this lesson"</p></div>)}

          {/* Prev/Next */}
          <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.05]">
            {prevLesson ? <Link to={`/courses/${course.slug}/lessons/${prevLesson.slug}`} className="flex items-center gap-1.5 text-white/25 hover:text-white/55 transition-colors text-[11px] font-mono group min-w-0"><ChevronLeft className="w-3.5 h-3.5 shrink-0 group-hover:-translate-x-0.5 transition-transform" /><span className="truncate">{prevLesson.title}</span></Link> : <div />}
            {nextLesson ? <Link to={`/courses/${course.slug}/lessons/${nextLesson.slug}`} className="flex items-center gap-1.5 text-white/25 hover:text-white/55 transition-colors text-[11px] font-mono group min-w-0"><span className="truncate">{nextLesson.title}</span><ChevronRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" /></Link> : <div />}
          </div>
        </div>
      </main>
    </div>
  )
}
