import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'icon-only' | 'text-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'color';
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className, variant = 'default', size = 'md', theme = 'color', ...props }, ref) => {

    const textSizeClasses = {
      xs: 'text-lg',
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-4xl'
    };

    const iconSizeClasses = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    const themeClasses = {
      light: 'text-white',
      dark: 'text-gray-900',
      color: 'text-primary'
    };

    const LogoIcon = ({ className: iconClassName }: { className?: string }) => (
      <div className={cn(
        "relative flex items-center justify-center rounded-lg",
        theme === 'color' && "bg-gradient-to-br from-primary to-primary-dark",
        theme === 'light' && "bg-white/20 backdrop-blur-sm",
        theme === 'dark' && "bg-gray-900/10",
        iconClassName
      )}>
        {/* Icône de transport stylisée */}
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "relative z-10",
            theme === 'color' && "text-white",
            theme === 'light' && "text-white",
            theme === 'dark' && "text-gray-900",
            size === 'xs' && "w-3 h-3",
            size === 'sm' && "w-4 h-4",
            size === 'md' && "w-5 h-5",
            size === 'lg' && "w-6 h-6",
            size === 'xl' && "w-8 h-8"
          )}
          fill="currentColor"
        >
          {/* Bus/Transport icon */}
          <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
          <circle cx="7.5" cy="16.5" r="1.5"/>
          <circle cx="16.5" cy="16.5" r="1.5"/>
          <path d="M4 6h16v6H4z" opacity="0.7"/>
          <path d="M6 8h3v2H6zm5 0h3v2h-3zm5 0h2v2h-2z" opacity="0.5"/>
        </svg>
        
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
      </div>
    );

    const LogoText = ({ className: textClassName }: { className?: string }) => (
      <span className={cn(
        "font-bold tracking-tight",
        textSizeClasses[size],
        themeClasses[theme],
        textClassName
      )}>
        Quiz Musical
      </span>
    );

    const LogoTagline = () => (
      <span className={cn(
        "text-xs font-medium tracking-wide opacity-70",
        themeClasses[theme]
      )}>
        Quiz Musical
      </span>
    );

    if (variant === 'icon-only') {
      return (
        <div ref={ref} className={cn("inline-flex", className)} {...props}>
          <LogoIcon className={iconSizeClasses[size]} />
        </div>
      );
    }

    if (variant === 'text-only') {
      return (
        <div ref={ref} className={cn("inline-flex flex-col", className)} {...props}>
          <LogoText />
          {size !== 'xs' && <LogoTagline />}
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div ref={ref} className={cn("inline-flex items-center space-x-2", className)} {...props}>
          <LogoIcon className={iconSizeClasses[size]} />
          <LogoText />
        </div>
      );
    }

    // Default variant
    return (
      <div ref={ref} className={cn("inline-flex items-center space-x-3", className)} {...props}>
        <LogoIcon className={iconSizeClasses[size]} />
        <div className="flex flex-col">
          <LogoText />
          {size !== 'xs' && <LogoTagline />}
        </div>
      </div>
    );
  }
);
Logo.displayName = "Logo";

export { Logo };
export type { LogoProps };
