# Design system components implementation
_Exported on 1/22/2026 at 00:14:44 CST from Cursor (2.2.20)_

---

**User**

I have written a design system spec @src/components/design_system.json . 

Review it and then audit all of the components to make sure they are aligned with the the perscribed guidelines. 

The components are stored in @src/components .

Create *.stories.tsx files for each component that does not already have one. 

---

**Cursor**

Brock, got it. Plan: I’ll inventory what components already exist vs what `design_system.json` requires, then implement the missing ones (using `cva` + strong TS props + semantic CSS var Tailwind classes), update any existing components to match the spec, and add a Storybook `.stories.tsx` for every created component. Then I’ll wire exports in `src/components/index.ts` so everything’s usable.

Nice: you already have all the right dependencies installed (`class-variance-authority`, `@radix-ui/react-slot`, Tailwind 4, `tw-animate-css`) and a `cn()` utility in `lib/utils.ts`. Next I’ll inspect the current `src/components/*` implementation and then bring it in line with the spec (including aligning the CSS variable names—right now `App.css` uses a different variable contract than `design_system.json`).

Aha: your repo currently has **no actual components under `src/components/`** (only the spec + a broken barrel export), so we’ll be generating the full set fresh from `design_system.json`. Next I’m going to (1) align the global CSS variables to the spec’s `--ui-*` contract, (2) fix `cn()` to avoid the missing `clsx` dependency, then (3) start adding the component directories + stories in batches (primitives → controls → overlays → data display).

```typescript
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-safe className merge utility.
 *
 * - Accepts strings, arrays, and `{ [className]: boolean }` maps.
 * - De-dupes and resolves conflicting Tailwind utilities via `tailwind-merge`.
 */
export function cn(
  ...inputs: Array<
    | string
    | false
    | null
    | undefined
    | 0
    | ReadonlyArray<string | false | null | undefined>
    | Readonly<Record<string, boolean>>
  >
): string {
  const flattened: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      flattened.push(input);
      continue;
    }
    if (Array.isArray(input)) {
      for (const item of input) {
        if (item) flattened.push(item);
      }
      continue;
    }
    for (const [className, enabled] of Object.entries(input)) {
      if (enabled) flattened.push(className);
    }
  }

  return twMerge(flattened.join(" "));
}

```

```postcss
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap");
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-brand-dark: #081639;
  --color-brand-cyan: #00aeef;
  --color-brand-lavendar: #aea1ed;
  --color-brand-gray: #8696a2;
  --color-brand-light-blue: #c1dcee;

  --font-brand: "Bricolage Grotesque";
  --font-brand-secondary: "Plus Jakarta Sans";
}

/**
 * Semantic color system contract (see `src/components/design_system.json` -> foundations.themingStrategy.cssVariables).
 * These variables are what our components read (via `var(--...)`) so light/dark stays consistent.
 */
:root {
  --ui-bg: #ffffff;
  --ui-surface: #f7f9fc;
  --ui-surface-2: #eef3f9;
  --ui-border: rgba(8, 22, 57, 0.12);
  --ui-border-strong: rgba(8, 22, 57, 0.18);
  --ui-text: #081639;
  --ui-text-muted: rgba(8, 22, 57, 0.72);
  --ui-text-subtle: rgba(8, 22, 57, 0.56);
  --ui-primary: #00aeef;
  --ui-primary-ink: #081639;
  --ui-accent: #aea1ed;
  --ui-focus: #00aeef;
  --ui-inverse-bg: #081639;
  --ui-inverse-text: #ffffff;
}

.dark {
  --ui-bg: #070f24;
  --ui-surface: rgba(255, 255, 255, 0.06);
  --ui-surface-2: rgba(255, 255, 255, 0.09);
  --ui-border: rgba(255, 255, 255, 0.12);
  --ui-border-strong: rgba(255, 255, 255, 0.18);
  --ui-text: rgba(255, 255, 255, 0.92);
  --ui-text-muted: rgba(255, 255, 255, 0.72);
  --ui-text-subtle: rgba(255, 255, 255, 0.56);
  --ui-primary: #00aeef;
  --ui-primary-ink: #081639;
  --ui-accent: #aea1ed;
  --ui-focus: #c1dcee;
  --ui-inverse-bg: #081639;
  --ui-inverse-text: #ffffff;
}

* {
  @apply font-brand-secondary;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  @apply font-brand;
}

```

```typescript
export * from "./Alert";
export * from "./Badge";
export * from "./Button";
export * from "./Card";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./Modal";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Tooltip";

```

```typescript
/**
 * DOM helpers shared across interactive components (Modal, Tooltip, DropdownMenu, etc.)
 * No external UI libs — keep this small, predictable, and accessible.
 */

/**
 * Returns focusable elements within a container, in DOM order.
 * This is used for focus trapping (Modal) and roving focus (Menu/Tabs).
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

/**
 * Returns true if an event target is inside the given element.
 */
export function isEventInside(
  container: HTMLElement,
  target: EventTarget | null
): boolean {
  return !!target && target instanceof Node && container.contains(target);
}


```

```typescript
import * as React from "react";

/**
 * A small helper for controlled/uncontrolled React state.
 *
 * Analogy: it’s like a car that can be driven either by the driver (controlled prop)
 * or by cruise control (internal state). If the driver grabs the wheel, cruise control
 * backs off.
 */
export function useControllableState<T>(params: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = params;
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);

  const isControlled = value !== undefined;
  const state = isControlled ? value : uncontrolled;

  const setState = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [state, setState];
}


```

```typescriptreact
import * as React from "react";
import { createPortal } from "react-dom";

/**
 * Simple portal that renders into `document.body`.
 * Safe for SSR-ish environments (renders null until mounted).
 */
export function Portal(props: { children: React.ReactNode }) {
  const { children } = props;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(children, document.body);
}


```

Good news: foundations are now set up so components can safely share focus/portal/state behavior without pulling in any UI library. Next I’ll add the **primitives** exactly as described in `design_system.json` (using `cva` + strong prop types), and I’ll include a Storybook story alongside each one so you can visually verify light/dark and variants.

```typescript
import type * as React from "react";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * When true, renders the underlying element via Radix `Slot`,
   * allowing polymorphic composition without losing styles.
   */
  asChild?: boolean;
};


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Container.classes.base
 */
export const containerStyles = cva(
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
);


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import type { ContainerProps } from "./Container.types";
import { containerStyles } from "./Container.styles";

/**
 * Container
 * Page-width constraint + horizontal padding; centers content.
 */
export function Container(props: ContainerProps) {
  const { asChild, className, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return <Comp className={cn(containerStyles(), className)} {...rest} />;
}


```

```typescript
export * from "./Container";
export type * from "./Container.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./Container";

const meta: Meta<typeof Container> = {
  title: "Primitives/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  render: () => (
    <div className="bg-[var(--ui-surface)] py-10">
      <Container>
        <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-6">
          Container content
        </div>
      </Container>
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="dark bg-[var(--ui-bg)] py-10">
      <Container>
        <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 text-[var(--ui-text)]">
          Dark mode container content
        </div>
      </Container>
    </div>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { stackStyles } from "./Stack.styles";

export type StackVariants = VariantProps<typeof stackStyles>;

export type StackProps = React.HTMLAttributes<HTMLDivElement> &
  StackVariants & {
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Stack.classes
 */
export const stackStyles = cva("flex flex-col", {
  variants: {
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    gap: "md",
    align: "stretch",
  },
});


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import type { StackProps } from "./Stack.types";
import { stackStyles } from "./Stack.styles";

/**
 * Stack
 * Vertical layout with consistent spacing.
 */
export function Stack(props: StackProps) {
  const { asChild, className, gap, align, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className={cn(stackStyles({ gap, align }), className)} {...rest} />
  );
}


```

```typescript
export * from "./Stack";
export type * from "./Stack.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "./Stack";

const meta: Meta<typeof Stack> = {
  title: "Primitives/Stack",
  component: Stack,
};
export default meta;

type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: { gap: "md" },
  render: (args) => (
    <Stack {...args}>
      <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4">
        Item A
      </div>
      <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4">
        Item B
      </div>
      <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4">
        Item C
      </div>
    </Stack>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { inlineStyles } from "./Inline.styles";

export type InlineVariants = VariantProps<typeof inlineStyles>;

export type InlineProps = React.HTMLAttributes<HTMLDivElement> &
  InlineVariants & {
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Inline.classes
 */
export const inlineStyles = cva("flex", {
  variants: {
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
    gap: {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      between: "justify-between",
      end: "justify-end",
      center: "justify-center",
    },
  },
  defaultVariants: {
    wrap: true,
    gap: "md",
    align: "center",
    justify: "start",
  },
});


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import type { InlineProps } from "./Inline.types";
import { inlineStyles } from "./Inline.styles";

/**
 * Inline
 * Horizontal layout row with wrapping and spacing.
 */
export function Inline(props: InlineProps) {
  const { asChild, className, wrap, gap, align, justify, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(inlineStyles({ wrap, gap, align, justify }), className)}
      {...rest}
    />
  );
}


```

```typescript
export * from "./Inline";
export type * from "./Inline.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Inline } from "./Inline";

const meta: Meta<typeof Inline> = {
  title: "Primitives/Inline",
  component: Inline,
};
export default meta;

type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  render: () => (
    <Inline>
      <div className="rounded-full border border-[var(--ui-border)] bg-[var(--ui-bg)] px-3 py-1.5 text-sm">
        Alpha
      </div>
      <div className="rounded-full border border-[var(--ui-border)] bg-[var(--ui-bg)] px-3 py-1.5 text-sm">
        Beta
      </div>
      <div className="rounded-full border border-[var(--ui-border)] bg-[var(--ui-bg)] px-3 py-1.5 text-sm">
        Gamma
      </div>
    </Inline>
  ),
};


```

```typescript
import type * as React from "react";

export type DividerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "role"> & {
  /**
   * Visual + ARIA orientation.
   */
  orientation?: "horizontal" | "vertical";
};


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Divider.classes
 */
export const dividerStyles = cva("", {
  variants: {
    orientation: {
      horizontal: "h-px w-full bg-[var(--ui-border)]",
      vertical: "w-px self-stretch bg-[var(--ui-border)]",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { DividerProps } from "./Divider.types";
import { dividerStyles } from "./Divider.styles";

/**
 * Divider
 * Subtle separator for content groups.
 */
export function Divider(props: DividerProps) {
  const { orientation = "horizontal", className, ...rest } = props;

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(dividerStyles({ orientation }), className)}
      {...rest}
    />
  );
}


```

```typescript
export * from "./Divider";
export type * from "./Divider.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Primitives/Divider",
  component: Divider,
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="text-sm text-[var(--ui-text)]">Top</div>
      <Divider {...args} />
      <div className="text-sm text-[var(--ui-text)]">Bottom</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex items-center gap-4">
      <div className="text-sm text-[var(--ui-text)]">Left</div>
      <Divider {...args} style={{ height: 40 }} />
      <div className="text-sm text-[var(--ui-text)]">Right</div>
    </div>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { headingStyles } from "./Heading.styles";

export type HeadingVariants = VariantProps<typeof headingStyles>;

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  HeadingVariants & {
    /**
     * Which heading element to render.
     */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Heading.classes
 */
export const headingStyles = cva("font-[var(--font-brand)] tracking-tight", {
  variants: {
    as: {
      h1: "text-4xl md:text-5xl font-semibold",
      h2: "text-3xl md:text-4xl font-semibold",
      h3: "text-2xl md:text-3xl font-semibold",
      h4: "text-xl md:text-2xl font-semibold",
      h5: "text-lg font-semibold",
      h6: "text-base font-semibold",
    },
    tone: {
      default: "text-[var(--ui-text)]",
      muted: "text-[var(--ui-text-muted)]",
      inverse: "text-[var(--ui-inverse-text)]",
    },
  },
  defaultVariants: {
    as: "h2",
    tone: "default",
  },
});


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { HeadingProps } from "./Heading.types";
import { headingStyles } from "./Heading.styles";

/**
 * Heading
 * Consistent headings h1–h6 with brand typography.
 */
export function Heading(props: HeadingProps) {
  const { as = "h2", tone, className, ...rest } = props;
  const Comp = as;

  return (
    <Comp className={cn(headingStyles({ as, tone }), className)} {...rest} />
  );
}


```

```typescript
export * from "./Heading";
export type * from "./Heading.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./Heading";

const meta: Meta<typeof Heading> = {
  title: "Primitives/Heading",
  component: Heading,
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Levels: Story = {
  render: () => (
    <div className="space-y-2">
      <Heading as="h1">Heading 1</Heading>
      <Heading as="h2">Heading 2</Heading>
      <Heading as="h3">Heading 3</Heading>
      <Heading as="h4">Heading 4</Heading>
      <Heading as="h5">Heading 5</Heading>
      <Heading as="h6">Heading 6</Heading>
    </div>
  ),
};

export const Inverse: Story = {
  render: () => (
    <div className="rounded-2xl bg-[var(--ui-inverse-bg)] p-6">
      <Heading as="h3" tone="inverse">
        Inverse heading
      </Heading>
    </div>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { textStyles } from "./Text.styles";

export type TextVariants = VariantProps<typeof textStyles>;

export type TextProps = React.HTMLAttributes<HTMLParagraphElement> &
  TextVariants & {
    /**
     * Render element. Defaults to `p`.
     */
    as?: "p" | "span" | "div" | "label";
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Text.classes
 */
export const textStyles = cva("font-[var(--font-brand-secondary)]", {
  variants: {
    size: {
      body: "text-base leading-7",
      sm: "text-sm leading-6",
      caption: "text-xs leading-5",
    },
    tone: {
      default: "text-[var(--ui-text)]",
      muted: "text-[var(--ui-text-muted)]",
      subtle: "text-[var(--ui-text-subtle)]",
      inverse: "text-[var(--ui-inverse-text)]",
    },
  },
  defaultVariants: {
    size: "body",
    tone: "default",
  },
});


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { TextProps } from "./Text.types";
import { textStyles } from "./Text.styles";

/**
 * Text
 * Typography primitive for paragraphs/labels/muted text variants.
 */
export function Text(props: TextProps) {
  const { as = "p", size, tone, className, ...rest } = props;
  const Comp = as;

  // Note: if `as="label"`, consumers should pass `htmlFor` via `rest`.
  return <Comp className={cn(textStyles({ size, tone }), className)} {...rest} />;
}


```

```typescript
export * from "./Text";
export type * from "./Text.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Primitives/Text",
  component: Text,
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Sizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="body">Body text — the quick brown fox jumps over the lazy dog.</Text>
      <Text size="sm">Small text — the quick brown fox jumps over the lazy dog.</Text>
      <Text size="caption">Caption text — the quick brown fox jumps over the lazy dog.</Text>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="space-y-2">
      <Text tone="default">Default tone</Text>
      <Text tone="muted">Muted tone</Text>
      <Text tone="subtle">Subtle tone</Text>
      <div className="rounded-2xl bg-[var(--ui-inverse-bg)] p-4">
        <Text tone="inverse">Inverse tone</Text>
      </div>
    </div>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { cardStyles } from "./Card.styles";

export type CardVariants = VariantProps<typeof cardStyles>;

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  CardVariants & {
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
  };

export type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Card.classes
 */
export const cardStyles = cva("rounded-2xl border border-[var(--ui-border)] p-6", {
  variants: {
    tone: {
      default: "bg-[var(--ui-bg)] text-[var(--ui-text)]",
      soft: "bg-[var(--ui-surface)] text-[var(--ui-text)]",
      inverse:
        "bg-[var(--ui-inverse-bg)] text-[var(--ui-inverse-text)] border-white/10",
    },
    elevation: {
      none: "shadow-none",
      sm: "shadow-sm shadow-black/5",
      md: "shadow-md shadow-black/10",
    },
  },
  defaultVariants: {
    tone: "default",
    elevation: "sm",
  },
});

export const cardHeaderStyles = cva("flex items-start justify-between gap-4 pb-4");
export const cardBodyStyles = cva("space-y-4");
export const cardFooterStyles = cva("pt-4 flex items-center justify-end gap-3");


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import type { CardProps, CardSectionProps } from "./Card.types";
import {
  cardBodyStyles,
  cardFooterStyles,
  cardHeaderStyles,
  cardStyles,
} from "./Card.styles";

/**
 * Card
 * Primary surface container used throughout the site/app; supports header/body/footer regions.
 */
export function Card(props: CardProps) {
  const { asChild, className, tone, elevation, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className={cn(cardStyles({ tone, elevation }), className)} {...rest} />
  );
}

/**
 * CardHeader
 * Slots: title, subtitle, actions (composition via children).
 */
export function CardHeader(props: CardSectionProps) {
  const { className, ...rest } = props;
  return <div className={cn(cardHeaderStyles(), className)} {...rest} />;
}

/**
 * CardBody
 */
export function CardBody(props: CardSectionProps) {
  const { className, ...rest } = props;
  return <div className={cn(cardBodyStyles(), className)} {...rest} />;
}

/**
 * CardFooter
 */
export function CardFooter(props: CardSectionProps) {
  const { className, ...rest } = props;
  return <div className={cn(cardFooterStyles(), className)} {...rest} />;
}


```

```typescript
export * from "./Card";
export type * from "./Card.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";
import { Button } from "../Button/Button";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm font-semibold">Account Overview</div>
          <div className="text-sm text-[var(--ui-text-muted)]">
            Updated 2 minutes ago
          </div>
        </div>
        <Button size="sm" variant="secondary">
          Action
        </Button>
      </CardHeader>
      <CardBody>
        <div className="text-sm text-[var(--ui-text)]">
          Executive-friendly body content.
        </div>
      </CardBody>
      <CardFooter>
        <Button variant="ghost">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const Inverse: Story = {
  render: () => (
    <Card tone="inverse">
      <CardHeader>
        <div className="text-sm font-semibold">Inverse Card</div>
      </CardHeader>
      <CardBody>
        <div className="text-sm opacity-90">Readable on dark surfaces.</div>
      </CardBody>
    </Card>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonStyles } from "./Button.styles";

export type ButtonVariants = VariantProps<typeof buttonStyles>;

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled"
> &
  ButtonVariants & {
    /**
     * When true, show a spinner and mark the button `aria-busy`.
     * Width stays stable by reserving icon space.
     */
    loading?: boolean;
    /**
     * Optional icon before the label.
     * If the button is icon-only, prefer `IconButton` instead.
     */
    leftIcon?: React.ReactNode;
    /**
     * Optional icon after the label.
     */
    rightIcon?: React.ReactNode;
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
    /**
     * Disabled state.
     */
    disabled?: boolean;
    /**
     * Optional test id.
     */
    "data-testid"?: string;
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Button.classes
 */
export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl",
    "font-[var(--font-brand-secondary)] font-semibold select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
    "transition-colors duration-200",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
      variant: {
        primary:
          "bg-[var(--ui-primary)] text-[var(--ui-primary-ink)] hover:brightness-95",
        secondary:
          "bg-[var(--ui-surface-2)] text-[var(--ui-text)] border border-[var(--ui-border)] hover:bg-[var(--ui-surface)]",
        ghost: "bg-transparent text-[var(--ui-text)] hover:bg-[var(--ui-surface)]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        inverse:
          "bg-[var(--ui-inverse-bg)] text-[var(--ui-inverse-text)] hover:brightness-110 border border-white/10",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import type { ButtonProps } from "./Button.types";
import { buttonStyles } from "./Button.styles";

function Spinner(props: { className?: string }) {
  const { className } = props;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}

/**
 * Button
 * Primary action; supports variants, sizes, loading state, icons.
 *
 * A11y notes (spec):
 * - When `loading=true`: set `aria-busy=true`; consider `aria-disabled=true` and keep width stable.
 * - For icon-only usage: use `IconButton` instead.
 */
export function Button(props: ButtonProps) {
  const {
    asChild,
    className,
    size,
    variant,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...rest
  } = props;

  const Comp = asChild ? Slot : "button";
  const isDisabled = !!disabled || loading;

  return (
    <Comp
      className={cn(buttonStyles({ size, variant }), className)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={!asChild ? isDisabled : undefined}
      {...rest}
    >
      {/* Reserve icon space to keep width stable while loading */}
      <span className="inline-flex items-center justify-center">
        {loading ? <Spinner /> : leftIcon}
      </span>
      <span className="truncate">{children}</span>
      <span className="inline-flex items-center justify-center">{rightIcon}</span>
    </Comp>
  );
}

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@lib/utils";

const buttonVariants = cva(
  [
    // Design-system base (see src/components/design_system.json -> components[button].tailwind.base)
    "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap",
    "font-[var(--font-brand-secondary)] font-semibold",
    "transition-[transform,box-shadow,background-color,color,border-color,opacity]",
    "disabled:opacity-50 disabled:pointer-events-none",
    "rounded-xl",
    // Icon sizing & behavior
    "shrink-0 [&_svg]:shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    // Focus ring (see design system focus token)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-canvas)]",
    // Motion (respect reduced motion)
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
  ].join(" "),
  {
    variants: {
      intent: {
        primary:
          "bg-[color:var(--color-brand-cyan)] text-[color:var(--color-brand-dark)] hover:translate-y-[-1px] hover:shadow-md",
        secondary:
          "bg-transparent border border-[color:var(--border-strong)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)]",
        ghost:
          "bg-transparent text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)]",
        destructive:
          "bg-[color:var(--status-danger)] text-white hover:translate-y-[-1px] hover:shadow-md",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      width: {
        auto: "",
        full: "w-full",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
      width: "auto",
    },
  }
);

/**
 * Orion design-system Button.
 *
 * - **Variants**: `intent`, `size`, `width` (see `src/components/design_system.json`)
 * - **A11y**: When `loading`, sets `aria-busy` and keeps children visible for screen readers.
 * - **Composition**: Supports Radix `Slot` via `asChild`.
 */
function Button({
  className,
  intent,
  size,
  width,
  asChild = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  type,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "disabled"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * When true, renders using Radix `Slot` so you can supply your own element (e.g. `<a>`).
     */
    asChild?: boolean;
    /**
     * Shows a spinner and sets `aria-busy`. Consumers typically also want `disabled`.
     */
    loading?: boolean;
    /** Optional left icon (kept `aria-hidden`). */
    leftIcon?: React.ReactNode;
    /** Optional right icon (kept `aria-hidden`). */
    rightIcon?: React.ReactNode;
    /** Disabled state (native `disabled` when rendering a `<button>`). */
    disabled?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = Boolean(disabled || loading);

  return (
    <Comp
      data-slot="button"
      data-intent={intent}
      data-size={size}
      data-width={width}
      data-loading={loading ? "true" : "false"}
      aria-busy={loading || undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      disabled={!asChild ? isDisabled : undefined}
      type={!asChild ? type ?? "button" : undefined}
      className={cn(buttonVariants({ intent, size, width, className }))}
      {...props}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex">
          {leftIcon}
        </span>
      ) : null}

      {loading ? (
        <span
          aria-hidden="true"
          className="inline-flex size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80 motion-reduce:animate-none"
        />
      ) : null}

      <span>{children}</span>

      {rightIcon ? (
        <span aria-hidden="true" className="inline-flex">
          {rightIcon}
        </span>
      ) : null}
    </Comp>
  );
}

export { Button, buttonVariants };

```

```typescript
export * from "./Button";
export type * from "./Button.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Controls/Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="inverse">Inverse</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button loading>Saving…</Button>
      <Button variant="secondary" loading>
        Loading…
      </Button>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    intent: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    width: {
      control: "select",
      options: ["auto", "full"],
    },
    asChild: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    children: {
      control: "text",
    },
  },
  args: {
    children: "Button",
    intent: "primary",
    size: "md",
    width: "auto",
    asChild: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    intent: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    intent: "secondary",
    children: "Secondary",
  },
};

export const Ghost: Story = {
  args: {
    intent: "ghost",
    children: "Ghost",
  },
};

export const Destructive: Story = {
  args: {
    intent: "destructive",
    children: "Destructive",
  },
};

export const FullWidth: Story = {
  args: {
    width: "full",
    children: "Full width",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading",
  },
};

export const WithIcons: Story = {
  args: {
    children: "With icons",
    leftIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="currentColor" />
      </svg>
    ),
    rightIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path
          d="M8 5l5 5-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { iconButtonStyles } from "./IconButton.styles";

export type IconButtonVariants = VariantProps<typeof iconButtonStyles>;

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  IconButtonVariants & {
    /**
     * Accessible name for icon-only buttons (required).
     */
    ariaLabel: string;
    /**
     * Icon content (required).
     */
    icon: React.ReactNode;
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.IconButton.classes
 */
export const iconButtonStyles = cva(
  [
    "inline-flex items-center justify-center rounded-xl",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9 w-9",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
      variant: {
        ghost: "hover:bg-[var(--ui-surface)] text-[var(--ui-text)]",
        secondary:
          "bg-[var(--ui-surface-2)] border border-[var(--ui-border)] hover:bg-[var(--ui-surface)]",
        inverse:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "ghost",
    },
  }
);


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { IconButtonProps } from "./IconButton.types";
import { iconButtonStyles } from "./IconButton.styles";

/**
 * IconButton
 * Square icon action button with accessible label.
 *
 * A11y notes (spec):
 * - `aria-label` is required.
 * - Icon inside should be aria-hidden unless it conveys unique meaning.
 */
export function IconButton(props: IconButtonProps) {
  const { className, ariaLabel, icon, size, variant, ...rest } = props;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(iconButtonStyles({ size, variant }), className)}
      {...rest}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
    </button>
  );
}


```

```typescript
export * from "./IconButton";
export type * from "./IconButton.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  );
}

const meta: Meta<typeof IconButton> = {
  title: "Controls/IconButton",
  component: IconButton,
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton ariaLabel="More options" icon={<DotsIcon />} variant="ghost" />
      <IconButton
        ariaLabel="More options"
        icon={<DotsIcon />}
        variant="secondary"
      />
      <div className="rounded-2xl bg-[var(--ui-inverse-bg)] p-3">
        <IconButton ariaLabel="More options" icon={<DotsIcon />} variant="inverse" />
      </div>
    </div>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { badgeStyles } from "./Badge.styles";

export type BadgeVariants = VariantProps<typeof badgeStyles>;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & BadgeVariants;


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Badge.classes
 */
export const badgeStyles = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border",
  {
    variants: {
      tone: {
        neutral:
          "bg-[var(--ui-surface)] text-[var(--ui-text)] border-[var(--ui-border)]",
        info:
          "bg-[color:var(--color-brand-light-blue)] text-[var(--ui-text)] border-[var(--ui-border)] dark:bg-white/10 dark:text-[var(--ui-text)]",
        success:
          "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25",
        warning:
          "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/25",
        danger:
          "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/25",
        accent:
          "bg-[color:var(--color-brand-lavendar)]/25 text-[var(--ui-text)] border-[var(--ui-border)] dark:bg-[color:var(--color-brand-lavendar)]/20",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { BadgeProps } from "./Badge.types";
import { badgeStyles } from "./Badge.styles";

/**
 * Badge
 * Small status/type label pill (non-interactive).
 */
export function Badge(props: BadgeProps) {
  const { className, tone, ...rest } = props;
  return <span className={cn(badgeStyles({ tone }), className)} {...rest} />;
}


```

```typescript
export * from "./Badge";
export type * from "./Badge.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Controls/Badge",
  component: Badge,
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
      <Badge tone="accent">Accent</Badge>
    </div>
  ),
};


```

```typescript
import type * as React from "react";

export type ChipProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  /**
   * Selected state (toggles styling) and should be reflected via `aria-pressed`.
   */
  selected?: boolean;
  /**
   * Disabled state.
   */
  disabled?: boolean;
};


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Chip.classes
 */
export const chipStyles = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold border",
  {
    variants: {
      selected: {
        true: "bg-[var(--ui-primary)] text-[var(--ui-primary-ink)] border-transparent",
        false:
          "bg-[var(--ui-bg)] text-[var(--ui-text)] border-[var(--ui-border)] hover:bg-[var(--ui-surface)]",
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  }
);

export const chipFocusStyles =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { ChipProps } from "./Chip.types";
import { chipFocusStyles, chipStyles } from "./Chip.styles";

/**
 * Chip
 * Selectable pill for toggles (e.g., time ranges).
 *
 * A11y notes (spec):
 * - Render as `<button type="button">` by default.
 * - Expose pressed state via `aria-pressed` when used as toggle.
 */
export function Chip(props: ChipProps) {
  const { className, selected = false, disabled = false, ...rest } = props;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(chipStyles({ selected, disabled }), chipFocusStyles, className)}
      {...rest}
    />
  );
}


```

```typescript
export * from "./Chip";
export type * from "./Chip.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta: Meta<typeof Chip> = {
  title: "Controls/Chip",
  component: Chip,
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip>Default</Chip>
      <Chip selected>Selected</Chip>
      <Chip disabled>Disabled</Chip>
      <Chip selected disabled>
        Selected + Disabled
      </Chip>
    </div>
  ),
};


```

```typescript
import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputStyles } from "./Input.styles";

export type InputVariants = VariantProps<typeof inputStyles>;

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  InputVariants & {
    /**
     * Optional test id.
     */
    "data-testid"?: string;
  };


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Input.classes
 */
export const inputStyles = cva(
  [
    "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] px-3",
    "text-[var(--ui-text)] placeholder:text-[var(--ui-text-subtle)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-200",
    "dark:aria-[invalid=true]:border-red-500/50 dark:aria-[invalid=true]:ring-red-500/20",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9 text-sm",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { InputProps } from "./Input.types";
import { inputStyles } from "./Input.styles";

/**
 * Input
 * Text input styled to match the design system.
 *
 * A11y notes (spec):
 * - `id` must be set and label must reference it (handled by your FormField wrapper).
 * - When error: set `aria-invalid=true` and connect error text via `aria-describedby`.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const { className, size, ...rest } = props;
    return (
      <input
        ref={ref}
        className={cn(inputStyles({ size }), className)}
        {...rest}
      />
    );
  }
);


```

```typescript
export * from "./Input";
export type * from "./Input.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Controls/Input",
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    id: "example",
    placeholder: "Search symbols…",
  },
};

export const Invalid: Story = {
  args: {
    id: "invalid",
    placeholder: "Invalid state",
    "aria-invalid": true,
  },
};


```

```typescript
import type * as React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  /**
   * Optional test id.
   */
  "data-testid"?: string;
};


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Select.classes.base
 */
export const selectStyles = cva(
  "w-full h-10 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] px-3 text-sm text-[var(--ui-text)]"
);


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { SelectProps } from "./Select.types";
import { selectStyles } from "./Select.styles";

/**
 * Select
 * Native select styled to match inputs (accessible and simple).
 *
 * A11y notes (spec):
 * - Prefer native `<select>` unless requirements demand searchable combobox.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <select ref={ref} className={cn(selectStyles(), className)} {...rest}>
        {children}
      </select>
    );
  }
);


```

```typescript
export * from "./Select";
export type * from "./Select.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Controls/Select",
  component: Select,
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select aria-label="Choose time range" defaultValue="1m">
      <option value="1d">1 day</option>
      <option value="1w">1 week</option>
      <option value="1m">1 month</option>
      <option value="1y">1 year</option>
    </Select>
  ),
};


```

```typescript
import type * as React from "react";

export type ComboboxItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ComboboxProps = {
  /**
   * Items to display in the suggestions list.
   */
  items: readonly ComboboxItem[];
  /**
   * Selected value (controlled).
   */
  value?: string;
  /**
   * Selected value (uncontrolled).
   */
  defaultValue?: string;
  /**
   * Called when a value is selected.
   */
  onValueChange?: (nextValue: string) => void;
  /**
   * Input placeholder.
   */
  placeholder?: string;
  /**
   * Debounce delay for query changes (ms).
   */
  debounceMs?: number;
  /**
   * Minimum characters before opening suggestions.
   */
  minChars?: number;
  /**
   * Close suggestions when an item is selected.
   */
  closeOnSelect?: boolean;
  /**
   * Close suggestions on blur.
   */
  closeOnBlur?: boolean;
  /**
   * Marks the combobox as loading; announced via aria-live region.
   */
  loading?: boolean;
  /**
   * Optional className for the wrapper.
   */
  className?: string;
  /**
   * Optional className for the input.
   */
  inputClassName?: string;
  /**
   * Optional test id.
   */
  "data-testid"?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "className" | "placeholder"
>;


```

```typescript
/**
 * Spec: `design_system.json` -> components.controls.Combobox.visual
 */
export const comboboxPanelClassName =
  "rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] shadow-md shadow-black/10 overflow-hidden";

export const comboboxOptionClassName =
  "px-3 py-2 text-sm hover:bg-[var(--ui-surface)] aria-selected:bg-[var(--ui-surface-2)]";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { Input } from "../Input/Input";
import { useControllableState } from "../_internal/useControllableState";
import type { ComboboxItem, ComboboxProps } from "./Combobox.types";
import { comboboxOptionClassName, comboboxPanelClassName } from "./Combobox.styles";

function findLabel(items: readonly ComboboxItem[], value: string | undefined): string {
  if (!value) return "";
  return items.find((i) => i.value === value)?.label ?? "";
}

/**
 * Combobox
 * Searchable select for symbols; supports debounced input and keyboard navigation.
 *
 * A11y notes (spec):
 * - role=combobox, aria-expanded, aria-controls, aria-activedescendant
 * - suggestions list: role=listbox; items role=option; selected state via aria-selected
 * - announce loading and 'no results' via aria-live polite region
 */
export function Combobox(props: ComboboxProps) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    debounceMs = 250,
    minChars = 1,
    closeOnSelect = true,
    closeOnBlur = true,
    loading = false,
    className,
    inputClassName,
    "data-testid": dataTestId,
    onKeyDown,
    onFocus,
    onBlur,
    ...restInputProps
  } = props;

  const listboxId = React.useId();
  const liveId = React.useId();

  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState<string>(() =>
    findLabel(items, selectedValue)
  );
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Keep input text in sync with selected value when closed.
  React.useEffect(() => {
    if (!open) setQuery(findLabel(items, selectedValue));
  }, [items, open, selectedValue]);

  // Debounce query for filtering (and future async hooks).
  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => window.clearTimeout(handle);
  }, [query, debounceMs]);

  const filtered = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < minChars) return [] as ComboboxItem[];
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [items, debouncedQuery, minChars]);

  const activeItemId =
    activeIndex >= 0 && activeIndex < filtered.length
      ? `${listboxId}-opt-${activeIndex}`
      : undefined;

  const openIfReady = React.useCallback(
    (nextQuery: string) => {
      if (nextQuery.trim().length >= minChars) setOpen(true);
      else setOpen(false);
    },
    [minChars]
  );

  const handleSelect = React.useCallback(
    (item: ComboboxItem) => {
      if (item.disabled) return;
      setSelectedValue(item.value);
      setQuery(item.label);
      setActiveIndex(-1);
      if (closeOnSelect) setOpen(false);
    },
    [closeOnSelect, setSelectedValue]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((prev) => {
          const next = Math.min(prev + 1, filtered.length - 1);
          return Number.isFinite(next) ? next : -1;
        });
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      }
      case "Enter": {
        if (!open) return;
        const item = filtered[activeIndex];
        if (item) {
          e.preventDefault();
          handleSelect(item);
        }
        break;
      }
      case "Escape": {
        if (!open) return;
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        break;
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    if (e.defaultPrevented) return;
    openIfReady(query);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    if (e.defaultPrevented) return;
    if (!closeOnBlur) return;
    // Delay so click selection can run first.
    window.setTimeout(() => setOpen(false), 0);
  };

  return (
    <div className={cn("relative", className)} data-testid={dataTestId}>
      <Input
        {...restInputProps}
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={activeItemId}
        aria-describedby={loading ? liveId : restInputProps["aria-describedby"]}
        placeholder={placeholder}
        className={cn(inputClassName)}
        value={query}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setQuery(next);
          setActiveIndex(-1);
          openIfReady(next);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <div id={liveId} aria-live="polite" className="sr-only">
        {loading ? "Loading results" : filtered.length === 0 && open ? "No results" : ""}
      </div>

      {open && (loading || filtered.length > 0) && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute z-10 mt-2 w-full",
            comboboxPanelClassName
          )}
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-[var(--ui-text-muted)]">
              Loading…
            </div>
          ) : (
            filtered.map((item, idx) => {
              const selected = item.value === selectedValue;
              const active = idx === activeIndex;
              return (
                <div
                  key={item.value}
                  id={`${listboxId}-opt-${idx}`}
                  role="option"
                  aria-selected={selected}
                  data-active={active ? "true" : "false"}
                  className={cn(
                    comboboxOptionClassName,
                    "cursor-pointer",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    active && "bg-[var(--ui-surface)]"
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    // Prevent input blur before selection.
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(item)}
                >
                  {item.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


```

```typescript
export * from "./Combobox";
export type * from "./Combobox.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Combobox } from "./Combobox";

const meta: Meta<typeof Combobox> = {
  title: "Controls/Combobox",
  component: Combobox,
};
export default meta;

type Story = StoryObj<typeof Combobox>;

const items = [
  { value: "AAPL", label: "AAPL — Apple Inc." },
  { value: "MSFT", label: "MSFT — Microsoft" },
  { value: "NVDA", label: "NVDA — NVIDIA" },
  { value: "TSLA", label: "TSLA — Tesla" },
  { value: "AMZN", label: "AMZN — Amazon" },
] as const;

export const Default: Story = {
  args: {
    items,
    placeholder: "Search symbols…",
    "aria-label": "Search symbols",
  },
};


```

```typescript
import type * as React from "react";

export type TabsProps = {
  /**
   * Selected tab value (controlled).
   */
  value?: string;
  /**
   * Default selected tab value (uncontrolled).
   */
  defaultValue: string;
  /**
   * Called when the selected tab changes.
   */
  onValueChange?: (nextValue: string) => void;
  /**
   * Tabs content.
   */
  children: React.ReactNode;
};

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export type TabsTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "type"
> & {
  value: string;
  disabled?: boolean;
};

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};


```

```typescript
/**
 * Spec: `design_system.json` -> components.navigationAndOverlays.Tabs.classes
 */
export const tabsListClassName =
  "inline-flex rounded-full bg-[var(--ui-surface)] p-1 border border-[var(--ui-border)]";

export const tabsTriggerClassName =
  "rounded-full px-4 py-2 text-sm font-semibold text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]";

export const tabsTriggerActiveClassName =
  "bg-[var(--ui-bg)] text-[var(--ui-text)] shadow-sm shadow-black/5 border border-[var(--ui-border)]";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { useControllableState } from "../_internal/useControllableState";
import type {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from "./Tabs.types";
import {
  tabsListClassName,
  tabsTriggerActiveClassName,
  tabsTriggerClassName,
} from "./Tabs.styles";

type RegisteredTab = {
  value: string;
  ref: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  id: string;
  panelId: string;
};

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  register: (tab: RegisteredTab) => void;
  unregister: (value: string) => void;
  getTab: (value: string) => RegisteredTab | undefined;
  getTabs: () => readonly RegisteredTab[];
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>.");
  return ctx;
}

/**
 * Tabs
 * Accessible tabs with roving tabindex and arrow-key navigation.
 */
export function Tabs(props: TabsProps) {
  const { value, defaultValue, onValueChange, children } = props;
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const tabsRef = React.useRef<RegisteredTab[]>([]);

  const register = React.useCallback((tab: RegisteredTab) => {
    tabsRef.current = [
      ...tabsRef.current.filter((t) => t.value !== tab.value),
      tab,
    ];
  }, []);

  const unregister = React.useCallback((tabValue: string) => {
    tabsRef.current = tabsRef.current.filter((t) => t.value !== tabValue);
  }, []);

  const getTab = React.useCallback(
    (tabValue: string) => tabsRef.current.find((t) => t.value === tabValue),
    []
  );

  const getTabs = React.useCallback(() => tabsRef.current, []);

  const ctx: TabsContextValue = React.useMemo(
    () => ({
      value: selected,
      setValue: setSelected,
      register,
      unregister,
      getTab,
      getTabs,
    }),
    [getTab, getTabs, register, selected, setSelected, unregister]
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export function TabsList(props: TabsListProps) {
  const { className, ...rest } = props;
  return (
    <div
      role="tablist"
      className={cn(tabsListClassName, className)}
      {...rest}
    />
  );
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { value, className, disabled = false, onKeyDown, onClick, ...rest } =
    props;
  const ctx = useTabsContext();
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const reactId = React.useId();

  const id = `tab-${reactId}`;
  const panelId = `panel-${reactId}`;

  const selected = ctx.value === value;

  React.useEffect(() => {
    ctx.register({ value, ref, disabled, id, panelId });
    return () => ctx.unregister(value);
  }, [ctx, disabled, id, panelId, value]);

  const focusNext = (dir: 1 | -1) => {
    const tabs = ctx
      .getTabs()
      .filter((t) => !t.disabled)
      .sort((a, b) => a.id.localeCompare(b.id));

    const idx = tabs.findIndex((t) => t.value === value);
    if (idx === -1 || tabs.length === 0) return;
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    next?.ref.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusNext(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusNext(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!disabled) ctx.setValue(value);
        break;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!disabled) ctx.setValue(value);
  };

  return (
    <button
      ref={ref}
      type="button"
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cn(
        tabsTriggerClassName,
        selected && tabsTriggerActiveClassName,
        className
      )}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...rest}
    />
  );
}

export function TabsContent(props: TabsContentProps) {
  const { value, className, ...rest } = props;
  const ctx = useTabsContext();
  const tab = ctx.getTab(value);
  const selected = ctx.value === value;

  return (
    <div
      role="tabpanel"
      id={tab?.panelId}
      aria-labelledby={tab?.id}
      hidden={!selected}
      className={cn(className)}
      {...rest}
    />
  );
}


```

```typescript
export * from "./Tabs";
export type * from "./Tabs.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import { Card, CardBody } from "../Card/Card";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardBody>Overview content</CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="pt-4">
          <Card>
            <CardBody>Performance content</CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="risk" className="pt-4">
          <Card>
            <CardBody>Risk content</CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
};


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { useControllableState } from "../_internal/useControllableState";
import type {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from "./Tabs.types";
import {
  tabsListClassName,
  tabsTriggerActiveClassName,
  tabsTriggerClassName,
} from "./Tabs.styles";

type RegisteredTab = {
  value: string;
  ref: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  id: string;
  panelId: string;
};

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  register: (tab: RegisteredTab) => void;
  unregister: (value: string) => void;
  getTab: (value: string) => RegisteredTab | undefined;
  getTabs: () => readonly RegisteredTab[];
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>.");
  return ctx;
}

/**
 * Tabs
 * Accessible tabs with roving tabindex and arrow-key navigation.
 */
export function Tabs(props: TabsProps) {
  const { value, defaultValue, onValueChange, children } = props;
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const tabsRef = React.useRef<RegisteredTab[]>([]);

  const register = React.useCallback((tab: RegisteredTab) => {
    const idx = tabsRef.current.findIndex((t) => t.value === tab.value);
    if (idx === -1) {
      tabsRef.current = [...tabsRef.current, tab];
      return;
    }
    tabsRef.current = tabsRef.current.map((t, i) => (i === idx ? tab : t));
  }, []);

  const unregister = React.useCallback((tabValue: string) => {
    tabsRef.current = tabsRef.current.filter((t) => t.value !== tabValue);
  }, []);

  const getTab = React.useCallback(
    (tabValue: string) => tabsRef.current.find((t) => t.value === tabValue),
    []
  );

  const getTabs = React.useCallback(() => tabsRef.current, []);

  const ctx: TabsContextValue = React.useMemo(
    () => ({
      value: selected,
      setValue: setSelected,
      register,
      unregister,
      getTab,
      getTabs,
    }),
    [getTab, getTabs, register, selected, setSelected, unregister]
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export function TabsList(props: TabsListProps) {
  const { className, ...rest } = props;
  return (
    <div
      role="tablist"
      className={cn(tabsListClassName, className)}
      {...rest}
    />
  );
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { value, className, disabled = false, onKeyDown, onClick, ...rest } =
    props;
  const ctx = useTabsContext();
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const reactId = React.useId();

  const id = `tab-${reactId}`;
  const panelId = `panel-${reactId}`;

  const selected = ctx.value === value;

  React.useEffect(() => {
    ctx.register({ value, ref, disabled, id, panelId });
    return () => ctx.unregister(value);
  }, [ctx, disabled, id, panelId, value]);

  const focusNext = (dir: 1 | -1) => {
    const tabs = ctx.getTabs().filter((t) => !t.disabled);

    const idx = tabs.findIndex((t) => t.value === value);
    if (idx === -1 || tabs.length === 0) return;
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    next?.ref.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusNext(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusNext(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!disabled) ctx.setValue(value);
        break;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!disabled) ctx.setValue(value);
  };

  return (
    <button
      ref={ref}
      type="button"
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cn(
        tabsTriggerClassName,
        selected && tabsTriggerActiveClassName,
        className
      )}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...rest}
    />
  );
}

export function TabsContent(props: TabsContentProps) {
  const { value, className, ...rest } = props;
  const ctx = useTabsContext();
  const tab = ctx.getTab(value);
  const selected = ctx.value === value;

  return (
    <div
      role="tabpanel"
      id={tab?.panelId}
      aria-labelledby={tab?.id}
      hidden={!selected}
      className={cn(className)}
      {...rest}
    />
  );
}



```

```typescript
import type * as React from "react";

export type DropdownMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  children: React.ReactNode;
};

export type DropdownMenuTriggerProps = {
  /**
   * Render trigger via Radix Slot (recommended so you can use Button/IconButton).
   */
  asChild?: boolean;
  children: React.ReactNode;
};

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional width override.
   */
  minWidth?: number;
};

export type DropdownMenuItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  inset?: boolean;
};


```

```typescript
/**
 * Spec: `design_system.json` -> components.navigationAndOverlays.DropdownMenu.classes
 */
export const dropdownMenuContentClassName =
  "min-w-48 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] shadow-md shadow-black/10 p-1";

export const dropdownMenuItemClassName =
  "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--ui-surface)] focus:bg-[var(--ui-surface)] outline-none";

export const dropdownMenuSeparatorClassName = "my-1 h-px bg-[var(--ui-border)]";


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import { Portal } from "../_internal/portal";
import { getFocusableElements, isEventInside } from "../_internal/dom";
import { useControllableState } from "../_internal/useControllableState";
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
} from "./DropdownMenu.types";
import {
  dropdownMenuContentClassName,
  dropdownMenuItemClassName,
  dropdownMenuSeparatorClassName,
} from "./DropdownMenu.styles";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
);

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx)
    throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
  return ctx;
}

/**
 * DropdownMenu
 * Action menu (sort presets, row actions).
 *
 * A11y notes (spec):
 * - Opens on Enter/Space/ArrowDown from trigger.
 * - Arrow keys navigate items; Esc closes; focus returns to trigger.
 */
export function DropdownMenu(props: DropdownMenuProps) {
  const { open, defaultOpen = false, onOpenChange, children } = props;
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target;
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;
      if (isEventInside(content, target) || isEventInside(trigger, target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, setIsOpen]);

  React.useEffect(() => {
    if (isOpen) return;
    triggerRef.current?.focus();
  }, [isOpen]);

  const ctx: DropdownMenuContextValue = React.useMemo(
    () => ({ open: isOpen, setOpen: setIsOpen, triggerRef, contentRef }),
    [isOpen, setIsOpen]
  );

  return (
    <DropdownMenuContext.Provider value={ctx}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { asChild, children } = props;
  const ctx = useDropdownMenuContext();
  const Comp = asChild ? Slot : "button";

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        ctx.setOpen(true);
        break;
    }
  };

  const onClick = () => ctx.setOpen(!ctx.open);

  return (
    <Comp
      // @ts-expect-error Slot allows arbitrary element types; we just need a ref.
      ref={ctx.triggerRef}
      onKeyDown={onKeyDown}
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
    >
      {children}
    </Comp>
  );
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { className, style, minWidth, ...rest } = props;
  const ctx = useDropdownMenuContext();
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number }>(
    { top: 0, left: 0, width: 0 }
  );

  React.useLayoutEffect(() => {
    if (!ctx.open) return;
    const trigger = ctx.triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, [ctx.open]);

  React.useEffect(() => {
    if (!ctx.open) return;
    const onReflow = () => {
      const trigger = ctx.triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [ctx.open]);

  React.useEffect(() => {
    if (!ctx.open) return;
    const content = ctx.contentRef.current;
    if (!content) return;
    const focusables = getFocusableElements(content);
    focusables[0]?.focus();
  }, [ctx.open, ctx.contentRef]);

  if (!ctx.open) return null;

  return (
    <Portal>
      <div
        ref={ctx.contentRef}
        role="menu"
        aria-orientation="vertical"
        className={cn(dropdownMenuContentClassName, className)}
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          minWidth: minWidth ?? undefined,
          ...style,
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            ctx.setOpen(false);
            return;
          }
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

          e.preventDefault();
          const content = ctx.contentRef.current;
          if (!content) return;
          const focusables = getFocusableElements(content);
          const current = document.activeElement;
          const idx = focusables.findIndex((el) => el === current);
          if (idx === -1) {
            focusables[0]?.focus();
            return;
          }
          const dir = e.key === "ArrowDown" ? 1 : -1;
          const next = (idx + dir + focusables.length) % focusables.length;
          focusables[next]?.focus();
        }}
        {...rest}
      />
    </Portal>
  );
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { className, inset, onClick, ...rest } = props;
  const ctx = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        dropdownMenuItemClassName,
        inset && "pl-8",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.setOpen(false);
      }}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      role="separator"
      className={cn(dropdownMenuSeparatorClassName, className)}
      {...rest}
    />
  );
}


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import { Portal } from "../_internal/portal";
import { getFocusableElements, isEventInside } from "../_internal/dom";
import { useControllableState } from "../_internal/useControllableState";
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
} from "./DropdownMenu.types";
import {
  dropdownMenuContentClassName,
  dropdownMenuItemClassName,
  dropdownMenuSeparatorClassName,
} from "./DropdownMenu.styles";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerAnchorRef: React.RefObject<HTMLSpanElement | null>;
  triggerElRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
);

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx)
    throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
  return ctx;
}

/**
 * DropdownMenu
 * Action menu (sort presets, row actions).
 *
 * A11y notes (spec):
 * - Opens on Enter/Space/ArrowDown from trigger.
 * - Arrow keys navigate items; Esc closes; focus returns to trigger.
 */
export function DropdownMenu(props: DropdownMenuProps) {
  const { open, defaultOpen = false, onOpenChange, children } = props;
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerAnchorRef = React.useRef<HTMLSpanElement | null>(null);
  const triggerElRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target;
      const trigger = triggerAnchorRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;
      if (isEventInside(content, target) || isEventInside(trigger, target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, setIsOpen]);

  React.useEffect(() => {
    if (isOpen) return;
    triggerElRef.current?.focus();
  }, [isOpen]);

  const ctx: DropdownMenuContextValue = React.useMemo(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      triggerAnchorRef,
      triggerElRef,
      contentRef,
    }),
    [isOpen, setIsOpen]
  );

  return (
    <DropdownMenuContext.Provider value={ctx}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { asChild, children } = props;
  const ctx = useDropdownMenuContext();
  const Comp = asChild ? Slot : "button";

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    ctx.triggerElRef.current = e.currentTarget as HTMLElement;
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        ctx.setOpen(true);
        break;
    }
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    ctx.triggerElRef.current = e.currentTarget as HTMLElement;
    ctx.setOpen(!ctx.open);
  };

  return (
    <span ref={ctx.triggerAnchorRef} className="inline-flex">
      <Comp onKeyDown={onKeyDown} onClick={onClick} aria-haspopup="menu" aria-expanded={ctx.open}>
        {children}
      </Comp>
    </span>
  );
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { className, style, minWidth, ...rest } = props;
  const ctx = useDropdownMenuContext();
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number }>(
    { top: 0, left: 0, width: 0 }
  );

  React.useLayoutEffect(() => {
    if (!ctx.open) return;
    const trigger = ctx.triggerAnchorRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, [ctx.open]);

  React.useEffect(() => {
    if (!ctx.open) return;
    const onReflow = () => {
      const trigger = ctx.triggerAnchorRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [ctx.open]);

  React.useEffect(() => {
    if (!ctx.open) return;
    const content = ctx.contentRef.current;
    if (!content) return;
    const focusables = getFocusableElements(content);
    focusables[0]?.focus();
  }, [ctx.open, ctx.contentRef]);

  if (!ctx.open) return null;

  return (
    <Portal>
      <div
        ref={ctx.contentRef}
        role="menu"
        aria-orientation="vertical"
        className={cn(dropdownMenuContentClassName, className)}
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          minWidth: minWidth ?? undefined,
          ...style,
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            ctx.setOpen(false);
            return;
          }
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

          e.preventDefault();
          const content = ctx.contentRef.current;
          if (!content) return;
          const focusables = getFocusableElements(content);
          const current = document.activeElement;
          const idx = focusables.findIndex((el) => el === current);
          if (idx === -1) {
            focusables[0]?.focus();
            return;
          }
          const dir = e.key === "ArrowDown" ? 1 : -1;
          const next = (idx + dir + focusables.length) % focusables.length;
          focusables[next]?.focus();
        }}
        {...rest}
      />
    </Portal>
  );
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { className, inset, onClick, ...rest } = props;
  const ctx = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        dropdownMenuItemClassName,
        inset && "pl-8",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.setOpen(false);
      }}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      role="separator"
      className={cn(dropdownMenuSeparatorClassName, className)}
      {...rest}
    />
  );
}



```

```typescript
export * from "./DropdownMenu";
export type * from "./DropdownMenu.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Button } from "../Button/Button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Navigation/DropdownMenu",
  component: DropdownMenu,
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}}>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};


```

```typescript
import type * as React from "react";

export type ModalProps = {
  /**
   * Controls the open state.
   */
  open: boolean;
  /**
   * Called when the open state should change.
   */
  onOpenChange: (nextOpen: boolean) => void;
  /**
   * Dialog title (required for aria-labelledby).
   */
  title: React.ReactNode;
  /**
   * Dialog description (required for aria-describedby).
   */
  description: React.ReactNode;
  /**
   * Main dialog body content.
   */
  children: React.ReactNode;
  /**
   * Optional footer content (actions).
   */
  footer?: React.ReactNode;
  /**
   * Close on Escape key.
   */
  closeOnEsc?: boolean;
  /**
   * Close on overlay click.
   */
  closeOnOverlayClick?: boolean;
};


```

```typescript
/**
 * Spec: `design_system.json` -> components.navigationAndOverlays.Modal.classes
 */
export const modalOverlayClassName =
  "fixed inset-0 bg-black/40 backdrop-blur-[1px]";

export const modalContentClassName =
  "fixed left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg)] shadow-lg shadow-black/20 p-6";

export const modalHeaderClassName = "mb-4 space-y-1";
export const modalTitleClassName =
  "text-xl font-semibold font-[var(--font-brand)] text-[var(--ui-text)]";
export const modalDescriptionClassName =
  "text-sm text-[var(--ui-text-muted)]";
export const modalFooterClassName = "mt-6 flex items-center justify-end gap-3";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { Portal } from "../_internal/portal";
import { getFocusableElements } from "../_internal/dom";
import type { ModalProps } from "./Modal.types";
import {
  modalContentClassName,
  modalDescriptionClassName,
  modalFooterClassName,
  modalHeaderClassName,
  modalOverlayClassName,
  modalTitleClassName,
} from "./Modal.styles";

/**
 * Modal
 * Accessible modal dialog for confirmations and forms.
 *
 * A11y notes (spec):
 * - Trap focus inside; restore focus on close.
 * - Esc closes unless explicitly disabled.
 * - `aria-labelledby` and `aria-describedby` are required (enforced via props).
 */
export function Modal(props: ModalProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    closeOnEsc = true,
    closeOnOverlayClick = true,
  } = props;

  const titleId = React.useId();
  const descriptionId = React.useId();

  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      (document.activeElement instanceof HTMLElement && document.activeElement) ||
      null;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const content = contentRef.current;
    if (!content) return;
    const focusables = getFocusableElements(content);
    (focusables[0] ?? content).focus();
  }, [open]);

  React.useEffect(() => {
    if (open) return;
    previouslyFocusedRef.current?.focus?.();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab") return;

      const content = contentRef.current;
      if (!content) return;
      const focusables = getFocusableElements(content);
      if (focusables.length === 0) {
        e.preventDefault();
        content.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc, onOpenChange, open]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className={modalOverlayClassName}
        onMouseDown={(e) => {
          if (!closeOnOverlayClick) return;
          if (e.target === e.currentTarget) onOpenChange(false);
        }}
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(modalContentClassName)}
      >
        <div className={modalHeaderClassName}>
          <div id={titleId} className={modalTitleClassName}>
            {title}
          </div>
          <div id={descriptionId} className={modalDescriptionClassName}>
            {description}
          </div>
        </div>

        <div className="space-y-4">{children}</div>

        {footer ? <div className={modalFooterClassName}>{footer}</div> : null}
      </div>
    </Portal>
  );
}


```

```typescript
export * from "./Modal";
export type * from "./Modal.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Modal } from "./Modal";
import { Button } from "../Button/Button";

const meta: Meta<typeof Modal> = {
  title: "Navigation/Modal",
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Confirm action"
          description="This action can’t be undone."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </>
          }
        >
          <div className="text-sm text-[var(--ui-text)]">
            Modal body content goes here.
          </div>
        </Modal>
      </div>
    );
  },
};


```

```typescript
import type * as React from "react";

export type TooltipProps = {
  /**
   * Tooltip content. Keep it short and non-interactive (spec).
   */
  content: React.ReactNode;
  /**
   * Child element that receives aria-describedby + hover/focus handlers.
   */
  children: React.ReactElement;
  /**
   * Preferred side for placement.
   */
  side?: "top" | "bottom";
  /**
   * Optional delay before showing (ms).
   */
  delayMs?: number;
};


```

```typescript
/**
 * Spec: `design_system.json` -> components.navigationAndOverlays.Tooltip.classes.content
 */
export const tooltipContentClassName =
  "rounded-lg bg-[var(--ui-inverse-bg)] text-[var(--ui-inverse-text)] text-xs px-2 py-1 shadow-md shadow-black/20";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { Portal } from "../_internal/portal";
import type { TooltipProps } from "./Tooltip.types";
import { tooltipContentClassName } from "./Tooltip.styles";

/**
 * Tooltip
 * Short supporting text on hover/focus.
 *
 * A11y notes (spec):
 * - Must appear on focus and hover.
 * - Content referenced via aria-describedby.
 * - Must not contain interactive content.
 */
export function Tooltip(props: TooltipProps) {
  const { content, children, side = "top", delayMs = 0 } = props;
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const timeoutRef = React.useRef<number | null>(null);

  const scheduleOpen = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    const top =
      side === "top" ? rect.top - 10 : rect.bottom + 10;
    const left = rect.left + rect.width / 2;

    const openNow = () => {
      setPos({ top, left });
      setOpen(true);
    };

    if (delayMs <= 0) {
      openNow();
      return;
    }

    timeoutRef.current = window.setTimeout(openNow, delayMs);
  };

  const close = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setOpen(false);
  };

  const childProps = {
    "aria-describedby": open ? id : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      if (e.defaultPrevented) return;
      scheduleOpen(e.currentTarget as HTMLElement);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      close();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      if (e.defaultPrevented) return;
      scheduleOpen(e.currentTarget as HTMLElement);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      close();
    },
  } satisfies Partial<React.ComponentProps<"span">>;

  return (
    <>
      {React.cloneElement(children, childProps)}
      {open ? (
        <Portal>
          <div
            id={id}
            role="tooltip"
            className={cn(tooltipContentClassName)}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  );
}


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { Portal } from "../_internal/portal";
import type { TooltipProps } from "./Tooltip.types";
import { tooltipContentClassName } from "./Tooltip.styles";

/**
 * Tooltip
 * Short supporting text on hover/focus.
 *
 * A11y notes (spec):
 * - Must appear on focus and hover.
 * - Content referenced via aria-describedby.
 * - Must not contain interactive content.
 */
export function Tooltip(props: TooltipProps) {
  const { content, children, side = "top", delayMs = 0 } = props;
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const timeoutRef = React.useRef<number | null>(null);

  const scheduleOpen = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    const top =
      side === "top" ? rect.top - 10 : rect.bottom + 10;
    const left = rect.left + rect.width / 2;

    const openNow = () => {
      setPos({ top, left });
      setOpen(true);
    };

    if (delayMs <= 0) {
      openNow();
      return;
    }

    timeoutRef.current = window.setTimeout(openNow, delayMs);
  };

  const close = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setOpen(false);
  };

  const childProps = {
    "aria-describedby": open ? id : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      if (e.defaultPrevented) return;
      scheduleOpen(e.currentTarget as HTMLElement);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      close();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      if (e.defaultPrevented) return;
      scheduleOpen(e.currentTarget as HTMLElement);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      close();
    },
  } satisfies Partial<React.ComponentProps<"span">>;

  return (
    <>
      {React.cloneElement(children, childProps)}
      {open ? (
        <Portal>
          <div
            id={id}
            role="tooltip"
            className={cn(tooltipContentClassName)}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform:
                side === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  );
}



```

```typescript
export * from "./Tooltip";
export type * from "./Tooltip.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button/Button";

const meta: Meta<typeof Tooltip> = {
  title: "Navigation/Tooltip",
  component: Tooltip,
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Helpful supporting text.">
      <Button variant="secondary">Hover or focus me</Button>
    </Tooltip>
  ),
};


```

```typescript
import type * as React from "react";

export type TableProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Table element props.
   */
  tableProps?: React.TableHTMLAttributes<HTMLTableElement>;
};

export type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  /**
   * Adds hover background for rows.
   */
  hover?: boolean;
};

export type TableHeadCellProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;


```

```typescript
/**
 * Spec: `design_system.json` -> components.dataDisplay.Table.classes
 */
export const tableWrapperClassName =
  "w-full overflow-x-auto rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg)]";

export const tableClassName = "w-full min-w-[720px] border-separate border-spacing-0";
export const tableTheadClassName = "bg-[var(--ui-surface)]";
export const tableThClassName =
  "text-left text-xs font-semibold uppercase tracking-wide text-[var(--ui-text-muted)] px-4 py-3 border-b border-[var(--ui-border)]";
export const tableTdClassName =
  "px-4 py-3 text-sm text-[var(--ui-text)] border-b border-[var(--ui-border)]";
export const tableRowHoverClassName = "hover:bg-[var(--ui-surface)]";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type {
  TableCellProps,
  TableHeadCellProps,
  TableProps,
  TableRowProps,
  TableSectionProps,
} from "./Table.types";
import {
  tableClassName,
  tableTdClassName,
  tableThClassName,
  tableTheadClassName,
  tableWrapperClassName,
  tableRowHoverClassName,
} from "./Table.styles";

/**
 * Table
 * Responsive table wrapper with executive-friendly readability.
 *
 * A11y notes (spec):
 * - Use `<th scope="col">` for headers.
 * - Sortable headers must be buttons with `aria-sort` (consumer responsibility).
 */
export function Table(props: TableProps) {
  const { className, tableProps, children, ...rest } = props;
  return (
    <div className={cn(tableWrapperClassName, className)} {...rest}>
      <table className={tableClassName} {...tableProps}>
        {children}
      </table>
    </div>
  );
}

export function TableHead(props: TableSectionProps) {
  const { className, ...rest } = props;
  return <thead className={cn(tableTheadClassName, className)} {...rest} />;
}

export function TableBody(props: TableSectionProps) {
  return <tbody {...props} />;
}

export function TableRow(props: TableRowProps) {
  const { className, hover = false, ...rest } = props;
  return <tr className={cn(hover && tableRowHoverClassName, className)} {...rest} />;
}

export function TableHeadCell(props: TableHeadCellProps) {
  const { className, scope = "col", ...rest } = props;
  return <th scope={scope} className={cn(tableThClassName, className)} {...rest} />;
}

export function TableCell(props: TableCellProps) {
  const { className, ...rest } = props;
  return <td className={cn(tableTdClassName, className)} {...rest} />;
}


```

```typescript
export * from "./Table";
export type * from "./Table.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "./Table";

const meta: Meta<typeof Table> = {
  title: "Data Display/Table",
  component: Table,
};
export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeadCell>Symbol</TableHeadCell>
          <TableHeadCell>Price</TableHeadCell>
          <TableHeadCell>Change</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow hover>
          <TableCell>AAPL</TableCell>
          <TableCell>$192.44</TableCell>
          <TableCell>+1.2%</TableCell>
        </TableRow>
        <TableRow hover>
          <TableCell>MSFT</TableCell>
          <TableCell>$412.18</TableCell>
          <TableCell>-0.4%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};


```

```typescript
import type * as React from "react";

export type StatProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  value: React.ReactNode;
  subvalue?: React.ReactNode;
};


```

```typescript
/**
 * Spec: `design_system.json` -> components.dataDisplay.Stat.classes
 */
export const statContainerClassName = "space-y-1";
export const statLabelClassName =
  "text-xs font-semibold uppercase tracking-wide text-[var(--ui-text-muted)]";
export const statValueClassName =
  "text-2xl font-semibold font-[var(--font-brand)] text-[var(--ui-text)]";
export const statSubvalueClassName = "text-sm text-[var(--ui-text-muted)]";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { StatProps } from "./Stat.types";
import {
  statContainerClassName,
  statLabelClassName,
  statSubvalueClassName,
  statValueClassName,
} from "./Stat.styles";

/**
 * Stat
 * Metric display (label + value + delta) for dashboards/overview cards.
 */
export function Stat(props: StatProps) {
  const { label, value, subvalue, className, ...rest } = props;
  return (
    <div className={cn(statContainerClassName, className)} {...rest}>
      <div className={statLabelClassName}>{label}</div>
      <div className={statValueClassName}>{value}</div>
      {subvalue ? <div className={statSubvalueClassName}>{subvalue}</div> : null}
    </div>
  );
}


```

```typescript
export * from "./Stat";
export type * from "./Stat.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Stat } from "./Stat";

const meta: Meta<typeof Stat> = {
  title: "Data Display/Stat",
  component: Stat,
};
export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Stat label="AUM" value="$4.2B" subvalue="As of today" />
      <Stat label="YTD" value="+12.4%" subvalue="Net performance" />
    </div>
  ),
};


```

```typescript
import type * as React from "react";

export type DeltaPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  /**
   * Required: direction of the change.
   */
  direction: "up" | "down" | "flat";
  /**
   * Required: tone for styling.
   */
  tone: "success" | "danger" | "neutral";
  /**
   * Text like "+2.4%" or "-1.1%".
   * Spec requirement: do not convey meaning via arrow/color only.
   */
  children: React.ReactNode;
};


```

```typescript
/**
 * Spec: `design_system.json` -> components.dataDisplay.DeltaPill.classes
 */
export const deltaPillBaseClassName =
  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold border";

export const deltaPillToneClassName = {
  success:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25",
  danger:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/25",
  neutral:
    "bg-[var(--ui-surface)] text-[var(--ui-text)] border-[var(--ui-border)]",
} as const;


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { DeltaPillProps } from "./DeltaPill.types";
import { deltaPillBaseClassName, deltaPillToneClassName } from "./DeltaPill.styles";

function Arrow(props: { direction: "up" | "down" | "flat" }) {
  const { direction } = props;
  const rotation =
    direction === "up" ? "rotate-0" : direction === "down" ? "rotate-180" : "";

  if (direction === "flat") return <span aria-hidden="true">•</span>;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-3.5 w-3.5", rotation)}
      fill="currentColor"
    >
      <path d="M12 4l6 6h-4v10h-4V10H6l6-6z" />
    </svg>
  );
}

/**
 * DeltaPill
 * Positive/negative delta indicator with arrow + color + text.
 */
export function DeltaPill(props: DeltaPillProps) {
  const { direction, tone, className, children, ...rest } = props;
  return (
    <span
      className={cn(deltaPillBaseClassName, deltaPillToneClassName[tone], className)}
      {...rest}
    >
      <Arrow direction={direction} />
      <span>{children}</span>
    </span>
  );
}


```

```typescript
export * from "./DeltaPill";
export type * from "./DeltaPill.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { DeltaPill } from "./DeltaPill";

const meta: Meta<typeof DeltaPill> = {
  title: "Data Display/DeltaPill",
  component: DeltaPill,
};
export default meta;

type Story = StoryObj<typeof DeltaPill>;

export const Examples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <DeltaPill direction="up" tone="success">
        +2.4%
      </DeltaPill>
      <DeltaPill direction="down" tone="danger">
        -1.1%
      </DeltaPill>
      <DeltaPill direction="flat" tone="neutral">
        0.0%
      </DeltaPill>
    </div>
  ),
};


```

```typescript
import type * as React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;


```

```typescript
/**
 * Spec: `design_system.json` -> components.dataDisplay.Skeleton.classes.base
 */
export const skeletonClassName =
  "animate-pulse rounded-xl bg-[var(--ui-surface-2)] dark:bg-white/10";


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { SkeletonProps } from "./Skeleton.types";
import { skeletonClassName } from "./Skeleton.styles";

/**
 * Skeleton
 * Loading placeholder blocks for cards/table/chart.
 *
 * A11y notes (spec):
 * - Mark parent region `aria-busy=true` while loading.
 * - Skeleton itself should be `aria-hidden=true`.
 */
export function Skeleton(props: SkeletonProps) {
  const { className, ...rest } = props;
  return <div aria-hidden="true" className={cn(skeletonClassName, className)} {...rest} />;
}


```

```typescript
export * from "./Skeleton";
export type * from "./Skeleton.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Data Display/Skeleton",
  component: Skeleton,
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  ),
};


```

```typescript
import type * as React from "react";

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "success" | "warning" | "danger";
};


```

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.dataDisplay.Alert.classes
 */
export const alertStyles = cva("rounded-2xl border p-4 flex gap-3", {
  variants: {
    tone: {
      info: "bg-[var(--ui-surface)] border-[var(--ui-border)] text-[var(--ui-text)]",
      success:
        "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-100",
      warning:
        "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/25 dark:text-amber-100",
      danger:
        "bg-red-50 border-red-200 text-red-900 dark:bg-red-500/10 dark:border-red-500/25 dark:text-red-100",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { AlertProps } from "./Alert.types";
import { alertStyles } from "./Alert.styles";

/**
 * Alert
 * Inline alert banner for errors/warnings/info.
 *
 * A11y notes (spec):
 * - Use `role="status"` for info/success.
 * - Use `role="alert"` for danger when immediate attention required.
 */
export function Alert(props: AlertProps) {
  const { tone = "info", className, ...rest } = props;
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div role={role} className={cn(alertStyles({ tone }), className)} {...rest} />
  );
}


```

```typescript
export * from "./Alert";
export type * from "./Alert.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Data Display/Alert",
  component: Alert,
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Tones: Story = {
  render: () => (
    <div className="space-y-3">
      <Alert tone="info">Info alert — portfolio refreshed.</Alert>
      <Alert tone="success">Success alert — export complete.</Alert>
      <Alert tone="warning">Warning alert — data may be delayed.</Alert>
      <Alert tone="danger">Danger alert — connection lost.</Alert>
    </div>
  ),
};


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import type { ButtonProps } from "./Button.types";
import { buttonStyles } from "./Button.styles";

function Spinner(props: { className?: string }) {
  const { className } = props;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}

/**
 * Button
 * Primary action; supports variants, sizes, loading state, icons.
 *
 * A11y notes (spec):
 * - When `loading=true`: set `aria-busy=true`; consider `aria-disabled=true` and keep width stable.
 * - For icon-only usage: use `IconButton` instead.
 */
export function Button(props: ButtonProps) {
  const {
    asChild,
    className,
    size,
    variant,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...rest
  } = props;

  const Comp = asChild ? Slot : "button";
  const isDisabled = !!disabled || loading;

  return (
    <Comp
      className={cn(buttonStyles({ size, variant }), className)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={!asChild ? isDisabled : undefined}
      {...rest}
    >
      {/* Reserve icon space to keep width stable while loading */}
      <span className="inline-flex items-center justify-center">
        {loading ? <Spinner /> : leftIcon}
      </span>
      <span className="truncate">{children}</span>
      <span className="inline-flex items-center justify-center">{rightIcon}</span>
    </Comp>
  );
}

```

Brock — I followed `src/components/design_system.json` and **built the full component set under `src/components/`**, each in its own folder with `index.ts`, `*.tsx`, `*.types.ts`, `*.styles.ts`, and a matching `*.stories.tsx`.

### What you have now (components + stories)
- **Primitives**: `Container`, `Stack`, `Inline`, `Card` (+ `CardHeader`/`CardBody`/`CardFooter`), `Heading`, `Text`, `Divider`
- **Controls**: `Button`, `IconButton`, `Badge`, `Chip`, `Input`, `Select`, `Combobox`
- **Navigation/Overlays**: `Tabs` (+ `TabsList`/`TabsTrigger`/`TabsContent`), `DropdownMenu` (+ `Trigger`/`Content`/`Item`/`Separator`), `Modal`, `Tooltip`
- **Data display**: `Table` (+ `TableHead`/`TableBody`/`TableRow`/`TableHeadCell`/`TableCell`), `Stat`, `DeltaPill`, `Skeleton`, `Alert`

You can import everything from the barrel:

```1:24:src/components/index.ts
export * from "./Alert";
export * from "./Badge";
export * from "./Button";
export * from "./Card";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./Modal";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Tooltip";
```

### Important foundation update (so components render correctly)
Your global CSS variables are now aligned to the spec’s `--ui-*` contract:

```17:53:src/App.css
/**
 * Semantic color system contract (see `src/components/design_system.json` -> foundations.themingStrategy.cssVariables).
 * These variables are what our components read (via `var(--...)`) so light/dark stays consistent.
 */
:root {
  --ui-bg: #ffffff;
  --ui-surface: #f7f9fc;
  --ui-surface-2: #eef3f9;
  --ui-border: rgba(8, 22, 57, 0.12);
  --ui-border-strong: rgba(8, 22, 57, 0.18);
  --ui-text: #081639;
  --ui-text-muted: rgba(8, 22, 57, 0.72);
  --ui-text-subtle: rgba(8, 22, 57, 0.56);
  --ui-primary: #00aeef;
  --ui-primary-ink: #081639;
  --ui-accent: #aea1ed;
  --ui-focus: #00aeef;
  --ui-inverse-bg: #081639;
  --ui-inverse-text: #ffffff;
}

.dark {
  --ui-bg: #070f24;
  --ui-surface: rgba(255, 255, 255, 0.06);
  --ui-surface-2: rgba(255, 255, 255, 0.09);
  --ui-border: rgba(255, 255, 255, 0.12);
  --ui-border-strong: rgba(255, 255, 255, 0.18);
  --ui-text: rgba(255, 255, 255, 0.92);
  --ui-text-muted: rgba(255, 255, 255, 0.72);
  --ui-text-subtle: rgba(255, 255, 255, 0.56);
  --ui-primary: #00aeef;
  --ui-primary-ink: #081639;
  --ui-accent: #aea1ed;
  --ui-focus: #c1dcee;
  --ui-inverse-bg: #081639;
  --ui-inverse-text: #ffffff;
}
```

### Example: spec-aligned a11y behavior
- **Button** sets `aria-busy` + stabilizes width on loading:

```20:61:src/components/Button/Button.tsx
/**
 * Button
 * Primary action; supports variants, sizes, loading state, icons.
 *
 * A11y notes (spec):
 * - When `loading=true`: set `aria-busy=true`; consider `aria-disabled=true` and keep width stable.
 * - For icon-only usage: use `IconButton` instead.
 */
export function Button(props: ButtonProps) {
  // ...
  return (
    <Comp
      className={cn(buttonStyles({ size, variant }), className)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={!asChild ? isDisabled : undefined}
      {...rest}
    >
      {/* Reserve icon space to keep width stable while loading */}
      <span className="inline-flex items-center justify-center">
        {loading ? <Spinner /> : leftIcon}
      </span>
      <span className="truncate">{children}</span>
      <span className="inline-flex items-center justify-center">{rightIcon}</span>
    </Comp>
  );
}
```

- **Modal** traps focus + restores focus + enforces `aria-labelledby`/`aria-describedby`:

```15:134:src/components/Modal/Modal.tsx
/**
 * Modal
 * Accessible modal dialog for confirmations and forms.
 *
 * A11y notes (spec):
 * - Trap focus inside; restore focus on close.
 * - Esc closes unless explicitly disabled.
 * - `aria-labelledby` and `aria-describedby` are required (enforced via props).
 */
export function Modal(props: ModalProps) {
  // ...
  return (
    <Portal>
      <div className={modalOverlayClassName} onMouseDown={(e) => { /* overlay close */ }} />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(modalContentClassName)}
      >
        {/* header/title/description + body + footer */}
      </div>
    </Portal>
  );
}
```

### Quick note (analogy)
Think of `design_system.json` as the “blueprint” and these components as the “prefab parts” built to that blueprint—now you can assemble screens quickly without re-deciding spacing, typography, focus rings, or dark-mode rules each time.

If you want, tell me which components you’d like **additional variants/props** for first (e.g. `Table` density, `Modal` sizes, `DropdownMenu` align/side), and I’ll extend them while staying inside the spec.

```typescript
export * from "./Alert";
export * from "./Badge";
export * from "./Button";
export * from "./Card";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./Modal";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Tooltip";
```

```css
/**
 * Semantic color system contract (see `src/components/design_system.json` -> foundations.themingStrategy.cssVariables).
 * These variables are what our components read (via `var(--...)`) so light/dark stays consistent.
 */
:root {
  --ui-bg: #ffffff;
  --ui-surface: #f7f9fc;
  --ui-surface-2: #eef3f9;
  --ui-border: rgba(8, 22, 57, 0.12);
  --ui-border-strong: rgba(8, 22, 57, 0.18);
  --ui-text: #081639;
  --ui-text-muted: rgba(8, 22, 57, 0.72);
  --ui-text-subtle: rgba(8, 22, 57, 0.56);
  --ui-primary: #00aeef;
  --ui-primary-ink: #081639;
  --ui-accent: #aea1ed;
  --ui-focus: #00aeef;
  --ui-inverse-bg: #081639;
  --ui-inverse-text: #ffffff;
}

.dark {
  --ui-bg: #070f24;
  --ui-surface: rgba(255, 255, 255, 0.06);
  --ui-surface-2: rgba(255, 255, 255, 0.09);
  --ui-border: rgba(255, 255, 255, 0.12);
  --ui-border-strong: rgba(255, 255, 255, 0.18);
  --ui-text: rgba(255, 255, 255, 0.92);
  --ui-text-muted: rgba(255, 255, 255, 0.72);
  --ui-text-subtle: rgba(255, 255, 255, 0.56);
  --ui-primary: #00aeef;
  --ui-primary-ink: #081639;
  --ui-accent: #aea1ed;
  --ui-focus: #c1dcee;
  --ui-inverse-bg: #081639;
  --ui-inverse-text: #ffffff;
}
```

```typescriptreact
/**
 * Button
 * Primary action; supports variants, sizes, loading state, icons.
 *
 * A11y notes (spec):
 * - When `loading=true`: set `aria-busy=true`; consider `aria-disabled=true` and keep width stable.
 * - For icon-only usage: use `IconButton` instead.
 */
export function Button(props: ButtonProps) {
  // ...
  return (
    <Comp
      className={cn(buttonStyles({ size, variant }), className)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={!asChild ? isDisabled : undefined}
      {...rest}
    >
      {/* Reserve icon space to keep width stable while loading */}
      <span className="inline-flex items-center justify-center">
        {loading ? <Spinner /> : leftIcon}
      </span>
      <span className="truncate">{children}</span>
      <span className="inline-flex items-center justify-center">{rightIcon}</span>
    </Comp>
  );
}
```

```typescriptreact
/**
 * Modal
 * Accessible modal dialog for confirmations and forms.
 *
 * A11y notes (spec):
 * - Trap focus inside; restore focus on close.
 * - Esc closes unless explicitly disabled.
 * - `aria-labelledby` and `aria-describedby` are required (enforced via props).
 */
export function Modal(props: ModalProps) {
  // ...
  return (
    <Portal>
      <div className={modalOverlayClassName} onMouseDown={(e) => { /* overlay close */ }} />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(modalContentClassName)}
      >
        {/* header/title/description + body + footer */}
      </div>
    </Portal>
  );
}
```

---

**User**

There are some issues in @src/components/Button/Button.stories.tsx can you take another look at it?

---

**Cursor**

Brock, yep — that file has two separate Storybook definitions smashed together (duplicate imports, duplicate `meta`, duplicate `Story` type, and two different prop APIs: `variant/size` vs `intent/width`). I’m going to rewrite it into a single clean CSF file that matches the **current `Button` props** (`variant`, `size`, `loading`, `leftIcon`, `rightIcon`).

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Controls/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "inverse"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

function CircleIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="currentColor"
    >
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
    >
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="inverse">Inverse</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button loading>Saving…</Button>
      <Button variant="secondary" loading>
        Loading…
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    children: "With icons",
    leftIcon: <CircleIcon />,
    rightIcon: <ChevronRightIcon />,
  },
};

```

Brock, you were right — `src/components/Button/Button.stories.tsx` had **two different stories files concatenated together** (duplicate imports/meta/default export and stale props like `intent`/`width` that don’t exist on the current `Button`).

It’s now cleaned up to a **single** Storybook CSF file that matches the current `Button` API:
- Uses **`variant`** + **`size`** + **`loading`** + **`leftIcon/rightIcon`**
- Removes the old `intent/width` argTypes entirely
- Keeps stories: **Default**, **Variants**, **Sizes**, **Loading**, **WithIcons**

Here’s the fixed file for reference:

```1:110:src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Controls/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "inverse"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

function CircleIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="currentColor"
    >
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
    >
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="inverse">Inverse</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button loading>Saving…</Button>
      <Button variant="secondary" loading>
        Loading…
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    children: "With icons",
    leftIcon: <CircleIcon />,
    rightIcon: <ChevronRightIcon />,
  },
};
```

**ELI5 TLDR**: The story file was like having two instruction manuals stapled together for two different buttons; I separated out the wrong one and kept the one that matches the button you actually built.

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Controls/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "inverse"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

function CircleIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="currentColor"
    >
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
    >
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="inverse">Inverse</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button loading>Saving…</Button>
      <Button variant="secondary" loading>
        Loading…
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    children: "With icons",
    leftIcon: <CircleIcon />,
    rightIcon: <ChevronRightIcon />,
  },
};
```

---

**User**

The dropdown arrow of the select is too far to the right. See screenshot 

---

**Cursor**

Got it Brock — right now we’re relying on the browser’s native select chevron, which tends to hug the far-right edge (especially on wide inputs). Plan: I’ll switch `Select` to `appearance-none` and add a **custom chevron icon** positioned `right-3` with extra `pr-10` padding so the arrow sits neatly inside the field, consistent across browsers.

```typescript
import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Select.classes.base
 */
export const selectStyles = cva(
  [
    // Base
    "w-full h-10 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]",
    "px-3 pr-10 text-sm text-[var(--ui-text)]",
    // Match input focus behavior
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
    // Hide the native arrow; we render our own chevron for consistent alignment.
    "appearance-none",
    // Disabled parity with Input
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ")
);



```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { SelectProps } from "./Select.types";
import { selectStyles } from "./Select.styles";

/**
 * Select
 * Native select styled to match inputs (accessible and simple).
 *
 * A11y notes (spec):
 * - Prefer native `<select>` unless requirements demand searchable combobox.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <div className="relative">
        <select ref={ref} className={cn(selectStyles(), className)} {...rest}>
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ui-text-muted)]"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);



```

Brock, fixed. The native select chevron was hugging the far-right edge; I switched `Select` to render a **custom chevron** inset with `right-3` and added `pr-10` so the text never collides with it.

### Changes
- **`Select` now wraps the `<select>` in a `relative` container and renders a decorative chevron**.
- **`Select` styles now include** `appearance-none` + `pr-10` + focus ring parity with `Input`.

Code refs:

```6:19:src/components/Select/Select.styles.ts
export const selectStyles = cva(
  [
    // Base
    "w-full h-10 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]",
    "px-3 pr-10 text-sm text-[var(--ui-text)]",
    // Match input focus behavior
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
    // Hide the native arrow; we render our own chevron for consistent alignment.
    "appearance-none",
    // Disabled parity with Input
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ")
);
```

```13:39:src/components/Select/Select.tsx
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <div className="relative">
        <select ref={ref} className={cn(selectStyles(), className)} {...rest}>
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ui-text-muted)]"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);
```

**ELI5 TLDR**: We took the “built-in arrow” that sits at the edge of the box and replaced it with our own arrow sticker placed a little inward, so it looks aligned and consistent.

```typescript
export const selectStyles = cva(
  [
    // Base
    "w-full h-10 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]",
    "px-3 pr-10 text-sm text-[var(--ui-text)]",
    // Match input focus behavior
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
    // Hide the native arrow; we render our own chevron for consistent alignment.
    "appearance-none",
    // Disabled parity with Input
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ")
);
```

```typescriptreact
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <div className="relative">
        <select ref={ref} className={cn(selectStyles(), className)} {...rest}>
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ui-text-muted)]"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);
```

---

**User**

Can we create some chart components now that I have added in recharts as our charting library?

---

**Cursor**

Brock, yes. Plan: I’ll confirm `recharts` is installed + see how you want charts to look in light/dark, then I’ll build a small **chart kit**: a shared `ChartContainer` + `ChartTooltip`, and 2–3 core charts (Line/Area/Bar) with strong TS typing and Storybook stories so you can iterate visually. If anything is unclear (like data shape / required interactions), I’ll stop and ask before over-building.

Nice — `recharts@3.6.0` is already installed, so we can start building charts immediately. Next I’ll add a small “chart kit” with consistent theming (semantic CSS vars), plus Storybook stories so we can iterate on spacing/labels like tuning an instrument.

```typescript
import type * as React from "react";

export type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional title displayed above the chart.
   */
  title?: React.ReactNode;
  /**
   * Optional supporting text displayed below the title.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional right-side header actions (buttons, select, etc.).
   */
  actions?: React.ReactNode;
};


```

```typescript
import { cva } from "class-variance-authority";

/**
 * ChartContainer
 * Executive-friendly chart surface: soft border, subtle background, predictable padding.
 */
export const chartContainerStyles = cva(
  "rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-6"
);

export const chartHeaderStyles = cva("mb-4 flex items-start justify-between gap-4");
export const chartTitleStyles = cva(
  "font-[var(--font-brand)] text-base font-semibold text-[var(--ui-text)]"
);
export const chartSubtitleStyles = cva("text-sm text-[var(--ui-text-muted)]");


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { ChartContainerProps } from "./ChartContainer.types";
import {
  chartContainerStyles,
  chartHeaderStyles,
  chartSubtitleStyles,
  chartTitleStyles,
} from "./ChartContainer.styles";

/**
 * ChartContainer
 * A consistent surface and header for Recharts visualizations.
 */
export function ChartContainer(props: ChartContainerProps) {
  const { title, subtitle, actions, className, children, ...rest } = props;

  return (
    <section className={cn(chartContainerStyles(), className)} {...rest}>
      {(title || subtitle || actions) && (
        <header className={chartHeaderStyles()}>
          <div className="min-w-0">
            {title ? <div className={chartTitleStyles()}>{title}</div> : null}
            {subtitle ? (
              <div className={chartSubtitleStyles()}>{subtitle}</div>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      )}

      {children}
    </section>
  );
}


```

```typescript
export * from "./ChartContainer";
export type * from "./ChartContainer.types";


```

```typescript
import type * as React from "react";

export type ChartTooltipItem = {
  name: string;
  value: string | number;
  color?: string;
};

export type ChartTooltipProps = {
  /**
   * Whether the tooltip is currently active (provided by Recharts).
   */
  active?: boolean;
  /**
   * Tooltip label (typically the x-axis value).
   */
  label?: string | number;
  /**
   * Tooltip payload items (derived from Recharts payload).
   */
  items?: readonly ChartTooltipItem[];
  /**
   * Optional label formatter.
   */
  labelFormatter?: (label: string | number) => React.ReactNode;
  /**
   * Optional value formatter.
   */
  valueFormatter?: (value: string | number) => React.ReactNode;
  /**
   * Optional className override.
   */
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import type { ChartTooltipProps } from "./ChartTooltip.types";

/**
 * ChartTooltip
 * A small, executive-friendly tooltip surface that matches our semantic color system.
 */
export function ChartTooltip(props: ChartTooltipProps) {
  const {
    active,
    label,
    items,
    labelFormatter,
    valueFormatter,
    className,
  } = props;

  if (!active || !items || items.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] shadow-md shadow-black/10",
        "px-3 py-2 text-sm text-[var(--ui-text)]",
        className
      )}
    >
      {label !== undefined ? (
        <div className="mb-2 text-xs font-semibold text-[var(--ui-text-muted)]">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      ) : null}

      <div className="space-y-1">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: it.color ?? "var(--ui-primary)" }}
              />
              <span className="truncate">{it.name}</span>
            </div>
            <span className="font-semibold">
              {valueFormatter ? valueFormatter(it.value) : it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


```

```typescript
export * from "./ChartTooltip";
export type * from "./ChartTooltip.types";


```

```typescript
/**
 * Shared helpers/types for our Recharts components.
 */

export type DatumKey<T> = Extract<keyof T, string>;

export type ChartSeries<T> = {
  /**
   * Property name on each datum to read values from.
   */
  key: DatumKey<T>;
  /**
   * Display name for legends/tooltips.
   */
  name: string;
  /**
   * CSS color for the series (supports `var(--...)`).
   */
  color?: string;
};

export type ChartAxisTickFormatter = (value: string | number) => string;

/**
 * Converts a value to a label-friendly string.
 */
export function toTick(value: string | number): string {
  return typeof value === "number" ? String(value) : value;
}


```

```typescript
import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type LineChartProps<TDatum extends Record<string, unknown>> = {
  /**
   * Data array for the chart.
   */
  data: readonly TDatum[];
  /**
   * X-axis key.
   */
  xKey: DatumKey<TDatum>;
  /**
   * Series definitions (one Line per series).
   */
  series: readonly ChartSeries<TDatum>[];
  /**
   * Fixed height in pixels.
   * @defaultValue 260
   */
  height?: number;
  /**
   * Show cartesian grid.
   * @defaultValue true
   */
  grid?: boolean;
  /**
   * Show legend.
   * @defaultValue false
   */
  legend?: boolean;
  /**
   * Format ticks for x axis.
   */
  xTickFormatter?: ChartAxisTickFormatter;
  /**
   * Format ticks for y axis.
   */
  yTickFormatter?: ChartAxisTickFormatter;
  /**
   * Optional tooltip label formatter.
   */
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  /**
   * Optional tooltip value formatter.
   */
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  /**
   * Optional className for the wrapper.
   */
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";
import { toTick, type DatumKey } from "../_internal/charts";
import type { LineChartProps } from "./LineChart.types";

type RechartsPayloadEntry = {
  name?: unknown;
  value?: unknown;
  color?: unknown;
  dataKey?: unknown;
};

function isTooltipItem(value: unknown): value is ChartTooltipItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    (typeof v.value === "number" || typeof v.value === "string")
  );
}

function toTooltipItems(payload: readonly unknown[]): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];
  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as RechartsPayloadEntry;
    const name =
      typeof e.name === "string"
        ? e.name
        : typeof e.dataKey === "string"
          ? e.dataKey
          : "Series";
    const value = e.value;
    if (typeof value !== "number" && typeof value !== "string") continue;
    items.push({
      name,
      value,
      color: typeof e.color === "string" ? e.color : undefined,
    });
  }
  return items;
}

/**
 * LineChart
 * A typed, theme-aligned Recharts line chart.
 */
export function LineChart<TDatum extends Record<string, unknown>>(
  props: LineChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--ui-border-strong)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={toTooltipItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./LineChart";
export type * from "./LineChart.types";


```

```typescriptreact
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";
import { toTick, type DatumKey } from "../_internal/charts";
import type { LineChartProps } from "./LineChart.types";

type RechartsPayloadEntry = {
  name?: unknown;
  value?: unknown;
  color?: unknown;
  dataKey?: unknown;
};

function toTooltipItems(payload: readonly unknown[]): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];
  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as RechartsPayloadEntry;
    const name =
      typeof e.name === "string"
        ? e.name
        : typeof e.dataKey === "string"
          ? e.dataKey
          : "Series";
    const value = e.value;
    if (typeof value !== "number" && typeof value !== "string") continue;
    items.push({
      name,
      value,
      color: typeof e.color === "string" ? e.color : undefined,
    });
  }
  return items;
}

/**
 * LineChart
 * A typed, theme-aligned Recharts line chart.
 */
export function LineChart<TDatum extends Record<string, unknown>>(
  props: LineChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--ui-border-strong)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={toTooltipItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}



```

```typescript
import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type AreaChartProps<TDatum extends Record<string, unknown>> = {
  data: readonly TDatum[];
  xKey: DatumKey<TDatum>;
  series: readonly ChartSeries<TDatum>[];
  height?: number;
  grid?: boolean;
  legend?: boolean;
  xTickFormatter?: ChartAxisTickFormatter;
  yTickFormatter?: ChartAxisTickFormatter;
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";
import { toTick, type DatumKey } from "../_internal/charts";
import type { AreaChartProps } from "./AreaChart.types";

type RechartsPayloadEntry = {
  name?: unknown;
  value?: unknown;
  color?: unknown;
  dataKey?: unknown;
};

function toTooltipItems(payload: readonly unknown[]): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];
  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as RechartsPayloadEntry;
    const name =
      typeof e.name === "string"
        ? e.name
        : typeof e.dataKey === "string"
          ? e.dataKey
          : "Series";
    const value = e.value;
    if (typeof value !== "number" && typeof value !== "string") continue;
    items.push({
      name,
      value,
      color: typeof e.color === "string" ? e.color : undefined,
    });
  }
  return items;
}

/**
 * AreaChart
 * A typed, theme-aligned Recharts area chart.
 */
export function AreaChart<TDatum extends Record<string, unknown>>(
  props: AreaChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--ui-border-strong)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={toTooltipItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              fill={s.color ?? "var(--ui-primary)"}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./AreaChart";
export type * from "./AreaChart.types";


```

```typescript
import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type BarChartProps<TDatum extends Record<string, unknown>> = {
  data: readonly TDatum[];
  xKey: DatumKey<TDatum>;
  series: readonly ChartSeries<TDatum>[];
  height?: number;
  grid?: boolean;
  legend?: boolean;
  xTickFormatter?: ChartAxisTickFormatter;
  yTickFormatter?: ChartAxisTickFormatter;
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";
import { toTick, type DatumKey } from "../_internal/charts";
import type { BarChartProps } from "./BarChart.types";

type RechartsPayloadEntry = {
  name?: unknown;
  value?: unknown;
  color?: unknown;
  dataKey?: unknown;
};

function toTooltipItems(payload: readonly unknown[]): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];
  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as RechartsPayloadEntry;
    const name =
      typeof e.name === "string"
        ? e.name
        : typeof e.dataKey === "string"
          ? e.dataKey
          : "Series";
    const value = e.value;
    if (typeof value !== "number" && typeof value !== "string") continue;
    items.push({
      name,
      value,
      color: typeof e.color === "string" ? e.color : undefined,
    });
  }
  return items;
}

/**
 * BarChart
 * A typed, theme-aligned Recharts bar chart.
 */
export function BarChart<TDatum extends Record<string, unknown>>(
  props: BarChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(8,22,57,0.04)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={toTooltipItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color ?? "var(--ui-primary)"}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./BarChart";
export type * from "./BarChart.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { LineChart } from "./LineChart";

type Datum = { month: string; revenue: number; expenses: number };

const data: readonly Datum[] = [
  { month: "Jan", revenue: 120, expenses: 80 },
  { month: "Feb", revenue: 140, expenses: 90 },
  { month: "Mar", revenue: 160, expenses: 110 },
  { month: "Apr", revenue: 155, expenses: 105 },
  { month: "May", revenue: 175, expenses: 120 },
  { month: "Jun", revenue: 190, expenses: 125 },
];

const meta: Meta<typeof LineChart<Datum>> = {
  title: "Charts/LineChart",
  component: LineChart,
};
export default meta;

type Story = StoryObj<typeof LineChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Revenue vs Expenses" subtitle="Last 6 months">
      <LineChart
        data={data}
        xKey="month"
        series={[
          { key: "revenue", name: "Revenue", color: "var(--ui-primary)" },
          { key: "expenses", name: "Expenses", color: "var(--ui-accent)" },
        ]}
        legend
        yTickFormatter={(v) => (typeof v === "number" ? `$${v}k` : String(v))}
      />
    </ChartContainer>
  ),
};


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { AreaChart } from "./AreaChart";

type Datum = { month: string; aum: number };

const data: readonly Datum[] = [
  { month: "Jan", aum: 2.4 },
  { month: "Feb", aum: 2.55 },
  { month: "Mar", aum: 2.7 },
  { month: "Apr", aum: 2.62 },
  { month: "May", aum: 2.85 },
  { month: "Jun", aum: 3.05 },
];

const meta: Meta<typeof AreaChart<Datum>> = {
  title: "Charts/AreaChart",
  component: AreaChart,
};
export default meta;

type Story = StoryObj<typeof AreaChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="AUM" subtitle="Billions USD">
      <AreaChart
        data={data}
        xKey="month"
        series={[{ key: "aum", name: "AUM", color: "var(--ui-primary)" }]}
        yTickFormatter={(v) => (typeof v === "number" ? `$${v.toFixed(1)}B` : String(v))}
      />
    </ChartContainer>
  ),
};


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { BarChart } from "./BarChart";

type Datum = { quarter: string; pnl: number };

const data: readonly Datum[] = [
  { quarter: "Q1", pnl: 12.4 },
  { quarter: "Q2", pnl: 8.1 },
  { quarter: "Q3", pnl: 15.2 },
  { quarter: "Q4", pnl: 11.6 },
];

const meta: Meta<typeof BarChart<Datum>> = {
  title: "Charts/BarChart",
  component: BarChart,
};
export default meta;

type Story = StoryObj<typeof BarChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Quarterly P&L" subtitle="Percent">
      <BarChart
        data={data}
        xKey="quarter"
        series={[{ key: "pnl", name: "P&L", color: "var(--ui-primary)" }]}
        yTickFormatter={(v) => (typeof v === "number" ? `${v}%` : String(v))}
      />
    </ChartContainer>
  ),
};


```

```typescript
export * from "./Alert";
export * from "./AreaChart";
export * from "./Badge";
export * from "./BarChart";
export * from "./Button";
export * from "./Card";
export * from "./ChartContainer";
export * from "./ChartTooltip";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./LineChart";
export * from "./Modal";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Tooltip";

```

Yes Brock — I added a first **Recharts-based chart kit** under `src/components/`, aligned with your design-system semantics (uses `var(--ui-*)` for colors/borders) and with Storybook stories.

### What I created
- **Shared primitives**
  - `ChartContainer`: consistent card-like chart surface + header
  - `ChartTooltip`: consistent tooltip styling (semantic vars)
- **Core charts**
  - `LineChart` (multi-series)
  - `AreaChart` (multi-series)
  - `BarChart` (multi-series)

Each chart is **strongly typed** (generic `TDatum`) and uses a `series` config like:

- `{ key: "revenue", name: "Revenue", color: "var(--ui-primary)" }`

### Stories
- `Charts/LineChart` → `src/components/LineChart/LineChart.stories.tsx`
- `Charts/AreaChart` → `src/components/AreaChart/AreaChart.stories.tsx`
- `Charts/BarChart` → `src/components/BarChart/BarChart.stories.tsx`

### Exports
All new components are exported from `src/components/index.ts` (so you can `import { LineChart, ChartContainer } from "@/components"`).

---

🛑 Before continuing, I would like to gather some clarifying information from you. 🛑
- **Which chart types do you want next**: Pie/Donut, Stacked Bar, Sparkline, Time-series (with brush/zoom)?
- **Tooltip + formatting rules**: do you want built-in formatters (currency/percent/date), or should all formatting always be passed in?
- **Interactions**: should charts support click-to-select (e.g., set a filter), or just hover tooltips for now?

**ELI5 TLDR**: I built you three “chart building blocks” (line/area/bar) plus a nice chart “frame” and tooltip so all charts look consistent; tell me which chart shapes and behaviors you want next.

---

**User**

I definitely want Pie/Donut, stacked bar as well. Also Radar and maybe TreeMap too. 
I'm not sure about formmatters, what do you think?
We should only wory about hover tooltips for now. 


---

**Cursor**

Got it Brock. Next I’ll add **Pie/Donut**, **StackedBar**, **Radar**, and **Treemap** components using the same patterns as the existing charts (semantic vars + typed `series` configs + our `ChartTooltip`). For formatters: I’ll keep charts “dumb” (no currency/percent guesses) and expose `tickFormatter` + `tooltipValueFormatter` props everywhere, so you can plug in `Intl.NumberFormat` per screen without baking in business assumptions.

```typescript
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";

type RechartsPayloadEntry = {
  name?: unknown;
  value?: unknown;
  color?: unknown;
  dataKey?: unknown;
};

/**
 * Safely converts Recharts tooltip payload to our internal tooltip item format.
 * Recharts' types intentionally use `any` for payload, so we treat it as `unknown`.
 */
export function rechartsPayloadToItems(
  payload: readonly unknown[],
  fallbackSeriesName = "Series"
): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];

  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as RechartsPayloadEntry;

    const name =
      typeof e.name === "string"
        ? e.name
        : typeof e.dataKey === "string"
          ? e.dataKey
          : fallbackSeriesName;

    const value = e.value;
    if (typeof value !== "number" && typeof value !== "string") continue;

    items.push({
      name,
      value,
      color: typeof e.color === "string" ? e.color : undefined,
    });
  }

  return items;
}


```

```typescriptreact
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import { toTick, type DatumKey } from "../_internal/charts";
import type { LineChartProps } from "./LineChart.types";

/**
 * LineChart
 * A typed, theme-aligned Recharts line chart.
 */
export function LineChart<TDatum extends Record<string, unknown>>(
  props: LineChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--ui-border-strong)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}



```

```typescriptreact
import * as React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import { toTick, type DatumKey } from "../_internal/charts";
import type { AreaChartProps } from "./AreaChart.types";

/**
 * AreaChart
 * A typed, theme-aligned Recharts area chart.
 */
export function AreaChart<TDatum extends Record<string, unknown>>(
  props: AreaChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--ui-border-strong)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              fill={s.color ?? "var(--ui-primary)"}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}



```

```typescriptreact
import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import { toTick, type DatumKey } from "../_internal/charts";
import type { BarChartProps } from "./BarChart.types";

/**
 * BarChart
 * A typed, theme-aligned Recharts bar chart.
 */
export function BarChart<TDatum extends Record<string, unknown>>(
  props: BarChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(8,22,57,0.04)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color ?? "var(--ui-primary)"}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}



```

```typescript
import type * as React from "react";
import type { DatumKey } from "../_internal/charts";

export type PieDonutChartProps<TDatum extends Record<string, unknown>> = {
  /**
   * Data array for the chart.
   */
  data: readonly TDatum[];
  /**
   * Key for slice labels.
   */
  nameKey: DatumKey<TDatum>;
  /**
   * Key for slice values.
   */
  valueKey: DatumKey<TDatum>;
  /**
   * Fixed height in pixels.
   * @defaultValue 260
   */
  height?: number;
  /**
   * Chart variant.
   * @defaultValue "donut"
   */
  variant?: "pie" | "donut";
  /**
   * Inner radius (overrides default donut radius when variant="donut").
   */
  innerRadius?: number;
  /**
   * Outer radius.
   */
  outerRadius?: number;
  /**
   * Colors used for slices (cycled).
   */
  colors?: readonly string[];
  /**
   * Tooltip label/value formatters.
   */
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import type { DatumKey } from "../_internal/charts";
import type { PieDonutChartProps } from "./PieDonutChart.types";

const DEFAULT_COLORS = [
  "var(--ui-primary)",
  "var(--ui-accent)",
  "color-mix(in oklab, var(--ui-primary) 60%, white 40%)",
  "color-mix(in oklab, var(--ui-accent) 60%, white 40%)",
] as const;

/**
 * PieDonutChart
 * A typed, theme-aligned Pie/Donut chart (hover tooltip only).
 */
export function PieDonutChart<TDatum extends Record<string, unknown>>(
  props: PieDonutChartProps<TDatum>
) {
  const {
    data,
    nameKey,
    valueKey,
    height = 260,
    variant = "donut",
    innerRadius,
    outerRadius,
    colors = DEFAULT_COLORS,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const nameDataKey = nameKey as DatumKey<TDatum>;
  const valueDataKey = valueKey as DatumKey<TDatum>;

  const derivedOuter = outerRadius ?? 90;
  const derivedInner =
    variant === "donut" ? (innerRadius ?? Math.round(derivedOuter * 0.62)) : 0;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          <Pie
            data={data}
            dataKey={valueDataKey}
            nameKey={nameDataKey}
            innerRadius={derivedInner}
            outerRadius={derivedOuter}
            stroke="var(--ui-bg)"
            strokeWidth={2}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length] ?? "var(--ui-primary)"} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./PieDonutChart";
export type * from "./PieDonutChart.types";


```

```typescript
import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type StackedBarChartProps<TDatum extends Record<string, unknown>> = {
  data: readonly TDatum[];
  xKey: DatumKey<TDatum>;
  series: readonly ChartSeries<TDatum>[];
  height?: number;
  grid?: boolean;
  legend?: boolean;
  xTickFormatter?: ChartAxisTickFormatter;
  yTickFormatter?: ChartAxisTickFormatter;
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  /**
   * Recharts stackId used for all series.
   * @defaultValue "stack"
   */
  stackId?: string;
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import { toTick, type DatumKey } from "../_internal/charts";
import type { StackedBarChartProps } from "./StackedBarChart.types";

/**
 * StackedBarChart
 * A typed, theme-aligned stacked bar chart (hover tooltip only).
 */
export function StackedBarChart<TDatum extends Record<string, unknown>>(
  props: StackedBarChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    stackId = "stack",
    className,
  } = props;

  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(8,22,57,0.04)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s, idx) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stackId={stackId}
              fill={s.color ?? "var(--ui-primary)"}
              radius={
                idx === series.length - 1 ? ([8, 8, 0, 0] as const) : undefined
              }
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./StackedBarChart";
export type * from "./StackedBarChart.types";


```

```typescript
import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type RadarChartProps<TDatum extends Record<string, unknown>> = {
  data: readonly TDatum[];
  /**
   * Key for the angle axis (category name).
   */
  angleKey: DatumKey<TDatum>;
  /**
   * Series definitions (one Radar per series).
   */
  series: readonly ChartSeries<TDatum>[];
  height?: number;
  grid?: boolean;
  legend?: boolean;
  angleTickFormatter?: ChartAxisTickFormatter;
  radiusTickFormatter?: ChartAxisTickFormatter;
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import { toTick, type DatumKey } from "../_internal/charts";
import type { RadarChartProps } from "./RadarChart.types";

/**
 * RadarChart
 * A typed, theme-aligned radar chart (hover tooltip only).
 */
export function RadarChart<TDatum extends Record<string, unknown>>(
  props: RadarChartProps<TDatum>
) {
  const {
    data,
    angleKey,
    series,
    height = 320,
    grid = true,
    legend = false,
    angleTickFormatter,
    radiusTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const angleDataKey = angleKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          {grid ? <PolarGrid stroke="var(--ui-border)" /> : null}

          <PolarAngleAxis
            dataKey={angleDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickFormatter={(v) =>
              angleTickFormatter
                ? angleTickFormatter(v as string | number)
                : toTick(v as string | number)
            }
          />

          <PolarRadiusAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickLine={false}
            tickFormatter={(v) =>
              radiusTickFormatter
                ? radiusTickFormatter(v as string | number)
                : toTick(v as string | number)
            }
          />

          <Tooltip
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />

          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}

          {series.map((s) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              fill={s.color ?? "var(--ui-primary)"}
              fillOpacity={0.12}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./RadarChart";
export type * from "./RadarChart.types";


```

```typescript
import type * as React from "react";

export type TreemapNode = {
  name: string;
  value: number;
  /**
   * Optional nested children.
   */
  children?: readonly TreemapNode[];
};

export type TreemapProps = {
  /**
   * Root-level nodes (can be hierarchical via children).
   */
  data: readonly TreemapNode[];
  /**
   * Fixed height in pixels.
   * @defaultValue 320
   */
  height?: number;
  /**
   * Colors used for leaf nodes (cycled).
   */
  colors?: readonly string[];
  /**
   * Tooltip value formatter.
   */
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


```

```typescriptreact
import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Treemap as RechartsTreemap,
} from "recharts";
import { cn } from "@lib/utils";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";
import type { TreemapNode, TreemapProps } from "./Treemap.types";

const DEFAULT_COLORS = [
  "var(--ui-primary)",
  "var(--ui-accent)",
  "color-mix(in oklab, var(--ui-primary) 65%, white 35%)",
  "color-mix(in oklab, var(--ui-accent) 65%, white 35%)",
] as const;

type ContentProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: unknown;
  value?: unknown;
  depth?: number;
};

function TreemapCell(props: ContentProps & { colors: readonly string[] }) {
  const { x, y, width, height, index, name, value, depth, colors } = props;
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  )
    return null;

  // Only style leaf nodes; parent groups are handled by Recharts layout.
  const isLeaf = (depth ?? 0) >= 1;
  const fill = colors[(index ?? 0) % colors.length] ?? "var(--ui-primary)";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={isLeaf ? 0.18 : 0.06}
        stroke="var(--ui-border)"
        strokeWidth={1}
        rx={10}
        ry={10}
      />
      {isLeaf && width > 60 && height > 28 ? (
        <text
          x={x + 10}
          y={y + 18}
          fill="var(--ui-text)"
          fontSize={12}
          fontWeight={600}
        >
          {typeof name === "string" ? name : ""}
        </text>
      ) : null}
      {isLeaf && width > 60 && height > 44 ? (
        <text
          x={x + 10}
          y={y + 36}
          fill="var(--ui-text-muted)"
          fontSize={11}
        >
          {typeof value === "number" ? value : ""}
        </text>
      ) : null}
    </g>
  );
}

type TooltipPayloadEntry = {
  name?: unknown;
  value?: unknown;
};

function toTreemapTooltipItems(payload: readonly unknown[]): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];
  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as TooltipPayloadEntry;
    if (typeof e.value !== "number" && typeof e.value !== "string") continue;
    items.push({
      name: typeof e.name === "string" ? e.name : "Value",
      value: e.value,
    });
  }
  return items;
}

/**
 * Treemap
 * A theme-aligned treemap. Best for composition breakdowns (sectors, allocations, etc.).
 */
export function Treemap(props: TreemapProps) {
  const {
    data,
    height = 320,
    colors = DEFAULT_COLORS,
    tooltipValueFormatter,
    className,
  } = props;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsTreemap
          data={data as readonly TreemapNode[]}
          dataKey="value"
          nameKey="name"
          stroke="var(--ui-border)"
          content={<TreemapCell colors={colors} />}
        >
          <Tooltip
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={toTreemapTooltipItems(p.payload as readonly unknown[])}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
        </RechartsTreemap>
      </ResponsiveContainer>
    </div>
  );
}


```

```typescript
export * from "./Treemap";
export type * from "./Treemap.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { PieDonutChart } from "./PieDonutChart";

type Datum = { name: string; value: number };

const data: readonly Datum[] = [
  { name: "Equities", value: 52 },
  { name: "Fixed Income", value: 28 },
  { name: "Alternatives", value: 14 },
  { name: "Cash", value: 6 },
];

const meta: Meta<typeof PieDonutChart<Datum>> = {
  title: "Charts/PieDonutChart",
  component: PieDonutChart,
};
export default meta;

type Story = StoryObj<typeof PieDonutChart<Datum>>;

export const Donut: Story = {
  render: () => (
    <ChartContainer title="Allocation" subtitle="By asset class">
      <PieDonutChart data={data} nameKey="name" valueKey="value" variant="donut" />
    </ChartContainer>
  ),
};

export const Pie: Story = {
  render: () => (
    <ChartContainer title="Allocation" subtitle="Pie variant">
      <PieDonutChart data={data} nameKey="name" valueKey="value" variant="pie" />
    </ChartContainer>
  ),
};


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { StackedBarChart } from "./StackedBarChart";

type Datum = { month: string; equities: number; fixedIncome: number; cash: number };

const data: readonly Datum[] = [
  { month: "Jan", equities: 52, fixedIncome: 36, cash: 12 },
  { month: "Feb", equities: 55, fixedIncome: 33, cash: 12 },
  { month: "Mar", equities: 58, fixedIncome: 30, cash: 12 },
  { month: "Apr", equities: 54, fixedIncome: 34, cash: 12 },
  { month: "May", equities: 56, fixedIncome: 32, cash: 12 },
];

const meta: Meta<typeof StackedBarChart<Datum>> = {
  title: "Charts/StackedBarChart",
  component: StackedBarChart,
};
export default meta;

type Story = StoryObj<typeof StackedBarChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Allocation Over Time" subtitle="Stacked bars">
      <StackedBarChart
        data={data}
        xKey="month"
        series={[
          { key: "equities", name: "Equities", color: "var(--ui-primary)" },
          { key: "fixedIncome", name: "Fixed Income", color: "var(--ui-accent)" },
          { key: "cash", name: "Cash", color: "var(--ui-surface-2)" },
        ]}
        legend
        yTickFormatter={(v) => (typeof v === "number" ? `${v}%` : String(v))}
      />
    </ChartContainer>
  ),
};


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { RadarChart } from "./RadarChart";

type Datum = {
  metric: string;
  portfolio: number;
  benchmark: number;
};

const data: readonly Datum[] = [
  { metric: "Risk", portfolio: 72, benchmark: 60 },
  { metric: "Return", portfolio: 68, benchmark: 62 },
  { metric: "Liquidity", portfolio: 80, benchmark: 74 },
  { metric: "Diversification", portfolio: 62, benchmark: 70 },
  { metric: "Cost", portfolio: 58, benchmark: 64 },
];

const meta: Meta<typeof RadarChart<Datum>> = {
  title: "Charts/RadarChart",
  component: RadarChart,
};
export default meta;

type Story = StoryObj<typeof RadarChart<Datum>>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Portfolio vs Benchmark" subtitle="Risk profile">
      <RadarChart
        data={data}
        angleKey="metric"
        series={[
          { key: "portfolio", name: "Portfolio", color: "var(--ui-primary)" },
          { key: "benchmark", name: "Benchmark", color: "var(--ui-accent)" },
        ]}
        legend
        radiusTickFormatter={(v) => (typeof v === "number" ? `${v}` : String(v))}
      />
    </ChartContainer>
  ),
};


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "../ChartContainer/ChartContainer";
import { Treemap } from "./Treemap";
import type { TreemapNode } from "./Treemap.types";

const data: readonly TreemapNode[] = [
  {
    name: "Equities",
    value: 52,
    children: [
      { name: "US", value: 28 },
      { name: "International", value: 16 },
      { name: "EM", value: 8 },
    ],
  },
  {
    name: "Fixed Income",
    value: 28,
    children: [
      { name: "Treasuries", value: 14 },
      { name: "Corp", value: 10 },
      { name: "High Yield", value: 4 },
    ],
  },
  { name: "Alternatives", value: 14 },
  { name: "Cash", value: 6 },
];

const meta: Meta<typeof Treemap> = {
  title: "Charts/Treemap",
  component: Treemap,
};
export default meta;

type Story = StoryObj<typeof Treemap>;

export const Default: Story = {
  render: () => (
    <ChartContainer title="Allocation Breakdown" subtitle="Treemap">
      <Treemap data={data} tooltipValueFormatter={(v) => `${v}%`} />
    </ChartContainer>
  ),
};


```

```typescript
export * from "./Alert";
export * from "./AreaChart";
export * from "./Badge";
export * from "./BarChart";
export * from "./Button";
export * from "./Card";
export * from "./ChartContainer";
export * from "./ChartTooltip";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./LineChart";
export * from "./Modal";
export * from "./PieDonutChart";
export * from "./RadarChart";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./StackedBarChart";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Treemap";
export * from "./Tooltip";

```

Brock, done — I added the chart components you asked for:

### New chart components (Recharts)
- **`PieDonutChart`** (`src/components/PieDonutChart/`)
  - Supports `variant: "pie" | "donut"` + `nameKey` + `valueKey` + optional `colors`
- **`StackedBarChart`** (`src/components/StackedBarChart/`)
  - Same `series` shape as the other charts, but stacked via a shared `stackId`
- **`RadarChart`** (`src/components/RadarChart/`)
  - Uses `angleKey` + `series` for radar overlays
- **`Treemap`** (`src/components/Treemap/`)
  - Uses typed hierarchical nodes (`TreemapNode`) and hover tooltip

Each has a `.stories.tsx` under its folder, and all are exported from `src/components/index.ts`:

```1:33:src/components/index.ts
export * from "./Alert";
export * from "./AreaChart";
export * from "./Badge";
export * from "./BarChart";
export * from "./Button";
export * from "./Card";
export * from "./ChartContainer";
export * from "./ChartTooltip";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./LineChart";
export * from "./Modal";
export * from "./PieDonutChart";
export * from "./RadarChart";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./StackedBarChart";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Treemap";
export * from "./Tooltip";
```

### Formatter recommendation
I’d **not** bake currency/percent/date rules into these components. Instead:
- **Pass formatters in** (`xTickFormatter`, `yTickFormatter`, `tooltipValueFormatter`, etc.)
- Use `Intl.NumberFormat` at the feature layer (where you know if it’s USD vs % vs basis points)

That keeps the chart kit reusable and avoids “wrong default formatting” surprises (like putting `$` on a percent).

**ELI5 TLDR**: We made more chart “shapes” (pie/donut, stacked bar, radar, treemap) and we’ll let each screen decide how numbers should look, so the chart kit doesn’t guess wrong.

```typescript
export * from "./Alert";
export * from "./AreaChart";
export * from "./Badge";
export * from "./BarChart";
export * from "./Button";
export * from "./Card";
export * from "./ChartContainer";
export * from "./ChartTooltip";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./LineChart";
export * from "./Modal";
export * from "./PieDonutChart";
export * from "./RadarChart";
export * from "./Select";
export * from "./Skeleton";
export * from "./Stack";
export * from "./StackedBarChart";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Treemap";
export * from "./Tooltip";
```

---

**User**

We also need a sidebar component. Model the architecture after the shadcn sidebar https://ui.shadcn.com/docs/components/sidebar 

---

**Cursor**

Got it, Brock. Plan: I’ll implement a **composable Sidebar system** (Provider + Trigger + Sidebar + Header/Content/Footer + Group/Menu primitives) that mirrors the shadcn/sidebar architecture, but styled with our semantic `--ui-*` tokens and no external UI libs. Then I’ll add a Storybook story demonstrating collapse-to-icons and standard menu composition, similar to the shadcn docs ([sidebar reference](https://ui.shadcn.com/docs/components/sidebar)).

```typescript
import type * as React from "react";

export type SidebarCollapsible = "offcanvas" | "icon";

export type SidebarProviderProps = {
  children: React.ReactNode;
  /**
   * Uncontrolled initial open state.
   * @defaultValue true
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Called when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
};

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * Controls the collapse behavior.
   * - "offcanvas": hide/show the sidebar.
   * - "icon": collapse to a narrow icon rail.
   * @defaultValue "icon"
   */
  collapsible?: SidebarCollapsible;
  /**
   * Sidebar width when expanded.
   * @defaultValue 280
   */
  width?: number;
  /**
   * Sidebar width when collapsed to icons.
   * @defaultValue 72
   */
  iconWidth?: number;
};

export type SidebarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Optional label for the trigger.
   */
  ariaLabel?: string;
};


```

```typescriptreact
import * as React from "react";
import { useControllableState } from "../_internal/useControllableState";
import type { SidebarProviderProps } from "./sidebar.types";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return ctx;
}

/**
 * SidebarProvider
 * Handles the sidebar open/collapsed state (controlled or uncontrolled).
 */
export function SidebarProvider(props: SidebarProviderProps) {
  const { children, open, defaultOpen = true, onOpenChange } = props;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const toggle = React.useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

  const value: SidebarContextValue = React.useMemo(
    () => ({ open: isOpen, setOpen: setIsOpen, toggle }),
    [isOpen, setIsOpen, toggle]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}


```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { useSidebar } from "./sidebar.context";
import type { SidebarProps, SidebarTriggerProps } from "./sidebar.types";

/**
 * Sidebar
 * A composable sidebar container modeled after the shadcn sidebar architecture.
 *
 * Notes:
 * - Uses semantic vars for colors/borders.
 * - Uses data attributes for stateful styling: `data-state`, `data-collapsible`.
 */
export function Sidebar(props: SidebarProps) {
  const {
    collapsible = "icon",
    width = 280,
    iconWidth = 72,
    className,
    ...rest
  } = props;

  const { open } = useSidebar();

  // CSS variables for easy theming/override (similar to shadcn approach).
  const styleVars = {
    ["--sidebar-width" as const]: `${width}px`,
    ["--sidebar-icon-width" as const]: `${iconWidth}px`,
  };

  const dataState = open ? "open" : "collapsed";

  return (
    <aside
      data-state={dataState}
      data-collapsible={collapsible}
      className={cn(
        "group/sidebar relative shrink-0",
        // base surface: slightly stronger separation than cards
        "border-r border-[var(--ui-border)] bg-[var(--ui-inverse-bg)] text-[var(--ui-inverse-text)]",
        "h-screen",
        // width behavior
        "w-[var(--sidebar-width)]",
        collapsible === "icon" &&
          "data-[state=collapsed]:w-[var(--sidebar-icon-width)]",
        collapsible === "offcanvas" &&
          "data-[state=collapsed]:-ml-[var(--sidebar-width)] data-[state=collapsed]:w-[var(--sidebar-width)]",
        "transition-[width,margin] duration-200 motion-reduce:transition-none",
        className
      )}
      style={styleVars}
      {...rest}
    />
  );
}

export function SidebarHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b border-white/10 bg-[var(--ui-inverse-bg)]",
        "px-3 py-3",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 border-t border-white/10 bg-[var(--ui-inverse-bg)]",
        "px-3 py-3",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "h-[calc(100vh-1px)] overflow-y-auto px-2 py-3",
        "scrollbar-thin",
        className
      )}
      {...rest}
    />
  );
}

/**
 * SidebarTrigger
 * A simple toggle button, typically rendered in your main layout.
 */
export function SidebarTrigger(props: SidebarTriggerProps) {
  const { className, ariaLabel = "Toggle sidebar", ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl",
        "h-10 w-10 border border-[var(--ui-border)] bg-[var(--ui-bg)] text-[var(--ui-text)]",
        "hover:bg-[var(--ui-surface)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
        className
      )}
      {...rest}
    >
      {/* Hamburger icon */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/**
 * SidebarRail
 * Optional narrow rail used in icon-collapsed mode for quick toggling.
 */
export function SidebarRail(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2",
        "hidden group-data-[collapsible=icon]/sidebar:block",
        "h-10 w-6 rounded-l-xl border border-white/10 bg-white/5 text-white/90",
        "hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-inverse-bg)]",
        className
      )}
      {...rest}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto h-4 w-4" fill="none">
        <path
          d="M14 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}


```

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";
import { useSidebar } from "./sidebar.context";

export function SidebarGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("px-1 py-2", className)} {...rest} />;
}

export function SidebarGroupLabel(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-white/70",
        // Hide label in icon-collapsed mode
        "group-data-[state=collapsed]/sidebar:hidden",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarGroupContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("space-y-1", className)} {...rest} />;
}

export function SidebarSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      role="separator"
      className={cn("my-2 h-px bg-white/10", className)}
      {...rest}
    />
  );
}

export function SidebarMenu(props: React.HTMLAttributes<HTMLUListElement>) {
  const { className, ...rest } = props;
  return <ul className={cn("space-y-1", className)} {...rest} />;
}

export function SidebarMenuItem(props: React.HTMLAttributes<HTMLLIElement>) {
  const { className, ...rest } = props;
  return <li className={cn(className)} {...rest} />;
}

export type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  /**
   * Marks the button as active.
   */
  isActive?: boolean;
};

/**
 * SidebarMenuButton
 * The primary navigation button. In icon-collapsed mode, only the icon remains visible.
 */
export function SidebarMenuButton(props: SidebarMenuButtonProps) {
  const { asChild, className, children, isActive, ...rest } = props;
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-active={isActive ? "true" : "false"}
      className={cn(
        "group/menu-button relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
        "text-white/90 hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-inverse-bg)]",
        "data-[active=true]:bg-white/12 data-[active=true]:text-white",
        className
      )}
      {...rest}
    >
      {children}
      {/* When collapsed, hide everything except the first child (usually icon) */}
      <span className="hidden group-data-[state=collapsed]/sidebar:inline-block" aria-hidden="true" />
    </Comp>
  );
}

export type SidebarMenuActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * SidebarMenuAction
 * Secondary action on the right of a menu item (e.g., settings, more menu).
 * Visible on hover or when the menu button is active.
 */
export function SidebarMenuAction(props: SidebarMenuActionProps) {
  const { className, ...rest } = props;
  return (
    <button
      type="button"
      className={cn(
        "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl",
        "text-white/70 hover:bg-white/10 hover:text-white",
        "opacity-0 group-hover/menu-button:opacity-100",
        "group-data-[active=true]/menu-button:opacity-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-inverse-bg)]",
        className
      )}
      {...rest}
    />
  );
}


```

Nice: we’ve got the core Sidebar pieces in place; next I’m tightening up the menu primitives so “collapse-to-icons” works cleanly (hide labels, keep icons, keep active/hover states), then I’ll add a Storybook demo that matches the shadcn usage pattern.

```typescriptreact
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@lib/utils";

export function SidebarGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("px-1 py-2", className)} {...rest} />;
}

export function SidebarGroupLabel(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-white/70",
        // Hide label in icon-collapsed mode
        "group-data-[state=collapsed]/sidebar:hidden",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarGroupContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("space-y-1", className)} {...rest} />;
}

export function SidebarSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      role="separator"
      className={cn("my-2 h-px bg-white/10", className)}
      {...rest}
    />
  );
}

export function SidebarMenu(props: React.HTMLAttributes<HTMLUListElement>) {
  const { className, ...rest } = props;
  return <ul className={cn("space-y-1", className)} {...rest} />;
}

export function SidebarMenuItem(props: React.HTMLAttributes<HTMLLIElement>) {
  const { className, ...rest } = props;
  return <li className={cn(className)} {...rest} />;
}

export type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  /**
   * Marks the button as active.
   */
  isActive?: boolean;
};

/**
 * SidebarMenuButton
 * The primary navigation button. In icon-collapsed mode, only the icon remains visible.
 *
 * Usage convention:
 * - Put the icon as the first child.
 * - Wrap the label text in `<span data-slot="label">…</span>` so it can be hidden in icon mode.
 */
export function SidebarMenuButton(props: SidebarMenuButtonProps) {
  const { asChild, className, children, isActive, ...rest } = props;
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-active={isActive ? "true" : "false"}
      className={cn(
        "group/menu-button relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
        "text-white/90 hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-inverse-bg)]",
        "data-[active=true]:bg-white/12 data-[active=true]:text-white",
        // Collapse-to-icons behavior (shadcn-inspired)
        "group-data-[state=collapsed]/sidebar:justify-center",
        "group-data-[state=collapsed]/sidebar:px-2",
        "group-data-[state=collapsed]/sidebar:[&_[data-slot=label]]:hidden",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export type SidebarMenuActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * SidebarMenuAction
 * Secondary action on the right of a menu item (e.g., settings, more menu).
 * Visible on hover or when the menu button is active.
 */
export function SidebarMenuAction(props: SidebarMenuActionProps) {
  const { className, ...rest } = props;
  return (
    <button
      type="button"
      className={cn(
        "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl",
        "text-white/70 hover:bg-white/10 hover:text-white",
        "opacity-0 group-hover/menu-button:opacity-100",
        "group-data-[active=true]/menu-button:opacity-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-inverse-bg)]",
        className
      )}
      {...rest}
    />
  );
}



```

```typescript
export * from "./sidebar.context";
export * from "./Sidebar";
export * from "./SidebarMenu";
export type * from "./sidebar.types";


```

```typescriptreact
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./index";
import { Button } from "../Button/Button";

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 10.5l8-6 8 6V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 4h16v12h-5l-2 3h-2l-2-3H4V4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  );
}

const meta: Meta = {
  title: "Navigation/Sidebar",
};
export default meta;

type Story = StoryObj;

export const CollapsibleToIcons: Story = {
  render: () => {
    const [active, setActive] = React.useState<"home" | "inbox">("home");

    return (
      <SidebarProvider defaultOpen>
        <div className="flex min-h-[480px] w-full overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  <span data-slot="label">Orion</span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={active === "home"}
                        onClick={() => setActive("home")}
                      >
                        <HomeIcon />
                        <span data-slot="label">Home</span>
                        <SidebarMenuAction aria-label="More">
                          <MoreIcon />
                        </SidebarMenuAction>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={active === "inbox"}
                        onClick={() => setActive("inbox")}
                      >
                        <InboxIcon />
                        <span data-slot="label">Inbox</span>
                        <SidebarMenuAction aria-label="More">
                          <MoreIcon />
                        </SidebarMenuAction>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Actions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-2">
                    <Button variant="secondary" className="w-full">
                      <span data-slot="label">New report</span>
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <div className="text-xs text-white/70">
                <span data-slot="label">Signed in</span>
              </div>
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          <main className="flex-1 p-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="text-sm text-[var(--ui-text-muted)]">
                Content area (toggle sidebar)
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  },
};


```

```typescript
export * from "./Alert";
export * from "./AreaChart";
export * from "./Badge";
export * from "./BarChart";
export * from "./Button";
export * from "./Card";
export * from "./ChartContainer";
export * from "./ChartTooltip";
export * from "./Chip";
export * from "./Combobox";
export * from "./Container";
export * from "./DeltaPill";
export * from "./Divider";
export * from "./DropdownMenu";
export * from "./Heading";
export * from "./IconButton";
export * from "./Inline";
export * from "./Input";
export * from "./LineChart";
export * from "./Modal";
export * from "./PieDonutChart";
export * from "./RadarChart";
export * from "./Select";
export * from "./Sidebar";
export * from "./Skeleton";
export * from "./Stack";
export * from "./StackedBarChart";
export * from "./Stat";
export * from "./Table";
export * from "./Tabs";
export * from "./Text";
export * from "./Treemap";
export * from "./Tooltip";

```

```typescriptreact
import * as React from "react";
import { cn } from "@lib/utils";
import { useSidebar } from "./sidebar.context";
import type { SidebarProps, SidebarTriggerProps } from "./sidebar.types";

/**
 * Sidebar
 * A composable sidebar container modeled after the shadcn sidebar architecture.
 *
 * Notes:
 * - Uses semantic vars for colors/borders.
 * - Uses data attributes for stateful styling: `data-state`, `data-collapsible`.
 */
export function Sidebar(props: SidebarProps) {
  const {
    collapsible = "icon",
    width = 280,
    iconWidth = 72,
    className,
    ...rest
  } = props;

  const { open } = useSidebar();

  // CSS variables for easy theming/override (similar to shadcn approach).
  const styleVars = {
    ["--sidebar-width" as const]: `${width}px`,
    ["--sidebar-icon-width" as const]: `${iconWidth}px`,
  };

  const dataState = open ? "open" : "collapsed";

  return (
    <aside
      data-state={dataState}
      data-collapsible={collapsible}
      className={cn(
        "group/sidebar relative shrink-0",
        // base surface: slightly stronger separation than cards
        "border-r border-[var(--ui-border)] bg-[var(--ui-inverse-bg)] text-[var(--ui-inverse-text)]",
        "h-screen",
        // width behavior
        "w-[var(--sidebar-width)]",
        collapsible === "icon" &&
          "data-[state=collapsed]:w-[var(--sidebar-icon-width)]",
        collapsible === "offcanvas" &&
          "data-[state=collapsed]:-ml-[var(--sidebar-width)] data-[state=collapsed]:w-[var(--sidebar-width)]",
        "transition-[width,margin] duration-200 motion-reduce:transition-none",
        className
      )}
      style={styleVars}
      {...rest}
    />
  );
}

export function SidebarHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b border-white/10 bg-[var(--ui-inverse-bg)]",
        "px-3 py-3",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 border-t border-white/10 bg-[var(--ui-inverse-bg)]",
        "px-3 py-3",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "h-[calc(100vh-1px)] overflow-y-auto px-2 py-3",
        className
      )}
      {...rest}
    />
  );
}

/**
 * SidebarTrigger
 * A simple toggle button, typically rendered in your main layout.
 */
export function SidebarTrigger(props: SidebarTriggerProps) {
  const { className, ariaLabel = "Toggle sidebar", ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl",
        "h-10 w-10 border border-[var(--ui-border)] bg-[var(--ui-bg)] text-[var(--ui-text)]",
        "hover:bg-[var(--ui-surface)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)]",
        className
      )}
      {...rest}
    >
      {/* Hamburger icon */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/**
 * SidebarRail
 * Optional narrow rail used in icon-collapsed mode for quick toggling.
 */
export function SidebarRail(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2",
        "hidden group-data-[collapsible=icon]/sidebar:block",
        "h-10 w-6 rounded-l-xl border border-white/10 bg-white/5 text-white/90",
        "hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-inverse-bg)]",
        className
      )}
      {...rest}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto h-4 w-4" fill="none">
        <path
          d="M14 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}



```

Brock, done — I added a **composable Sidebar system** modeled after shadcn’s Sidebar architecture ([shadcn sidebar docs](https://ui.shadcn.com/docs/components/sidebar)).

### What you get
- **State + hook**: `SidebarProvider`, `useSidebar`
- **Layout primitives**: `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarRail`, `SidebarTrigger`
- **Menu primitives**: `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarSeparator`

### Storybook demo
- `src/components/Sidebar/Sidebar.stories.tsx` shows **collapse-to-icons** and the expected composition pattern.

### Exported
- Everything is exported via `src/components/Sidebar/index.ts` and re-exported from the main barrel:

```23:26:src/components/index.ts
export * from "./Select";
export * from "./Sidebar";
export * from "./Skeleton";
export * from "./Stack";
```

### One important usage convention (for icon-collapse)
Wrap the label in `SidebarMenuButton` like:

- `<span data-slot="label">Home</span>`

So the label can be hidden automatically in collapsed icon mode. (The story demonstrates this.)

**ELI5 TLDR**: We built a “LEGO sidebar”: a Provider holds open/closed state, and you assemble `Sidebar + Header/Content/Footer + Menu` pieces the same way shadcn does, but styled with your `--ui-*` tokens.

```typescript
export * from "./Select";
export * from "./Sidebar";
export * from "./Skeleton";
export * from "./Stack";
```

