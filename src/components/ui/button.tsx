import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-700 shadow-[0_1px_2px_rgba(15,76,92,0.25)]",
        secondary: "bg-white text-primary border border-primary/80 hover:bg-primary-50",
        accent: "bg-accent text-ink hover:bg-accent-600 shadow-[0_1px_2px_rgba(244,162,97,0.35)]",
        outline: "bg-white text-ink border border-line hover:border-slate-300 hover:bg-slate-50",
        ghost: "text-ink hover:bg-slate-100",
        subtle: "bg-primary-50 text-primary hover:bg-primary-100",
        danger: "bg-danger text-white hover:bg-red-700",
        "danger-outline": "bg-white text-danger border border-red-200 hover:bg-danger-50",
        link: "text-secondary hover:text-primary underline-offset-4 hover:underline px-0 h-auto",
        "white": "bg-white text-ink hover:bg-white/90",
        "glass": "bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-[10px]",
        md: "h-11 px-5 text-sm rounded-[10px]",
        lg: "h-12 px-6 text-[15px] rounded-xl",
        icon: "size-10 rounded-[10px]",
        "icon-sm": "size-8 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Variants {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof Link> & Variants) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  );
}
