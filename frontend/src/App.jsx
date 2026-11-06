import { useEffect, useState } from "react";
import { listarPacientes } from "./api.js";
import PacienteForm from "./components/PacienteForm.jsx";
import PacienteLista from "./components/PacienteLista.jsx";

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listarPacientes()
      .then(setPacientes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="contenedor">
      <header>
        <h1>
          <span className="marca">OF</span> Smile
        </h1>
        <p className="sub">¡Hola, Laura! Registra a tus pacientes en segundos.</p>
      </header>
      <PacienteForm onCreado={(p) => setPacientes((lista) => [p, ...lista])} />
      <PacienteLista pacientes={pacientes} cargando={cargando} error={error} />
    </main>
  );
}
