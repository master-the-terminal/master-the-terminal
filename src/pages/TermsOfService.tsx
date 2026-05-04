import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/" className="text-white/40 hover:text-white text-sm font-mono flex items-center gap-1 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> cd ~
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
      <div className="space-y-6 text-white/60 leading-relaxed">
        <p>Last updated: 2024</p>
        <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
        <p>By accessing and using Master the Terminal, you accept and agree to be bound by these Terms of Service.</p>
        <h2 className="text-xl font-semibold text-white">2. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        <h2 className="text-xl font-semibold text-white">3. Content</h2>
        <p>All course content, including text, code examples, and videos, is the property of Master the Terminal and is protected by copyright laws.</p>
        <h2 className="text-xl font-semibold text-white">4. Payments</h2>
        <p>Enrollment fees are one-time payments for lifetime access. Refunds are handled on a case-by-case basis.</p>
        <h2 className="text-xl font-semibold text-white">5. Termination</h2>
        <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any violation of these terms.</p>
      </div>
    </div>
  )
}
