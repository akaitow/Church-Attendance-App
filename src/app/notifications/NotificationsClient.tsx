"use client";

import { useState } from "react";
import { markAsRead, markAllAsRead } from "../actions/notifications";

export default function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await markAsRead(id);
    } catch {
      // Ignore error for MVP or show toast
    }
  };

  const handleMarkAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await markAllAsRead();
    } catch {
      // Ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2>Notifications {unreadCount > 0 && <span className="badge badge-present">{unreadCount}</span>}</h2>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn btn-secondary text-sm">Mark all as read</button>
        )}
      </div>

      <div className="card p-0" style={{ overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="p-6 text-center" style={{ color: 'var(--secondary)' }}>You have no notifications.</div>
        ) : (
          <ul className="flex flex-col" style={{ listStyle: 'none' }}>
            {notifications.map(n => (
              <li 
                key={n.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b transition-colors" 
                style={{ 
                  borderColor: 'var(--border)', 
                  backgroundColor: n.isRead ? 'var(--background)' : 'var(--unknown-light)',
                  borderLeft: n.isRead ? '4px solid transparent' : '4px solid var(--primary)'
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 600 }}>{n.title}</span>
                  </div>
                  <span style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{n.body}</span>
                </div>
                {!n.isRead && (
                  <button onClick={() => handleMarkAsRead(n.id)} className="btn mt-2 sm:mt-0" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)' }}>
                    Mark Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
