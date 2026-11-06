// Los datos del paciente viajan solo en el cuerpo (nunca en la URL).
export async function listarPacientes() {
  const r = await fetch("/api/pacientes");
  if (!r.ok) throw new Error("No se pudo cargar la lista de pacientes");
  return r.json();
}

export async function crearPaciente(datos) {
  let r;
  try {
    r = await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  } catch {
    return { errores: { general: "Sin conexión con el servidor. Intenta de nuevo." } };
  }
  const cuerpo = await r.json().catch(() => ({}));
  if (r.ok) return { paciente: cuerpo };
  return { errores: cuerpo.errores || { general: "No se pudo guardar. Intenta de nuevo." } };
}
