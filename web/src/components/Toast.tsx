import { useBetSlip } from "../state/BetSlipContext";

export function Toast() {
  const { toast } = useBetSlip();
  if (!toast) return null;
  return (
    <div
      className="tl-fade-in"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 28,
        transform: "translateX(-50%)",
        zIndex: 90,
        padding: "12px 20px",
        borderRadius: "var(--radius-md)",
        background: "#111320",
        boxShadow: "var(--shadow-lg)",
        fontSize: 14,
      }}
    >
      {toast}
    </div>
  );
}
