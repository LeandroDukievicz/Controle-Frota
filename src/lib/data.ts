// Mock data layer. Shapes mirror what a future API is expected to return.

export type VehicleStatus = "available" | "in-use" | "offline";
export type TripStatus = "in-progress" | "completed" | "suspicious";
export type AlertType = "offline" | "route" | "geofence" | "maintenance" | "speed";
export type Severity = "high" | "med" | "low";

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
  year: string;
  odo: number;
  status: VehicleStatus;
  fuel: number;
  driver?: string;
}

export interface Trip {
  id: string;
  driver: string;
  vehicle: string;
  date: string;
  time: string;
  duration: string;
  distance: number;
  status: TripStatus;
  from: string;
  to: string;
  avgSpeed: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  subtitle: string;
  time: string;
}

export interface Reservation {
  id: string;
  when: string;
  vehicleId: string;
  vehicle: string;
  purpose: string;
}

export const CURRENT_USER = {
  name: "Carolina Meneghetti",
  firstName: "Carolina",
  login: "carolina.meneghetti",
  branch: "Filial Maringá · Logística",
};

export const VEHICLES: Vehicle[] = [
  { id: "v1", model: "Fiat Strada Endurance", plate: "RKM-3F47", color: "Branca", year: "2024", odo: 18420, status: "available", fuel: 78 },
  { id: "v2", model: "VW Saveiro Robust", plate: "PRD-7H21", color: "Prata", year: "2023", odo: 42180, status: "in-use", fuel: 56, driver: "Carolina Meneghetti" },
  { id: "v3", model: "Renault Kwid Zen", plate: "MGA-4B92", color: "Cinza", year: "2024", odo: 9870, status: "available", fuel: 92 },
  { id: "v4", model: "Fiat Strada Freedom", plate: "RBL-1C08", color: "Vermelha", year: "2022", odo: 67420, status: "offline", fuel: 24, driver: "Rafael Tomé" },
  { id: "v5", model: "VW Saveiro Cross", plate: "QCA-9D15", color: "Preta", year: "2024", odo: 23110, status: "in-use", fuel: 68, driver: "Mateus Andrade" },
];

export const TRIPS: Trip[] = [
  { id: "t1", driver: "Carolina Meneghetti", vehicle: "VW Saveiro PRD-7H21", date: "Hoje", time: "08:42", duration: "2h 14min", distance: 47.3, status: "in-progress", from: "Centro de Distribuição — Sarandi", to: "Maringá Park, Maringá-PR", avgSpeed: 38 },
  { id: "t2", driver: "Mateus Andrade", vehicle: "VW Saveiro QCA-9D15", date: "Hoje", time: "07:10", duration: "1h 02min", distance: 18.6, status: "completed", from: "Av. Colombo, 5790", to: "Av. Brasil, 4400", avgSpeed: 32 },
  { id: "t3", driver: "Rafael Tomé", vehicle: "Fiat Strada RBL-1C08", date: "Ontem", time: "16:24", duration: "3h 47min", distance: 92.1, status: "suspicious", from: "Maringá-PR", to: "Mandaguaçu-PR (não previsto)", avgSpeed: 64 },
  { id: "t4", driver: "Carolina Meneghetti", vehicle: "VW Saveiro PRD-7H21", date: "Ontem", time: "09:00", duration: "1h 38min", distance: 33.2, status: "completed", from: "Filial Cidade Alta", to: "Cliente — Zona 7", avgSpeed: 41 },
  { id: "t5", driver: "Júlia Bertolini", vehicle: "Renault Kwid MGA-4B92", date: "23/04", time: "14:12", duration: "0h 48min", distance: 12.4, status: "completed", from: "Sede", to: "Posto Ipiranga — Av. Mandacaru", avgSpeed: 28 },
];

export const ALERTS: Alert[] = [
  { id: "a1", type: "offline", severity: "high", title: "Veículo offline há 18 min", subtitle: "Fiat Strada RBL-1C08 · Rafael Tomé", time: "agora" },
  { id: "a2", type: "route", severity: "high", title: "Rota incompatível com destino", subtitle: "VW Saveiro QCA-9D15 · Mateus Andrade", time: "12 min" },
  { id: "a3", type: "geofence", severity: "med", title: "Cerca geográfica violada", subtitle: "Saída de Maringá-PR às 14:08", time: "1h" },
  { id: "a4", type: "maintenance", severity: "low", title: "Revisão em 312 km", subtitle: "Fiat Strada RKM-3F47", time: "Hoje" },
  { id: "a5", type: "speed", severity: "med", title: "Pico de velocidade: 102 km/h", subtitle: "Av. Colombo · 11:44", time: "2h" },
];

export const RESERVATIONS: Reservation[] = [
  { id: "r1", when: "Amanhã · 08:00", vehicleId: "v1", vehicle: "Fiat Strada RKM-3F47", purpose: "Visita cliente — Sarandi" },
  { id: "r2", when: "Sex · 14:30", vehicleId: "v3", vehicle: "Renault Kwid MGA-4B92", purpose: "Manutenção preventiva" },
];

export const FLEET_UTILIZATION = { current: 72, deltaPp: 4, week: [42, 58, 51, 64, 70, 81, 72] };

export interface AiFinding {
  kind: "warn" | "info" | "ok" | "neutral";
  icon: "alert" | "clock" | "gauge" | "fuel" | "check";
  text: string;
}

export interface TripAnalysis {
  findings: AiFinding[];
  score: number;
  accelerations: number;
  brakings: number;
  speeding: number;
}

export function getTripAnalysis(trip: Trip): TripAnalysis {
  if (trip.status === "suspicious") {
    return {
      findings: [
        { kind: "warn", icon: "alert", text: "Destino real (Mandaguaçu) divergente do informado (Maringá)." },
        { kind: "info", icon: "clock", text: "Parada de 18 min em local não previsto — Posto Shell, BR-376." },
        { kind: "warn", icon: "gauge", text: "Pico de 102 km/h em via urbana às 16:48 (limite 60)." },
        { kind: "neutral", icon: "fuel", text: "Consumo médio: 11,4 km/l — dentro da faixa esperada." },
      ],
      score: 62,
      accelerations: 3,
      brakings: 5,
      speeding: 2,
    };
  }
  return {
    findings: [
      { kind: "ok", icon: "check", text: "Trajeto compatível com destino informado." },
      { kind: "info", icon: "clock", text: "Sem paradas não previstas — viagem direta." },
      { kind: "ok", icon: "gauge", text: "Velocidade dentro do esperado para a via." },
      { kind: "neutral", icon: "fuel", text: "Consumo médio: 13,2 km/l — eficiência boa." },
    ],
    score: 88,
    accelerations: 0,
    brakings: 1,
    speeding: 0,
  };
}
