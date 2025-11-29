import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock3, Filter } from 'lucide-react';
import api from '../services/api';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [settings, setSettings] = useState(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/notifications', {
      params: {
        status: filterStatus === 'all' ? undefined : filterStatus,
        type: filterType === 'all' ? undefined : filterType,
      },
    })
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterType]);

  useEffect(() => {
    api.get('/notifications/settings/me').then((res) => setSettings(res.data.data)).catch(() => {});
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/mark-all-read');
    fetchData();
  };

  const markOne = async (id) => {
    setStatus('');
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchData();
      setStatus('Đã đánh dấu đã đọc');
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Thông báo</h2>
          <p className="text-sm text-gray-600">Xem, lọc và đánh dấu đã đọc.</p>
        </div>
        <button
          type="button"
          onClick={markAll}
          className="rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Filter size={16} /> Bộ lọc
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-semibold text-gray-800">Trạng thái</p>
            {['all', 'unread', 'read'].map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input type="radio" name="status" checked={filterStatus === s} onChange={() => setFilterStatus(s)} />
                {s === 'all' ? 'Tất cả' : s === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
              </label>
            ))}
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-semibold text-gray-800">Loại</p>
            {['all', 'session_reminder', 'pairing', 'feedback', 'progress', 'system'].map((t) => (
              <label key={t} className="flex items-center gap-2 capitalize">
                <input type="radio" name="type" checked={filterType === t} onChange={() => setFilterType(t)} />
                {t === 'all' ? 'Tất cả' : t.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-9 space-y-3">
          {loading ? (
            <p className="text-gray-600">Đang tải...</p>
          ) : (
            <div className="space-y-3">
              {items.map((n) => (
                <div key={n.id} className="flex items-start justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600">{n.content}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock3 size={14} />
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {n.channels?.map((c) => (
                          <span key={c} className="rounded-full bg-gray-100 px-2 py-1 text-[11px] uppercase text-gray-700">
                            {c}
                          </span>
                        ))}
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${n.status === 'unread' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700'}`}>
                          {n.status === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {n.status === 'unread' ? (
                    <button
                      type="button"
                      onClick={() => markOne(n.id)}
                      className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                    >
                      Đánh dấu đọc
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 size={14} />
                      Đã đọc
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500">Chưa có thông báo.</p>}
            </div>
          )}
        </div>
      </div>

      {settings && (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
          <p className="text-sm font-semibold text-gray-800">Cài đặt kênh nhận thông báo</p>
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm text-gray-700">
              <span className="capitalize">{key}</span>
              <div className="flex items-center gap-3">
                {['inApp', 'email', 'sms'].map((channel) => (
                  <label key={channel} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={value[channel]}
                      onChange={(e) => {
                        const updated = { ...settings, [key]: { ...value, [channel]: e.target.checked } };
                        setSettings(updated);
                        api.put('/notifications/settings/me', updated);
                      }}
                    />
                    {channel.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
