import type { ReactNode } from "react";
import { ChevronLeft, Circle, MapPin } from "lucide-react";
import type { Severity, TripStatus, VehicleStatus } from "@/lib/data";
import styles from "./ui.module.css";

const STATUS: Record<VehicleStatus | TripStatus, { label: string; bg: string; fg: string }> = {
  available: { label: "Disponível", bg: "var(--ok-soft)", fg: "var(--ok)" },
  "in-use": { label: "Em uso", bg: "var(--info-soft)", fg: "var(--info)" },
  offline: { label: "Offline", bg: "var(--danger-soft)", fg: "var(--danger)" },
  completed: { label: "Concluída", bg: "var(--ok-soft)", fg: "var(--ok)" },
  "in-progress": { label: "Em andamento", bg: "var(--info-soft)", fg: "var(--info)" },
  suspicious: { label: "Suspeita", bg: "var(--warn-soft)", fg: "var(--warn)" },
};

export function StatusChip({ status }: { status: VehicleStatus | TripStatus }) {
  const m = STATUS[status];
  return (
    <span className="chip" style={{ background: m.bg, color: m.fg }}>
      {m.label}
    </span>
  );
}

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "var(--danger)",
  med: "var(--warn)",
  low: "var(--info)",
};

export function SeverityDot({ s }: { s: Severity }) {
  return <span className={styles.dot} style={{ background: SEVERITY_COLOR[s] }} />;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={"num " + styles.statValue}>{value}</div>
    </div>
  );
}

export function RouteLine({ kind, text, dim, bold }: { kind: "from" | "to"; text: string; dim?: boolean; bold?: boolean }) {
  const Icon = kind === "from" ? Circle : MapPin;
  return (
    <div className={styles.routeLine} style={{ color: dim ? "var(--fg-3)" : "var(--fg-2)" }}>
      <Icon size={12} strokeWidth={2} />
      <span className={"ellipsis " + (bold ? styles.routeBold : "")}>{text}</span>
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {onBack && (
          <button type="button" onClick={onBack} className="icon-btn tap" aria-label="Voltar">
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </div>
      {right && <div className={styles.headerRight}>{right}</div>}
    </header>
  );
}

export function SectionHead({ label, action }: { label: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-head">
      <h2 className="section-label">{label}</h2>
      {action}
    </div>
  );
}
