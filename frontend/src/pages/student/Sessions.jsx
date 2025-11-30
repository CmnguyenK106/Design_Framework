import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, MapPin, Star, User, Search, Filter, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState('');
  const [errorModal, setErrorModal] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [paired, setPaired] = useState([]);

  const fetchSessions = () => {
    setLoading(true);
    api.get('/sessions', { params: { status: 'scheduled' } })
      .then((res) => {
        setSessions(res.data.data);
        const uniqueTutors = Array.from(new Map(res.data.data.map((s) => [
          s.tutorId,
          { id: s.tutorId, name: s.tutorName, dept: s.location, rating: 4.5, skills: ['AI/ML', 'Web', 'Network'] },
        ])).values());
        setTutors(uniqueTutors);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
    api.get('/paired').then((res) => setPaired(res.data.data)).catch(() => setPaired([]));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRegister = async (id) => {
    setInfo('');
    try {
      const res = await api.post(`/sessions/${id}/register`);
      setSessions((prev) => prev.map((s) => (s.id === id ? res.data.data : s)));
      setSelected(res.data.data);
      setInfo('Đăng ký thành công');
    } catch (err) {
      setErrorModal(err.message);
    }
  };

  const handleUnregister = async (id) => {
    setInfo('');
    try {
      const res = await api.delete(`/sessions/${id}/unregister`);
      setSessions((prev) => prev.map((s) => (s.id === id ? res.data.data : s)));
      setSelected(res.data.data);
      setInfo('Đã hủy đăng ký');
    } catch (err) {
      setErrorModal(err.message);
    }
  };

  const filteredSessions = useMemo(() => sessions.filter((s) => {
    const text = `${s.subject} ${s.tutorName}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    return true;
  }), [sessions, search, typeFilter]);

  const isPairedTutor = (tutorId) => paired.some((p) => p.tutorId === tutorId && p.status === 'accepted');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lịch tư vấn / Lớp học</h2>
          <p className="text-sm text-gray-600">Tìm kiếm, lọc và đăng ký các buổi tư vấn.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 shadow-sm">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none text-sm focus:outline-none"
            placeholder="Tìm lớp theo tên môn, tutor..."
          />
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 shadow-sm">
          <Filter size={16} className="text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full border-none text-sm focus:outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary shadow-sm">
          Gợi ý: chọn lớp rồi bấm đăng ký, xem chi tiết trong modal.
        </div>
      </div>

      {info && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{info}</div>}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900">Thông báo</h4>
            <p className="mt-2 text-sm text-gray-700">{errorModal}</p>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setErrorModal('')} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Đang tải...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filteredSessions.map((s) => {
            const slots = s.maxStudents - s.registered;
            const isRegistered = s.students?.includes(user?.id);
            return (
              <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.subject}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1"><User size={14} /> {s.tutorName}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${slots > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {slots > 0 ? `Còn ${slots} chỗ` : 'Đã full'}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <CalendarClock size={14} />
                  {s.date} • {s.startTime} - {s.endTime}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <MapPin size={14} />
                  {s.type === 'online' ? 'Online' : s.location}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Users size={14} /> {s.registered}/{s.maxStudents}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> 4.8</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(s)}
                    className="w-1/2 rounded-md border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    Chi tiết
                  </button>
                  {!isRegistered ? (
                    <button
                      type="button"
                      onClick={() => handleRegister(s.id)}
                      disabled={s.registered >= s.maxStudents}
                      className="w-1/2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {s.registered >= s.maxStudents ? 'Đã full' : 'Đăng ký'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnregister(s.id)}
                      className="w-1/2 rounded-md bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      Hủy đăng ký
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredSessions.length === 0 && <p className="text-sm text-gray-500">Không có phiên khả dụng.</p>}
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách Tutor</h3>
          <span className="text-xs text-gray-500">Click để xem chi tiết/Gửi yêu cầu ghép cặp</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {tutors.map((t) => {
            const pairedTutor = isPairedTutor(t.id);
            return (
              <div key={t.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {t.name?.slice(0, 2)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-600">{t.skills?.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Star size={14} className="text-yellow-500" /> {t.rating || 4.5}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-700">
                  {t.skills?.map((skill) => (
                    <span key={skill} className="rounded-full bg-gray-100 px-2 py-1">{skill}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected({ tutorCard: t })}
                    className="w-1/2 rounded-md border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    Xem hồ sơ
                  </button>
                  <button
                    type="button"
                    disabled={pairedTutor}
                    onClick={async () => {
                      try {
                        await api.post(`/tutors/${t.id}/pair-request`);
                        setInfo(`Đã gửi yêu cầu ghép cặp tới ${t.name}`);
                        fetchSessions();
                      } catch (err) {
                        setErrorModal(err.message);
                      }
                    }}
                    className="w-1/2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {pairedTutor ? 'Đã ghép' : 'Ghép cặp'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Ghép cặp của bạn</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {paired.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
              <span>{p.tutorName}</span>
              <span className="text-xs uppercase text-green-600">{p.status}</span>
            </div>
          ))}
          {paired.length === 0 && <p className="text-sm text-gray-500">Chưa có ghép cặp nào.</p>}
        </div>
      </div>

      {selected && selected.tutorCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {selected.tutorCard.name?.slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selected.tutorCard.name}</p>
                  <p className="text-xs text-gray-600">AI/ML, Học máy</p>
                </div>
              </div>
              <button type="button" className="text-sm text-gray-500" onClick={() => setSelected(null)}>Đóng</button>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-gray-700">
              <p>Học viên: 45 • Đánh giá: 4.8 (128)</p>
              <p>Email: tutor@hcmut.edu.vn • Điện thoại: 0912345678</p>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Lịch dạy sắp tới</p>
                <p className="text-xs text-gray-600 mt-1">AI/ML • 10:00 - 12:00 • Online • Còn 5 chỗ</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700" onClick={() => setSelected(null)}>Đóng</button>
              <button
                type="button"
                className="w-1/2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  try {
                    const isPaired = isPairedTutor(selected.tutorCard.id);
                    if (isPaired) {
                      setInfo('Đã ghép cặp với tutor này');
                    } else {
                      await api.post(`/tutors/${selected.tutorCard.id}/pair-request`);
                      setInfo(`Đã gửi yêu cầu ghép cặp tới ${selected.tutorCard.name}`);
                      fetchSessions();
                    }
                  } catch (err) {
                    setErrorModal(err.message);
                  }
                  setSelected(null);
                }}
              >
                Gửi yêu cầu ghép cặp
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && !selected.tutorCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">{selected.subject}</p>
                <p className="text-xs text-gray-500">Chi tiết buổi học</p>
              </div>
              <button type="button" className="text-sm text-gray-500" onClick={() => setSelected(null)}>Đóng</button>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-gray-800">
              <div className="flex justify-between">
                <span>Giảng viên</span>
                <span className="font-semibold">{selected.tutorName}</span>
              </div>
              <div className="flex justify-between">
                <span>Đánh giá</span>
                <span className="flex items-center gap-1 font-semibold"><Star size={14} className="text-yellow-500" /> 4.9</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày học</span>
                <span className="font-semibold">{selected.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian</span>
                <span className="font-semibold">{selected.startTime} - {selected.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Địa điểm</span>
                <span className="font-semibold">{selected.type === 'online' ? 'Online' : selected.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Số lượng</span>
                <span className="font-semibold">{selected.registered}/{selected.maxStudents} sinh viên</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700" onClick={() => setSelected(null)}>Đóng</button>
              <button
                type="button"
                onClick={() => (selected.students?.includes(user?.id) ? handleUnregister(selected.id) : handleRegister(selected.id))}
                disabled={selected.registered >= selected.maxStudents && !selected.students?.includes(user?.id)}
                className="w-1/2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {selected.students?.includes(user?.id)
                  ? 'Hủy đăng ký'
                  : selected.registered >= selected.maxStudents ? 'Đã full' : 'Đăng ký lớp học'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
