import { DietaryTag } from '@food-up/shared';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const DOT_CLASSES: Record<DietaryTag, string> = {
  [DietaryTag.Vegetarian]: 'bg-green-500',
  [DietaryTag.Vegan]: 'bg-emerald-700',
  [DietaryTag.Lenten]: 'bg-sky-400',
  [DietaryTag.Chrono]: 'bg-orange-400',
  [DietaryTag.GlutenFree]: 'bg-amber-500',
  [DietaryTag.DairyFree]: 'bg-violet-400',
  [DietaryTag.Halal]: 'bg-teal-500',
};

interface DietaryTagBadgeProps {
  tag: DietaryTag;
}

export function DietaryTagBadge({ tag }: DietaryTagBadgeProps) {
  const { t } = useTranslation('meals');
  return (
    <Badge variant='secondary' className='font-normal gap-1.5'>
      <span className={`size-1.5 rounded-full shrink-0 ${DOT_CLASSES[tag]}`} />
      {t(`dietaryTags.${tag}`)}
    </Badge>
  );
}
