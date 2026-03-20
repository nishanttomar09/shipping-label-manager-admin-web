import { Badge } from '@/components/ui/badge';

const actionColors: Record<string, string> = {
  POST: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  PATCH: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  GET: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

export function ActionBadge({ action }: { action: string }) {
  const colorClass = actionColors[action] || actionColors.GET;

  return (
    <Badge variant="outline" className={colorClass}>
      {action}
    </Badge>
  );
}
