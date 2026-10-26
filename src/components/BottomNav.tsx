"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, House, LayoutGrid, List, Map as MapIcon, type LucideIcon } from "lucide-react";
import styles from "./BottomNav.module.css";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Início", icon: House },
  { href: "/mapa", label: "Mapa", icon: MapIcon },
  { href: "/historico", label: "Histórico", icon: List },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/frota", label: "Frota", icon: LayoutGrid },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <div className={styles.grid}>
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={styles.item + " tap" + (active ? " " + styles.active : "")}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.75} />
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
