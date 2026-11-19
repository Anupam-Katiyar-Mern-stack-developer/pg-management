import React, { HTMLAttributes } from "react";

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    padding?: CardPadding;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    hoverable = false,
    className = '',
    ...props
}) => {
    const paddings: Record<CardPadding, string> = {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    };
    return (
        <div
            className={`bg-white rounded-xl border border-slate-200/80 shadow-xs transition-all duration-200
        ${paddings[padding]}
        ${hoverable ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );

}