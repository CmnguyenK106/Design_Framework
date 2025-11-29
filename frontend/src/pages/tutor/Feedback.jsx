import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye } from 'lucide-react';
import api from '../../services/api';

export default function TutorFeedback() {
  const [data, setData] = useState({ items: [], stats: { total: 0, avgQuality: 0 } });
  const [status, setStatus] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  const load = () => {
    api.get('/feedback/tutor')
      .then((res) => setData(res.data.data))
      .catch(() => setData({ items: [], stats: { total: 0, avgQuality: 0 } }));
  };

  useEffect(() => {
    load();
  }, []);

  const markViewed = async (id) => {
    setStatus('');
    try {
      await api.patch(`/feedback/tutor/${id}/mark-viewed`);
      setStatus('Đã đánh dấu đã xem');
      load();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const filteredItems = useMemo(() => data.items.filter((f) => {
    if (filterSubject !== 'all' && f.subject !== filterSubject) return false;
    if (filterRating !== 'all') {
      const avg = (f.ratings.quality + f.ratings.knowledge + f.ratings.communication + f.ratings.helpfulness + f.ratings.timeManagement) / 5;
      if (Math.floor(avg) !== Number(filterRating)) return false;
    }
    return true;
  }), [data.items, filterSubject, filterRating]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Feedback từ sinh viên</h2>
        <p className="text-sm text-gray-600">Xem nhận xét và đánh dấu đã xem.</p>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Tổng số đánh giá</p>
          <p className="text-2xl font-semibold text-gray-900">{data.stats.total}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Điểm chất lượng TB</p>
          <p className="text-2xl font-semibold text-gray-900">{data.stats.avgQuality}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="all">Tất cả môn</option>
          {Array.from(new Set(data.items.map((h) => h.subject))).map((subj) => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="all">Tất cả rating</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sao</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredItems.map((f) => (
          <div key={f.id} className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.subject}</p>
                <p className="text-xs text-gray-600">{f.studentName} • {f.createdAt}</p>
              </div>
              <div className="text-xs text-gray-600">
                Điểm TB: {(
                  (f.ratings.quality + f.ratings.knowledge + f.ratings.communication + f.ratings.helpfulness + f.ratings.timeManagement) / 5
                ).toFixed(1)} ⭐
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-700">{f.comment}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
              <span>Khuyến nghị: {f.recommend ? 'Có' : 'Không'}</span>
              {f.tutorViewed ? (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 size={14} /> Đã xem
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => markViewed(f.id)}
                  className="flex items-center gap-1 rounded-md border border-primary px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  <Eye size={14} /> Đánh dấu đã xem
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && <p className="text-sm text-gray-500">Chưa có feedback.</p>}
      </div>
    </div>
  );
}
