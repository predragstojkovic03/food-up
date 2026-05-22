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
import { useServices } from '@/shared/infrastructure/di/service.context';
import { Language } from '@food-up/shared';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];

export default function BusinessSettingsPage() {
  const { businessService } = useServices();
  const [language, setLanguage] = useState<Language>(Language.En);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const mutation = useMutation<void, Error, Language, { previousLanguage: Language }>({
    mutationFn: (newLanguage) =>
      businessService.updateLanguage({ language: newLanguage }),
    onMutate: (newLanguage) => {
      const previousLanguage = language;
      setLanguage(newLanguage);
      return { previousLanguage };
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Business settings updated.' });
    },
    onError: (_err, _lang, context) => {
      if (context) setLanguage(context.previousLanguage);
      setFeedback({ type: 'error', message: 'Failed to update. Please try again.' });
    },
  });

  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold'>Business Settings</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Configure settings that apply to your entire business.
        </p>
      </div>

      <Card>
        <CardHeader className='px-6 pt-5 pb-0'>
          <CardTitle className='text-base'>Communication Language</CardTitle>
        </CardHeader>
        <Separator className='mt-4' />
        <CardContent className='px-6 pt-4 pb-5 space-y-4'>
          <div className='space-y-2'>
            <Label>Language for Excel exports</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                setFeedback(null);
                mutation.mutate(v as Language);
              }}
              disabled={mutation.isPending}
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
            <p className='text-xs text-muted-foreground'>
              Column headers and labels in Excel exports use this language.
            </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
