import React, { useState } from "react";
import {
  Users,
  MessageCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  TrendingUp,
  Zap,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const messageData = [
  { day: "Mon", sent: 320, delivered: 310, failed: 10 },
  { day: "Tue", sent: 480, delivered: 465, failed: 15 },
  { day: "Wed", sent: 390, delivered: 382, failed: 8 },
  { day: "Thu", sent: 610, delivered: 598, failed: 12 },
  { day: "Fri", sent: 720, delivered: 705, failed: 15 },
  { day: "Sat", sent: 530, delivered: 520, failed: 10 },
  { day: "Sun", sent: 290, delivered: 285, failed: 5 },
];

const revenueData = [
  { month: "Jan", campaigns: 40, responses: 24 },
  { month: "Feb", campaigns: 55, responses: 38 },
  { month: "Mar", campaigns: 47, responses: 30 },
  { month: "Apr", campaigns: 80, responses: 67 },
  { month: "May", campaigns: 65, responses: 50 },
  { month: "Jun", campaigns: 95, responses: 80 },
  { month: "Jul", campaigns: 110, responses: 92 },
  { month: "Aug", campaigns: 88, responses: 74 },
];

const pieData = [
  { name: "Delivered", value: 72, color: "#6366f1" },
  { name: "Read", value: 18, color: "#8b5cf6" },
  { name: "Replied", value: 7, color: "#a78bfa" },
  { name: "Failed", value: 3, color: "#1e1b4b" },
];

const contacts = [
  {
    _id: "1",
    name: "Riya Sharma",
    phone: "+91 98765 43210",
    status: "Active",
    campaign: "Summer Sale",
    sent: "2h ago",
  },
  {
    _id: "2",
    name: "Arjun Mehta",
    phone: "+91 87654 32109",
    status: "Active",
    campaign: "Flash Offer",
    sent: "3h ago",
  },
  {
    _id: "3",
    name: "Priya Singh",
    phone: "+91 76543 21098",
    status: "Pending",
    campaign: "Newsletter",
    sent: "5h ago",
  },
  {
    _id: "4",
    name: "Vikram Patel",
    phone: "+91 65432 10987",
    status: "Active",
    campaign: "Summer Sale",
    sent: "6h ago",
  },
  {
    _id: "5",
    name: "Neha Gupta",
    phone: "+91 54321 09876",
    status: "Failed",
    campaign: "Retargeting",
    sent: "8h ago",
  },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d2b] border border-indigo-500/20 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p
            key={i}
            className="text-xs font-semibold"
            style={{ color: p.color }}
          >
            {p.name}: <span className="text-white">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  gradient,
  glow,
}) => (
  <div
    className={`relative bg-[#0d0d2b] rounded-2xl p-5 border border-indigo-500/10 overflow-hidden group hover:border-indigo-500/30 transition-all duration-300`}
  >
    {/* Glow blob */}
    <div
      className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${glow} opacity-20 blur-2xl group-hover:opacity-30 transition-all`}
    />

    <div className="flex justify-between items-start mb-5">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
      >
        {icon}
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend === "up" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
      >
        {trend === "up" ? (
          <ArrowUpRight size={13} />
        ) : (
          <ArrowDownRight size={13} />
        )}
        {trendValue}
      </div>
    </div>

    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
      {title}
    </p>
    <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("week");

  const stats = [
    {
      title: "Total Contacts",
      value: "12,489",
      icon: <Users size={20} className="text-white" />,
      trend: "up",
      trendValue: "+12%",
      gradient: "from-indigo-500 to-violet-600",
      glow: "bg-indigo-500",
    },
    {
      title: "Messages Sent",
      value: "84,201",
      icon: <MessageCircle size={20} className="text-white" />,
      trend: "up",
      trendValue: "+8%",
      gradient: "from-emerald-500 to-teal-600",
      glow: "bg-emerald-500",
    },
    {
      title: "Success Rate",
      value: "98.5%",
      icon: <CheckCircle size={20} className="text-white" />,
      trend: "up",
      trendValue: "+2%",
      gradient: "from-violet-500 to-purple-600",
      glow: "bg-violet-500",
    },
    {
      title: "Avg. Response",
      value: "2.4m",
      icon: <Clock size={20} className="text-white" />,
      trend: "down",
      trendValue: "-5%",
      gradient: "from-amber-500 to-orange-500",
      glow: "bg-amber-500",
    },
  ];

  const statusStyle = {
    Active: "bg-emerald-500/15 text-emerald-400",
    Pending: "bg-amber-500/15 text-amber-400",
    Failed: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#07071a] p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Here's what's happening with your campaigns.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
          <Send size={15} />
          New Campaign
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Area Chart - Messages */}
        <div className="lg:col-span-2 bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm">
                Message Activity
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Sent vs delivered this week
              </p>
            </div>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
              {["week", "month"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${activeTab === t ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={messageData}>
              <defs>
                <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="delivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(99,102,241,0.08)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#sent)"
                name="Sent"
              />
              <Area
                type="monotone"
                dataKey="delivered"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#delivered)"
                name="Delivered"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Delivery Status */}
        <div className="bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm">
              Delivery Breakdown
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Overall message status
            </p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-xs text-slate-400">{item.name}</span>
                <span className="text-xs text-slate-200 font-semibold ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Bar Chart */}
        <div className="bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm">
              Campaign Performance
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Monthly campaigns vs responses
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={8}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(99,102,241,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#475569", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="campaigns"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="Campaigns"
              />
              <Bar
                dataKey="responses"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                name="Responses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Growth */}
        <div className="lg:col-span-2 bg-[#0d0d2b] rounded-2xl p-6 border border-indigo-500/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm">
                Contact Growth
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                New contacts added monthly
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                +24% this month
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(99,102,241,0.08)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="campaigns"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{
                  fill: "#6366f1",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "#07071a",
                }}
                activeDot={{ r: 6, fill: "#818cf8" }}
                name="Campaigns"
              />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{
                  fill: "#8b5cf6",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "#07071a",
                }}
                activeDot={{ r: 6, fill: "#a78bfa" }}
                name="Responses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Contacts Table */}
        <div className="lg:col-span-2 bg-[#0d0d2b] rounded-2xl border border-indigo-500/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-500/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">
                Recent Contacts
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Latest activity from your contacts
              </p>
            </div>
            <button className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <Eye size={13} /> View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-500/10">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Sent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/5">
                {contacts.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
                          {c.name[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">
                      {c.phone}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md font-medium">
                        {c.campaign}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[c.status]}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      {c.sent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status + Quick Actions */}
        <div className="flex flex-col gap-5">
          {/* System Status */}
          <div className="bg-[#0d0d2b] rounded-2xl p-5 border border-indigo-500/10">
            <h3 className="text-white font-semibold text-sm mb-5">
              System Status
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Backend API",
                  status: "Stable",
                  dot: "bg-emerald-400",
                  glow: "shadow-[0_0_8px_#34d399]",
                  bar: "w-full bg-emerald-500",
                },
                {
                  label: "WhatsApp Instance",
                  status: "Connected",
                  dot: "bg-emerald-400",
                  glow: "shadow-[0_0_8px_#34d399]",
                  bar: "w-full bg-emerald-500",
                },
                {
                  label: "Database",
                  status: "92%",
                  dot: "bg-amber-400",
                  glow: "shadow-[0_0_8px_#fbbf24]",
                  bar: "w-[92%] bg-amber-500",
                },
                {
                  label: "Message Queue",
                  status: "Active",
                  dot: "bg-indigo-400",
                  glow: "shadow-[0_0_8px_#818cf8]",
                  bar: "w-[78%] bg-indigo-500",
                },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.glow} ${i < 2 ? "animate-pulse" : ""}`}
                      />
                      <span className="text-xs font-medium text-slate-300">
                        {s.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {s.status}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.bar} opacity-60`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0d0d2b] rounded-2xl p-5 border border-indigo-500/10">
            <h3 className="text-white font-semibold text-sm mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Send Campaign",
                  icon: <Send size={15} />,
                  gradient: "from-indigo-600 to-violet-600",
                  glow: "shadow-[0_0_20px_rgba(99,102,241,0.3)]",
                },
                {
                  label: "Add Contact",
                  icon: <Users size={15} />,
                  gradient: "from-emerald-600 to-teal-600",
                  glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
                },
                {
                  label: "New Template",
                  icon: <Zap size={15} />,
                  gradient: "from-amber-500 to-orange-500",
                  glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                },
                {
                  label: "View Reports",
                  icon: <TrendingUp size={15} />,
                  gradient: "from-violet-600 to-purple-600",
                  glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
                },
              ].map((a, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-3.5 bg-gradient-to-br ${a.gradient} rounded-xl ${a.glow} hover:scale-105 transition-all duration-200 text-white`}
                >
                  {a.icon}
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {a.label}
                  </span>
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
