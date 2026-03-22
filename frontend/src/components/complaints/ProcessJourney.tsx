import React from 'react'
import { Check, Loader2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Complaint, ComplaintStatus } from '@/types'

const STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'submitted',      label: 'Submitted',          desc: 'Complaint received' },
  { status: 'ai_categorized', label: 'AI Categorized',     desc: 'Auto-classified by AI' },
  { status: 'routed',         label: 'Routed to Dept.',    desc: 'Assigned to department' },
  { status: 'in_progress',    label: 'In Progress',        desc: 'Team on site' },
  { status: 'resolved',       label: 'Resolved',           desc: 'Pending final inspection' },
]

const ORDER: ComplaintStatus[] = ['submitted','ai_categorized','routed','in_progress','resolved']

function stepState(stepStatus: ComplaintStatus, currentStatus: ComplaintStatus): 'done' | 'active' | 'pending' {
  const si = ORDER.indexOf(stepStatus)
  const ci = ORDER.indexOf(currentStatus)
  if (si < ci) return 'done'
  if (si === ci) return 'active'
  return 'pending'
}

export default function ProcessJourney({ complaint }: { complaint: Complaint }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-5">Process Journey</h3>
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const state = stepState(step.status, complaint.status)
          const update = complaint.updates.find(u => u.status_changed_to === step.status)
          return (
            <div key={step.status} className="flex gap-3 items-start">
              {/* Icon */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                state === 'done'   ? 'bg-green-500' :
                state === 'active' ? 'bg-navy-800' : 'bg-gray-100'
              }`}>
                {state === 'done'   ? <Check size={13} className="text-white" /> :
                 state === 'active' ? <Loader2 size={13} className="text-white animate-spin" /> :
                 <Clock size={13} className="text-gray-400" />}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${state === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">
                  {update
                    ? format(new Date(update.created_at), 'MMM d, hh:mm a')
                    : state === 'active' ? 'In progress...' : step.desc}
                </p>
              </div>
              {/* Vertical connector */}
              {i < STEPS.length - 1 && (
                <div className="absolute ml-3.5 mt-8 w-px h-4 bg-gray-200" style={{ position: 'relative', left: '-100%', top: '8px' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
