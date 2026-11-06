// Fictional, hard-coded data for the visual-only Overview (spec 002).
export const schedule = [
  { time: "09:00", mins: 30, name: "María González", detail: "Dental cleaning", status: "confirmed" },
  { time: "10:30", mins: 60, name: "Carlos Ramírez", detail: "Root canal · Session 2 of 3", status: "to-confirm" },
  { time: "12:00", mins: 45, name: "Sofía Torres", detail: "Initial consultation", status: "confirmed" },
  { time: "16:00", mins: 60, name: "Diego Martínez", detail: "Orthodontics · Session 4 of 8", status: "to-confirm" },
];

export const reminders = [
  { name: "Carlos Ramírez", when: "1 day", detail: "Tomorrow, 10:30", treatment: "Root canal" },
  { name: "Diego Martínez", when: "3 days", detail: "Friday, 16:00", treatment: "Orthodontics" },
  { name: "Valentina Cruz", when: "5 days", detail: "Sunday, 09:00", treatment: "Dental cleaning" },
];

export const toContact = [
  { name: "Ana López", treatment: "Root canal", done: 2, total: 3, note: "No next appointment", when: "Contact today", urgent: true },
  { name: "Jorge Pérez", treatment: "Orthodontics", done: 3, total: 8, note: "Last visit 28 days ago", when: "Contact tomorrow", urgent: false },
];

export const TONES = ["--info", "--warning", "--brand", "--danger"];
