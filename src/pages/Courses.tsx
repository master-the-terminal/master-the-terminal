import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Terminal, BookOpen, Lock, ChevronRight } from 'lucide-react'

export default function Courses() {
  const { data: courses, isLoading } = trpc.course.list.useQuery()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white/5 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">All Courses</h1>
        <p className="text-white/50 font-mono">$ ls -la /courses/ <span className="text-emerald-400">total {courses?.length ?? 0}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Link key={course.id} to={`/courses/${course.slug}`} className="group">
            <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6 h-full hover:bg-white/[0.02] hover:border-white/[0.10] transition-all duration-300 group-hover:-translate-y-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${course.color}15`, border: `1px solid ${course.color}30` }}
                >
                  <Terminal className="w-6 h-6" style={{ color: course.color || "#34D399" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                  <span className="text-xs text-white/40 font-mono">5 lessons</span>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-4 flex-grow">{course.shortDescription}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> 2 free lessons
                </span>
                <span className="text-white/30 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 3 locked
                </span>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors font-mono">
                cd {course.slug} <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
