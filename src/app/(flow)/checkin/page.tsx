"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Square, Truck } from "lucide-react";
import { PhotoCapture } from "@/components/PhotoCapture";
import { FuelGauge } from "@/components/FuelGauge";
import { RouteLine, ScreenHeader, Stat } from "@/components/ui";
import { formatElapsed, formatKm } from "@/lib/format";
import { useNow, useStore } from "@/lib/store";
import styles from "../flow.module.css";

const NOTES_MAX = 280;

export default function CheckinPage() {
  const { vehicles, activeTrip, checkin } = useStore();
  const router = useRouter();
  const now = useNow();
  const vehicle = activeTrip ? vehicles.find((v) => v.id === activeTrip.vehicleId) : undefined;

  // Snapshot the suggested values once; the live distance keeps ticking underneath.
  const [odo, setOdo] = useState(() =>
    activeTrip ? String(Math.round(activeTrip.startOdo + activeTrip.distanceKm)) : "",
  );
  const [fuel, setFuel] = useState(() => Math.max(0, (vehicle?.fuel ?? 0) - 6));
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!activeTrip && !submitted) router.replace("/");
  }, [activeTrip, submitted, router]);

  if (!activeTrip || !vehicle) return <div className="screen" />;

  const odoValue = Number(odo);
  const errors = {
    odo: odo && odoValue >= activeTrip.startOdo ? "" : `Informe um valor ≥ ${activeTrip.startOdo.toLocaleString("pt-BR")} km.`,
    photos: photos.length ? "" : "Anexe ao menos uma foto do veículo.",
  };
  const valid = Object.values(errors).every((e) => !e);
  const err = (key: keyof typeof errors) =>
    showErrors && errors[key] ? <p className={styles.error}>{errors[key]}</p> : null;

  const submit = () => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    setSubmitted(true);
    checkin({ endOdo: odoValue, fuel, notes: notes.trim() });
    router.replace("/");
  };

  return (
    <main className="screen screen-top">
      <ScreenHeader title="Encerrar uso" subtitle="Check-in de veículo" onBack={() => router.back()} />
      <div className="screen-body screen-body-safe" style={{ padding: "0 20px 24px" }}>
        <section className={"card " + styles.summary}>
          <div className={styles.summaryHead}>
            <span className="live-dot" />
            <span className={styles.summaryLabel}>EM USO · AO VIVO</span>
          </div>
          <div className={styles.summaryVehicle}>
            <div className={"tile-icon " + styles.vehicleIcon}>
              <Truck size={22} strokeWidth={1.75} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.vehicleModel}>{vehicle.model}</div>
              <div className={"mono " + styles.vehiclePlate}>
                {vehicle.plate} · {vehicle.color}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <RouteLine kind="to" text={activeTrip.destination} />
          </div>
          <div className={styles.summaryStats}>
            <Stat label="Em uso" value={formatElapsed(now - activeTrip.startedAt)} />
            <Stat label="Distância" value={formatKm(activeTrip.distanceKm)} />
            <Stat label="Hod. inicial" value={<span className="mono">{activeTrip.startOdo.toLocaleString("pt-BR")}</span>} />
          </div>
        </section>

        <div className={styles.group}>
          <label htmlFor="odo-final" className="field-label">
            Hodômetro final (km)
          </label>
          <input
            id="odo-final"
            className="field mono num"
            inputMode="numeric"
            value={odo}
            onChange={(e) => setOdo(e.target.value.replace(/\D/g, ""))}
          />
          {odoValue >= activeTrip.startOdo && (
            <p className={"num " + styles.delta}>
              Percorrido pelo hodômetro: {formatKm(odoValue - activeTrip.startOdo, false)}
            </p>
          )}
          {err("odo")}
        </div>

        <div className={styles.group}>
          <label htmlFor="fuel-final" className="field-label">
            Combustível na devolução
          </label>
          <FuelGauge value={fuel} />
          <input
            id="fuel-final"
            type="range"
            min={0}
            max={100}
            step={1}
            value={fuel}
            onChange={(e) => setFuel(Number(e.target.value))}
            className={styles.fuelSlider}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="notes" className={"field-label " + styles.labelRow}>
            <span>Observações / avarias</span>
            <span className={styles.counter}>
              {notes.length}/{NOTES_MAX}
            </span>
          </label>
          <textarea
            id="notes"
            className={"field " + styles.textarea}
            rows={3}
            maxLength={NOTES_MAX}
            placeholder="Ex.: risco na porta traseira, pneu calibrado, abastecido no Posto Ipiranga…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={styles.group}>
          <span className="field-label">Foto do veículo (estado de retorno)</span>
          <PhotoCapture title="Tirar foto frontal + traseira" hint="Obrigatório para encerrar o uso" onChange={setPhotos} />
          {err("photos")}
        </div>

        <button type="button" onClick={submit} className={"btn btn-danger btn-block tap " + styles.primaryCta}>
          <Square size={16} strokeWidth={2.4} /> Encerrar uso
        </button>
        <button type="button" onClick={() => router.back()} className={"btn btn-ghost btn-block tap " + styles.secondaryCta}>
          Cancelar
        </button>
      </div>
    </main>
  );
}
