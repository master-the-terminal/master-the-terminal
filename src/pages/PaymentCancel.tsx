import { Link } from 'react-router'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-white/50 font-mono mb-2">$ exit 1</p>
        <p className="text-white/60 mb-8">Your payment was not completed. First 2 lessons of every course remain FREE.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/courses">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
            </Button>
          </Link>
          <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
