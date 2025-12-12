type CartaAceptacionParams = {
  ciudadFecha: string // "La Paz, 12 de diciembre de 2025"

  // Destinatario: Jefe de Carrera
  jefeNombre: string // "My. DIM Jose Perez Perez"
  jefeCargo: string // "JEFE DE CARRERA DE INGENIERÍA AMBIENTAL"

  // Estudiante
  estudianteNombre: string // "Tola Autalio, Abel"
  estudianteEspecialidad: string // "Ingeniería Ambiental"

  tituloProyecto: string // "PROYECTO INTELIGENTE"

  // Tutor (Firmante)
  tutorNombre: string
  tutorGrado?: string // Use in signature?
}

const styles = `
@page {
  size: letter;
  margin: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  font-size: 12pt;
  background: #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* ===== CONTENEDOR ===== */
.page {
  width: 21.59cm; /* Carta: 8.5in */
  min-height: 27.94cm; /* Carta alto 11in */
  background: white;
  padding: 3cm 2.5cm 3cm 3.5cm;
  margin: 20px auto;
  border: 1px solid #d1d5db;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

@media print {
  body {
    background: white;
    display: block;
  }
  .page {
    margin: 0;
    border: none;
    box-shadow: none;
    width: auto;
    height: auto;
  }
}

/* ===== HEADER ===== */
.header-top {
  text-align: right;
  margin-bottom: 2cm;
}
.header-top div {
  margin-bottom: 4px;
}

.ref {
  font-weight: bold;
  text-align: left;
  margin-bottom: 24px;
}

/* ===== DESTINATARIO ===== */
.destinatario {
  text-align: left;
  margin-bottom: 1.5cm;
  font-weight: bold;
  text-transform: uppercase;
}
.destinatario div {
  margin-bottom: 2px;
}

/* ===== CUERPO ===== */
.body {
  text-align: justify;
  line-height: 1.5;
  margin-bottom: 2cm;
}

/* ===== FIRMA ===== */
.firma {
  margin-top: 120px;
  text-align: center;
}

.firma-line {
  width: 250px;
  margin: 0 auto 8px;
  border-top: 1px solid #000;
}

.firma-nombre {
  font-weight: bold;
  text-transform: uppercase;
}
`

const esc = (v: string) =>
  (v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

const buildHtml = (p: CartaAceptacionParams) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Aceptación a Tutoría</title>
  <style>${styles}</style>
</head>
<body>
  <div class="page">
    
    <!-- FECHA -->
    <div class="header-top">
      <div>${esc(p.ciudadFecha)}</div>
    </div>

    <!-- REFERENCIA -->
    <div class="ref">
      Ref.: Aceptación a Tutoría
    </div>

    <!-- DESTINATARIO -->
    <div class="destinatario">
      <div>Señor</div>
      <div>${esc(p.jefeNombre)}</div>
      <div>${esc(p.jefeCargo)}</div>
      <div>Presente.-</div>
    </div>

    <!-- CUERPO -->
    <div class="body">
      <p>
        Una vez analizado y revisado el Perfil de Trabajo de Grado propuesto por el
        estudiante <strong>${esc(p.estudianteNombre)}</strong>, de la especialidad de <strong>${esc(p.estudianteEspecialidad)}</strong>,
        bajo el Título <strong>"${esc(p.tituloProyecto)}"</strong> acepto hacerme cargo de su
        Tutoría y me comprometo a cumplir las responsabilidades inherentes a esta
        función, establecidas en el Reglamento RAC – 02 GRADUACIÓN,
        DIPLOMAS Y TÍTULOS DE GRADO de la Escuela Militar de Ingeniería.
      </p>
      
      <p>
        Para su consideración y fines consiguientes, adjunto a la presente un resumen de mi Curriculum Vitae.
      </p>
      
      <p>
        Sin otro particular, reitero a usted la seguridad de mi mayor consideración.
      </p>
    </div>

    <!-- FIRMA -->
    <div class="firma">
      <div class="firma-line"></div>
      <div class="firma-nombre">${esc(p.tutorNombre)}</div>
      <div class="firma-nombre">TUTOR</div>
    </div>

  </div>
</body>
</html>
`

export const openCartaAceptacionWindow = (p: CartaAceptacionParams) => {
  if (typeof window === "undefined") return
  const html = buildHtml(p)
  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 500)
}

export type { CartaAceptacionParams }
