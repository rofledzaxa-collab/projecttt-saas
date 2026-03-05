import * as React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-black text-white hover:bg-black/90",
          variant === "secondary" && "bg-black/5 text-black hover:bg-black/10",
          variant === "outline" && "border border-black/20 bg-white hover:bg-black/5",
          variant === "ghost" && "bg-transparent hover:bg-black/5",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
          variant === "link" && "bg-transparent text-black underline underline-offset-4 hover:opacity-80",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-6",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";