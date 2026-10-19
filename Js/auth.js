const DB = {
  leer(k, def) {
    try { return JSON.parse(localStorage.getItem(k)) ?? def; }
    catch { return def; }
  },
  guardar(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

async function hash(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Devuelve null si todo salió bien, o un mensaje de error
async function registrar(correo, nametag, pass) {
  correo = correo.trim().toLowerCase();
  nametag = nametag.trim();
  const usuarios = DB.leer("usuarios", []);
  if (usuarios.some(u => u.correo === correo)) return "Ese correo ya está registrado.";
  if (usuarios.some(u => u.nametag.toLowerCase() === nametag.toLowerCase())) return "Ese nametag ya está en uso.";
  usuarios.push({ correo, nametag, pass: await hash(pass) });
  DB.guardar("usuarios", usuarios);
  localStorage.setItem("sesion", correo);
  return null;
}

async function iniciarSesion(correo, pass) {
  correo = correo.trim().toLowerCase();
  const u = DB.leer("usuarios", []).find(u => u.correo === correo);
  if (!u || u.pass !== await hash(pass)) return "Correo o contraseña incorrectos.";
  localStorage.setItem("sesion", correo);
  return null;
}

function usuarioActual() {
  const correo = localStorage.getItem("sesion");
  return DB.leer("usuarios", []).find(u => u.correo === correo) || null;
}

function requerirSesion(rutaLogin) {
  const u = usuarioActual();
  if (!u) location.href = rutaLogin;
  return u;
}

function cerrarSesion(rutaLogin) {
  localStorage.removeItem("sesion");
  location.href = rutaLogin;
}

// ---- Votos ----
function votar(idRana) {
  const u = usuarioActual();
  const votos = DB.leer("votos", {});
  votos[u.correo] = idRana;
  DB.guardar("votos", votos);
}

function miVoto() {
  const u = usuarioActual();
  return u ? DB.leer("votos", {})[u.correo] : null;
}

// Devuelve { idRana: cantidad } con todas las ranas, incluso con 0 votos
function conteoVotos() {
  const conteo = {};
  frogs.forEach(f => conteo[f.id] = 0);
  Object.values(DB.leer("votos", {})).forEach(id => conteo[id]++);
  return conteo;
}