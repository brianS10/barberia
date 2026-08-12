const { calcularDisponibilidad } = require('../src/utils/disponibilidad');
const Profesional = require('../src/models/profesional');
const Cita = require('../src/models/cita');
const Bloqueo = require('../src/models/bloqueo');

// Mockeamos los modelos para testear la lógica pura del algoritmo
// sin necesitar base de datos.
jest.mock('../src/models/profesional');
jest.mock('../src/models/cita');
jest.mock('../src/models/bloqueo');

describe('Algoritmo de disponibilidad', () => {
  const profesionalBase = {
    id: 1,
    hora_inicio_laboral: '09:00:00',
    hora_fin_laboral: '17:00:00',
    nombre: 'Test'
  };

  beforeEach(() => {
    Profesional.findById.mockResolvedValue(profesionalBase);
    Cita.citasActivasEnRango.mockResolvedValue([]);
    Bloqueo.bloqueosDelDia.mockResolvedValue([]);
  });

  test('día vacío → todos los slots para servicio de 30 min', async () => {
    const slots = await calcularDisponibilidad(1, '2025-03-15', 30);

    // Jornada de 9 a 17 = 8 horas = 480 min
    // Servicio de 30 min, slots cada 15 min
    // Último slot válido: 16:30 (termina a las 17:00)
    expect(slots).toContain('09:00');
    expect(slots).toContain('09:15');
    expect(slots).toContain('16:30');
    expect(slots).not.toContain('16:45'); // terminaría a las 17:15
    expect(slots.length).toBe(31); // 9:00, 9:15, 9:30, ... 16:30
  });

  test('cita a media mañana deja slots antes y después', async () => {
    Cita.citasActivasEnRango.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T11:00:00', fecha_hora_fin: '2025-03-15T11:30:00' }
    ]);

    const slots = await calcularDisponibilidad(1, '2025-03-15', 30);

    expect(slots).toContain('09:00');
    expect(slots).toContain('10:30'); // último antes de la cita
    expect(slots).not.toContain('10:45'); // empezaría a las 10:45, termina 11:15 → solapa
    expect(slots).not.toContain('11:00'); // ocupado
    expect(slots).toContain('11:30'); // justo después de la cita
    expect(slots).toContain('16:30');
  });

  test('bloqueo que cubre toda la jornada → 0 slots', async () => {
    Bloqueo.bloqueosDelDia.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T09:00:00', fecha_hora_fin: '2025-03-15T17:00:00' }
    ]);

    const slots = await calcularDisponibilidad(1, '2025-03-15', 30);
    expect(slots).toHaveLength(0);
  });

  test('citas pegadas sin hueco entre ellas', async () => {
    Cita.citasActivasEnRango.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T10:00:00', fecha_hora_fin: '2025-03-15T10:30:00' },
      { fecha_hora_inicio: '2025-03-15T10:30:00', fecha_hora_fin: '2025-03-15T11:00:00' }
    ]);

    const slots = await calcularDisponibilidad(1, '2025-03-15', 30);

    // No debería haber slot entre las 10:00 y las 11:00
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('10:15');
    expect(slots).not.toContain('10:30');
    expect(slots).toContain('09:30'); // hueco de 09:00-10:00, último slot 30 min: 9:30
    expect(slots).toContain('11:00'); // después del bloque
  });

  test('servicio de 60 min no cabe en hueco de 45 min', async () => {
    // Bloqueo de 10:00 a 10:15 y de 11:00 en adelante → hueco de 45 min (10:15-11:00)
    Cita.citasActivasEnRango.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T09:00:00', fecha_hora_fin: '2025-03-15T10:00:00' }
    ]);
    Bloqueo.bloqueosDelDia.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T10:45:00', fecha_hora_fin: '2025-03-15T17:00:00' }
    ]);

    const slots = await calcularDisponibilidad(1, '2025-03-15', 60);

    // Hueco de 10:00-10:45 = 45 min, servicio de 60 min → no cabe
    expect(slots).toHaveLength(0);
  });

  test('traslape de bloqueo con cita se fusiona correctamente', async () => {
    Cita.citasActivasEnRango.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T10:00:00', fecha_hora_fin: '2025-03-15T11:00:00' }
    ]);
    Bloqueo.bloqueosDelDia.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T10:30:00', fecha_hora_fin: '2025-03-15T11:30:00' }
    ]);

    const slots = await calcularDisponibilidad(1, '2025-03-15', 30);

    // Los dos se fusionan en un solo bloque de 10:00-11:30
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('11:00');
    expect(slots).toContain('11:30'); // primer slot libre
    expect(slots).toContain('09:00'); // antes del bloque
    expect(slots).toContain('09:30');
  });

  test('profesional inexistente devuelve array vacío', async () => {
    Profesional.findById.mockResolvedValue(null);
    const slots = await calcularDisponibilidad(999, '2025-03-15', 30);
    expect(slots).toHaveLength(0);
  });

  test('múltiples huecos generan slots en cada uno', async () => {
    // Dos bloques ocupados dejan huecos al inicio, en medio y al final
    Cita.citasActivasEnRango.mockResolvedValue([
      { fecha_hora_inicio: '2025-03-15T10:00:00', fecha_hora_fin: '2025-03-15T11:00:00' },
      { fecha_hora_inicio: '2025-03-15T14:00:00', fecha_hora_fin: '2025-03-15T15:00:00' }
    ]);

    const slots = await calcularDisponibilidad(1, '2025-03-15', 30);

    // Hueco 1: 09:00-10:00 (slots: 09:00, 09:15, 09:30)
    expect(slots).toContain('09:00');
    expect(slots).toContain('09:30');
    // Hueco 2: 11:00-14:00 (muchos slots)
    expect(slots).toContain('11:00');
    expect(slots).toContain('13:30');
    // Hueco 3: 15:00-17:00
    expect(slots).toContain('15:00');
    expect(slots).toContain('16:30');
  });
});

// modified
