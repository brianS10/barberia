import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import EmployeeAgendaView from "../../../components/EmployeeAgendaView";
import { checkAuth } from "../../actions";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getAgendaData(token, fecha) {
  try {
    const res = await fetch(`${API_URL}/empleado/agenda?fecha=${fecha}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { error: "unauthorized" };
      throw new Error("Error al obtener la agenda.");
    }

    return { data: await res.json(), error: null };
  } catch (err) {
    console.error("Fetch agenda error:", err);
    return { data: null, error: "No se pudo conectar con el servidor." };
  }
}

export default async function EmployeeAgendaPage({ searchParams }) {
  const auth = await checkAuth();

  if (!auth) {
    redirect("/login?error=Debes iniciar sesión para acceder.");
  }

  if (auth.rol !== "empleado" && auth.rol !== "admin") {
    redirect("/?error=No tienes permisos para acceder a esta sección.");
  }

  const { fecha } = await searchParams;
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDate = fecha || todayStr;

  const { data, error } = await getAgendaData(auth.token, selectedDate);

  if (error === "unauthorized") {
    redirect("/login?error=Sesión expirada o permisos insuficientes.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1C1A17] text-[#F2ECE2]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12">
        {/* Page title and date switcher */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#B08D57]/10 pb-6 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#B08D57]">Mi Agenda Laboral</h1>
            <p className="text-xs text-[#F2ECE2]/60 mt-1">
              Visualiza tus citas y bloquea horas específicas de tu jornada.
            </p>
          </div>

          <form method="GET" className="flex items-center space-x-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/60 font-sans">
              Fecha:
            </span>
            <input
              type="date"
              name="fecha"
              defaultValue={selectedDate}
              className="rounded border border-[#B08D57]/20 bg-[#26221D] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="rounded bg-[#B08D57]/10 border border-[#B08D57]/30 px-4 py-2 text-xs font-semibold text-[#B08D57] hover:bg-[#B08D57] hover:text-[#1C1A17] transition-all cursor-pointer"
            >
              Ir
            </button>
          </form>
        </div>

        {error ? (
          <div className="rounded border border-[#8A3B2E]/40 bg-[#8A3B2E]/10 p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          <EmployeeAgendaView initialData={data} selectedDate={selectedDate} />
        )}
      </main>
    </div>
  );
}

// modified

// modified

// modified
