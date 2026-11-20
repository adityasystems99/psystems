import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'solid',
  size = 'md',
  href,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs tracking-wide",
    md: "px-6 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-3.5 text-base tracking-wide"
  }[size];

  const variantStyles = {
    solid: "bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet text-background font-semibold hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-[0.98]",
    ghost: "border border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-brand-cyan/50 hover:text-brand-cyan active:scale-[0.98]",
    glow: "bg-card border border-brand-cyan/30 text-brand-cyan hover:border-brand-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] active:scale-[0.98]"
  }[variant];

  const combinedClasses = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClasses}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

