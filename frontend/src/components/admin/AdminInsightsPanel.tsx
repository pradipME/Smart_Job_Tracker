import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Insight {
  id: string | number;
  title: string;
  description: string;
  type?: 'opportunity' | 'warning' | 'info';
  linkTo?: string;
}

interface AdminInsightsPanelProps {
  insights: Insight[];
  title?: string;
  className?: string;
  emptyMessage?: string;
}

const typeStyles: Record<string, string> = {
  opportunity: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

export function AdminInsightsPanel({ insights, title = 'AI Insights', className = '', emptyMessage = 'No insights available' }: AdminInsightsPanelProps) {
  const navigate = useNavigate();

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">{emptyMessage}</p>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg border p-3 ${typeStyles[insight.type || 'info'] || typeStyles.info}`}
            >
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="text-xs mt-0.5 opacity-80">{insight.description}</p>
              {insight.linkTo && (
                <button
                  onClick={() => navigate(insight.linkTo!)}
                  className="mt-1.5 flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  View details <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
