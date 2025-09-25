import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

const interactiveButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",  
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-primary to-primary-variant text-white shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "hover:animate-pulse",
        bounce: "hover:animate-bounce",
        scale: "hover:scale-105 active:scale-95",
        slide: "hover:translate-x-1",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      animation: "scale",
    },
  }
);

export interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof interactiveButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  successText?: string;
  showSuccess?: boolean;
  ripple?: boolean;
}

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    successText,
    showSuccess = false,
    ripple = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const [isClicked, setIsClicked] = React.useState(false);
    const [ripplePosition, setRipplePosition] = React.useState({ x: 0, y: 0 });
    
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) return;
      
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        setRipplePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 300);
      }
      
      onClick?.(e);
    };

    const buttonContent = React.useMemo(() => {
      if (loading) {
        return (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {loadingText || "جاري المعالجة..."}
          </div>
        );
      }
      
      if (showSuccess && successText) {
        return successText;
      }
      
      return children;
    }, [loading, showSuccess, successText, loadingText, children]);

    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: variant === "premium" ? 1.02 : 1.01 }}
        transition={{ duration: 0.1 }}
      >
        <Comp
          className={cn(interactiveButtonVariants({ variant, size, animation, className }))}
          ref={ref}
          onClick={handleClick}
          disabled={loading || props.disabled}
          {...props}
        >
          {buttonContent}
          
          {/* Ripple effect */}
          {ripple && isClicked && (
            <motion.span
              className="absolute inset-0 rounded-md"
              initial={{ 
                opacity: 0.3,
                background: `radial-gradient(circle at ${ripplePosition.x}px ${ripplePosition.y}px, rgba(255,255,255,0.3) 0%, transparent 70%)`
              }}
              animate={{ 
                opacity: 0,
                background: `radial-gradient(circle at ${ripplePosition.x}px ${ripplePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 70%)`
              }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Comp>
      </motion.div>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";

export { InteractiveButton, interactiveButtonVariants };