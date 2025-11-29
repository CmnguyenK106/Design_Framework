import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'tutor', password: 'tutor', role: 'tutor' },
  { username: '2312487', password: 'demo', role: 'member' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: 'linear-gradient(to bottom right, #4facfe 0%, #00f2fe 100%)',
      }}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 text-white" style={{ background: 'linear-gradient(135deg,#186AC7 0%,#1557A6 100%)' }}>
          <div className="mb-6 flex items-center gap-3">
            <img src="/logo-hcmut-icon.png" alt="HCMUT" className="max-h-16 w-auto object-contain drop-shadow" />
            <div>
              <p className="text-lg font-semibold">Đăng nhập sinh viên</p>
              <p className="text-sm text-white/80">Đại học Bách Khoa TP.HCM</p>
            </div>
          </div>
          <p className="text-sm text-white/90">
            Hệ thống Tutor Support System (mock SSO) hỗ trợ sinh viên, tutor và admin quản lý lịch tư vấn, hồ sơ và thông báo.
          </p>
          <div className="mt-8 rounded-xl bg-white/10 p-4">
            <p className="mb-2 text-sm font-semibold">Tài khoản demo</p>
            <ul className="space-y-1 text-sm text-white/90">
              {demoAccounts.map((acc) => (
                <li key={acc.username} className="flex items-center justify-between">
                  <span>{acc.role.toUpperCase()}</span>
                  <code className="rounded bg-white/20 px-2 py-1">{acc.username} / {acc.password}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Đăng nhập</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">MSSV / Tài khoản</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Nhập MSSV hoặc tài khoản"
                {...register('username', { required: 'Vui lòng nhập tài khoản' })}
              />
              {errors.username && <p className="mt-1 text-sm text-danger">❌ {errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              />
              {errors.password && <p className="mt-1 text-sm text-danger">❌ {errors.password.message}</p>}
            </div>
            {serverError && <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</div>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary-hover disabled:opacity-70"
            >
              {isSubmitting ? 'Đang kiểm tra...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-600">
            <a href="#" className="text-primary hover:underline">Quên mật khẩu?</a>
            <span className="mx-2 text-gray-400">•</span>
            <a href="#" className="text-primary hover:underline">Chưa có tài khoản? Đăng ký</a>
          </div>
        </div>
      </div>
    </div>
  );
}
