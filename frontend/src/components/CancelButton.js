"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelCitaAction } from "../app/actions";

export default function CancelButton({ citaId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;

    setLoading(true);
    setError("");

    const res = await cancelCitaAction(citaId);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full text-center rounded border border-[#8A3B2E]/60 px-4 py-2 text-xs font-semibold text-[#8A3B2E] hover:bg-[#8A3B2E] hover:text-[#F2ECE2] disabled:opacity-50 transition-all cursor-pointer"
      >
        {loading ? "Cancelando..." : "Cancelar Cita"}
      </button>
      {error && <p className="text-[10px] text-red-400 mt-1 text-center">{error}</p>}
    </div>
  );
}

// modified

// modified

// modified

// modified

// modified
