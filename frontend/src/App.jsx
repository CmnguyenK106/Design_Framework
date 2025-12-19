import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/layout/ProtectedLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Email verification disabled
// import VerifyEmail from './pages/VerifyEmail';
import RoleRedirect from './pages/RoleRedirect';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentSessions from './pages/student/Sessions';
import StudentFeedback from './pages/student/Feedback';
import StudentMessages from './pages/student/Messages';
import StudentResources from './pages/student/Resources';
import TutorDashboard from './pages/tutor/Dashboard';
import TutorSessions from './pages/tutor/Sessions';
import TutorFeedback from './pages/tutor/Feedback';
import TutorMessages from './pages/tutor/Messages';
import TutorResources from './pages/tutor/Resources';
import TutorPairRequests from './pages/tutor/PairRequests';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSessions from './pages/admin/Sessions';
import AdminFeedback from './pages/admin/Feedback';
import AdminMessages from './pages/admin/Messages';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import NotificationsPage from './pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Email verification disabled */}
          {/* <Route path="/verify" element={<VerifyEmail />} /> */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/feedback" element={<StudentFeedback />} />
            <Route path="/student/messages" element={<StudentMessages />} />
            <Route path="/student/resources" element={<StudentResources />} />

            <Route path="/tutor/dashboard" element={<TutorDashboard />} />
            <Route path="/tutor/profile" element={<StudentProfile />} />
            <Route path="/tutor/sessions" element={<TutorSessions />} />
            <Route path="/tutor/pair-requests" element={<TutorPairRequests />} />
            <Route path="/tutor/notifications" element={<NotificationsPage />} />
            <Route path="/tutor/feedback" element={<TutorFeedback />} />
            <Route path="/tutor/messages" element={<TutorMessages />} />
            <Route path="/tutor/resources" element={<TutorResources />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
