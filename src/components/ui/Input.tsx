import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm',
              error
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input } 