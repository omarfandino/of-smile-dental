import { useEffect, useState } from "react";
import { listPatients } from "../api.js";
import PatientForm from "../components/PatientForm.jsx";
import PatientList from "../components/PatientList.jsx";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listPatients()
      .then(setPatients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <p className="sub">Register a new patient in seconds.</p>
        </div>
      </div>
      <div className="patients-grid">
        <PatientForm onCreated={(p) => setPatients((list) => [p, ...list])} />
        <PatientList
          patients={patients}
          loading={loading}
          error={error}
          onDeleted={(id) => setPatients((list) => list.filter((p) => p.id !== id))}
        />
      </div>
    </>
  );
}
