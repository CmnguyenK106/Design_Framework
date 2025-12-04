import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        if (res.data.success) setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    }
    if (token) verify();
  }, [token]);

  return (
    <div className="p-6 max-w-md mx-auto">
      {status === 'loading' && <p>Đang xác thực...</p>}
      {status === 'success' && <>
        <h3 className="text-lg font-semibold">Xác thực thành công</h3>
        <Link to="/login" className="text-blue-600">Đăng nhập</Link>
      </>}
      {status === 'error' && <p className="text-red-600">Xác thực thất bại hoặc token hết hạn.</p>}
    </div>
  );
}
