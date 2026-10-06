import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notifications.service';
import { formatDate } from '../utils/format';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = () => fetchNotifications().then((d) => { setItems(d.items); setUnreadCount(d.unreadCount); });

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (id) => { await markNotificationRead(id); load(); };
  const markAll = async () => { await markAllNotificationsRead(); load(); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-lg hover:bg-ink/[0.05] focus-ring" aria-label="Notifications">
        <Bell size={19} strokeWidth={1.75} className="text-ink-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rust" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card p-0 overflow-hidden z-20 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink/[0.07]">
            <span className="text-sm font-medium text-ink-700">Notifications</span>
            {unreadCount > 0 && <button onClick={markAll} className="text-xs text-growth hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && <p className="text-sm text-ink-300 px-4 py-6 text-center">You're all caught up.</p>}
            {items.map((n) => (
              <div key={n._id} className={`px-4 py-3 border-b border-ink/[0.05] last:border-0 ${!n.isRead ? 'bg-growth-100/50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-ink-700">{n.title}</p>
                    <p className="text-xs text-ink-300 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-ink-300/70 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n._id)} className="p-1 rounded hover:bg-ink/[0.06] shrink-0" aria-label="Mark read">
                      <Check size={14} className="text-growth" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
