import React, { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { complaintsAPI } from "@/lib/api";
import { ComplaintListItem, ComplaintStatus, ComplaintPriority } from "@/types";
import Navbar from "@/components/layout/Navbar";
import ComplaintCard from "@/components/complaints/ComplaintCard";

const STATUSES: ComplaintStatus[] = [
  "submitted",
  "ai_categorized",
  "routed",
  "in_progress",
  "resolved",
  "rejected",
];
const PRIORITIES: ComplaintPriority[] = ["critical", "high", "medium", "low"];

export default function ReportsPage() {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    setLoading(true);
    complaintsAPI
      .list({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        limit: 50,
      })
      .then((r) => setComplaints(r.data))
      .finally(() => setLoading(false));
  }, [search, status, priority]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            My Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track all your submitted complaints and their resolution status.
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="input pl-9"
              />
            </div>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input sm:w-44"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input sm:w-40"
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(search || status || priority) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                }}
                className="btn-secondary text-sm whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {complaints.length} complaint{complaints.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="card p-16 text-center">
            <Filter size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No complaints found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || status || priority
                ? "Try adjusting your filters"
                : "Submit your first complaint from the Dashboard"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
