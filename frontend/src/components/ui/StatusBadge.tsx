import React from 'react'
import { ComplaintStatus, ComplaintPriority } from '@/types'

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: 'Submitted',
  ai_categorized: 'AI Categorized',
  routed: 'Routed',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

const STATUS_CLASSES: Record<ComplaintStatus, string> = {
  submitted:      'bg-gray-100 text-gray-700',
  ai_categorized: 'bg-blue-50 text-blue-700',
  routed:         'bg-purple-50 text-purple-700',
  in_progress:    'bg-blue-100 text-blue-800',
  resolved:       'bg-green-100 text-green-700',
  rejected:       'bg-red-100 text-red-700',
}

const PRIORITY_CLASSES: Record<ComplaintPriority, string> = {
  low:      'bg-gray-100 text-gray-600',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${PRIORITY_CLASSES[priority]}`}>
      {priority}
    </span>
  )
}
