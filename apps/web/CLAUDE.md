# Web App — Frontend Guidelines

## shadcn/ui First

Always check if a shadcn component exists before building anything custom.
Currently installed components are in `src/components/ui/`:
`button`, `select`, `form`, `card`, `input`, `label`, `tabs`,
`alert-dialog`, `separator`, `skeleton`, `tooltip`, `sheet`,
`sidebar`, `collapsible`

Before building a custom modal, drawer, sidebar, dropdown, etc. — **check shadcn first**.
Install missing shadcn components with: `npx shadcn@latest add <component-name>`

Do not wrap shadcn primitives in a custom component just to rename them.
Only wrap when adding meaningful, project-specific behavior on top.

## Component Splitting Rules

**Extract to `src/components/` (shared, reusable) when:**
- The component is used (or very likely to be used) in more than one page or feature
- It is a pure UI primitive with no feature-specific business logic
- Examples: `DataTable`, `PageHeader`, `ConfirmDialog`, `EmptyState`, `LoadingSpinner`

**Keep co-located inside the feature when:**
- The component exists to serve a single page or flow
- It contains feature-specific state, labels, or logic
- Moving it would require passing too many props to make it generic

```
features/employees/presentation/
├── pages/
│   └── employees.page.tsx
└── components/
    ├── employee-table.tsx       # only used on employees page → co-located
    └── employee-form.tsx        # only used inside employee flow → co-located

components/
└── data-table.tsx               # generic table → shared
```

**Default rule:** start co-located. Promote to `src/components/` only when a second consumer appears or is clearly imminent.

## File & Component Naming

- Files: `kebab-case.tsx` (e.g., `employee-form.tsx`)
- Components: `PascalCase` matching the filename (e.g., `EmployeeForm`)
- Pages: `[feature].page.tsx` — one page component per file
- Hooks: `use-[name].ts` in `src/hooks/` (shared) or co-located in feature

## Data Fetching

- Use **TanStack Query** (`useQuery`, `useMutation`) for all server state
- Do not store server data in Zustand — Zustand is for global UI/client state only
- Define query keys as constants or inline — keep them consistent per feature
- Handle `isLoading`, `isError`, and empty states explicitly in every list/data view

## Forms

- **React Hook Form** + **Zod** for all forms
- Define the Zod schema in the same file as the form component (or a sibling `[form-name].schema.ts`)
- Use shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` components — do not build custom form wrappers

## Loading & Error States

- Use `Skeleton` components (from shadcn) during loading — not spinners inside content areas
- Show meaningful empty states (not just blank space) when lists are empty
- Use `AlertDialog` for destructive confirmations (delete, etc.)

## Styling

- Use Tailwind utility classes directly — do not write custom CSS unless unavoidable
- Do not use inline `style={}` props
- Prefer Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) over JS-based breakpoint logic

## TypeScript

- No `any` — use proper types or `unknown` with narrowing
- Props interfaces named `[ComponentName]Props`
- Prefer explicit return types on hooks; components can infer

## Anti-patterns to Avoid

- Do not use `useEffect` to sync state derived from other state — derive it directly
- Do not duplicate server state into `useState` — use React Query as source of truth
- Do not build UI that shadcn already provides (drawers, dialogs, sidebars, tooltips, etc.)
- Do not put business logic directly in page components — extract to hooks or services
