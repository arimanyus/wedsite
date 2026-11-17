import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

// Colours come from CSS variables so each painting can restyle the same button for its era.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium outline-none transition-[transform,box-shadow,background-color,color,filter] duration-200 select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'era-btn bg-(--btn-bg) text-(--btn-fg) hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0',
        outline:
          'era-btn era-btn-outline border border-(--btn-line,currentColor) bg-(--btn-outline-bg,transparent) text-(--btn-outline-fg,currentColor) hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'text-current hover:bg-current/10',
      },
      size: {
        default: 'h-11 px-5 text-[0.95rem]',
        sm: 'h-9 px-3.5 text-sm',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
