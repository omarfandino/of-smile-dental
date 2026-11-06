import { useEffect, useState } from "react";
import { listPatients } from "./api.js";
import PatientForm from "./components/PatientForm.jsx";
import PatientList from "./components/PatientList.jsx";

export default function App() {
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
    <main className="container">
      <header>
        <h1>
          <span className="brand">OF</span> Smile
        </h1>
        <p className="sub">Hi, Laura! Register your patients in seconds.</p>
      </header>
      <PatientForm onCreated={(p) => setPatients((list) => [p, ...list])} />
      <PatientList patients={patients} loading={loading} error={error} />
    </main>
  );
}
