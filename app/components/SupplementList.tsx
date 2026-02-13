// app/components/SupplementList.tsx
"use client";

import { SupplementItem } from "@/app/types/supplement";

type Props = {
  supplements: SupplementItem[];
  onChange: (next: SupplementItem[]) => void;
};

/* =========================
   CONSTANTES
========================= */

const UNITS = [
  "g",
  "mg",
  "µg",
  "ml",
  "cápsulas",
  "pastillas",
  "scoop",
  "gotas",
];

const SUPPLEMENTS = [
  "GFS",
  "PVP",
  "Pre-Work",
  "Omega 3",
  "CLA",
  "BCAAs + L-Glutamina",
  "R-ALA",
  "Selenio",
  "Amilopeptina",
  "Dextrosa",
  "Creatina",
  "Vitamina D3 + K2",
  "Androcell",
  "Magnesio",
  "ZMA",
  "NAC",
  "Detox",
  "V-Cool",
  "Saw Palmetto",
  "Sinefrina",
  "Fat Burner",
  "Melatonina",
  "Hierbas de la noche",
  "Magnesio + Calcio + Zinc",
  "Vitamina E",
  "Vitamina D",
  "Colágeno",
  "Multicell PRO",
  "Glutamina",
  "Drenacell",
  "Thermocell",
];

/* =========================
   COMPONENTE
========================= */

export default function SupplementList({
  supplements,
  onChange,
}: Props) {
  const addSupplement = () => {
    onChange([
      ...supplements,
      {
        id: crypto.randomUUID(),
        name: "",
        amount: undefined,
        unit: "",
      },
    ]);
  };

  const updateSupplement = <K extends keyof SupplementItem>(
    id: string,
    field: K,
    value: SupplementItem[K]
  ) => {
    onChange(
      supplements.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const removeSupplement = (id: string) => {
    onChange(supplements.filter((s) => s.id !== id));
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-white/70">💊 Suplementos</h4>
        <span className="text-xs text-white/40">
          {supplements.length}
        </span>
      </div>

      {/* Lista */}
      {supplements.length === 0 ? (
        <p className="text-xs text-white/40 italic">
          No hay suplementos añadidos
        </p>
      ) : (
        <div className="space-y-2">
          {supplements.map((supplement) => (
            <div
              key={supplement.id}
              className="grid grid-cols-[1fr_80px_110px_28px] gap-2 items-center"
            >
              {/* Nombre suplemento */}
              <input
                list="supplement-names"
                placeholder="Creatina, Omega 3…"
                value={supplement.name}
                onChange={(e) =>
                  updateSupplement(
                    supplement.id!,
                    "name",
                    e.target.value
                  )
                }
                className="input"
              />

              {/* Cantidad */}
              <input
                type="number"
                min="0"
                step="any"
                placeholder="5"
                value={supplement.amount ?? ""}
                onChange={(e) =>
                  updateSupplement(
                    supplement.id!,
                    "amount",
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value)
                  )
                }
                className="input text-right"
              />

              {/* Unidad */}
              <input
                list="supplement-units"
                placeholder="g, cápsulas…"
                value={supplement.unit ?? ""}
                onChange={(e) =>
                  updateSupplement(
                    supplement.id!,
                    "unit",
                    e.target.value
                  )
                }
                className="input"
              />

              {/* Eliminar */}
              <button
                onClick={() =>
                  removeSupplement(supplement.id!)
                }
                className="text-white/40 hover:text-red-400"
                title="Eliminar suplemento"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Datalists */}
      <datalist id="supplement-units">
        {UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <datalist id="supplement-names">
        {SUPPLEMENTS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* Acción */}
      <button
        type="button"
        onClick={addSupplement}
        className="text-xs text-[var(--color-accent)] hover:underline"
      >
        + Añadir suplemento
      </button>
    </section>
  );
}
