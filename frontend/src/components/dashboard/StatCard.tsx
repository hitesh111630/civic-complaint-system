import React from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  subColor?: string
}

export default function StatCard({ label, value, sub, subColor = 'text-gray-500' }: Props) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900 font-display leading-none mb-1">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  )
}
