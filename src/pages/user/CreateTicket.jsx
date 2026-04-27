import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import { createTicket } from "../../services/ticketService";

const CreateTicket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createTicket({ title, description, priority });
      navigate("/user/tickets");
    } catch (err) {
      setError("Failed to create ticket. Please try again.");
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Header & Breadcrumb */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <span>Platform</span>
            <span>/</span>
            <span>Tickets</span>
            <span>/</span>
            <span className="text-red-900 font-black">New Submission</span>
          </nav>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">
            Create Support Ticket
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Please provide detailed information to ensure rapid resolution.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-[#450a0a]"></div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-2 border-red-900 text-red-900 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Row 1: Title & Priority */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-red-900 transition-colors">
                    Incident Title
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of the issue"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-900 focus:bg-white transition-all placeholder:text-slate-300"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-red-900 transition-colors">
                    Priority Level
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-900 focus:bg-white appearance-none transition-all cursor-pointer"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low - Routine</option>
                      <option value="medium">Medium - Standard</option>
                      <option value="high">High - Urgent</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-red-900 transition-colors">
                  Technical Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Describe the steps to reproduce or the nature of the query..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-900 focus:bg-white transition-all resize-none placeholder:text-slate-300"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Estimated response: &lt; 2 Hours</span>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate("/user/tickets")}
                    className="flex-1 md:flex-none px-8 py-3 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-slate-50 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 md:flex-none px-10 py-3 bg-[#450a0a] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-red-900 shadow-xl shadow-red-900/20 transition-all active:scale-95"
                  >
                    Submit Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* System Footer Note */}
        <p className="mt-8 text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em]">
          Secure Transmission Enabled • End-to-End Encrypted Query
        </p>
      </div>
    </UserLayout>
  );
};

export default CreateTicket;