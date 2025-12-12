type CartaParams = {
  fecha: string
  estudiante: string
  tituloProyecto: string
  jefe?: string
}

const styles = `
@page { size: letter; margin: 3.5cm 2.5cm 3cm 3cm; }
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: "Times New Roman", serif; font-size: 14px; background: #e5e7eb; display: flex; justify-content: center; align-items: flex-start; }
.page { width: 21.59cm; min-height: 27.94cm; background: white; padding: 24px 32px; border: 1px solid #d1d5db; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
.body { text-align: justify; line-height: 1.6; }
.p { margin: 0 0 14px 0; }
.firma { margin-top: 56px; text-align: center; font-weight: bold; }
@media print { body { background: white; } .page { box-shadow: none; border: none; } }
`

const esc = (v: string) =>
  (v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

const buildHtml = (p: CartaParams) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Carta de Invitación</title>
  <style>${styles}</style>
</head>
<body>
  <div class="page">
    <div class="p" style="text-align:right;">${esc(p.fecha)}</div>
    <div class="p"><strong>Ref.: Invitación a Tutoría</strong></div>
    <div class="body">
      <p class="p">Señor</p>
      <p class="p">My. DIM Jose Perez Perez</p>
      <p class="p">JEFE DE CARRERA DE INGENIERÍA AMBIENTAL</p>
      <p class="p">Presente.</p>

      <p class="p">
        En mi condición de estudiante del <strong>${esc(p.estudiante)}</strong> Semestre de la Carrera de Ingeniería de Sistemas
        de la Escuela Militar de Ingeniería, y habiendo hecho una valoración de sus antecedentes profesionales, y su capacidad profesional en el área de ingeniería, me permito invitar a usted para que me colabore en calidad de TUTOR en el desarrollo de mi Trabajo de Grado Titulado <strong>${esc(p.tituloProyecto)}</strong>, cuyo perfil tengo a bien acompañar a la presente para su revisión y análisis.
      </p>

      <p class="p">
        Asimismo, me comprometo ante usted cumplir y subsanar las sugerencias y/u observaciones que se presenten durante la elaboración del trabajo.
        Sin otro particular, reitero a usted la seguridad de mi mayor consideración.
      </p>
    </div>
    <div class="firma">
      ${esc(p.estudiante).toUpperCase()}<br/>
      ESTUDIANTE
    </div>
  </div>
</body>
</html>`

export const renderCartaInvitacion = (p: CartaParams) => {
  const html = buildHtml(p)
  const w = window.open("", "_blank", "width=850,height=1100")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
}

export type { CartaParams }
