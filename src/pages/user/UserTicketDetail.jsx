import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import { PriorityBadge, StatusBadge } from "../../components/common/TicketBadge";
import { formatDate } from "../../utils/helpers";
import { getTicketById, addComment, deleteComment } from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";

const UserTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTicket = async () => {
    try {
      const res = await getTicketById(id);
      setTicket(res.data);
    } catch {
      setError("Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment(id, comment);
    setComment("");
    fetchTicket();
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(id, commentId);
      fetchTicket();
    } catch {
      alert("Failed to delete comment.");
    }
  };

  if (loading) return (
    <UserLayout>
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-[#450a0a] rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading ticket...</span>
        </div>
      </div>
    </UserLayout>
  );

  if (error) return (
    <UserLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    </UserLayout>
  );

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <span>Platform</span>
          <span>/</span>
          <button
            onClick={() => navigate("/user/tickets")}
            className="hover:text-[#450a0a] transition-colors"
          >
            Ticket Registry
          </button>
          <span>/</span>
          <span className="text-[#450a0a] font-black">#{ticket.id}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Ticket Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Incident Report
                </p>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
              <div className="px-6 py-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                  {ticket.title}
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
              <div className="border-t border-slate-100 px-6 py-3 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Submitted: {formatDate(ticket.created_at)}
                </p>
              </div>
            </div>

            {/* Comments Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Activity Log — {ticket.comments?.length || 0} Comments
                </p>
              </div>

              <div className="px-6 py-4 space-y-3">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 leading-relaxed">{c.comment}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                          {formatDate(c.created_at)}
                        </p>
                      </div>
                      {c.user_id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[9px] font-black uppercase tracking-widest"
                          title="Delete comment"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                      No activity logged yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Add to Activity Log
                </p>
                <form onSubmit={handleComment} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type your comment..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#450a0a] placeholder:text-slate-300 font-medium transition-all"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#450a0a] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-900 transition-all active:scale-95 shadow-lg shadow-red-950/20"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* ── Right: Ticket Details Sidebar ── */}
          <div className="space-y-4">

            {/* Status Panel */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Ticket Details
                </p>
              </div>
              <div className="px-5 py-5 space-y-4">

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                  <StatusBadge status={ticket.status} />
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Assigned Agent
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ticket.helper_id ? "bg-emerald-500" : "bg-slate-200"}`}></div>
                    <span className="text-xs font-bold text-slate-600">
                      {ticket.helper_id ? `Agent #${ticket.helper_id}` : "Pending Assignment"}
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Submitted On
                  </p>
                  <p className="text-xs font-bold text-slate-600">{formatDate(ticket.created_at)}</p>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Ticket Reference
                  </p>
                  <p className="text-xs font-bold text-slate-600">#{ticket.id}</p>
                </div>

              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/user/tickets")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Registry
            </button>

          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserTicketDetail;