"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardX,
  Clock,
  Fuel,
  Gauge,
  KeyRound,
  Lock,
  MapPin,
  Moon,
  Navigation,
  Octagon,
  Play,
  Route,
  RouteOff,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Square,
  Sun,
  TriangleAlert,
  Truck,
  User,
  WifiOff,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AlertRow } from "@/components/AlertRow";
import { StylizedMap } from "@/components/StylizedMap";
import { Stat } from "@/components/ui";
import { ALERTS } from "@/lib/data";
import { formatElapsed, formatKm } from "@/lib/format";
import { useStore } from "@/lib/store";
import styles from "./produto.module.css";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const PROBLEMS: { icon: LucideIcon; problem: string; detail: string; answer: string }[] = [
  {
    icon: ClipboardX,
    problem: "Saídas sem justificativa",
    detail: "O carro sai, ninguém sabe para onde nem por quê. A chave vira o único controle.",
    answer: "Check-out obrigatório com destino, motivo e hodômetro antes de liberar o veículo.",
  },
  {
    icon: RouteOff,
    problem: "Rotas fora do previsto",
    detail: "Desvios, paradas longas e uso pessoal só aparecem — quando aparecem — na fatura de combustível.",
    answer: "Mapa ao vivo e alerta automático quando a rota diverge do destino informado.",
  },
  {
    icon: Camera,
    problem: "Avarias sem responsável",
    detail: "Um risco na porta descoberto dias depois não tem dono, data nem prova.",
    answer: "Foto obrigatória na saída e na devolução. Cada avaria tem data e motorista.",
  },
  {
    icon: Clock,
    problem: "Gestor sem tempo para planilhas",
    detail: "Conferir dezenas de trajetos linha a linha não escala.",
    answer: "Resumo por IA de cada viagem, com o que precisa de atenção já destacado.",
  },
];

type Audience = "driver" | "manager";
type MockId = "login" | "checkout" | "live" | "checkin" | "panel" | "alerts" | "ai" | "score";

const STEPS: Record<Audience, { mock: MockId; title: string; text: string }[]> = {
  driver: [
    { mock: "login", title: "Entre com a matrícula", text: "Acesso com matrícula corporativa ou biometria. Sem cadastro novo para o motorista." },
    { mock: "checkout", title: "Faça o check-out", text: "Escolha um veículo disponível, confirme o hodômetro, informe destino e motivo e tire a foto de saída." },
    { mock: "live", title: "Dirija normalmente", text: "A viagem é acompanhada em tempo real. O motorista não precisa fazer mais nada." },
    { mock: "checkin", title: "Devolva com check-in", text: "Hodômetro final, nível de combustível, observações e foto de retorno. O veículo volta a ficar disponível." },
  ],
  manager: [
    { mock: "panel", title: "Veja a frota de relance", text: "Quantos veículos estão em uso, disponíveis ou offline, e a utilização da semana." },
    { mock: "alerts", title: "Receba só o que importa", text: "Veículo offline, rota incompatível, cerca violada, excesso de velocidade e revisões próximas." },
    { mock: "ai", title: "Leia o resumo da viagem", text: "A IA compara destino informado e rota real, aponta paradas não previstas e picos de velocidade." },
    { mock: "score", title: "Acompanhe cada motorista", text: "Score de direção com acelerações, frenagens bruscas e excessos de velocidade por trajeto." },
  ],
};

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: KeyRound, title: "Check-out e check-in", text: "Fluxo guiado com validação de hodômetro, combustível e fotos." },
  { icon: Navigation, title: "Mapa ao vivo", text: "Posição, tempo de uso, distância e velocidade média em tempo real." },
  { icon: Sparkles, title: "Resumo por IA", text: "Cada trajeto analisado e resumido em quatro linhas objetivas." },
  { icon: Bell, title: "Alertas inteligentes", text: "Offline, rota, cerca geográfica, velocidade e manutenção." },
  { icon: Gauge, title: "Score de direção", text: "Indicador de 0 a 100 para orientar e reconhecer bons motoristas." },
  { icon: Wrench, title: "Manutenção preventiva", text: "Aviso de revisão por quilometragem antes do vencimento." },
  { icon: Smartphone, title: "Feito para o celular", text: "Funciona no navegador do celular, sem instalar nada. Pode ser adicionado à tela inicial." },
  { icon: Moon, title: "Tema claro e escuro", text: "Leitura confortável no pátio ao meio-dia ou na cabine à noite." },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. O FleetGuard roda no navegador do celular. Para acesso rápido, use “Adicionar à tela inicial” e ele abre como um app.",
  },
  {
    q: "O que o motorista precisa fazer no dia a dia?",
    a: "Só duas coisas: check-out antes de sair (cerca de um minuto) e check-in ao devolver. O acompanhamento durante a viagem é automático.",
  },
  {
    q: "Quem vê a localização do veículo?",
    a: "Apenas gestores autorizados, e somente enquanto o veículo está em uso — entre o check-out e o check-in.",
  },
  {
    q: "Como funciona o resumo por IA?",
    a: "Ao fim de cada trajeto, o FleetGuard compara o destino informado com a rota percorrida, identifica paradas não previstas, picos de velocidade e consumo, e gera um resumo curto. O gestor pode marcar o trajeto como revisado.",
  },
  {
    q: "Posso testar agora?",
    a: "Sim. O protótipo interativo está aberto: entre com os dados já preenchidos e navegue pelas telas de motorista e gestor.",
  },
];

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Adds the `visible` state once the element scrolls into view. */
function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

/** Simulated live telemetry for the demo phones. */
function useLiveDemo() {
  const [km, setKm] = useState(47.3);
  const [ms, setMs] = useState((2 * 60 + 14) * 60_000);
  useEffect(() => {
    const id = window.setInterval(() => {
      setKm((k) => Math.round((k + 0.1) * 10) / 10);
      setMs((m) => m + 60_000);
    }, 1500);
    return () => window.clearInterval(id);
  }, []);
  return { km, ms };
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealIn : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ProductLanding() {
  const { dark, toggleTheme } = useStore();

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a href="#topo" className={styles.brand}>
            <span className={styles.brandLogo}>
              <ShieldCheck size={18} strokeWidth={2.2} />
            </span>
            FleetGuard
          </a>
          <nav className={styles.navLinks} aria-label="Seções">
            <a href="#por-que">Por quê</a>
            <a href="#como-usar">Como usar</a>
            <a href="#recursos">Recursos</a>
            <a href="#faq">Dúvidas</a>
          </nav>
          <div className={styles.navActions}>
            <button type="button" className="icon-btn tap" onClick={toggleTheme} aria-label={dark ? "Tema claro" : "Tema escuro"}>
              {dark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
            </button>
            <Link href="/login" className={"btn btn-primary tap " + styles.navCta}>
              Abrir app
            </Link>
          </div>
        </div>
      </header>

      <main id="topo">
        <Hero />
        <WhySection />
        <HowSection />
        <FeaturesSection />
        <FaqSection />
        <FinalCta />
      </main>

      <footer className={styles.footer}>
        <span>
          <strong>FleetGuard</strong> · Controle de frota corporativa
        </span>
        <span className={styles.footerMuted}>Protótipo · dados fictícios</span>
      </footer>
    </div>
  );
}

function Hero() {
  const { km, ms } = useLiveDemo();
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.container + " " + styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <span className="live-dot" /> Controle de frota corporativa
          </span>
          <h1 className={styles.heroTitle}>
            Saiba onde está cada veículo da frota — <span className={styles.accent}>e por quê.</span>
          </h1>
          <p className={styles.heroLead}>
            O FleetGuard troca a chave na gaveta e a planilha de quilometragem por um fluxo simples no celular: o
            motorista justifica a saída, o gestor acompanha ao vivo e a IA aponta o que fugiu do combinado.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/login" className={"btn btn-primary tap " + styles.ctaLg}>
              Experimentar o protótipo <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <a href="#como-usar" className={"btn btn-ghost tap " + styles.ctaLg}>
              Ver como funciona
            </a>
          </div>
          <ul className={styles.heroChecks}>
            <li>
              <Check size={16} strokeWidth={2.4} /> Sem instalar app
            </li>
            <li>
              <Check size={16} strokeWidth={2.4} /> Check-out em ~1 minuto
            </li>
            <li>
              <Check size={16} strokeWidth={2.4} /> Motorista e gestor no mesmo lugar
            </li>
          </ul>
        </div>

        <div className={styles.heroVisual}>
          <Phone>
            <MockLive km={km} ms={ms} />
          </Phone>
          <div className={styles.floatCard + " " + styles.floatA}>
            <span className={styles.floatIcon} style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
              <RouteOff size={16} strokeWidth={2} />
            </span>
            <div>
              <div className={styles.floatTitle}>Rota incompatível</div>
              <div className={styles.floatSub}>QCA-9D15 · há 12 min</div>
            </div>
          </div>
          <div className={styles.floatCard + " " + styles.floatB}>
            <span className={styles.floatIcon} style={{ background: "var(--primary)", color: "var(--primary-fg)" }}>
              <Sparkles size={16} strokeWidth={2.2} />
            </span>
            <div>
              <div className={styles.floatTitle}>Resumo IA pronto</div>
              <div className={styles.floatSub}>Score de direção: 88/100</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <Reveal className={styles.sectionTitle}>
      <span className={styles.kicker}>{eyebrow}</span>
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </Reveal>
  );
}

function WhySection() {
  return (
    <section id="por-que" className={styles.section}>
      <div className={styles.container}>
        <SectionTitle
          eyebrow="Por que usar"
          title="O carro da empresa não pode ser uma caixa-preta"
          lead="Sem controle, o custo da frota aparece só no fim do mês — em combustível, multas e avarias sem dono. O FleetGuard resolve isso na origem: no momento em que a chave é retirada."
        />
        <div className={styles.problemGrid}>
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.problem} delay={i * 80}>
              <article className={"card " + styles.problem}>
                <span className={styles.problemIcon}>
                  <p.icon size={20} strokeWidth={1.9} />
                </span>
                <h3>{p.problem}</h3>
                <p className={styles.problemDetail}>{p.detail}</p>
                <div className={styles.answer}>
                  <CircleCheck size={16} strokeWidth={2} />
                  <span>{p.answer}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const AUTOPLAY_MS = 5000;

function HowSection() {
  const [audience, setAudience] = useState<Audience>("driver");
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const { km, ms } = useLiveDemo();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const steps = STEPS[audience];

  useEffect(() => {
    if (!autoplay || !visible) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, visible, step, steps.length]);

  const pick = (i: number) => {
    setStep(i);
    setAutoplay(false);
  };
  const switchAudience = (a: Audience) => {
    setAudience(a);
    setStep(0);
    setAutoplay(true);
  };

  return (
    <section id="como-usar" className={styles.section + " " + styles.sectionAlt}>
      <div className={styles.container}>
        <SectionTitle
          eyebrow="Como usar"
          title="Quatro passos para cada lado do volante"
          lead="Clique em um passo para ver a tela correspondente. Os passos avançam sozinhos até você escolher um."
        />

        <div className={styles.audienceSwitch}>
          <div className="seg" role="tablist" aria-label="Perfil">
            <button type="button" role="tab" aria-selected={audience === "driver"} className={audience === "driver" ? "active" : ""} onClick={() => switchAudience("driver")}>
              <User size={14} strokeWidth={2} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              Motorista
            </button>
            <button type="button" role="tab" aria-selected={audience === "manager"} className={audience === "manager" ? "active" : ""} onClick={() => switchAudience("manager")}>
              <ShieldCheck size={14} strokeWidth={2} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              Gestor
            </button>
          </div>
        </div>

        <div ref={ref} className={styles.howGrid}>
          <ol className={styles.steps}>
            {steps.map((s, i) => {
              const active = i === step;
              return (
                <li key={audience + i}>
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    className={styles.step + (active ? " " + styles.stepActive : "")}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span className={styles.stepBody}>
                      <span className={styles.stepTitle}>{s.title}</span>
                      <span className={styles.stepText}>{s.text}</span>
                    </span>
                    {active && autoplay && visible && (
                      <span key={audience + step} className={styles.stepProgress} style={{ animationDuration: AUTOPLAY_MS + "ms" }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={styles.howVisual}>
            <Phone>
              <div key={audience + step} className={styles.mockSwap}>
                <Mock id={steps[step].mock} km={km} ms={ms} />
              </div>
            </Phone>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="recursos" className={styles.section}>
      <div className={styles.container}>
        <SectionTitle eyebrow="Recursos" title="Tudo o que a operação precisa, nada que atrapalhe" />
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 60}>
              <article className={styles.feature}>
                <span className={styles.featureIcon}>
                  <f.icon size={18} strokeWidth={1.9} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className={styles.section + " " + styles.sectionAlt}>
      <div className={styles.container + " " + styles.faqWrap}>
        <SectionTitle eyebrow="Dúvidas" title="Perguntas frequentes" />
        <div className={styles.faqList}>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={"card " + styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQ}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{f.q}</span>
                  <ChevronDown size={18} strokeWidth={2} className={styles.faqChevron + (isOpen ? " " + styles.faqChevronOpen : "")} />
                </button>
                <div id={`faq-${i}`} className={styles.faqA + (isOpen ? " " + styles.faqAOpen : "")} role="region">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal>
          <div className={styles.finalCta}>
            <h2>Veja o FleetGuard funcionando</h2>
            <p>O protótipo já vem com um cenário real: um veículo em uso, alertas ativos e trajetos analisados pela IA.</p>
            <Link href="/login" className={"btn tap " + styles.finalBtn}>
              Abrir o protótipo <ArrowRight size={18} strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Phone mockups                                                       */
/* ------------------------------------------------------------------ */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className={styles.phone} aria-hidden="true">
      <div className={styles.phoneNotch} />
      <div className={styles.phoneScreen}>{children}</div>
    </div>
  );
}

function Mock({ id, km, ms }: { id: MockId; km: number; ms: number }) {
  switch (id) {
    case "login":
      return <MockLogin />;
    case "checkout":
      return <MockCheckout />;
    case "live":
      return <MockLive km={km} ms={ms} />;
    case "checkin":
      return <MockCheckin km={km} />;
    case "panel":
      return <MockPanel />;
    case "alerts":
      return <MockAlerts />;
    case "ai":
      return <MockAi />;
    case "score":
      return <MockScore />;
  }
}

function MockHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className={styles.mHeader}>
      <div className={styles.mTitle}>{title}</div>
      {sub && <div className={styles.mSub}>{sub}</div>}
    </div>
  );
}

function MockLogin() {
  return (
    <div className={styles.mBody} style={{ paddingTop: 48 }}>
      <div className={styles.mBrand}>
        <span className={styles.brandLogo}>
          <ShieldCheck size={16} strokeWidth={2.2} />
        </span>
        <div>
          <div style={{ fontWeight: 800 }}>FleetGuard</div>
          <div className={styles.mSub}>Controle de frota corporativa</div>
        </div>
      </div>
      <div className={styles.mTitle} style={{ marginTop: 36, fontSize: 20 }}>
        Bem-vinda de volta.
      </div>
      <div className={styles.mField} style={{ marginTop: 18 }}>
        <User size={14} /> carolina.meneghetti
      </div>
      <div className={styles.mField}>
        <Lock size={14} /> ••••••••
      </div>
      <div className={styles.mBtn}>
        Entrar <ArrowRight size={14} />
      </div>
      <div className={styles.mBtnGhost}>Entrar com biometria</div>
    </div>
  );
}

function MockCheckout() {
  return (
    <div className={styles.mBody}>
      <MockHeader title="Check-out de veículo" />
      <div className={styles.mLabel}>VEÍCULO</div>
      <div className={styles.mOption + " " + styles.mOptionOn}>
        <Truck size={16} /> <span style={{ flex: 1 }}>Fiat Strada Endurance</span>
        <span className={styles.mRadioOn}>
          <Check size={10} strokeWidth={3} />
        </span>
      </div>
      <div className={styles.mOption}>
        <Truck size={16} /> <span style={{ flex: 1 }}>Renault Kwid Zen</span>
        <span className={styles.mRadio} />
      </div>
      <div className={styles.mLabel}>DESTINO</div>
      <div className={styles.mField}>
        <MapPin size={14} /> Av. Hortênsias, 1820 — Sarandi
      </div>
      <div className={styles.mLabel}>JUSTIFICATIVA</div>
      <div className={styles.mField} style={{ alignItems: "flex-start", height: 52 }}>
        Visita técnica ao cliente Distribuidora Athos…
      </div>
      <div className={styles.mDrop}>
        <Camera size={16} /> Foto frontal + traseira
      </div>
      <div className={styles.mBtn}>
        <Play size={14} /> Iniciar uso
      </div>
    </div>
  );
}

function MockLive({ km, ms }: { km: number; ms: number }) {
  return (
    <div className={styles.mLive}>
      <StylizedMap />
      <div className={"card " + styles.mLivePill}>
        <span className="live-dot" /> <span style={{ color: "var(--ok)", fontWeight: 700 }}>AO VIVO</span>
      </div>
      <div className={"card " + styles.mLiveCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={"avatar"} style={{ width: 34, height: 34, fontSize: 12 }}>
            CM
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Carolina Meneghetti</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fg-2)", fontWeight: 600 }}>
              VW Saveiro · PRD-7H21
            </div>
          </div>
        </div>
        <div className={styles.mStats}>
          <Stat label="Em uso" value={formatElapsed(ms)} />
          <Stat label="Distância" value={formatKm(km)} />
        </div>
      </div>
    </div>
  );
}

function MockCheckin({ km }: { km: number }) {
  return (
    <div className={styles.mBody}>
      <MockHeader title="Encerrar uso" sub="Check-in de veículo" />
      <div className={"card " + styles.mCard}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>VW Saveiro Robust</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--fg-2)", fontWeight: 600 }}>
          PRD-7H21 · Prata
        </div>
      </div>
      <div className={styles.mLabel}>HODÔMETRO FINAL</div>
      <div className={styles.mField + " mono"}>{Math.round(42133 + km).toLocaleString("pt-BR")}</div>
      <div className={styles.mLabel}>COMBUSTÍVEL</div>
      <div className={styles.mField}>
        <Fuel size={14} /> 50%
        <span className={styles.mTrack}>
          <span style={{ width: "50%" }} />
        </span>
      </div>
      <div className={styles.mDrop}>
        <Camera size={16} /> Foto de retorno
      </div>
      <div className={styles.mBtn} style={{ background: "var(--danger)", color: "#fff" }}>
        <Square size={12} strokeWidth={2.6} /> Encerrar uso
      </div>
    </div>
  );
}

function MockPanel() {
  const kpis: [string, number, string, LucideIcon][] = [
    ["EM USO", 2, "var(--info)", Navigation],
    ["DISPONÍVEIS", 2, "var(--ok)", CircleCheck],
    ["OFFLINE", 1, "var(--danger)", WifiOff],
    ["CRÍTICOS", 2, "var(--warn)", TriangleAlert],
  ];
  return (
    <div className={styles.mBody}>
      <MockHeader title="Painel da frota" sub="Visão gestor · Maringá-PR" />
      <div className={styles.mKpis}>
        {kpis.map(([label, value, color, Icon]) => (
          <div key={label} className={"card " + styles.mKpi}>
            <span className={styles.mKpiIcon} style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, color }}>
              <Icon size={13} strokeWidth={2.2} />
            </span>
            <div className={styles.mKpiLabel}>{label}</div>
            <div className={"num " + styles.mKpiValue}>{value}</div>
          </div>
        ))}
      </div>
      <div className={"card " + styles.mCard}>
        <div className={styles.mKpiLabel}>UTILIZAÇÃO DA FROTA</div>
        <div className="num" style={{ fontWeight: 700, fontSize: 18 }}>72%</div>
        <div className={styles.mBars}>
          {[42, 58, 51, 64, 70, 81, 72].map((v, i) => (
            <span key={i} style={{ height: v + "%", background: i === 6 ? "var(--primary)" : "var(--primary-soft)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MockAlerts() {
  return (
    <div className={styles.mBody}>
      <MockHeader title="Alertas" sub="5 ativos · 2 críticos" />
      <div className={styles.mAlerts}>
        {ALERTS.slice(0, 4).map((a) => (
          <AlertRow key={a.id} alert={a} compact />
        ))}
      </div>
    </div>
  );
}

function MockAi() {
  const findings: [LucideIcon, string, string][] = [
    [TriangleAlert, "var(--warn)", "Destino real (Mandaguaçu) divergente do informado (Maringá)."],
    [Clock, "var(--info)", "Parada de 18 min em local não previsto — BR-376."],
    [Gauge, "var(--warn)", "Pico de 102 km/h em via urbana (limite 60)."],
  ];
  return (
    <div className={styles.mAiWrap}>
      <div className={styles.mAiMap}>
        <StylizedMap withRoute />
      </div>
      <div className={styles.mBody} style={{ paddingTop: 12 }}>
        <div className={"card " + styles.mAi}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className={styles.mAiBadge}>
              <Sparkles size={13} strokeWidth={2.2} />
            </span>
            <span className="ai-gradient-text" style={{ fontWeight: 700, fontSize: 13 }}>
              Resumo IA
            </span>
          </div>
          <ul className={styles.mFindings}>
            {findings.map(([Icon, color, text]) => (
              <li key={text}>
                <Icon size={13} strokeWidth={2} style={{ color, marginTop: 2 }} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MockScore() {
  const value = 62;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className={styles.mBody}>
      <MockHeader title="Rafael Tomé" sub="Fiat Strada RBL-1C08 · Ontem 16:24" />
      <div className={"card " + styles.mCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className={styles.mKpiLabel}>SCORE DE DIREÇÃO</div>
            <div className="num" style={{ fontWeight: 700, fontSize: 26 }}>
              {value}
              <span style={{ fontSize: 13, color: "var(--fg-3)" }}>/100</span>
            </div>
          </div>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} stroke="var(--border)" strokeWidth="6" fill="none" />
            <circle
              className={styles.ringAnim}
              cx="32"
              cy="32"
              r={r}
              stroke="var(--warn)"
              strokeWidth="6"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={c - (value / 100) * c}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ ["--ring-c" as string]: c }}
            />
          </svg>
        </div>
        <div className={styles.mScoreItems}>
          {(
            [
              [Zap, "3", "Acelerações"],
              [Octagon, "5", "Frenagens"],
              [Gauge, "2", "Excesso vel."],
            ] as [LucideIcon, string, string][]
          ).map(([Icon, v, label]) => (
            <div key={label}>
              <Icon size={13} strokeWidth={2} style={{ color: "var(--warn)" }} />
              <strong className="num">{v}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={"card " + styles.mCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <Route size={14} style={{ color: "var(--primary)" }} />
          <span>
            <strong>92,1 km</strong> · 3h 47min · média 64 km/h
          </span>
        </div>
      </div>
    </div>
  );
}
