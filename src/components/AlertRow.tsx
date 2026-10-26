import { Check, Gauge, MapPin, RouteOff, ShieldAlert, WifiOff, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { Alert, AlertType } from "@/lib/data";
import { SeverityDot } from "./ui";
import styles from "./AlertRow.module.css";

export const ALERT_META: Record<AlertType, { icon: LucideIcon; color: string; soft: string }> = {
  offline: { icon: WifiOff, color: "var(--danger)", soft: "var(--danger-soft)" },
  route: { icon: RouteOff, color: "var(--warn)", soft: "var(--warn-soft)" },
  geofence: { icon: ShieldAlert, color: "var(--warn)", soft: "var(--warn-soft)" },
  maintenance: { icon: Wrench, color: "var(--info)", soft: "var(--info-soft)" },
  speed: { icon: Gauge, color: "var(--warn)", soft: "var(--warn-soft)" },
};

export function AlertRow({ alert, compact, onAck }: { alert: Alert; compact?: boolean; onAck?: () => void }) {
  const meta = ALERT_META[alert.type];
  const Icon = meta.icon;
  return (
    <div className={"card " + styles.row}>
      <div className={styles.icon} style={{ background: meta.soft, color: meta.color }}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <SeverityDot s={alert.severity} />
          <span className={styles.title}>{alert.title}</span>
        </div>
        <div className={styles.subtitle}>{alert.subtitle}</div>
        {!compact && (
          <div className={styles.actions}>
            <Link href="/mapa" className="btn btn-ghost btn-sm tap">
              <MapPin size={14} strokeWidth={1.75} /> Ver mapa
            </Link>
            <button type="button" onClick={onAck} className="btn btn-ghost btn-sm tap">
              <Check size={14} strokeWidth={1.75} /> Reconhecer
            </button>
          </div>
        )}
      </div>
      <div className={styles.time}>{alert.time}</div>
    </div>
  );
}
