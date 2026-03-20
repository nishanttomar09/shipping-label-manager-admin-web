import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

export function StatusBadge({ statusCode }: { statusCode: number }) {
  const isSuccess = statusCode >= 200 && statusCode < 400;

  return (
    <Badge
      variant="outline"
      className={
        isSuccess
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }
    >
      {isSuccess ? (
        <CheckCircle className="mr-1 h-3 w-3" />
      ) : (
        <XCircle className="mr-1 h-3 w-3" />
      )}
      {statusCode}
    </Badge>
  );
}
