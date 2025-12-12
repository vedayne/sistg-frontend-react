type ActaParams = {
  cite: string
  ciudad?: string
  hora?: string
  fechaLarga: string
  postulante: string
  tituloProyecto: string
  revisor1: string
  revisor2: string
  tutor: string
  docenteTG: string
  jefeCarrera?: string
  gradoJefe?: string
  fase?: string
}

const styles = `
@page {
  size: letter;
  margin: 3.5cm 2.5cm 3cm 3cm;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  font-family: "Times New Roman", serif;
  font-size: 14px;
  color: #000;
  background: #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.page {
  width: 21.59cm; /* carta */
  min-height: 27.94cm;
  background: white;
  padding: 24px 32px;
  border: 1px solid #d1d5db;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.hr-top {
  border: none;
  border-top: 2px solid #1e40af;
  margin: 0 0 10px 0;
}

.cite {
  text-align: right;
  font-weight: bold;
  font-size: 16px;
  margin: 0 0 6px 0;
}

.title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  margin: 6px 0 22px;
  text-transform: uppercase;
}

.body {
  text-align: justify;
  line-height: 1.55;
  font-size: 16px;
}

.p { margin: 0 0 14px 0; }

.resuelve {
  font-weight: bold;
  font-size: 18px;
  margin: 18px 0 8px;
}

.art {
  margin: 0 0 14px 0;
}

.bold {
  font-weight: bold;
  text-transform: uppercase;
}

.signatures {
  margin-top: 80px;
}

.sign-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px 90px;
  align-items: start;
}

.sign-item { text-align: center; }
.sign-name { text-transform: uppercase; font-size: 16px; margin-bottom: 4px; }
.sign-role { font-weight: bold; text-transform: uppercase; font-size: 18px; }

.sign-bottom { margin-top: 70px; text-align: center; }

@media print {
  body { background: white; padding: 0; }
  .page { box-shadow: none; border: none; }
}
`

const esc = (v: string) =>
  (v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

const buildHtml = (p: ActaParams) => {
  const fase = (p.fase || "BORRADOR FINAL").toUpperCase()
  const ciudad = (p.ciudad || "LA PAZ").toUpperCase()
  const hora = p.hora || "12:00"

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Acta de Aprobación</title>
  <style>${styles}</style>
</head>
<body>
  <div class="page">
    <hr class="hr-top" />
    <div class="cite">${esc(p.cite)}</div>

    <div class="title">
      ACTA DE APROBACIÓN DE ${fase} TRABAJO DE<br/>
      GRADO
    </div>

    <div class="body">
      <p class="p">
        En la ciudad de <span class="bold">${esc(ciudad)}</span> horas ${esc(hora)} del
        ${esc(p.fechaLarga)} en la Escuela Militar de Ingeniería Mcal. Antonio José de Sucre,
        se hizo presente el/la estudiante <span class="bold">{{POSTULANTE}}</span>, a objeto de
        exponer y sustentar su <span class="bold">${esc(fase)}</span> del Trabajo de Grado en la
        especialidad de Ingeniería de Sistemas bajo el título de :
        <span class="bold">{{TITULO}}</span>.
      </p>

      <p class="p">
        Concluida la sustentación, efectuada la evaluación por los señores miembros del Tribunal
        y en uso de sus específicas atribuciones conferidas en el Cap. VII Artículo 67 del Reglamento
        RAC - 02 <span class="bold">GRADUACIÓN DE GRADO</span>.
      </p>

      <div class="resuelve">RESUELVE:</div>

      <p class="art">
        Art. 1 Aprobar el <span class="bold">${esc(fase)}</span> de Trabajo de Grado bajo el Título:
        <span class="bold">{{TITULO}}</span>.
      </p>

      <p class="p">Para tal efecto firmamos al pie del presente documento.</p>
    </div>

    <div class="signatures">
      <div class="sign-grid">
        <div class="sign-item">
          <div class="sign-name">{{REVISOR1}}</div>
          <div class="sign-role">VOCAL REVISOR DE LA CARRERA</div>
        </div>

        <div class="sign-item">
          <div class="sign-name">{{REVISOR2}}</div>
          <div class="sign-role">VOCAL REVISOR DE LA CARRERA</div>
        </div>

        <div class="sign-item">
          <div class="sign-name">{{TUTOR}}</div>
          <div class="sign-role">TUTOR</div>
        </div>

        <div class="sign-item">
          <div class="sign-name">{{DOCTG}}</div>
          <div class="sign-role">DOCENTE DE TRABAJO DE GRADO</div>
        </div>
      </div>

      <div class="sign-bottom">
        <div class="sign-name">{{GRADO}} {{JEFE}}</div>
        <div class="sign-role">JEFE DE CARRERA</div>
      </div>
    </div>

  </div>
</body>
</html>`
}

export const renderActa = (p: ActaParams) => {
  const html = buildHtml(p)
    .replaceAll("{{POSTULANTE}}", esc(p.postulante).toUpperCase())
    .replaceAll("{{TITULO}}", esc(p.tituloProyecto).toUpperCase())
    .replaceAll("{{REVISOR1}}", esc(p.revisor1).toUpperCase())
    .replaceAll("{{REVISOR2}}", esc(p.revisor2).toUpperCase())
    .replaceAll("{{TUTOR}}", esc(p.tutor).toUpperCase())
    .replaceAll("{{DOCTG}}", esc(p.docenteTG).toUpperCase())
    .replaceAll("{{GRADO}}", esc(p.gradoJefe || "").toUpperCase())
    .replaceAll("{{JEFE}}", esc(p.jefeCarrera || "S/N").toUpperCase())

  const w = window.open("", "_blank", "width=850,height=1100")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
}

export type { ActaParams }
