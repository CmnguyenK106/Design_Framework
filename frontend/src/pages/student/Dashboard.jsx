import { useEffect, useState } from 'react';
import { Calendar, Clock, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/sessions', { params: { status: 'scheduled' } })
      .then((res) => setSessions(res.data.data.slice(0, 5)))
      .catch(() => setSessions([]));
  }, []);

  const stats = [
    { label: 'Phiên sắp tới', value: sessions.length, icon: Calendar },
    { label: 'Đã hoàn thành', value: 50, icon: Clock },
    { label: 'Tutor khả dụng', value: 12, icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-6 py-5 text-white shadow">
        <p className="text-sm text-white/90">Chào mừng trở lại</p>
        <h1 className="text-2xl font-semibold">{user?.name}</h1>
        <p className="text-sm text-white/80">Theo dõi phiên tư vấn và cập nhật hồ sơ của bạn.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Phiên sắp tới</h3>
          <span className="text-sm text-gray-500">Top 5</span>
        </div>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.subject}</p>
                <p className="text-xs text-gray-600">
                  {s.date} • {s.startTime} - {s.endTime} • {s.location}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {s.status === 'scheduled' ? 'Còn chỗ' : s.status}
              </span>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-gray-500">Chưa có phiên nào.</p>}
        </div>
      </div>
    </div>
  );
}
