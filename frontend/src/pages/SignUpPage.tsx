import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function SignUpPage() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [show, setShow] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { toast.error('Please accept the Terms of Service'); return }
    setLoading(true)
    try {
      await register({ ...form, role: 'citizen' })
      nav('/')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #3a5aac 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-xl">The Civil Dialogue</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Join the conversation<br />that shapes our city.
          </h1>
          <p className="text-navy-200 text-base leading-relaxed max-w-sm">
            A dedicated space for professional civic engagement, where transparency leads to progress
            and your voice becomes part of the public record.
          </p>
        </div>
        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-white font-bold text-3xl font-display">12.4k</p>
            <p className="text-navy-400 text-xs uppercase tracking-widest mt-1">Active Citizens</p>
          </div>
          <div>
            <p className="text-white font-bold text-3xl font-display">98%</p>
            <p className="text-navy-400 text-xs uppercase tracking-widest mt-1">Resolution Rate</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Create an account</h2>
          <p className="text-sm text-gray-500 mb-7">Welcome! Let's get you set up to participate in Civic Pulse.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input value={form.full_name} onChange={set('full_name')}
                placeholder="John Doe" className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="name@example.com" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={set('phone')}
                  placeholder="(555) 000-0000" className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" className="input pr-10" required minLength={8} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters long.</p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300" />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <span className="text-navy-700 hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-navy-700 hover:underline cursor-pointer">Privacy Policy</span>.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Create Account →
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Already have an account?</p>
            <Link to="/login" className="btn-secondary w-full block text-center text-sm">
              Log In
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">© 2024 The Civil Dialogue. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
