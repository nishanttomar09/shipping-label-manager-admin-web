import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const statusStyles = {
  active: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  inactive: {
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

export function UserStatusIndicator({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();
  const config = isActive ? statusStyles.active : statusStyles.inactive;

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {isActive ? t('status.active') : t('status.inactive')}
    </Badge>
  );
}
