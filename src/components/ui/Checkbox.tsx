
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, onChange, ...props }, ref) => {
        return (
            <input
                type="checkbox"
                ref={ref}
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-slate-900 checked:text-slate-50",
                    className
                )}
                onChange={(e) => {
                    onChange?.(e);
                    onCheckedChange?.(e.target.checked);
                }}
                {...props}
            />
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
