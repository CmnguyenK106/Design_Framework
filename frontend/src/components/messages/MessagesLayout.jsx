import { useEffect, useMemo, useState } from 'react';
import { Paperclip, Search, Send, Star, BellOff, Info, CircleDot, Upload } from 'lucide-react';
import api from '../../services/api';
import classNames from 'classnames';
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
      // ignore for now
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
                  <div className="font-semibold text-sm text-gray-900">{other?.name || 'Hội thoại'}</div>
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
                    <a
                      key={a.id}
                      className="mt-1 block text-xs underline"
                      href={a.url.startsWith('http') ? a.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${a.url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 {a.name}
                    </a>
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
    </div>
  );
}
