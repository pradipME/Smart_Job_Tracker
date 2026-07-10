import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import CompanyList from './pages/admin/companies/List';
import CompanyForm from './pages/admin/companies/Form';
import CompanyDetail from './pages/admin/companies/Detail';
import JobListingList from './pages/admin/jobs/List';
import JobListingForm from './pages/admin/jobs/Form';
import JobListingDetail from './pages/admin/jobs/Detail';
import CandidateJobList from './pages/candidate/jobs/List';
import CandidateJobDetail from './pages/candidate/jobs/Detail';
import CandidateApplicationList from './pages/candidate/applications/List';
import CandidateApplicationDetail from './pages/candidate/applications/Detail';
import AdminApplicationList from './pages/admin/applications/List';
import AdminApplicationDetail from './pages/admin/applications/Detail';
import AssessmentList from './pages/assessments/List';
import AssessmentAttempt from './pages/assessments/Attempt';
import AssessmentResult from './pages/assessments/Result';
import AdminAssessmentList from './pages/admin/assessments/List';
import AdminAssessmentForm from './pages/admin/assessments/Form';
import AdminAssessmentDetail from './pages/admin/assessments/Detail';
import AdminInterviewList from './pages/admin/interviews/List';
import AdminInterviewForm from './pages/admin/interviews/Form';
import AdminInterviewDetail from './pages/admin/interviews/Detail';
import InterviewList from './pages/interviews/List';
import InterviewDetail from './pages/interviews/Detail';
import AiDashboard from './pages/admin/ai/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !roles.includes(role)) return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <>{children}</>;
}

function NavigateToDashboard() {
  const { isAuthenticated, role } = useAuth();
  return <Navigate to={isAuthenticated ? (role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Admin routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/applications" element={<RoleProtectedRoute roles={['ADMIN']}><AdminApplicationList /></RoleProtectedRoute>} />
        <Route path="/admin/applications/:id" element={<RoleProtectedRoute roles={['ADMIN']}><AdminApplicationDetail /></RoleProtectedRoute>} />
        <Route path="/admin/jobs" element={<RoleProtectedRoute roles={['ADMIN']}><JobListingList /></RoleProtectedRoute>} />
        <Route path="/admin/jobs/new" element={<RoleProtectedRoute roles={['ADMIN']}><JobListingForm /></RoleProtectedRoute>} />
        <Route path="/admin/jobs/:id" element={<RoleProtectedRoute roles={['ADMIN']}><JobListingDetail /></RoleProtectedRoute>} />
        <Route path="/admin/jobs/:id/edit" element={<RoleProtectedRoute roles={['ADMIN']}><JobListingForm /></RoleProtectedRoute>} />
        <Route path="/admin/assessments" element={<RoleProtectedRoute roles={['ADMIN']}><AdminAssessmentList /></RoleProtectedRoute>} />
        <Route path="/admin/assessments/new" element={<RoleProtectedRoute roles={['ADMIN']}><AdminAssessmentForm /></RoleProtectedRoute>} />
        <Route path="/admin/assessments/:id" element={<RoleProtectedRoute roles={['ADMIN']}><AdminAssessmentDetail /></RoleProtectedRoute>} />
        <Route path="/admin/assessments/:id/edit" element={<RoleProtectedRoute roles={['ADMIN']}><AdminAssessmentForm /></RoleProtectedRoute>} />
        <Route path="/admin/interviews" element={<RoleProtectedRoute roles={['ADMIN']}><AdminInterviewList /></RoleProtectedRoute>} />
        <Route path="/admin/interviews/new" element={<RoleProtectedRoute roles={['ADMIN']}><AdminInterviewForm /></RoleProtectedRoute>} />
        <Route path="/admin/interviews/:id" element={<RoleProtectedRoute roles={['ADMIN']}><AdminInterviewDetail /></RoleProtectedRoute>} />
        <Route path="/admin/interviews/:id/edit" element={<RoleProtectedRoute roles={['ADMIN']}><AdminInterviewForm /></RoleProtectedRoute>} />
        <Route path="/admin/companies" element={<RoleProtectedRoute roles={['ADMIN']}><CompanyList /></RoleProtectedRoute>} />
        <Route path="/admin/companies/new" element={<RoleProtectedRoute roles={['ADMIN']}><CompanyForm /></RoleProtectedRoute>} />
        <Route path="/admin/companies/:id" element={<RoleProtectedRoute roles={['ADMIN']}><CompanyDetail /></RoleProtectedRoute>} />
        <Route path="/admin/companies/:id/edit" element={<RoleProtectedRoute roles={['ADMIN']}><CompanyForm /></RoleProtectedRoute>} />
        <Route path="/admin/ai" element={<RoleProtectedRoute roles={['ADMIN']}><AiDashboard /></RoleProtectedRoute>} />

        {/* Candidate routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<CandidateJobList />} />
        <Route path="/jobs/:id" element={<CandidateJobDetail />} />
        <Route path="/applications" element={<CandidateApplicationList />} />
        <Route path="/applications/:id" element={<CandidateApplicationDetail />} />
        <Route path="/resume" element={<RoleProtectedRoute roles={['CANDIDATE']}><Resume /></RoleProtectedRoute>} />
        <Route path="/assessments" element={<RoleProtectedRoute roles={['CANDIDATE']}><AssessmentList /></RoleProtectedRoute>} />
        <Route path="/assessments/:id/attempt" element={<RoleProtectedRoute roles={['CANDIDATE']}><AssessmentAttempt /></RoleProtectedRoute>} />
        <Route path="/assessments/:id/result" element={<RoleProtectedRoute roles={['CANDIDATE']}><AssessmentResult /></RoleProtectedRoute>} />
        <Route path="/interviews" element={<RoleProtectedRoute roles={['CANDIDATE']}><InterviewList /></RoleProtectedRoute>} />
        <Route path="/interviews/:id" element={<RoleProtectedRoute roles={['CANDIDATE']}><InterviewDetail /></RoleProtectedRoute>} />
      </Route>

      <Route path="*" element={<NavigateToDashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
