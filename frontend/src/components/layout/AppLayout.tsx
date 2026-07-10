import { useState, useMemo, Fragment } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Users,
  ClipboardList,
  CalendarDays,
  Sparkles,
  ChevronDown,
  Settings,
  ChevronRight,
  ChevronLeft,
  FileText,
  CheckSquare,
  Clock,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: 'RECRUITMENT',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/applications', icon: Users, label: 'Applications' },
      { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
      { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
      { to: '/admin/interviews', icon: CalendarDays, label: 'Interviews' },
    ],
  },
  {
    label: 'ORGANIZATION',
    items: [
      { to: '/admin/companies', icon: Building2, label: 'Companies' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/admin/ai', icon: Sparkles, label: 'AI Intelligence' },
    ],
  },
];

const candidateNavItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { to: '/applications', icon: Users, label: 'My Applications' },
  { to: '/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/interviews', icon: CalendarDays, label: 'Interviews' },
  { to: '/resume', icon: CheckSquare, label: 'Resume' },
];

const navItemClasses = {
  base: 'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
  active: 'bg-indigo-600/15 text-white shadow-sm',
  inactive: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
};

const iconBoxClasses = {
  base: 'flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150',
  active: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  inactive: 'text-slate-400 group-hover:bg-slate-700/70 group-hover:text-slate-200',
};

function SidebarNavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const location = useLocation();
  const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to + '/'));

  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      className={`${navItemClasses.base} ${isActive ? navItemClasses.active : navItemClasses.inactive}`}
    >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-indigo-500" />
        )}
      <div className={`${iconBoxClasses.base} ${isActive ? iconBoxClasses.active : iconBoxClasses.inactive}`}>
        <Icon className="h-4 w-4" />
      </div>
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function AdminBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const segments = useMemo(() => {
    const parts: { label: string; href?: string }[] = [];
    if (path === '/admin') {
      parts.push({ label: 'Dashboard' });
      return parts;
    }

    if (path.startsWith('/admin/applications')) {
      parts.push({ label: 'Applications', href: '/admin/applications' });
      if (path !== '/admin/applications') parts.push({ label: 'Application Detail' });
    } else if (path.startsWith('/admin/jobs')) {
      parts.push({ label: 'Jobs', href: '/admin/jobs' });
      if (path.endsWith('/new')) parts.push({ label: 'New Job' });
      else if (path.endsWith('/edit')) parts.push({ label: 'Edit Job' });
      else if (path !== '/admin/jobs') parts.push({ label: 'Job Detail' });
    } else if (path.startsWith('/admin/assessments')) {
      parts.push({ label: 'Assessments', href: '/admin/assessments' });
      if (path.endsWith('/new')) parts.push({ label: 'New Assessment' });
      else if (path.endsWith('/edit')) parts.push({ label: 'Edit Assessment' });
      else if (path !== '/admin/assessments') parts.push({ label: 'Assessment Detail' });
    } else if (path.startsWith('/admin/interviews')) {
      parts.push({ label: 'Interviews', href: '/admin/interviews' });
      if (path.endsWith('/new')) parts.push({ label: 'Schedule Interview' });
      else if (path.endsWith('/edit')) parts.push({ label: 'Edit Interview' });
      else if (path !== '/admin/interviews') parts.push({ label: 'Interview Detail' });
    } else if (path.startsWith('/admin/companies')) {
      parts.push({ label: 'Companies', href: '/admin/companies' });
      if (path.endsWith('/new')) parts.push({ label: 'New Company' });
      else if (path.endsWith('/edit')) parts.push({ label: 'Edit Company' });
      else if (path !== '/admin/companies') parts.push({ label: 'Company Detail' });
    } else if (path.startsWith('/admin/ai')) {
      parts.push({ label: 'AI Intelligence' });
    }
    return parts;
  }, [path]);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <button
        onClick={() => navigate('/admin')}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
      </button>
      {segments.map((seg, i) => (
        <Fragment key={i}>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          {seg.href ? (
            <button
              onClick={() => navigate(seg.href!)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {seg.label}
            </button>
          ) : (
            <span className="text-slate-800 font-medium">{seg.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

function AdminTopbar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white border-b border-slate-200 px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <AdminBreadcrumbs />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="hidden sm:block text-xs text-slate-400 font-medium">{today}</span>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, jobs..."
            className="h-8 w-48 lg:w-64 rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-semibold shadow-sm cursor-pointer select-none hover:bg-indigo-700 transition-colors">
          JD
        </div>
      </div>
    </header>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const isAdmin = currentPath.startsWith('/admin');
  const isAssessmentAttemptRoute = currentPath.includes('/attempt');
  const isAssessmentResultRoute = currentPath.includes('/result');

  const auth = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    auth.logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  // ─── Admin Assessment attempt/result pages: minimal layout ───
  if (isAdmin && (isAssessmentAttemptRoute || isAssessmentResultRoute)) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Outlet />
      </div>
    );
  }

  // ─── Admin Layout ───
  if (isAdmin) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dark Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F172A] border-r border-slate-800 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 ${
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-56'
          }`}
        >
          {/* Logo */}
          <div className={`flex items-center h-14 shrink-0 px-4 border-b border-slate-800 ${
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 shadow-sm shadow-indigo-600/20">
                  <Briefcase className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold tracking-tight text-white">JobTrack</span>
                  <span className="text-[9px] font-medium text-indigo-400 block leading-tight">ATS</span>
                </div>
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 shadow-sm shadow-indigo-600/20">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 lg:hidden"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
            {adminNavGroups.map((group) => (
              <div key={group.label}>
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <SidebarNavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 px-2.5 py-2 space-y-0.5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400">
                <LogOut className="h-4 w-4" />
              </div>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-all duration-150"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </div>
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
            {!sidebarCollapsed && (
              <div className="px-3 pt-1">
                <span className="text-[9px] font-medium tracking-widest text-slate-600">v2.0.0</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-5 lg:p-6 animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile hamburger */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F172A] text-white shadow-lg lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  // ─── Candidate Layout ───
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[var(--border)] bg-[var(--card)] transition-all duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 h-16 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">JobTrack</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] lg:hidden transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {candidateNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-blue-500" />
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--secondary)]'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border)] px-3 py-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)] group-hover:bg-red-500/15 transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/80 px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--accent)] lg:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors">
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 lg:p-6 animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
