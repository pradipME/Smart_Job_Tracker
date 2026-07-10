import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useState } from 'react';

interface CalendarEvent {
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  color?: string;
}

interface AdminCalendarWidgetProps {
  events: CalendarEvent[];
  title?: string;
  className?: string;
}

function getWeekRange(date: Date) {
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

export function AdminCalendarWidget({ events, title = 'Upcoming', className = '' }: AdminCalendarWidgetProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekRange(new Date()).start);

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
  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-slate-100">
        {weekDays.map((day) => {
          const key = formatDateKey(day);
          const dayEvents = eventMap[key] || [];
          const isToday = key === todayKey;
          return (
            <div key={key} className={`min-h-[100px] p-1.5 ${isToday ? 'bg-blue-50/50' : ''}`}>
              <div className={`text-center text-[11px] font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                <div className={`mt-0.5 h-5 w-5 mx-auto rounded-full flex items-center justify-center text-xs ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((ev, i) => (
                  <div
                    key={i}
                    onClick={ev.onClick}
                    className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${ev.color || 'bg-blue-100 text-blue-700'}`}
                  >
                    {ev.time && <span className="font-medium">{ev.time} </span>}
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-slate-400 text-center">+{dayEvents.length - 2}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
