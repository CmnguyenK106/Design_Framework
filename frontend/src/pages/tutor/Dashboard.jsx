import { useEffect, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TutorDashboard() {
  const { user } = useAuth();
  const [mySessions, setMySessions] = useState([]);

  useEffect(() => {
    api.get('/sessions')
      .then((res) => setMySessions(res.data.data.filter((s) => s.tutorId === user.id)))
      .catch(() => setMySessions([]));
  }, [user]);

  const stats = [
    { label: 'Tổng phiên', value: mySessions.length, icon: CalendarDays },
    { label: 'Sinh viên đã kèm', value: new Set(mySessions.flatMap((s) => s.students || [])).size, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-6 py-5 text-white shadow">
        <p className="text-sm text-white/90">Xin chào</p>
        <h1 className="text-2xl font-semibold">{user?.name}</h1>
        <p className="text-sm text-white/80">Quản lý lịch rảnh và các phiên sắp tới.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Phiên của tôi</h3>
        <div className="space-y-3">
          {mySessions.slice(0, 6).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.subject}</p>
                <p className="text-xs text-gray-600">{s.date} • {s.startTime} - {s.endTime}</p>
              </div>
              <span className="text-xs text-gray-600">Đăng ký: {s.registered}/{s.maxStudents}</span>
            </div>
          ))}
          {mySessions.length === 0 && <p className="text-sm text-gray-500">Chưa có phiên.</p>}
        </div>
      </div>
    </div>
  );
}
