"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, SlidersHorizontal } from "lucide-react";
import { RouteLine, ScreenHeader, StatusChip } from "@/components/ui";
import type { TripStatus } from "@/lib/data";
import { formatKm, initials } from "@/lib/format";
import { useStore } from "@/lib/store";
import styles from "./history.module.css";

const FILTERS: [TripStatus | "all", string][] = [
  ["all", "Todos"],
  ["in-progress", "Em andamento"],
  ["completed", "Concluídos"],
  ["suspicious", "Suspeitos"],
];

export default function HistoryPage() {
  const { trips, activeTrip } = useStore();
  const [filter, setFilter] = useState<TripStatus | "all">("all");
  const list = filter === "all" ? trips : trips.filter((t) => t.status === filter);

  return (
    <main className="screen screen-top">
      <ScreenHeader
        title="Trajetos"
        subtitle={`${trips.length} viagens · últimos 7 dias`}
        right={
          <button type="button" className="icon-btn tap" aria-label="Filtros">
            <SlidersHorizontal size={18} strokeWidth={1.75} />
          </button>
        }
      />
      <div className={styles.filters}>
        <div className="seg" role="tablist" aria-label="Filtrar trajetos">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-body" style={{ padding: "0 20px 20px" }}>
        <div className={styles.list}>
          {list.map((t) => {
            const distance = t.id === activeTrip?.tripId ? activeTrip.distanceKm : t.distance;
            return (
              <Link key={t.id} href={`/historico/${t.id}`} className={"card tap " + styles.item}>
                <div className={styles.itemHead}>
                  <div className={styles.driver}>
                    <div className={"avatar " + styles.avatar}>{initials(t.driver)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className={"ellipsis " + styles.driverName}>{t.driver}</div>
                      <div className={"mono " + styles.vehicle}>{t.vehicle}</div>
                    </div>
                  </div>
                  <StatusChip status={t.status} />
                </div>

                <div className={styles.route}>
                  <RouteLine kind="from" text={t.from} dim />
                  <RouteLine kind="to" text={t.to} bold={t.status === "suspicious"} />
                </div>

                <div className={styles.meta}>
                  <span className={"num " + styles.when}>
                    <Calendar size={12} strokeWidth={1.75} /> {t.date} · {t.time}
                  </span>
                  <span className={"num " + styles.figures}>
                    <span>{t.duration}</span>
                    <span style={{ color: "var(--fg-3)" }}>·</span>
                    <span>{formatKm(distance)}</span>
                  </span>
                </div>
              </Link>
            );
          })}
          {list.length === 0 && <div className={"card " + styles.empty}>Nenhum trajeto neste filtro.</div>}
        </div>
      </div>
    </main>
  );
}
