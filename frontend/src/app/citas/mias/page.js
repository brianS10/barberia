import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import CancelButton from "../../../components/CancelButton";
import { checkAuth } from "../../actions";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getMyAppointments(token) {
  try {
    const res = await fetch(`${API_URL}/citas/mias`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) return { error: "unauthorized" };
      throw new Error("Error al consultar citas.");
    }

    return { citas: await res.json(), error: null };
  } catch (err) {
    console.error("Fetch appointments error:", err);
    return { citas: [], error: "No se pudo conectar con el servidor." };
  }
}

export default async function MyAppointmentsPage() {
  const auth = await checkAuth();

  if (!auth) {
    redirect("/login?error=Debes iniciar sesión para ver tus citas.");
  }

  const { citas, error } = await getMyAppointments(auth.token);

  if (error === "unauthorized") {
    redirect("/login?error=Sesión expirada. Por favor inicia sesión nuevamente.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1C1A17] text-[#F2ECE2]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-[#B08D57] mb-8 border-b border-[#B08D57]/10 pb-4">
          Mis Turnos
        </h1>

        {error ? (
          <div className="rounded border border-[#8A3B2E]/40 bg-[#8A3B2E]/10 p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="rounded border border-[#B08D57]/20 bg-[#26221D]/40 p-8 text-center">
            <p className="text-sm text-[#F2ECE2]/60 mb-6">Aún no tienes citas — reserva tu primer corte</p>
            <Link
              href="/"
              className="rounded bg-[#B08D57] px-6 py-2.5 text-xs font-semibold text-[#1C1A17] hover:bg-[#B08D57]/90 transition-colors shadow-md inline-block"
            >
              Agendar ahora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {citas.map((c) => {
              const dateObj = new Date(c.fecha_hora_inicio);
              const isConfirmed = c.estado === "confirmada";
              const isLateCancel = c.estado === "cancelacion_tardia";
              const isCanceled = c.estado === "cancelada";
              const isCompleted = c.estado === "completada";

              return (
                <div
                  key={c.id}
                  className="ticket-dented ticket-dented-notches p-6 flex flex-col justify-between shadow-lg relative overflow-hidden"
                >
                  {/* Notch details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-[#B08D57]/10 pb-3 mb-3">
                      <span className="font-mono text-xs text-[#B08D57] font-bold">#FC-{c.id}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        isConfirmed ? "bg-[#5C7A5C]/20 text-[#5C7A5C] border border-[#5C7A5C]/40" :
                        isCanceled ? "bg-red-950/20 text-red-400 border border-red-900/40" :
                        isLateCancel ? "bg-orange-950/20 text-orange-400 border border-orange-900/40" :
                        "bg-[#B08D57]/20 text-[#B08D57] border border-[#B08D57]/40"
                      }`}>
                        {c.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#F2ECE2]/60 text-xs">Servicio:</span>
                        <span className="font-medium text-right">{c.servicio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F2ECE2]/60 text-xs">Barbero:</span>
                        <span className="font-medium text-right">{c.profesional}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F2ECE2]/60 text-xs">Fecha:</span>
                        <span className="font-mono text-[#B08D57] text-right">
                          {dateObj.toLocaleDateString("es-ES", {
                            dateStyle: "short",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F2ECE2]/60 text-xs">Hora:</span>
                        <span className="font-mono text-[#B08D57] text-right">
                          {dateObj.toLocaleTimeString("es-ES", {
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isConfirmed && (
                    <div className="mt-6 pt-3 border-t border-[#B08D57]/10">
                      <CancelButton citaId={c.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// modified
