import { useEffect, useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function AdminSettings() {
  const [backups, setBackups] = useState([]);
  const [status, setStatus] = useState('');

  const load = () => {
    api.get('/resources/admin/backups')
      .then((res) => setBackups(res.data.data))
      .catch(() => setBackups([]));
  };

  useEffect(() => {
    load();
  }, []);

  const createBackup = async () => {
    setStatus('');
    try {
      await api.post('/resources/admin/backup');
      setStatus('Đã tạo backup (mock)');
      load();
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Cài đặt & Sao lưu</h2>
        <p className="text-sm text-gray-600">Quản lý sao lưu dữ liệu mock.</p>
      </div>
      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Database size={16} /> Danh sách backup
          </div>
          <button
            type="button"
            onClick={createBackup}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <RefreshCw size={16} /> Tạo backup mới
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                <th className="px-3 py-2">Tên file</th>
                <th className="px-3 py-2">Ngày tạo</th>
                <th className="px-3 py-2">Kích thước</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="px-3 py-2">{b.filename}</td>
                  <td className="px-3 py-2">{b.createdAt}</td>
                  <td className="px-3 py-2">{b.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {backups.length === 0 && <p className="p-3 text-sm text-gray-500">Chưa có backup.</p>}
        </div>
      </div>
    </div>
  );
}
