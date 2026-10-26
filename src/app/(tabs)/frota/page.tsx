"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Navigation, Truck, TriangleAlert, WifiOff, type LucideIcon } from "lucide-react";
import { AlertRow } from "@/components/AlertRow";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScreenHeader, SectionHead, StatusChip } from "@/components/ui";
import { ALERTS, FLEET_UTILIZATION } from "@/lib/data";
import { useStore } from "@/lib/store";
import styles from "./fleet.module.css";

const WEEKDAYS = ["S", "T", "Q", "Q", "S", "S", "D"];
const RANGES = ["7d", "30d", "90d"] as const;

export default function FleetPage() {
  const { vehicles, ackedAlerts } = useStore();
  const [range, setRange] = useState<(typeof RANGES)[number]>("7d");
  const openAlerts = ALERTS.filter((a) => !ackedAlerts.includes(a.id));

  const counts = {
    inUse: vehicles.filter((v) => v.status === "in-use").length,
    available: vehicles.filter((v) => v.status === "available").length,
    offline: vehicles.filter((v) => v.status === "offline").length,
    critical: openAlerts.filter((a) => a.severity === "high").length,
  };

  return (
    <main className="screen screen-top">
      <ScreenHeader title="Painel da frota" subtitle="Visão gestor · Maringá-PR" right={<ThemeToggle />} />
      <div className="screen-body" style={{ padding: "0 20px 24px" }}>
        <div className={styles.kpis}>
          <KpiCard label="Em uso" value={counts.inUse} accent="var(--info)" icon={Navigation} trend="+1 vs ontem" />
          <KpiCard label="Disponíveis" value={counts.available} accent="var(--ok)" icon={CircleCheck} />
          <KpiCard label="Offline" value={counts.offline} accent="var(--danger)" icon={WifiOff} trend="atenção" trendBad />
          <KpiCard label="Alertas críticos" value={counts.critical} accent="var(--warn)" icon={TriangleAlert} />
        </div>

        <section className={"card " + styles.chart}>
          <div className={styles.chartHead}>
            <div>
              <div className={styles.chartLabel}>UTILIZAÇÃO DA FROTA</div>
              <div className={styles.chartValueRow}>
                <span className={"num " + styles.chartValue}>{FLEET_UTILIZATION.current}%</span>
                <span className={styles.chartDelta}>↑ {FLEET_UTILIZATION.deltaPp} pp</span>
              </div>
            </div>
            <div className="seg" role="tablist" aria-label="Período">
              {RANGES.map((r) => (
                <button key={r} type="button" role="tab" aria-selected={range === r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.bars} role="img" aria-label="Utilização diária da frota nos últimos 7 dias">
            {FLEET_UTILIZATION.week.map((v, i) => {
              const last = i === FLEET_UTILIZATION.week.length - 1;
              return (
                <div key={i} className={styles.barCol}>
                  <div className={styles.barTrack}>
                    <div className={styles.bar} style={{ height: v + "%", background: last ? "var(--primary)" : "var(--primary-soft)" }} title={v + "%"} />
                  </div>
                  <span className={styles.barLabel}>{WEEKDAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </section>

        <SectionHead
          label={`Veículos (${vehicles.length})`}
          action={
            <button type="button" className="tap link-btn">
              Filtrar
            </button>
          }
        />
        <div className={styles.vehicles}>
          {vehicles.map((v) => (
            <div key={v.id} className={"card " + styles.vehicle}>
              <div className={"tile-icon " + styles.vehicleIcon}>
                <Truck size={18} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.vehicleLine}>
                  <span className={"mono " + styles.plate}>{v.plate}</span>
                  <span className={styles.dotSep}>·</span>
                  <span className={"ellipsis " + styles.model}>{v.model.split(" ").slice(0, 2).join(" ")}</span>
                </div>
                <div className={styles.driver}>{v.driver ? "Com " + v.driver : "Sem motorista · " + v.color}</div>
              </div>
              <StatusChip status={v.status} />
            </div>
          ))}
        </div>

        <SectionHead
          label="Alertas recentes"
          action={
            <Link href="/alertas" className="tap link-btn">
              Ver todos
            </Link>
          }
        />
        <div className={styles.vehicles}>
          {openAlerts.slice(0, 2).map((a) => (
            <AlertRow key={a.id} alert={a} compact />
          ))}
          {openAlerts.length === 0 && <div className={"card " + styles.empty}>Nenhum alerta ativo.</div>}
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  accent,
  icon: Icon,
  trend,
  trendBad,
}: {
  label: string;
  value: number;
  accent: string;
  icon: LucideIcon;
  trend?: string;
  trendBad?: boolean;
}) {
  return (
    <div className={"card " + styles.kpi}>
      <div className={styles.kpiHead}>
        <div className={styles.kpiIcon} style={{ background: `color-mix(in oklab, ${accent} 12%, transparent)`, color: accent }}>
          <Icon size={16} strokeWidth={2.2} />
        </div>
        {trend && (
          <span className={styles.kpiTrend} style={{ color: trendBad ? "var(--danger)" : "var(--fg-3)" }}>
            {trend.toUpperCase()}
          </span>
        )}
      </div>
      <div className={styles.kpiLabel}>{label.toUpperCase()}</div>
      <div className={"num " + styles.kpiValue}>{value}</div>
    </div>
  );
}
