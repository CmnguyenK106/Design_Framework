import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

const resolveAvatar = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  const apiBase = import.meta.env.VITE_API_URL || '';
  const host = apiBase.replace(/\/api$/, '');
  return `${host}${avatar}`;
};

export default function StudentProfile() {
  const [status, setStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const { register, handleSubmit, reset, watch } = useForm();

  const name = watch('name');
  const initials = useMemo(
    () => (name ? name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'U'),
    [name],
  );

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        reset(res.data.data);
        setAvatarUrl(res.data.data.avatar ? resolveAvatar(res.data.data.avatar) : '');
      })
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

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const form = new FormData();
      form.append('avatar', avatarFile);
      const res = await api.patch('/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatarUrl(res.data.data.avatar ? resolveAvatar(res.data.data.avatar) : '');
      setStatus('Đã cập nhật ảnh đại diện');
      setAvatarFile(null);
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
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover border" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-lg font-semibold uppercase text-gray-700">
              {initials}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            <button
              type="button"
              onClick={uploadAvatar}
              disabled={!avatarFile}
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Cập nhật ảnh
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Họ và tên</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('name')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">MSSV</label>
            <input className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2" {...register('mssv')} readOnly />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('email')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" {...register('phone')} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Kỹ năng</label>
          <input className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Nhập kỹ năng, phân tách bởi dấu phẩy" {...register('skillsText')} />
          <p className="text-xs text-gray-500 mt-1">Ví dụ: ReactJS, NodeJS, Python</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" {...register('settings.emailNotif')} defaultChecked={settings.emailNotif} />
            Nhận thông báo qua email
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" {...register('settings.appNotif')} defaultChecked={settings.appNotif} />
            Nhận thông báo qua app
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" {...register('settings.publicProfile')} defaultChecked={settings.publicProfile} />
            Hiển thị profile công khai
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" {...register('settings.allowContact')} defaultChecked={settings.allowContact} />
            Cho phép người khác liên hệ
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => window.location.reload()} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Làm mới</button>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Lưu thay đổi</button>
        </div>
      </form>
    </div>
  );
}
