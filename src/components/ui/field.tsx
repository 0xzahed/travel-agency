"use client";

import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-[10px] border border-line bg-white px-3.5 text-sm text-ink placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 disabled:bg-slate-50 disabled:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink", className)} {...props} />;
}

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string, describedBy?: string) => React.ReactNode;
}

/** Wires a label, hint and error message to a single control via ids. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
        </Label>
      )}
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; label?: string; hint?: string; error?: string; wrapperClassName?: string };

export function Input({ className, icon, label, hint, error, required, wrapperClassName, ...props }: InputProps) {
  const field = (id?: string, describedBy?: string) => (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 [&_svg]:size-4">{icon}</span>}
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        required={required}
        className={cn(control, "h-11", icon && "pl-10", className)}
        {...props}
      />
    </div>
  );
  if (!label && !hint && !error) return <div className={wrapperClassName}>{field(props.id)}</div>;
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {(id, d) => field(props.id ?? id, d)}
    </Field>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string; wrapperClassName?: string };

export function Textarea({ className, label, hint, error, required, wrapperClassName, ...props }: TextareaProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {(id, d) => (
        <textarea
          id={props.id ?? id}
          aria-describedby={d}
          aria-invalid={error ? true : undefined}
          required={required}
          className={cn(control, "min-h-28 py-3 leading-relaxed", className)}
          {...props}
        />
      )}
    </Field>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
  wrapperClassName?: string;
  icon?: React.ReactNode;
};

export function Select({ className, label, hint, error, options, placeholder, required, wrapperClassName, icon, ...props }: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {(id, d) => (
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 [&_svg]:size-4">{icon}</span>}
          <select
            id={props.id ?? id}
            aria-describedby={d}
            aria-invalid={error ? true : undefined}
            required={required}
            className={cn(control, "h-11 appearance-none pr-10", icon && "pl-10", className)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => {
              const v = typeof o === "string" ? { value: o, label: o } : o;
              return (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        </div>
      )}
    </Field>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  className,
  id: idProp,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  description?: string;
  className?: string;
  id?: string;
}) {
  const gen = useId();
  const id = idProp ?? gen;
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <span className="relative mt-0.5 inline-flex">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="grid size-[18px] place-items-center rounded-[5px] border border-slate-300 bg-white transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-secondary/20">
          <Check className={cn("size-3 text-white transition-opacity", checked ? "opacity-100" : "opacity-0")} strokeWidth={3} aria-hidden />
        </span>
      </span>
      <span>
        <span className="text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Radio({
  name,
  value,
  checked,
  onChange,
  label,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 text-sm", className)}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="peer sr-only" />
      <span className="grid size-[18px] place-items-center rounded-full border border-slate-300 bg-white transition-colors peer-checked:border-primary peer-focus-visible:ring-4 peer-focus-visible:ring-secondary/20">
        <span className={cn("size-2 rounded-full bg-primary transition-transform", checked ? "scale-100" : "scale-0")} />
      </span>
      <span className="text-ink">{label}</span>
    </label>
  );
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      {label && (
        <label htmlFor={id} className="cursor-pointer text-sm">
          <span className="font-medium text-ink">{label}</span>
          {description && <span className="mt-0.5 block text-muted">{description}</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : "Toggle"}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-slate-300")}
      >
        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </button>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 20, label, sub }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-9 place-items-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary disabled:opacity-40">
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-9 place-items-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary disabled:opacity-40">
          +
        </button>
      </div>
    </div>
  );
}
