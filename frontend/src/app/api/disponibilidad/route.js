import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const fecha = searchParams.get("fecha");
  const servicio_id = searchParams.get("servicio_id");

  if (!id || !fecha || !servicio_id) {
    return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${API_URL}/profesionales/${id}/disponibilidad?fecha=${fecha}&servicio_id=${servicio_id}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Error al obtener disponibilidad" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Availability API route error:", err);
    return NextResponse.json({ error: "No se pudo conectar con el servidor" }, { status: 500 });
  }
}

// modified

// modified
