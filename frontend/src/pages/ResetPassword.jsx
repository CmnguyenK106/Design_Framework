import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!token) return setMessage('Token missing');
    if (password.length < 6) return setMessage('Mật khẩu ít nhất 6 ký tự');
    if (password !== confirm) return setMessage('Mật khẩu không khớp');
    setLoading(true);
    try {
      await api.post('/auth/reset', { token, newPassword: password });
      setMessage('Đã đặt lại mật khẩu. Bạn có thể đăng nhập.');
    } catch (err) {
      setMessage(err.message || 'Đặt lại mật khẩu thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đặt lại mật khẩu</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mật khẩu mới" className="w-full border px-3 py-2 rounded" />
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Nhập lại mật khẩu" className="w-full border px-3 py-2 rounded" />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded">{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      <Link to="/login" className="text-sm text-blue-600">Đăng nhập</Link>
    </div>
  );
}
