import Icon from "../components/Icon.jsx";
import { schedule, reminders, toContact, TONES } from "../data/mock.js";

const STATUS = {
  confirmed: { label: "Confirmed", cls: "ok" },
  "to-confirm": { label: "To confirm", cls: "warn" },
};

const initials = (name) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("");

function Avatar({ name, i }) {
  return (
    <span className="avatar" style={{ "--tone": `var(${TONES[i % TONES.length]})` }}>
      {initials(name)}
    </span>
  );
}

function Stat({ icon, tone, label, value, hint, tag, tagCls }) {
  return (
    <div className="card stat">
      <span className="stat-icon" style={{ "--tone": `var(${tone})` }}>
        <Icon name={icon} />
      </span>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <small>{hint}</small>
      </div>
      <span className={`stat-tag ${tagCls}`}>{tag}</span>
    </div>
  );
}

export default function Overview() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>Good morning, Dr. Laura</h1>
          <p className="sub">Here's what matters for your schedule and your patients.</p>
        </div>
        <button type="button" className="primary inline">
          <Icon name="plus" size={16} /> New appointment
        </button>
      </div>

      <section className="stats">
        <Stat icon="calendar" tone="--info" label="Today's appointments" value="4" hint="2 to confirm" tag="+1 vs. yesterday" tagCls="ok" />
        <Stat icon="chat" tone="--danger" label="Reminders" value="3" hint="pending to send" tag="Today" tagCls="bad" />
        <Stat icon="user" tone="--warning" label="To contact" value="2" hint="incomplete treatments" tag="Attention" tagCls="warn" />
      </section>

      <div className="two-col">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Today's schedule</h2>
              <p className="sub">{today}</p>
            </div>
            <button type="button" className="link">Full schedule <Icon name="chevron" size={14} /></button>
          </div>
          <ul className="rows">
            {schedule.map((a, i) => (
              <li key={a.time} className="row">
                <span className="time"><strong>{a.time}</strong><small>{a.mins} min</small></span>
                <Avatar name={a.name} i={i} />
                <span className="row-main"><strong>{a.name}</strong><small>{a.detail}</small></span>
                <span className={`badge ${STATUS[a.status].cls}`}>{STATUS[a.status].label}</span>
                <button type="button" className="icon-btn" aria-label="Confirm"><Icon name="check" size={16} /></button>
                <button type="button" className="icon-btn" aria-label="More options"><Icon name="more" size={16} /></button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <h2>Pending reminders</h2>
              <p className="sub">Send them with one click on WhatsApp</p>
            </div>
            <span className="badge bad">{reminders.length}</span>
          </div>
          <ul className="rows">
            {reminders.map((r) => (
              <li key={r.name} className="row">
                <span className="clock"><Icon name="clock" size={16} /></span>
                <span className="row-main">
                  <strong>{r.name} <span className="badge warn">{r.when}</span></strong>
                  <small>In {r.when} · {r.detail}</small>
                  <small>{r.treatment}</small>
                </span>
                <button type="button" className="soft"><Icon name="chat" size={15} /> Send</button>
              </li>
            ))}
          </ul>
          <div className="card-foot">
            <button type="button" className="link">Edit template <Icon name="chevron" size={14} /></button>
            <small>Last checked 5 min ago</small>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Patients to contact</h2>
            <p className="sub">Treatments that need a next step</p>
          </div>
          <button type="button" className="link">See all <Icon name="chevron" size={14} /></button>
        </div>
        <ul className="rows">
          {toContact.map((p, i) => (
            <li key={p.name} className="row">
              <Avatar name={p.name} i={i + 3} />
              <span className="row-main">
                <strong>{p.name}</strong>
                <small>{p.treatment} · {p.done} of {p.total} sessions</small>
                <span className="progress" aria-hidden="true">
                  <span style={{ width: `${(p.done / p.total) * 100}%` }} />
                </span>
              </span>
              <span className="row-note">
                <span>{p.note}</span>
                <small className={p.urgent ? "urgent" : "later"}>{p.when}</small>
              </span>
              <button type="button" className="outline"><Icon name="check" size={15} /> Mark contacted</button>
              <button type="button" className="icon-btn" aria-label="More options"><Icon name="more" size={16} /></button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
