// Patient data travels only in the request body (never in the URL).
export async function listPatients() {
  const r = await fetch("/api/patients");
  if (!r.ok) throw new Error("Could not load the patient list");
  return r.json();
}

export async function createPatient(data) {
  let r;
  try {
    r = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    return { errors: { general: "No connection to the server. Please try again." } };
  }
  const body = await r.json().catch(() => ({}));
  if (r.ok) return { patient: body };
  return { errors: body.errors || { general: "Could not save. Please try again." } };
}
