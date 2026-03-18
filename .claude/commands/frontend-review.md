# Frontend Review

Review the component(s) or page(s) specified by the user (or the currently open file if none specified) against the project's frontend guidelines.

Check for:

## 1. shadcn/ui Usage
- Is any custom UI being built that shadcn already provides?
- Installed components: `button`, `select`, `form`, `card`, `input`, `label`, `tabs`, `alert-dialog`, `separator`, `skeleton`, `tooltip`, `sheet`, `sidebar`, `collapsible`
- Flag any custom modal, drawer, dropdown, sidebar, or tooltip implementation that should use shadcn

## 2. Component Splitting
- Are there sub-components inside this file that are used (or very likely to be used) in other pages/features? → Should be in `src/components/`
- Are there shared components that were unnecessarily extracted and are only used here? → Should be co-located
- Is the file doing too much (data fetching + form logic + UI)? → Suggest extraction

## 3. Data Fetching
- Is server state being stored in `useState` instead of React Query? → Flag it
- Are loading, error, and empty states handled explicitly?
- Are query keys consistent?

## 4. Forms
- Is React Hook Form + Zod being used?
- Are shadcn `Form*` components used (not custom form wrappers)?

## 5. Styling
- Any inline `style={}` props? → Replace with Tailwind
- Any custom CSS that Tailwind could handle?

## 6. TypeScript
- Any `any` types?
- Are prop interfaces named correctly (`[ComponentName]Props`)?

## 7. Anti-patterns
- `useEffect` syncing derived state?
- Business logic directly in the page component instead of a hook?

---

For each issue found: state the problem, the file and line, and the recommended fix.
Prioritize issues by severity: correctness > architecture > style.
If everything looks good, say so clearly.
