"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Fingerprint, LoaderCircle, Lock, ShieldCheck, User } from "lucide-react";
import { CURRENT_USER } from "@/lib/data";
import { useStore } from "@/lib/store";
import styles from "./login.module.css";

export default function LoginPage() {
  const { hydrated, authed, login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState(CURRENT_USER.login);
  const [pw, setPw] = useState("fleetguard");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && authed) router.replace("/");
  }, [hydrated, authed, router]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    // Mock auth round-trip.
    window.setTimeout(() => {
      login();
      router.replace("/");
    }, 700);
  };

  return (
    <main className="screen screen-top">
      <div className={"screen-body screen-body-safe " + styles.body}>
        <div>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <ShieldCheck size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className={styles.brandName}>FleetGuard</div>
              <div className={styles.brandTag}>Controle de frota corporativa</div>
            </div>
          </div>

          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Bem-vinda de volta.</h1>
            <p className={styles.heroSub}>Acesse com sua matrícula corporativa.</p>
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label htmlFor="login" className={styles.label}>
              Matrícula ou e-mail
            </label>
            <div className="field-wrap">
              <User size={18} strokeWidth={1.75} className="field-icon" />
              <input id="login" className="field" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <label htmlFor="password" className={styles.label} style={{ marginTop: 6 }}>
              Senha
            </label>
            <div className="field-wrap">
              <Lock size={18} strokeWidth={1.75} className="field-icon" />
              <input
                id="password"
                className="field"
                style={{ paddingRight: 44 }}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button
                type="button"
                className={"tap " + styles.eye}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPw ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
              </button>
            </div>

            <div className={styles.row}>
              <label className={styles.remember}>
                <input type="checkbox" defaultChecked className={styles.checkbox} />
                Manter conectada
              </label>
              <button type="button" className="tap link-btn" style={{ fontSize: 13 }}>
                Esqueci a senha
              </button>
            </div>

            <button type="submit" className={"btn btn-primary btn-block tap " + styles.cta} disabled={loading} aria-busy={loading}>
              {loading ? (
                <LoaderCircle size={20} className="spin" aria-label="Entrando" />
              ) : (
                <>
                  Entrar <ArrowRight size={18} strokeWidth={1.75} />
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            <span className={styles.or}>OU</span>
            <span />
          </div>

          <button type="button" onClick={() => submit()} className={"btn btn-ghost btn-block tap " + styles.cta}>
            <Fingerprint size={20} strokeWidth={2} /> Entrar com biometria
          </button>
        </div>

        <div className={styles.footer}>
          <Link href="/produto" className="link-btn">
            Conheça o FleetGuard →
          </Link>
          <div style={{ marginTop: 8 }}>
            v2.4.1 · Cliente: <span className="mono">PIROZZI LOG</span>
          </div>
        </div>
      </div>
    </main>
  );
}
