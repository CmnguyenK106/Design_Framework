import MessagesLayout from '../../components/messages/MessagesLayout';

export default function StudentMessages() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Nhắn tin</h2>
        <p className="text-sm text-gray-600">Trao đổi với tutor và bạn học, đính kèm tài liệu.</p>
      </div>
      <MessagesLayout />
    </div>
  );
}
