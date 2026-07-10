interface PipelineStage {
  label: string;
  count: number;
  color: string;
}

interface AdminPipelineWidgetProps {
  stages: PipelineStage[];
  total: number;
  title?: string;
  className?: string;
}

export function AdminPipelineWidget({ stages, total, title = 'Hiring Pipeline', className = '' }: AdminPipelineWidgetProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {stages.map((stage) => {
          const pct = total > 0 ? (stage.count / total) * 100 : 0;
          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{stage.label}</span>
                <span className="text-slate-500">{stage.count}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
