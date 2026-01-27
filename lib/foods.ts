export type Food = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const FOODS: Food[] = [
  {
    id: "pollo",
    name: "Pollo",
    kcal: 110,
    protein: 22,
    carbs: 0,
    fat: 2,
  },
  {
    id: "crema_arroz",
    name: "Crema de arroz",
    kcal: 360,
    protein: 8,
    carbs: 80,
    fat: 1,
  },
  {
    id: "proteina_iso",
    name: "Proteína ISO",
    kcal: 370,
    protein: 90,
    carbs: 2,
    fat: 1,
  },
];
