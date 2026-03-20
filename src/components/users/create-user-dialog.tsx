import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';
import { useCreateUser } from '@/hooks/use-create-user';
import { UserRole } from '@/types';
import type { CreateUserRequest } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const { t } = useTranslation('users');
  const { create, isLoading } = useCreateUser();
  const [apiError, setApiError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.nameRequired')).min(2, t('validation.nameMin')),
        email: z.string().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
        password: z.string().min(1, t('validation.passwordRequired')).min(8, t('validation.passwordMin')),
        role: z.enum([UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER], {
          error: t('validation.roleRequired'),
        }),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: CreateUserRequest) => {
    setApiError(null);
    try {
      await create(data);
      toast.success(t('createDialog.success'));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setApiError(t('createDialog.duplicateEmail'));
      } else if (axios.isAxiosError(err)) {
        setApiError(err.response?.data?.message || 'Failed to create user');
      } else {
        setApiError('An unexpected error occurred');
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setApiError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertDescription className="text-[13px]">{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="create-name" className="text-[13px] font-medium">
              {t('createDialog.name')}
            </Label>
            <Input
              id="create-name"
              placeholder={t('createDialog.namePlaceholder')}
              aria-invalid={errors.name ? 'true' : undefined}
              className="h-10 text-sm"
              {...register('name')}
            />
            {errors.name && (
              <p role="alert" className="text-[13px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-email" className="text-[13px] font-medium">
              {t('createDialog.email')}
            </Label>
            <Input
              id="create-email"
              type="email"
              placeholder={t('createDialog.emailPlaceholder')}
              aria-invalid={errors.email ? 'true' : undefined}
              className="h-10 text-sm"
              {...register('email')}
            />
            {errors.email && (
              <p role="alert" className="text-[13px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-password" className="text-[13px] font-medium">
              {t('createDialog.password')}
            </Label>
            <Input
              id="create-password"
              type="password"
              placeholder={t('createDialog.passwordPlaceholder')}
              aria-invalid={errors.password ? 'true' : undefined}
              className="h-10 text-sm"
              {...register('password')}
            />
            {errors.password && (
              <p role="alert" className="text-[13px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-role" className="text-[13px] font-medium">
              {t('createDialog.role')}
            </Label>
            <Select onValueChange={(value: string) => setValue('role', value as CreateUserRequest['role'])}>
              <SelectTrigger id="create-role" aria-invalid={errors.role ? 'true' : undefined}>
                <SelectValue placeholder={t('createDialog.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.OPERATOR}>Operator</SelectItem>
                <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p role="alert" className="text-[13px] text-destructive">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('createDialog.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('createDialog.creating')}
                </>
              ) : (
                t('createDialog.create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
