// app/share/diet/[dietId]/page.tsx

import { getDietDetail } from "@/lib/dietsApi";
import MacroDonut from "@/app/components/MacroDonut";
export default async function SharedDietPage({

  params,

}: {

  params: { dietId: string };

}) {

  const diet = await getDietDetail(params.dietId);

  if (!diet) {

    return <p>Dieta no encontrada</p>;

  }

  return (
<div className="min-h-screen bg-[#0B0B0B] p-6">
<h1 className="text-2xl text-white mb-4">

        {diet.name}
</h1>

      {/* aquí reutilizas la vista */}
</div>

  );

}
 