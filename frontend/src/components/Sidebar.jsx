import Icon from "./Icon.jsx";

// `href` items work; items without it are visual only (spec 002).
const MAIN = [
  { key: "overview", label: "Overview", icon: "grid", href: "#/" },
  { key: "schedule", label: "Schedule", icon: "calendar", badge: 4 },
  { key: "patients", label: "Patients", icon: "user", href: "#/patients" },
  { key: "treatments", label: "Treatments", icon: "stethoscope" },
];

function NavItem({ item, active }) {
  const inner = (
    <>
      <Icon name={item.icon} />
      <span className="nav-label">{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </>
  );
  if (item.href)
    return (
      <a className={`nav-item${active ? " active" : ""}`} href={item.href} aria-current={active ? "page" : undefined}>
        {inner}
      </a>
    );
  return (
    <button type="button" className="nav-item">
      {inner}
    </button>
  );
}

export default function Sidebar({ route }) {
  return (
    <aside className="sidebar">
      <a className="sidebar-brand" href="#/">
        <span className="logo"><Icon name="sparkle" size={20} /></span>
        <span>
          <strong>OF Smile</strong>
          <small>Dental management</small>
        </span>
      </a>

      <button type="button" className="clinic">
        <span className="avatar" style={{ "--tone": "var(--danger)" }}>DL</span>
        <span className="clinic-text">
          <strong>Dr. Laura</strong>
          <small>Main clinic</small>
        </span>
        <Icon name="chevron" size={16} />
      </button>

      <nav className="nav" aria-label="Main">
        {MAIN.map((item) => (
          <NavItem key={item.key} item={item} active={route === item.key} />
        ))}
      </nav>

      <div className="sidebar-foot">
        <NavItem item={{ key: "settings", label: "Settings", icon: "sliders" }} />
      </div>
    </aside>
  );
}
