import React from "react";
import Sidebar from "../common/Sidebar";

// Professional Minimalist Icon Set (SVG)
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Create: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Archive: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Identity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const userLinks = [
  { to: "/user/dashboard", icon: <Icons.Dashboard />, label: "Command Center" },
  { to: "/user/create-ticket", icon: <Icons.Create />, label: "New Submission" },
  { to: "/user/tickets", icon: <Icons.Archive />, label: "Ticket Registry" },
  { to: "/user/profile", icon: <Icons.Identity />, label: "User Identity" },
];

const UserLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* 
          Sidebar Component Note: 
          Ensure your Sidebar component renders {link.icon} directly 
          rather than as a string to support these SVG components.
      */}
      <aside className="border-r border-slate-100 bg-[#450A0A] text-white">
        <Sidebar links={userLinks} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* Subtle Top Utility Bar */}
        <header className="h-16 border-b border-slate-50 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              System Linked: Operational
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-[#450A0A] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-6 w-[1px] bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
              Session Active
            </span>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <section className="flex-1 relative overflow-y-auto bg-white">
          {children}
        </section>

        {/* Global System Footer */}
        <footer className="px-8 py-4 border-t border-slate-50 flex justify-between items-center bg-white">
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
             Query.IO Enterprise Suite v2.0
           </p>
           <div className="flex gap-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-red-900 transition-colors">Privacy</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-red-900 transition-colors">SLA Agreement</span>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default UserLayout;