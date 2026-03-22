import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, X, Filter, Grid2X2, Bell, Zap, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { complaintsAPI } from '@/lib/api'
import { ComplaintListItem } from '@/types'
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge'

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500', low: 'bg-green-500',
}

export default function PublicTransparency() {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<string[]>([])

  useEffect(() => {
    complaintsAPI.publicList({ limit: 20 })
      .then(r => setComplaints(r.data))
      .finally(() => setLoading(false))
  }, [])

  const removeFilter = (f: string) => setFilters(prev => prev.filter(x => x !== f))

  const resolved = complaints.filter(c => c.status === 'resolved').length
  const avgDays = 4.2

  const filtered = filters.length === 0 ? complaints : complaints.filter(c =>
    filters.some(f =>
      f.toLowerCase() === c.priority ||
      f.toLowerCase() === c.department?.toLowerCase() ||
      c.ai_category?.toLowerCase().includes(f.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-6">
          <Link to="/" className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 bg-navy-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="font-display font-bold text-navy-900 text-sm hidden sm:block">The Civil Dialogue</span>
          </Link>
          <nav className="flex items-center gap-1 flex-1">
            {[{l:'Dashboard',p:'/'},{l:'Map',p:'/transparency'},{l:'Reports',p:'/transparency'}].map(n => (
              <Link key={n.p} to={n.p} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                n.l === 'Map' ? 'text-navy-800 border-b-2 border-navy-800 rounded-none pb-[14px]' : 'text-gray-500 hover:text-gray-800'
              }`}>{n.l}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <input placeholder="Search area..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none w-36 hidden sm:block" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Public Transparency</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time civic accountability</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{resolved.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">Past 30 Days</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgDays}d</p>
                <p className="text-xs text-gray-400 mt-0.5">Resolution Speed</p>
              </div>
            </div>

            {/* Active filters */}
            {filters.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Filters</p>
                  <button onClick={() => setFilters([])} className="text-xs text-navy-600 hover:underline">Clear all</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map(f => (
                    <span key={f} className="flex items-center gap-1 bg-navy-800 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      {f} <button onClick={() => removeFilter(f)}><X size={11} /></button>
                    </span>
                  ))}
                  <button onClick={() => setFilters(prev => [...prev, 'More'])}
                    className="flex items-center gap-1 border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:bg-gray-50">
                    <Filter size={11} /> More
                  </button>
                </div>
              </div>
            )}

            {/* Recent issues */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Issues</p>
              <div className="space-y-3">
                {loading ? [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                    <div className="h-3 bg-gray-100 rounded mb-2 w-1/4" />
                    <div className="h-4 bg-gray-100 rounded mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                )) : filtered.slice(0, 4).map(c => (
                  <Link key={c.id} to={`/complaints/${c.id}`}
                    className="bg-white rounded-xl border border-gray-100 p-4 block hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-1.5">
                      <PriorityBadge priority={c.priority} />
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{c.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      {c.department && <span className="flex items-center gap-1"><Grid2X2 size={10}/> {c.department}</span>}
                      <span className="flex items-center gap-1"><MapPin size={10}/> {c.location.split(',')[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter quick-adds */}
            <div className="flex flex-wrap gap-2">
              {['Sanitation','High Priority','Water','Electricity'].filter(f => !filters.includes(f)).map(f => (
                <button key={f} onClick={() => setFilters(prev => [...prev, f])}
                  className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-white transition-colors">
                  + {f}
                </button>
              ))}
            </div>

            <Link to="/" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
              <Grid2X2 size={14} /> See Official Updates
            </Link>
          </div>

          {/* Map area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative" style={{ minHeight: '600px' }}>
              {/* Decorative map placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Interactive Map</p>
                  <p className="text-xs mt-1">Integrate with Mapbox or Google Maps</p>
                </div>
              </div>

              {/* Map pins */}
              {filtered.slice(0, 6).map((c, i) => (
                <div key={c.id}
                  className="absolute z-10"
                  style={{ left: `${20 + i * 13}%`, top: `${25 + (i % 3) * 20}%` }}>
                  <Link to={`/complaints/${c.id}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md text-white text-xs font-bold transition-transform hover:scale-110 ${
                      c.priority === 'critical' ? 'bg-red-500' :
                      c.priority === 'high' ? 'bg-orange-500' :
                      c.status === 'resolved' ? 'bg-green-500' : 'bg-navy-700'
                    }`}
                    title={c.title}>
                    {c.priority === 'critical' ? '!' :
                     c.status === 'resolved' ? '✓' :
                     c.department?.[0] || '?'}
                  </Link>
                </div>
              ))}

              {/* Controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
                {['+','−','◎'].map(c => (
                  <button key={c} className="w-8 h-8 bg-white shadow rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 font-medium text-sm">
                    {c}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-md px-5 py-3 flex items-center gap-5 z-20 text-xs font-medium">
                {[
                  {color:'bg-red-500',label:'Critical'},
                  {color:'bg-navy-600',label:'Ongoing'},
                  {color:'bg-green-500',label:'Resolved'},
                ].map(({color,label}) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    {label}
                  </div>
                ))}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-100">
                  <Bell size={13} className="text-gray-400" />
                  <Zap size={13} className="text-gray-400" />
                  <Package size={13} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
