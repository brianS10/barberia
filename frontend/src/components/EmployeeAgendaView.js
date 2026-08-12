"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBloqueoAction, deleteBloqueoAction } from "../app/actions";

export default function EmployeeAgendaView({ initialData, selectedDate }) {
  const router = useRouter();
  const { citas = [], bloqueos = [] } = initialData;

  const [motivo, setMotivo] = useState("comida");
  const [horaInicio, setHoraInicio] = useState("13:00");
  const [horaFin, setHoraFin] = useState("14:00");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const formData = new FormData();
    formData.append("fecha", selectedDate);
    formData.append("hora_inicio", horaInicio);
    formData.append("hora_fin", horaFin);
    formData.append("motivo", motivo);

    const res = await createBloqueoAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      router.refresh();
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!confirm("¿Deseas eliminar este bloqueo de horario?")) return;

    const res = await deleteBloqueoAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  // Combine and sort events
  const events = [
    ...citas.map((c) => ({
      id: `c-${c.id}`,
      type: "cita",
      inicio: c.fecha_hora_inicio.split("T")[1].substring(0, 5),
      fin: c.fecha_hora_fin.split("T")[1].substring(0, 5),
      titulo: `${c.cliente} — ${c.servicio}`,
      estado: c.estado,
    })),
    ...bloqueos.map((b) => ({
      id: b.id,
      type: "bloqueo",
      inicio: b.fecha_hora_inicio.split("T")[1].substring(0, 5),
      fin: b.fecha_hora_fin.split("T")[1].substring(0, 5),
      titulo: `Bloqueo: ${b.motivo || "Sin motivo"}`,
    })),
  ].sort((a, b) => a.inicio.localeCompare(b.inicio));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Timeline Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between border-b border-[#B08D57]/10 pb-4">
          <h2 className="font-display text-2xl font-bold text-[#F2ECE2]">Agenda del Día</h2>
          <div className="font-mono text-sm text-[#B08D57]">
            {events.length} {events.length === 1 ? "evento registrado" : "eventos registrados"}
          </div>
        </div>

        {events.length === 0 ? (
          <div className="rounded border border-[#B08D57]/15 bg-[#26221D]/20 p-8 text-center text-[#F2ECE2]/60 text-sm">
            No tienes citas ni bloqueos programados para este día.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => {
              const isCita = ev.type === "cita";
              return (
                <div
                  key={ev.id}
                  className={`relative border rounded-lg p-4 flex items-center justify-between transition-all ${
                    isCita
                      ? "border-[#5C7A5C]/40 bg-[#5C7A5C]/5"
                      : "border-[#8A3B2E]/40 bg-[#8A3B2E]/5"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-bold text-[#B08D57]">
                        {ev.inicio} - {ev.fin}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isCita ? "bg-[#5C7A5C]/20 text-[#5C7A5C]" : "bg-[#8A3B2E]/20 text-red-400"
                        }`}
                      >
                        {isCita ? `Cita (${ev.estado})` : "Bloqueo"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#F2ECE2]">{ev.titulo}</p>
                  </div>

                  {!isCita && (
                    <button
                      onClick={() => handleDeleteBlock(ev.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold border border-red-950 bg-red-950/20 rounded px-2.5 py-1 transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Schedule Form Section */}
      <div className="rounded-lg border border-[#B08D57]/10 bg-[#26221D] p-6 shadow-lg h-fit">
        <h3 className="font-display text-xl font-bold text-[#B08D57] mb-4">Bloquear Horario</h3>
        <p className="text-xs text-[#F2ECE2]/60 mb-6">
          Previene reservas bloqueando parte de tu jornada laboral (por ejemplo, hora de comida, citas personales o capacitaciones).
        </p>

        {formError && (
          <div className="mb-4 rounded bg-[#8A3B2E]/10 border border-[#8A3B2E]/50 p-3 text-xs text-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
              Motivo
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none"
            >
              <option value="comida">Almuerzo / Comida</option>
              <option value="dia libre">Día libre</option>
              <option value="personal">Asunto personal</option>
              <option value="capacitacion">Capacitación</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                Hora Inicio
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
                className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                Hora Fin
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
                className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#B08D57] py-2.5 text-xs font-bold text-[#1C1A17] hover:bg-[#B08D57]/90 disabled:opacity-50 transition-colors shadow cursor-pointer mt-4"
          >
            {loading ? "Creando..." : "Crear Bloqueo"}
          </button>
        </form>
      </div>
    </div>
  );
}

// modified

// modified
