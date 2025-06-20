import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, ...props }, ref) => {
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
          <select
            className={cn(
              'block w-full px-3 py-2 border rounded-md shadow-sm bg-white focus:outline-none sm:text-sm',
              error
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
Select.displayName = 'Select'

export { Select } 