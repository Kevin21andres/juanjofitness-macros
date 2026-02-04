function MacroDonutPdf({
  protein,
  carbs,
  fat,
}: {
  protein: number;
  carbs: number;
  fat: number;
}) {
  const total = protein + carbs + fat || 1;

  const r = 38;
  const c = 2 * Math.PI * r;

  const pProtein = protein / total;
  const pCarbs = carbs / total;
  const pFat = fat / total;

  const degProtein = pProtein * 360;
  const degCarbs = pCarbs * 360;
  const degFat = pFat * 360;

  return (
    <Svg width={100} height={100} viewBox="0 0 100 100">
      {/* Base */}
      <Circle
        cx="50"
        cy="50"
        r={r}
        stroke="#E5E7EB"
        strokeWidth={10}
        fill="none"
      />

      {/* Proteína */}
      <Circle
        cx="50"
        cy="50"
        r={r}
        stroke={COLORS.protein}
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${pProtein * c} ${c}`}
        transform="rotate(-90 50 50)"
      />

      {/* Carbohidratos */}
      <Circle
        cx="50"
        cy="50"
        r={r}
        stroke={COLORS.carbs}
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${pCarbs * c} ${c}`}
        transform={`rotate(${degProtein - 90} 50 50)`}
      />

      {/* Grasas */}
      <Circle
        cx="50"
        cy="50"
        r={r}
        stroke={COLORS.fat}
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${pFat * c} ${c}`}
        transform={`rotate(${degProtein + degCarbs - 90} 50 50)`}
      />
    </Svg>
  );
}
