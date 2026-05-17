import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = props.id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-md uppercase tracking-wider text-muted font-semibold"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-surface border border-border text-text placeholder-faint rounded-[8px] px-4 py-2.5 transition-all",
              "focus:outline-none focus:border-primary",
              error && "border-risk-critical focus:border-risk-critical",
              className,
            )}
            {...props}
          />
          {/* Subtle outer glow on focus for premium feel, simulated via pseudo-class in tailwind or shadow */}
          <div className="absolute inset-0 rounded-[8px] pointer-events-none transition-shadow peer-focus:shadow-[0_0_0_2px_rgba(45,212,191,0.1)]" />
        </div>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-risk-critical mt-1"
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
