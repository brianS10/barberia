
-- Las contraseñas de seed son todas 'password123' hasheadas con bcrypt (10 rounds).
-- En producción jamás harías esto, pero para seed de desarrollo está bien.
-- Hash generado con: bcrypt.hashSync('password123', 10)
-- Nota: el script migrate.js con --seed regenera estos hashes correctamente.

-- Admin
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Admin FreshCut', 'admin@freshcut.com', '$ADMIN_HASH$', 'admin');

-- Empleados
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Carlos Mendoza', 'carlos@freshcut.com', '$HASH$', 'empleado'),
  ('Andrea López', 'andrea@freshcut.com', '$HASH$', 'empleado'),
  ('Miguel Torres', 'miguel@freshcut.com', '$HASH$', 'empleado');

-- Profesionales (vinculados a los empleados)
INSERT INTO profesionales (usuario_id, especialidad, hora_inicio_laboral, hora_fin_laboral) VALUES
  (2, 'Corte clásico y barba', '09:00:00', '18:00:00'),
  (3, 'Colorimetría y tintes', '10:00:00', '19:00:00'),
  (4, 'Corte y diseño de barba', '09:00:00', '17:00:00');

-- Clientes
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Juan Pérez', 'juan@gmail.com', '$HASH$', 'cliente'),
  ('María García', 'maria@gmail.com', '$HASH$', 'cliente');

-- Servicios
INSERT INTO servicios (nombre, duracion_min, precio) VALUES
  ('Corte de cabello', 30, 150.00),
  ('Recorte de barba', 20, 100.00),
  ('Corte + Barba', 45, 220.00),
  ('Tinte completo', 90, 450.00),
  ('Alisado', 60, 350.00);

-- modified

-- modified

-- modified
