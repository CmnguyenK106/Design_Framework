import { useEffect, useMemo, useState } from 'react';
import { Paperclip, Search, Send, Star, BellOff, Info, CircleDot, Upload } from 'lucide-react';
import classNames from 'classnames';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MessagesLayout() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [online, setOnline] = useState([]);
  const [newAlert, setNewAlert] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const loadConversations = () => {
    api.get('/messages/conversations')
      .then((res) => {
        const mapped = res.data.data.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c));
        setConversations(mapped);
      })
      .catch(() => setConversations([]));
  };

  // Poll conversations and presence every 3s
  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
      api.get('/presence/online').then((res) => setOnline(res.data.data)).catch(() => {});
      api.post('/presence/ping').catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      const fetchMessages = () => {
        api.get(`/messages/conversations/${selectedId}/messages`)
          .then((res) => {
            const next = res.data.data.slice(-100);
            setMessages((prev) => {
              const prevLast = prev[prev.length - 1];
              const nextLast = next[next.length - 1];
              if (nextLast && prevLast && nextLast.id !== prevLast.id && nextLast.senderId !== user?.id) {
                setNewAlert('Có tin nhắn mới');
              }
              return next;
            });
            markConversationRead(selectedId);
          })
          .catch(() => setMessages([]));
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [selectedId]);

  const filtered = useMemo(() => conversations.filter((c) => {
    if (filter === 'marked' && !c.isMarked) return false;
    if (filter === 'muted' && !c.isMuted) return false;
    if (filter === 'group' && c.type !== 'group') return false;
    if (filter === 'direct' && c.type !== 'direct') return false;
    const names = c.participantsDetail?.map((p) => p.name).join(' ').toLowerCase() || '';
    return names.includes(search.toLowerCase());
  }), [conversations, filter, search]);

  const current = conversations.find((c) => c.id === selectedId);

  const uploadAttachment = async () => {
    if (!file) return null;
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/messages/upload-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.data;
  };

  const markConversationRead = async (conversationId) => {
    try {
      await api.patch(`/messages/conversations/${conversationId}/read`);
    } catch (err) {
      // ignore
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const send = async () => {
    if (!text.trim() && !file) return;
    setStatus('');
    try {
      let attachments = [];
      if (file) {
        const uploaded = await uploadAttachment();
        attachments = [uploaded];
      }
      await api.post('/messages', { conversationId: selectedId, content: text, attachments });
      setText('');
      setFile(null);
      api.get(`/messages/conversations/${selectedId}/messages`).then((res) => setMessages(res.data.data.slice(-100)));
      loadConversations();
      markConversationRead(selectedId);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const toggleMark = async () => {
    if (!current) return;
    await api.patch(`/messages/conversations/${current.id}/mark`);
    loadConversations();
  };

  const toggleMute = async () => {
    if (!current) return;
    await api.patch(`/messages/conversations/${current.id}/mute`);
    loadConversations();
  };

  const searchUsers = async (q) => {
    setUserSearch(q);
    try {
      const res = await api.get('/messages/users', { params: { q } });
      setUserResults(res.data.data);
    } catch (err) {
      setUserResults([]);
    }
  };

  const startConversation = async (userId) => {
    try {
      const res = await api.post('/messages/conversations', { participantIds: [userId], type: 'direct' });
      setUserResults([]);
      setUserSearch('');
      loadConversations();
      setSelectedId(res.data.data.id);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const toggleGroupUser = (u) => {
    setGroupUsers((prev) => {
      if (prev.find((x) => x.id === u.id)) {
        return prev.filter((x) => x.id !== u.id);
      }
      return [...prev, u];
    });
  };

  const createGroup = async () => {
    if (groupUsers.length === 0) {
      setStatus('Chọn ít nhất 1 thành viên để tạo nhóm');
      return;
    }
    try {
      const res = await api.post('/messages/conversations', { participantIds: groupUsers.map((u) => u.id), type: 'group', title: groupName || undefined });
      setGroupUsers([]);
      setGroupName('');
      setUserResults([]);
      setUserSearch('');
      setShowGroupModal(false);
      loadConversations();
      setSelectedId(res.data.data.id);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const downloadAttachment = async (a) => {
    try {
      const res = await api.get(`/messages/attachments/${a.id}/download`, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'];
      let filename = a.name;
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
      setStatus(err.message || 'Tải file thất bại');
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <aside className="lg:col-span-3 rounded-xl bg-white p-3 shadow-sm border border-gray-100 flex flex-col">
        <div className="mb-3 flex items-center gap-2 rounded-md border px-2 py-1">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none text-sm focus:outline-none"
            placeholder="Tìm kiếm hội thoại"
          />
        </div>
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'marked', label: 'Đã đánh dấu' },
            { key: 'direct', label: 'Tutor/Tutee' },
            { key: 'group', label: 'Nhóm' },
            { key: 'muted', label: 'Muted' },
          ].map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setFilter(btn.key)}
              className={classNames(
                'rounded-full border px-3 py-1',
                filter === btn.key ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-700',
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filtered.map((c) => {
            const other = c.participantsDetail?.find((p) => p.id !== user?.id) || c.participantsDetail?.[0];
            const label = c.type === 'group'
              ? (c.title || `Nhóm (${c.participantsDetail?.length || 0})`)
              : (other?.name || 'Hội thoại');
            return (
              <button
                key={c.id}
                type="button"
                className={classNames(
                  'w-full rounded-lg border px-3 py-2 text-left',
                  selectedId === c.id ? 'border-primary bg-primary/10' : 'border-gray-100 hover:border-primary/40',
                )}
                onClick={() => {
                  setSelectedId(c.id);
                  markConversationRead(c.id);
                  setNewAlert('');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-gray-900">{label}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {c.isMarked && <Star size={14} className="text-yellow-500" />}
                    {c.isMuted && <BellOff size={14} className="text-gray-400" />}
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 text-[11px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600">{c.lastMessage?.content || 'Chưa có tin nhắn'}</div>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-gray-500">Không có hội thoại.</p>}
        </div>
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-xs font-semibold text-gray-700">Tìm người để nhắn tin</p>
          <div className="flex items-center gap-2 rounded-md border px-2 py-1">
            <Search size={16} className="text-gray-500" />
            <input
              value={userSearch}
              onChange={(e) => searchUsers(e.target.value)}
              className="w-full border-none text-sm focus:outline-none"
              placeholder="Nhập tên/username/email"
            />
          </div>
          {userResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-white shadow-sm">
              {userResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50">
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="font-semibold text-gray-900"
                      onClick={() => startConversation(u.id)}
                    >
                      {u.name}
                    </button>
                    <div className="text-xs text-gray-600">{u.email}</div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 text-xs text-primary"
                    onClick={() => toggleGroupUser(u)}
                  >
                    {groupUsers.find((x) => x.id === u.id) ? 'Bỏ chọn' : 'Chọn nhóm'}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 rounded-md border bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-700">Tạo nhóm chat</p>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
              placeholder="Tên nhóm (tùy chọn)"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {groupUsers.map((u) => (
                <span key={u.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  {u.name}
                  <button type="button" onClick={() => toggleGroupUser(u)}>×</button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => { setShowGroupModal(true); searchUsers(userSearch); }}
              >
                Chọn thành viên
              </button>
              <button
                type="button"
                onClick={createGroup}
                className="w-1/2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-6 rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CircleDot size={14} className={current ? 'text-green-500' : 'text-gray-400'} />
            {current ? 'Đang chat' : 'Chọn một hội thoại'}
            {current && current.participantsDetail?.map((p) => (
              <span key={p.id} className="text-xs text-gray-600">
                {online.includes(p.id) ? '• Online' : '• Offline'}
              </span>
            ))}
          </div>
          {newAlert && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {newAlert}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <button type="button" onClick={toggleMark} className="rounded-md border px-2 py-1">Đánh dấu</button>
            <button type="button" onClick={toggleMute} className="rounded-md border px-2 py-1">Mute</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id} className={classNames('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div
                  className={classNames(
                    'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                    isMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900',
                  )}
                >
                  <div>{m.content}</div>
                  {m.attachments?.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className="mt-1 block text-xs underline"
                      onClick={() => downloadAttachment(a)}
                    >
                      📎 {a.name}
                    </button>
                  ))}
                  <div className={classNames('mt-1 text-[11px]', isMe ? 'text-white/80' : 'text-gray-500')}>
                    {new Date(m.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <p className="text-sm text-gray-500">Chưa có tin nhắn.</p>}
        </div>

        {status && <div className="mx-4 mb-2 rounded-md bg-danger/10 px-3 py-2 text-xs text-danger">{status}</div>}

        <div className="border-t p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Paperclip size={16} />
            <label className="flex cursor-pointer items-center gap-2 text-primary">
              <Upload size={16} />
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file ? file.name : 'Chọn file (tối đa 20MB)'}
            </label>
          </div>
          <div className="flex gap-2">
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={2}
              placeholder="Nhập tin nhắn..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="button"
              onClick={send}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Send size={16} /> Gửi
            </button>
          </div>
        </div>
      </section>

      <aside className="lg:col-span-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Info size={16} /> Thông tin hội thoại
        </div>
        {current ? (
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            {current.participantsDetail?.map((p) => (
              <div key={p.id} className="rounded-lg border border-gray-100 px-3 py-2">
                <div className="font-semibold text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-600 uppercase">{p.role}</div>
                <div className="text-xs text-gray-600">{p.email}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Chọn hội thoại để xem chi tiết.</p>
        )}
      </aside>

      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Chọn thành viên nhóm</h4>
              <button type="button" onClick={() => setShowGroupModal(false)}>×</button>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-md border px-2 py-1">
              <Search size={16} className="text-gray-500" />
              <input
                value={userSearch}
                onChange={(e) => searchUsers(e.target.value)}
                className="w-full border-none text-sm focus:outline-none"
                placeholder="Nhập tên/username/email"
              />
            </div>
            <div className="mt-3 max-h-80 overflow-y-auto rounded-md border bg-white">
              {userResults.map((u) => {
                const checked = !!groupUsers.find((x) => x.id === u.id);
                return (
                  <label key={u.id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50">
                    <div>
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-600">{u.email}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGroupUser(u)}
                      className="h-4 w-4"
                    />
                  </label>
                );
              })}
              {userResults.length === 0 && <p className="p-3 text-sm text-gray-500">Không tìm thấy người dùng.</p>}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {groupUsers.map((u) => (
                  <span key={u.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {u.name}
                    <button type="button" onClick={() => toggleGroupUser(u)}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700" onClick={() => setShowGroupModal(false)}>Đóng</button>
                <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={createGroup}>Tạo nhóm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
