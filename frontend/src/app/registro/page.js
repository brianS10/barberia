import Link from "next/link";
import { registroAction } from "../actions";

export default async function RegistroPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-[#1C1A17] text-[#F2ECE2]">
      <header className="border-b border-[#B08D57]/20 bg-[#26221D] px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-display text-2xl font-bold tracking-wide text-[#B08D57]">
            Barber
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-[#B08D57]/20 bg-[#26221D] p-8 shadow-xl">
          <h1 className="font-display text-3xl font-bold text-[#B08D57] mb-2 text-center">
            Únete a Barber
          </h1>
          <p className="text-sm text-[#F2ECE2]/60 mb-6 text-center">
            Crea una cuenta para agendar y gestionar tus citas fácilmente.
          </p>

          {error && (
            <div className="mb-4 rounded bg-[#8A3B2E]/20 border border-[#8A3B2E]/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form action={registroAction} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                required
                className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-4 py-2.5 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none transition-colors"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-4 py-2.5 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none transition-colors"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#F2ECE2]/80 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="w-full rounded border border-[#B08D57]/20 bg-[#1C1A17] px-4 py-2.5 text-sm text-[#F2ECE2] focus:border-[#B08D57] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded bg-[#B08D57] py-3 text-sm font-semibold text-[#1C1A17] hover:bg-[#B08D57]/90 transition-colors"
            >
              Registrarse
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#F2ECE2]/60">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-[#B08D57] hover:underline font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// modified

// modified

// modified

// modified
