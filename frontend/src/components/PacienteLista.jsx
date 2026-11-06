import { formatearWhatsapp } from "../validar.js";

export default function PacienteLista({ pacientes, cargando, error }) {
  return (
    <section className="tarjeta">
      <h2>
        Pacientes registrados <span className="contador">{pacientes.length}</span>
      </h2>
      {error && <p className="error">{error}</p>}
      {!error && !cargando && pacientes.length === 0 && (
        <p className="vacio">Aún no hay pacientes. Registra el primero arriba.</p>
      )}
      <ul className="lista">
        {pacientes.map((p) => (
          <li key={p.id}>
            <span className="nombre">{p.nombre}</span>
            <span className="telefono">{formatearWhatsapp(p.whatsapp)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
