"use client";

import { useState } from "react";
import { CheckCheck, CircleCheck } from "lucide-react";
import { AlertRow } from "@/components/AlertRow";
import { ScreenHeader } from "@/components/ui";
import { ALERTS, type AlertType } from "@/lib/data";
import { useStore } from "@/lib/store";
import styles from "./alerts.module.css";

type Filter = "all" | "high" | AlertType;

const FILTERS: [Filter, string][] = [
  ["all", "Todos"],
  ["high", "Críticos"],
  ["offline", "Offline"],
  ["route", "Rota"],
  ["geofence", "Cerca"],
  ["maintenance", "Manutenção"],
];

export default function AlertsPage() {
  const { ackedAlerts, ackAlert, ackAlerts } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const open = ALERTS.filter((a) => !ackedAlerts.includes(a.id));
  const list = open.filter((a) => (filter === "all" ? true : filter === "high" ? a.severity === "high" : a.type === filter));
  const critical = open.filter((a) => a.severity === "high").length;

  return (
    <main className="screen screen-top">
      <ScreenHeader
        title="Alertas"
        subtitle={`${open.length} ativos · ${critical} críticos`}
        right={
          <button
            type="button"
            className="icon-btn tap"
            aria-label="Reconhecer todos os alertas visíveis"
            onClick={() => ackAlerts(list.map((a) => a.id))}
            disabled={list.length === 0}
          >
            <CheckCheck size={18} strokeWidth={1.75} />
          </button>
        }
      />

      <div className={styles.filters} role="tablist" aria-label="Filtrar alertas">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={"tap " + styles.filter + (filter === id ? " " + styles.filterActive : "")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="screen-body" style={{ padding: "0 20px 20px" }}>
        <div className={styles.list}>
          {list.map((a) => (
            <AlertRow key={a.id} alert={a} onAck={() => ackAlert(a.id)} />
          ))}
          {list.length === 0 && (
            <div className={"card " + styles.empty}>
              <CircleCheck size={32} strokeWidth={1.5} style={{ color: "var(--ok)", margin: "0 auto" }} />
              <div className={styles.emptyTitle}>Tudo em ordem</div>
              <div className={styles.emptyText}>Nenhum alerta ativo no momento.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
