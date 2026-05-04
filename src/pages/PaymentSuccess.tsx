import { Link } from 'react-router'
import { CheckCircle, ArrowRight, BookOpen, FolderGit2, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 terminal-glow">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful</h1>
        <p className="text-white/50 font-mono mb-2">$ echo "THANK YOU"</p>
        <p className="text-white/60 mb-8">Your enrollment is confirmed. You now have lifetime access to all 30 lessons and 4 projects.</p>

        <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6 mb-8 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <BookOpen className="w-4 h-4 text-cyan-400" /> 30 Lessons unlocked
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <FolderGit2 className="w-4 h-4 text-purple-400" /> 4 Projects unlocked
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Database className="w-4 h-4 text-emerald-400" /> Lifetime access
          </div>
        </div>

        <Link to="/courses">
          <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold px-8">
            Start Learning <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
