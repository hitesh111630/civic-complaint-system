import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ComplaintListItem } from '@/types'
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge'

export default function ComplaintCard({ c }: { c: ComplaintListItem }) {
  const thumb = c.media.find(m => m.file_type === 'image')

  return (
    <Link to={`/complaints/${c.id}`} className="card block hover:shadow-md transition-shadow p-4">
      <div className="flex gap-3">
        {thumb && (
          <img src={`/${thumb.file_path}`} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs text-gray-400 font-mono">{c.complaint_number}</p>
            <div className="flex gap-1.5 flex-shrink-0">
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1.5 truncate">{c.title}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {c.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
            </span>
          </div>
          {c.ai_category && (
            <span className="inline-block mt-1.5 text-xs text-navy-600 bg-navy-50 px-2 py-0.5 rounded-full">
              {c.ai_category}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
