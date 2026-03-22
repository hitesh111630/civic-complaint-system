import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) { nav('/'); return null }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      nav('/')
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #3a5aac 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-xl">The Civil Dialogue</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Architecting the future<br />
            of <span className="text-civic-green">civic engagement.</span>
          </h1>
          <p className="text-navy-200 text-base leading-relaxed max-w-sm">
            Join a platform built on transparency, dignity, and professional accountability.
            Your voice is the blueprint for our community's progress.
          </p>
        </div>
        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-civic-green font-bold text-3xl font-display">98%</p>
            <p className="text-navy-400 text-xs uppercase tracking-widest mt-1">Resolution Rate</p>
          </div>
          <div>
            <p className="text-civic-green font-bold text-3xl font-display">12k+</p>
            <p className="text-navy-400 text-xs uppercase tracking-widest mt-1">Active Citizens</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-7">Please enter your details to access your dashboard.</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@organization.gov" className="input" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <button type="button" className="text-xs text-navy-600 hover:underline">Forgot Password?</button>
                </div>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="input pr-10" required />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Sign In to Workspace →
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-3">New to the platform?</p>
              <Link to="/signup" className="w-full btn-secondary flex items-center justify-center gap-2 text-sm">
                Create Public Account
              </Link>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-navy-600">
              <Shield size={12} /> Secure Government Gateway
            </div>

            <div className="mt-5 flex justify-center gap-5 text-xs text-gray-400">
              <button className="hover:underline">Privacy Policy</button>
              <button className="hover:underline">Terms of Service</button>
              <button className="hover:underline">Accessibility</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
