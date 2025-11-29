import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { username: '', password: '', role: 'member', name: '', email: '' },
  });

  const fetchUsers = () => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data.data))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (values) => {
    setMessage('');
    try {
      await api.post('/admin/users', values);
      reset();
      fetchUsers();
      setMessage('Tạo tài khoản thành công');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const filtered = users.filter((u) => {
    const text = `${u.name} ${u.username} ${u.email}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý người dùng</h2>
          <p className="text-sm text-gray-600">Tạo mới và xem danh sách người dùng.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Tìm kiếm tên/username/email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="tutor">Tutor</option>
          <option value="member">Member</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Danh sách</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.username}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2 uppercase">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="p-3 text-sm text-gray-500">Chưa có dữ liệu.</p>}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Tạo tài khoản</h3>
          {message && <div className="mb-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{message}</div>}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('username', { required: true })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <input type="password" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('password', { required: true })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Vai trò</label>
              <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('role')}>
                <option value="admin">Admin</option>
                <option value="tutor">Tutor</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Họ tên</label>
              <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('name')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" {...register('email')} />
            </div>
            <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
              Tạo tài khoản
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
