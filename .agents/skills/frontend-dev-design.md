---
name: frontend-dev-design
description: >
  Expert Next.js + Tailwind CSS frontend development and UI/UX design skill for building
  complete, production-grade web applications, components, dashboards, landing pages, portfolios,
  and interactive interfaces using the App Router, Server Components, and Tailwind utility classes.
  Use this skill whenever the user wants to build, design, style, or improve any Next.js project —
  including but not limited to: App Router pages and layouts, React Server Components, API routes,
  admin dashboards, e-commerce UIs, marketing sites, design systems, animations, and responsive
  layouts with Tailwind CSS.
  Also triggers for: "make it look good", "improve the design", "build a UI for X", "Next.js app",
  "create a page", "style this with Tailwind", "make a beautiful ___", "build a component",
  "design a layout", and any variation of Next.js or Tailwind frontend work.
---

# Next.js + Tailwind Frontend Development & Design Skill

Build complete, production-grade Next.js applications with App Router, Server Components, and Tailwind CSS. This skill covers architecture decisions, visual design, component structure, data fetching patterns, animations, and performance best practices.

## Core Workflow

### 1. Understand Requirements

Before writing code, clarify:

- **What**: Type of interface (page, layout, component, dashboard, API route, etc.)
- **Rendering**: Static (SSG), dynamic (SSR), or client-side (CSR)? Affects component structure.
- **Data**: Static content, server-fetched, or client-fetched (SWR/React Query)?
- **Vibe**: Brand tone (modern, playful, corporate, editorial, brutalist, etc.)

If requirements are vague, make bold decisions and explain them briefly.

### 2. Next.js Architecture Decisions

#### App Router vs Pages Router

Always default to **App Router** (`app/`) unless user specifies otherwise.

#### Component Type Decision Tree

```
Does the component need:
  ├─ onClick, useState, useEffect, browser APIs? → 'use client'
  ├─ Data from DB/API at request time?           → async Server Component
  ├─ Static data known at build time?            → Server Component (default)
  └─ Heavy interactivity + realtime?             → Client Component with server data as props
```

#### File Structure (App Router)

```
app/
├── layout.tsx          # Root layout — fonts, global providers, metadata
├── page.tsx            # Home route
├── globals.css         # Tailwind directives + CSS vars only
├── (marketing)/        # Route group — doesn't affect URL
│   ├── about/page.tsx
│   └── pricing/page.tsx
├── dashboard/
│   ├── layout.tsx      # Dashboard shell (sidebar, header)
│   ├── page.tsx
│   ├── loading.tsx     # Suspense fallback
│   ├── error.tsx       # Error boundary
│   └── [id]/page.tsx   # Dynamic route
└── api/
    └── route.ts        # API route handler

components/
├── ui/                 # Primitives (Button, Input, Card, Badge)
├── layout/             # Shell components (Navbar, Sidebar, Footer)
└── features/           # Domain-specific components

lib/
├── utils.ts            # cn() helper, misc utilities
└── data.ts             # Data fetching functions
```

### 3. Tailwind Setup & Conventions

#### globals.css — Always include this pattern

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### cn() utility — always set up in lib/utils.ts

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install: `npm install clsx tailwind-merge`

#### tailwind.config.ts — Standard config

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
```

### 4. Design Direction

Commit to an aesthetic before coding. See [references/design-system.md](references/design-system.md) for typography pairings, color systems, layout patterns.

**Quick rules:**

- Never use Inter/Arial/Roboto — pick something with personality (loaded via `next/font/google`)
- Never purple-gradient-on-white — that's the default AI aesthetic
- Pick a clear theme: brutalist, editorial, soft/organic, luxury, futuristic, etc.

#### Loading fonts in layout.tsx

```tsx
import { Playfair_Display, Source_Serif_4 } from 'next/font/google';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const body = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '600'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 5. Build in Layers

1. **Route structure** — pages, layouts, route groups
2. **Layout skeleton** — grid/flex, breakpoints
3. **Typography hierarchy** — sizes, weights, line heights
4. **Color & surface** — bg, cards, borders
5. **Content & components** — data, labels, icons
6. **Interactivity** — hover, transitions, client handlers
7. **Polish** — animations, spacing, loading/error states

### 6. Quality Checklist

- [ ] Server Components by default; `'use client'` only where needed
- [ ] `export const metadata` on every page
- [ ] `next/image` for all images (never raw `<img>`)
- [ ] `next/link` for all internal navigation (never raw `<a>`)
- [ ] `loading.tsx` or `<Suspense>` wrapping async data fetches
- [ ] `error.tsx` for error boundaries
- [ ] Responsive: mobile (360px) → tablet (768px) → desktop (1280px)
- [ ] Color contrast AA (4.5:1 for text)

---

## Data Fetching Patterns

### Server Component (preferred)

```tsx
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // ISR
    // cache: 'no-store'        // SSR (always fresh)
    // cache: 'force-cache'     // SSG (build only)
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

### Client-side Fetching (SWR)

```tsx
'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(`/api/users/${userId}`, fetcher);
  if (isLoading) return <ProfileSkeleton />;
  if (error) return <ErrorState />;
  return <Profile user={data} />;
}
```

### Server Actions (mutations)

```tsx
// app/actions.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}

// Usage in component
<form action={createPost}>
  <input name="title" className="..." />
  <button type="submit">Create</button>
</form>;
```

---

## Key Tailwind Component Patterns

### Reusable Button with CVA

```tsx
// components/ui/button.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input hover:bg-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

Install: `npm install class-variance-authority`

### Suspense + Skeleton

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>
    </div>
  );
}

// Skeleton component
function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3 col-span-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
```

### Responsive Navbar (Client)

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-bold">
          Brand
        </Link>
        <div className="flex gap-1 ml-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

---

## Animation Patterns

### Tailwind Animate (CSS-only)

```tsx
// Entry animations — requires tailwindcss-animate
<div className="animate-in fade-in duration-500">
<div className="animate-in slide-in-from-bottom-4 duration-300">

// Staggered list
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
    style={{ animationDelay: `${i * 75}ms` }}
  >
    {item.name}
  </div>
))}
```

### Framer Motion (complex animations)

```tsx
'use client';
import { motion } from 'framer-motion';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function AnimatedCards({ items }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={fadeUp}
          className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
        >
          {item.name}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## Metadata & SEO

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'My App', template: '%s | My App' },
  description: 'Description for search engines',
  openGraph: {
    title: 'My App',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

// Dynamic metadata for [slug] routes
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  return { title: post.title, description: post.excerpt };
}
```

---

## Reference Files

| File                                                               | When to read                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [references/design-system.md](references/design-system.md)         | Typography pairings, color systems, spacing, visual effects         |
| [references/component-library.md](references/component-library.md) | Full Tailwind component patterns (forms, tables, modals, etc.)      |
| [references/nextjs-patterns.md](references/nextjs-patterns.md)     | Middleware, auth patterns, image optimization, i18n, route handlers |

---

## Output Format

- **Single component**: One `.tsx` file, typed props, Tailwind classes, `cn()` for conditionals
- **Full page**: `page.tsx` + supporting components + metadata export
- **Full app scaffold**: File tree first → `layout.tsx` → `page.tsx` → components in order
- Always state the rendering strategy choice (SSR/SSG/ISR/CSR) with a one-line reason
- TypeScript by default; plain JS only if user specifies
