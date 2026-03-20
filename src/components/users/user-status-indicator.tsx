import { useTranslation } from 'react-i18next';

export function UserStatusIndicator({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          isActive ? 'bg-green-500' : 'bg-red-500'
        }`}
        aria-hidden="true"
      />
      <span className={isActive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
        {isActive ? t('status.active') : t('status.inactive')}
      </span>
    </div>
  );
}
