import Icon from "./Icon.jsx";

export default function Topbar({ title }) {
  return (
    <header className="topbar">
      <span className="topbar-brand">
        <span className="logo"><Icon name="sparkle" size={18} /></span>
        <strong>OF Smile</strong>
      </span>
      <nav className="crumbs" aria-label="Breadcrumb">
        <span>Overview</span>
        {title !== "Overview" && (
          <>
            <Icon name="chevron" size={14} />
            <strong>{title}</strong>
          </>
        )}
      </nav>
      <label className="search">
        <Icon name="search" size={16} />
        <input type="search" readOnly placeholder="Search patient" aria-label="Search patient" />
      </label>
      <button type="button" className="icon-btn" aria-label="Notifications">
        <Icon name="bell" />
        <span className="dot" />
      </button>
      <button type="button" className="user-chip">
        <span className="avatar" style={{ "--tone": "var(--danger)" }}>DL</span>
        <span className="user-name">Dr. Laura</span>
        <Icon name="chevron" size={14} />
      </button>
    </header>
  );
}
