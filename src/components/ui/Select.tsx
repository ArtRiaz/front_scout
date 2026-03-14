"use client";

interface SelectProps {
  label: string;
  value: string;
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}

export function Select({
  label,
  value,
  options,
  placeholder = "Select...",
  error,
  onChange,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base outline-none transition-all duration-150 ${
            !value ? "text-text-tertiary" : "text-text-primary"
          } ${
            error
              ? "border-error focus:ring-2 focus:ring-error/20"
              : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="h-4 w-4 text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
