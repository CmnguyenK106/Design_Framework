import { LogOut, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Header() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    const load = () => {
      api.get('/notifications', { params: { status: 'unread' } })
        .then((res) => setUnread(res.data.data?.length || 0))
        .catch(() => {});
    };
    if (user) {
      load();
      timer = setInterval(load, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  const goNotifications = () => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin/notifications');
    else if (user.role === 'tutor') navigate('/tutor/notifications');
    else navigate('/student/notifications');
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo-hcmut-icon.png" alt="HCMUT Logo" className="h-10 w-10 object-contain" />
        <div>
          <p className="text-sm font-semibold text-primary">Tutor Support System</p>
          <p className="text-xs text-gray-600">HCMUT · Mock SSO</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goNotifications}
          className="relative rounded-full border border-gray-200 p-2 text-gray-700 hover:border-primary hover:text-primary"
          aria-label="Thông báo"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-600 uppercase">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-md border border-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
