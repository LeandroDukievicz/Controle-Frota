"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Fuel, MapPin, Play, Truck } from "lucide-react";
import { PhotoCapture } from "@/components/PhotoCapture";
import { FuelGauge } from "@/components/FuelGauge";
import { ScreenHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import styles from "../flow.module.css";

const PURPOSE_MAX = 280;

function CheckoutForm() {
  const { vehicles, activeTrip, checkout } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const available = vehicles.filter((v) => v.status === "available");
  const preselected = available.find((v) => v.id === params.get("veiculo"))?.id;

  const [vehicleId, setVehicleId] = useState(preselected ?? available[0]?.id ?? "");
  const vehicle = available.find((v) => v.id === vehicleId);
  const [odo, setOdo] = useState(String(vehicle?.odo ?? ""));
  const [destination, setDestination] = useState("Av. Hortênsias, 1820 — Sarandi-PR");
  const [purpose, setPurpose] = useState(
    "Visita técnica ao cliente Distribuidora Athos — entrega de amostras e verificação de estoque na filial Sarandi.",
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // A driver can only hold one vehicle at a time.
  useEffect(() => {
    if (activeTrip && !submitted) router.replace("/");
  }, [activeTrip, submitted, router]);

  const odoValue = Number(odo.replace(/\D/g, ""));
  const errors = {
    vehicle: !vehicle ? "Selecione um veículo." : "",
    odo: !odo || (vehicle && odoValue < vehicle.odo) ? `Informe um valor ≥ ${vehicle?.odo.toLocaleString("pt-BR") ?? 0} km.` : "",
    destination: destination.trim() ? "" : "Informe o destino.",
    purpose: purpose.trim().length >= 10 ? "" : "Descreva o motivo da saída (mín. 10 caracteres).",
    photos: photos.length ? "" : "Anexe ao menos uma foto do veículo.",
  };
  const valid = Object.values(errors).every((e) => !e);
  const [showErrors, setShowErrors] = useState(false);

  const selectVehicle = (id: string) => {
    setVehicleId(id);
    const v = available.find((x) => x.id === id);
    if (v) setOdo(String(v.odo));
  };

  const submit = () => {
    if (!valid || !vehicle) {
      setShowErrors(true);
      return;
    }
    setSubmitted(true);
    checkout({ vehicleId: vehicle.id, startOdo: odoValue, destination: destination.trim(), purpose: purpose.trim() });
    router.replace("/mapa");
  };

  const err = (key: keyof typeof errors) =>
    showErrors && errors[key] ? <p className={styles.error}>{errors[key]}</p> : null;

  return (
    <main className="screen screen-top">
      <ScreenHeader title="Check-out de veículo" onBack={() => router.back()} />
      <div className="screen-body screen-body-safe" style={{ padding: "0 20px 24px" }}>
        <h2 className="section-label">Veículo</h2>
        <div className={styles.vehicleList} role="radiogroup" aria-label="Veículo">
          {available.map((v) => {
            const sel = vehicleId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => selectVehicle(v.id)}
                className={"tap " + styles.vehicleOption + (sel ? " " + styles.vehicleSelected : "")}
              >
                <div className={"tile-icon " + styles.vehicleIcon}>
                  <Truck size={22} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.vehicleModel}>{v.model}</div>
                  <div className={"mono " + styles.vehiclePlate}>
                    {v.plate} · {v.color}
                  </div>
                </div>
                <div className={styles.vehicleMeta}>
                  <span className={"num " + styles.vehicleFuel}>
                    <Fuel size={12} strokeWidth={2} /> {v.fuel}%
                  </span>
                  <span className={styles.radio + (sel ? " " + styles.radioOn : "")}>
                    {sel && <Check size={14} strokeWidth={3} />}
                  </span>
                </div>
              </button>
            );
          })}
          {available.length === 0 && <p className={styles.empty}>Nenhum veículo disponível no momento.</p>}
        </div>
        {err("vehicle")}

        <div className={styles.twoCol}>
          <div>
            <label htmlFor="odo" className="field-label">
              Hodômetro inicial (km)
            </label>
            <input
              id="odo"
              className="field mono num"
              inputMode="numeric"
              value={odo}
              onChange={(e) => setOdo(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <span className="field-label">Combustível atual</span>
            <FuelGauge value={vehicle?.fuel ?? 0} />
          </div>
        </div>
        {err("odo")}

        <div className={styles.group}>
          <label htmlFor="destination" className="field-label">
            Destino previsto
          </label>
          <div className="field-wrap">
            <MapPin size={18} strokeWidth={1.75} className="field-icon" />
            <input id="destination" className="field" value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
          {err("destination")}
        </div>

        <div className={styles.group}>
          <label htmlFor="purpose" className={"field-label " + styles.labelRow}>
            <span>Justificativa da saída</span>
            <span className={styles.counter}>
              {purpose.length}/{PURPOSE_MAX}
            </span>
          </label>
          <textarea
            id="purpose"
            className={"field " + styles.textarea}
            rows={4}
            value={purpose}
            maxLength={PURPOSE_MAX}
            onChange={(e) => setPurpose(e.target.value)}
          />
          {err("purpose")}
        </div>

        <div className={styles.group}>
          <span className="field-label">Foto do veículo (estado de saída)</span>
          <PhotoCapture title="Tirar foto frontal + traseira" hint="Obrigatório para liberar a saída" onChange={setPhotos} />
          {err("photos")}
        </div>

        <button type="button" onClick={submit} className={"btn btn-primary btn-block tap " + styles.primaryCta}>
          <Play size={18} strokeWidth={2.4} /> Iniciar uso
        </button>
        <button type="button" onClick={() => router.back()} className={"btn btn-ghost btn-block tap " + styles.secondaryCta}>
          Cancelar
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="screen" />}>
      <CheckoutForm />
    </Suspense>
  );
}
