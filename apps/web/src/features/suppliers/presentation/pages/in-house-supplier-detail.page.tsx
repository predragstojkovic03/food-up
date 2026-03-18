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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  IMealResponse,
  IMenuItemResponse,
  IMenuPeriodResponse,
  MealType,
} from '@food-up/shared';
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
import { useNavigate, useParams } from 'react-router-dom';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Lunch]: 'Lunch',
  [MealType.Dinner]: 'Dinner',
  [MealType.Soup]: 'Soup',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

export default function InHouseSupplierDetailPage() {
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
            {supplier?.contactInfo}
          </p>
        </div>
      </div>

      <Tabs defaultValue='meals'>
        <TabsList className='mb-4'>
          <TabsTrigger value='meals'>Meals</TabsTrigger>
          <TabsTrigger value='menu-periods'>Menu Periods</TabsTrigger>
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

function MealsTab({ supplierId }: { supplierId: string }) {
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
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Parameters<typeof mealService.update>[1]) =>
      mealService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMeal = useMutation({
    mutationFn: (id: string) => mealService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MealType>(MealType.Lunch);
  const [price, setPrice] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMeal.mutate(
      {
        name,
        description,
        type,
        price: price ? Number(price) : undefined,
        supplierId,
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setType(MealType.Lunch);
          setPrice('');
          setShowCreate(false);
        },
      },
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-muted-foreground'>
          Meals available from this supplier
        </p>
        <Button size='sm' onClick={() => setShowCreate(true)} className='gap-2'>
          <Plus size={14} />
          Add Meal
        </Button>
      </div>

      {showCreate && (
        <div className='mb-4 border rounded-lg p-4 bg-card'>
          <div className='flex items-center justify-between mb-3'>
            <span className='font-medium text-sm'>New Meal</span>
            <button
              onClick={() => setShowCreate(false)}
              className='text-muted-foreground hover:text-foreground'
            >
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleCreate} className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='mb-1.5 block text-xs'>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Chicken sandwich'
                required
              />
            </div>
            <div>
              <Label className='mb-1.5 block text-xs'>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as MealType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MealType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {MEAL_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='col-span-2'>
              <Label className='mb-1.5 block text-xs'>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Brief description'
                required
              />
            </div>
            <div>
              <Label className='mb-1.5 block text-xs'>Price (optional)</Label>
              <Input
                type='number'
                step='0.01'
                min='0'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder='0.00'
              />
            </div>
            <div className='flex items-end'>
              <Button type='submit' size='sm' disabled={createMeal.isPending}>
                {createMeal.isPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
          {createMeal.isError && (
            <p className='mt-2 text-xs text-destructive'>
              Failed to create meal.
            </p>
          )}
        </div>
      )}

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[1fr_1fr_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>Name</span>
          <span>Description</span>
          <span>Type</span>
          <span />
        </div>
        {isLoading && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            Loading…
          </div>
        )}
        {!isLoading && meals.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            No meals yet.
          </div>
        )}
        {meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            isUpdating={
              updateMeal.isPending &&
              (updateMeal.variables as any)?.id === meal.id
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

function MealRow({
  meal,
  isUpdating,
  isRemoving,
  onUpdate,
  onRemove,
}: {
  meal: IMealResponse;
  isUpdating: boolean;
  isRemoving: boolean;
  onUpdate: (data: {
    name?: string;
    description?: string;
    type?: MealType;
  }) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description);
  const [type, setType] = useState<MealType>(meal.type);

  function handleSave() {
    onUpdate({ name, description, type });
    setEditing(false);
  }

  function handleCancel() {
    setName(meal.name);
    setDescription(meal.description);
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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(MealType).map((t) => (
              <SelectItem key={t} value={t}>
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
        {meal.description}
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
              <AlertDialogTitle>Delete meal</AlertDialogTitle>
              <AlertDialogDescription>
                Delete <span className='font-medium'>{meal.name}</span>? This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Menu Periods Tab ─────────────────────────────────────────────────────────

function MenuPeriodsTab({ supplierId }: { supplierId: string }) {
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createPeriod.mutate(
      { startDate, endDate, supplierId },
      {
        onSuccess: () => {
          setStartDate('');
          setEndDate('');
          setShowCreate(false);
        },
      },
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-muted-foreground'>
          Define date ranges and assign meals to specific days
        </p>
        <Button size='sm' onClick={() => setShowCreate(true)} className='gap-2'>
          <Plus size={14} />
          New Period
        </Button>
      </div>

      {showCreate && (
        <div className='mb-4 border rounded-lg p-4 bg-card'>
          <div className='flex items-center justify-between mb-3'>
            <span className='font-medium text-sm'>New Menu Period</span>
            <button
              onClick={() => setShowCreate(false)}
              className='text-muted-foreground hover:text-foreground'
            >
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleCreate} className='flex gap-3 items-end'>
            <div>
              <Label className='mb-1.5 block text-xs'>Start date</Label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className='mb-1.5 block text-xs'>End date</Label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <Button type='submit' size='sm' disabled={createPeriod.isPending}>
              {createPeriod.isPending ? 'Creating…' : 'Create'}
            </Button>
          </form>
          {createPeriod.isError && (
            <p className='mt-2 text-xs text-destructive'>
              Failed to create period.
            </p>
          )}
        </div>
      )}

      <div className='space-y-2'>
        {isLoading && (
          <div className='py-8 text-center text-muted-foreground text-sm'>
            Loading…
          </div>
        )}
        {!isLoading && periods.length === 0 && (
          <div className='py-8 text-center text-muted-foreground text-sm'>
            No menu periods yet.
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

function MenuPeriodRow({
  period,
  meals,
  isRemoving,
  onRemove,
  onInvalidate,
}: {
  period: IMenuPeriodResponse;
  meals: IMealResponse[];
  isRemoving: boolean;
  onRemove: () => void;
  onInvalidate: () => void;
}) {
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

  const [day, setDay] = useState('');
  const [mealId, setMealId] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    createItem.mutate(
      { menuPeriodId: period.id, day, mealId },
      {
        onSuccess: () => {
          setDay('');
          setMealId('');
          setShowAddItem(false);
        },
      },
    );
  }

  const mealById = Object.fromEntries(meals.map((m) => [m.id, m]));

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
              <AlertDialogTitle>Delete menu period</AlertDialogTitle>
              <AlertDialogDescription>
                Delete the period{' '}
                <span className='font-medium'>
                  {period.startDate} → {period.endDate}
                </span>
                ? All menu items in it will also be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {expanded && (
        <div className='border-t bg-muted/20 px-4 py-3 space-y-3'>
          {itemsLoading && (
            <p className='text-xs text-muted-foreground'>Loading items…</p>
          )}

          {!itemsLoading && items.length === 0 && !showAddItem && (
            <p className='text-xs text-muted-foreground'>
              No meals assigned yet.
            </p>
          )}

          {items
            .sort(
              (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
            )
            .map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                meal={mealById[item.mealId]}
                isRemoving={
                  removeItem.isPending && removeItem.variables === item.id
                }
                onRemove={() => removeItem.mutate(item.id)}
              />
            ))}

          {showAddItem ? (
            <form
              onSubmit={handleAddItem}
              className='flex gap-2 items-end pt-1'
            >
              <div>
                <Label className='mb-1 block text-xs'>Day</Label>
                <Input
                  type='date'
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  min={period.startDate}
                  max={period.endDate}
                  required
                  className='h-8 text-sm w-36'
                />
              </div>
              <div>
                <Label className='mb-1 block text-xs'>Meal</Label>
                <Select value={mealId} onValueChange={(v) => setMealId(v ?? '')} required>
                  <SelectTrigger className='h-8 w-44 text-sm'>
                    <SelectValue placeholder='Select meal' />
                  </SelectTrigger>
                  <SelectContent>
                    {meals.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='submit'
                size='sm'
                disabled={createItem.isPending || !mealId}
              >
                {createItem.isPending ? '…' : 'Add'}
              </Button>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={() => setShowAddItem(false)}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              <Plus size={13} />
              Assign meal to a day
            </button>
          )}

          {createItem.isError && (
            <p className='text-xs text-destructive'>
              Failed to add meal. It may already be assigned on that day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItemRow({
  item,
  meal,
  isRemoving,
  onRemove,
}: {
  item: IMenuItemResponse;
  meal: IMealResponse | undefined;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  return (
    <div className='flex items-center gap-3 text-sm'>
      <span className='text-muted-foreground w-24 shrink-0'>{item.day}</span>
      <span className='flex-1 font-medium'>{meal?.name ?? item.mealId}</span>
      {meal && (
        <span className='text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
          {MEAL_TYPE_LABELS[meal.type]}
        </span>
      )}
      <button
        onClick={onRemove}
        disabled={isRemoving}
        className='p-1 text-muted-foreground hover:text-destructive disabled:opacity-30'
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
