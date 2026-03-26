import React from "react";
import { useChat } from "../context/ChatContext";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  LogOut,
  Send,
  Zap,
  ChevronRight,
  X,
} from "lucide-react";

const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const { totalUnreadCount } = useChat();
  const menuItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      id: "dashboard",
    },
    { icon: <Users size={18} />, label: "Contacts", id: "contacts" },
    { 
      icon: <MessageSquare size={18} />, 
      label: "Chat", 
      id: "chat",
      unreadCount: totalUnreadCount 
    },
    { icon: <FileText size={18} />, label: "Templates", id: "templates" },
    { icon: <Send size={18} />, label: "Broadcast Campaign", id: "campaigns" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#07071a] via-[#0d0d2b] to-[#07071a] flex flex-col border-r border-indigo-500/10 z-50 transition-all duration-300 ease-in-out
      ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 overflow-hidden"}`}
    >
      {/* Logo & Close Button */}
      <div className="h-[70px] flex items-center justify-between px-6 border-b border-indigo-500/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
            <Zap size={17} className="text-white fill-white" />
          </div>
          <div className={`${!isOpen && "lg:hidden"}`}>
            <p className="text-[15px] font-bold text-white tracking-tight leading-none">
              ITSYBIZZ AI
            </p>
          </div>
        </div>
        
        {/* Close Button - Only Mobile */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage?.(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-l-2 transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-indigo-500/15 border-indigo-500"
                        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-[13.5px] ${isActive ? "text-indigo-200 font-semibold" : "font-medium"}`}
                    >
                      {item.label}
                    </span>
                    {item.unreadCount > 0 && (
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-blink">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <ChevronRight size={14} className="text-indigo-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

      
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-indigo-500/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate">
              Admin User
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              admin@whatsapp.ai
            </p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-[13.5px] font-medium">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
