import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus, Shield, Zap, Trash2, Droplets, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { complaintsAPI } from '@/lib/api'
import { ComplaintListItem, DashboardStats, IssueDistribution } from '@/types'
import Navbar from '@/components/layout/Navbar'
import StatCard from '@/components/dashboard/StatCard'
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge'

const DEPT_ICONS: Record<string, React.ReactNode> = {
  Health: <Shield size={14} />,
  Electricity: <Zap size={14} />,
  Sanitation: <Trash2 size={14} />,
  'Water Works': <Droplets size={14} />,
}

export default function OfficialDashboard() {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [dist, setDist] = useState<IssueDistribution[]>([])
  const [priority, setPriority] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      complaintsAPI.list({ limit: 10, priority: priority === 'all' ? undefined : priority }),
      complaintsAPI.stats(),
      complaintsAPI.distribution(),
    ]).then(([c, s, d]) => {
      setComplaints(c.data); setStats(s.data); setDist(d.data)
    }).finally(() => setLoading(false))
  }, [priority])

  const deptCounts = complaints.reduce((acc, c) => {
    if (c.department) acc[c.department] = (acc[c.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-3xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time status of civic engagement and department efficiency.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Pending Complaints"
            value={stats?.pending_complaints.toLocaleString() ?? '—'}
            sub="↑ +12% from last week" subColor="text-red-500"
          />
          <StatCard
            label="Resolved Cases"
            value={stats ? <span className="text-green-600">{stats.resolved_cases.toLocaleString()}</span> as any : '—'}
            sub={`${stats?.sla_compliance ?? 0}% SLA Compliance`} subColor="text-green-600"
          />
          <StatCard
            label="Avg. Resolution Time"
            value={stats ? `${stats.avg_resolution_days} Days` : '—'}
            sub="↓ -0.5d improvement" subColor="text-navy-600"
          />
          <StatCard
            label="Citizen Satisfaction"
            value={stats ? `${stats.citizen_satisfaction}/5` : '—'}
            sub={`From ${stats?.total_citizens ?? 0} citizens`} subColor="text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Department access */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Department Access</p>
              <div className="space-y-1">
                {(['Health','Electricity','Sanitation','Water Works'] as const).map(dept => (
                  <div key={dept}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      dept === 'Health' ? 'bg-navy-800 text-white' : 'hover:bg-gray-50 text-gray-700'
                    }`}>
                    <div className="flex items-center gap-2">
                      <span>{DEPT_ICONS[dept]}</span>
                      <span className="text-sm font-medium">{dept}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      dept === 'Health' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {deptCounts[dept] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System integration */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Integration</p>
              <div className="space-y-2">
                {[
                  { name: 'Municipal GIS Cloud', ok: true },
                  { name: 'Emergency Dispatch v2', ok: true },
                  { name: 'Legacy Archive', ok: false },
                ].map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-600">{s.name}</span>
                    {!s.ok && <span className="text-xs text-gray-400">(Offline)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-5">
            {/* Complaints table */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-navy-800 text-lg">Assigned Complaints</h2>
                <div className="flex gap-2">
                  <select value={priority} onChange={e => setPriority(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
                    <option value="all">Priority: All</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <Filter size={13} /> Filter
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">Review and route urgent civic matters.</p>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Complaint Title','Department','Status','Date','Action'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {[...Array(5)].map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <div className="h-3 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : complaints.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                        <p className="text-xs text-gray-400">{c.complaint_number}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600">{c.department || '—'}</td>
                      <td className="py-3 pr-4"><StatusBadge status={c.status} /></td>
                      <td className="py-3 pr-4 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-3">
                        <Link to={`/complaints/${c.id}`}
                          className="text-xs font-semibold text-navy-600 hover:underline">
                          {c.status === 'submitted' ? 'Route' : c.status === 'in_progress' ? 'Update' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Distribution + Hotspots */}
            <div className="grid grid-cols-2 gap-5">
              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Issue Distribution</p>
                <div className="space-y-3">
                  {dist.slice(0, 5).map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{d.category}</span>
                        <span className="font-semibold text-gray-900">{d.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-navy-700 rounded-full transition-all" style={{ width: `${d.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Critical Hotspots</p>
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-32 mb-3 relative overflow-hidden flex items-start justify-start p-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Zone A: High Density
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Central Ward requires immediate sanitation dispatch.</p>
                  <button className="text-navy-600 hover:text-navy-800">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-navy-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-navy-700 transition-colors">
        <Plus size={20} />
      </button>
    </div>
  )
}
