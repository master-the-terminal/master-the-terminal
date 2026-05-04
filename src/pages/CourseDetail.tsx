import { Link, useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Terminal, BookOpen, Lock, Unlock, CheckCircle, ChevronRight, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: course, isLoading } = trpc.course.getBySlug.useQuery({ slug: slug! }, { enabled: !!slug })
  const { data: progressData } = trpc.progress.myProgress.useQuery(undefined, { retry: false })
  const { isAuthenticated } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const completedSet = new Set(progressData?.filter(p => p.isCompleted).map(p => p.lessonId) ?? [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse h-8 bg-white/10 rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/5 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!course) return <div className="py-20 text-center text-white/50">Course not found</div>

  const freeCount = course.lessons.filter(l => l.isFree).length
  const lockedCount = course.lessons.filter(l => !l.isFree).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/courses" className="text-white/40 hover:text-white text-sm font-mono flex items-center gap-1 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> cd ..
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${course.color || '#34D399'}15`, border: `1px solid ${course.color || '#34D399'}30` }}
            >
              <Terminal className="w-8 h-8" style={{ color: course.color || "#34D399" }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-white/40 font-mono text-sm mt-1">
                {course.lessons.length} lessons · {freeCount} free · {lockedCount} enrolled
              </p>
            </div>
          </div>

          <p className="text-white/60 leading-relaxed mb-10">{course.description}</p>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Lessons
            </h2>
            {course.lessons.map((lesson, idx) => {
              const isCompleted = completedSet.has(lesson.id)
              const isLocked = !lesson.isFree
              return (
                <Link
                  key={lesson.id}
                  to={isLocked && !isAuthenticated ? '#' : `/courses/${course.slug}/lessons/${lesson.slug}`}
                  onClick={(e) => {
                    if (isLocked && !isAuthenticated) {
                      e.preventDefault()
                      setShowPaymentModal(true)
                    }
                  }}
                  className={`rounded-md border border-white/[0.06] bg-[#080808] p-4 flex items-center gap-4 group transition-all duration-200 ${isLocked ? 'opacity-70' : 'hover:bg-white/[0.02] hover:border-white/[0.10] hover:-translate-x-0.5'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-white/40 shrink-0">
                    {isCompleted ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : idx + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className={`font-medium text-sm ${isLocked ? 'text-white/50' : 'text-white group-hover:text-emerald-400'} transition-colors`}>
                      {lesson.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {lesson.isFree ? (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><Unlock className="w-3 h-3" /> free</span>
                    ) : (
                      <span className="text-xs font-mono text-white/30 flex items-center gap-1"><Lock className="w-3 h-3" /> enrolled</span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isLocked ? 'text-white/20' : 'text-white/40 group-hover:text-emerald-400'}`} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-md border border-white/[0.08] bg-[#080808] p-6 sticky top-24 terminal-glow">
            <h3 className="font-semibold text-white mb-4">Course Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/60">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Lessons</span>
                <span className="font-mono">{course.lessons.length}</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Est. Time</span>
                <span className="font-mono">~5 hours</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed</span>
                <span className="font-mono">{course.lessons.filter(l => completedSet.has(l.id)).length}/{course.lessons.length}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 mb-4">Unlock all lessons + 4 projects with lifetime access</p>
              <Link to="/courses">
                <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold">
                  Enroll for R299
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}>
          <div className="rounded-md border border-white/[0.08] bg-[#080808] p-8 max-w-md w-full mx-4 terminal-glow" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Enrollment Required</h3>
            <p className="text-white/50 text-sm mb-6">Lessons 3-5 and all projects require enrollment. First 2 lessons of every course are FREE.</p>
            <Link to="/courses" onClick={() => setShowPaymentModal(false)}>
              <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold">
                Enroll Now — R299 Lifetime
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
