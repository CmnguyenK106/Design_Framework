import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

export default function StudentProfile() {
  const [status, setStatus] = useState('');
  const { register, handleSubmit, reset, watch } = useForm();

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => reset(res.data.data))
      .catch(() => reset({}));
  }, [reset]);

  const onSubmit = async (values) => {
    setStatus('');
    try {
      await api.put('/users/profile', values);
      setStatus('Lưu thay đổi thành công');
    } catch (err) {
      setStatus(err.message);
    }
  };

  const settings = watch('settings') || {};

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Hồ sơ cá nhân</h2>
        <p className="text-sm text-gray-600">Cập nhật thông tin liên hệ và tùy chọn hiển thị.</p>
      </div>

      {status && <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{status}</div>}

      <form className="space-y-4 rounded-xl bg-white p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Họ và tên</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('name')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">MSSV</label>
            <input className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2" {...register('mssv')} readOnly />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('email')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('phone')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Khoa/Bộ môn</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('khoa')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Chuyên ngành</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('chuyenNganh')} />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">Tùy chọn tài khoản</p>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {[
              { key: 'emailNotif', label: 'Nhận thông báo qua email' },
              { key: 'appNotif', label: 'Nhận thông báo qua app' },
              { key: 'publicProfile', label: 'Hiển thị profile công khai' },
              { key: 'allowContact', label: 'Cho phép người khác liên hệ' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" {...register(`settings.${item.key}`)} defaultChecked={settings[item.key]} />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => reset()} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
            Hủy thay đổi
          </button>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
