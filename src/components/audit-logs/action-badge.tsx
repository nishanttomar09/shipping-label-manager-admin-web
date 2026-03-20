import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const actionStyles: Record<string, { className: string; dot: string }> = {
  POST: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  PATCH: {
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  PUT: {
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  DELETE: {
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
  },
  GET: {
    className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800',
    dot: 'bg-slate-500',
  },
};

export function ActionBadge({ action }: { action: string }) {
  const config = actionStyles[action] || actionStyles.GET;

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {action}
    </Badge>
  );
}
