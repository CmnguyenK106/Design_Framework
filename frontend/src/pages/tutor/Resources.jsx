import { useEffect, useState } from 'react';
import { Upload, Save, Download } from 'lucide-react';
import api from '../../services/api';

export default function TutorResources() {
  const [docs, setDocs] = useState([]);
  const [progress, setProgress] = useState([]);
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ description: '', category: 'lecture' });
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const load = () => {
    api
      .get('/resources')
      .then((res) => setDocs(res.data.data || []))
      .catch(() => setDocs([]));
    api
      .get('/resources/tutor/progress')
      .then((res) => setProgress(res.data.data || []))
      .catch(() => setProgress([]));
  };

  useEffect(() => {
    load();
  }, []);

  const download = async (doc) => {
    try {
      const res = await api.get(`/resources/${doc.id}/download`, { responseType: 'blob' });
      let filename = doc.name || 'resource';
      const disposition = res.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
      }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setStatus(err.message || 'Tải xuống thất bại.');
    }
  };

  const upload = async () => {
    if (!file) {
      setStatus('Vui lòng chọn file trước khi upload.');
      return;
    }
    setStatus('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('description', form.description);
      fd.append('category', form.category);
      await api.post('/resources/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      setForm({ description: '', category: 'lecture' });
      setStatus('Upload tài liệu thành công.');
      load();
    } catch (err) {
      setStatus(err.message || 'Upload thất bại.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tài nguyên & Tiến độ</h2>
        <p className="text-sm text-gray-600">Upload tài liệu, quản lý tiến độ sinh viên.</p>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Tài liệu đã upload</h3>
            <span className="text-xs text-gray-600">{docs.length} tài liệu</span>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {docs.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-600">
                    {d.category} • {d.uploadDate}
                  </p>
                  {d.description && <p className="text-xs text-gray-500">Mô tả: {d.description}</p>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{d.size}</span>
                  <button
                    type="button"
                    onClick={() => download(d)}
                    className="inline-flex items-center gap-1 rounded-md border border-primary px-2 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                  >
                    <Download size={14} /> Tải
                  </button>
                </div>
              </div>
            ))}
            {docs.length === 0 && <p className="text-sm text-gray-500">Chưa có tài liệu.</p>}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Upload tài liệu</h3>
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={2}
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="lecture">Bài giảng</option>
              <option value="exercise">Bài tập</option>
              <option value="reference">Tham khảo</option>
            </select>
            <input
              type="file"
              className="w-full rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={upload}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Upload size={16} /> Upload
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tiến độ sinh viên</h3>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Save size={14} /> Editable
          </span>
        </div>
        <div className="space-y-2">
          {progress.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-100 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.studentName}</p>
                  <p className="text-xs text-gray-600">
                    {p.completed}/{p.total} • {p.percentage}%
                  </p>
                </div>
                <span className="text-xs text-gray-600">Cập nhật: {p.lastUpdate}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${p.percentage}%` }} />
              </div>
            </div>
          ))}
          {progress.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu tiến độ.</p>}
        </div>
      </div>
    </div>
  );
}
