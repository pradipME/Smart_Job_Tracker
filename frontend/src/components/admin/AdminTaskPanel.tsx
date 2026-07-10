import { CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string | number;
  title: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  due?: string;
}

interface AdminTaskPanelProps {
  tasks: Task[];
  title?: string;
  className?: string;
  onToggle?: (id: string | number) => void;
}

const priorityColors: Record<string, string> = {
  high: 'text-red-500 bg-red-50',
  medium: 'text-amber-500 bg-amber-50',
  low: 'text-blue-500 bg-blue-50',
};

export function AdminTaskPanel({ tasks, title = 'Tasks', className = '', onToggle }: AdminTaskPanelProps) {
  const incomplete = tasks.filter((t) => !t.completed).length;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-400">{incomplete} remaining</span>
      </div>
      <div className="p-2 space-y-0.5">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No tasks</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => onToggle?.(task.id)}
            >
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0" />
              )}
              <span className={`text-sm flex-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </span>
              {task.priority && !task.completed && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              )}
              {task.due && !task.completed && (
                <span className="text-[11px] text-slate-400">{task.due}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
