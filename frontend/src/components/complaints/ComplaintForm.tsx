import React, { useState, useRef } from 'react'
import { Send, MapPin, Camera, Video, X, Loader2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { complaintsAPI } from '@/lib/api'

const DEPARTMENTS = ['Health','Electricity','Sanitation','Water Works','Infrastructure','Public Works','Transport']

// Naive client-side detector mirrors the backend
function detectCategory(text: string): string {
  const t = text.toLowerCase()
  if (/water|pipe|leak|sewer|flood/.test(t)) return 'Infrastructure'
  if (/garbage|waste|trash|dump/.test(t)) return 'Sanitation'
  if (/light|electric|power|outage/.test(t)) return 'Electricity'
  if (/health|pest|mosquito/.test(t)) return 'Health'
  if (/road|pothole|pavement/.test(t)) return 'Infrastructure'
  return 'Infrastructure'
}

interface Props { onSuccess: () => void }

export default function ComplaintForm({ onSuccess }: Props) {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const detectedCat = description.length > 10 ? detectCategory(description) : null

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    const valid = arr.filter(f => f.size <= 20 * 1024 * 1024)
    if (valid.length < arr.length) toast.error('Some files exceed 20MB and were skipped')
    setFiles(prev => [...prev, ...valid].slice(0, 4))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !location.trim()) {
      toast.error('Please fill in description and location'); return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('description', description)
      fd.append('location', location)
      if (department) fd.append('department', department)
      files.forEach(f => fd.append('files', f))
      await complaintsAPI.create(fd)
      toast.success('Complaint submitted! +10 civic points earned 🎉')
      setDescription(''); setLocation(''); setDepartment(''); setFiles([])
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center">
          <Send size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Register New Complaint</h2>
          <p className="text-xs text-gray-500">AI will automatically categorize your report for faster resolution.</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Issue Description
        </label>
        <div className="relative">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the issue... e.g., 'Large pothole near Central Park entrance causing traffic blocks'"
            rows={3}
            className="input resize-none"
            required
          />
          {detectedCat && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-navy-50 text-navy-700 text-xs px-2 py-1 rounded-full">
              <Zap size={10} className="text-navy-500" />
              Auto-detecting: {detectedCat}
            </div>
          )}
        </div>
      </div>

      {/* Location + Dept */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Street, block, landmark" className="input pl-8" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)} className="input">
            <option value="">Auto-detect</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* File upload */}
      <div className="mb-5">
        <div className="grid grid-cols-4 gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg h-20 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-navy-400 hover:text-navy-500 transition-colors text-xs">
            <Camera size={18} /><span>Photo</span>
          </button>
          <button type="button" onClick={() => videoRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg h-20 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-navy-400 hover:text-navy-500 transition-colors text-xs">
            <Video size={18} /><span>Video</span>
          </button>
          {files.slice(0, 2).map((f, i) => (
            <div key={i} className="relative rounded-lg h-20 bg-gray-100 overflow-hidden">
              {f.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  <Video size={20} />
                </div>
              )}
              <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded-lg h-20 flex items-center justify-center text-xs text-gray-400">
              Max 20MB/file
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => addFiles(e.target.files)} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Complaint</>}
      </button>
    </form>
  )
}
