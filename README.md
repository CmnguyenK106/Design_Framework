# Tutor Support System (Mock SSO Demo)

Web application demo cho chương trình Tutor/Mentor HCMUT với kiến trúc React + Tailwind (frontend) và Express (backend, mock data in-memory). Phù hợp để trình diễn các use case chính: đăng nhập SSO giả lập, dashboard theo vai trò, quản lý hồ sơ, quản lý phiên tư vấn, và quản trị người dùng.

## Features (đã có)
- Mock SSO login với 3 tài khoản demo, JWT lưu localStorage, tự chuyển hướng dashboard theo role.
- Dashboard cho 3 vai trò (admin / tutor / member), thống kê nhanh và danh sách phiên mẫu.
- Quản lý hồ sơ cá nhân (xem/sửa, toggles thông báo) cho member/tutor; admin CRUD user.
- Lịch & phiên tư vấn: student xem/đăng ký, tutor tạo lịch, conflict validation cơ bản, admin xem toàn bộ.
- Thông báo in-app: lọc theo trạng thái/loại, đánh dấu đọc, đánh dấu tất cả; cài đặt kênh nhận (in-app/email/sms, mock).
- Feedback: sinh viên gửi đánh giá buổi đã hoàn thành (5 tiêu chí, ẩn danh), lịch sử; tutor xem & đánh dấu đã xem; admin xem toàn bộ.
- Nhắn tin (mock): danh sách hội thoại, lọc, đánh dấu, mute, gửi/nhận tin nhắn, đính kèm mock.
- Tài nguyên (mock): student xem/tải, tutor upload tài liệu và xem tiến độ; admin xem/tạo backup mock.
- Báo cáo (mock): KPI tổng quan, biểu đồ xu hướng/subject/rating, export mock (Excel/PDF).
- In-memory mock data: 50+ users, 100+ sessions (đảm bảo demo user có 1 buổi completed), 80 feedback, 50 notifications, 200 messages, 20 tài liệu, 5 backup.

## Tech Stack
- Frontend: React 19, Vite, TailwindCSS 3, React Router, React Hook Form, Axios, Zustand (có thể dùng).
- Backend: Node.js, Express, JWT, dayjs, uuid (mock DB in-memory).
- Styling: Tailwind với palette HCMUT blue (#186AC7).

## Project Structure
```
tutor-support-system/
├── frontend/                # Vite + React app
│   ├── public/logo-hcmut.png
│   ├── src/
│   │   ├── components/layout/ (Header, Sidebar, ProtectedLayout)
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/ (login + dashboards + profile + sessions)
│   │   └── services/api.js
│   └── .env.example
├── backend/                 # Express API (mock data)
│   ├── controllers/ (auth, user, session)
│   ├── data/ (users, sessions generator)
│   ├── middleware/ (auth, roleCheck, errorHandler)
│   ├── routes/ (auth, users, sessions, admin)
│   ├── server.js
│   └── .env.example
└── README.md
```

## Demo Accounts
| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin    |
| Tutor | tutor    | tutor    |
| Member| 2312487  | demo     |

## Installation
1. Clone repo và cài đặt frontend:
   ```bash
   cd frontend
   cp .env.example .env   # chỉnh VITE_API_URL nếu cần
   npm install
   npm run dev   # http://localhost:5173
   ```
2. Cài đặt backend:
   ```bash
   cd backend
   cp .env.example .env   # chỉnh JWT_SECRET nếu cần
   npm install
   npm run dev   # http://localhost:3000
   ```
3. Đăng nhập với một tài khoản demo, hệ thống sẽ tự điều hướng dashboard theo vai trò.

## API (tóm tắt các endpoint hiện có)
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`
- User: `GET /api/users/profile`, `PUT /api/users/profile`, `PATCH /api/users/avatar`, `PUT /api/users/password`
- Sessions: `GET /api/sessions`, `GET /api/sessions/:id`, `POST /api/sessions` (tutor/admin), `PUT /api/sessions/:id`, `DELETE /api/sessions/:id`, `POST /api/sessions/:id/register` (member), `DELETE /api/sessions/:id/unregister` (member)
- Admin: `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`, `PATCH /api/admin/users/:id/role`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/mark-all-read`
- Feedback: `GET /api/feedback/sessions/completed` (member), `POST /api/feedback` (member), `GET /api/feedback/my-history` (member), `GET /api/feedback/tutor` + `PATCH /api/feedback/tutor/:id/mark-viewed` (tutor), `GET /api/feedback/admin` (admin)
- Messaging: `GET /api/messages/conversations`, `GET /api/messages/conversations/:id/messages`, `POST /api/messages`, `DELETE /api/messages/:id`, `PATCH /api/messages/conversations/:id/mark`, `PATCH /api/messages/conversations/:id/mute`, `POST /api/messages/upload-file`
- Resources: `GET /api/resources`, `GET /api/resources/:id/download`, `POST /api/resources/upload` (tutor/admin), `DELETE /api/resources/:id`, `GET /api/resources/tutor/progress`, `PUT /api/resources/tutor/progress/:id`, `GET /api/resources/admin/backups`, `POST /api/resources/admin/backup`
- Reports: `GET /api/reports/overview`, `GET /api/reports/session-metrics`, `GET /api/reports/feedback-summary`, `POST /api/reports/export`

## Screenshots
- Login: gradient nền xanh, logo HCMUT ở card trái, form đăng nhập ở card phải + danh sách tài khoản demo.
- Dashboard: Header có logo nhỏ + avatar user, sidebar theo vai trò, cards thống kê, danh sách phiên.
(Bạn có thể chụp nhanh sau khi chạy `npm run dev` ở cả frontend/backend.)

## Team Members
- (Cập nhật tên các thành viên nhóm tại đây.)

## AI Usage Declaration
- Một phần nội dung kiến trúc và scaffold được hỗ trợ bởi công cụ AI (ChatGPT/Codex). Logic kinh doanh, mock data và cấu trúc mã được kiểm tra và chỉnh sửa thủ công cho mục đích demo.
