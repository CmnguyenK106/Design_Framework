import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

export default function StudentFeedback() {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      sessionId: '',
      ratings: { quality: 5, knowledge: 5, communication: 5, helpfulness: 5, timeManagement: 5 },
      comment: '',
      goodPoints: '',
      improvements: '',
      recommend: true,
      anonymous: false,
    },
  });

  const loadData = () => {
    api.get('/feedback/sessions/completed')
      .then((res) => setCompletedSessions(res.data.data))
      .catch(() => setCompletedSessions([]));
    api.get('/feedback/my-history')
      .then((res) => setHistory(res.data.data))
      .catch(() => setHistory([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values) => {
    setStatus('');
    try {
      await api.post('/feedback', {
        sessionId: values.sessionId,
        ratings: {
          quality: Number(values.ratings.quality),
          knowledge: Number(values.ratings.knowledge),
          communication: Number(values.ratings.communication),
          helpfulness: Number(values.ratings.helpfulness),
          timeManagement: Number(values.ratings.timeManagement),
        },
        comment: values.comment,
        goodPoints: values.goodPoints,
        improvements: values.improvements,
        recommend: values.recommend,
        anonymous: values.anonymous,
      });
      setStatus('Gửi đánh giá thành công');
      reset();
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const filteredHistory = useMemo(() => history.filter((f) => {
    if (filterSubject !== 'all' && f.subject !== filterSubject) return false;
    if (filterRating !== 'all') {
      const avg = (f.ratings.quality + f.ratings.knowledge + f.ratings.communication + f.ratings.helpfulness + f.ratings.timeManagement) / 5;
      if (Math.floor(avg) !== Number(filterRating)) return false;
    }
    return true;
  }), [history, filterSubject, filterRating]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Đánh giá buổi học</h2>
        <p className="text-sm text-gray-600">Chỉ các buổi đã hoàn thành mới có thể đánh giá.</p>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Chọn buổi đã hoàn thành</h3>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-700">Buổi học</label>
            <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('sessionId', { required: true })}>
              <option value="">-- Chọn buổi --</option>
              {completedSessions.map((s) => (
                <option key={s.id} value={s.id}>{s.subject} • {s.date} • {s.tutorName}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {['quality', 'knowledge', 'communication', 'helpfulness', 'timeManagement'].map((key) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 capitalize">{key}</label>
                <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register(`ratings.${key}`, { required: true })}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Điểm tốt</label>
              <textarea className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" rows={2} {...register('goodPoints')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Điểm cần cải thiện</label>
              <textarea className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" rows={2} {...register('improvements')} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Nhận xét chi tiết</label>
            <textarea className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" rows={3} {...register('comment', { required: true })} />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('recommend')} />
              Khuyến nghị tutor này
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('anonymous')} />
              Gửi ẩn danh
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => reset()} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Lưu nháp</button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Gửi đánh giá</button>
          </div>
        </form>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử đánh giá</h3>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">Tất cả môn</option>
            {Array.from(new Set(history.map((h) => h.subject))).map((subj) => (
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
          {filteredHistory.map((f) => (
            <div key={f.id} className="rounded-lg border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.subject}</p>
                  <p className="text-xs text-gray-600">{f.tutorName} • {f.createdAt}</p>
                </div>
                <div className="text-xs text-gray-600">
                  Điểm TB: {(
                    (f.ratings.quality + f.ratings.knowledge + f.ratings.communication + f.ratings.helpfulness + f.ratings.timeManagement) / 5
                  ).toFixed(1)} ⭐
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-700">{f.comment}</p>
            </div>
          ))}
          {filteredHistory.length === 0 && <p className="text-sm text-gray-500">Chưa có đánh giá.</p>}
        </div>
      </div>
    </div>
  );
}
