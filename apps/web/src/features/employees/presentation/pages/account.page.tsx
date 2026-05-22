import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePreferencesStore } from '@/features/user-preferences/presentation/state/preferences.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { Language, ThemePreference } from '@food-up/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useCurrentEmployee } from '../../application/use-current-employee.hook';

// Extension point: when Google OAuth or other SSO is added, derive capabilities
// from the identity provider returned by the API (e.g. canChangePassword = provider === 'local').
type AccountCapabilities = {
  canChangeName: boolean;
  canChangePassword: boolean;
};

const CAPABILITIES: AccountCapabilities = {
  canChangeName: true,
  canChangePassword: true,
};

type NameFormValues = { name: string };
type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function ProfileSection() {
  const { t } = useTranslation('preferences');
  const { employeeService } = useServices();
  const queryClient = useQueryClient();
  const { data: employee } = useCurrentEmployee();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const nameSchema = z.object({
    name: z.string().min(1, t('profile.nameLabel') + ' is required'),
  });

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    values: { name: employee?.name ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data: NameFormValues) => employeeService.updateSelf(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'me'] });
      setFeedback({ type: 'success', message: t('profile.success') });
    },
    onError: () => {
      setFeedback({
        type: 'error',
        message: t('profile.error'),
      });
    },
  });

  function onSubmit(values: NameFormValues) {
    setFeedback(null);
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader className='px-6 pt-5 pb-0'>
        <CardTitle className='text-base'>{t('profile.title')}</CardTitle>
      </CardHeader>
      <Separator className='mt-4' />
      <CardContent className='px-6 pt-4 pb-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('profile.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {feedback && (
              <p
                className={
                  feedback.type === 'success'
                    ? 'text-sm text-success'
                    : 'text-sm text-destructive'
                }
              >
                {feedback.message}
              </p>
            )}
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending
                ? t('actions.saving', { ns: 'common' })
                : t('actions.save', { ns: 'common' })}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  const { t } = useTranslation('preferences');
  const { authService } = useServices();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const passwordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(6, t('security.passwordMinLength')),
      newPassword: z.string().min(6, t('security.passwordMinLength')),
      confirmPassword: z
        .string()
        .min(6, t('security.passwordMinLength')),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t('security.passwordMismatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      form.reset();
      setFeedback({
        type: 'success',
        message: t('security.success'),
      });
    },
    onError: (error: unknown) => {
      const isWrongPassword =
        error instanceof Response
          ? error.status === 401
          : (error as { status?: number })?.status === 401;
      setFeedback({
        type: 'error',
        message: isWrongPassword
          ? t('security.wrongPassword')
          : t('security.error'),
      });
    },
  });

  function onSubmit(values: PasswordFormValues) {
    setFeedback(null);
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader className='px-6 pt-5 pb-0'>
        <CardTitle className='text-base'>{t('security.title')}</CardTitle>
      </CardHeader>
      <Separator className='mt-4' />
      <CardContent className='px-6 pt-4 pb-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('security.currentPassword')}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('security.newPassword')}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('security.confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {feedback && (
              <p
                className={
                  feedback.type === 'success'
                    ? 'text-sm text-success'
                    : 'text-sm text-destructive'
                }
              >
                {feedback.message}
              </p>
            )}
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending
                ? t('security.submitting')
                : t('security.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AppearanceSection() {
  const { t } = useTranslation('preferences');
  const { preferencesService } = useServices();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
    { value: ThemePreference.Light, label: t('appearance.theme.light') },
    { value: ThemePreference.Dark, label: t('appearance.theme.dark') },
    { value: ThemePreference.System, label: t('appearance.theme.system') },
  ];

  const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: Language.En, label: 'English' },
    { value: Language.Sr, label: 'Srpski' },
  ];

  const themeMutation = useMutation<
    void,
    Error,
    ThemePreference,
    { previousTheme: ThemePreference }
  >({
    mutationFn: (newTheme: ThemePreference) =>
      preferencesService.update({ theme: newTheme }),
    onMutate: (newTheme) => {
      const previousTheme = theme;
      setTheme(newTheme);
      return { previousTheme };
    },
    onSuccess: () => {
      setFeedback({
        type: 'success',
        message: t('appearance.success'),
      });
    },
    onError: (_err, _newTheme, context) => {
      if (context) setTheme(context.previousTheme);
      setFeedback({
        type: 'error',
        message: t('appearance.error'),
      });
    },
  });

  const languageMutation = useMutation<
    void,
    Error,
    Language,
    { previousLanguage: Language }
  >({
    mutationFn: (newLanguage: Language) =>
      preferencesService.update({ language: newLanguage }),
    onMutate: (newLanguage) => {
      const previousLanguage = language;
      setLanguage(newLanguage);
      return { previousLanguage };
    },
    onSuccess: () => {
      setFeedback({
        type: 'success',
        message: t('appearance.success'),
      });
    },
    onError: (_err, _newLanguage, context) => {
      if (context) setLanguage(context.previousLanguage);
      setFeedback({
        type: 'error',
        message: t('appearance.error'),
      });
    },
  });

  return (
    <Card>
      <CardHeader className='px-6 pt-5 pb-0'>
        <CardTitle className='text-base'>{t('appearance.title')}</CardTitle>
      </CardHeader>
      <Separator className='mt-4' />
      <CardContent className='px-6 pt-4 pb-5'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>{t('appearance.theme.label')}</Label>
            <Select
              value={theme}
              onValueChange={(v) => {
                setFeedback(null);
                themeMutation.mutate(v as ThemePreference);
              }}
              disabled={themeMutation.isPending}
            >
              <SelectTrigger className='w-full'>
                <SelectValue>
                  {(v: string) =>
                    THEME_OPTIONS.find((o) => o.value === v)?.label ?? v
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>{t('appearance.language.label')}</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                setFeedback(null);
                languageMutation.mutate(v as Language);
              }}
              disabled={languageMutation.isPending}
            >
              <SelectTrigger className='w-full'>
                <SelectValue>
                  {(v: string) =>
                    LANGUAGE_OPTIONS.find((o) => o.value === v)?.label ?? v
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {feedback && (
            <p
              className={
                feedback.type === 'success'
                  ? 'text-sm text-success'
                  : 'text-sm text-destructive'
              }
            >
              {feedback.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const { t } = useTranslation('preferences');

  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold'>{t('title')}</h1>
        <p className='text-sm text-muted-foreground mt-1'>{t('subtitle')}</p>
      </div>
      {CAPABILITIES.canChangeName && <ProfileSection />}
      {CAPABILITIES.canChangePassword && <SecuritySection />}
      <AppearanceSection />
    </div>
  );
}
