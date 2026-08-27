import { DietaryTag } from '@food-up/shared';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const TAG_CLASSES: Record<DietaryTag, string> = {
  [DietaryTag.Vegetarian]: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  [DietaryTag.Vegan]: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  [DietaryTag.Lenten]: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  [DietaryTag.Chrono]: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
  [DietaryTag.GlutenFree]: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  [DietaryTag.DairyFree]: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
  [DietaryTag.Halal]: 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100',
};

interface DietaryTagBadgeProps {
  tag: DietaryTag;
}

export function DietaryTagBadge({ tag }: DietaryTagBadgeProps) {
  const { t } = useTranslation('meals');
  return (
    <Badge variant='outline' className={`text-xs font-normal ${TAG_CLASSES[tag]}`}>
      {t(`dietaryTags.${tag}`)}
    </Badge>
  );
}
