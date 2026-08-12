
-- Estos dos índices son los que más importan: disponibilidad se consulta
-- filtrando por profesional + rango de fechas constantemente.
CREATE INDEX idx_citas_prof_fecha ON citas(profesional_id, fecha_hora_inicio);
CREATE INDEX idx_bloqueos_prof_fecha ON bloqueos_horario(profesional_id, fecha_hora_inicio);

-- modified
