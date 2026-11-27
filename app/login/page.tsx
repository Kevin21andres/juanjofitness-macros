"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type IconName = "eye" | "eye-off" | "arrow" | "lock" | "mail" | "alert" | "check";

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    eye: <><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/></>,
    "eye-off": <><path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M10.7 5.1a10 10 0 0 1 1.3-.1c5.7 0 9 7 9 7a14 14 0 0 1-2.1 3M6.5 6.5C4.2 8.1 3 12 3 12s3.3 7 9 7a8.8 8.8 0 0 0 4.1-1"/></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    alert: <><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5m0 3v1"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

function Logo() {
  return (
    <Image src="/logo.png" alt="Juanjo Fitness · JJHP" width={500} height={250} priority
      className="block h-auto w-32 object-contain sm:w-40"/>
  );
}

function BrandPanel() {
  return (
    <aside className="relative isolate hidden min-w-0 flex-col justify-between overflow-hidden rounded-[24px] border border-[#24363d] bg-[#101c22] p-9 lg:flex xl:p-12 2xl:p-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_88%_15%,#193b44_0%,transparent_60%)]"/>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(#527780_1px,transparent_1px),linear-gradient(90deg,#527780_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent_10%,black_85%)]"/>
      <div className="flex items-center justify-between gap-3">
        <Logo/>
        <span className="rounded-full border border-[#3a555c] px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] text-[#c0d0d5]">Área profesional</span>
      </div>
      <div className="relative my-9 max-w-[440px] space-y-5 xl:my-14">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#75e2e5]">
          <span className="h-px w-7 bg-[#75e2e5]"/> JuanjoFitness Macros
        </div>
        <p className="text-[clamp(2.25rem,3.5vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#f3f7f8]">
          Cada cliente.<br/>Cada objetivo.<br/><span className="text-[#55e0e4]">Cada detalle.</span>
        </p>
        <p className="max-w-[370px] text-[15px] leading-7 text-[#b7c8ce]">
          Tu espacio de trabajo para diseñar planes nutricionales y gestionar el seguimiento de tus clientes.
        </p>
      </div>
      <div className="relative rounded-2xl border border-[#34505a] bg-[#101b21]/90 p-5 xl:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[#e1edf0]">Planificación nutricional</span>
          <span aria-hidden="true" className="flex gap-1"><i className="size-1.5 rounded-full bg-[#55e0e4]"/><i className="size-1.5 rounded-full bg-[#527078]"/><i className="size-1.5 rounded-full bg-[#527078]"/></span>
        </div>
        <div aria-hidden="true" className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-[#273a42]">
          <span className="w-[38%] bg-[#55e0e4]"/><span className="w-[35%] bg-[#82aaf6]"/><span className="flex-1 bg-[#d6b775]"/>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-[#c1d0d5]">
          <span className="flex items-center gap-1.5"><i className="size-2 shrink-0 rounded-sm bg-[#55e0e4]"/>Proteínas</span>
          <span className="flex items-center gap-1.5"><i className="size-2 shrink-0 rounded-sm bg-[#82aaf6]"/>Carbohidratos</span>
          <span className="flex items-center gap-1.5"><i className="size-2 shrink-0 rounded-sm bg-[#d6b775]"/>Grasas</span>
        </div>
      </div>
      <p className="mt-6 text-xs text-[#a0b5bd]">Gestión de clientes · Dietas · Macronutrientes</p>
    </aside>
  );
}

type Feedback = { kind: "credentials" | "network" | "rate" | "service"; message: string };

const fieldClass = "block min-h-[52px] w-full min-w-0 rounded-xl border border-[#39454c] bg-[#11191e] py-3 pl-11 pr-4 text-base leading-6 text-[#f1f5f6] placeholder:text-[#91a1a8] transition-colors hover:border-[#60737a] focus-visible:border-[#55e0e4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55e0e4] read-only:opacity-70 motion-reduce:transition-none";

export default function LoginPage() {
  const router = useRouter();
  const submitting = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const busy = phase !== "idle";

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  function updateCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
  }

  function clearFeedback() {
    if (feedback) setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    // Read native fields, including values inserted by password managers.
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return;
    submitting.current = true;
    setFeedback(null);
    setPhase("loading");
    setShowPassword(false);
    setCapsLock(false);
    let authenticated = false;
    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.status === 429) {
          setFeedback({ kind: "rate", message: "Demasiados intentos. Espera un momento y vuelve a intentarlo." });
        } else if (error.status === 0 || error.name === "AuthRetryableFetchError") {
          setFeedback({ kind: "network", message: "No hemos podido conectar. Comprueba tu conexión y vuelve a intentarlo." });
        } else if (typeof error.status === "number" && error.status >= 500) {
          setFeedback({ kind: "service", message: "El servicio no está disponible temporalmente. Inténtalo de nuevo más tarde." });
        } else {
          setFeedback({ kind: "credentials", message: "No hemos podido iniciar sesión. Comprueba el correo y la contraseña." });
        }
        return;
      }
      authenticated = true;
      setPhase("success");
      router.replace("/home");
    } catch {
      authenticated = false;
      setFeedback({ kind: "network", message: "No hemos podido completar el acceso. Comprueba tu conexión y vuelve a intentarlo." });
    } finally {
      if (!authenticated) {
        submitting.current = false;
        setPhase("idle");
      }
    }
  }

  return (
    <div className="min-h-svh bg-[#0b1115] text-[#f1f5f6] [color-scheme:dark]">
      <div className="mx-auto grid min-h-svh w-full max-w-[1600px] min-w-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8 lg:p-6 xl:p-9">
        <BrandPanel/>
        <section aria-labelledby="login-title" className="flex min-w-0 flex-col justify-center py-4 sm:py-10 lg:px-6">
          <div className="mx-auto w-full max-w-[416px] min-w-0">
            <div className="mb-7 flex items-center justify-between gap-3 lg:hidden">
              <Logo/>
              <span className="text-right text-xs font-medium text-[#9cadb4]">Área profesional</span>
            </div>
            <header className="mb-7 sm:mb-9">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#75e2e5]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[#55e0e4]"/> Acceso privado
              </div>
              <h1 id="login-title" className="text-[clamp(1.95rem,5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.04em]">Iniciar sesión</h1>
              <p className="mt-3 max-w-[35ch] text-[15px] leading-6 text-[#aebdc4]">Accede a tu espacio de gestión nutricional.</p>
            </header>
            <form onSubmit={handleSubmit} aria-busy={busy} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[#e2eaed]">Correo electrónico</label>
                <div className="relative">
                  <Icon name="mail" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#91a1a8]"/>
                  <input id="login-email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} inputMode="email" required readOnly={busy} onInput={clearFeedback} placeholder="nombre@correo.com" className={fieldClass}/>
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-[#e2eaed]">Contraseña</label>
                <div className="relative">
                  <Icon name="lock" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#91a1a8]"/>
                  <input ref={passwordRef} id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" spellCheck={false} required readOnly={busy} onInput={clearFeedback} onKeyDown={updateCapsLock} onKeyUp={updateCapsLock} onBlur={() => setCapsLock(false)} aria-describedby={capsLock ? "caps-lock" : undefined} placeholder="Tu contraseña" className={fieldClass + " pr-14"}/>
                  <button type="button" aria-label="Mostrar contraseña" aria-pressed={showPassword} aria-controls="login-password" disabled={busy} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-[#aebdc4] hover:bg-[#26343a] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#55e0e4] disabled:opacity-60">
                    <Icon name={showPassword ? "eye-off" : "eye"}/>
                  </button>
                </div>
                {capsLock && <p id="caps-lock" role="status" className="mt-2 text-xs leading-5 text-[#f4d38c]">Bloq Mayús está activado.</p>}
              </div>
              {feedback && <div ref={feedbackRef} tabIndex={-1} role="alert" className="flex items-start gap-3 rounded-xl border border-[#a85d65] bg-[#321e25] p-3.5 text-sm leading-5 text-[#ffd2d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc1c8]">
                <Icon name="alert" className="mt-0.5 size-5 shrink-0"/>
                <div className="min-w-0"><p>{feedback.message}</p>{feedback.kind === "credentials" && <button type="button" onClick={() => passwordRef.current?.focus()} className="mt-2 min-h-11 rounded text-left font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc1c8]">Revisar contraseña</button>}</div>
              </div>}
              <button type="submit" disabled={busy} className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#55e0e4] px-4 py-3.5 text-[15px] font-bold text-[#07171b] transition-colors hover:bg-[#85edf0] active:bg-[#3fc8cc] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#86f0f1] disabled:cursor-wait motion-reduce:transition-none">
                {phase === "loading" ? <><span aria-hidden="true" className="size-[18px] shrink-0 rounded-full border-2 border-[#07171b]/25 border-t-[#07171b] motion-safe:animate-spin"/> Iniciando sesión…</> : phase === "success" ? <><Icon name="check"/> Accediendo al panel…</> : <>Entrar al panel <Icon name="arrow" className="size-[18px] transition-transform motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"/></>}
              </button>
            </form>
            <span role="status" className="sr-only">{phase === "loading" ? "Iniciando sesión, por favor espera." : phase === "success" ? "Sesión iniciada. Abriendo el panel." : ""}</span>
            <footer className="mt-8 border-t border-[#28353b] pt-5">
              <div className="flex items-start gap-2.5 text-xs leading-5 text-[#a6b6bd]"><Icon name="lock" className="mt-0.5 size-4 shrink-0"/><p>Acceso reservado a usuarios autorizados.<br/>Si necesitas recuperar el acceso, contacta con el administrador.</p></div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
