import { useEffect, useState } from 'react';
import { BarChart3, Users } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, sessions: 0, tutors: 0 });

  useEffect(() => {
    Promise.all([api.get('/admin/users'), api.get('/sessions')])
      .then(([usersRes, sessionsRes]) => {
        const users = usersRes.data.data;
        const sessions = sessionsRes.data.data;
        setStats({
          users: users.length,
          tutors: users.filter((u) => u.role === 'tutor').length,
          sessions: sessions.length,
        });
      })
      .catch(() => setStats({ users: 0, sessions: 0, tutors: 0 }));
  }, []);

  const cards = [
    { label: 'Tổng người dùng', value: stats.users, icon: Users },
    { label: 'Tutor', value: stats.tutors, icon: Users },
    { label: 'Tổng phiên', value: stats.sessions, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-6 py-5 text-white shadow">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-white/80">Giám sát người dùng và phiên tư vấn.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
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
    </div>
  );
}
