import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function FormStep({ 
  title, 
  description, 
  children, 
  isActive = true, 
  isCompleted = false,
  stepNumber,
  totalSteps 
}: FormStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Step header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <motion.div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200",
              isCompleted 
                ? "bg-green-500 text-white" 
                : isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
            )}
            whileHover={{ scale: 1.05 }}
          >
            {isCompleted ? (
              <Check className="h-4 w-4" />
            ) : (
              stepNumber
            )}
          </motion.div>
          
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="text-xs text-muted-foreground">
          {stepNumber} من {totalSteps}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1">
        <motion.div
          className="bg-primary h-1 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Step content */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}