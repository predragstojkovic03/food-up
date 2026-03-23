# Food-Up Web

React SPA for the Food-Up platform. Runs on port **5000** (Vite dev server).

The frontend follows a **feature-based DDD-influenced architecture**: each feature is self-contained with its own domain contracts, infrastructure (HTTP services), and presentation (pages + components). Shared infrastructure wires everything together at the application root.

---

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── app.tsx              # Root component, router outlet
│   ├── app-providers.tsx    # Wires QueryClient, services, session gate
│   └── layouts/             # AuthLayout, MainLayout, ManagerLayout
├── features/                # Feature modules (see list below)
├── components/
│   └── ui/                  # shadcn/ui primitives
├── hooks/                   # Shared custom hooks
├── lib/                     # Utility functions
└── shared/
    ├── application/
    │   └── interfaces/      # Shared query key contracts
    └── infrastructure/
        ├── di/              # ServiceContext + ServiceProvider (React Context)
        └── http/            # HttpClient (typed Fetch wrapper)
```

### Feature Module Structure

Every feature under `src/features/[feature]/` follows this layout:

```
[feature]/
├── domain/
│   └── [feature]-service.interface.ts    # Service contract (interface)
├── infrastructure/
│   └── [feature].service.ts              # HTTP implementation of the interface
├── application/
│   └── use-[action].hook.ts              # React Query hooks (useQuery / useMutation)
└── presentation/
    ├── pages/
    │   └── [feature].page.tsx            # One page component per route
    └── components/
        └── [feature]-form.tsx            # Feature-specific UI components
```

---

## Feature Modules

| Feature | Description |
|---|---|
| `auth` | Login, registration, session restore, auth Zustand store |
| `businesses` | Business/company management |
| `change-requests` | Change request submission and review workflow |
| `employees` | Employee directory, invite, and management |
| `meals` | Meal browsing |
| `meal-selections` | Employee meal selection for a given day |
| `meal-selection-windows` | Time-window management for managers |
| `menu-items` | Menu item management per supplier |
| `menu-periods` | Menu period creation and management (with drag-and-drop) |
| `reports` | Aggregated meal selection reports |
| `suppliers` | Supplier management |
| `users` | User profile and settings |

---

## Application Shell

### Layouts

Routing is nested via React Router v7. Three layout components handle access control:

| Layout | Location | Guards |
|---|---|---|
| `AuthLayout` | `app/layouts/` | Redirects authenticated users away from login/register |
| `MainLayout` | `app/layouts/` | Requires authentication |
| `ManagerLayout` | `app/layouts/` | Requires Manager role; renders the manager sidebar |

### Providers

`AppProviders` (`app/app-providers.tsx`) sets up the full provider tree at startup:
- `ServiceProvider` — injects the `ServiceContainer` (all HTTP services) via React Context
- `QueryClientProvider` — TanStack Query client
- `TooltipProvider` — shadcn tooltip context
- `SessionGate` — blocks render until the stored token is validated and the auth state is restored
- `ReactQueryDevtools` — only in development builds

---

## Key Patterns

### HTTP Client

All API calls go through `HttpClient` (`src/shared/infrastructure/http/http-client.ts`). It is a typed Fetch wrapper that:
- Automatically injects the JWT `Authorization` header from `localStorage`
- Provides typed methods (`get<T>`, `post<T>`, `put<T>`, `delete<T>`, etc.)
- Handles JSON serialization/deserialization

Services receive `HttpClient` as a constructor argument (no global singleton accessed directly):

```typescript
export class BusinessService implements IBusinessService {
  constructor(private readonly _http: HttpClient) {}

  getAll(): Promise<IBusinessResponse[]> {
    return this._http.get('/businesses');
  }
}
```

### Dependency Injection

Services are instantiated once in `app-providers.tsx` and injected into the React tree via `ServiceProvider`. Components access services through the `useService` hook (or equivalent context consumer) rather than importing them directly.

This mirrors the backend's DI pattern: components depend on interfaces (`IBusinessService`), not concrete classes.

### State Management

| Type | Tool | Rule |
|---|---|---|
| Server state (API data) | TanStack Query | Use `useQuery` / `useMutation`. Never copy API data into Zustand. |
| Global client state | Zustand | Auth store only (current identity, access token, session status) |
| Local UI state | `useState` | Form state, modal open/close, etc. |

Never put server data into `useState` or Zustand — React Query is the single source of truth for anything that comes from the API.

### Forms

All forms use **React Hook Form** + **Zod**:

```typescript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <FormField name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </Form>
  );
}
```

Define the Zod schema in the same file as the form (or a sibling `[form-name].schema.ts`). Always use shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` — do not build custom form wrappers.

### Loading and Error States

- Use **Skeleton** components during data loading — not spinners inside content areas
- Show meaningful empty states (not blank space) when lists return no items
- Use `AlertDialog` for destructive action confirmations (delete, etc.)
- Handle `isLoading`, `isError`, and empty data explicitly in every list/data view

---

## Shared Components

### `src/components/ui/` — shadcn/ui primitives

Currently installed: `button`, `select`, `form`, `card`, `input`, `label`, `tabs`, `alert-dialog`, `separator`, `skeleton`, `tooltip`, `sheet`, `sidebar`, `collapsible`, `calendar`, `popover`, `badge`, `dialog`, `dropdown-menu`, `date-picker` (and more).

**Do not wrap shadcn primitives** in a custom component just to rename them. Only wrap when adding meaningful, project-specific behavior on top.

Add a missing shadcn component:
```bash
npx shadcn@latest add <component-name>
```

### `src/components/` — promoted shared components

Generic UI components used by more than one feature live here (e.g. `DataTable`, `PageHeader`, `EmptyState`).

**Start co-located** inside the feature. Move to `src/components/` only when a second consumer appears or is clearly imminent.

---

## Running the Web App

From the **monorepo root** (recommended, also compiles the shared library):
```bash
npm run dev:web
```

From `apps/web/` directly:
```bash
npm run dev
```

The Vite dev server runs on **http://localhost:5000** and proxies API requests to the server on port 3000.

---

## Styling

- **Tailwind CSS v4** utility classes directly on elements — no custom CSS unless unavoidable
- No inline `style={}` props
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) instead of JS-based breakpoint logic
- Dark mode is handled via Tailwind's `dark:` variant where needed

---

## Naming Conventions

| Pattern | Example |
|---|---|
| Files | `kebab-case.tsx` |
| Components | `PascalCase` matching the filename |
| Pages | `[feature].page.tsx` — one page component per file |
| Hooks | `use-[name].ts` — in `src/hooks/` (shared) or co-located in feature |
| Props interfaces | `[ComponentName]Props` |
| Service interfaces | `I[Feature]Service` |

## TypeScript Rules

- No `any` — use proper types or `unknown` with narrowing
- Prefer explicit return types on hooks; components can infer
- Props interfaces named `[ComponentName]Props`
