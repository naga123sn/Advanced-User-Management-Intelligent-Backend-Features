import React, { useState } from "react";
import UserLayout from "../../components/user/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/userService";

const UserProfile = () => {
  const { user, login, token } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess(""); setError("");
    try {
      const res = await updateProfile(user.id, { name, email });
      login(res.data, token);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <span>Platform</span>
          <span>/</span>
          <span>Settings</span>
          <span>/</span>
          <span className="text-red-900 font-black">Identity Profile</span>
        </nav>

        {/* Identity Header */}
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-[#450a0a] flex items-center justify-center text-white text-2xl font-light tracking-tighter shadow-xl shadow-red-900/20">
            {name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">
              Profile Settings
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">
              Update your personal credentials and identity metadata.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Side Info Column */}
          <div className="space-y-6">
            <div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Account Status</h4>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Verified Account</span>
                </div>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                    Changes to your email workspace may require re-validation of your active support sessions.
                </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              
              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border-r-4 border-emerald-600 text-emerald-800 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-900 text-red-900 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-red-900 transition-colors">
                    Full Legal Name
                  </label>
                  <input type="text"
                    className="w-full bg-slate-50 border-b-2 border-slate-100 px-0 py-3 text-sm text-slate-900 focus:outline-none focus:border-red-900 focus:bg-white transition-all placeholder:text-slate-300 font-medium"
                    value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-red-900 transition-colors">
                    Primary Workspace Email
                  </label>
                  <input type="email"
                    className="w-full bg-slate-50 border-b-2 border-slate-100 px-0 py-3 text-sm text-slate-900 focus:outline-none focus:border-red-900 focus:bg-white transition-all placeholder:text-slate-300 font-medium"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="group opacity-70">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    System Authority Level
                  </label>
                  <div className="relative">
                    <input type="text"
                      className="w-full bg-slate-50 border-b-2 border-slate-100 px-0 py-3 text-sm text-slate-400 font-bold uppercase tracking-widest cursor-not-allowed"
                      value="Standard User" readOnly />
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit"
                    className="w-full md:w-auto px-10 py-4 bg-[#450a0a] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-red-900 shadow-xl shadow-red-900/10 transition-all active:scale-95">
                    Save Synchronization
                  </button>
                </div>
              </form>
            </div>
            
            <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] text-center md:text-left">
              Secure Identity Vault • AES-256 Protected
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;