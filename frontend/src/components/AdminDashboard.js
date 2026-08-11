"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createServicioAction, createProfesionalAction } from "../app/actions";

export default function AdminDashboard({ agendaData, profesionales, servicios, selectedDate }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("agenda");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Create Service Form State
  const [servNombre, setServNombre] = useState("");
  const [servDuracion, setServDuracion] = useState("30");
  const [servPrecio, setServPrecio] = useState("150");

  // Create Professional Form State
  const [profUserId, setProfUserId] = useState("");
  const [profEspecialidad, setProfEspecialidad] = useState("");
  const [profHoraInicio, setProfHoraInicio] = useState("09:00");
  const [profHoraFin, setProfHoraFin] = useState("19:00");

  const handleCreateService = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const formData = new FormData();
    formData.append("nombre", servNombre);
    formData.append("duracion_min", servDuracion);
    formData.append("precio", servPrecio);

    const res = await createServicioAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setServNombre("");
      router.refresh();
    }
  };

  const handleCreateProfessional = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const formData = new FormData();
    formData.append("usuario_id", profUserId);
    formData.append("especialidad", profEspecialidad);
    formData.append("hora_inicio_laboral", profHoraInicio);
    formData.append("hora_fin_laboral", profHoraFin);

    const res = await createProfesionalAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setProfUserId("");
      setProfEspecialidad("");
      router.refresh();
    }
  };

  // Group agenda by professional
  const columns = {};
  profesionales.forEach((p) => {
    columns[p.nombre] = [];
  });

  agendaData.citas.forEach((c) => {
    if (columns[c.profesional]) {
      columns[c.profesional].push(c);
    }
  });

  return (
    <div className="space-y-8">
      {/* Tabs Menu */}
      <div className="flex border-b border-[#B08D57]/20 gap-2">
        <button
          onClick={() => { setActiveTab("agenda"); setFormError(""); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "agenda"
              ? "border-[#B08D57] text-[#B08D57]"
              : "border-transparent text-[#F2ECE2]/60 hover:text-[#F2ECE2]"
          }`}
        >
          Agenda General
        </button>
        <button
          onClick={() => { setActiveTab("servicios"); setFormError(""); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "servicios"
              ? "border-[#B08D57] text-[#B08D57]"
              : "border-transparent text-[#F2ECE2]/60 hover:text-[#F2ECE2]"
          }`}
        >
          Gestionar Servicios
        </button>
        <button
          onClick={() => { setActiveTab("profesionales"); setFormError(""); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "profesionales"
              ? "border-[#B08D57] text-[#B08D57]"
              : "border-transparent text-[#F2ECE2]/60 hover:text-[#F2ECE2]"
          }`}
        >
          Gestionar Profesionales
        </button>
      </div>

      {formError && (
        <div className="rounded bg-[#8A3B2E]/10 border border-[#8A3B2E]/50 p-4 text-sm text-red-300">
          {formError}
        </div>
      )}

      {/* Agenda General Columns */}
      {activeTab === "agenda" && (
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-4">
            {profesionales.map((p) => {
              const clientCitas = columns[p.nombre] || [];
              return (
                <div key={p.id} className="w-80 rounded-lg border border-[#B08D57]/15 bg-[#26221D]/40 p-4 space-y-4">
                  <div className="border-b border-[#B08D57]/10 pb-2 text-center">
                    <h3 className="font-display text-lg font-bold text-[#B08D57]">{p.nombre}</h3>
                    <p className="text-[10px] text-[#F2ECE2]/50 uppercase tracking-widest">{p.especialidad}</p>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {clientCitas.length === 0 ? (
                      <p className="text-xs text-[#F2ECE2]/40 text-center py-12">Sin citas agendadas</p>
                    ) : (
                      clientCitas.map((c) => {
                        const tInicio = c.fecha_hora_inicio.split("T")[1].substring(0, 5);
                        const tFin = c.fecha_hora_fin.split("T")[1].substring(0, 5);
                        return (
                          <div
                            key={c.id}
                            className={`rounded border p-3 space-y-1 text-xs ${
                              c.estado === "confirmada" ? "border-[#5C7A5C]/40 bg-[#5C7A5C]/5" :
                              c.estado === "cancelada" ? "border-red-950 bg-red-950/10 text-[#F2ECE2]/70" :
                              "border-orange-950 bg-orange-950/10"
                            }`}
                          >
                            <div className="flex justify-between font-mono text-[10px] text-[#B08D57] font-bold">
                              <span>{tInicio} - {tFin}</span>
                              <span className="uppercase tracking-wider">{c.estado}</span>
                            </div>
                            <p className="font-semibold">{c.cliente}</p>
                            <p className="text-[#F2ECE2]/60">{c.servicio}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Servicios Tab */}
      {activeTab === "servicios" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* List Services */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-display text-xl font-bold border-b border-[#B08D57]/10 pb-2">Servicios Existentes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicios.map((s) => (
                <div key={s.id} className="rounded border border-[#B08D57]/10 bg-[#26221D]/20 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{s.nombre}</h4>
                    <span className="font-mono text-xs text-[#F2ECE2]/60">{s.duracion_min} minutos</span>
                  </div>
                  <span className="font-mono font-bold text-base text-[#B08D57]">${s.precio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Service Form */}
          <div className="rounded-lg border border-[#B08D57]/10 bg-[#26221D] p-6 shadow-lg h-fit">
            <h3 className="font-display text-lg font-bold text-[#B08D57] mb-4">Nuevo Servicio</h3>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={servNombre}
                  onChange={(e) => setServNombre(e.target.value)}
                  required
                  placeholder="Afeitado clásico"
                  className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    value={servDuracion}
                    onChange={(e) => setServDuracion(e.target.value)}
                    required
                    min="5"
                    className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={servPrecio}
                    onChange={(e) => setServPrecio(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[#B08D57] py-2.5 text-xs font-bold text-[#1C1A17] hover:bg-[#B08D57]/90 disabled:opacity-50 transition-colors shadow cursor-pointer"
              >
                {loading ? "Creando..." : "Crear Servicio"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profesionales Tab */}
      {activeTab === "profesionales" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* List Professionals */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-display text-xl font-bold border-b border-[#B08D57]/10 pb-2">Lista de Profesionales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profesionales.map((p) => (
                <div key={p.id} className="rounded border border-[#B08D57]/10 bg-[#26221D]/20 p-4">
                  <h4 className="font-semibold text-sm text-[#B08D57]">{p.nombre}</h4>
                  <p className="text-xs text-[#F2ECE2]/80 font-sans mt-0.5">{p.especialidad}</p>
                  <p className="text-[10px] text-[#F2ECE2]/50 font-mono mt-2">
                    Jornada: {p.hora_inicio_laboral.substring(0, 5)} - {p.hora_fin_laboral.substring(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Create Professional Profile Form */}
          <div className="rounded-lg border border-[#B08D57]/10 bg-[#26221D] p-6 shadow-lg h-fit">
            <h3 className="font-display text-lg font-bold text-[#B08D57] mb-4">Perfil Profesional</h3>
            <form onSubmit={handleCreateProfessional} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                  ID Usuario (Empleado)
                </label>
                <input
                  type="number"
                  value={profUserId}
                  onChange={(e) => setProfUserId(e.target.value)}
                  required
                  placeholder="ID del usuario con rol empleado"
                  className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={profEspecialidad}
                  onChange={(e) => setProfEspecialidad(e.target.value)}
                  required
                  placeholder="Diseño de barba y corte"
                  className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={profHoraInicio}
                    onChange={(e) => setProfHoraInicio(e.target.value)}
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
                    value={profHoraFin}
                    onChange={(e) => setProfHoraFin(e.target.value)}
                    required
                    className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[#B08D57] py-2.5 text-xs font-bold text-[#1C1A17] hover:bg-[#B08D57]/90 disabled:opacity-50 transition-colors shadow cursor-pointer"
              >
                {loading ? "Registrando..." : "Crear Perfil"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
