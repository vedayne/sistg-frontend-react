type CartaInvitacionParams = {
  ciudadFecha: string // "La Paz, 12 de diciembre de 2025"

  // Destinatario (Tutor sugerido o Jefe de Carrera?) -> Prompt implies "invitar a usted... en calidad de TUTOR", so Destinatario = Tutor
  destinatarioNombre: string // "My. DIM Jose Perez Perez"
  destinatarioCargo: string // "JEFE DE CARRERA DE INGENIERÍA AMBIENTAL" (Example used this, but maybe it's the Tutor's title?)
  // Let's keep it generic:
  destinatarioGrado?: string // "My. DIM"

  // Estudiante
  estudianteNombre: string
  estudianteSemestre: string // "Octavo", "Noveno", "10mo"
  estudianteCarrera: string // "Ingeniería de Sistemas"

  tituloProyecto: string
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
  line-height: 1.5; /* 1.5 lines spacing often looks better for formal letters in Arial 12 */
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

const buildHtml = (p: CartaInvitacionParams) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invitación a Tutoría</title>
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
      Ref.: Invitación a Tutoría
    </div>

    <!-- DESTINATARIO -->
    <div class="destinatario">
      <div>Señor</div>
      <div>${esc(p.destinatarioNombre)}</div>
      <div>${esc(p.destinatarioCargo)}</div>
      <div>Presente.-</div>
    </div>

    <!-- CUERPO -->
    <div class="body">
      <p>
        En mi condición de estudiante del ${esc(p.estudianteSemestre)} Semestre de la Carrera de 
        ${esc(p.estudianteCarrera)} de la Escuela Militar de Ingeniería, y habiendo hecho una valoración 
        de sus antecedentes profesionales, y su capacidad profesional en el área de ingeniería, me permito 
        invitar a usted para que me colabore en calidad de <strong>TUTOR</strong> en el desarrollo de mi Trabajo de Grado 
        Titulado: <strong>"${esc(p.tituloProyecto)}"</strong>, cuyo perfil tengo a bien acompañar a la presente para su revisión y análisis.
      </p>
      
      <p>
        Asimismo, me comprometo ante usted cumplir y subsanar las sugerencias y/u observaciones que se presenten 
        durante la elaboración del trabajo.
      </p>
      
      <p>
        Sin otro particular, reitero a usted la seguridad de mi mayor consideración.
      </p>
    </div>

    <!-- FIRMA -->
    <div class="firma">
      <div class="firma-line"></div>
      <div class="firma-nombre">${esc(p.estudianteNombre)}</div>
      <div class="firma-nombre">ESTUDIANTE</div> 
      <!-- Or just the name? Prompt says "Y EN EL FIR DE FIRMA EL NOMBRE DEL estudiante" -->
    </div>

  </div>
</body>
</html>
`

export const openCartaInvitacionWindow = (p: CartaInvitacionParams) => {
  if (typeof window === "undefined") return
  const html = buildHtml(p)
  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 500)
}

export type { CartaInvitacionParams }
