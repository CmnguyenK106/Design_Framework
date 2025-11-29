import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [filterTutor, setFilterTutor] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    api.get('/feedback/admin')
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => items.filter((f) => {
    if (filterTutor !== 'all' && f.tutorName !== filterTutor) return false;
    if (filterSubject !== 'all' && f.subject !== filterSubject) return false;
    if (filterRating !== 'all') {
      const avg = (f.ratings.quality + f.ratings.knowledge + f.ratings.communication + f.ratings.helpfulness + f.ratings.timeManagement) / 5;
      if (Math.floor(avg) !== Number(filterRating)) return false;
    }
    return true;
  }), [items, filterTutor, filterSubject, filterRating]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Feedback (Admin)</h2>
        <p className="text-sm text-gray-600">Toàn bộ đánh giá từ sinh viên.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filterTutor} onChange={(e) => setFilterTutor(e.target.value)}>
          <option value="all">Tất cả tutor</option>
          {Array.from(new Set(items.map((f) => f.tutorName))).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="all">Tất cả môn</option>
          {Array.from(new Set(items.map((f) => f.subject))).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
          <option value="all">Tất cả rating</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sao</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <th className="px-3 py-2">Môn</th>
              <th className="px-3 py-2">Tutor</th>
              <th className="px-3 py-2">Sinh viên</th>
              <th className="px-3 py-2">Điểm TB</th>
              <th className="px-3 py-2">Nhận xét</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-gray-100">
                <td className="px-3 py-2">{f.subject}</td>
                <td className="px-3 py-2">{f.tutorName}</td>
                <td className="px-3 py-2">{f.studentName}</td>
                <td className="px-3 py-2">
                  {(
                    (f.ratings.quality + f.ratings.knowledge + f.ratings.communication + f.ratings.helpfulness + f.ratings.timeManagement) / 5
                  ).toFixed(1)}
                </td>
                <td className="px-3 py-2 text-xs text-gray-700">{f.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-3 text-sm text-gray-500">Chưa có dữ liệu.</p>}
      </div>
    </div>
  );
}
