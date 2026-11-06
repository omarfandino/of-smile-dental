import { useEffect, useState } from "react";
import { getHealth } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Overview from "./pages/Overview.jsx";
import Patients from "./pages/Patients.jsx";

// Hash routing: the hash never carries personal data.
const readRoute = () => (window.location.hash === "#/patients" ? "patients" : "overview");

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    getHealth().then((h) => setDemo(Boolean(h.demo)));
  }, []);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return (
    <div className="app">
      <Sidebar route={route} />
      <div className="main">
        {demo && (
          <p className="demo-banner" role="note">
            <strong>Demo</strong> — use fictional data only. Anyone with this link can see what is registered.
          </p>
        )}
        <Topbar title={route === "patients" ? "Patients" : "Overview"} />
        <main className="content">{route === "patients" ? <Patients /> : <Overview />}</main>
      </div>
    </div>
  );
}
