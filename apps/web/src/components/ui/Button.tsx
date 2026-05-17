import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, type = "button", ...props }, ref) => {
    const variants = {
      primary:
        "bg-primary-container text-bg font-semibold hover:bg-primary shadow-[0_12px_32px_rgba(45,212,191,0.12)] disabled:bg-surface-container-high disabled:text-muted disabled:shadow-none",
      secondary:
        "bg-transparent border border-border text-text hover:border-border-hover hover:bg-surface-2 disabled:text-faint disabled:hover:bg-transparent",
      ghost:
        "bg-transparent text-muted hover:text-text hover:bg-surface-2 disabled:text-faint disabled:hover:bg-transparent",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-[6px]",
      md: "px-4 py-2.5 text-sm rounded-[8px]",
      lg: "px-6 py-3.5 text-sm rounded-[8px]",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container/80 focus:ring-offset-2 focus:ring-offset-bg disabled:pointer-events-none disabled:cursor-not-allowed uppercase tracking-[0.12em]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
        type={type}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
