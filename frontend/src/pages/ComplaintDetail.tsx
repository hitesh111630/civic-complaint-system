import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Printer,
  Share2,
  Lock,
  MessageSquare,
  Star,
  Loader2,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { complaintsAPI } from "@/lib/api";
import { Complaint, ComplaintStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";

const STATUS_STEPS: ComplaintStatus[] = [
  "submitted",
  "ai_categorized",
  "routed",
  "in_progress",
  "resolved",
];
const STEP_LABELS: Record<string, string> = {
  submitted: "Submitted",
  ai_categorized: "AI Categorized",
  routed: "Routed to Department",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [officialMsg, setOfficialMsg] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus | "">("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    complaintsAPI
      .get(Number(id))
      .then((r) => setComplaint(r.data))
      .catch(() => toast.error("Complaint not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const submitUpdate = async () => {
    if (!officialMsg.trim()) {
      toast.error("Add a message");
      return;
    }
    setUpdating(true);
    try {
      const { data } = await complaintsAPI.updateStatus(Number(id), {
        message: officialMsg,
        status_changed_to: newStatus || undefined,
      });
      setComplaint(data);
      setOfficialMsg("");
      setNewStatus("");
      toast.success("Update posted");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const submitRating = async () => {
    if (!rating) {
      toast.error("Select a rating");
      return;
    }
    setSubmittingRating(true);
    try {
      const { data } = await complaintsAPI.rate(Number(id), {
        rating,
        comment: ratingComment,
      });
      setComplaint(data);
      toast.success("Rating submitted! +5 civic points");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const isOfficial = user?.role === "official" || user?.role === "admin";
  const canRate =
    !isOfficial && complaint?.status === "resolved" && !complaint?.rating;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="animate-spin text-navy-600" />
        </div>
      </div>
    );

  if (!complaint)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center mt-20 text-gray-500">Not found</p>
      </div>
    );

  // If resolved, point curStep past the last step so all show as done
  const curStep =
    complaint.status === "resolved"
      ? STATUS_STEPS.length
      : STATUS_STEPS.indexOf(complaint.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-3"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <p className="text-xs text-gray-400 font-mono mb-1">
            COMPLAINT #{complaint.complaint_number}
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
                {complaint.title}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="text-sm text-gray-500">
                  Submitted{" "}
                  {format(new Date(complaint.created_at), "MMMM d, yyyy")}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => window.print()}
                className="btn-secondary text-sm flex items-center gap-1.5"
              >
                <Printer size={14} /> Print Report
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                className="btn-primary text-sm flex items-center gap-1.5"
              >
                <Share2 size={14} /> Share Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Journey sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-5">
                Process Journey
              </h3>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-5">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i < curStep;
                    const active = i === curStep;
                    const isResolved = complaint.status === "resolved";

                    // Match update by status_changed_to, or fall back to created_at for submitted
                    const upd =
                      step === "submitted"
                        ? null
                        : complaint.updates.find(
                            (u) => u.status_changed_to === step,
                          );

                    // Timestamp: use resolved_at for resolved step, update time otherwise
                    const timestamp =
                      step === "resolved" && complaint.resolved_at
                        ? format(
                            new Date(complaint.resolved_at),
                            "MMM d, hh:mm a",
                          )
                        : upd
                          ? format(new Date(upd.created_at), "MMM d, hh:mm a")
                          : step === "submitted"
                            ? format(
                                new Date(complaint.created_at),
                                "MMM d, hh:mm a",
                              )
                            : null;

                    return (
                      <div
                        key={step}
                        className="flex gap-3 items-start relative"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                            done
                              ? "bg-green-500 border-green-500"
                              : active && isResolved
                                ? "bg-green-500 border-green-500"
                                : active
                                  ? "bg-navy-800 border-navy-800"
                                  : "bg-white border-gray-200"
                          }`}
                        >
                          {done || (active && isResolved) ? (
                            <Check size={12} className="text-white" />
                          ) : active ? (
                            <Loader2
                              size={12}
                              className="text-white animate-spin"
                            />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${!done && !active ? "text-gray-400" : "text-gray-900"}`}
                          >
                            {STEP_LABELS[step]}
                          </p>
                          <p className="text-xs text-gray-500">
                            {timestamp
                              ? timestamp
                              : active
                                ? "In progress..."
                                : step === "resolved"
                                  ? "Pending final inspection"
                                  : ""}
                          </p>
                          {upd && upd.message && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">
                              {upd.message}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Details */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare size={16} /> Complaint Details
              </h3>
              <div className="flex gap-4">
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  {complaint.description}
                </p>
                {complaint.media.length > 0 && (
                  <div className="w-40 flex-shrink-0">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      {complaint.media[0].file_type === "image" ? (
                        <img
                          src={`/${complaint.media[0].file_path}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={`/${complaint.media[0].file_path}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {complaint.media.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                          +{complaint.media.length - 1}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Location
                  </p>
                  <p className="text-sm text-gray-700">{complaint.location}</p>
                </div>
              </div>
              {complaint.ai_category && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
                    AI: {complaint.ai_category} (
                    {Math.round((complaint.ai_confidence || 0) * 100)}%
                    confidence)
                  </span>
                </div>
              )}
            </div>

            {/* Department updates */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={16} /> Department Updates
              </h3>
              {complaint.updates.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No updates yet
                </p>
              ) : (
                <div className="space-y-3">
                  {complaint.updates.map((u) => (
                    <div
                      key={u.id}
                      className="border-l-2 border-navy-200 pl-4 py-1"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-navy-800">
                          {u.official.full_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(u.created_at), "MMM d, hh:mm a")}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{u.message}</p>
                      {u.status_changed_to && (
                        <p className="text-xs text-gray-400 mt-1">
                          Status → <StatusBadge status={u.status_changed_to} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Official update form */}
              {isOfficial && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Post Update
                  </p>
                  <textarea
                    value={officialMsg}
                    onChange={(e) => setOfficialMsg(e.target.value)}
                    placeholder="Write an official update..."
                    rows={2}
                    className="input resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) =>
                        setNewStatus(e.target.value as ComplaintStatus | "")
                      }
                      className="input flex-1 text-sm"
                    >
                      <option value="">Don't change status</option>
                      {STATUS_STEPS.map((s) => (
                        <option key={s} value={s}>
                          {STEP_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={submitUpdate}
                      disabled={updating}
                      className="btn-primary flex items-center gap-1.5"
                    >
                      {updating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Share2 size={14} />
                      )}{" "}
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rating section */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star size={16} /> Resolution & Rating
              </h3>
              {complaint.rating ? (
                <div className="text-center py-3">
                  <div className="flex justify-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={20}
                        className={
                          s <= complaint.rating!
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {complaint.rating_comment || "Rated"}
                  </p>
                </div>
              ) : canRate ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    How satisfied are you with the resolution?
                  </p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={`p-1 transition-transform ${s <= rating ? "scale-110" : ""}`}
                      >
                        <Star
                          size={24}
                          className={
                            s <= rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Optional feedback..."
                    rows={2}
                    className="input resize-none mb-2"
                  />
                  <button
                    onClick={submitRating}
                    disabled={submittingRating}
                    className="btn-primary flex items-center gap-2"
                  >
                    {submittingRating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Submit Rating
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Lock size={20} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    Rating available upon resolution
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Once the issue is marked 'Resolved' by the department,
                    you'll be able to rate and provide feedback.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
