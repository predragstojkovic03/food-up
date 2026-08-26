import { MealType } from '@food-up/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/shared/infrastructure/di/service.context';
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

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Bread]: 'Bread',
  [MealType.Lunch]: 'Lunch',
  [MealType.Dinner]: 'Dinner',
  [MealType.Soup]: 'Soup',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

const createMealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(MealType),
  description: z.string().optional(),
  price: z.string().optional(),
});
type FormValues = z.infer<typeof createMealSchema>;

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
  const { mealService } = useServices();
  const queryClient = useQueryClient();

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
          <DialogTitle>Add Meal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='grid grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Chicken Soup' {...field} />
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
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(v: string) => MEAL_TYPE_LABELS[v as MealType] ?? v}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MealType).map((type) => (
                        <SelectItem key={type} value={type} label={MEAL_TYPE_LABELS[type]}>
                          {MEAL_TYPE_LABELS[type]}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Optional description' {...field} />
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
                  <FormLabel>Price</FormLabel>
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
                Cancel
              </Button>
              <Button type='submit' disabled={createMeal.isPending}>
                {createMeal.isPending ? 'Creating…' : 'Create Meal'}
              </Button>
            </div>
            {createMeal.isError && (
              <p className='col-span-2 text-xs text-destructive'>
                Failed to create meal. Please try again.
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
