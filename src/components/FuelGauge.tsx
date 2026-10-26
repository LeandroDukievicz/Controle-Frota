import { Fuel } from "lucide-react";
import styles from "./FuelGauge.module.css";

/** Read-only fuel indicator styled as a field. */
export function FuelGauge({ value }: { value: number }) {
  return (
    <div className={"field " + styles.gauge} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Combustível">
      <Fuel size={16} strokeWidth={2} style={{ color: "var(--fg-3)" }} />
      <span className={"num " + styles.value}>{value}%</span>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: value + "%" }} />
      </div>
    </div>
  );
}
