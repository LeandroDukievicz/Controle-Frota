"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  CircleCheck,
  ChevronLeft,
  Clock,
  Fuel,
  Gauge,
  Octagon,
  Share2,
  Sparkles,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { StylizedMap } from "@/components/StylizedMap";
import { RouteLine, Stat, StatusChip } from "@/components/ui";
import { getTripAnalysis, type AiFinding } from "@/lib/data";
import { formatElapsed, formatKm } from "@/lib/format";
import { useNow, useStore } from "@/lib/store";
import styles from "./trip.module.css";

const FINDING_ICON: Record<AiFinding["icon"], LucideIcon> = {
  alert: TriangleAlert,
  clock: Clock,
  gauge: Gauge,
  fuel: Fuel,
  check: CircleCheck,
};
const FINDING_COLOR: Record<AiFinding["kind"], string> = {
  warn: "var(--warn)",
  info: "var(--info)",
  ok: "var(--ok)",
  neutral: "var(--fg-2)",
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trips, activeTrip, reviewedTrips, markReviewed } = useStore();
  const now = useNow();
  const trip = trips.find((t) => t.id === id);

  const back = () => (window.history.length > 1 ? router.back() : router.push("/historico"));

  if (!trip) {
    return (
      <main className="screen screen-top">
        <div className={styles.notFound}>
          <div className={styles.notFoundTitle}>Trajeto não encontrado</div>
          <Link href="/historico" className="btn btn-ghost tap">
            Voltar ao histórico
          </Link>
        </div>
      </main>
    );
  }

  const live = trip.id === activeTrip?.tripId;
  const distance = live ? activeTrip.distanceKm : trip.distance;
  const duration = live ? formatElapsed(now - activeTrip.startedAt) : trip.duration;
  const isSuspicious = trip.status === "suspicious";
  const analysis = getTripAnalysis(trip);
  const reviewed = reviewedTrips.includes(trip.id);

  const share = async () => {
    const data = { title: "FleetGuard · Trajeto", text: `${trip.driver} — ${trip.from} → ${trip.to}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {
      // User cancelled the share sheet.
    }
  };

  return (
    <main className="screen">
      <div className={styles.mapHeader}>
        <StylizedMap withRoute />
        <div className={styles.topBar}>
          <button type="button" onClick={back} className="icon-btn-float tap" aria-label="Voltar">
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={share} className={"card tap " + styles.shareBtn}>
            <Share2 size={16} strokeWidth={1.75} /> <span>Compartilhar</span>
          </button>
        </div>
      </div>

      <div className="screen-body screen-body-safe" style={{ padding: "16px 20px 24px" }}>
        <div className={styles.titleRow}>
          <div style={{ minWidth: 0 }}>
            <h1 className={styles.driver}>{trip.driver}</h1>
            <div className={"mono " + styles.vehicle}>{trip.vehicle}</div>
            <div className={styles.when}>
              {trip.date} · {trip.time}
            </div>
          </div>
          <StatusChip status={trip.status} />
        </div>

        <div className={styles.route}>
          <RouteLine kind="from" text={trip.from} dim />
          <RouteLine kind="to" text={trip.to} bold={isSuspicious} />
        </div>

        <section className={"card pop " + styles.ai}>
          <div className={styles.aiHead}>
            <div className={styles.aiBadge}>
              <Sparkles size={16} strokeWidth={2.2} />
            </div>
            <h2 className={"ai-gradient-text " + styles.aiTitle}>Resumo IA</h2>
            <span className={"chip " + styles.beta}>BETA</span>
          </div>

          <ul className={styles.findings}>
            {analysis.findings.map((f, i) => {
              const Icon = FINDING_ICON[f.icon];
              return (
                <li key={i} className={styles.finding}>
                  <Icon size={16} strokeWidth={2} style={{ color: FINDING_COLOR[f.kind], marginTop: 1 }} />
                  <span>{f.text}</span>
                </li>
              );
            })}
          </ul>

          <div className={styles.aiFoot}>
            <span className={styles.aiMeta}>Gerado às {trip.time} · modelo route-v3</span>
            {reviewed ? (
              <span className={styles.reviewed}>
                <Check size={14} strokeWidth={2.4} /> Revisado
              </span>
            ) : (
              <button type="button" className="tap link-btn" onClick={() => markReviewed(trip.id)}>
                Marcar como revisado
              </button>
            )}
          </div>
        </section>

        <div className={styles.metrics}>
          <Stat label="Distância" value={formatKm(distance)} />
          <Stat label="Duração" value={duration} />
          <Stat label="Vel. média" value={trip.avgSpeed + " km/h"} />
        </div>

        <section className={"card " + styles.score}>
          <div className={styles.scoreHead}>
            <div>
              <div className={styles.scoreLabel}>SCORE DE DIREÇÃO</div>
              <div className={"num " + styles.scoreValue}>
                {analysis.score}
                <span className={styles.scoreMax}>/100</span>
              </div>
            </div>
            <ScoreRing value={analysis.score} />
          </div>
          <div className={styles.scoreItems}>
            <ScoreItem icon={Zap} label="Acelerações" value={analysis.accelerations} bad={isSuspicious} />
            <ScoreItem icon={Octagon} label="Frenagens" value={analysis.brakings} bad={isSuspicious} />
            <ScoreItem icon={Gauge} label="Excesso vel." value={analysis.speeding} bad={isSuspicious} />
          </div>
        </section>
      </div>
    </main>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = value >= 80 ? "var(--ok)" : value >= 60 ? "var(--warn)" : "var(--danger)";
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`Score ${value} de 100`}>
      <circle cx="32" cy="32" r={r} stroke="var(--border)" strokeWidth="6" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={r}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}

function ScoreItem({ icon: Icon, label, value, bad }: { icon: LucideIcon; label: string; value: number; bad: boolean }) {
  return (
    <div className={styles.scoreItem}>
      <Icon size={14} strokeWidth={2} style={{ color: bad ? "var(--warn)" : "var(--fg-2)" }} />
      <div className={"num " + styles.scoreItemValue}>{value}</div>
      <div className={styles.scoreItemLabel}>{label}</div>
    </div>
  );
}
