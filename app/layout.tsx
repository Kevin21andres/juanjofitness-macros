import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={`${raleway.className} antialiased bg-[#0B0B0B]`}
      >
        <main className="bg-[#0B0B0B] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
