"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from "react";

type BaseProps = {
  label?: string;
  helper?: string;
  leading?: ReactNode;
  error?: string | null;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;

export const Field = forwardRef<HTMLInputElement, InputProps>(function Field(
  { label, helper, leading, error, id, className, style, ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? `cp-field-${reactId}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`} style={style}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--cp-ink-soft)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 52,
          padding: "0 14px",
          background: "var(--cp-surface)",
          borderRadius: "var(--cp-btn-radius)",
          border: `1.5px solid ${error ? "var(--cp-coral)" : "var(--cp-line)"}`,
          transition: "border-color .15s, box-shadow .15s",
        }}
      >
        {leading && (
          <span style={{ color: "var(--cp-ink-soft)", display: "flex" }}>
            {leading}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          {...rest}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--cp-ink)",
            fontFamily: "inherit",
          }}
        />
      </div>
      {(error || helper) && (
        <span
          style={{
            fontSize: 12.5,
            color: error ? "var(--cp-coral)" : "var(--cp-ink-faint)",
          }}
        >
          {error ?? helper}
        </span>
      )}
    </div>
  );
});

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({
  label,
  helper,
  error,
  id,
  className,
  ...rest
}: TextareaProps) {
  const reactId = useId();
  const fieldId = id ?? `cp-ta-${reactId}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      {label && (
        <label
          htmlFor={fieldId}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--cp-ink-soft)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        {...rest}
        style={{
          minHeight: 80,
          padding: "12px 14px",
          background: "var(--cp-surface)",
          borderRadius: "var(--cp-btn-radius)",
          border: `1.5px solid ${error ? "var(--cp-coral)" : "var(--cp-line)"}`,
          fontSize: 15,
          fontWeight: 500,
          color: "var(--cp-ink)",
          fontFamily: "inherit",
          resize: "vertical",
          outline: "none",
        }}
      />
      {(error || helper) && (
        <span
          style={{
            fontSize: 12.5,
            color: error ? "var(--cp-coral)" : "var(--cp-ink-faint)",
          }}
        >
          {error ?? helper}
        </span>
      )}
    </div>
  );
}
