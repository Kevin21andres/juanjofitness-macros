// app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDashboardStats } from "@/lib/dashboardApi";

type Stats = {
  clientsCount: number;
  dietsCount: number;
  lastActivity: string | null;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B]">
      <div className="max-w-6xl mx-auto space-y-14">

        {/* LOGO */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Juanjo Fitness Logo"
            width={320}
            height={120}
            className="object-contain"
          />
        </div>

        {/* HERO */}
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Panel de control
          </h1>
        </header>

        {/* ACCIONES PRINCIPALES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/calculator"
            className="group rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6 text-center
                       transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg"
          >
            <span className="text-5xl mb-4 block transition-transform group-hover:scale-110">
              🍽️
            </span>
            <p className="text-lg font-medium text-white">
              Calculadora de dieta
            </p>
            <p className="text-sm text-white/60 mt-1">
              Planifica comidas y macros
            </p>
          </Link>

          <Link
            href="/clients/new"
            className="group rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6 text-center
                       transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg"
          >
            <span className="text-5xl mb-4 block transition-transform group-hover:scale-110">
              ➕
            </span>
            <p className="text-lg font-medium text-white">
              Crear cliente
            </p>
            <p className="text-sm text-white/60 mt-1">
              Nuevo seguimiento
            </p>
          </Link>

          <Link
            href="/clients"
            className="group rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6 text-center
                       transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg"
          >
            <span className="text-5xl mb-4 block transition-transform group-hover:scale-110">
              👥
            </span>
            <p className="text-lg font-medium text-white">
              Ver clientes
            </p>
            <p className="text-sm text-white/60 mt-1">
              Gestionar actuales
            </p>
          </Link>
        </section>

        {/* MÉTRICAS */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-white/70">
            Resumen rápido
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6">
              <p className="text-xs text-white/50">
                Clientes activos
              </p>
              <p className="text-4xl font-semibold text-white mt-2">
                {stats ? stats.clientsCount : "—"}
              </p>
              <p className="text-xs text-white/40 mt-1">
                En seguimiento actual
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6">
              <p className="text-xs text-white/50">
                Dietas creadas
              </p>
              <p className="text-4xl font-semibold text-white mt-2">
                {stats ? stats.dietsCount : "—"}
              </p>
              <p className="text-xs text-white/40 mt-1">
                Totales en el sistema
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6">
              <p className="text-xs text-white/50">
                Última actividad
              </p>
              <p className="text-lg font-medium text-white mt-3">
                {stats?.lastActivity
                  ? new Date(stats.lastActivity).toLocaleDateString()
                  : "—"}
              </p>
              <p className="text-xs text-white/40 mt-1">
                Última dieta generada
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}