import MessagesLayout from '../../components/messages/MessagesLayout';

export default function TutorMessages() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Nhắn tin</h2>
        <p className="text-sm text-gray-600">Trao đổi với sinh viên, gửi tài liệu nhanh.</p>
      </div>
      <MessagesLayout />
    </div>
  );
}
