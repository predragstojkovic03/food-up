import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { IUpdateBusinessSettings, Language } from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];

export default function BusinessSettingsPage() {
  const { t } = useTranslation('business');
  const { businessService } = useServices();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{
    setting: keyof IUpdateBusinessSettings;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: myBusiness } = useQuery({
    queryKey: ['businesses', 'my'],
    queryFn: () => businessService.getMy(),
  });

  const mutation = useMutation<void, Error, IUpdateBusinessSettings>({
    mutationFn: (settings) => businessService.updateSettings(settings),
    onSuccess: (_, settings) => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'my'] });
      setFeedback({ setting: settingKey(settings), type: 'success', message: t('settings.feedback.success') });
    },
    onError: (_, settings) => {
      setFeedback({ setting: settingKey(settings), type: 'error', message: t('settings.feedback.error') });
    },
  });

  function updateSetting(settings: IUpdateBusinessSettings) {
    setFeedback(null);
    mutation.mutate(settings);
  }

  const language =
    (mutation.isPending ? mutation.variables?.language : undefined) ??
    myBusiness?.language ??
    Language.En;
  const includeEmployeesWithoutSelection =
    (mutation.isPending ? mutation.variables?.reportIncludeEmployeesWithoutSelection : undefined) ??
    myBusiness?.reportIncludeEmployeesWithoutSelection ??
    false;

  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold'>{t('settings.title')}</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          {t('settings.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader className='px-6 pt-5 pb-0'>
          <CardTitle className='text-base'>{t('settings.communicationLanguage.cardTitle')}</CardTitle>
        </CardHeader>
        <Separator className='mt-4' />
        <CardContent className='px-6 pt-4 pb-5 space-y-4'>
          <div className='space-y-2'>
            <Label>{t('settings.communicationLanguage.label')}</Label>
            <Select
              value={language}
              onValueChange={(v) => updateSetting({ language: v as Language })}
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
              {t('settings.communicationLanguage.hint')}
            </p>
          </div>
          <SettingFeedback feedback={feedback?.setting === 'language' ? feedback : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='px-6 pt-5 pb-0'>
          <CardTitle className='text-base'>{t('settings.excelReport.cardTitle')}</CardTitle>
        </CardHeader>
        <Separator className='mt-4' />
        <CardContent className='px-6 pt-4 pb-5 space-y-4'>
          <div className='flex items-start gap-3'>
            <Checkbox
              id='report-include-employees-without-selection'
              checked={includeEmployeesWithoutSelection}
              onCheckedChange={(checked) =>
                updateSetting({ reportIncludeEmployeesWithoutSelection: checked === true })
              }
              disabled={mutation.isPending}
              className='mt-0.5'
            />
            <div>
              <Label
                htmlFor='report-include-employees-without-selection'
                className='font-normal cursor-pointer'
              >
                {t('settings.excelReport.includeEmployeesWithoutSelectionLabel')}
              </Label>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t('settings.excelReport.includeEmployeesWithoutSelectionHint')}
              </p>
            </div>
          </div>
          <SettingFeedback
            feedback={feedback?.setting === 'reportIncludeEmployeesWithoutSelection' ? feedback : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function settingKey(settings: IUpdateBusinessSettings): keyof IUpdateBusinessSettings {
  return settings.language !== undefined ? 'language' : 'reportIncludeEmployeesWithoutSelection';
}

interface SettingFeedbackProps {
  feedback: { type: 'success' | 'error'; message: string } | null;
}

function SettingFeedback({ feedback }: SettingFeedbackProps) {
  if (!feedback) return null;
  return (
    <p className={feedback.type === 'success' ? 'text-sm text-success' : 'text-sm text-destructive'}>
      {feedback.message}
    </p>
  );
}
