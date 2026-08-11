"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Todos los campos son requeridos." };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al iniciar sesión." };
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    cookieStore.set("usuarioRol", data.rol, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  } catch (err) {
    console.error("Login action error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }

  redirect("/");
}

export async function registroAction(prevState, formData) {
  const nombre = formData.get("nombre");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!nombre || !email || !password) {
    return { error: "Todos los campos son requeridos." };
  }

  try {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al registrarse." };
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    cookieStore.set("usuarioRol", "cliente", {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  } catch (err) {
    console.error("Registro action error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("usuarioRol");
  redirect("/login");
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const rol = cookieStore.get("usuarioRol")?.value;

  if (!token) return null;

  return { token, rol };
}

export async function createCitaAction(profesionalId, servicioId, fechaHoraInicio) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { error: "Debes iniciar sesión para agendar una cita." };
  }

  try {
    const res = await fetch(`${API_URL}/citas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        profesional_id: parseInt(profesionalId),
        servicio_id: parseInt(servicioId),
        fecha_hora_inicio: fechaHoraInicio,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al agendar la cita." };
    }

    return { success: true, cita: data };
  } catch (err) {
    console.error("Create cita action error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }
}
export async function cancelCitaAction(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { error: "Debes iniciar sesión para cancelar una cita." };
  }

  try {
    const res = await fetch(`${API_URL}/citas/${id}/cancelar`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al cancelar la cita." };
    }

    return { success: true, cita: data };
  } catch (err) {
    console.error("Cancel cita action error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function createBloqueoAction(prevState, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { error: "Debes iniciar sesión." };
  }

  const fecha = formData.get("fecha");
  const horaInicio = formData.get("hora_inicio");
  const horaFin = formData.get("hora_fin");
  const motivo = formData.get("motivo");

  if (!fecha || !horaInicio || !horaFin) {
    return { error: "Todos los campos son requeridos." };
  }

  const fechaHoraInicio = `${fecha}T${horaInicio}:00`;
  const fechaHoraFin = `${fecha}T${horaFin}:00`;

  try {
    const res = await fetch(`${API_URL}/empleado/bloqueos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        fecha_hora_inicio: fechaHoraInicio,
        fecha_hora_fin: fechaHoraFin,
        motivo,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al crear el bloqueo." };
    }

    return { success: true };
  } catch (err) {
    console.error("Create bloqueo error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }
}
export async function deleteBloqueoAction(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { error: "Debes iniciar sesión." };
  }

  try {
    const res = await fetch(`${API_URL}/empleado/bloqueos/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al eliminar el bloqueo." };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete bloqueo error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function createServicioAction(prevState, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { error: "Debes iniciar sesión." };
  }

  const nombre = formData.get("nombre");
  const duracion_min = formData.get("duracion_min");
  const precio = formData.get("precio");

  if (!nombre || !duracion_min || !precio) {
    return { error: "Todos los campos son requeridos." };
  }

  try {
    const res = await fetch(`${API_URL}/admin/servicios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre,
        duracion_min: parseInt(duracion_min),
        precio: parseFloat(precio),
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al crear el servicio." };
    }

    return { success: true };
  } catch (err) {
    console.error("Create servicio error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function createProfesionalAction(prevState, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { error: "Debes iniciar sesión." };
  }

  const usuario_id = formData.get("usuario_id");
  const especialidad = formData.get("especialidad");
  const hora_inicio_laboral = formData.get("hora_inicio_laboral");
  const hora_fin_laboral = formData.get("hora_fin_laboral");

  if (!usuario_id || !especialidad || !hora_inicio_laboral || !hora_fin_laboral) {
    return { error: "Todos los campos son requeridos." };
  }

  try {
    const res = await fetch(`${API_URL}/admin/profesionales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        usuario_id: parseInt(usuario_id),
        especialidad,
        hora_inicio_laboral: `${hora_inicio_laboral}:00`,
        hora_fin_laboral: `${hora_fin_laboral}:00`,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Error al crear el profesional." };
    }

    return { success: true };
  } catch (err) {
    console.error("Create profesional error:", err);
    return { error: "No se pudo conectar con el servidor." };
  }
}
