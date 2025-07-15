import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white' | 'minimal';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl', 
  xl: 'text-3xl'
};

export function Logo({ 
  className, 
  size = 'md', 
  showText = true, 
  variant = 'default' 
}: LogoProps) {
  const logoClasses = cn(
    'rounded-xl object-contain transition-all duration-300',
    sizeClasses[size],
    variant === 'white' && 'brightness-0 invert',
    variant === 'minimal' && 'opacity-90',
    className
  );

  const textClasses = cn(
    'font-bold transition-all duration-300',
    textSizeClasses[size],
    variant === 'default' && 'bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent',
    variant === 'white' && 'text-white',
    variant === 'minimal' && 'text-foreground'
  );

  if (!showText) {
    return (
      <img 
        src={logoImage} 
        alt="الدرايبي - DURAIBI" 
        className={logoClasses}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img 
        src={logoImage} 
        alt="الدرايبي - DURAIBI" 
        className={logoClasses}
      />
      <div className="flex flex-col">
        <h1 className={textClasses}>
          الدرايبي
        </h1>
        <p className={cn(
          'text-xs font-medium transition-all duration-300',
          size === 'sm' && 'text-[10px]',
          size === 'xl' && 'text-sm',
          variant === 'default' && 'text-muted-foreground',
          variant === 'white' && 'text-white/80',
          variant === 'minimal' && 'text-muted-foreground'
        )}>
          DURAIBI
        </p>
      </div>
    </div>
  );
}