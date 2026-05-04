import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/" className="text-white/40 hover:text-white text-sm font-mono flex items-center gap-1 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> cd ~
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-white/60 leading-relaxed">
        <p>Last updated: 2024</p>
        <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, including your name, email address, and profile information when you sign in via OAuth.</p>
        <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
        <p>We use the information to provide and improve our services, track your learning progress, and communicate with you about your account.</p>
        <h2 className="text-xl font-semibold text-white">3. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information. All data is stored securely and access is restricted.</p>
        <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
        <p>We use OAuth providers (Google, Kimi) for authentication. Your use of these services is subject to their respective privacy policies.</p>
        <h2 className="text-xl font-semibold text-white">5. Contact</h2>
        <p>For privacy-related questions, please contact us through the platform.</p>
      </div>
    </div>
  )
}
