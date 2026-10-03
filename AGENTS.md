# AGENTS.md — Next.js + Tailwind Project

This file is read automatically by OpenAI Codex before every task. Follow these rules for all work in this repository.

---

## Stack

- **Framework**: Next.js 14+ with App Router (`app/` directory)
- **Styling**: Tailwind CSS utility classes only — no inline styles, no CSS modules unless explicitly asked
- **Language**: TypeScript by default
- **Package manager**: npm (use `npm install`, not `yarn` or `pnpm` unless asked)

---

## Before Starting Any Task

1. Read the relevant files in `components/`, `app/`, and `lib/` to understand the existing patterns
2. Match the existing code style exactly — spacing, naming, import order
3. Run `npm run lint` before finishing any task
4. Run `npm run build` to confirm no TypeScript errors before finishing

---

## Component Rules

Decide the component type before writing a single line:

| Need | Type |
|---|---|
| `onClick`, `useState`, `useEffect`, browser APIs | `'use client'` directive at top |
| Fetch data from DB/API at request time | `async` Server Component |
| Static/build-time content only | Server Component (no directive) |
| Complex interactivity + server data | Client Component — receive data as props |

**Never add `'use client'` unless the component genuinely needs it.**

---

## File Locations

```
app/
├── layout.tsx          # Root layout only — fonts, providers, global metadata
├── page.tsx            # Route pages
├── globals.css         # Tailwind directives + CSS custom properties only
├── (route-group)/      # Route groups for organization
├── [feature]/
│   ├── page.tsx
│   ├── loading.tsx     # ALWAYS add this for pages that fetch data
│   └── error.tsx       # ALWAYS add this for pages that fetch data
└── api/
    └── route.ts

components/
├── ui/                 # Primitive components (Button, Input, Card, Badge)
├── layout/             # Navbar, Sidebar, Footer, PageLayout
└── features/           # Domain-specific components

lib/
├── utils.ts            # Must contain cn() helper
└── data.ts             # All data fetching functions live here
```

---

## Code Standards

### Always use cn() for conditional classes
```ts
// lib/utils.ts must contain this
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Images — always next/image
```tsx
import Image from 'next/image';
// Always provide width + height, OR use fill with a sized parent
<Image src={src} alt={alt} width={800} height={400} />
```

### Links — always next/link
```tsx
import Link from 'next/link';
<Link href="/about">About</Link>  // never <a href="/about">
```

### Metadata — export from every page
```tsx
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};
```

### Parallel data fetching
```tsx
// Always use Promise.all — never await sequentially
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

---

## Tailwind Conventions

- Mobile-first: write base styles for mobile, add `md:` and `lg:` prefixes to scale up
- Use CSS variables for theme colors (`bg-background`, `text-foreground`, `border-border`)
- Use `cn()` for all conditional class logic — never string concatenation
- Spacing: multiples of 4 (p-4, p-8, gap-6, etc.)
- Never use arbitrary values like `w-[347px]` unless there is no standard alternative

---

## Prohibited

- ❌ Raw `<img>` tags — use `next/image`
- ❌ Raw `<a>` tags for internal links — use `next/link`
- ❌ CSS modules unless explicitly requested
- ❌ Inline style objects (`style={{ color: 'red' }}`) — use Tailwind
- ❌ `any` type in TypeScript — always type properly
- ❌ `console.log` left in committed code
- ❌ Sequential `await` when calls could be parallel

---

## Pull Request Messages

When proposing a PR, follow this format:

```
## What
[One sentence: what this PR does]

## Why
[One sentence: why this change is needed]

## Changes
- [file changed]: [what changed]
- [file changed]: [what changed]

## Testing
- [ ] npm run lint passes
- [ ] npm run build passes
- [ ] Tested on mobile viewport
```
