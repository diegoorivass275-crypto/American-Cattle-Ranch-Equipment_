/* Catálogo de ACRE.

   Los datos salieron del sitio actual (americancattleranchequipment.com).
   Está en un archivo aparte a propósito: así se le agregan productos sin
   tocar el diseño ni la lógica de la página.

   Cada producto lleva:
     nombre   como se le conoce
     linea    a qué familia pertenece (mueve los filtros)
     spec     la medida que lo distingue — es el titular de la ficha
     img      foto (por ahora apunta al sitio actual; ver LEEME.txt)
     url      enlace al sitio anterior (ya no se usa; la ficha vive aquí)
     detalles lista de puntos para la ficha completa (opcional)
     nota     una línea de contexto para el cliente
*/

const BASE = "https://americancattleranchequipment.com/wp-content/uploads/";

const LINEAS = [
  { id: "todo",         nombre: "Todo" },
  { id: "estructuras",  nombre: "Corraletas y puertas" },
  { id: "trampas",      nombre: "Trampas y manejo" },
  { id: "chutis",       nombre: "Chutis" },
  { id: "media_naranja",nombre: "Medias naranjas" },
  { id: "camiones",     nombre: "Camiones" },
  { id: "contenedores", nombre: "Contenedores" },
  { id: "comederos",    nombre: "Comederos y bebederos" },
  { id: "basculas",     nombre: "Básculas" },
  { id: "materiales",   nombre: "Materiales" },
  { id: "servicios",    nombre: "Servicios de taller" },
  { id: "otros",        nombre: "Otros equipos" },
];

const PRODUCTOS = [
  /* ── Corraletas y puertas ─────────────────────────────── */
  {
    nombre: "Corraleta 24 pies con puerta",
    linea: "estructuras", spec: "24 pies", material: "Tubo petrolero",
    img: BASE + "2025/12/image-44.png",
    url: "https://americancattleranchequipment.com/corraleta-24-pies-con-puerta-tubo-petrolero/",
    nota: "Con puerta integrada, para armar corrales de manejo.",
  },
  {
    nombre: "Corraleta 24 pies",
    linea: "estructuras", spec: "24 pies", material: "Tubo petrolero",
    img: BASE + "2025/10/image-Photoroom-3.png",
    url: "https://americancattleranchequipment.com/tubo-petrolero/",
    nota: "Panel de tubo petrolero, la medida más pedida.",
    detalles: [
      "Fabricada en tubo petrolero recuperado.",
      "24 pies de largo, la medida estándar de corral.",
      "Se une con otras corraletas para armar el corral completo.",
    ],
  },
  {
    nombre: "Corraleta 32 pies",
    linea: "estructuras", spec: "32 pies", material: "Tubo petrolero",
    img: BASE + "2025/10/image-Photoroom-3.png",
    url: "https://americancattleranchequipment.com/corraleta-32-pies-tubo-petrolero/",
    nota: "Para cerrar más metro con menos postes.",
  },
  {
    nombre: "Corraleta con pintura",
    linea: "estructuras", spec: "Estándar", material: "Acero pintado",
    img: BASE + "2025/12/image-17.png",
    url: "https://americancattleranchequipment.com/corraleta-c-pintura/",
    nota: "Acabado pintado, para clima menos agresivo.",
  },
  {
    nombre: "Corraleta con puerta",
    linea: "estructuras", spec: "Estándar", material: "Acero",
    img: BASE + "2025/12/image-38.png",
    url: "https://americancattleranchequipment.com/corraleta-c-puerta/",
    nota: "Paso de gente sin abrir todo el corral.",
  },
  {
    nombre: "Puerta de tubo",
    linea: "estructuras", spec: "Normal", material: "Tubo",
    img: BASE + "2025/12/image-25.png",
    url: "https://americancattleranchequipment.com/puerta-tubo-normal/",
    nota: "La puerta de todos los días.",
  },
  {
    nombre: "Puerta económica",
    linea: "estructuras", spec: "Económica", material: "Acero",
    img: BASE + "2025/12/image-Photoroom-49-10.png",
    url: "https://americancattleranchequipment.com/puerta-economica/",
    nota: "Misma función, menos inversión.",
  },
  {
    nombre: "Puerta de 12 pies",
    linea: "estructuras", spec: "12 pies", material: "Acero",
    img: null,
    url: "https://americancattleranchequipment.com/puerta-de-12-pies-normal/",
    nota: "Ancha, para que pase el tractor.",
  },
  {
    nombre: "Guarda ganado",
    linea: "estructuras", spec: "5 × 12 pies", material: "Acero",
    img: BASE + "2025/12/image-30.png",
    url: "https://americancattleranchequipment.com/guarda-ganado-5-por-12-pies/",
    nota: "Cruza el vehículo, no cruza el ganado.",
  },

  /* ── Trampas y manejo ─────────────────────────────────── */
  {
    nombre: "Trampa Bull con palpador",
    linea: "trampas", spec: "Con palpador", material: "Acero reforzado",
    img: BASE + "2025/12/image-41.png",
    url: "https://americancattleranchequipment.com/trampa-bull-con-palpadora/",
    nota: "Para palpación y trabajo veterinario sin pelear con el animal.",
    detalles: [
      "Cajón palpador integrado al cuerpo de la trampa.",
      "Estructura de acero reforzado para animal pesado.",
      "Puertas laterales para acceso al costado del animal.",
      "Acabado con sandblast y pintura electrostática.",
    ],
    opciones: [
      { grupo: "Lámina", valores: ["Lisa", "Doblada"] },
    ],
  },
  {
    nombre: "Trampa Bull sin palpador",
    linea: "trampas", spec: "Sin palpador", material: "Acero reforzado",
    img: BASE + "2025/11/image-Photoroom-37.png",
    url: "https://americancattleranchequipment.com/trampa-bull-sin-palpador/",
    nota: "Sujeción firme para vacunar, marcar y revisar.",
    opciones: [
      { grupo: "Lámina", valores: ["Lisa", "Doblada"] },
    ],
  },
  {
    nombre: "Trampa hidráulica",
    linea: "trampas", spec: "Hidráulica", material: "Acero reforzado",
    img: BASE + "2025/11/image-Photoroom-38.png",
    url: "https://americancattleranchequipment.com/trampa-hidraulica/",
    nota: "Menos esfuerzo del operador en jornadas largas.",
    opciones: [
      { grupo: "Medida", valores: ["10 ft", "20 ft", "30 ft"] },
      { grupo: "Media naranja", valores: ["Con media naranja", "Sin media naranja"] },
      { grupo: "Piso", valores: ["Hule", "Varilla", "Lámina"] },
      { grupo: "Lámina", valores: ["Lisa", "Doblada"] },
      { grupo: "Rotulación", valores: ["Con letras", "Sin letras"] },
      { grupo: "Motor", valores: ["Gasolina", "Eléctrico"] },
      { grupo: "Puertas inferiores", valores: ["2 puertas", "3 puertas"] },
      { grupo: "Tiras de barrote", valores: ["1 tira", "2 tiras"] },
      { grupo: "Levantamiento hidráulico", valores: ["Con sistema", "Sin sistema"] },
      { grupo: "Llantas", valores: ["Con llantas", "Sin llantas"] },
    ],
  },
  {
    nombre: "Trampa hidráulica con jalón y espiga",
    linea: "trampas", spec: "Hidráulica", material: "Acero reforzado",
    img: BASE + "2025/12/image-29.png",
    url: "https://americancattleranchequipment.com/trampa-hidraulica-con-jalon-y-espiga/",
    nota: "Se engancha y se lleva de potrero en potrero.",
    opciones: [
      { grupo: "Medida", valores: ["10 ft", "20 ft", "30 ft"] },
      { grupo: "Media naranja", valores: ["Con media naranja", "Sin media naranja"] },
      { grupo: "Piso", valores: ["Hule", "Varilla", "Lámina"] },
      { grupo: "Lámina", valores: ["Lisa", "Doblada"] },
      { grupo: "Rotulación", valores: ["Con letras", "Sin letras"] },
      { grupo: "Motor", valores: ["Gasolina", "Eléctrico"] },
      { grupo: "Puertas inferiores", valores: ["2 puertas", "3 puertas"] },
      { grupo: "Tiras de barrote", valores: ["1 tira", "2 tiras"] },
      { grupo: "Levantamiento hidráulico", valores: ["Con sistema", "Sin sistema"] },
      { grupo: "Llantas", valores: ["Con llantas", "Sin llantas"] },
    ],
  },
  {
    nombre: "Trampa económica con cajón palpador",
    linea: "trampas", spec: "Con palpador", material: "Acero",
    img: BASE + "2025/10/image-Photoroom-8.png",
    url: "https://americancattleranchequipment.com/trampa-economica-con-cajon-palpador/",
    nota: "El cajón palpador sin el precio de la Bull.",
  },
  {
    nombre: "Trampa económica",
    linea: "trampas", spec: "Económica", material: "Acero",
    img: BASE + "2025/10/image-6.png",
    url: "https://americancattleranchequipment.com/trampa-economica/",
    nota: "Para hatos chicos o como segunda trampa.",
  },
  {
    nombre: "Trampa lazo",
    linea: "trampas", spec: "Lazo", material: "Acero",
    img: BASE + "2025/10/image-Photoroom-7.png",
    url: "https://americancattleranchequipment.com/trampa-lazo/",
    nota: "Captura en potrero abierto.",
  },
  {
    nombre: "Chutis",
    linea: "chutis", spec: "Manual", material: "Acero",
    img: BASE + "2025/11/image-Photoroom-11.png",
    url: "https://americancattleranchequipment.com/chutis/",
    nota: "Manga de trabajo para encauzar el ganado.",
    opciones: [
      { grupo: "Largo", valores: ["10 ft", "20 ft", "30 ft", "40 ft"] },
      { grupo: "Puertas", valores: ["1 puerta", "2 puertas", "3 puertas"] },
      { grupo: "Media naranja", valores: ["Con media naranja", "Sin media naranja"] },
    ],
  },
  {
    nombre: "Chutis hidráulico",
    linea: "chutis", spec: "Hidráulico", material: "Acero",
    img: BASE + "2025/12/image-Photoroom-49-3.png",
    url: "https://americancattleranchequipment.com/chutis-hidraulico/",
    nota: "Mismo trabajo, accionado con hidráulico.",
    opciones: [
      { grupo: "Largo", valores: ["10 ft", "20 ft", "30 ft", "40 ft"] },
      { grupo: "Puertas", valores: ["1 puerta", "2 puertas", "3 puertas"] },
      { grupo: "Media naranja", valores: ["Con media naranja", "Sin media naranja"] },
    ],
  },
  {
    nombre: "Media naranja",
    linea: "media_naranja", spec: "Configurable", material: "Acero",
    img: BASE + "2025/12/image-Photoroom-49-2.png",
    url: "https://americancattleranchequipment.com/nueva-media-naranja/",
    nota: "Embudo de acceso a la manga.",
    opciones: [
      { grupo: "Lado", valores: ["Izquierda", "Derecha"] },
      { grupo: "Puerta", valores: ["Puerta al frente", "Puerta lateral"] },
    ],
  },

  /* ── Camiones ────────────────────────────────────────── */
  {
    nombre: "Camión ganadero",
    linea: "camiones", spec: "A la medida", material: "Acero",
    img: null,
    url: "",
    nota: "Configuración de carrocería ganadera según el trabajo requerido.",
    opciones: [
      { grupo: "Sistema", valores: ["Sencillo", "Hidráulico"] },
    ],
  },

  /* ── Comederos y bebederos ────────────────────────────── */
  {
    nombre: "Comedero 10 pies",
    linea: "comederos", spec: "10 pies", material: "Acero",
    img: BASE + "2025/12/image-47.png",
    url: "https://americancattleranchequipment.com/comedero-10-pies/",
    nota: "La medida de siempre para corral chico.",
  },
  {
    nombre: "Comedero de un lado, 20 pies",
    linea: "comederos", spec: "20 pies", material: "Acero",
    img: BASE + "2025/10/image-Photoroom-6.png",
    url: "https://americancattleranchequipment.com/comedero-20-pies/",
    nota: "Se arrima a la cerca y come de un solo lado.",
  },
  {
    nombre: "Comedero cerrado con rampa",
    linea: "comederos", spec: "Cerrado", material: "Acero",
    img: BASE + "2025/12/image-19.png",
    url: "https://americancattleranchequipment.com/comedero-cerrado-con-rampa/",
    nota: "Protege el alimento del agua y del desperdicio.",
  },
  {
    nombre: "Comedero de tubo petrolero",
    linea: "comederos", spec: "Reforzado", material: "Tubo petrolero",
    img: BASE + "2025/10/image-Photoroom-11.png",
    url: "https://americancattleranchequipment.com/comedero-de-tubo-petrolero/",
    nota: "Para ganado que maltrata el equipo.",
  },
  {
    nombre: "Comedero normal",
    linea: "comederos", spec: "Estándar", material: "Acero",
    img: null,
    url: "https://americancattleranchequipment.com/comedero-normal/",
    nota: "El modelo base del catálogo.",
  },
  {
    nombre: "Bebedero 10 pies",
    linea: "comederos", spec: "350 L", material: "Acero",
    img: BASE + "2025/10/image-Photoroom-5.png",
    url: "https://americancattleranchequipment.com/bebedero-10-pies/",
    nota: "Largo, para que tomen varias a la vez.",
  },
  {
    nombre: "Bebedero 3 mil litros",
    linea: "comederos", spec: "3,000 L", material: "Acero",
    img: BASE + "2025/12/image-28.png",
    url: "https://americancattleranchequipment.com/bebedero-3-mil-litros/",
    nota: "Reserva para potrero con poca recarga.",
  },
  {
    nombre: "Bebedero 6 mil litros",
    linea: "comederos", spec: "6,000 L", material: "Acero",
    img: BASE + "2025/12/image-24.png",
    url: "https://americancattleranchequipment.com/bebedero-6-mil-litros/",
    nota: "Para hato grande o época de sequía.",
  },
  {
    nombre: "Bebedero 10 mil litros",
    linea: "comederos", spec: "10,000 L", material: "Acero",
    img: BASE + "2025/12/image-43.png",
    url: "https://americancattleranchequipment.com/bebedero-10-mil-litros/",
    nota: "La capacidad más grande del catálogo.",
    detalles: [
      "Capacidad de 10,000 litros.",
      "Lámina de acero soldada, sin uniones que goteen.",
      "Acabado interior y exterior contra la corrosión.",
    ],
  },

  /* ── Básculas ─────────────────────────────────────────── */
  {
    nombre: "Báscula ganadera",
    linea: "basculas", spec: "1,500 kg", material: "Acero + celdas",
    img: BASE + "2025/11/image-Photoroom-29.png",
    url: "https://americancattleranchequipment.com/bascula-de-1500-kg/",
    nota: "Pesaje de corral para control de engorda.",
  },
  {
    nombre: "Báscula ganadera",
    linea: "basculas", spec: "2,000 kg", material: "Acero + celdas",
    img: BASE + "2025/11/image-Photoroom-29.png",
    url: "https://americancattleranchequipment.com/bascula-de-2000-kg/",
    nota: "Más capacidad, para animal pesado.",
  },
  {
    nombre: "Sensores para báscula electrónica",
    linea: "basculas", spec: "Refacción", material: "Celdas de carga",
    img: BASE + "2025/12/image-Photoroom-40.png",
    url: "https://americancattleranchequipment.com/sensores-para-bascula-electrica/",
    nota: "Repuesto para báscula que ya tienes.",
  },

  /* ── Materiales ───────────────────────────────────────── */
  {
    nombre: "Tubo petrolero",
    linea: "materiales", spec: "Por tramo", material: "Acero recuperado",
    img: BASE + "2025/12/image-23.png",
    url: "https://americancattleranchequipment.com/tubo-petrolero-2/",
    nota: "El material con el que se hace lo que aguanta.",
  },
  {
    nombre: "Cajón palpador",
    linea: "materiales", spec: "Componente", material: "Acero",
    img: BASE + "2025/12/image-Photoroom-45.png",
    url: "https://americancattleranchequipment.com/cajon-paplpador/",
    nota: "Para agregarlo a una trampa que ya tienes.",
  },
  {
    nombre: "Cajón de madera",
    linea: "materiales", spec: "Componente", material: "Madera",
    img: BASE + "2025/12/image-40.png",
    url: "https://americancattleranchequipment.com/cajon-de-madera/",
    nota: "Piso y costados de madera.",
  },
  {
    nombre: "Contenedor de basura",
    linea: "contenedores", spec: "Configurable", material: "Acero",
    img: BASE + "2025/11/WhatsApp-Image-2025-10-20-at-7.34.16-PM-Photoroom.png",
    url: "https://americancattleranchequipment.com/contenedor-de-basura/",
    nota: "Para rancho, obra o taller.",
    opciones: [
      { grupo: "Tapa", valores: ["Con tapa", "Sin tapa"] },
      { grupo: "Ruedas", valores: ["Con ruedas", "Sin ruedas"] },
      { grupo: "Sujeción", valores: ["Con ganchos", "Con barras"] },
      { grupo: "Forma", valores: ["Cuadrado", "Estándar"] },
    ],
  },
  {
    nombre: "Contenedor de basura con llantas",
    linea: "contenedores", spec: "Con llantas", material: "Acero",
    img: BASE + "2025/12/image-14.png",
    url: "https://americancattleranchequipment.com/contenedor-de-basura-con-llantas/",
    nota: "Se mueve sin montacargas.",
    opciones: [
      { grupo: "Tapa", valores: ["Con tapa", "Sin tapa"] },
      { grupo: "Sujeción", valores: ["Con ganchos", "Con barras"] },
      { grupo: "Forma", valores: ["Cuadrado", "Estándar"] },
    ],
  },

  /* ── Servicios de taller ──────────────────────────────── */
  {
    nombre: "Sandblast",
    linea: "servicios", spec: "Servicio", material: "Preparación",
    img: BASE + "2025/12/sanb.jpg",
    url: "https://americancattleranchequipment.com/sandblast/",
    nota: "Deja el acero limpio para que la pintura agarre.",
  },
  {
    nombre: "Pintado electrostático",
    linea: "servicios", spec: "Servicio", material: "Acabado",
    img: BASE + "2025/12/electo.jpg",
    url: "https://americancattleranchequipment.com/servicio-de-pintado-de-remolques/",
    nota: "Acabado parejo y más resistente que el de brocha.",
  },
  {
    nombre: "Trabajo de soldadura",
    linea: "servicios", spec: "Servicio", material: "Fabricación",
    img: BASE + "2025/12/sol.jpg",
    url: "https://americancattleranchequipment.com/trabajo-de-soldadura/",
    nota: "Reparación y fabricación a la medida.",
  },
  {
    nombre: "Instalación de báscula",
    linea: "servicios", spec: "Servicio", material: "Instalación",
    img: BASE + "2025/12/sensores.jpg",
    url: "https://americancattleranchequipment.com/instalacion-de-bascula/",
    nota: "Montaje y calibración en tu corral.",
  },
  {
    nombre: "Dobleces de PTR",
    linea: "servicios", spec: "Servicio", material: "Maquinado",
    img: BASE + "2025/12/dob-ptr.jpg",
    url: "https://americancattleranchequipment.com/dobleces-de-ptr/",
    nota: "Doblado de perfil sin que se colapse.",
  },
  {
    nombre: "Dobleces",
    linea: "servicios", spec: "Servicio", material: "Maquinado",
    img: BASE + "2025/12/dob.jpg",
    url: "https://americancattleranchequipment.com/dobleces/",
    nota: "Doblez de lámina y solera a medida.",
  },
];
