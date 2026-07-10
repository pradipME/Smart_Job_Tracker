import { useAuth } from '../contexts/AuthContext';
import CandidateDashboard from './candidate/Dashboard';
import AdminDashboard from './admin/Dashboard';

export default function Dashboard() {
  const { role } = useAuth();

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <CandidateDashboard />;
}
