
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'empleado', 'admin') NOT NULL DEFAULT 'cliente',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profesionales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  especialidad VARCHAR(100),
  hora_inicio_laboral TIME NOT NULL DEFAULT '09:00:00',
  hora_fin_laboral TIME NOT NULL DEFAULT '19:00:00',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  duracion_min INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  profesional_id INT NOT NULL,
  servicio_id INT NOT NULL,
  fecha_hora_inicio DATETIME NOT NULL,
  fecha_hora_fin DATETIME NOT NULL,
  estado ENUM('confirmada', 'cancelada', 'completada', 'cancelacion_tardia') NOT NULL DEFAULT 'confirmada',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id),
  FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

CREATE TABLE bloqueos_horario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profesional_id INT NOT NULL,
  fecha_hora_inicio DATETIME NOT NULL,
  fecha_hora_fin DATETIME NOT NULL,
  motivo VARCHAR(100),
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id)
);

-- modified

-- modified

-- modified
