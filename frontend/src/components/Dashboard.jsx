import React from 'react';
import { 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        {icon}
      </div>
      <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trendValue}
        {trend === 'up' ? <ArrowUpRight size={16} className="ml-1" /> : <ArrowDownRight size={16} className="ml-1" />}
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const Dashboard = ({ contacts, loading, error }) => {
  const stats = [
    { title: 'Total Contacts', value: contacts.length, icon: <Users size={20} />, trend: 'up', trendValue: '+12%', color: 'bg-blue-500' },
    { title: 'Messages Sent', value: '1,284', icon: <MessageCircle size={20} />, trend: 'up', trendValue: '+8%', color: 'bg-green-500' },
    { title: 'Success Rate', value: '98.5%', icon: <CheckCircle size={20} />, trend: 'up', trendValue: '+2%', color: 'bg-purple-500' },
    { title: 'Avg. Response', value: '2.4m', icon: <Clock size={20} />, trend: 'down', trendValue: '-5%', color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your campaigns.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Contacts Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Contacts</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading contacts...</td></tr>
                ) : error ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                ) : contacts.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No contacts found.</td></tr>
                ) : (
                  contacts.slice(0, 5).map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{contact.name}</td>
                      <td className="px-6 py-4 text-gray-600">{contact.phone}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors mr-3">Edit</button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-6">System Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Backend API</span>
              </div>
              <span className="text-xs text-gray-400">Stable</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm font-medium text-gray-700">WhatsApp Instance</span>
              </div>
              <span className="text-xs text-gray-400">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Database</span>
              </div>
              <span className="text-xs text-gray-400">92% Capacity</span>
            </div>
            <hr className="border-gray-100" />
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                  Send Campaign
                </button>
                <button className="p-3 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
