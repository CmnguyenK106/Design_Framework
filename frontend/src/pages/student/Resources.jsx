import { useEffect, useState } from 'react';
import { Book, Download } from 'lucide-react';
import api from '../../services/api';

export default function StudentResources() {
  const [docs, setDocs] = useState([]);
  const [status, setStatus] = useState('');

  const load = () => {
    api.get('/resources')
      .then((res) => setDocs(res.data.data))
      .catch(() => setDocs([]));
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tài nguyên học tập</h2>
        <p className="text-sm text-gray-600">Xem và tải tài liệu được chia sẻ.</p>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <div className="grid gap-3 md:grid-cols-3">
        {['Lưu trữ đánh giá', 'Lưu trữ hồ sơ', 'Biên bản buổi gặp', 'Tài liệu học tập', 'Truy xuất dữ liệu đã lưu'].map((title) => (
          <div key={title} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Book size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-600">Click để xem chi tiết (demo).</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm overflow-x-auto">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách tài liệu</h3>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Danh mục</th>
              <th className="px-3 py-2">Upload</th>
              <th className="px-3 py-2">Kích thước</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-gray-100">
                <td className="px-3 py-2">{d.name}</td>
                <td className="px-3 py-2 capitalize">{d.category}</td>
                <td className="px-3 py-2">{d.uploadDate}</td>
                <td className="px-3 py-2">{d.size}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => download(d)}
                    className="inline-flex items-center gap-1 rounded-md border border-primary px-2 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                  >
                    <Download size={14} /> Tải
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {docs.length === 0 && <p className="p-3 text-sm text-gray-500">Chưa có tài liệu.</p>}
      </div>
    </div>
  );
}
