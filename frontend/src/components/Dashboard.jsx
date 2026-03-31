import React, { useState, useEffect, useCallback } from "react";
import {
  Users, MessageCircle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, Send, TrendingUp,
  Zap, MoreHorizontal, Eye, RefreshCw, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// Tumhari existing api.js se import karo
import { getContacts, getMessages, getTemplates } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildWeeklyData = (messages = []) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map  = {};
  days.forEach(d => { map[d] = { day: d, sent: 0, delivered: 0, failed: 0 }; });
  messages.forEach(m => {
    if (!m.timestamp && !m.createdAt) return;
    const day = days[new Date(m.timestamp || m.createdAt).getDay()];
    if (m.direction === 'outgoing' || m.type === 'outgoing') {
      map[day].sent++;
      if (m.status === 'delivered' || m.status === 'read') map[day].delivered++;
      if (m.status === 'failed') map[day].failed++;
    }
  });
  return days.map(d => map[d]);
};

const buildMonthlyData = (messages = []) => {
  const months  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const map     = {};
  months.forEach(m => { map[m] = { month: m, sent: 0, delivered: 0 }; });
  messages.forEach(msg => {
    if (!msg.timestamp && !msg.createdAt) return;
    const m = months[new Date(msg.timestamp || msg.createdAt).getMonth()];
    if (msg.direction === 'outgoing' || msg.type === 'outgoing') {
      map[m].sent++;
      if (msg.status === 'delivered' || msg.status === 'read') map[m].delivered++;
    }
  });
  return months.map(m => map[m]);
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d2b] border border-indigo-500/20 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, trend, trendValue, gradient, glow, loading }) => (
  <div className="relative bg-[#0d0d2b] rounded-2xl p-5 border border-indigo-500/10 overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${glow} opacity-20 blur-2xl group-hover:opacity-30 transition-all`} />
    <div className="flex justify-between items-start mb-5">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend === "up" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
        {trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {trendValue}
      </div>
    </div>
    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
    {loading
      ? <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
      : <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
    }
  </div>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[...Array(4)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 bg-white/5 rounded animate-pulse" style={{ width: `${50 + i * 15}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ setActivePage }) => {
  const [activeTab, setActiveTab] = useState("week");

  // Data states
  const [contacts,  setContacts]  = useState([]);
  const [messages,  setMessages]  = useState([]);
  const [templates, setTemplates] = useState([]);

  // Loading states
  const [cLoading, setCLoading] = useState(true);
  const [mLoading, setMLoading] = useState(true);
  const [tLoading, setTLoading] = useState(true);

  // Error state
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // campaignStats from localStorage (tumhara existing CampaignsPage save karta hai)
  const [campaignStats, setCampaignStats] = useState({ totalSent: 0, totalFailed: 0 });

  const fetchAll = useCallback(async () => {
    setError('');
    setLastUpdated(new Date());

    // Contacts
    setCLoading(true);
    getContacts()
      .then(res => setContacts(res.data || []))
      .catch(err => setError(err.response?.data?.message || 'Contacts load nahi hue'))
      .finally(() => setCLoading(false));

    // Messages — getMessages() tumhari api.js mein hai
    setMLoading(true);
    getMessages()
      .then(res => setMessages(res.data || []))
      .catch(() => {
        // Fallback: localStorage se campaignStats use karo
        const saved = JSON.parse(localStorage.getItem("campaignStats") || "{}");
        if (saved) setCampaignStats(saved);
      })
      .finally(() => setMLoading(false));

    // Templates
    setTLoading(true);
    getTemplates()
      .then(res => setTemplates(res?.data || []))
      .catch(() => {}) // silently fail
      .finally(() => setTLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
    // localStorage se bhi lo (CampaignsPage save karta hai)
    const saved = JSON.parse(localStorage.getItem("campaignStats") || "{}");
    if (saved.totalSent) setCampaignStats(saved);
  }, [fetchAll]);

  // ─── Computed values ─────────────────────────────────────────────────────
  const outgoing    = messages.filter(m => m.direction === 'outgoing' || m.type === 'outgoing');
  const delivered   = outgoing.filter(m => m.status === 'delivered' || m.status === 'read');
  const read        = outgoing.filter(m => m.status === 'read');
  const failed      = outgoing.filter(m => m.status === 'failed');

  // Campaign se mila zyada accurate totalSent
  const totalSent   = outgoing.length || campaignStats.totalSent || 0;
  const totalFailed = failed.length   || campaignStats.totalFailed || 0;
  const total       = totalSent + totalFailed;
  const successRate = total > 0 ? ((totalSent / total) * 100).toFixed(1) : '0.0';

  // --- Dynamic Trends Calculation ---
  const getTrends = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Contacts trend
    const newContactsThisWeek = contacts.filter(c => new Date(c.createdAt) > oneWeekAgo).length;
    const contactsTrend = contacts.length > 0 
      ? ((newContactsThisWeek / (contacts.length || 1)) * 100).toFixed(1)
      : 0;

    // Messages trend
    const messagesThisWeek = outgoing.filter(m => new Date(m.timestamp || m.createdAt) > oneWeekAgo).length;
    const messagesLastWeek = outgoing.filter(m => {
      const d = new Date(m.timestamp || m.createdAt);
      return d <= oneWeekAgo && d > twoWeeksAgo;
    }).length;
    
    let msgTrendValue = 0;
    let msgTrendDir = "up";
    if (messagesLastWeek > 0) {
      msgTrendValue = (((messagesThisWeek - messagesLastWeek) / messagesLastWeek) * 100).toFixed(1);
      msgTrendDir = msgTrendValue >= 0 ? "up" : "down";
    } else {
      msgTrendValue = messagesThisWeek > 0 ? 100 : 0;
      msgTrendDir = "up";
    }

    return {
      contacts: { value: `+${newContactsThisWeek}`, trend: "up" },
      messages: { value: `${Math.abs(msgTrendValue)}%`, trend: msgTrendDir },
    };
  };

  const trends = getTrends();

  const weeklyData  = buildWeeklyData(messages);
  const monthlyData = buildMonthlyData(messages);

  const pieData = totalSent > 0 ? [
    { name: "Delivered", value: Math.round((delivered.length / totalSent) * 100), color: "#6366f1" },
    { name: "Read",      value: Math.round((read.length      / totalSent) * 100), color: "#8b5cf6" },
    { name: "Replied",   value: Math.round(((outgoing.filter(m => m.replied).length) / totalSent) * 100), color: "#a78bfa" },
    { name: "Failed",    value: Math.round((failed.length    / totalSent) * 100), color: "#1e1b4b" },
  ] : [
    { name: "Delivered", value: 0, color: "#6366f1" },
    { name: "Read",      value: 0, color: "#8b5cf6" },
    { name: "Replied",   value: 0, color: "#a78bfa" },
    { name: "Failed",    value: 0, color: "#1e1b4b" },
  ];

  const statsCards = [
    {
      title: "Total Contacts",
      value: cLoading ? "..." : contacts.length.toLocaleString(),
      icon: <Users size={20} className="text-white" />,
      trend: trends.contacts.trend, 
      trendValue: `${trends.contacts.value} this week`,
      gradient: "from-indigo-500 to-violet-600", glow: "bg-indigo-500",
      loading: cLoading,
    },
    {
      title: "Messages Sent",
      value: mLoading ? "..." : totalSent.toLocaleString(),
      icon: <MessageCircle size={20} className="text-white" />,
      trend: trends.messages.trend, 
      trendValue: `${trends.messages.value} vs last week`,
      gradient: "from-emerald-500 to-teal-600", glow: "bg-emerald-500",
      loading: mLoading,
    },
    {
      title: "Success Rate",
      value: mLoading ? "..." : `${successRate}%`,
      icon: <CheckCircle size={20} className="text-white" />,
      trend: Number(successRate) >= 90 ? "up" : "down",
      trendValue: Number(successRate) >= 90 ? "Excellent" : "Needs work",
      gradient: "from-violet-500 to-purple-600", glow: "bg-violet-500",
      loading: mLoading,
    },
    {
      title: "Templates",
      value: tLoading ? "..." : templates?.length?.toLocaleString(),
      icon: <Zap size={20} className="text-white" />,
      trend: "up", 
      trendValue: `${templates.filter(t => t.status === 'approved').length} approved`,
      gradient: "from-amber-500 to-orange-500", glow: "bg-amber-500",
      loading: tLoading,
    },
  ];

  const statusStyle = {
    Active:  "bg-emerald-500/15 text-emerald-400",
    Pending: "bg-amber-500/15  text-amber-400",
    Failed:  "bg-red-500/15    text-red-400",
  };

  // ─── System status — real checks ─────────────────────────────────────────
  const [sysStatus, setSysStatus] = useState({
    backend: 'checking', whatsapp: 'checking',
    database: 'checking', queue: 'checking',
  });

  useEffect(() => {
    // Backend alive check
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    fetch(`${baseUrl}/health`)
      .then(r => setSysStatus(s => ({ ...s, backend: r.ok ? 'online' : 'error' })))
      .catch(() => setSysStatus(s => ({ ...s, backend: 'offline' })));

    // WhatsApp status
    fetch(`${baseUrl}/whatsapp/status`)
      .then(r => r.json())
      .then(d => setSysStatus(s => ({ ...s, whatsapp: d.connected ? 'connected' : 'disconnected' })))
      .catch(() => setSysStatus(s => ({ ...s, whatsapp: 'unknown' })));

    // DB + Queue
    fetch(`${baseUrl}/health/detailed`)
      .then(r => r.json())
      .then(d => setSysStatus(s => ({ ...s, database: d.db || 'online', queue: d.queue || 'active' })))
      .catch(() => setSysStatus(s => ({ ...s, database: 'unknown', queue: 'unknown' })));
  }, []);

  const statusDot = (s) => {
    const m = {
      online: 'bg-emerald-400', connected: 'bg-emerald-400',
      offline: 'bg-red-400', error: 'bg-red-400', disconnected: 'bg-red-400',
      checking: 'bg-amber-400', unknown: 'bg-slate-400', active: 'bg-indigo-400',
    };
    return m[s] || 'bg-slate-400';
  };

  const statusBar = (s) => ({
    online: 'w-full bg-emerald-500', connected: 'w-full bg-emerald-500',
    offline: 'w-1/4 bg-red-500',    error: 'w-1/4 bg-red-500',
    checking: 'w-1/2 bg-amber-500 animate-pulse',
    active: 'w-4/5 bg-indigo-500',  unknown: 'w-1/3 bg-slate-500',
  }[s] || 'w-1/3 bg-slate-500');

  if (error && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <AlertCircle size={30} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Backend Connect Nahi Ho Raha</h3>
        <p className="text-slate-400 max-w-md text-sm mb-2">{error}</p>
        <button onClick={fetchAll}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all flex items-center gap-2">
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time performance and system metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Last Sync</p>
            <p className="text-xs text-indigo-400 font-medium">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <button onClick={fetchAll} 
            className="p-2.5 bg-[#0d0d2b] border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all group">
            <RefreshCw size={18} className={cLoading || mLoading || tLoading ? "animate-spin" : "group-hover:rotate-180 transition-all duration-500"} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Area Chart */}
        <div className="lg:col-span-2 bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm">Message Activity</h3>
              <p className="text-slate-500 text-xs mt-0.5">Sent vs delivered</p>
            </div>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
              {["week", "month"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${activeTab === t ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {mLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <RefreshCw size={18} className="text-indigo-400 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activeTab === "week" ? weeklyData : monthlyData}>
                <defs>
                  <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="delivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey={activeTab === "week" ? "day" : "month"} tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sent"      stroke="#6366f1" strokeWidth={2} fill="url(#sent)"      name="Sent" />
                <Area type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} fill="url(#delivered)" name="Delivered" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm">Delivery Breakdown</h3>
            <p className="text-slate-500 text-xs mt-0.5">Overall message status</p>
          </div>
          {mLoading ? (
            <div className="h-[160px] flex items-center justify-center">
              <RefreshCw size={18} className="text-indigo-400 animate-spin" />
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-slate-400">{item.name}</span>
                    <span className="text-xs text-slate-200 font-semibold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Bar Chart */}
        <div className="bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm">Monthly Activity</h3>
            <p className="text-slate-500 text-xs mt-0.5">Sent vs delivered per month</p>
          </div>
          {mLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <RefreshCw size={18} className="text-indigo-400 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sent"      fill="#6366f1" radius={[4,4,0,0]} name="Sent" />
                <Bar dataKey="delivered" fill="#8b5cf6" radius={[4,4,0,0]} name="Delivered" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm">Weekly Trend</h3>
              <p className="text-slate-500 text-xs mt-0.5">Message volume this week</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                {totalSent} total sent
              </span>
            </div>
          </div>
          {mLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <RefreshCw size={18} className="text-indigo-400 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="sent"
                  stroke="#6366f1" strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#07071a" }}
                  activeDot={{ r: 6, fill: "#818cf8" }} name="Sent" />
                <Line type="monotone" dataKey="delivered"
                  stroke="#8b5cf6" strokeWidth={2.5}
                  dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 2, stroke: "#07071a" }}
                  activeDot={{ r: 6, fill: "#a78bfa" }} name="Delivered" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Contacts Table */}
        <div className="lg:col-span-2 bg-[#0d0d2b] rounded-2xl border border-indigo-500/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-500/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Recent Contacts</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {cLoading ? 'Loading...' : `${contacts.length} total contacts`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchAll} className="text-slate-500 hover:text-indigo-400 transition-colors">
                <RefreshCw size={13} className={cLoading ? "animate-spin" : ""} />
              </button>
              <button onClick={() => setActivePage?.("contacts")}
                className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 flex items-center gap-1">
                <Eye size={13} /> View All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-500/10">
                  {["Contact", "Phone", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/5">
                {cLoading ? (
                  [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={24} className="text-slate-700" />
                        <p className="text-slate-500 text-sm">Koi contact nahi hai abhi</p>
                        <button onClick={() => setActivePage?.("contacts")} className="text-indigo-400 text-xs font-semibold">
                          + Add Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.slice(0, 5).map(c => (
                    <tr key={c._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
                            {(c.name || 'U')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-200">{c.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500 font-mono">{c.phone}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[c.status] || statusStyle.Active}`}>
                          {c.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button className="text-slate-500 hover:text-indigo-400 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">

          {/* System Status */}
          <div className="bg-[#0d0d2b] rounded-2xl p-5 border border-indigo-500/10">
            <h3 className="text-white font-semibold text-sm mb-5">System Status</h3>
            <div className="space-y-4">
              {[
                { label: "Backend API",       key: "backend"  },
                { label: "WhatsApp Instance", key: "whatsapp" },
                { label: "Database",          key: "database" },
                { label: "Message Queue",     key: "queue"    },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(sysStatus[s.key])} ${['online','connected','checking'].includes(sysStatus[s.key]) ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-medium text-slate-300">{s.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize">{sysStatus[s.key]}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statusBar(sysStatus[s.key])} opacity-60 transition-all duration-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0d0d2b] rounded-2xl p-5 border border-indigo-500/10">
            <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Send Campaign", icon: <Send size={15} />,      gradient: "from-indigo-600 to-violet-600",  glow: "shadow-[0_0_20px_rgba(99,102,241,0.3)]",  id: "campaigns"  },
                { label: "Add Contact",  icon: <Users size={15} />,      gradient: "from-emerald-600 to-teal-600",   glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",  id: "contacts"   },
                { label: "New Template", icon: <Zap size={15} />,        gradient: "from-amber-500 to-orange-500",   glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",  id: "templates"  },
                { label: "Open Chat",    icon: <MessageCircle size={15} />, gradient: "from-violet-600 to-purple-600",  glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",  id: "chat"  },
              ].map((a, i) => (
                <button key={i} onClick={() => setActivePage?.(a.id)}
                  className={`flex flex-col items-center gap-2 p-3.5 bg-gradient-to-br ${a.gradient} rounded-xl ${a.glow} hover:scale-105 transition-all duration-200 text-white`}>
                  {a.icon}
                  <span className="text-[11px] font-semibold text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;