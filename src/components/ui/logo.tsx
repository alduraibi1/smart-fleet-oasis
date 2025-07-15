import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs';
  showText?: boolean;
  variant?: 'default' | 'white' | 'minimal' | 'glow';
  animated?: boolean;
  loading?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const textSizeClasses = {
  xs: 'text-sm',
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl', 
  xl: 'text-3xl'
};

export function Logo({ 
  className, 
  size = 'md', 
  showText = true, 
  variant = 'default',
  animated = false,
  loading = false
}: LogoProps) {
  const logoClasses = cn(
    'rounded-xl object-contain transition-all duration-500 ease-out',
    sizeClasses[size],
    variant === 'white' && 'brightness-0 invert',
    variant === 'minimal' && 'opacity-90',
    variant === 'glow' && 'drop-shadow-lg',
    animated && 'hover:scale-110 hover:drop-shadow-2xl',
    loading && 'animate-pulse',
    'hover:rotate-2 transform-gpu',
    className
  );

  const textClasses = cn(
    'font-bold transition-all duration-500 font-arabic',
    textSizeClasses[size],
    variant === 'default' && 'bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent',
    variant === 'white' && 'text-white drop-shadow-sm',
    variant === 'minimal' && 'text-foreground',
    variant === 'glow' && 'bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent drop-shadow-lg',
    animated && 'hover:scale-105'
  );

  const containerClasses = cn(
    'flex items-center gap-3 transition-all duration-300',
    animated && 'hover:gap-4'
  );

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className={cn(sizeClasses[size], 'rounded-xl bg-muted animate-pulse')} />
        {showText && (
          <div className="flex flex-col gap-1">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-3 w-12 bg-muted rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (!showText) {
    return (
      <img 
        src={logoImage} 
        alt="الدرايبي - DURAIBI" 
        className={logoClasses}
        loading="lazy"
      />
    );
  }

  return (
    <div className={containerClasses}>
      <img 
        src={logoImage} 
        alt="الدرايبي - DURAIBI" 
        className={logoClasses}
        loading="lazy"
      />
      <div className="flex flex-col">
        <h1 className={textClasses}>
          الدريبي
        </h1>
        <p className={cn(
          'text-xs font-medium transition-all duration-500 font-arabic tracking-wider',
          size === 'xs' && 'text-[9px]',
          size === 'sm' && 'text-[10px]',
          size === 'xl' && 'text-sm',
          variant === 'default' && 'text-muted-foreground opacity-75',
          variant === 'white' && 'text-white/70 drop-shadow-sm',
          variant === 'minimal' && 'text-muted-foreground',
          variant === 'glow' && 'text-primary/80 drop-shadow-sm',
          animated && 'hover:opacity-100'
        )}>
          DURAIBI
        </p>
      </div>
    </div>
  );
}