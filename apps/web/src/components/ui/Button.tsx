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
      primary: "bg-primary text-bg font-bold hover:bg-primary-hover shadow-sm",
      secondary: "bg-transparent border border-border text-text hover:bg-surface-2",
      ghost: "bg-transparent text-muted hover:text-text hover:bg-surface-2",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-base rounded-[8px]",
      lg: "px-6 py-3 text-lg rounded-[8px]",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg",
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
