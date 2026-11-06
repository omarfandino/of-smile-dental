import { formatWhatsapp } from "../validate.js";

export default function PatientList({ patients, loading, error }) {
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
        {patients.map((p) => (
          <li key={p.id}>
            <span className="name">{p.name}</span>
            <span className="phone">{formatWhatsapp(p.whatsapp)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
