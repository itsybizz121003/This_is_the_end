import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut,
  Send
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <Users size={20} />, label: 'Contacts', active: false },
    { icon: <FileText size={20} />, label: 'Templates', active: false },
    { icon: <Send size={20} />, label: 'Campaigns', active: false },
    { icon: <MessageSquare size={20} />, label: 'Messages', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Send className="text-blue-400 mr-2" size={24} />
        <h1 className="text-xl font-bold tracking-tight">WhatsApp AI</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
