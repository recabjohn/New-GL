export default function Input({
  label,
  error,
  hint,
  required,
  prefix,
  suffix,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-flame-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-stone-400 text-sm select-none">{prefix}</span>
        )}
        <input
          className={[
            'form-input',
            error ? 'form-input-error' : '',
            prefix ? 'pl-8' : '',
            suffix ? 'pr-10' : '',
            inputClassName,
          ].join(' ')}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-stone-400 text-sm select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-crimson-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}
