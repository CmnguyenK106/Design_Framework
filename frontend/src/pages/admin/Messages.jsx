import MessagesLayout from '../../components/messages/MessagesLayout';

export default function AdminMessages() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Nhắn tin (Admin)</h2>
        <p className="text-sm text-gray-600">Theo dõi và trao đổi với tutor/sinh viên.</p>
      </div>
      <MessagesLayout />
    </div>
  );
}
