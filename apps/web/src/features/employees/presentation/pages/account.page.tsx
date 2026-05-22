import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: ThemePreference.Light, label: 'Light' },
  { value: ThemePreference.Dark, label: 'Dark' },
  { value: ThemePreference.System, label: 'System' },
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];

function AppearanceSection() {
  const { preferencesService } = useServices();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
      setFeedback({ type: 'success', message: 'Appearance updated successfully.' });
    },
    onError: (_err, _newTheme, context) => {
      if (context) setTheme(context.previousTheme);
      setFeedback({
        type: 'error',
        message: 'Failed to update appearance. Please try again.',
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
      setFeedback({ type: 'success', message: 'Appearance updated successfully.' });
    },
    onError: (_err, _newLanguage, context) => {
      if (context) setLanguage(context.previousLanguage);
      setFeedback({
        type: 'error',
        message: 'Failed to update appearance. Please try again.',
      });
    },
  });

  return (
    <Card>
      <CardHeader className='px-6 pt-5 pb-0'>
        <CardTitle className='text-base'>Appearance</CardTitle>
      </CardHeader>
      <Separator className='mt-4' />
      <CardContent className='px-6 pt-4 pb-5'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Theme</Label>
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
                  <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Language</Label>
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
                  <SelectItem key={opt.value} value={opt.value} label={opt.label}>
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
  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold'>Account settings</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage your profile and appearance preferences.
        </p>
      </div>
      <AppearanceSection />
    </div>
  );
}
