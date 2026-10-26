"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, KeyRound, Layers, Locate, MessageSquareText, Minus, Phone, Plus, Route } from "lucide-react";
import { StylizedMap } from "@/components/StylizedMap";
import { Stat } from "@/components/ui";
import { formatElapsed, formatKm, initials } from "@/lib/format";
import { useNow, useStore } from "@/lib/store";
import styles from "./map.module.css";

export default function MapPage() {
  const { activeTrip, vehicles } = useStore();
  const router = useRouter();
  const now = useNow(15_000);
  const vehicle = activeTrip ? vehicles.find((v) => v.id === activeTrip.vehicleId) : undefined;
  const live = Boolean(activeTrip && vehicle);

  const elapsedMs = activeTrip ? now - activeTrip.startedAt : 0;
  const hours = elapsedMs / 3_600_000;
  // Average speed is meaningless for the first few minutes of a trip.
  const avgSpeed = activeTrip && hours > 0.05 ? Math.round(activeTrip.distanceKm / hours) + " km/h" : "— km/h";

  return (
    <main className={"screen " + styles.screen}>
      <div className={styles.mapLayer}>
        <StylizedMap pin={live} />
      </div>

      <div className={styles.topBar}>
        <button type="button" onClick={() => router.push("/")} className="icon-btn-float tap" aria-label="Voltar">
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <div className={"card " + styles.livePill}>
          {live ? <span className="live-dot" /> : <span className={styles.idleDot} />}
          <span className={styles.liveLabel} style={{ color: live ? "var(--ok)" : "var(--fg-3)" }}>
            {live ? "AO VIVO" : "SEM SINAL"}
          </span>
          <span className={styles.sep} />
          <span className={"num " + styles.liveCount}>{live ? "1 veículo" : "0 veículos"}</span>
        </div>
        <button type="button" className="icon-btn-float tap" aria-label="Camadas">
          <Layers size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className={styles.zoom}>
        <button type="button" className={"card tap " + styles.zoomBtn} aria-label="Aproximar">
          <Plus size={18} strokeWidth={1.75} />
        </button>
        <button type="button" className={"card tap " + styles.zoomBtn} aria-label="Afastar">
          <Minus size={18} strokeWidth={1.75} />
        </button>
        <button type="button" className={"card tap " + styles.zoomBtn} style={{ color: "var(--primary)" }} aria-label="Centralizar">
          <Locate size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className={styles.sheet}>
        <div className={"card " + styles.sheetCard}>
          {live && vehicle && activeTrip ? (
            <>
              <div className={styles.driverRow}>
                <div className={"avatar " + styles.avatar}>{initials(vehicle.driver ?? "")}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.driverNameRow}>
                    <div className={"ellipsis " + styles.driverName}>{vehicle.driver}</div>
                    <span className="chip" style={{ background: "var(--ok-soft)", color: "var(--ok)" }}>
                      <span className="live-dot" style={{ width: 6, height: 6 }} /> Online
                    </span>
                  </div>
                  <div className={"mono " + styles.driverVehicle}>
                    {vehicle.model.split(" ").slice(0, 2).join(" ")} · {vehicle.plate}
                  </div>
                </div>
                <button type="button" className={"tap " + styles.callBtn} aria-label="Ligar para motorista">
                  <Phone size={16} strokeWidth={2.2} />
                </button>
              </div>

              <div className={styles.stats}>
                <Stat label="Em uso" value={formatElapsed(elapsedMs)} />
                <Stat label="Distância" value={formatKm(activeTrip.distanceKm)} />
                <Stat label="Vel. média" value={avgSpeed} />
              </div>

              <div className={styles.actions}>
                <Link href={`/historico/${activeTrip.tripId}`} className="btn btn-ghost tap" style={{ flex: 1 }}>
                  <Route size={18} strokeWidth={1.75} /> Ver rota
                </Link>
                <button type="button" className="btn btn-primary tap" style={{ flex: 1 }}>
                  <MessageSquareText size={18} strokeWidth={1.75} /> Mensagem
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.emptyTitle}>Nenhum veículo em uso</div>
              <p className={styles.emptyText}>Faça check-out de um veículo para acompanhar a viagem em tempo real.</p>
              <Link href="/checkout" className="btn btn-primary btn-block tap" style={{ marginTop: 14 }}>
                <KeyRound size={18} strokeWidth={1.75} /> Fazer check-out
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
