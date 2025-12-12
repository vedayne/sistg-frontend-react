type NotaServicioParams = {
  cite: string
  fecha: string

  tituloProyecto: string
  postulante: string
  tutor: string
  revisor1: string
  revisor2?: string
  docenteTG: string

  fase?: string
  jefeCarrera?: string
  gradoJefe?: string
}

const styles = `
@page {
  size: letter;
  margin: 3.5cm 2.5cm 3cm 3cm; 
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Times New Roman", serif;
  font-size: 14px;
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
  padding: 0;
  border: 1px solid #d1d5db;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* ===== CITE Y FECHA ===== */
.cite-fecha {
  text-align: right;
  margin: 0 32px 24px 0;
}

.cite {
  font-weight: bold;
}

/* ===== TITULO ===== */
.title {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  text-decoration: underline;
  margin: 24px 0 20px;
}

/* ===== DESTINATARIOS ===== */
.destinatarios {
  display: flex;
  margin-bottom: 22px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dest-left {
  flex: 0 0 30%;
  font-weight: bold;
}

.dest-right {
  flex: 0 0 70%;
  line-height: 1.4;
  text-align: left;
}

.dest-item {
  margin-bottom: 8px;
}

.dest-nombre {
  text-transform: uppercase;
}

.dest-cargo {
  font-weight: bold;
  text-transform: uppercase;
}

/* ===== CUERPO ===== */
.body {
  text-align: justify;
  line-height: 1.6;
}

.lista {
  margin: 10px 0 12px 24px;
  list-style: none;
  padding-left: 0;
}
.lista li { list-style: none; }
.lista li::before { content: "- "; }

/* ===== FIRMA ===== */
.firma {
  margin-top: 40px;
  text-align: center;
}

.firma-line {
  width: 320px;
  margin: 0 auto 8px;
  border-top: 1px solid #000;
}

.firma-nombre {
  font-weight: bold;
  text-transform: uppercase;
}

.firma-cargo {
  font-weight: bold;
}
`

const esc = (v: string) =>
  (v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

const buildHtml = (p: NotaServicioParams) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Nota de Servicio</title>
  <style>${styles}</style>
</head>
<body>
  <div class="page">

    <!-- CITE Y FECHA -->
    <div class="cite-fecha">
      <div class="cite">CITE: ${esc(p.cite)}</div>
      <div class="fecha">${esc(p.fecha)}</div>
    </div>

    <!-- TITULO -->
    <div class="title">NOTA DE SERVICIO</div>

    <!-- DESTINATARIOS -->
    <div class="destinatarios">
      <div class="dest-left">SEÑORES:</div>
      <div class="dest-right">

        <div class="dest-item">
          <div class="dest-nombre">{{POSTULANTE}}</div>
          <div class="dest-cargo">POSTULANTE</div>
        </div>

        <div class="dest-item">
          <div class="dest-nombre">{{TUTOR}}</div>
          <div class="dest-cargo">TUTOR</div>
        </div>

        <div class="dest-item">
          <div class="dest-nombre">{{REVISOR1}}</div>
          <div class="dest-cargo">VOCAL REVISOR</div>
        </div>

        {{REVISOR2}}

        <div class="dest-item">
          <div class="dest-nombre">{{DOCTG}}</div>
          <div class="dest-cargo">DOCENTE DE TRABAJO DE GRADO</div>
        </div>

      </div>
    </div>

    <!-- CUERPO -->
    <div class="body">
      En cumplimiento al Reglamento RAC-02 Graduación de Grado en su capítulo VII
      <strong>DESARROLLO DEL TRABAJO DE GRADO Y TRABAJO DE GRADO TÉCNICO</strong>,
      presentación del {{FASE}}, y revisados los antecedentes que cursan en la Jefatura
      de Carrera, habiendo sido designados Miembros del Tribunal, para evaluar la
      presentación y defensa del {{FASE}} del Trabajo de Grado del/la Estudiante
      <strong>{{POSTULANTE}}</strong>, titulado:
      <strong>{{TITULO}}</strong>, debiendo tomar en cuenta los siguientes aspectos:

      <ul class="lista">
        <li>Pertenencia y relevancia del tema propuesto.</li>
        <li>Coherencia entre los elementos centrales del proyecto.</li>
        <li>Aspectos de forma y presentación del documento.</li>
      </ul>

      Con este motivo, saluda a ustedes atentamente,
    </div>

    <!-- FIRMA -->
    <div class="firma">
      <div class="firma-line"></div>
      <div class="firma-nombre">{{GRADO}} {{JEFE}}</div>
      <div class="firma-cargo">JEFE DE CARRERA</div>
    </div>

  </div>
</body>
</html>
`

export const buildNotaServicioHtml = (p: NotaServicioParams) => {
  let html = buildHtml(p)

  html = html
    .replaceAll("{{POSTULANTE}}", esc(p.postulante).toUpperCase())
    .replaceAll("{{TUTOR}}", esc(p.tutor).toUpperCase())
    .replaceAll("{{REVISOR1}}", esc(p.revisor1).toUpperCase())
    .replaceAll("{{DOCTG}}", esc(p.docenteTG).toUpperCase())
    .replaceAll("{{TITULO}}", esc(p.tituloProyecto).toUpperCase())
    .replaceAll("{{FASE}}", esc(p.fase || "BORRADOR FINAL").toUpperCase())
    .replaceAll("{{GRADO}}", esc(p.gradoJefe || "").toUpperCase())
    .replaceAll("{{JEFE}}", esc(p.jefeCarrera || "S/N").toUpperCase())
    .replaceAll(
      "{{REVISOR2}}",
      p.revisor2
        ? `
        <div class="dest-item">
          <div class="dest-nombre">${esc(p.revisor2).toUpperCase()}</div>
          <div class="dest-cargo">VOCAL REVISOR</div>
        </div>`
        : ""
    )

  return html
}

export const openNotaServicioWindow = (p: NotaServicioParams) => {
  if (typeof window === "undefined") return
  const html = buildNotaServicioHtml(p)
  const w = window.open("", "_blank", "width=850,height=1100")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
}

export type { NotaServicioParams }
