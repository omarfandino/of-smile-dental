import { useRef, useState } from "react";
import { createPatient } from "../api.js";
import { validate } from "../validate.js";

const EMPTY = { name: "", whatsapp: "", email: "", notes: "" };

export default function PatientForm({ onCreated }) {
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const nameRef = useRef(null);
  const submitting = useRef(false); // prevents double submit on double tap

  const change = (field) => (e) => {
    setData((d) => ({ ...d, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    if (submitting.current) return;
    setSuccess("");
    const local = validate(data);
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    submitting.current = true;
    setSaving(true);
    const { patient, errors: fromServer } = await createPatient(data);
    submitting.current = false;
    setSaving(false);
    if (fromServer) {
      setErrors(fromServer);
      return;
    }
    setData(EMPTY);
    setErrors({});
    setSuccess(`Patient saved: ${patient.name}`);
    onCreated(patient);
    nameRef.current?.focus();
  }

  const field = (id, label, props = {}) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={data[id]}
        onChange={change(id)}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
        {...props}
      />
      {errors[id] && (
        <p className="error" id={`${id}-error`} role="alert">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>New patient</h2>
      {field("name", "Full name", {
        ref: nameRef,
        autoComplete: "off",
        autoFocus: true,
      })}
      {field("whatsapp", "WhatsApp", {
        type: "tel",
        inputMode: "tel",
        autoComplete: "off",
        placeholder: "300 123 4567",
      })}

      <details className="more">
        <summary>More details (optional)</summary>
        {field("email", "Email", { type: "email", autoComplete: "off" })}
        <div className="field">
          <label htmlFor="notes">Contact notes</label>
          <textarea
            id="notes"
            rows={2}
            maxLength={300}
            value={data.notes}
            onChange={change("notes")}
            placeholder="e.g. prefers afternoon messages"
          />
          {errors.notes && (
            <p className="error" role="alert">
              {errors.notes}
            </p>
          )}
        </div>
      </details>

      {errors.general && (
        <p className="error" role="alert">
          {errors.general}
        </p>
      )}
      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save patient"}
      </button>
      {success && (
        <p className="success" role="status">
          {success}
        </p>
      )}
    </form>
  );
}
