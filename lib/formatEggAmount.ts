export function formatEggAmount(
  foodName: string,
  grams: number
): string {
  // Solo aplicamos lógica a huevos
  if (!foodName.toLowerCase().includes("huevo")) {
    return `${grams} g`;
  }

  // Convención: 1 huevo = 60 g
  const GRAMS_PER_EGG = 60;

  const eggs = grams / GRAMS_PER_EGG;

  // Redondeo a 0.5 huevos
  const roundedEggs = Math.round(eggs * 2) / 2;

  const label = roundedEggs === 1 ? "huevo" : "huevos";

  return `${roundedEggs} ${label} (${grams} g)`;
}
