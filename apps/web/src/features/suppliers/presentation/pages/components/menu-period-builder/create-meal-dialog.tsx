import { MealType } from '@food-up/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateMealDialogProps {
  supplierId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateMealDialog({
  supplierId,
  open,
  onOpenChange,
  onSuccess,
}: CreateMealDialogProps) {
  const { t } = useTranslation('suppliers');
  const { t: tEmp } = useTranslation('employees');
  const { mealService } = useServices();
  const queryClient = useQueryClient();

  const createMealSchema = z.object({
    name: z.string().min(1, t('menuPeriodBuilder.createMeal.nameRequired')),
    type: z.nativeEnum(MealType),
    description: z.string().optional(),
    price: z.string().optional(),
  });
  type FormValues = z.infer<typeof createMealSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(createMealSchema),
    defaultValues: { name: '', type: MealType.Lunch, description: '', price: '' },
  });

  const createMeal = useMutation({
    mutationFn: mealService.create.bind(mealService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', 'supplier', supplierId] });
    },
  });

  function handleSubmit(values: FormValues) {
    createMeal.mutate(
      {
        name: values.name,
        type: values.type,
        description: values.description || undefined,
        price: values.price ? Number(values.price) : undefined,
        supplierId,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSuccess();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('menuPeriodBuilder.createMeal.title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='grid grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('menuPeriodBuilder.createMeal.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('menuPeriodBuilder.createMeal.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('menuPeriodBuilder.createMeal.typeLabel')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(v: string) => tEmp(`mealTypes.${v as MealType}`)}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MealType).map((mealType) => (
                        <SelectItem key={mealType} value={mealType} label={tEmp(`mealTypes.${mealType}`)}>
                          {tEmp(`mealTypes.${mealType}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>{t('menuPeriodBuilder.createMeal.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('menuPeriodBuilder.createMeal.descriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('menuPeriodBuilder.createMeal.priceLabel')}</FormLabel>
                  <FormControl>
                    <Input type='number' step='0.01' min='0' placeholder='0.00' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='col-span-2 flex items-center justify-end gap-2 pt-1'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                {t('actions.cancel', { ns: 'common' })}
              </Button>
              <Button type='submit' disabled={createMeal.isPending}>
                {createMeal.isPending ? t('actions.creating', { ns: 'common' }) : t('menuPeriodBuilder.createMeal.submit')}
              </Button>
            </div>
            {createMeal.isError && (
              <p className='col-span-2 text-xs text-destructive'>
                {t('menuPeriodBuilder.createMeal.error')}
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
