import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'member'
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);

    // client side email domain check
    const emailDomainRegex = /@hcmut\.edu\.vn$/i;
    if (!emailDomainRegex.test(data.email)) {
      setError('Email phải có định dạng @hcmut.edu.vn');
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email,
        mssv: data.mssv || null,
        role: data.role
      });

      if (response.data.success) {
        // Auto-login after successful registration
        if (response.data.data.token && response.data.data.user) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          alert('Đăng ký thành công!');
          navigate('/');
        } else {
          alert('Đăng ký thành công! Vui lòng đăng nhập.');
          navigate('/login');
        }
      }
    } catch (err) {
      // Display detailed error message from backend
      console.log('Full error object:', err);
      console.log('Error response:', err.response);
      console.log('Error response data:', err.response?.data);
      
      // Extract error message from multiple possible paths
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (err.response?.data) {
        const data = err.response.data;
        // Try different error message paths
        errorMessage = data.error?.message || data.message || data.error || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Registration error:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
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
        {/* Left Panel - Branding */}
        <div className="flex flex-col justify-center p-8 text-white" style={{ background: 'linear-gradient(135deg,#186AC7 0%,#1557A6 100%)' }}>
          <div className="mb-6 flex items-center gap-3">
            <img src="/logo-hcmut-icon.png" alt="HCMUT" className="max-h-16 w-auto object-contain drop-shadow" />
            <div>
              <p className="text-lg font-semibold">Đăng ký tài khoản</p>
              <p className="text-sm text-white/80">Đại học Bách Khoa TP.HCM</p>
            </div>
          </div>
          
          <p className="mb-4 text-sm text-white/90">
            Hệ thống Tutor Support System hỗ trợ sinh viên, tutor và admin quản lý lịch tư vấn, hồ sơ và thông báo.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Đăng ký tài khoản</h3>
                <p className="text-white/80 text-xs">Tạo tài khoản mới để truy cập hệ thống</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Chọn vai trò</h3>
                <p className="text-white/80 text-xs">Đăng ký với vai trò Sinh viên hoặc Tutor</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Xác thực email</h3>
                <p className="text-white/80 text-xs">Sử dụng email hợp lệ để xác thực</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>

          {error && (
            <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('username', {
                  required: 'Vui lòng nhập tên đăng nhập',
                  minLength: { value: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Nhập tên đăng nhập"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-danger">• {errors.username.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Vui lòng nhập họ và tên'
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Nhập họ và tên đầy đủ"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger">• {errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="example@hcmut.edu.vn"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger">• {errors.email.message}</p>
              )}
            </div>

            {/* MSSV (optional) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mã số sinh viên
              </label>
              <input
                type="text"
                {...register('mssv')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Nhập MSSV (nếu có)"
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role', { required: 'Vui lòng chọn vai trò' })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="member">Sinh viên</option>
                <option value="tutor">Tutor</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-danger">• {errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger">• {errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: value => value === password || 'Mật khẩu không khớp'
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger">• {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary-hover disabled:opacity-70"
            >
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            {/* Login Link */}
            <div className="mt-6 text-sm text-gray-600">
              <p>
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
