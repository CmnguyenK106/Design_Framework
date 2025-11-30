import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CalendarClock, MapPin, Users, Edit, Trash2, PlusCircle, X,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TutorSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const {
    register, handleSubmit, reset, setValue,
  } = useForm({
    defaultValues: {
      subject: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '14:00',
      endTime: '16:00',
      location: 'H1-101',
      type: 'offline',
      link: '',
      maxStudents: 10,
    },
  });

  const fetchSessions = () => {
    api.get('/sessions')
      .then((res) => setSessions(res.data.data.filter((s) => s.tutorId === user.id)))
      .catch(() => setSessions([]));
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    reset({
      subject: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '14:00',
      endTime: '16:00',
      location: 'H1-101',
      type: 'offline',
      link: '',
      maxStudents: 10,
    });
    setShowForm(true);
  };

  const handleEdit = (s) => {
    setEditing(s);
    setValue('subject', s.subject);
    setValue('date', s.date);
    setValue('startTime', s.startTime);
    setValue('endTime', s.endTime);
    setValue('location', s.location);
    setValue('type', s.type);
    setValue('link', s.link || '');
    setValue('maxStudents', s.maxStudents);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa lớp học này?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      fetchSessions();
      if (editing && editing.id === id) setEditing(null);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const onSubmit = async (values) => {
    setStatus('');
    try {
      if (editing) {
        await api.put(`/sessions/${editing.id}`, { ...values, maxStudents: Number(values.maxStudents) });
        setStatus('Cập nhật lịch thành công');
      } else {
        await api.post('/sessions', { ...values, maxStudents: Number(values.maxStudents) });
        setStatus('Tạo lịch thành công');
      }
      reset();
      setEditing(null);
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const filtered = useMemo(() => sessions.filter((s) => (filterType === 'all' ? true : s.type === filterType)), [sessions, filterType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý lịch tư vấn</h2>
          <p className="text-sm text-gray-600">Tạo mới, chỉnh sửa, hủy lớp học/tư vấn.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <PlusCircle size={16} /> Thiết lập lịch rảnh
          </button>
        </div>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{s.subject}</p>
              <span className="text-xs text-gray-600">{s.registered}/{s.maxStudents} SV</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <CalendarClock size={14} /> {s.date} • {s.startTime} - {s.endTime}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={14} /> {s.type === 'online' ? 'Online' : s.location}
            </p>
            {s.link && <a className="mt-1 block text-xs text-primary underline" href={s.link} target="_blank" rel="noreferrer">{s.link}</a>}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleEdit(s)}
                className="flex w-1/2 items-center justify-center gap-1 rounded-md border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <Edit size={14} /> Quản lý lớp
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="flex w-1/2 items-center justify-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-gray-500">Chưa có phiên nào.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Chỉnh sửa thông tin lịch' : 'Thiết lập lịch rảnh mới'}</h3>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}><X size={20} /></button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày</label>
                  <input type="date" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('date', { required: true })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                    <input type="time" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('startTime', { required: true })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Giờ kết thúc</label>
                    <input type="time" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('endTime', { required: true })} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Môn học / Chủ đề</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('subject', { required: true })} placeholder="Ví dụ: Cơ sở dữ liệu" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Số lượng SV tối đa</label>
                  <input type="number" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('maxStudents', { required: true, min: 1 })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Địa điểm</label>
                  <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('location')} placeholder="H1-201 hoặc Online" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Loại</label>
                  <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('type')}>
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Link tham gia (nếu online)</label>
                  <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('link')} placeholder="https://meet..." />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                  Hủy
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editing.id)}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Xóa lớp học
                  </button>
                )}
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
                  {editing ? 'Lưu thay đổi' : 'Tạo lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
