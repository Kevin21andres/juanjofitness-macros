type Props = {
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
};

export default function MacroDonut({
  protein,
  carbs,
  fat,
  kcal,
}: Props) {
  const safeProtein = Math.max(0, protein);
  const safeCarbs = Math.max(0, carbs);
  const safeFat = Math.max(0, fat);

  const total = safeProtein + safeCarbs + safeFat;
  if (total === 0) return null;

  /* =========================
     DIMENSIONES
  ========================= */
  const radius = 62;
  const stroke = 16;
  const size = 180;
  const center = size / 2;

  const circumference = 2 * Math.PI * radius;

  /* =========================
     PORCENTAJES
  ========================= */
  const proteinPct = safeProtein / total;
  const carbsPct = safeCarbs / total;
  const fatPct = safeFat / total;

  const proteinLen = circumference * proteinPct;
  const carbsLen = circumference * carbsPct;
  const fatLen = circumference * fatPct;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size}>
        {/* Fondo */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* PROTEÍNA */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#EF4444"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${proteinLen} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* CARBS */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#F59E0B"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${carbsLen} ${circumference}`}
          strokeDashoffset={-proteinLen}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* GRASAS */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#10B981"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${fatLen} ${circumference}`}
          strokeDashoffset={-(proteinLen + carbsLen)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* TEXTO CENTRAL */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="-6"
          className="fill-white text-xl font-semibold"
        >
          {Math.round(kcal)}
        </text>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="14"
          className="fill-white/50 text-xs"
        >
          kcal totales
        </text>
      </svg>

      {/* LEYENDA */}
      <div className="grid grid-cols-3 gap-6 text-xs text-white/80">
        <div className="flex flex-col items-center">
          <span className="text-red-400 font-medium">
            Proteína
          </span>
          <span>{safeProtein.toFixed(0)} g</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-amber-400 font-medium">
            Carbs
          </span>
          <span>{safeCarbs.toFixed(0)} g</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-emerald-400 font-medium">
            Grasas
          </span>
          <span>{safeFat.toFixed(0)} g</span>
        </div>
      </div>
    </div>
  );
}
