import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { notificationsAPI } from '../services/api';
import { Skeleton } from '../components/Skeleton';

const TYPE_META = {
  alert:   { icon: 'fa-triangle-exclamation', bg: 'bg-red-100',    text: 'text-red-600',    label: 'Alert'   },
  warning: { icon: 'fa-triangle-exclamation', bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Warning' },
  insight: { icon: 'fa-wand-magic-sparkles',  bg: 'bg-emerald-100',text: 'text-emerald-600',label: 'Insight' },
  success: { icon: 'fa-circle-check',         bg: 'bg-green-100',  text: 'text-green-600',  label: 'Success' },
  system:  { icon: 'fa-circle-info',          bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'System'  },
};

const FILTERS = ['All', 'Unread', 'Alerts', 'Insights', 'System'];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    notificationsAPI.getList()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
        setNotifications(list.map(n => ({ ...n, is_read: n.is_read ?? n.read ?? false })));
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    notificationsAPI.markRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    notificationsAPI.markAllRead().catch(() => {});
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All')     return true;
    if (activeFilter === 'Unread')  return !n.is_read;
    if (activeFilter === 'Alerts')  return ['alert','warning'].includes(n.type?.toLowerCase());
    if (activeFilter === 'Insights')return ['insight','success'].includes(n.type?.toLowerCase());
    if (activeFilter === 'System')  return n.type?.toLowerCase() === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabCount = (filter) => {
    if (filter === 'All')     return notifications.length;
    if (filter === 'Unread')  return unreadCount;
    if (filter === 'Alerts')  return notifications.filter(n => ['alert','warning'].includes(n.type?.toLowerCase())).length;
    if (filter === 'Insights')return notifications.filter(n => ['insight','success'].includes(n.type?.toLowerCase())).length;
    if (filter === 'System')  return notifications.filter(n => n.type === 'system').length;
    return 0;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-check-double text-xs"></i> Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm overflow-x-auto">
          {FILTERS.map(filter => {
            const count = tabCount(filter);
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filter}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeFilter === filter ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-grow">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-72 mb-1" />
                    <Skeleton className="h-3 w-20 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fa-regular fa-bell text-2xl text-gray-300"></i>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                {activeFilter === 'Unread' ? 'All caught up!' : 'No notifications'}
              </h3>
              <p className="text-sm text-gray-400">
                {activeFilter === 'Unread'
                  ? 'You have no unread notifications.'
                  : `No ${activeFilter.toLowerCase()} notifications yet.`}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map(n => {
                const meta = TYPE_META[n.type] ?? TYPE_META.system;
                return (
                  <li
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      !n.is_read
                        ? 'bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Type icon */}
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${meta.bg}`}>
                      <i className={`fa-solid ${meta.icon} text-sm ${meta.text}`}></i>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                          )}
                        </div>
                      </div>
                      {n.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!loading && notifications.length === 0 && activeFilter === 'All' && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Notifications will appear here as your system generates alerts and insights.
          </p>
        )}
      </main>
    </div>
  );
}
