import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useAdminDashboard } from '../../hooks/useAdminApplications';
import { useInterviewDashboardStats } from '../../hooks/useAdminInterviews';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Briefcase, Users, CalendarDays, CheckCircle, TrendingUp,
  Clock, ArrowUpRight, ChevronRight, Bell, Sparkles,
  AlertCircle, FileText, ListChecks,
} from 'lucide-react';

function StatCard({ label, value, icon, trend, color }: {
  label: string; value: string | number; icon: React.ReactNode; trend?: { value: number; up: boolean }; color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`flex h-9 w-9 items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            <TrendingUp className={`h-3 w-3 ${!trend.up ? 'rotate-180' : ''}`} />
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}

function PipelineBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-slate-600 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-slate-100 relative overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs font-semibold text-slate-800 text-right">{count}</span>
    </div>
  );
}

function CalendarStrip({ events }: { events: { date: string; title: string; time: string; color: string }[] }) {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - today.getDay() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-px bg-slate-200">
      {weekDays.map((day, i) => {
        const key = day.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.date === key);
        const isToday = day.toDateString() === today.toDateString();
        return (
          <div key={key} className={`bg-white p-2 min-h-[80px] ${isToday ? 'bg-indigo-50/50' : ''}`}>
            <div className={`text-center text-[10px] font-semibold mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
              <div className={`mt-0.5 mx-auto h-5 w-5 flex items-center justify-center text-[10px] ${isToday ? 'bg-indigo-600 text-white' : ''}`}>
                {day.getDate()}
              </div>
            </div>
            <div className="space-y-0.5">
              {dayEvents.slice(0, 2).map((ev, j) => (
                <div key={j} className={`text-[9px] px-1 py-0.5 truncate ${ev.color}`}>{ev.title}</div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[9px] text-slate-400 text-center">+{dayEvents.length - 2}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <Skeleton className="h-5 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-none" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-48 rounded-none" />
          <Skeleton className="h-64 rounded-none" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 rounded-none" />
          <Skeleton className="h-48 rounded-none" />
          <Skeleton className="h-32 rounded-none" />
        </div>
      </div>
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

  const totalInterviews =
    (interviewStats?.todayCount || 0) + (interviewStats?.upcomingCount || 0) + (interviewStats?.completedCount || 0);

  const pipelineStages = [
    { label: 'Applied', count: getStatusCount('APPLIED'), color: 'bg-slate-400' },
    { label: 'Screening', count: getStatusCount('UNDER_REVIEW') + getStatusCount('ASSESSMENT_ASSIGNED') + getStatusCount('ASSESSMENT_COMPLETED'), color: 'bg-amber-400' },
    { label: 'Interview', count: getStatusCount('INTERVIEW_SCHEDULED') + getStatusCount('HR_ROUND'), color: 'bg-indigo-500' },
    { label: 'Offer', count: getStatusCount('SELECTED'), color: 'bg-emerald-500' },
    { label: 'Rejected', count: getStatusCount('REJECTED'), color: 'bg-red-400' },
  ];

  const pipelineTotal = pipelineStages.reduce((sum, s) => sum + s.count, 0);

  const calendarEvents = interviewStats?.todayInterviews?.map(i => ({
    date: i.date,
    time: i.startTime,
    title: i.candidateName,
    color: 'bg-indigo-100 text-indigo-700',
  })) || [];

  const tasks = [
    { id: 1, title: 'Review new applications', done: false, priority: 'high' as const, due: 'Today' },
    { id: 2, title: 'Schedule technical interviews', done: false, priority: 'high' as const, due: 'Tomorrow' },
    { id: 3, title: 'Send offer letters', done: false, priority: 'medium' as const, due: 'This week' },
    { id: 4, title: 'Update job descriptions', done: true, priority: 'low' as const },
    { id: 5, title: 'Follow up with candidates', done: false, priority: 'low' as const, due: 'This week' },
  ];

  const insights = [
    {
      title: `${appStats?.pendingReview || 0} application${(appStats?.pendingReview || 0) !== 1 ? 's' : ''} pending review`,
      desc: 'Review and move candidates through the pipeline.',
      type: 'info' as const,
      link: '/admin/applications',
    },
    {
      title: `Offer ratio: ${data && data.applied > 0 ? ((data.offer / data.applied) * 100).toFixed(1) : 0}%`,
      desc: `${data?.offer || 0} offers from ${data?.applied || 0} applications`,
      type: 'opportunity' as const,
    },
    {
      title: `${interviewStats?.upcomingCount || 0} upcoming interview${(interviewStats?.upcomingCount || 0) !== 1 ? 's' : ''}`,
      desc: 'Ensure interviewers are confirmed and links ready.',
      type: interviewStats && interviewStats.upcomingCount > 5 ? 'warning' as const : 'info' as const,
      link: '/admin/interviews',
    },
  ];

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <Clock className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time hiring overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-1">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Jobs" value={data.totalJobs} icon={<Briefcase className="h-4 w-4 text-white" />} color="bg-indigo-600 text-white" />
        <StatCard label="Applications" value={data.applied} icon={<FileText className="h-4 w-4 text-white" />} color="bg-violet-600 text-white" />
        <StatCard label="Active Candidates" value={activeCandidates} icon={<Users className="h-4 w-4 text-white" />} color="bg-amber-500 text-white" />
        <StatCard label="Interviews" value={totalInterviews} icon={<CalendarDays className="h-4 w-4 text-white" />} color="bg-emerald-600 text-white" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Pipeline */}
          <div className="bg-white border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Hiring Pipeline</h3>
              </div>
              <span className="text-[10px] text-slate-400">{pipelineTotal} total</span>
            </div>
            <div className="p-4 space-y-2.5">
              {pipelineStages.map(s => (
                <PipelineBar key={s.label} {...s} total={pipelineTotal} />
              ))}
            </div>
          </div>

          {/* Activity / Latest Applications */}
          <div className="bg-white border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center bg-emerald-100 text-emerald-600">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Recent Activity</h3>
              </div>
              <button onClick={() => navigate('/admin/applications')} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {appStats?.applicationsToday && appStats.applicationsToday > 0 && (
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-emerald-100 text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{appStats.applicationsToday} new application{appStats.applicationsToday > 1 ? 's' : ''} today</p>
                    <p className="text-xs text-slate-400 mt-0.5">Awaiting review</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">Today</span>
                </div>
              )}
              {interviewStats?.todayInterviews?.slice(0, 4).map(i => (
                <div key={i.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/interviews/${i.id}`)}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-violet-100 text-violet-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{i.candidateName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{i.round} · {i.startTime} - {i.endTime}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{i.date}</span>
                </div>
              ))}
              {(!appStats?.applicationsToday && (!interviewStats?.todayInterviews || interviewStats.todayInterviews.length === 0)) && (
                <div className="px-4 py-6 text-center text-xs text-slate-400">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Tasks */}
          <div className="bg-white border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center bg-amber-100 text-amber-600">
                  <ListChecks className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Recruiter Tasks</h3>
              </div>
              <span className="text-[10px] text-slate-400">{tasks.filter(t => !t.done).length} open</span>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center border ${task.done ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {task.done && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs ${task.done ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>{task.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {task.priority === 'high' && <span className="text-[9px] font-medium text-red-500 uppercase">High</span>}
                    {task.due && <span className="text-[10px] text-slate-400">{task.due}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">This Week</h3>
              </div>
            </div>
            <CalendarStrip events={calendarEvents} />
          </div>

          {/* AI Insights */}
          <div className="bg-white border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-purple-100 text-purple-600">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">AI Insights</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {insights.map((insight, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center mt-0.5 ${
                      insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      insight.type === 'opportunity' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {insight.type === 'warning' ? <AlertCircle className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{insight.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{insight.desc}</p>
                      {insight.link && (
                        <button onClick={() => navigate(insight.link!)} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium mt-1 flex items-center gap-0.5">
                          View <ChevronRight className="h-2.5 w-2.5" />
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
