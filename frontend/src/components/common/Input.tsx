import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}


export const Input = forwardRef<HTMLInputElement, InputProps>((
    {
        label,
        error,
        helperText,
        leftIcon,
        rightIcon,
        className = '',
        id,
        ...props
    },
    ref
) => {
    const inputId = id || props.name;
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {leftIcon && (
                    <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
                        {leftIcon}
                    </span>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={`w-full rounded-lg bg-white text-sm text-slate-800 placeholder:text-slate-400 border transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightIcon ? 'pr-10' : 'pr-3.5'}
              py-2.5
              ${error
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                        }
              ${className}
            `}
                    {...props}
                />

                {rightIcon && (
                    <span className="absolute right-3 text-slate-400 flex items-center">
                        {rightIcon}
                    </span>
                )}
            </div>

            {error ? (
                <span className="text-xs text-rose-500">{error}</span>
            ) : (
                helperText && (
                    <span className="text-xs text-slate-500">{helperText}</span>
                )
            )}
        </div>
    );
}
);

Input.displayName ='Input';