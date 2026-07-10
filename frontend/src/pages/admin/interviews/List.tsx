import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminInterviews, useInterviewsByDateRange, useInterviewDashboardStats } from '../../../hooks/useAdminInterviews';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  Plus, CalendarDays, List as ListIcon, ChevronLeft, ChevronRight,
  Video, MapPin, Phone, Clock, Users, Search,
} from 'lucide-react';

type ViewMode = 'calendar' | 'agenda';

const MODE_ICONS: Record<string, typeof Video> = { ONLINE: Video, OFFLINE: MapPin, PHONE: Phone };

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  NO_SHOW: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function AdminInterviewList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [page, setPage] = useState(0);
  const [weekStart, setWeekStart] = useState(() => getWeekRange(new Date()).start);

  const weekRange = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return { start: formatDateKey(weekStart), end: formatDateKey(end) };
  }, [weekStart]);

  const { data: pageData, isLoading } = useAdminInterviews(
    viewMode === 'agenda' ? { search, status: statusFilter, page, size: 10 } : undefined
  );
  const { data: calendarData } = useInterviewsByDateRange(
    viewMode === 'calendar' ? weekRange.start : null,
    viewMode === 'calendar' ? weekRange.end : null
  );
  const { data: stats } = useInterviewDashboardStats();

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const todayKey = formatDateKey(new Date());

  const kpiItems = stats ? [
    { label: 'Today', value: stats.todayCount },
    { label: 'Upcoming', value: stats.upcomingCount },
    { label: 'Completed', value: stats.completedCount },
    { label: 'Cancelled', value: stats.cancelledCount },
    { label: 'No Show', value: stats.noShowCount },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Interviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedule and manage candidate interviews</p>
        </div>
        <Button onClick={() => navigate('/admin/interviews/new')}>
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {kpiItems.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {kpiItems.map(k => (
            <div key={k.label} className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-3.5">
              <p className="text-xs font-medium text-slate-500">{k.label}</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight mt-1">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-lg">
          <button onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'agenda' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ListIcon className="h-3.5 w-3.5" /> List
          </button>
          <button onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </button>
        </div>

        {viewMode === 'agenda' && (
          <>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input type="text" placeholder="Search by candidate, job, interviewer..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">All statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </>
        )}
      </div>

      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="text-xs font-semibold text-slate-900">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-7 divide-x divide-slate-200">
            {weekDays.map((day) => {
              const key = formatDateKey(day);
              const dayInterviews = calendarData?.filter(i => i.date === key) || [];
              const isToday = key === todayKey;
              return (
                <div key={key} className={`min-h-[120px] p-1.5 ${isToday ? 'bg-blue-50/50' : ''}`}>
                  <div className={`text-center text-[10px] font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    <div className={`mt-0.5 h-5 w-5 mx-auto flex items-center justify-center text-[10px] rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {dayInterviews.slice(0, 3).map(i => (
                      <button key={i.id} onClick={() => navigate(`/admin/interviews/${i.id}`)}
                        className="w-full text-left text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate hover:bg-blue-100 transition-colors">
                        {i.startTime} - {i.candidateName}
                      </button>
                    ))}
                    {dayInterviews.length > 3 && (
                      <p className="text-[9px] text-slate-400 text-center">+{dayInterviews.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'agenda' && (
        <>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : !pageData || pageData.content.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] py-16 text-center">
              <CalendarDays className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600 mt-3">No interviews found</p>
              <p className="text-xs text-slate-400 mt-1">{search || statusFilter ? 'Try a different search' : 'Schedule your first interview to get started'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden divide-y divide-slate-100">
              {pageData.content.map(i => {
                const ModeIcon = MODE_ICONS[i.mode] || Video;
                return (
                  <div key={i.id} onClick={() => navigate(`/admin/interviews/${i.id}`)}
                    className="px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-semibold text-slate-900">{i.candidateName}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${STATUS_BADGE[i.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {i.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{i.jobTitle} &middot; {i.companyName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{i.date} {i.startTime}-{i.endTime}</span>
                          <span className="flex items-center gap-1"><ModeIcon className="h-3 w-3" />{i.mode}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{i.interviewerName}</span>
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-600 font-medium text-[10px]">{i.round}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pageData && pageData.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] text-xs">
              <span className="text-slate-500">Page {page + 1} of {pageData.totalPages}</span>
              <div className="flex gap-0.5">
                <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button size="sm" variant="secondary" disabled={page >= pageData.totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
