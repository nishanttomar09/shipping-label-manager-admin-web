import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  ShieldCheck,
  ArrowRight,
  Users,
  FileText,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import axios from 'axios';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t } = useTranslation('login');
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
        password: z.string().min(8, t('validation.passwordMin')),
      }),
    [t]
  );

  useEffect(() => {
    document.title = t('pageTitle');
    setMounted(true);
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/users', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate('/users', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setApiError(t('errors.accountDeactivated'));
        } else {
          const message =
            err.response?.data?.message || t('errors.invalidCredentials');
          setApiError(message);
        }
      } else {
        setApiError(t('errors.generic'));
      }
    }
  };

  const features = [
    {
      icon: Users,
      title: t('features.userManagement.title'),
      desc: t('features.userManagement.description'),
    },
    {
      icon: FileText,
      title: t('features.auditLogs.title'),
      desc: t('features.auditLogs.description'),
    },
    {
      icon: Lock,
      title: t('features.accessControl.title'),
      desc: t('features.accessControl.description'),
    },
  ];

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-primary" />

        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="diag"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>

        <div
          className={`absolute -bottom-20 -right-20 transition-all duration-1000 ease-out ${
            mounted ? 'opacity-[0.04] scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <ShieldCheck className="h-[480px] w-[480px] text-white" strokeWidth={0.5} />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div
            className={`flex items-center gap-3 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-primary-foreground">
              {t('appName', { ns: 'common' })}
            </span>
          </div>

          <div
            className={`max-w-lg transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-primary-foreground whitespace-pre-line">
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-primary-foreground/65 font-medium">
              {t('hero.description')}
            </p>

            <div className="mt-12 space-y-5">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`flex items-start gap-4 transition-all duration-500 ease-out ${
                    mounted
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${350 + i * 100}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/12 text-primary-foreground/80">
                    <f.icon className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground/90">
                      {f.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-primary-foreground/50">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p
            className={`text-[13px] text-primary-foreground/30 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col bg-background">
        <header className="flex items-center justify-between p-5 lg:p-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t('appName', { ns: 'common' })}
            </span>
          </div>
          <div className="lg:ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div
            className={`w-full max-w-[380px] transition-all duration-600 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                {t('form.heading')}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('form.subheading')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {apiError && (
                <Alert
                  variant="destructive"
                  className="animate-in fade-in slide-in-from-top-1 duration-300"
                >
                  <AlertDescription className="text-[13px]">
                    {apiError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px] font-medium">
                  {t('form.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('form.emailPlaceholder')}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={errors.email ? 'true' : undefined}
                  className="h-10 px-3 text-sm"
                  {...register('email')}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-[13px] text-destructive"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[13px] font-medium">
                  {t('form.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('form.passwordPlaceholder')}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                    aria-invalid={errors.password ? 'true' : undefined}
                    className="h-10 px-3 pr-10 text-sm"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('form.hidePassword') : t('form.showPassword')}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-[13px] text-destructive"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="mt-1 h-10 w-full text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('form.signingIn')}
                  </>
                ) : (
                  <>
                    {t('form.signIn')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 flex items-center gap-2.5 justify-center text-muted-foreground/50">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <p className="text-xs">
                {t('security')}
              </p>
            </div>

            <div className="mt-10 space-y-3 lg:hidden">
              <div className="h-px bg-border" />
              <div className="grid grid-cols-3 gap-3 pt-2">
                {features.map((f) => (
                  <div key={f.title} className="text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                      {f.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
