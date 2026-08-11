const Cita = require('../models/cita');
const Bloqueo = require('../models/bloqueo');
const Profesional = require('../models/profesional');

/**
 * Calcula los slots de inicio disponibles para un profesional en una fecha,
 * dado que el servicio requiere `duracionMin` minutos.
 *
 * Devuelve un array de strings con formato "HH:MM" representando cada
 * hora de inicio válida.
 */
async function calcularDisponibilidad(profesionalId, fecha, duracionMin) {
  const profesional = await Profesional.findById(profesionalId);
  if (!profesional) return [];

  // Construir los timestamps de inicio y fin de la jornada laboral
  const jornadaInicio = new Date(`${fecha}T${profesional.hora_inicio_laboral}`);
  const jornadaFin = new Date(`${fecha}T${profesional.hora_fin_laboral}`);

  // Traer todo lo que ocupa tiempo ese día
  const [citas, bloqueos] = await Promise.all([
    Cita.citasActivasEnRango(profesionalId, jornadaInicio.toISOString(), jornadaFin.toISOString()),
    Bloqueo.bloqueosDelDia(profesionalId, fecha)
  ]);

  // Unificar citas y bloqueos en una sola lista de intervalos [inicio, fin]
  const ocupados = [];
  for (const c of citas) {
    ocupados.push([new Date(c.fecha_hora_inicio), new Date(c.fecha_hora_fin)]);
  }
  for (const b of bloqueos) {
    ocupados.push([new Date(b.fecha_hora_inicio), new Date(b.fecha_hora_fin)]);
  }

  // Ordenar por hora de inicio
  ocupados.sort((a, b) => a[0] - b[0]);

  // Merge de intervalos solapados: si un bloqueo se traslapa con una cita
  // (ej. bloqueo de comida que empieza 5 min antes de que termine una cita),
  // los fusionamos en un solo intervalo para que el cálculo de huecos no
  // genere un falso positivo entre ellos.
  const merged = [];
  for (const intervalo of ocupados) {
    if (merged.length === 0) {
      merged.push([...intervalo]);
      continue;
    }
    const ultimo = merged[merged.length - 1];
    if (intervalo[0] <= ultimo[1]) {
      // Solapan o son contiguos — extender el intervalo
      ultimo[1] = new Date(Math.max(ultimo[1], intervalo[1]));
    } else {
      merged.push([...intervalo]);
    }
  }

  // Calcular huecos entre intervalos ocupados dentro de la jornada
  const huecos = [];
  let cursor = jornadaInicio;

  for (const [ini, fin] of merged) {
    if (cursor < ini) {
      huecos.push([new Date(cursor), new Date(ini)]);
    }
    // Avanzar el cursor al fin del bloque ocupado (o mantenerlo si ya pasó)
    if (fin > cursor) {
      cursor = fin;
    }
  }

  // Hueco después del último bloque ocupado hasta el fin de jornada
  if (cursor < jornadaFin) {
    huecos.push([new Date(cursor), new Date(jornadaFin)]);
  }

  // Generar slots de inicio cada 15 min dentro de cada hueco,
  // solo si el servicio completo cabe antes del fin del hueco.
  const duracionMs = duracionMin * 60 * 1000;
  const intervaloSlot = 15 * 60 * 1000;
  const slots = [];

  for (const [huecoInicio, huecoFin] of huecos) {
    let slot = new Date(huecoInicio);

    while (slot.getTime() + duracionMs <= huecoFin.getTime()) {
      const horas = String(slot.getHours()).padStart(2, '0');
      const minutos = String(slot.getMinutes()).padStart(2, '0');
      slots.push(`${horas}:${minutos}`);

      slot = new Date(slot.getTime() + intervaloSlot);
    }
  }

  return slots;
}

module.exports = { calcularDisponibilidad };
