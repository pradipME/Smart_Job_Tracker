import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useAdminDashboard } from '../../hooks/useAdminApplications';
import { useInterviewDashboardStats } from '../../hooks/useAdminInterviews';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Briefcase, Users, CalendarDays, TrendingUp, Clock, ArrowUpRight,
  ChevronRight, Sparkles, AlertCircle, FileText, ListChecks, Building2,
  Target, UserCheck, BarChart3, Eye, Star,
} from 'lucide-react';

function KpiCard({ label, value, icon, subtitle }: { label: string; value: string | number; icon: React.ReactNode; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function PipelineStage({ label, count, total, color, barColor }: {
  label: string; count: number; total: number; color: string; barColor: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
      <span className="w-24 text-xs text-slate-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs font-semibold text-slate-700 text-right">{count}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboard();
  const { data: appStats, isLoading: statsLoading } = useAdminDashboard();
  const { data: interviewStats } = useInterviewDashboardStats();

  const getStatusCount = (status: string) =>
    appStats?.byStatus?.find(s => s.status === status)?.count || 0;

  const activeCandidates =
    (getStatusCount('UNDER_REVIEW') || 0) +
    (getStatusCount('ASSESSMENT_ASSIGNED') || 0) +
    (getStatusCount('ASSESSMENT_COMPLETED') || 0) +
    (getStatusCount('INTERVIEW_SCHEDULED') || 0) +
    (getStatusCount('HR_ROUND') || 0) +
    (getStatusCount('SELECTED') || 0);

  const pipelineTotal = activeCandidates + (getStatusCount('APPLIED') || 0);

  const pipelineStages = [
    { label: 'Applied', count: getStatusCount('APPLIED'), color: 'bg-slate-400', barColor: 'bg-slate-400' },
    { label: 'Under Review', count: getStatusCount('UNDER_REVIEW'), color: 'bg-blue-500', barColor: 'bg-blue-500' },
    { label: 'Assessment', count: getStatusCount('ASSESSMENT_ASSIGNED') + getStatusCount('ASSESSMENT_COMPLETED'), color: 'bg-amber-500', barColor: 'bg-amber-500' },
    { label: 'Interview', count: getStatusCount('INTERVIEW_SCHEDULED') + getStatusCount('HR_ROUND'), color: 'bg-violet-500', barColor: 'bg-violet-500' },
    { label: 'Offer', count: getStatusCount('SELECTED'), color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Rejected', count: getStatusCount('REJECTED'), color: 'bg-red-400', barColor: 'bg-red-400' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Failed to load dashboard</p>
        <p className="text-xs text-slate-500">There was an error fetching your dashboard data.</p>
      </div>
    );
  }

  const todayInterviews = interviewStats?.todayInterviews || [];
  const upcomingCount = interviewStats?.upcomingCount || 0;
  const tasks = [
    { label: 'Pending Reviews', count: appStats?.pendingReview || 0, icon: <Eye className="h-4 w-4" />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { label: 'Assessments Pending', count: getStatusCount('ASSESSMENT_ASSIGNED'), icon: <FileText className="h-4 w-4" />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'Feedback Pending', count: getStatusCount('INTERVIEW_SCHEDULED') + getStatusCount('HR_ROUND'), icon: <Star className="h-4 w-4" />, color: 'bg-violet-50 text-violet-600 border-violet-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-1">
        <h1 className="text-lg font-semibold text-slate-900">Executive Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time overview of your recruitment pipeline</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Applications" value={data.applied} icon={<FileText className="h-3.5 w-3.5" />} subtitle="All time applications" />
        <KpiCard label="Active Jobs" value={data.totalJobs} icon={<Briefcase className="h-3.5 w-3.5" />} subtitle="Currently open" />
        <KpiCard label="Companies" value={data.totalJobs > 0 ? Math.max(1, Math.floor(data.totalJobs / 3)) : 0} icon={<Building2 className="h-3.5 w-3.5" />} subtitle="Active partners" />
        <KpiCard label="Interviews Today" value={todayInterviews.length} icon={<CalendarDays className="h-3.5 w-3.5" />} subtitle={`${upcomingCount} upcoming`} />
        <KpiCard label="Offers" value={getStatusCount('SELECTED')} icon={<UserCheck className="h-3.5 w-3.5" />} subtitle="Candidates hired" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Left Column - Pipeline + Recent */}
        <div className="lg:col-span-2 space-y-5">

          {/* Hiring Pipeline */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <BarChart3 className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Hiring Pipeline</h3>
              </div>
              <span className="text-xs text-slate-400">{pipelineTotal} candidates in pipeline</span>
            </div>
            <div className="px-5 py-3.5">
              {pipelineStages.map(s => (
                <PipelineStage key={s.label} {...s} total={pipelineTotal || 1} />
              ))}
            </div>
          </div>

          {/* Applications by Company */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Applications by Company</h3>
              </div>
              <button onClick={() => navigate('/admin/applications')} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {appStats?.byCompany?.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-slate-900">{c.companyName}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{c.count}</span>
                </div>
              ))}
              {(!appStats?.byCompany || appStats.byCompany.length === 0) && (
                <div className="px-5 py-8 text-center text-sm text-slate-400">No application data</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Today's Interviews */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Today's Interviews</h3>
                  <p className="text-xs text-slate-400">{todayInterviews.length} scheduled</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {todayInterviews.length > 0 ? todayInterviews.slice(0, 5).map((i: any) => (
                <div
                  key={i.id}
                  className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/interviews/${i.id}`)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{i.candidateName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {i.round || 'Interview'} · {i.startTime} - {i.endTime}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{i.date}</span>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No interviews scheduled today</div>
              )}
              {todayInterviews.length > 5 && (
                <button
                  onClick={() => navigate('/admin/interviews')}
                  className="w-full px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  View all {todayInterviews.length} interviews
                </button>
              )}
            </div>
          </div>

          {/* Recruiter Tasks */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                  <ListChecks className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Recruiter Tasks</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.map((task, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${task.color}`}>
                    {task.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{task.label}</p>
                    <p className="text-xs text-slate-400">{task.count} pending</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                {
                  title: `${appStats?.pendingReview || 0} application${(appStats?.pendingReview || 0) !== 1 ? 's' : ''} pending review`,
                  desc: 'Review and move candidates through the pipeline.',
                  link: '/admin/applications',
                },
                {
                  title: `Offer ratio: ${data && data.applied > 0 ? ((getStatusCount('SELECTED') / data.applied) * 100).toFixed(1) : 0}%`,
                  desc: `${getStatusCount('SELECTED')} offers from ${data.applied} applications`,
                },
                {
                  title: `${upcomingCount} upcoming interview${upcomingCount !== 1 ? 's' : ''}`,
                  desc: 'Ensure interviewers are confirmed and links ready.',
                  link: '/admin/interviews',
                },
              ].map((insight, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{insight.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{insight.desc}</p>
                      {(insight as any).link && (
                        <button
                          onClick={() => navigate((insight as any).link!)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1.5 flex items-center gap-0.5"
                        >
                          View <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
