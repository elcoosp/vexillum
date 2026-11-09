import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "secondary";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:opacity-95",
  outline: "border border-border bg-transparent hover:bg-muted",
  ghost: "bg-transparent hover:bg-muted",
  secondary: "bg-muted text-foreground hover:bg-muted/70",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-sm",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        // vx-press: compress-while-held + spring release; the default variant
        // gains a shadow that grows on hover for a tactile two-layer feel
        "vx-press inline-flex items-center justify-center gap-2 rounded-md font-medium",
        "focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
