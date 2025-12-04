import { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/forgot', { email });
      setMessage('Kiểm tra email để nhận liên kết đặt lại mật khẩu (nếu email tồn tại).');
    } catch (err) {
      setMessage(err.message || 'Yêu cầu thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Quên mật khẩu</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded">{loading ? 'Đang gửi...' : 'Gửi liên kết'}</button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
