import type { Metadata } from "next";
import { ProductLanding } from "./ProductLanding";

export const metadata: Metadata = {
  title: "FleetGuard — Controle de frota corporativa",
  description:
    "Check-out com foto e justificativa, rastreamento ao vivo, alertas e resumo por IA de cada trajeto. Saiba onde está cada veículo da sua frota — e por quê.",
};

export default function ProductPage() {
  return <ProductLanding />;
}
