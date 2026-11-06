// Validación de comodidad; el backend es la autoridad.
export function validar({ nombre, whatsapp, email }) {
  const errores = {};
  if (nombre.trim().length < 2) errores.nombre = "Escribe el nombre del paciente";
  const digitos = whatsapp.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 15)
    errores.whatsapp = "Escribe el número de WhatsApp completo (10 dígitos, o con código de país)";
  if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
    errores.email = "El correo no parece válido (ej. nombre@correo.com)";
  return errores;
}

export function formatearWhatsapp(n) {
  // 573001234567 -> +57 300 123 4567
  if (n.length === 12) return `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
  return `+${n}`;
}
