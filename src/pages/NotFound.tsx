import { Link } from 'react-router'
import { Terminal, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Terminal className="w-16 h-16 text-white/20 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white/10 font-mono mb-2">404</h1>
        <p className="text-white/50 font-mono mb-2">$ command not found: /page</p>
        <p className="text-white/40 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> cd ~
          </Button>
        </Link>
      </div>
    </div>
  )
}
