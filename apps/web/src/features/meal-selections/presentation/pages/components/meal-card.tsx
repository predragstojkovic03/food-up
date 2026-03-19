import { MenuItemOption } from '../types';

interface MealCardProps {
  item: MenuItemOption;
  selected: boolean;
  onSelect: () => void;
}

export function MealCard({ item, selected, onSelect }: MealCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all active:scale-[0.98] ${
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{item.name}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {item.price != null && (
            <span className="text-xs font-medium text-muted-foreground">
              {item.price.toFixed(2)} €
            </span>
          )}
          <span
            className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? 'border-primary bg-primary' : 'border-border'
            }`}
          >
            {selected && (
              <svg
                viewBox="0 0 10 8"
                className="size-3 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
