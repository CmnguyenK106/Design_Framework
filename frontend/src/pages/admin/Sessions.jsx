import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => {
    api.get('/sessions')
      .then((res) => setSessions(res.data.data))
      .catch(() => setSessions([]));
  }, []);

  const filtered = useMemo(() => sessions.filter((s) => {
    const text = `${s.subject} ${s.tutorName}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (status !== 'all' && s.status !== status) return false;
    if (type !== 'all' && s.type !== type) return false;
    return true;
  }), [sessions, search, status, type]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tất cả phiên tư vấn</h2>
        <p className="text-sm text-gray-600">Xem nhanh trạng thái các phiên.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Tìm kiếm môn/tutor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <th className="px-3 py-2">Môn học</th>
              <th className="px-3 py-2">Tutor</th>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Giờ</th>
              <th className="px-3 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-gray-100">
                <td className="px-3 py-2">{s.subject}</td>
                <td className="px-3 py-2">{s.tutorName}</td>
                <td className="px-3 py-2">{s.date}</td>
                <td className="px-3 py-2">{s.startTime} - {s.endTime}</td>
                <td className="px-3 py-2">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-3 text-sm text-gray-500">Chưa có dữ liệu.</p>}
      </div>
    </div>
  );
}
