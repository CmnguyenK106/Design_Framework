import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import api from '../../services/api';

export default function TutorPairRequests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    api.get('/tutor/pair-requests')
      .then((res) => setRequests(res.data.data))
      .catch(() => setRequests([]));
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, action) => {
    setStatus('');
    try {
      await api.put(`/tutor/pair-requests/${id}`, { action });
      load();
      setSelected(null);
      setStatus(action === 'accept' ? 'Đã chấp nhận' : 'Đã từ chối');
    } catch (err) {
      setStatus(err.message);
    }
  };

  const accepted = requests.filter((r) => r.status === 'accepted');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Yêu cầu ghép cặp</h2>
          <p className="text-sm text-gray-600">Chấp nhận/từ chối yêu cầu từ mentee.</p>
        </div>
      </div>
      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="grid gap-3 md:grid-cols-2">
        {requests.map((r) => (
          <div key={r.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{r.studentName}</p>
                <p className="text-xs text-gray-600">Gửi lúc {new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <span className="text-xs uppercase text-gray-600">{r.status}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => act(r.id, 'accept')}
                className="flex w-1/2 items-center justify-center gap-1 rounded-md border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 size={14} /> Chấp nhận
              </button>
              <button
                type="button"
                onClick={() => act(r.id, 'reject')}
                className="flex w-1/2 items-center justify-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <XCircle size={14} /> Từ chối
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className="text-sm text-gray-500">Không có yêu cầu.</p>}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Đã ghép cặp</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-700">
          {accepted.map((r) => (
            <li key={r.id} className="rounded-md border border-gray-100 px-3 py-2">
              {r.studentName}
            </li>
          ))}
          {accepted.length === 0 && <p className="text-sm text-gray-500">Chưa có ghép cặp nào.</p>}
        </ul>
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Thông báo</h4>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <p className="mt-2 text-sm text-gray-700">{selected}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
