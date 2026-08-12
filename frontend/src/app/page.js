import Link from "next/link";
import Header from "../components/Header";
import BookingFlow from "../components/BookingFlow";
import { checkAuth } from "./actions";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getInitialData() {
  try {
    const [profRes, servRes] = await Promise.all([
      fetch(`${API_URL}/profesionales`, { cache: "no-store" }),
      fetch(`${API_URL}/servicios`, { cache: "no-store" }),
    ]);

    if (!profRes.ok || !servRes.ok) {
      throw new Error("Error al obtener datos iniciales de la API.");
    }

    const profesionales = await profRes.json();
    const servicios = await servRes.json();

    return { profesionales, servicios, error: null };
  } catch (err) {
    console.error("Error fetching homepage data:", err);
    return { profesionales: [], servicios: [], error: "No se pudo conectar con el servidor." };
  }
}

export default async function HomePage() {
  const { profesionales, servicios, error } = await getInitialData();
  const auth = await checkAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#1C1A17] text-[#F2ECE2]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12">
        {/* Banner/Hero section styled according to Barber_DESIGN.md */}
        <section className="text-center md:text-left mb-12 border-b border-[#B08D57]/10 pb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#B08D57] tracking-tight">
            Reserva tu Estilo
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#F2ECE2]/70 max-w-xl">
            Corte, afeitado y cuidado personal con carácter y tradición. Selecciona tu profesional para ver sus horarios disponibles.
          </p>
        </section>

        {error ? (
          <div className="rounded border border-[#8A3B2E]/40 bg-[#8A3B2E]/10 p-6 text-center">
            <h3 className="font-display text-lg font-bold text-[#8A3B2E] mb-2">Conexión no disponible</h3>
            <p className="text-sm text-[#F2ECE2]/80">{error}</p>
            <p className="text-xs text-[#F2ECE2]/50 mt-4">Por favor, asegúrate de que el backend esté corriendo en {API_URL}.</p>
          </div>
        ) : (
          <BookingFlow
            profesionales={profesionales}
            servicios={servicios}
            isAuthenticated={!!auth}
          />
        )}
      </main>

      <footer className="border-t border-[#B08D57]/10 bg-[#26221D] py-8 text-center text-xs text-[#F2ECE2]/40">
        <p>© {new Date().getFullYear()} Barber Barbería. Hecho con estilo y tradición.</p>
      </footer>
    </div>
  );
}

// modified

// modified

// modified

// modified
