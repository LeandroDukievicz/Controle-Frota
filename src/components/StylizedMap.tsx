import { Truck } from "lucide-react";
import styles from "./StylizedMap.module.css";

/** Placeholder map until a real tile provider is wired in. */
export function StylizedMap({
  withRoute = false,
  animated = true,
  pin = !withRoute,
}: {
  withRoute?: boolean;
  animated?: boolean;
  pin?: boolean;
}) {
  return (
    <div className={styles.map} aria-hidden="true">
      <svg viewBox="0 0 390 600" preserveAspectRatio="none" className={styles.svg}>
        <defs>
          <linearGradient id="fg-map-park" x1="0" x2="1">
            <stop offset="0" stopColor="var(--ok-soft)" stopOpacity="0.7" />
            <stop offset="1" stopColor="var(--ok-soft)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d="M260,40 q40,-10 70,30 q20,40 -10,80 q-30,30 -80,10 q-30,-20 -10,-70 q10,-30 30,-50 z" fill="url(#fg-map-park)" opacity="0.7" />
        {/* avenues */}
        <g stroke="var(--border-2)" strokeWidth="14" fill="none">
          <path d="M-10,180 L420,150" />
          <path d="M-10,400 L420,420" />
          <path d="M70,-10 L100,650" />
          <path d="M280,-10 L260,650" />
        </g>
        {/* secondary streets */}
        <g stroke="var(--border)" strokeWidth="6" fill="none">
          <path d="M-10,80 L420,90" />
          <path d="M-10,260 L420,255" />
          <path d="M-10,330 L420,335" />
          <path d="M-10,500 L420,500" />
          <path d="M170,-10 L180,650" />
          <path d="M340,-10 L345,650" />
        </g>
        {/* lane center dashes */}
        <g stroke="var(--card)" strokeWidth="1.5" strokeDasharray="6 8" fill="none" opacity="0.9">
          <path d="M-10,180 L420,150" />
          <path d="M-10,400 L420,420" />
          <path d="M70,-10 L100,650" />
          <path d="M280,-10 L260,650" />
        </g>
        <g fontFamily="var(--font-inter), sans-serif" fontSize="9" fill="var(--fg-3)" fontWeight="500">
          <text x="14" y="146" transform="rotate(-2 14 146)">AV. COLOMBO</text>
          <text x="14" y="416" transform="rotate(2 14 416)">AV. BRASIL</text>
          <text x="108" y="60" transform="rotate(88 108 60)">R. NEO ALVES MARTINS</text>
          <text x="268" y="60" transform="rotate(-88 268 60)">AV. MANDACARU</text>
          <text x="282" y="80" fill="var(--ok)">PARQUE DO INGÁ</text>
        </g>

        {withRoute && (
          <g>
            <path
              className={animated ? "route-draw" : undefined}
              d="M60,520 Q90,440 130,420 T230,360 Q260,330 270,260 T210,150 Q170,110 140,80"
              stroke="var(--primary)"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="520" r="7" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
            <circle cx="140" cy="80" r="7" fill="var(--primary)" />
            <circle cx="140" cy="80" r="3" fill="var(--card)" />
          </g>
        )}
      </svg>

      {pin && (
        <div className={styles.pinAnchor}>
          <div className={styles.pin}>
            <div className="pin-pulse" />
            <div className={styles.pinHead}>
              <Truck size={18} strokeWidth={2.2} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
