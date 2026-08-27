import { DietaryTag } from '@food-up/shared';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface DietaryTagsSelectProps {
  value: DietaryTag[];
  onChange: (tags: DietaryTag[]) => void;
}

export function DietaryTagsSelect({ value, onChange }: DietaryTagsSelectProps) {
  const { t } = useTranslation('meals');

  function toggle(tag: DietaryTag) {
    if (value.includes(tag)) {
      onChange(value.filter((v) => v !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  return (
    <div className='flex flex-wrap gap-1.5'>
      {Object.values(DietaryTag).map((tag) => (
        <Button
          key={tag}
          type='button'
          size='sm'
          variant={value.includes(tag) ? 'default' : 'outline'}
          onClick={() => toggle(tag)}
          className='h-7 text-xs'
        >
          {t(`dietaryTags.${tag}`)}
        </Button>
      ))}
    </div>
  );
}
