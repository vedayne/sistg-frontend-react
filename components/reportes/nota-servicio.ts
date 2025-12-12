const notaServicioStyles = `
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", serif; margin: 0; padding: 0; background: #f5f5f5; }
  .page { width: 820px; margin: 24px auto; background: white; padding: 40px 48px; border: 1px solid #d1d5db; }
  .top-bar { display: flex; justify-content: space-between; align-items: flex-start; }
  .cite { font-weight: bold; font-size: 14px; }
  .fecha { font-size: 14px; }
  .title { margin-top: 32px; font-weight: bold; font-size: 18px; text-align: center; text-decoration: underline; }
  .dest { margin-top: 24px; line-height: 1.6; display: flex; justify-content: space-between; gap: 16px; }
  .dest-left { font-weight: bold; text-transform: uppercase; }
  .dest-right { text-align: right; }
  .body { margin-top: 12px; line-height: 1.5; text-align: justify; font-size: 14px; }
  .lista { margin: 12px 0 12px 24px; }
  .firma { margin-top: 32px; text-align: center; font-weight: bold; }
  .firma-line { margin-top: 32px; text-align: center; }
  .firma-line span { border-top: 1px solid #000; padding-top: 4px; display: inline-block; min-width: 260px; }
`

type NotaServicioParams = {
  fecha: string
  cite: string
  tituloProyecto: string
  postulante: string
  tutor: string
  revisor1: string
  docenteTG: string
  revisor2?: string
  fase?: string
  jefeCarrera?: string
  gradoJefe?: string
}

export const buildNotaServicioHtml = ({ fecha, cite }: NotaServicioParams) => {
  return `
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Nota de Servicio</title>
      <style>${notaServicioStyles}</style>
    </head>
    <body>
      <div class="page">
        <div class="top-bar">
          <div class="cite">CITE: ${cite || "S/N"}</div>
          <div class="fecha">${fecha}</div>
        </div>
        <div class="title">NOTA DE SERVICIO</div>
        <div class="dest">
          <div class="dest-left">
            <strong>SEÑORES:</strong>
          </div>
          <div class="dest-right">
            {{POSTULANTE}} — <strong>POSTULANTE</strong><br/>
            {{TUTOR}} — <strong>TUTOR</strong><br/>
            {{REVISOR1}} — <strong>VOCAL REVISOR</strong><br/>
            {{DOCTG}} — <strong>DOCENTE DE TRABAJO DE GRADO</strong><br/>
            {{REVISOR2}}
            {{JEFE_DEST}}
          </div>
        </div>
        <div class="body">
          &nbsp;&nbsp;En cumplimiento al Reglamento RAC-02 Graduación de Grado en su capítulo VII DESARROLLO DEL TRABAJO DE GRADO Y TRABAJO DE GRADO TÉCNICO Presentación del {{FASE}} y revisados los antecedentes que cursan en la Jefatura de Carrera habiendo sido designados Miembros del Tribunal, para evaluar la presentación y defensa del {{FASE}} del Trabajo de Grado del/la Estudiante {{POSTULANTE}} titulado: {{TITULO}}, para su correspondiente exposición, debiendo tomar en cuenta los siguientes aspectos:
          <ul class="lista">
            <li>- Pertenencia y relevancia del tema propuesto con el nivel académico al que se postula.</li>
            <li>- Coherencia entre los elementos centrales del Proyecto y los resultados alcanzados.</li>
            <li>- Aspectos de forma y presentación de documento.</li>
          </ul>
          Señalar a los señores Miembros del Tribunal que deberán elevar los informes y ser entregados a la Jefatura de Carrera, los mismos deberán ser firmados con bolígrafo azul y llevar pie de firma.
          <br/><br/>
          El estudiante deberá emplear de manera óptima el tiempo con que cuenta para su exposición, sustentación, preguntas y deliberaciones (que son de 30 minutos de exposición 15 de preguntas y respuestas, haciendo un total de 45 minutos).
          <br/><br/>
          La defensa del BORRADOR FINAL, está programada para el próximo día 18 de Octubre de 2024 a horas 12:00 de manera presencial, debiendo el postulante coordinar con su tribunal para la exposición.
          <br/><br/>
          Con este motivo, saluda a ustedes atentamente,
        </div>
        <div class="firma-line"><span></span></div>
        <div class="firma">{{GRADO_JEFE}} {{JEFE}}</div>
        <div class="firma">JEFE DE CARRERA</div>
      </div>
    </body>
  </html>
  `
}

export const openNotaServicioWindow = (params: NotaServicioParams) => {
  if (typeof window === "undefined") return
  const fase = params.fase || "BORRADOR FINAL"
  const jefeLine = params.jefeCarrera ? `<br/>${params.jefeCarrera.toUpperCase()} — JEFE DE CARRERA` : ""
  const html = buildNotaServicioHtml(params)
    .replace(/{{POSTULANTE}}/g, (params.postulante || "Estudiante").toUpperCase())
    .replace(/{{TUTOR}}/g, (params.tutor || "Tutor").toUpperCase())
    .replace(/{{REVISOR1}}/g, (params.revisor1 || "Vocal Revisor 1").toUpperCase())
    .replace(/{{DOCTG}}/g, (params.docenteTG || "Docente TG").toUpperCase())
    .replace(/{{REVISOR2}}/g, params.revisor2 ? `${params.revisor2.toUpperCase()} — VOCAL REVISOR` : "")
    .replace(/{{FASE}}/g, fase.toUpperCase())
    .replace(/{{TITULO}}/g, (params.tituloProyecto || "Título del Proyecto").toUpperCase())
    .replace(/{{JEFE}}/g, (params.jefeCarrera || "S/N").toUpperCase())
    .replace(/{{GRADO_JEFE}}/g, (params.gradoJefe || "").toUpperCase())
    .replace(/{{JEFE_DEST}}/g, jefeLine)
  const w = window.open("", "_blank", "width=900,height=1100")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
}
