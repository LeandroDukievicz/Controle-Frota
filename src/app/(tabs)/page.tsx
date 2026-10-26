"use client";

import Link from "next/link";
import { Bell, Calendar, ChevronRight, Fuel, History, KeyRound, Map as MapIcon, MapPin, Square, Truck, Wrench } from "lucide-react";
import { ScreenHeader, SectionHead, Stat } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ALERTS, CURRENT_USER, RESERVATIONS } from "@/lib/data";
import { formatElapsed, formatKm } from "@/lib/format";
import { useNow, useStore } from "@/lib/store";
import styles from "./home.module.css";

const SHORTCUTS = [
  { icon: MapIcon, label: "Mapa", href: "/mapa" },
  { icon: History, label: "Trajetos", href: "/historico" },
  { icon: Fuel, label: "Combustível" },
  { icon: Wrench, label: "Manutenção" },
];

export default function HomePage() {
  const { activeTrip, vehicles, ackedAlerts } = useStore();
  const now = useNow();
  const activeVehicle = activeTrip ? vehicles.find((v) => v.id === activeTrip.vehicleId) : undefined;
  const reservation = RESERVATIONS[0];
  const vehicle = activeVehicle ?? vehicles.find((v) => v.id === reservation.vehicleId);
  const inUse = Boolean(activeTrip && activeVehicle);
  const hasUnread = ALERTS.some((a) => !ackedAlerts.includes(a.id));

  return (
    <main className="screen screen-top">
      <ScreenHeader
        title={
          <>
            Olá, <span style={{ color: "var(--primary)" }}>{CURRENT_USER.firstName}</span>
          </>
        }
        subtitle={CURRENT_USER.branch}
        right={
          <>
            <ThemeToggle />
            <Link href="/alertas" className="icon-btn tap" aria-label="Alertas">
              <Bell size={18} strokeWidth={1.75} />
              {hasUnread && <span className={styles.badge} />}
            </Link>
          </>
        }
      />

      <div className="screen-body" style={{ padding: "0 20px 24px" }}>
        <section className={"card pop " + styles.hero}>
          <div className={styles.heroStatus}>
            {inUse ? <span className="live-dot" /> : <span className={styles.idleDot} />}
            <span className={styles.heroStatusLabel} style={{ color: inUse ? "var(--ok)" : "var(--fg-3)" }}>
              {inUse ? "EM USO · AO VIVO" : "VEÍCULO RESERVADO"}
            </span>
          </div>

          {vehicle && (
            <div className={styles.heroVehicle}>
              <div style={{ minWidth: 0 }}>
                <div className={styles.model}>{vehicle.model}</div>
                <div className={"mono " + styles.plate}>
                  {vehicle.plate} · {vehicle.color}
                </div>
              </div>
              <div className={"tile-icon " + styles.vehicleTile}>
                <Truck size={26} strokeWidth={1.75} />
              </div>
            </div>
          )}

          {inUse && vehicle && activeTrip ? (
            <>
              <div className={styles.stats}>
                <Stat label="Em uso" value={formatElapsed(now - activeTrip.startedAt)} />
                <Stat label="Distância" value={formatKm(activeTrip.distanceKm)} />
                <Stat label="Combust." value={vehicle.fuel + "%"} />
              </div>
              <div className={styles.actions}>
                <Link href="/mapa" className="btn btn-ghost tap" style={{ flex: 1 }}>
                  <MapPin size={18} strokeWidth={1.75} /> Ver no mapa
                </Link>
                <Link href="/checkin" className="btn btn-danger tap" style={{ flex: 1 }}>
                  <Square size={16} strokeWidth={2.4} /> Encerrar
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className={styles.idleText}>Você está sem veículo ativo. Faça check-out para iniciar uma viagem.</p>
              <Link href={vehicle ? `/checkout?veiculo=${vehicle.id}` : "/checkout"} className={"btn btn-primary btn-block tap " + styles.checkoutBtn}>
                <KeyRound size={20} strokeWidth={1.75} /> Fazer check-out
              </Link>
            </>
          )}
        </section>

        <h2 className="section-label" style={{ marginTop: 18 }}>
          Atalhos
        </h2>
        <div className={styles.shortcuts}>
          {SHORTCUTS.map(({ icon: Icon, label, href }) => {
            const content = (
              <>
                <div className={styles.shortcutIcon}>
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <span className={styles.shortcutLabel}>{label}</span>
              </>
            );
            return href ? (
              <Link key={label} href={href} className={"card tap " + styles.shortcut}>
                {content}
              </Link>
            ) : (
              <button key={label} type="button" className={"card tap " + styles.shortcut}>
                {content}
              </button>
            );
          })}
        </div>

        <SectionHead
          label="Próximas reservas"
          action={
            <button type="button" className="tap link-btn">
              Ver todas
            </button>
          }
        />
        <div className={styles.list}>
          {RESERVATIONS.map((r) => (
            <div key={r.id} className={"card " + styles.reservation}>
              <div className={"tile-icon " + styles.reservationIcon}>
                <Calendar size={18} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.when}>{r.when}</div>
                <div className={"ellipsis " + styles.purpose}>{r.purpose}</div>
                <div className={"mono " + styles.resVehicle}>{r.vehicle}</div>
              </div>
              <ChevronRight size={18} strokeWidth={1.75} style={{ color: "var(--fg-3)" }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
