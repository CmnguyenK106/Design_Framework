import { useEffect, useState } from 'react';
import {
  Bell,
  Calendar,
  Home,
  Users,
  UserCog,
  MessageSquare,
  Folder,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const menuByRole = {
  member: [
    { to: '/student/dashboard', label: 'Dashboard', icon: Home },
    { to: '/student/sessions', label: 'Phiên tư vấn', icon: Calendar },
    { to: '/student/profile', label: 'Hồ sơ', icon: Users },
    { to: '/student/notifications', label: 'Thông báo', icon: Bell },
    { to: '/student/feedback', label: 'Feedback', icon: BookOpen },
    { to: '/student/messages', label: 'Nhắn tin', icon: MessageSquare },
    { to: '/student/resources', label: 'Tài nguyên', icon: Folder },
  ],
  tutor: [
    { to: '/tutor/dashboard', label: 'Dashboard', icon: Home },
    { to: '/tutor/sessions', label: 'Lịch dạy', icon: Calendar },
    { to: '/tutor/pair-requests', label: 'Ghép cặp', icon: Users },
    { to: '/tutor/profile', label: 'Hồ sơ', icon: Users },
    { to: '/tutor/notifications', label: 'Thông báo', icon: Bell },
    { to: '/tutor/feedback', label: 'Feedback', icon: BookOpen },
    { to: '/tutor/messages', label: 'Nhắn tin', icon: MessageSquare },
    { to: '/tutor/resources', label: 'Tài nguyên', icon: Folder },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Người dùng', icon: UserCog },
    { to: '/admin/sessions', label: 'Phiên tư vấn', icon: Calendar },
    { to: '/admin/feedback', label: 'Feedback', icon: BookOpen },
    { to: '/admin/messages', label: 'Nhắn tin', icon: MessageSquare },
    { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
    { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const menuItems = menuByRole[user?.role] || [];
  const [collapsed, setCollapsed] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    let timer;
    const loadUnread = () => {
      api
        .get('/messages/conversations')
        .then((res) => {
          const total = res.data.data?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) || 0;
          setUnreadChat(total);
        })
        .catch(() => {});
    };
    if (user) {
      loadUnread();
      timer = setInterval(loadUnread, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  return (
    <aside className={`min-h-[calc(100vh-64px)] ${collapsed ? 'w-16' : 'w-64'} border-r border-gray-200 bg-white px-3 py-6 transition-all`}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-md border border-gray-200 p-1 text-gray-600 hover:border-primary hover:text-primary"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="space-y-2">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-primary/10 ${
                isActive ? 'bg-primary/20 text-primary' : 'text-gray-800'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            {!collapsed && (
              <span className="flex items-center gap-2">
                {label}
                {label === 'Nhắn tin' && unreadChat > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 text-[11px] font-bold text-white">
                    {unreadChat}
                  </span>
                )}
              </span>
            )}
            {collapsed && label === 'Nhắn tin' && unreadChat > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
