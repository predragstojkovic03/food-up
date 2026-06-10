import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  IMealResponse,
  IMenuPeriodResponse,
  MealType,
} from '@food-up/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod/v3';
import { MenuPeriodBuilder } from './components/menu-period-builder/menu-period-builder';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Bread]: 'Bread',
  [MealType.Lunch]: 'Lunch',
  [MealType.Dinner]: 'Dinner',
  [MealType.Soup]: 'Soup',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

export default function InHouseSupplierDetailPage() {
  const { t } = useTranslation('suppliers');
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplierService } = useServices();

  const { data: supplier } = useQuery({
    queryKey: ['suppliers', 'in-house', supplierId],
    queryFn: async () => {
      const all = await supplierService.getManagedByBusiness();
      return all.find((s) => s.id === supplierId) ?? null;
    },
    enabled: !!supplierId,
  });

  return (
    <div className='p-6'>
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => navigate('/employee/manager/suppliers/in-house')}
          className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className='text-2xl font-bold'>{supplier?.name ?? '…'}</h1>
          <p className='text-muted-foreground text-sm'>
            {supplier?.email}
          </p>
        </div>
      </div>

      <Tabs defaultValue='meals'>
        <TabsList className='mb-4'>
          <TabsTrigger value='meals'>{t('detail.mealsTab')}</TabsTrigger>
          <TabsTrigger value='menu-periods'>{t('detail.menuPeriodsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value='meals'>
          {supplierId && <MealsTab supplierId={supplierId} />}
        </TabsContent>

        <TabsContent value='menu-periods'>
          {supplierId && <MenuPeriodsTab supplierId={supplierId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Meals Tab ───────────────────────────────────────────────────────────────

const createMealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.nativeEnum(MealType),
  price: z.string().optional(),
});
type CreateMealFormValues = z.infer<typeof createMealSchema>;

function MealsTab({ supplierId }: { supplierId: string }) {
  const { t } = useTranslation('suppliers');
  const { mealService } = useServices();
  const queryClient = useQueryClient();
  const QUERY_KEY = ['meals', 'supplier', supplierId];

  const { data: meals = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => mealService.getBySupplier(supplierId),
  });

  const createMeal = useMutation({
    mutationFn: mealService.create.bind(mealService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMeal = useMutation({
    mutationFn: (payload: { id: string; name?: string; description?: string; type?: MealType }) => {
      const { id, ...data } = payload;
      return mealService.update(id, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMeal = useMutation({
    mutationFn: (id: string) => mealService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const [showCreate, setShowCreate] = useState(false);

  const createMealForm = useForm<CreateMealFormValues>({
    resolver: zodResolver(createMealSchema),
    defaultValues: { name: '', description: '', type: MealType.Lunch, price: '' },
  });

  function handleCreate(values: CreateMealFormValues) {
    createMeal.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        type: values.type,
        price: values.price ? Number(values.price) : undefined,
        supplierId,
      },
      {
        onSuccess: () => {
          createMealForm.reset();
          setShowCreate(false);
        },
      },
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-muted-foreground'>
          {t('detail.meals.subtitle')}
        </p>
        <Button size='sm' onClick={() => setShowCreate(true)} className='gap-2'>
          <Plus size={14} />
          {t('detail.meals.addButton')}
        </Button>
      </div>

      {showCreate && (
        <div className='mb-4 border rounded-lg p-4 bg-card'>
          <div className='flex items-center justify-between mb-3'>
            <span className='font-medium text-sm'>{t('detail.meals.createForm.title')}</span>
            <button
              onClick={() => setShowCreate(false)}
              className='text-muted-foreground hover:text-foreground'
            >
              <X size={15} />
            </button>
          </div>
          <Form {...createMealForm}>
            <form onSubmit={createMealForm.handleSubmit(handleCreate)} className='grid grid-cols-2 gap-3'>
              <FormField
                control={createMealForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>{t('detail.meals.createForm.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('detail.meals.createForm.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createMealForm.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>{t('detail.meals.createForm.typeLabel')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>{(v: string) => MEAL_TYPE_LABELS[v as MealType] ?? v}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MealType).map((t) => (
                          <SelectItem key={t} value={t} label={MEAL_TYPE_LABELS[t]}>{MEAL_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createMealForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel className='text-xs'>{t('detail.meals.createForm.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('detail.meals.createForm.descriptionPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createMealForm.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>{t('detail.meals.createForm.priceLabel')}</FormLabel>
                    <FormControl>
                      <Input type='number' step='0.01' min='0' placeholder='0.00' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex items-end'>
                <Button type='submit' size='sm' disabled={createMeal.isPending}>
                  {createMeal.isPending ? t('actions.creating', { ns: 'common' }) : t('actions.create', { ns: 'common' })}
                </Button>
              </div>
              {createMeal.isError && (
                <p className='col-span-2 text-xs text-destructive'>{t('detail.meals.createForm.error')}</p>
              )}
            </form>
          </Form>
        </div>
      )}

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[1fr_1fr_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>{t('detail.meals.table.nameHeader')}</span>
          <span>{t('detail.meals.table.descriptionHeader')}</span>
          <span>{t('detail.meals.table.typeHeader')}</span>
          <span />
        </div>
        {isLoading && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className='grid grid-cols-[1fr_1fr_auto_auto] items-center px-4 py-3 border-b gap-3'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-5 w-16 rounded-full' />
                <Skeleton className='h-6 w-12 rounded' />
              </div>
            ))}
          </>
        )}
        {!isLoading && meals.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            {t('detail.meals.table.empty')}
          </div>
        )}
        {meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            isUpdating={
              updateMeal.isPending &&
              updateMeal.variables?.id === meal.id
            }
            isRemoving={
              removeMeal.isPending && removeMeal.variables === meal.id
            }
            onUpdate={(data) => updateMeal.mutate({ id: meal.id, ...data })}
            onRemove={() => removeMeal.mutate(meal.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface MealRowProps {
  meal: IMealResponse;
  isUpdating: boolean;
  isRemoving: boolean;
  onUpdate: (data: { name?: string; description?: string; type?: MealType }) => void;
  onRemove: () => void;
}

function MealRow({ meal, isUpdating, isRemoving, onUpdate, onRemove }: MealRowProps) {
  const { t } = useTranslation('suppliers');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description ?? '');
  const [type, setType] = useState<MealType>(meal.type);

  function handleSave() {
    onUpdate({ name, description: description || undefined, type });
    setEditing(false);
  }

  function handleCancel() {
    setName(meal.name);
    setDescription(meal.description ?? '');
    setType(meal.type);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className='grid grid-cols-[1fr_1fr_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-3'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='h-8 text-sm'
          disabled={isUpdating}
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='h-8 text-sm'
          disabled={isUpdating}
        />
        <Select
          value={type}
          onValueChange={(v) => setType(v as MealType)}
          disabled={isUpdating}
        >
          <SelectTrigger className='h-8 w-28 text-xs'>
            <SelectValue>{(v: string) => MEAL_TYPE_LABELS[v as MealType] ?? v}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(MealType).map((t) => (
              <SelectItem key={t} value={t} label={MEAL_TYPE_LABELS[t]}>
                {MEAL_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='flex gap-1'>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
          >
            <Check size={15} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-[1fr_1fr_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-3'>
      <span className='text-sm font-medium'>{meal.name}</span>
      <span className='text-sm text-muted-foreground truncate'>
        {meal.description ?? <span className='italic'>—</span>}
      </span>
      <span className='text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
        {MEAL_TYPE_LABELS[meal.type]}
      </span>
      <div className='flex gap-1'>
        <button
          onClick={() => setEditing(true)}
          disabled={isRemoving}
          className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
        >
          <Pencil size={15} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isRemoving}
            className='p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30'
          >
            <Trash2 size={15} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('detail.meals.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                <span className='font-medium'>{meal.name}</span>{' '}
                {t('detail.meals.deleteDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>{t('actions.delete', { ns: 'common' })}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Menu Periods Tab ─────────────────────────────────────────────────────────

const createPeriodSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});
type CreatePeriodFormValues = z.infer<typeof createPeriodSchema>;

function MenuPeriodsTab({ supplierId }: { supplierId: string }) {
  const { t } = useTranslation('suppliers');
  const { menuPeriodService, mealService } = useServices();
  const queryClient = useQueryClient();
  const QUERY_KEY = ['menu-periods', 'supplier', supplierId];

  const { data: periods = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => menuPeriodService.getBySupplier(supplierId),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ['meals', 'supplier', supplierId],
    queryFn: () => mealService.getBySupplier(supplierId),
  });

  const createPeriod = useMutation({
    mutationFn: menuPeriodService.create.bind(menuPeriodService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removePeriod = useMutation({
    mutationFn: (id: string) => menuPeriodService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const [showCreate, setShowCreate] = useState(false);

  const createPeriodForm = useForm<CreatePeriodFormValues>({
    resolver: zodResolver(createPeriodSchema),
    defaultValues: { startDate: '', endDate: '' },
  });

  function handleCreate(values: CreatePeriodFormValues) {
    createPeriod.mutate(
      { startDate: values.startDate, endDate: values.endDate, supplierId },
      {
        onSuccess: () => {
          createPeriodForm.reset();
          setShowCreate(false);
        },
      },
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-muted-foreground'>
          {t('detail.menuPeriods.subtitle')}
        </p>
        <Button size='sm' onClick={() => setShowCreate(true)} className='gap-2'>
          <Plus size={14} />
          {t('detail.menuPeriods.newButton')}
        </Button>
      </div>

      {showCreate && (
        <div className='mb-4 border rounded-lg p-4 bg-card'>
          <div className='flex items-center justify-between mb-3'>
            <span className='font-medium text-sm'>{t('detail.menuPeriods.createForm.title')}</span>
            <button
              onClick={() => setShowCreate(false)}
              className='text-muted-foreground hover:text-foreground'
            >
              <X size={15} />
            </button>
          </div>
          <Form {...createPeriodForm}>
            <form onSubmit={createPeriodForm.handleSubmit(handleCreate)} className='flex gap-3 items-end'>
              <FormField
                control={createPeriodForm.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>{t('detail.menuPeriods.createForm.startLabel')}</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder={t('detail.menuPeriods.createForm.startPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createPeriodForm.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>{t('detail.menuPeriods.createForm.endLabel')}</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder={t('detail.menuPeriods.createForm.endPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' size='sm' disabled={createPeriod.isPending || !createPeriodForm.watch('startDate') || !createPeriodForm.watch('endDate')}>
                {createPeriod.isPending ? t('actions.creating', { ns: 'common' }) : t('actions.create', { ns: 'common' })}
              </Button>
            </form>
          </Form>
          {createPeriod.isError && (
            <p className='mt-2 text-xs text-destructive'>
              {t('detail.menuPeriods.createForm.error')}
            </p>
          )}
        </div>
      )}

      <div className='space-y-2'>
        {isLoading && (
          <div className='py-8 text-center text-muted-foreground text-sm'>
            {t('detail.menuPeriods.loading')}
          </div>
        )}
        {!isLoading && periods.length === 0 && (
          <div className='py-8 text-center text-muted-foreground text-sm'>
            {t('detail.menuPeriods.empty')}
          </div>
        )}
        {periods.map((period) => (
          <MenuPeriodRow
            key={period.id}
            period={period}
            meals={meals}
            isRemoving={
              removePeriod.isPending && removePeriod.variables === period.id
            }
            onRemove={() => removePeriod.mutate(period.id)}
            onInvalidate={() =>
              queryClient.invalidateQueries({ queryKey: QUERY_KEY })
            }
          />
        ))}
      </div>
    </div>
  );
}

interface MenuPeriodRowProps {
  period: IMenuPeriodResponse;
  meals: IMealResponse[];
  isRemoving: boolean;
  onRemove: () => void;
  onInvalidate: () => void;
}

function MenuPeriodRow({ period, meals, isRemoving, onRemove, onInvalidate }: MenuPeriodRowProps) {
  const { t } = useTranslation('suppliers');
  const { menuItemService } = useServices();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const ITEMS_KEY = ['menu-items', 'period', period.id];

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ITEMS_KEY,
    queryFn: () => menuItemService.getByMenuPeriod(period.id),
    enabled: expanded,
  });

  const createItem = useMutation({
    mutationFn: menuItemService.create.bind(menuItemService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      onInvalidate();
    },
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => menuItemService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });

  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='flex items-center px-4 py-3 gap-3'>
        <button
          onClick={() => setExpanded((v) => !v)}
          className='text-muted-foreground hover:text-foreground transition-colors'
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className='flex-1 text-sm'>
          <span className='font-medium'>{period.startDate}</span>
          <span className='text-muted-foreground mx-2'>→</span>
          <span className='font-medium'>{period.endDate}</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isRemoving}
            className='p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30'
          >
            <Trash2 size={15} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('detail.menuPeriods.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                <span className='font-medium'>
                  {period.startDate} → {period.endDate}
                </span>{' '}
                {t('detail.menuPeriods.deleteDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>{t('actions.delete', { ns: 'common' })}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {expanded && (
        <div className='border-t'>
          {itemsLoading ? (
            <Skeleton className='h-48 m-4' />
          ) : (
            <MenuPeriodBuilder
              period={period}
              meals={meals}
              items={items}
              removingItemId={removeItem.isPending ? removeItem.variables : undefined}
              onCreate={(data) => createItem.mutate(data)}
              onRemove={(id) => removeItem.mutate(id)}
            />
          )}
          {createItem.isError && (
            <p className='mx-4 mb-3 text-xs text-destructive'>
              Failed to assign meal.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
