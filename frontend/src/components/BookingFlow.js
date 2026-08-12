"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCitaAction } from "../app/actions";

export default function BookingFlow({ profesionales, servicios, isAuthenticated }) {
  const router = useRouter();

  const [selectedProf, setSelectedProf] = useState(null);
  const [selectedServ, setSelectedServ] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch slots when professional, service, and date are selected
  useEffect(() => {
    if (selectedProf && selectedServ && selectedDate) {
      // Defer state updates to avoid React's synchronous cascading render warning
      const timer = setTimeout(() => {
        setLoadingSlots(true);
        setBookingError("");
        setSlots([]);
        setSelectedSlot(null);
      }, 0);

      fetch(`/api/disponibilidad?id=${selectedProf.id}&fecha=${selectedDate}&servicio_id=${selectedServ.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al consultar disponibilidad");
          return res.json();
        })
        .then((data) => {
          setSlots(data.slots || []);
        })
        .catch((err) => {
          setBookingError("No se pudo obtener la disponibilidad para esta fecha.");
          console.error(err);
        })
        .finally(() => {
          setLoadingSlots(false);
        });

      return () => clearTimeout(timer);
    }
  }, [selectedProf, selectedServ, selectedDate]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      router.push("/login?error=Debes iniciar sesión para agendar una cita.");
      return;
    }

    if (!selectedProf || !selectedServ || !selectedDate || !selectedSlot) {
      setBookingError("Por favor completa todos los pasos.");
      return;
    }

    setIsSubmitting(true);
    setBookingError("");

    const fechaHoraInicio = `${selectedDate}T${selectedSlot}:00`;
    const res = await createCitaAction(selectedProf.id, selectedServ.id, fechaHoraInicio);

    setIsSubmitting(false);

    if (res.error) {
      setBookingError(res.error);
    } else {
      setBookingSuccess({
        id: res.cita.id,
        profesional: selectedProf.nombre,
        servicio: selectedServ.nombre,
        precio: selectedServ.precio,
        fechaHoraInicio: res.cita.fecha_hora_inicio,
      });
    }
  };

  if (bookingSuccess) {
    return (
      <div className="mx-auto max-w-md py-12 px-4">
        <div className="ticket-dented ticket-dented-notches p-8 text-[#F2ECE2] shadow-2xl relative overflow-hidden">
          {/* Stamp animation block */}
          <div className="absolute right-6 top-6 border-4 border-[#5C7A5C] text-[#5C7A5C] font-mono text-xs uppercase font-extrabold tracking-widest px-3 py-1.5 rounded animate-stamp opacity-0 select-none">
            Confirmada
          </div>

          <div className="text-center border-b border-[#B08D57]/20 pb-6 mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B08D57]">Turno físico digital</span>
            <h2 className="font-display text-3xl font-bold mt-2">Barber Barbería</h2>
          </div>

          <div className="space-y-4 font-sans text-sm">
            <div className="flex justify-between">
              <span className="text-[#F2ECE2]/60">Ticket No:</span>
              <span className="font-mono font-bold text-[#B08D57]">#FC-{bookingSuccess.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F2ECE2]/60">Profesional:</span>
              <span className="font-medium">{bookingSuccess.profesional}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F2ECE2]/60">Servicio:</span>
              <span className="font-medium">{bookingSuccess.servicio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F2ECE2]/60">Fecha y Hora:</span>
              <span className="font-mono text-[#B08D57]">
                {new Date(bookingSuccess.fechaHoraInicio).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#B08D57]/20 pt-4 mt-4">
              <span className="text-[#F2ECE2]/60 font-medium">Total:</span>
              <span className="font-mono text-lg font-bold text-[#B08D57]">${bookingSuccess.precio}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-dashed border-[#B08D57]/20 text-center">
            <p className="text-xs text-[#F2ECE2]/40 mb-4">Presenta este ticket al llegar a la barbería.</p>
            <button
              onClick={() => {
                setBookingSuccess(null);
                setSelectedProf(null);
                setSelectedServ(null);
                setSelectedDate("");
                setSlots([]);
                setSelectedSlot(null);
              }}
              className="w-full rounded border border-[#B08D57] py-2.5 text-xs font-semibold text-[#B08D57] hover:bg-[#B08D57] hover:text-[#1C1A17] transition-all cursor-pointer"
            >
              Agendar otro servicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Paso 1: Profesionales (Sillones) */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#F2ECE2] text-center md:text-left">
          Nuestros Profesionales
        </h2>
        <div className="flex flex-wrap md:flex-nowrap gap-4 overflow-x-auto pb-2 scrollbar-none justify-center md:justify-start">
          {profesionales.map((p) => {
            const isSelected = selectedProf?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProf(p);
                  setSelectedSlot(null);
                }}
                className={`flex-shrink-0 w-44 rounded-lg border p-5 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#B08D57] bg-[#26221D] shadow-lg scale-102"
                    : "border-[#B08D57]/10 bg-[#26221D]/40 hover:border-[#B08D57]/40"
                }`}
              >
                {/* Vintage avatar placeholder */}
                <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 text-xl font-bold font-display ${
                  isSelected ? "border-[#B08D57] bg-[#B08D57]/10 text-[#B08D57]" : "border-[#B08D57]/20 bg-[#1C1A17] text-[#F2ECE2]/60"
                }`}>
                  {p.nombre.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="font-display text-sm font-semibold truncate text-[#F2ECE2]">
                  {p.nombre}
                </div>
                <div className="text-xs text-[#F2ECE2]/50 truncate mt-1">
                  {p.especialidad}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Paso 2: Servicios */}
      {selectedProf && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#F2ECE2] text-center md:text-left">
            Elige el Servicio
          </h2>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {servicios.map((s) => {
              const isSelected = selectedServ?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedServ(s);
                    setSelectedSlot(null);
                  }}
                  className={`rounded-full px-5 py-2.5 text-sm transition-all border cursor-pointer flex items-center space-x-3 ${
                    isSelected
                      ? "bg-[#B08D57] text-[#1C1A17] border-[#B08D57] font-semibold"
                      : "bg-[#26221D] text-[#F2ECE2] border-[#B08D57]/10 hover:border-[#B08D57]/40"
                  }`}
                >
                  <span>{s.nombre}</span>
                  <span className={`font-mono text-xs ${isSelected ? "text-[#1C1A17]/80" : "text-[#B08D57]"}`}>
                    {s.duracion_min}m | ${s.precio}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Paso 3: Fecha */}
      {selectedProf && selectedServ && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#F2ECE2] text-center md:text-left">
            Elige el Día
          </h2>
          <div className="max-w-xs mx-auto md:mx-0">
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full rounded border border-[#B08D57]/20 bg-[#26221D] px-4 py-3 text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none transition-colors text-center font-mono"
            />
          </div>
        </section>
      )}

      {/* Paso 4: Disponibilidad (Horarios) */}
      {selectedProf && selectedServ && selectedDate && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#F2ECE2] text-center md:text-left">
            Elige tu Horario
          </h2>

          {loadingSlots ? (
            <p className="text-sm text-[#F2ECE2]/60 animate-pulse text-center md:text-left">
              Consultando horarios disponibles...
            </p>
          ) : bookingError ? (
            <p className="text-sm text-red-400 text-center md:text-left">{bookingError}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-[#F2ECE2]/60 text-center md:text-left">
              No hay horarios disponibles para el profesional seleccionado en este día.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {slots.map((s) => {
                const isSelected = selectedSlot === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded border py-2.5 font-mono text-sm transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#B08D57] text-[#1C1A17] border-[#B08D57] scale-105 shadow-md font-bold"
                        : "bg-[#26221D] text-[#F2ECE2] border-[#B08D57]/15 hover:border-[#B08D57]/45"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Acciones */}
      {selectedProf && selectedServ && selectedDate && selectedSlot && (
        <div className="flex flex-col items-center pt-6 border-t border-[#B08D57]/10">
          {bookingError && <p className="text-sm text-red-400 mb-4">{bookingError}</p>}
          <button
            onClick={handleBook}
            disabled={isSubmitting}
            className="rounded bg-[#B08D57] px-8 py-3 text-sm font-semibold text-[#1C1A17] hover:bg-[#B08D57]/90 disabled:opacity-50 transition-colors shadow-lg cursor-pointer"
          >
            {isSubmitting ? "Agendando..." : "Confirmar cita"}
          </button>
        </div>
      )}
    </div>
  );
}

// modified

// modified

// modified

// modified

// modified
