import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Trophy, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { complaintsAPI } from '@/lib/api'
import { ComplaintListItem } from '@/types'
import Navbar from '@/components/layout/Navbar'
import ComplaintForm from '@/components/complaints/ComplaintForm'
import ComplaintCard from '@/components/complaints/ComplaintCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function CitizenDashboard() {
  const { user, refreshUser } = useAuth()
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await complaintsAPI.list({ limit: 5 })
      setComplaints(data)
    } catch { /* handled by interceptor */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const onSubmit = () => { load(); refreshUser() }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header row */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Citizen Portal</p>
            <h1 className="font-display text-3xl font-bold text-gray-900">
              {getGreeting()}, {user?.full_name.split(' ')[0]}
            </h1>
          </div>
          <div className="card flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Star size={14} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Civic Points</p>
              <p className="font-bold text-gray-900 text-lg leading-none">{user?.civic_points.toLocaleString()}</p>
            </div>
            <div className="flex gap-1.5 ml-2">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                <Trophy size={12} className="text-amber-500" />
              </div>
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                <Zap size={12} className="text-navy-500" />
              </div>
              <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                +3
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-3">
            <ComplaintForm onSuccess={onSubmit} />
          </div>

          {/* Right: recent complaints + map */}
          <div className="lg:col-span-2 space-y-5">
            {/* Recent complaints */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Recent Complaints</h2>
                <Link to="/complaints" className="text-xs font-semibold text-navy-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="h-3 bg-gray-100 rounded mb-2 w-1/3" />
                      <div className="h-4 bg-gray-100 rounded mb-1 w-full" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  ))
                ) : complaints.length === 0 ? (
                  <div className="card p-8 text-center text-gray-400 text-sm">
                    No complaints yet. Submit your first one!
                  </div>
                ) : (
                  complaints.map(c => (
                    <Link key={c.id} to={`/complaints/${c.id}`}
                      className="card block p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">{c.title}</p>
                      {c.status === 'in_progress' && (
                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-navy-600 rounded-full" style={{ width: '65%' }} />
                        </div>
                      )}
                      {c.status === 'resolved' && (
                        <p className="text-xs text-green-600 font-medium mt-1">✓ Completed by {c.department}</p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Nearby issues stub */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Nearby Issues</h3>
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50" />
                <div className="relative text-center">
                  <MapPin size={24} className="text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Your location</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                There are <span className="font-semibold text-gray-700">12 active reports</span> within 500m of your location.{' '}
                <Link to="/transparency" className="text-navy-600 hover:underline">View on map →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
