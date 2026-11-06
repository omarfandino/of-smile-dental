import { useRef, useState } from "react";
import { crearPaciente } from "../api.js";
import { validar } from "../validar.js";

const VACIO = { nombre: "", whatsapp: "", email: "", notas: "" };

export default function PacienteForm({ onCreado }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState("");
  const nombreRef = useRef(null);
  const enviando = useRef(false); // evita doble envío por doble toque

  const cambiar = (campo) => (e) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    if (enviando.current) return;
    setExito("");
    const locales = validar(datos);
    if (Object.keys(locales).length) {
      setErrores(locales);
      return;
    }
    enviando.current = true;
    setGuardando(true);
    const { paciente, errores: delServidor } = await crearPaciente(datos);
    enviando.current = false;
    setGuardando(false);
    if (delServidor) {
      setErrores(delServidor);
      return;
    }
    setDatos(VACIO);
    setErrores({});
    setExito(`Paciente guardado: ${paciente.nombre}`);
    onCreado(paciente);
    nombreRef.current?.focus();
  }

  const campo = (id, etiqueta, props = {}) => (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        value={datos[id]}
        onChange={cambiar(id)}
        aria-invalid={Boolean(errores[id])}
        aria-describedby={errores[id] ? `${id}-error` : undefined}
        {...props}
      />
      {errores[id] && (
        <p className="error" id={`${id}-error`} role="alert">
          {errores[id]}
        </p>
      )}
    </div>
  );

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Nuevo paciente</h2>
      {campo("nombre", "Nombre completo", {
        ref: nombreRef,
        autoComplete: "off",
        autoFocus: true,
      })}
      {campo("whatsapp", "WhatsApp", {
        type: "tel",
        inputMode: "tel",
        autoComplete: "off",
        placeholder: "300 123 4567",
      })}

      <details className="mas-datos">
        <summary>Más datos (opcional)</summary>
        {campo("email", "Correo electrónico", { type: "email", autoComplete: "off" })}
        <div className="campo">
          <label htmlFor="notas">Notas de contacto</label>
          <textarea
            id="notas"
            rows={2}
            maxLength={300}
            value={datos.notas}
            onChange={cambiar("notas")}
            placeholder="Ej. prefiere mensajes en la tarde"
          />
          {errores.notas && (
            <p className="error" role="alert">
              {errores.notas}
            </p>
          )}
        </div>
      </details>

      {errores.general && (
        <p className="error" role="alert">
          {errores.general}
        </p>
      )}
      <button className="primario" type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar paciente"}
      </button>
      {exito && (
        <p className="exito" role="status">
          {exito}
        </p>
      )}
    </form>
  );
}
