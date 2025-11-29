import { useEffect, useState } from 'react';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import api from '../../services/api';

const TABS = ['overview', 'tutor', 'student', 'session', 'feedback'];
const COLORS = ['#186AC7', '#1557A6', '#6C757D', '#FFC107', '#28A745'];

export default function AdminReports() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState({});
  const [tutorMetrics, setTutorMetrics] = useState({});
  const [studentMetrics, setStudentMetrics] = useState({});
  const [sessionMetrics, setSessionMetrics] = useState({});
  const [feedbackSummary, setFeedbackSummary] = useState({});

  useEffect(() => {
    api.get('/reports/overview').then((res) => setOverview(res.data.data)).catch(() => {});
    api.get('/reports/tutor-metrics').then((res) => setTutorMetrics(res.data.data)).catch(() => {});
    api.get('/reports/student-metrics').then((res) => setStudentMetrics(res.data.data)).catch(() => {});
    api.get('/reports/session-metrics').then((res) => setSessionMetrics(res.data.data)).catch(() => {});
    api.get('/reports/feedback-summary').then((res) => setFeedbackSummary(res.data.data)).catch(() => {});
  }, []);

  const exportReport = async (format) => {
    await api.post('/reports/export', { type: tab, format });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-6 py-5 text-white shadow">
        <h1 className="text-2xl font-semibold">Báo cáo & Phân tích</h1>
        <p className="text-sm text-white/80">Tổng hợp dữ liệu học tập và hoạt động hệ thống.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Phân tích chung' },
          { id: 'tutor', label: 'Tutor Metrics' },
          { id: 'student', label: 'Student Metrics' },
          { id: 'session', label: 'Session Statistics' },
          { id: 'feedback', label: 'Feedback' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: 'Tổng Tutor hoạt động', value: overview.totalTutors },
              { label: 'Tổng sinh viên tham gia', value: overview.totalStudents },
              { label: 'Tổng buổi học', value: overview.totalSessions },
              { label: 'Điểm hài lòng TB', value: overview.avgRating },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs uppercase text-gray-500">{c.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{c.value ?? '--'}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">Xu hướng tham gia</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.trendData || []}>
                  <XAxis dataKey="date" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#186AC7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => exportReport('pdf')} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Xuất PDF</button>
            <button type="button" onClick={() => exportReport('excel')} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">Xuất Excel</button>
          </div>
        </div>
      )}

      {tab === 'tutor' && (
        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Tutor Metrics</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tutor hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{tutorMetrics.activeTutors}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tỷ lệ hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{tutorMetrics.activityRate}%</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs uppercase text-gray-500">Giờ hỗ trợ TB</p>
              <p className="text-2xl font-semibold text-gray-900">{tutorMetrics.avgHours}</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">Top Tutors</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tutorMetrics.topTutors || []}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#186AC7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'student' && (
        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Student Metrics</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tổng SV tham gia</p>
              <p className="text-2xl font-semibold text-gray-900">{studentMetrics.totalStudents}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs uppercase text-gray-500">SV tích cực</p>
              <p className="text-2xl font-semibold text-gray-900">{studentMetrics.activeRate}%</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs uppercase text-gray-500">Nguy cơ học vụ</p>
              <p className="text-2xl font-semibold text-gray-900">{studentMetrics.atRisk}</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">Phân bố theo khoa</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentMetrics.byDept || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#186AC7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'session' && (
        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Session Statistics</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tổng số buổi</p>
              <p className="text-2xl font-semibold text-gray-900">{sessionMetrics.totalHours}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tỷ lệ bị hủy</p>
              <p className="text-2xl font-semibold text-gray-900">{sessionMetrics.cancelRate}%</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-gray-800">Top môn</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionMetrics.topSubjects || []}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FFC107" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-gray-800">Phân bố Online/Offline</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Online', value: 55 },
                        { name: 'Offline', value: 45 },
                      ]}
                      dataKey="value"
                      outerRadius={90}
                      label
                    >
                      {COLORS.slice(0, 2).map((c, i) => <Cell key={c} fill={c} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Feedback (Admin only)</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs uppercase text-gray-500">Điểm hài lòng TB</p>
              <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.avgSatisfaction?.toFixed?.(1) || '--'}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tổng feedback</p>
              <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.totalFeedback}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs uppercase text-gray-500">Tỷ lệ phản hồi</p>
              <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.responseRate}%</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">Phân bố rating</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackSummary.ratingsDist || []}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#186AC7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
