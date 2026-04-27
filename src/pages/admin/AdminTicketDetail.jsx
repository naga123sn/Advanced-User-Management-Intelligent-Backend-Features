import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { PriorityBadge, StatusBadge } from "../../components/common/TicketBadge";
import { formatDate } from "../../utils/helpers";
import {
  getTicketById,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  addComment,
  getAuditLogs,
} from "../../services/ticketService";
import { getAllHelpers } from "../../services/userService";

const LOGS_PER_PAGE = 5;

const actionConfig = {
  TICKET_CREATED:   { icon: "🎫", color: "bg-blue-100 text-blue-700",   label: "Created" },
  STATUS_CHANGED:   { icon: "🔄", color: "bg-purple-100 text-purple-700", label: "Status" },
  PRIORITY_CHANGED: { icon: "🔺", color: "bg-orange-100 text-orange-700", label: "Priority" },
  HELPER_ASSIGNED:  { icon: "👷", color: "bg-teal-100 text-teal-700",    label: "Assigned" },
  COMMENT_ADDED:    { icon: "💬", color: "bg-green-100 text-green-700",  label: "Comment" },
  COMMENT_DELETED:  { icon: "🗑", color: "bg-red-100 text-red-700",      label: "Deleted" },
};

const AdminTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [helpers, setHelpers] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);

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

  const fetchAuditLogs = async () => {
    try {
      const res = await getAuditLogs(id);
      setAuditLogs(res.data);
    } catch {
      setAuditLogs([]);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchAuditLogs();
    getAllHelpers().then((res) => setHelpers(res.data)).catch(() => {});
    // eslint-disable-next-line
  }, [id]);

  const handleStatusChange = async (e) => {
    await updateTicketStatus(id, e.target.value);
    fetchTicket();
    fetchAuditLogs();
  };

  const handlePriorityChange = async (e) => {
    await updateTicketPriority(id, e.target.value);
    fetchTicket();
    fetchAuditLogs();
  };

  const handleAssign = async (e) => {
    if (!e.target.value) return;
    await assignTicket(id, parseInt(e.target.value));
    fetchTicket();
    fetchAuditLogs();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment(id, comment);
    setComment("");
    fetchTicket();
    fetchAuditLogs();
  };

  // Audit log pagination
  const totalLogPages = Math.ceil(auditLogs.length / LOGS_PER_PAGE);
  const logStart = (logsPage - 1) * LOGS_PER_PAGE;
  const paginatedLogs = auditLogs.slice(logStart, logStart + LOGS_PER_PAGE);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center py-32 gap-3">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-400">Loading ticket...</span>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <p className="text-red-500 text-sm">{error}</p>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
      >
        ← Back to Tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Main Content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Ticket Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-2">{ticket.title}</h1>
            <div className="flex gap-2 mb-4">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{ticket.description}</p>
            <p className="text-xs text-gray-400 mt-4">Created: {formatDate(ticket.created_at)}</p>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Comments ({ticket.comments?.length || 0})
            </h2>
            {ticket.comments && ticket.comments.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {ticket.comments.map((c) => (
                  <li key={c.id} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <p>{c.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(c.created_at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No comments yet.</p>
            )}
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Post
              </button>
            </form>
          </div>

          {/* ── Audit Log Section ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-700">Audit Log</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Complete history of all actions on this ticket
                </p>
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                {auditLogs.length} events
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-gray-400 italic">No activity recorded yet.</p>
              </div>
            ) : (
              <>
                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100"></div>

                  <ul className="space-y-4">
                    {paginatedLogs.map((log, index) => {
                      const config = actionConfig[log.action] || {
                        icon: "📌",
                        color: "bg-gray-100 text-gray-600",
                        label: log.action,
                      };
                      return (
                        <li key={log.id} className="flex gap-4 pl-2">
                          {/* Icon bubble */}
                          <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm shrink-0 ${config.color}`}>
                            {config.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${config.color}`}>
                                  {config.label}
                                </span>
                                <span className="text-xs font-semibold text-gray-700">
                                  {log.performed_by}
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  log.performed_by_role === "admin"
                                    ? "bg-blue-50 text-blue-500"
                                    : "bg-green-50 text-green-500"
                                }`}>
                                  {log.performed_by_role}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {log.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Pagination */}
                {auditLogs.length > LOGS_PER_PAGE && (
                  <div className="mt-5 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                    <p>
                      Showing{" "}
                      <span className="font-semibold text-gray-700">
                        {logStart + 1}–{Math.min(logStart + LOGS_PER_PAGE, auditLogs.length)}
                      </span>
                      {" "}of{" "}
                      <span className="font-semibold text-gray-700">{auditLogs.length}</span>
                      {" "}events
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                        disabled={logsPage === 1}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      {Array.from({ length: totalLogPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setLogsPage(page)}
                          className={`w-7 h-7 rounded border text-xs font-semibold transition-all ${
                            logsPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setLogsPage(p => Math.min(totalLogPages, p + 1))}
                        disabled={logsPage === totalLogPages}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* ── Right: Controls Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">STATUS</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                value={ticket.status}
                onChange={handleStatusChange}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">PRIORITY</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                value={ticket.priority}
                onChange={handlePriorityChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ASSIGN TO HELPER</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                value={ticket.helper_id || ""}
                onChange={handleAssign}
              >
                <option value="">Unassigned</option>
                {helpers.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-500 mb-3">TICKET INFO</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Ticket ID:</span> #{ticket.id}</p>
              <p><span className="font-medium">User ID:</span> #{ticket.user_id}</p>
              <p>
                <span className="font-medium">Helper:</span>{" "}
                {ticket.helper_id ? `Helper #${ticket.helper_id}` : "Not assigned"}
              </p>
              <p><span className="font-medium">Created:</span> {formatDate(ticket.created_at)}</p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminTicketDetail;