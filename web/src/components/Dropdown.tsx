import { useEffect, useRef, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

export function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="input"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "auto",
          minHeight: 32,
          padding: "4px 8px",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{current?.label ?? ""}</span>
        <CaretDown size={11} weight="bold" style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : undefined }} />
      </button>

      {open && (
        <div
          className="tl-fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "100%",
            maxHeight: 220,
            overflowY: "auto",
            background: "#111320",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 100,
            padding: 4,
          }}
        >
          {options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="tl-search-result"
              style={{
                display: "block",
                width: "100%",
                padding: "7px 10px",
                border: "none",
                borderRadius: "var(--radius-sm)",
                background: o.value === value ? "color-mix(in srgb, var(--color-accent) 16%, transparent)" : "transparent",
                color: o.value === value ? "var(--color-accent-200)" : "var(--color-text)",
                fontSize: 12,
                textAlign: "left",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
