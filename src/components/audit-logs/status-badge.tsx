import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  success: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  failure: {
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

export function StatusBadge({ success, statusCode }: { success: boolean; statusCode: number }) {
  const config = success ? statusStyles.success : statusStyles.failure;

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {statusCode}
    </Badge>
  );
}
