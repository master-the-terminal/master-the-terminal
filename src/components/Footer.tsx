import { Link } from 'react-router'
import { Terminal, Github, Twitter, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-lg">
                <span className="text-white">master</span>
                <span className="text-emerald-400">_the</span>
                <span className="text-cyan-400">_terminal</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              The premium online course platform for developers. From zero to job-ready in Terminal mastery, Git, modern backend, databases, deployment, and secure auth.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-white/50 hover:text-emerald-400 transition-colors">Courses</Link></li>
              <li><Link to="/projects" className="text-white/50 hover:text-emerald-400 transition-colors">Projects</Link></li>
              <li><Link to="/knowledgebase" className="text-white/50 hover:text-emerald-400 transition-colors">Knowledgebase</Link></li>
              <li><Link to="/dashboard" className="text-white/50 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-white/50 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/50 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2024 Master the Terminal. Built with <Heart className="w-3 h-3 inline text-pink-400" /> for developers.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
