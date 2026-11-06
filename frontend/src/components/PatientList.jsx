import { useEffect, useState } from "react";
import { deletePatient } from "../api.js";
import { formatWhatsapp } from "../validate.js";
import Icon from "./Icon.jsx";

export default function PatientList({ patients, loading, error, onDeleted }) {
  const [confirmId, setConfirmId] = useState(null); // only one row at a time
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");

  useEffect(() => {
    if (confirmId === null) return;
    const onKey = (e) => e.key === "Escape" && setConfirmId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmId]);

  const ask = (id) => {
    setMessage("");
    setFailure("");
    setConfirmId(id);
  };

  async function confirmDelete(patient) {
    if (busy) return;
    setBusy(true);
    const result = await deletePatient(patient.id);
    setBusy(false);
    if (result.error) {
      setFailure(result.error);
      return;
    }
    setConfirmId(null);
    setMessage(`Patient deleted: ${patient.name}`);
    onDeleted(patient.id);
  }

  return (
    <section className="card">
      <h2>
        Registered patients <span className="count">{patients.length}</span>
      </h2>
      {error && <p className="error">{error}</p>}
      {!error && !loading && patients.length === 0 && (
        <p className="empty">No patients yet. Register the first one above.</p>
      )}
      <ul className="list">
        {patients.map((p) =>
          confirmId === p.id ? (
            <li key={p.id} className="confirm" role="group" aria-label={`Confirm deleting ${p.name}`}>
              <p>
                Delete <strong>{p.name}</strong>? This can't be undone.
              </p>
              <div className="confirm-actions">
                <button type="button" className="outline lg" onClick={() => setConfirmId(null)}>
                  Cancel
                </button>
                <button type="button" className="danger lg" disabled={busy} onClick={() => confirmDelete(p)}>
                  {busy ? "Deleting…" : "Delete"}
                </button>
              </div>
              {failure && (
                <p className="error" role="alert">
                  {failure}
                </p>
              )}
            </li>
          ) : (
            <li key={p.id} className="patient">
              <span className="who">
                <span className="name">{p.name}</span>
                <span className="phone">{formatWhatsapp(p.whatsapp)}</span>
              </span>
              <button type="button" className="icon-btn trash" aria-label={`Delete ${p.name}`} onClick={() => ask(p.id)}>
                <Icon name="trash" size={18} />
              </button>
            </li>
          )
        )}
      </ul>
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
