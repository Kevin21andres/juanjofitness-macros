// app/types/supplement.ts
export type SupplementItem = {
  id?: string;
  name: string;

  amount?: number;   // 5 | 2 | 300
  unit?: string;     // "g" | "mg" | "cápsulas" | "scoop"

  timing?: string;   // "pre", "post", "noche", etc
  notes?: string;
};
