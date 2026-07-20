import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[#14B87A]/55 focus-visible:ring-[#14B87A]/35 focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0C10] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-[#14B87A] text-[#06110C] shadow-[0_10px_26px_rgba(20,184,122,0.2)] hover:-translate-y-0.5 hover:bg-[#19D28D] hover:shadow-[0_14px_34px_rgba(20,184,122,0.28)]',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-white/10 bg-white/[0.035] shadow-sm shadow-black/10 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.07] hover:text-white dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-[#1A1D25] text-white shadow-sm shadow-black/10 hover:-translate-y-0.5 hover:bg-[#222734]',
        ghost:
          'hover:bg-white/[0.06] hover:text-white dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-xl px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
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
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
