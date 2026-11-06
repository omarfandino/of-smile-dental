import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Overview from "./pages/Overview.jsx";
import Patients from "./pages/Patients.jsx";

// Hash routing: the hash never carries personal data.
const readRoute = () => (window.location.hash === "#/patients" ? "patients" : "overview");

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return (
    <div className="app">
      <Sidebar route={route} />
      <div className="main">
        <Topbar title={route === "patients" ? "Patients" : "Overview"} />
        <main className="content">{route === "patients" ? <Patients /> : <Overview />}</main>
      </div>
    </div>
  );
}
