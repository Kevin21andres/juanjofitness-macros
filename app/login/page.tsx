"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
      <div className="w-full max-w-sm bg-[#111111] p-8 rounded-2xl border border-white/10">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Acceso privado
        </h1>
        <p className="text-sm text-white/70 mb-6">
          Herramienta interna Juanjo Fitness
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="juanjo@email.com"
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-accent)] text-white py-2 rounded-lg font-medium hover:brightness-110 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
