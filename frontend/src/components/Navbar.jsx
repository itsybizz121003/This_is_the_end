import React, { useState } from "react";
import { Bell, Search, ChevronDown, Sparkles, Menu } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const Navbar = ({ pageTitle = "Dashboard Overview", toggleSidebar, isSidebarOpen }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();

  const handleToggleNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      markAllAsRead();
    }
  };

  return (
    <nav className="h-[70px] bg-[#07071a]/80 backdrop-blur-xl border-b border-indigo-500/10 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
      {/* Left - Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden xs:block">
          <h2 className="text-white font-bold text-lg tracking-tight leading-none">
            {pageTitle}
          </h2>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
       
       
       

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleToggleNotif}
            className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all group"
          >
            <Bell size={18} className={unreadCount > 0 ? "text-indigo-400" : ""} />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)] animate-blink" />
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-[9px] text-white font-bold px-1.5 py-0.5 rounded-full border border-[#07071a]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0d0d2b] border border-indigo-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="px-4 py-3 border-b border-indigo-500/10 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-200">
                  Notifications
                </span>
                <span 
                  onClick={clearNotifications}
                  className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300"
                >
                  Clear all
                </span>
              </div>
              <div className="divide-y divide-indigo-500/10 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${n.dot} mt-1.5 shrink-0`}
                      />
                      <div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {n.text}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-slate-500">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="flex items-center gap-2 sm:gap-2.5 sm:pl-3 sm:border-l sm:border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            A
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-semibold text-slate-200 leading-none">
              Admin
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Super Admin</p>
          </div>
         
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
