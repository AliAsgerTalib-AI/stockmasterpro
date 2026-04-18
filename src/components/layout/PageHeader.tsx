import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-primary pb-6">
      <div className="space-y-1">
        <h2 className="editorial-h2 mb-0">{title}</h2>
        {subtitle && (
          <p className="text-[10px] uppercase tracking-[2px] font-bold text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {children}
      </div>
    </div>
  );
}
