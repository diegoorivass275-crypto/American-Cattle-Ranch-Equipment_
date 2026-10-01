/* ACRE — comportamiento del sitio.

   Tres cosas hacen el trabajo:
     1. el catálogo filtra al instante mientras se escribe;
     2. el cliente arma su lista y la manda por WhatsApp ya redactada;
     3. el rastreo consulta en qué etapa va un pedido.

   Sin librerías: la página abre rápido incluso con señal mala, que es
   como se va a ver desde un rancho.
*/

/* ── Ajustes que la empresa cambia ─────────────────────── */
const WHATSAPP = "526255791552";   // sin +, sin espacios
const EMPRESA = "ACRE — American Cattle Ranch Equipment";
const API_PEDIDOS = "https://diegopc.tail0bdb8d.ts.net";
const CATALOGO_VERSION = "3";
try {
  if (localStorage.getItem("acre_catalogo_version") !== CATALOGO_VERSION) {
    localStorage.removeItem("acre_cotizacion");
    localStorage.removeItem("acre_adicionales");
    localStorage.removeItem("acre_opciones");
    localStorage.removeItem("acre_lineas_pedido");
    localStorage.setItem("acre_catalogo_version", CATALOGO_VERSION);
  }
} catch { /* el sitio también funciona sin almacenamiento local */ }

/* ── Estado ────────────────────────────────────────────── */
let linea = "todo";
let texto = "";
let cotizacion = cargarCotizacion();
let cliente = cargarCliente();
// Qué hacer después de que el cliente se registre (mandar cotización, etc.)
let alRegistrarse = null;

const $ = (sel) => document.querySelector(sel);

/* Conectar un botón sin que la página entera se caiga si ese botón no
   existe. Pasó justo eso: al mezclar un index.html nuevo con un acre.js
   viejo, el JS buscaba algo que ya no estaba, tronaba, y con él se iba
   el catálogo completo. Ahora un archivo desparejo estropea una función,
   no el sitio. */
const alHacerClic = (sel, quehacer) => {
  const el = $(sel);
  if (el) el.addEventListener("click", quehacer);
  else console.warn(`Falta ${sel}: revisa que index.html y acre.js sean de la misma versión.`);
};
const rejilla = $("#rejilla");
const conteo = $("#conteo");

/* Guardar la lista para que no se pierda al recargar. Si el navegador
   no lo permite (modo privado, ajustes), se sigue trabajando en memoria. */
function cargarCotizacion() {
  try {
    const datos = JSON.parse(localStorage.getItem("acre_lineas_pedido") || "[]");
    return Array.isArray(datos) ? datos : [];
  } catch { return []; }
}
function guardarCotizacion() {
  try {
    localStorage.setItem("acre_lineas_pedido", JSON.stringify(cotizacion));
  } catch { /* sin guardado: no es grave */ }
}
const nuevaId = () => crypto.randomUUID
  ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/* Sesión local de una cuenta previamente autorizada por ACRE. */
function cargarCliente() {
  try {
    const sesion = JSON.parse(localStorage.getItem("acre_sesion") || "null");
    const token = localStorage.getItem("acre_token");
    return sesion?.nombre && sesion?.correo && token ? sesion : null;
  }
  catch { return null; }
}
function iniciarCliente(cuenta, token) {
  cliente = { nombre: cuenta.nombre, correo: cuenta.correo };
  try {
    localStorage.setItem("acre_sesion", JSON.stringify(cliente));
    localStorage.setItem("acre_token", token);
  } catch {}
  pintarSaludo();
}
function pintarSaludo() {
  const enlace = $("#accesoCliente");
  if (enlace) {
    enlace.textContent = cliente
      ? `Mi cuenta · ${cliente.nombre}` : "Acceso clientes";
  }
  const pie = $("#accesoPie");
  if (pie) pie.textContent = cliente ? "Mi cuenta" : "Acceso clientes";
}

/* Pide iniciar sesión y, al terminar, hace lo que se le indicó. */
function pedirRegistro(despues, titulo, sub) {
  if (cliente) { despues(); return; }
  alRegistrarse = despues;
  if (titulo) $("#registroTitulo").textContent = titulo;
  if (sub) $("#registroSub").textContent = sub;
  abrirRegistro();
}

function abrirRegistro() {
  $("#rCorreo").value = cliente?.correo || "";
  $("#rClave").value = "";
  $("#cerrarSesion").hidden = !cliente;
  $("#registroAviso").textContent = "";
  $("#veloRegistro").hidden = false;
  document.body.style.overflow = "hidden";
  $("#rCorreo").focus();
}
function cerrarRegistro() {
  $("#veloRegistro").hidden = true;
  document.body.style.overflow = "";
  alRegistrarse = null;
}

/* Cómo se identifica la solicitud */
function firma() {
  if (!cliente) return "";
  return `\n\nCliente registrado: ${cliente.nombre} (${cliente.correo})`;
}

/* Cada producto necesita una dirección propia para poder compartirlo.
   Se arma del nombre y la medida porque hay nombres repetidos: dos
   "Báscula ganadera" que solo se distinguen por los kilos. */
const limpiar = (t) => t.toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const aRuta = (p) => {
  const repetido = PRODUCTOS.filter((x) => x.nombre === p.nombre).length > 1;
  return limpiar(repetido ? `${p.nombre} ${p.spec}` : p.nombre);
};

/* Busca sin importar acentos ni mayúsculas: quien escribe "bascula"
   tiene que encontrar "báscula". */
const normalizar = (s) => (s || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

/* Fotos que no cargan: se reemplazan por un recuadro, una sola vez para
   todo el sitio. Antes esto iba escrito dentro del atributo onerror de
   cada imagen, con HTML dentro de comillas dentro de una plantilla; ahí
   se perdió una comilla y tumbó la ficha completa. */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG" || img.dataset.falló) return;
  // Las que traen su propio onerror se atienden solas (el logo, la
  // foto de portada). Si no, esto se les adelanta y las deja sin nada.
  if (img.hasAttribute("onerror")) return;
  img.dataset.falló = "1";
  const caja = document.createElement("div");
  caja.className = "sin-foto";
  caja.innerHTML = "Sin foto<br>por ahora";
  img.replaceWith(caja);
}, true);

/* ── Filtros ───────────────────────────────────────────── */
function pintarFiltros() {
  $("#filtros").innerHTML = LINEAS.filter((l) => l.id !== "servicios").map((l) => `
    <button class="chip" data-linea="${l.id}"
            aria-pressed="${l.id === linea}">${l.nombre}</button>
  `).join("");

  $("#filtros").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-linea]");
    if (!btn) return;
    linea = btn.dataset.linea;
    document.querySelectorAll("#filtros .chip").forEach((c) =>
      c.setAttribute("aria-pressed", c.dataset.linea === linea));
    pintarRejilla();
  });
}

/* ── Rejilla ───────────────────────────────────────────── */
function filtrados() {
  const q = normalizar(texto).trim();
  return PRODUCTOS.filter((p) => {
    if (p.linea === "servicios") return false;
    if (linea !== "todo" && p.linea !== linea) return false;
    if (!q) return true;
    const heno = normalizar(
      `${p.nombre} ${p.spec} ${p.material} ${p.nota}`);
    // Cada palabra por separado: "bebedero 3" debe encontrarlo
    return q.split(/\s+/).every((palabra) => heno.includes(palabra));
  });
}

function pintarRejilla() {
  const lista = filtrados();
  const totalCatalogo = PRODUCTOS.filter((p) => p.linea !== "servicios").length;

  conteo.textContent = lista.length === totalCatalogo
    ? `${totalCatalogo} productos`
    : `${lista.length} de ${totalCatalogo}`;

  if (lista.length === 0) {
    rejilla.innerHTML = `
      <div class="vacio" style="grid-column:1/-1">
        <strong>No encontramos eso</strong>
        Prueba con otra palabra, o pídelo directamente: fabricamos a la medida.
      </div>`;
    return;
  }

  rejilla.innerHTML = lista.map((p) => {
    const i = PRODUCTOS.indexOf(p);
    const puesto = cotizacion.some((r) => r.producto === i);
    return `
      <article class="ficha" data-i="${i}" tabindex="0" role="button"
               aria-label="Ver ${p.nombre}">
        <div class="ficha-img">
          ${p.img
            ? `<img src="${p.img}" alt="${p.nombre}" loading="lazy" />`
            : `<div class="sin-foto">Sin foto<br>por ahora</div>`}
        </div>
        <div class="ficha-cuerpo">
          <div class="ficha-spec">${p.spec}</div>
          <h3 class="ficha-nombre">${p.nombre}</h3>
          <p class="ficha-nota">${p.nota}</p>
          <div class="ficha-pie">
            <span>${p.material}</span>
            <button class="mini ${puesto ? "puesto" : ""}"
                    data-agregar="${i}"
                    aria-label="Agregar ${p.nombre} a la cotización">
              ${puesto ? "Agregado" : "Agregar"}
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

/* Un solo escucha para toda la rejilla: más rápido que ponerle uno a
   cada ficha, y sobrevive a que la rejilla se vuelva a pintar. */
rejilla.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-agregar]");
  if (btn) {
    e.stopPropagation();
    agregar(Number(btn.dataset.agregar));
    return;
  }
  const ficha = e.target.closest("[data-i]");
  if (ficha) irA(PRODUCTOS[Number(ficha.dataset.i)]);
});

rejilla.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const ficha = e.target.closest("[data-i]");
  if (ficha) { e.preventDefault(); irA(PRODUCTOS[Number(ficha.dataset.i)]); }
});

/* ── Ficha completa: es una PÁGINA de este sitio ─────────
   Antes mandaba al sitio anterior. Ahora vive aquí, con su propia
   dirección (#/producto/...), para poder pasarla por WhatsApp y que
   abra directo en ese producto. El botón de regresar del navegador
   funciona como se espera. */

function irA(p) {
  pedirRegistro(() => { location.hash = "/producto/" + aRuta(p); },
    "Producto exclusivo para clientes",
    "Inicia sesión con la cuenta proporcionada por ACRE.");
}

function pintarFicha(p) {
  const parientes = PRODUCTOS
    .filter((x) => x.linea === p.linea && x !== p).slice(0, 4);

  $("#fichaPagina").innerHTML = `
    <div class="envoltura">
      <button class="volver" id="volver">Regresar al catálogo</button>

      <div class="fp-rejilla">
        <div class="fp-foto">
          ${p.img
            ? `<img src="${p.img}" alt="${p.nombre}" />`
            : `<div class="sin-foto">Sin foto por ahora</div>`}
        </div>

        <div>
          <div class="fp-spec">${p.spec}</div>
          <h1 class="fp-titulo">${p.nombre}</h1>
          <p class="fp-nota">${p.nota}</p>

          <ul class="detalle-lista">
            <li><span>Material</span><span>${p.material}</span></li>
            <li><span>Medida</span><span>${p.spec}</span></li>
            <li><span>Línea</span><span>${
              LINEAS.find((l) => l.id === p.linea)?.nombre || "—"}</span></li>
            <li><span>Fabricación</span><span>Sobre pedido</span></li>
          </ul>

          <h2 class="fp-sub">Detalles</h2>
          ${p.detalles && p.detalles.length
            ? `<ul class="fp-detalles">${
                p.detalles.map((d) => `<li>${d}</li>`).join("")}</ul>`
            : `<p class="fp-pendiente">
                 Las medidas y el acabado de este equipo se definen al
                 cotizar, según cómo lo necesites. Pregúntanos y te
                 decimos exactamente qué lleva.
               </p>`}

          <div class="fp-acciones">
            <button class="btn" id="fpAgregar" data-agregar="${PRODUCTOS.indexOf(p)}">
              ${cotizacion.some((r) => r.producto === PRODUCTOS.indexOf(p))
                ? "Agregado a tu cotización" : "Agregar a mi cotización"}
            </button>
            <button class="btn linea" id="fpPreguntar">
              Preguntar por WhatsApp
            </button>
          </div>
        </div>
      </div>

      ${parientes.length ? `
      <section class="relacionados">
        <h2>Otros de la misma línea</h2>
        <div class="rejilla">
          ${parientes.map((x) => `
            <article class="ficha" data-i="${PRODUCTOS.indexOf(x)}"
                     tabindex="0" role="button" aria-label="Ver ${x.nombre}">
              <div class="ficha-img">
                ${x.img
                  ? `<img src="${x.img}" alt="${x.nombre}" loading="lazy" />`
                  : `<div class="sin-foto">Sin foto</div>`}
              </div>
              <div class="ficha-cuerpo">
                <div class="ficha-spec">${x.spec}</div>
                <h3 class="ficha-nombre">${x.nombre}</h3>
              </div>
            </article>`).join("")}
        </div>
      </section>` : ""}
    </div>`;

  $("#volver").addEventListener("click", () => {
    // Si se llegó por un enlace compartido no hay a dónde regresar
    if (history.length > 1) history.back();
    else location.hash = "#/catalogo";
  });

  $("#fpAgregar").addEventListener("click", (e) => {
    agregar(PRODUCTOS.indexOf(p));
    e.currentTarget.textContent = "Agregado a tu cotización";
  });

  $("#fpPreguntar").addEventListener("click", () => {
    pedirRegistro(() => {
      const msg = `Hola, me interesa el ${p.nombre} (${p.spec}).\n`
                + `¿Me pueden dar precio y tiempo de entrega?` + firma();
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
                  "_blank", "noopener");
    }, "Antes de preguntar",
       "Para contestarte necesitamos saber quién eres y dónde estás.");
  });

  $("#fichaPagina").querySelectorAll("[data-i]").forEach((c) => {
    const ver = () => irA(PRODUCTOS[Number(c.dataset.i)]);
    c.addEventListener("click", ver);
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ver(); }
    });
  });
}

/* Enseña la ficha o el sitio normal, según la dirección */
function enrutar() {
  const ruta = location.hash.replace(/^#/, "");
  const secciones = document.querySelectorAll(
    "header.nav ~ .portada, header.nav ~ section, footer");

  if (ruta.startsWith("/producto/")) {
    const p = PRODUCTOS.find((x) => aRuta(x) === ruta.slice(10));
    if (!cliente) {
      history.replaceState(null, "", "#/catalogo");
      pedirRegistro(() => {
        if (p) location.hash = `/producto/${aRuta(p)}`;
      }, "Producto exclusivo para clientes",
        "Inicia sesión con la cuenta proporcionada por ACRE.");
      return;
    }
    if (p) {
      secciones.forEach((el) => { el.style.display = "none"; });
      $("#fichaPagina").hidden = false;
      pintarFicha(p);
      window.scrollTo(0, 0);
      document.title = `${p.nombre} · ACRE`;
      return;
    }
  }

  if (ruta === "/catalogo" || ruta === "/servicios") {
    secciones.forEach((el) => { el.style.display = "none"; });
    const destino = ruta === "/catalogo" ? $("#catalogo") : $("#servicios");
    if (destino) destino.style.display = "block";
    const pie = document.querySelector("footer");
    if (pie) pie.style.display = "block";
    $("#fichaPagina").hidden = true;
    window.scrollTo(0, 0);
    document.title = ruta === "/catalogo" ? "Catálogo · ACRE" : "Servicios de taller · ACRE";
    return;
  }

  secciones.forEach((el) => { el.style.display = ""; });
  $("#catalogo").style.display = "none";
  $("#servicios").style.display = "none";
  $("#fichaPagina").hidden = true;
  document.title = "ACRE · Equipo para rancho ganadero";
}

window.addEventListener("hashchange", enrutar);

/* ── Cotización ────────────────────────────────────────── */
function agregar(i) {
  if (!cliente) {
    pedirRegistro(() => agregar(i), "Acceso para cotizar",
      "Inicia sesión para agregar productos a tu hoja de cotización.");
    return;
  }
  cotizacion.push({
    id: nuevaId(), producto: i, cantidad: 1, opciones: {}, adicionales: "",
  });
  guardarCotizacion();
  pintarRejilla();
  pintarFlotante();
}

function cambiarCantidad(id, cuantos) {
  const renglon = cotizacion.find((r) => r.id === id);
  if (!renglon) return;
  renglon.cantidad += cuantos;
  if (renglon.cantidad <= 0) cotizacion = cotizacion.filter((r) => r.id !== id);
  guardarCotizacion();
  pintarRejilla();
  pintarFlotante();
  pintarPanel();
}

const totalPiezas = () =>
  cotizacion.reduce((a, r) => a + r.cantidad, 0);

function pintarFlotante() {
  const n = totalPiezas();
  $("#flotante").hidden = n === 0;
  $("#flotanteNum").textContent = n;
}

function pintarPanel() {
  const lista = $("#panelLista");
  $("#cotCliente").textContent = cliente
    ? `${cliente.nombre} · ${new Date().toLocaleDateString("es-MX")}`
    : "Cliente registrado";

  if (cotizacion.length === 0) {
    lista.innerHTML = `
      <div class="vacio" style="border:none;padding:44px 0">
        <strong>Todavía no eliges nada</strong>
        Busca en el catálogo y ve agregando lo que necesitas.
      </div>`;
    $("#enviarCot").disabled = true;
    return;
  }

  $("#enviarCot").disabled = false;
  lista.innerHTML = cotizacion.map((renglon, posicion) => {
    const i = renglon.producto;
    const p = PRODUCTOS[i];
    return `
      <div class="renglon">
        <div class="renglon-codigo">ACRE-${String(Number(i) + 1).padStart(3, "0")}<br><small>Configuración ${posicion + 1}</small></div>
        <div class="renglon-txt">
          <b>${p.nombre}</b>
          <span>${p.spec} · ${p.material}</span>
        </div>
        <div class="cant">
          <button data-menos="${renglon.id}" aria-label="Quitar uno">−</button>
          <output>${renglon.cantidad}</output>
          <button data-mas="${renglon.id}" aria-label="Agregar uno">+</button>
        </div>
        ${p.opciones?.length ? `<div class="opciones-producto">${p.opciones.map((opcion) => `
          <fieldset class="grupo-opcion">
            <legend>${opcion.grupo}</legend>
            <div class="opciones-botones">
              ${opcion.valores.map((valor) => `
                <button type="button"
                  class="opcion-btn ${renglon.opciones?.[opcion.grupo] === valor ? "seleccionada" : ""}"
                  data-opcion-linea="${renglon.id}" data-grupo="${opcion.grupo}" data-valor="${valor}"
                  aria-pressed="${renglon.opciones?.[opcion.grupo] === valor}">${valor}</button>
              `).join("")}
            </div>
          </fieldset>`).join("")}</div>` : ""}
        <button type="button" class="btn-adicional" data-otra-configuracion="${renglon.id}">+ Otra configuración de este producto</button>
        <button type="button" class="btn-adicional" data-mostrar-adicional="${renglon.id}">+ Adicionales libres</button>
        <div class="renglon-adicionales" ${renglon.adicionales ? "" : "hidden"}>
          <label for="adicional-${renglon.id}">Otros detalles</label>
          <textarea id="adicional-${renglon.id}" data-adicional="${renglon.id}"
            placeholder="Ej. Lo quiero con puerta automática, color rojo y ruedas">${renglon.adicionales || ""}</textarea>
        </div>
      </div>`;
  }).join("");
}

$("#panelLista").addEventListener("click", (e) => {
  const menos = e.target.closest("[data-menos]");
  const mas = e.target.closest("[data-mas]");
  const mostrar = e.target.closest("[data-mostrar-adicional]");
  const otra = e.target.closest("[data-otra-configuracion]");
  const opcion = e.target.closest("[data-opcion-linea]");
  if (menos) cambiarCantidad(menos.dataset.menos, -1);
  if (mas) cambiarCantidad(mas.dataset.mas, +1);
  if (opcion) {
    const renglon = cotizacion.find((r) => r.id === opcion.dataset.opcionLinea);
    if (!renglon) return;
    renglon.opciones = renglon.opciones || {};
    renglon.opciones[opcion.dataset.grupo] = opcion.dataset.valor;
    guardarCotizacion();
    document.querySelectorAll(`[data-opcion-linea="${renglon.id}"]`).forEach((boton) => {
      if (boton.dataset.grupo !== opcion.dataset.grupo) return;
      const activa = boton.dataset.valor === opcion.dataset.valor;
      boton.classList.toggle("seleccionada", activa);
      boton.setAttribute("aria-pressed", activa);
    });
  }
  if (otra) {
    const original = cotizacion.find((r) => r.id === otra.dataset.otraConfiguracion);
    if (original) {
      cotizacion.push({ id: nuevaId(), producto: original.producto, cantidad: 1, opciones: {}, adicionales: "" });
      guardarCotizacion();
      pintarFlotante();
      pintarPanel();
    }
  }
  if (mostrar) {
    const campo = $("#adicional-" + mostrar.dataset.mostrarAdicional);
    campo.closest(".renglon-adicionales").hidden = false;
    campo.focus();
  }
});
$("#panelLista").addEventListener("input", (e) => {
  const campo = e.target.closest("[data-adicional]");
  if (!campo) return;
  const renglon = cotizacion.find((r) => r.id === campo.dataset.adicional);
  if (!renglon) return;
  renglon.adicionales = campo.value;
  guardarCotizacion();
});

function abrirPanel() {
  if (!cliente) {
    pedirRegistro(abrirPanel, "Acceso para cotizar",
      "Inicia sesión con la cuenta proporcionada por ACRE.");
    return;
  }
  pintarPanel();
  $("#panel").hidden = false;
  $("#cerrarPanel").focus();
}
function cerrarPanel() { $("#panel").hidden = true; }

alHacerClic("#flotante", abrirPanel);
alHacerClic("#cerrarPanel", cerrarPanel);

$("#vaciar").addEventListener("click", () => {
  cotizacion = [];
  guardarCotizacion();
  pintarRejilla();
  pintarFlotante();
  pintarPanel();
});

$("#enviarCot").addEventListener("click", () => {
  pedirRegistro(confirmarYGenerarOrden,
    "Antes de generar tu orden",
    "Inicia sesión con la cuenta proporcionada por ACRE.");
});

function confirmarYGenerarOrden() {
  const faltantes = [];
  cotizacion.forEach((r, n) => {
    const p = PRODUCTOS[r.producto];
    (p.opciones || []).forEach((o) => {
      if (!r.opciones?.[o.grupo]) faltantes.push(`${p.nombre}, configuración ${n + 1}: ${o.grupo}`);
    });
  });
  if (faltantes.length) {
    alert(`Falta elegir:\n\n${faltantes.slice(0, 8).join("\n")}${faltantes.length > 8 ? "\n..." : ""}`);
    return;
  }
  if (!confirm("¿Estás seguro de que todo está correcto y ya no quieres modificar nada?")) return;
  generarOrdenPDF();
}

function generarOrdenPDFAnterior() {
  const ahora = new Date();
  const dos = (n) => String(n).padStart(2, "0");
  const folio = `ACRE-WEB-${ahora.getFullYear()}${dos(ahora.getMonth() + 1)}${dos(ahora.getDate())}-${dos(ahora.getHours())}${dos(ahora.getMinutes())}${dos(ahora.getSeconds())}`;
  const limpiarPDF = (s) => String(s).normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, " ");
  const envolver = (texto, limite = 82) => {
    const palabras = limpiarPDF(texto).split(/\s+/); const lineas = []; let actual = "";
    palabras.forEach((p) => {
      if ((actual + " " + p).trim().length > limite) { if (actual) lineas.push(actual); actual = p; }
      else actual = (actual + " " + p).trim();
    });
    if (actual) lineas.push(actual);
    return lineas;
  };

  const detalle = [];
  cotizacion.forEach((r, n) => {
    const p = PRODUCTOS[r.producto];
    detalle.push(...envolver(`${n + 1}. ${r.cantidad} x ${p.nombre} - ${p.spec}`));
    Object.entries(r.opciones || {}).forEach(([grupo, valor]) =>
      detalle.push(...envolver(`   ${grupo}: ${valor}`)));
    if (r.adicionales?.trim()) detalle.push(...envolver(`   Otros detalles: ${r.adicionales.trim()}`));
    detalle.push("");
  });

  const base = [
    `Folio: ${folio}`,
    `Fecha: ${ahora.toLocaleDateString("es-MX")} ${ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
    `Cliente: ${cliente.nombre} (${cliente.correo})`,
    "Estado: Solicitud de precio - pendiente de confirmacion de ACRE",
    "",
    "PRODUCTOS Y CONFIGURACIONES",
    ...detalle,
    "Este documento registra la configuracion solicitada. No es una factura ni confirma el precio final.",
  ];

  const bloques = [];
  ["COPIA DEL CLIENTE", "COPIA DE ACRE"].forEach((copia) => {
    for (let i = 0; i < base.length; i += 42) bloques.push({ copia, lineas: base.slice(i, i + 42) });
  });

  const objetos = [null];
  const pageIds = bloques.map((_, i) => 3 + i * 2);
  const fontNormal = 3 + bloques.length * 2;
  const fontBold = fontNormal + 1;
  objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objetos[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  bloques.forEach((bloque, i) => {
    const pageId = pageIds[i], contentId = pageId + 1;
    objetos[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontNormal} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`;
    const esc = (s) => limpiarPDF(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const comandos = [
      "BT /F2 22 Tf 48 748 Td (ACRE) Tj ET",
      "BT /F1 10 Tf 48 730 Td (American Cattle Ranch Equipment) Tj ET",
      `BT /F2 11 Tf 430 746 Td (${esc(bloque.copia)}) Tj ET`,
      "0.31 0.36 0.22 RG 48 716 m 564 716 l S",
    ];
    let y = 694;
    bloque.lineas.forEach((linea, n) => {
      const negrita = linea === "PRODUCTOS Y CONFIGURACIONES";
      comandos.push(`BT /${negrita ? "F2" : "F1"} ${negrita ? 11 : 9.5} Tf 48 ${y} Td (${esc(linea)}) Tj ET`);
      y -= 14;
    });
    comandos.push(`BT /F1 8 Tf 48 28 Td (Orden ${esc(folio)} - pagina ${i + 1} de ${bloques.length}) Tj ET`);
    const stream = comandos.join("\n");
    objetos[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  objetos[fontNormal] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objetos[fontBold] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n"; const offsets = [0];
  for (let i = 1; i < objetos.length; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objetos[i]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objetos.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const orden = { folio, fecha: ahora.toISOString(), cliente: cliente.nombre, correo: cliente.correo, renglones: cotizacion };
  try {
    const historial = JSON.parse(localStorage.getItem("acre_ordenes") || "[]");
    historial.push(orden);
    localStorage.setItem("acre_ordenes", JSON.stringify(historial.slice(-50)));
  } catch { /* el PDF se genera aunque no se guarde el historial */ }
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  enlace.download = `${folio}.pdf`;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  alert(`Orden ${folio} generada. El PDF incluye una copia para el cliente y otra para ACRE.`);
  cerrarPanel();
}

async function generarOrdenPDF() {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error("No se pudo cargar el generador PDF");
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const ahora = new Date();
    const llaveConsecutivo = `acre_orden_consecutivo_${ahora.getFullYear()}`;
    let consecutivo = 1;
    try { consecutivo = Number(localStorage.getItem(llaveConsecutivo) || 0) + 1; } catch {}
    const folio = `${consecutivo}-${ahora.getFullYear()}`;
    const verde = [79, 93, 58], gris = [75, 77, 70];

    let logo = null;
    try {
      const img = document.querySelector(".marca img");
      if (img?.complete && img.naturalWidth) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        logo = canvas.toDataURL("image/png");
      }
    } catch { /* si el navegador bloquea canvas, se conserva el nombre ACRE */ }

    const encabezado = () => {
      doc.setFillColor(255, 255, 255); doc.rect(0, 0, 210, 41, "F");
      if (logo) {
        doc.addImage(logo, "PNG", 167, 5, 30, 30);
      }
      doc.setTextColor(...verde); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("AMERICAN CATTLE RANCH EQUIPMENT", 12, 10);
      doc.setTextColor(25, 26, 23); doc.setFontSize(20); doc.text("Hoja de pedidos", 12, 23);
      doc.setFontSize(10); doc.text(`Orden No: ${folio}`, 12, 33);
      doc.setTextColor(...gris); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text("Documento unico para el cliente y ACRE", 80, 33);
      doc.setDrawColor(...verde); doc.setLineWidth(1); doc.line(12, 39, 198, 39);
    };

    const datosOrden = () => {
      doc.setFillColor(245, 245, 241); doc.roundedRect(12, 43, 186, 21, 2, 2, "F");
      doc.setTextColor(...gris); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text("CLIENTE", 17, 49); doc.text("FECHA", 85, 49); doc.text("ESTADO", 137, 49);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(`${cliente.nombre} · ${cliente.correo}`, 17, 56);
      doc.text(ahora.toLocaleDateString("es-MX"), 85, 56);
      doc.setTextColor(...verde); doc.setFont("helvetica", "bold");
      doc.text("PENDIENTE DE PRECIO", 137, 56);
    };

    const cabeceraTabla = (y) => {
      doc.setFillColor(...verde); doc.rect(12, y, 186, 9, "F");
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text("CLAVE", 15, y + 6); doc.text("DESCRIPCION Y CONFIGURACION", 43, y + 6);
      doc.text("QTY", 162, y + 6, { align: "center" }); doc.text("PRECIO", 194, y + 6, { align: "right" });
      return y + 9;
    };

    encabezado(); datosOrden();
    let y = cabeceraTabla(70);
    cotizacion.forEach((r, posicion) => {
      const p = PRODUCTOS[r.producto];
      const opciones = Object.entries(r.opciones || {}).map(([g, v]) => `${g}: ${v}`).join(" | ");
      const detalle = [p.nombre, `${p.spec} - ${p.material}`, opciones, r.adicionales?.trim() ? `Adicionales: ${r.adicionales.trim()}` : ""]
        .filter(Boolean).join("\n");
      const lineas = doc.splitTextToSize(detalle, 108);
      const alto = Math.max(15, lineas.length * 4.5 + 5);
      if (y + alto > 265) {
        doc.addPage(); encabezado(); y = cabeceraTabla(45);
      }
      doc.setDrawColor(215, 213, 205); doc.setLineWidth(.25);
      doc.rect(12, y, 28, alto); doc.rect(40, y, 112, alto); doc.rect(152, y, 20, alto); doc.rect(172, y, 26, alto);
      doc.setTextColor(35, 36, 32); doc.setFontSize(8.5);
      doc.setFont("courier", "bold"); doc.text(`ACRE-${String(r.producto + 1).padStart(3, "0")}`, 15, y + 7);
      doc.setFont("helvetica", "normal"); doc.text(lineas, 43, y + 6);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(String(r.cantidad), 162, y + 8, { align: "center" });
      doc.setFontSize(8); doc.setTextColor(...gris); doc.text("Por cotizar", 194, y + 7, { align: "right" });
      doc.setFontSize(7); doc.text(`Configuracion ${posicion + 1}`, 15, y + 12);
      y += alto;
    });

    const total = totalPiezas();
    if (y > 240) { doc.addPage(); encabezado(); y = 48; }
    doc.setFillColor(228, 234, 218); doc.roundedRect(126, y + 7, 72, 18, 2, 2, "F");
    doc.setTextColor(...verde); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("TOTAL DE PIEZAS", 132, y + 14); doc.setFontSize(16); doc.text(String(total), 192, y + 19, { align: "right" });
    y += 34;
    doc.setTextColor(...gris); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const nota = "Esta orden registra los productos y configuraciones solicitadas. El precio y el tiempo de entrega quedan sujetos a revision y confirmacion por parte de ACRE.";
    doc.text(doc.splitTextToSize(nota, 180), 15, y);
    y += 24;
    doc.setDrawColor(120, 120, 115); doc.line(22, y, 82, y); doc.line(128, y, 188, y);
    doc.setFontSize(8); doc.text("Conformidad del cliente", 52, y + 5, { align: "center" });
    doc.text("Validacion ACRE", 158, y + 5, { align: "center" });

    const paginas = doc.getNumberOfPages();
    for (let p = 1; p <= paginas; p++) {
      doc.setPage(p); doc.setDrawColor(...verde); doc.line(12, 285, 198, 285);
      doc.setTextColor(...gris); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text(`Orden ${folio}`, 12, 290); doc.text(`Pagina ${p} de ${paginas}`, 198, 290, { align: "right" });
    }

    const orden = { folio, fecha: ahora.toISOString(), cliente: cliente.nombre, correo: cliente.correo, renglones: cotizacion };
    const token = localStorage.getItem("acre_token");
    const renglonesServidor = cotizacion.map((r, posicion) => {
      const producto = PRODUCTOS[r.producto];
      return {
        posicion: posicion + 1,
        clave: `ACRE-${String(r.producto + 1).padStart(3, "0")}`,
        producto: producto.nombre,
        especificacion: producto.spec,
        material: producto.material,
        cantidad: r.cantidad,
        opciones: r.opciones || {},
        adicionales: r.adicionales || "",
      };
    });
    const respuesta = await fetch(`${API_PEDIDOS}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ referencia: folio, renglones: renglonesServidor, total_estimado: 0,
        notas: "Precio y tiempo de entrega pendientes de confirmación por ACRE." }),
    });
    if (respuesta.status === 401) {
      localStorage.removeItem("acre_sesion"); localStorage.removeItem("acre_token"); cliente = null;
      pintarSaludo();
      throw new Error("Tu sesión venció. Inicia sesión nuevamente.");
    }
    if (!respuesta.ok) throw new Error("No se pudo enviar la orden a ACRE. Verifica la conexión e inténtalo otra vez.");
    try {
      const historial = JSON.parse(localStorage.getItem("acre_ordenes") || "[]");
      historial.push(orden); localStorage.setItem("acre_ordenes", JSON.stringify(historial.slice(-50)));
      localStorage.setItem(llaveConsecutivo, String(consecutivo));
    } catch { /* el PDF se genera aunque no se guarde el historial */ }
    doc.save(`Orden_ACRE_${folio}.pdf`);
    alert(`Orden ${folio} generada. Este unico PDF sirve para el cliente y para ACRE.`);
    cerrarPanel();
  } catch (error) {
    console.error(error);
    alert(error?.message || "No se pudo generar el PDF. Recarga la pagina e intentalo de nuevo.");
  }
}

/* ── Cuenta del cliente ────────────────────────────────── */
$("#formRegistro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = $("#rCorreo").value.trim().toLowerCase();
  const clave = $("#rClave").value;
  const aviso = $("#registroAviso");
  aviso.style.color = "#596346";
  aviso.textContent = "Verificando acceso...";
  try {
    const respuesta = await fetch(`${API_PEDIDOS}/acceso`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, clave }),
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.detail || "Acceso incorrecto");
    iniciarCliente({ nombre: datos.cliente, correo: datos.correo }, datos.token);
  } catch (error) {
    aviso.style.color = "#a33";
    aviso.textContent = error?.message === "Failed to fetch"
      ? "No se pudo conectar con ACRE. Inténtalo nuevamente en unos momentos."
      : `${error?.message || "Acceso incorrecto"}. Solicita tu cuenta directamente a ACRE.`;
    return;
  }

  const seguir = alRegistrarse;
  cerrarRegistro();
  if (seguir) seguir();
});

alHacerClic("#cerrarRegistro", cerrarRegistro);
$("#veloRegistro").addEventListener("click", (e) => {
  if (e.target === $("#veloRegistro")) cerrarRegistro();
});
function abrirCuenta(e) {
  e.preventDefault();
  $("#registroTitulo").textContent = cliente ? "Mi cuenta" : "Acceso para clientes";
  $("#registroSub").textContent = cliente
    ? `Sesión iniciada como ${cliente.nombre} (${cliente.correo}).`
    : "Ingresa con la cuenta proporcionada por ACRE.";
  abrirRegistro();
}
$("#accesoCliente").addEventListener("click", abrirCuenta);
$("#accesoPie").addEventListener("click", abrirCuenta);
$("#cerrarSesion").addEventListener("click", () => {
  localStorage.removeItem("acre_sesion");
  localStorage.removeItem("acre_token");
  cliente = null;
  cerrarRegistro();
  pintarSaludo();
  location.hash = "#/catalogo";
});

/* ── Servicios ─────────────────────────────────────────── */
function pintarServicios() {
  $("#serviciosRejilla").innerHTML = PRODUCTOS
    .filter((p) => p.linea === "servicios")
    .map((s) => `
      <div class="servicio">
        <h3>${s.nombre}</h3>
        <p>${s.nota}</p>
      </div>`)
    .join("");
}

/* ── Rastreo ───────────────────────────────────────────── */
const ETAPAS = ["Recibido", "Corte", "Soldadura", "Pintura", "Listo"];
/* Por ahora los pedidos se dan de alta aquí. Después se conectará esta
   consulta con el programa interno para actualizarla automáticamente. */
const PEDIDOS_RASTREO = {
  "ACRE-7K42": { etapa: 2, nota: "Pedido de demostración" },
};

alHacerClic("#btnRastrear", rastrear);
$("#codigo").addEventListener("keydown", (e) => {
  if (e.key === "Enter") rastrear();
});

function rastrear() {
  const codigo = $("#codigo").value.trim().toUpperCase();
  const caja = $("#avance");
  const nota = $("#avanceNota");

  if (codigo.length < 4) {
    caja.hidden = false;
    $("#etapas").innerHTML = "";
    nota.textContent = "Escribe el código completo que te dimos al hacer el pedido.";
    return;
  }

  const pedido = PEDIDOS_RASTREO[codigo];
  if (!pedido) {
    caja.hidden = false;
    $("#etapas").innerHTML = "";
    nota.textContent = "No encontramos ese código. Revisa cómo está escrito o solicítalo a ACRE.";
    return;
  }
  const etapa = pedido.etapa;

  $("#etapas").innerHTML = ETAPAS.map((e, i) => `
    <div class="etapa ${i <= etapa ? "lista" : ""}">
      <i></i><span>${e}</span>
    </div>`).join("");

  nota.textContent = etapa === ETAPAS.length - 1
    ? `Pedido ${codigo}: terminado y listo para entrega.`
    : `Pedido ${codigo}: va en ${ETAPAS[etapa].toLowerCase()}.`;
  caja.hidden = false;
}

/* ── Menú en pantallas chicas ──────────────────────────── */
$("#menu").addEventListener("click", () => {
  const abierto = $("#navLinks").classList.toggle("abierto");
  $("#menu").setAttribute("aria-expanded", abierto);
});
$("#navLinks").addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    $("#navLinks").classList.remove("abierto");
    $("#menu").setAttribute("aria-expanded", "false");
  }
});

/* ── Arranque ──────────────────────────────────────────── */
const PORTADA_PRODUCTOS = PRODUCTOS.filter((p) => p.img && p.linea !== "servicios").slice(0, 6);
let portadaActual = Math.max(0, PORTADA_PRODUCTOS.findIndex((p) => p.nombre.includes("Trampa Bull")));
function pintarPortada() {
  const p = PORTADA_PRODUCTOS[portadaActual];
  if (!p || !$("#portadaImagen")) return;
  $("#portadaImagen").src = p.img;
  $("#portadaImagen").alt = p.nombre;
  $("#portadaNombre").textContent = p.nombre;
  $("#portadaMaterial").textContent = p.material;
}
function moverPortada(paso) {
  portadaActual = (portadaActual + paso + PORTADA_PRODUCTOS.length) % PORTADA_PRODUCTOS.length;
  pintarPortada();
}
alHacerClic("#portadaAnterior", (e) => { e.stopPropagation(); moverPortada(-1); });
alHacerClic("#portadaSiguiente", (e) => { e.stopPropagation(); moverPortada(1); });
alHacerClic("#portadaImagen", () => irA(PORTADA_PRODUCTOS[portadaActual]));
$("#portadaImagen")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") irA(PORTADA_PRODUCTOS[portadaActual]);
});

$("#busca").addEventListener("input", (e) => {
  texto = e.target.value;
  pintarRejilla();
});
$("#numProductos").textContent = PRODUCTOS.filter((p) => p.linea !== "servicios").length;

pintarSaludo();
enrutar();          // por si se abrió con un enlace directo a una ficha
pintarFiltros();
pintarRejilla();
pintarServicios();
pintarFlotante();
pintarPortada();
