import Link from "next/link";
import { checkAuth, logoutAction } from "../app/actions";

export default async function Header() {
  const auth = await checkAuth();

  return (
    <header className="border-b border-[#B08D57]/20 bg-[#26221D] px-6 py-4 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold tracking-wide text-[#B08D57] hover:opacity-90">
          Barber
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#B08D57] transition-colors">
            Inicio
          </Link>
          {auth ? (
            <>
              {auth.rol === "cliente" && (
                <Link href="/citas/mias" className="hover:text-[#B08D57] transition-colors">
                  Mis Citas
                </Link>
              )}
              {(auth.rol === "empleado" || auth.rol === "admin") && (
                <Link href="/empleado/agenda" className="hover:text-[#B08D57] transition-colors">
                  Mi Agenda
                </Link>
              )}
              {auth.rol === "admin" && (
                <Link href="/admin" className="hover:text-[#B08D57] transition-colors">
                  Administración
                </Link>
              )}
              <form action={logoutAction} className="inline">
                <button type="submit" className="text-[#8A3B2E] hover:text-red-400 transition-colors cursor-pointer">
                  Cerrar Sesión
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded border border-[#B08D57] px-4 py-1.5 text-xs text-[#B08D57] hover:bg-[#B08D57] hover:text-[#1C1A17] transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

// modified

// modified

// modified

// modified
