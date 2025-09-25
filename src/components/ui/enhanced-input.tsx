import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Check, X } from "lucide-react";

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showValidation?: boolean;
  isValid?: boolean;
  validationMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, showValidation, isValid, validationMessage, leftIcon, rightIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative space-y-1">
        <motion.div 
          className="relative"
          animate={{ 
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200 ease-in-out",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              showValidation && isValid === true && "border-green-500 focus-visible:ring-green-500",
              showValidation && isValid === false && "border-red-500 focus-visible:ring-red-500",
              isFocused && "shadow-sm border-primary/50",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
          
          {showValidation && (
            <motion.div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isValid === true ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : isValid === false ? (
                <X className="h-4 w-4 text-red-500" />
              ) : null}
            </motion.div>
          )}
        </motion.div>
        
        {showValidation && validationMessage && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-xs px-1",
              isValid === true ? "text-green-600" : "text-red-600"
            )}
          >
            {validationMessage}
          </motion.p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };