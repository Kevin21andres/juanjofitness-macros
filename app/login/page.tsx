"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      {visible ? (
        <>
          <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7"/>
          <path d="M10.7 5.1a10 10 0 0 1 1.3-.1c5.7 0 9 7 9 7a14 14 0 0 1-2.1 3M6.5 6.5C4.2 8.1 3 12 3 12s3.3 7 9 7a8.8 8.8 0 0 0 4.1-1"/>
        </>
      ) : (
        <>
          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  );
}

function BrandLogo() {
  return (
    <Image
      src="/logo.png"
      alt="Juanjo Fitness"
      width={320}
      height={120}
      priority
      className="h-auto w-[148px] max-w-full object-contain sm:w-[168px]"
    />
  );
}

const fieldClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-[#3b4656] bg-[#0d121a] px-4 text-base text-[#f4f6fa] placeholder:text-[#8390a3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70b5ff] disabled:opacity-60 motion-reduce:transition-none";

export default function LoginPage() {
  const router = useRouter();
  const submitting = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;

    submitting.current = true;
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.status === 429
            ? "Demasiados intentos. Espera un momento antes de volver a intentarlo."
            : "No se ha podido iniciar sesión. Revisa tus datos e inténtalo de nuevo."
        );
        submitting.current = false;
        setLoading(false);
        return;
      }

      router.replace("/home");
    } catch {
      setError("No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo.");
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-[#0b0e14] text-[#f4f6fa]">
      <div className="mx-auto flex min-h-svh w-full max-w-[1440px] flex-col justify-center px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto grid w-full max-w-[1120px] min-w-0 overflow-hidden rounded-none lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:rounded-[28px] lg:border lg:border-[#293241] lg:bg-[#111720]">
          {/* Brand panel: desktop only, no essential information hidden on mobile. */}
          <aside className="relative hidden min-w-0 flex-col justify-between overflow-hidden bg-[#111d2c] p-10 lg:flex xl:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#1d3658_0%,transparent_65%)]"/>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 size-[460px] rounded-full border border-[#364c68]/60"/>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-28 size-[360px] rounded-full border border-[#364c68]/50"/>
            <div className="relative">
              <BrandLogo />
            </div>

            <div className="relative my-16 space-y-6 xl:my-20">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9bcaff]">
                <span className="h-px w-7 bg-[#70b5ff]"/>
                Espacio profesional
              </div>
              <p className="max-w-[360px] text-[clamp(2.25rem,3.25vw,3rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-white">
                Nutrición con propósito.
              </p>
              <p className="max-w-[330px] text-base leading-7 text-[#b7c5d7]">
                Organiza tus clientes, diseña sus planes nutricionales y gestiona cada seguimiento desde un mismo espacio.
              </p>
            </div>

            <div className="relative border-t border-[#3b4e65] pt-5 text-sm text-[#b7c5d7]">
              JuanjoFitness <span aria-hidden="true" className="mx-2 text-[#7791b2]">/</span> Panel nutricional
            </div>
          </aside>

          {/* Sign-in form */}
          <section aria-labelledby="login-title" className="flex min-w-0 flex-col justify-center px-0 py-5 sm:px-6 lg:min-h-[620px] lg:px-12 lg:py-14 xl:px-16">
            <div className="mx-auto w-full max-w-[400px] min-w-0">
              <div className="mb-10 lg:hidden">
                <BrandLogo />
              </div>

              <header className="mb-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#80bcff]">Acceso privado</p>
                <h1 id="login-title" className="text-[clamp(1.875rem,5vw,2.5rem)] font-semibold leading-tight tracking-[-0.035em] text-[#f4f6fa]">
                  Iniciar sesión
                </h1>
                <p className="text-sm leading-6 text-[#b1bdce] sm:text-base">
                  Accede a tu panel de gestión nutricional.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#e3e9f1]">
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="email"
                    required
                    value={email}
                    disabled={loading}
                    onChange={(event) => { setEmail(event.target.value); if (error) setError(null); }}
                    placeholder="nombre@correo.com"
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-[#e3e9f1]">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={password}
                      disabled={loading}
                      onChange={(event) => { setPassword(event.target.value); if (error) setError(null); }}
                      placeholder="Introduce tu contraseña"
                      className={fieldClass + " pr-14"}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-controls="login-password"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={loading}
                      className="absolute inset-y-0 right-0.5 flex min-h-11 w-12 items-center justify-center rounded-lg text-[#a8b5c7] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#70b5ff] disabled:opacity-60"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#a94e57] bg-[#321c26] p-3 text-sm leading-5 text-[#ffd2d5]">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 size-5 shrink-0">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7.5v5m0 3v1" strokeLinecap="round"/>
                    </svg>
                    <p className="min-w-0 break-words">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1e90ff] px-4 py-3 text-sm font-semibold text-[#071421] transition-colors hover:bg-[#60b1ff] active:bg-[#82c2ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91caff] disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
                >
                  {loading ? (
                    <>
                      <span aria-hidden="true" className="size-4 rounded-full border-2 border-[#071421]/30 border-t-[#071421] motion-safe:animate-spin"/>
                      <span>Iniciando sesión…</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar al panel</span>
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                    </>
                  )}
                </button>
                <span role="status" className="sr-only">{loading ? "Iniciando sesión. Por favor, espera." : ""}</span>
              </form>

              <footer className="mt-8 flex items-center gap-2 border-t border-[#303a48] pt-5 text-xs leading-5 text-[#a8b5c7]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                Acceso reservado a usuarios autorizados.
              </footer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
