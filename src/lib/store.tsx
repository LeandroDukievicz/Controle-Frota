"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CURRENT_USER, TRIPS, VEHICLES, type Trip, type Vehicle } from "./data";
import { formatElapsed } from "./format";

export interface ActiveTrip {
  tripId: string;
  vehicleId: string;
  startedAt: number;
  startOdo: number;
  distanceKm: number;
  destination: string;
  purpose: string;
}

export interface CheckoutInput {
  vehicleId: string;
  startOdo: number;
  destination: string;
  purpose: string;
}

export interface CheckinInput {
  endOdo: number;
  fuel: number;
  notes: string;
}

interface PersistedState {
  authed: boolean;
  dark: boolean;
  vehicles: Vehicle[];
  trips: Trip[];
  activeTrip: ActiveTrip | null;
  ackedAlerts: string[];
  reviewedTrips: string[];
}

interface Store extends PersistedState {
  hydrated: boolean;
  login: () => void;
  logout: () => void;
  toggleTheme: () => void;
  checkout: (input: CheckoutInput) => void;
  checkin: (input: CheckinInput) => void;
  ackAlert: (id: string) => void;
  ackAlerts: (ids: string[]) => void;
  markReviewed: (tripId: string) => void;
}

const STORAGE_KEY = "fleetguard:v1";
const DISTANCE_TICK_MS = 1500;

function seedState(): PersistedState {
  // Carolina is mid-trip in the seeded scenario (t1, VW Saveiro PRD-7H21).
  const startedAt = Date.now() - (2 * 60 + 14) * 60_000;
  return {
    authed: false,
    dark: false,
    vehicles: VEHICLES,
    trips: TRIPS,
    activeTrip: {
      tripId: "t1",
      vehicleId: "v2",
      startedAt,
      startOdo: 42133,
      distanceKm: 47.3,
      destination: "Maringá Park, Maringá-PR",
      purpose: "Entrega de mercadorias no Maringá Park.",
    },
    ackedAlerts: [],
    reviewedTrips: [],
  };
}

function loadState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seedState(), ...(JSON.parse(raw) as Partial<PersistedState>) };
  } catch {
    // Storage unavailable or corrupt: fall back to the seed.
  }
  return seedState();
}

function hhmm(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota / private-mode errors; state still lives in memory.
    }
  }, [state, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", state.dark);
  }, [state.dark]);

  // Simulated telemetry: the active vehicle keeps moving while a trip is open.
  const tripOpen = state.activeTrip !== null;
  useEffect(() => {
    if (!tripOpen) return;
    const id = window.setInterval(() => {
      setState((s) =>
        s.activeTrip
          ? { ...s, activeTrip: { ...s.activeTrip, distanceKm: Math.round((s.activeTrip.distanceKm + 0.1) * 10) / 10 } }
          : s,
      );
    }, DISTANCE_TICK_MS);
    return () => window.clearInterval(id);
  }, [tripOpen]);

  const login = useCallback(() => setState((s) => ({ ...s, authed: true })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, authed: false })), []);
  const toggleTheme = useCallback(() => setState((s) => ({ ...s, dark: !s.dark })), []);

  const checkout = useCallback((input: CheckoutInput) => {
    setState((s) => {
      const vehicle = s.vehicles.find((v) => v.id === input.vehicleId);
      if (!vehicle || s.activeTrip) return s;
      const now = Date.now();
      const tripId = "t" + now;
      const trip: Trip = {
        id: tripId,
        driver: CURRENT_USER.name,
        vehicle: `${vehicle.model.split(" ").slice(0, 2).join(" ")} ${vehicle.plate}`,
        date: "Hoje",
        time: hhmm(now),
        duration: "0h 00min",
        distance: 0,
        status: "in-progress",
        from: CURRENT_USER.branch.split(" · ")[0],
        to: input.destination,
        avgSpeed: 0,
      };
      return {
        ...s,
        vehicles: s.vehicles.map((v) =>
          v.id === vehicle.id ? { ...v, status: "in-use", driver: CURRENT_USER.name, odo: input.startOdo } : v,
        ),
        trips: [trip, ...s.trips],
        activeTrip: { tripId, vehicleId: vehicle.id, startedAt: now, startOdo: input.startOdo, distanceKm: 0, destination: input.destination, purpose: input.purpose },
      };
    });
  }, []);

  const checkin = useCallback((input: CheckinInput) => {
    setState((s) => {
      const at = s.activeTrip;
      if (!at) return s;
      const elapsedMs = Date.now() - at.startedAt;
      const distance = Math.max(at.distanceKm, input.endOdo - at.startOdo);
      const hours = elapsedMs / 3_600_000;
      return {
        ...s,
        vehicles: s.vehicles.map((v) =>
          v.id === at.vehicleId ? { ...v, status: "available", driver: undefined, odo: input.endOdo, fuel: input.fuel } : v,
        ),
        trips: s.trips.map((t) =>
          t.id === at.tripId
            ? {
                ...t,
                status: "completed",
                distance: Math.round(distance * 10) / 10,
                duration: formatElapsed(elapsedMs).replace(/m$/, "min"),
                avgSpeed: hours > 0 ? Math.round(distance / hours) : 0,
              }
            : t,
        ),
        activeTrip: null,
      };
    });
  }, []);

  const ackAlert = useCallback(
    (id: string) => setState((s) => (s.ackedAlerts.includes(id) ? s : { ...s, ackedAlerts: [...s.ackedAlerts, id] })),
    [],
  );
  const ackAlerts = useCallback(
    (ids: string[]) => setState((s) => ({ ...s, ackedAlerts: Array.from(new Set([...s.ackedAlerts, ...ids])) })),
    [],
  );
  const markReviewed = useCallback(
    (tripId: string) =>
      setState((s) => (s.reviewedTrips.includes(tripId) ? s : { ...s, reviewedTrips: [...s.reviewedTrips, tripId] })),
    [],
  );

  const value = useMemo<Store>(
    () => ({ ...state, hydrated, login, logout, toggleTheme, checkout, checkin, ackAlert, ackAlerts, markReviewed }),
    [state, hydrated, login, logout, toggleTheme, checkout, checkin, ackAlert, ackAlerts, markReviewed],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** Re-renders every `intervalMs` so elapsed-time labels stay current. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
