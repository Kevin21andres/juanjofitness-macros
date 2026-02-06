// app/components/MacroCircle.tsx
type Props = {
  label: string;
  grams: number;
  percent: number;
  color: string;
};

export default function MacroCircle({
  label,
  grams,
  percent,
  color,
}: Props) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120">
        {/* fondo */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
          fill="none"
        />

        {/* progreso */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />

        {/* texto */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="6"
          className="fill-white text-lg font-semibold"
        >
          {grams.toFixed(0)}g
        </text>
      </svg>

      <p className="text-sm text-white/80">{label}</p>
      <p className="text-xs text-white/40">{percent.toFixed(0)}%</p>
    </div>
  );
}
