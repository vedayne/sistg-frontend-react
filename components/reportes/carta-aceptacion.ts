type CartaAceptacionParams = {
  fecha: string
}

const styles = `
@page { size: letter; margin: 3.2cm 2.5cm 3cm 2.5cm; }
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: "Times New Roman", serif; font-size: 14px; background: #e5e7eb; display: flex; justify-content: center; align-items: flex-start; }
.page { width: 21.59cm; min-height: 27.94cm; background: white; padding: 24px 32px; border: 1px solid #d1d5db; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
.title { text-align: center; font-weight: bold; font-size: 18px; margin: 16px 0 20px; text-transform: uppercase; }
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

const buildHtml = (p: CartaAceptacionParams) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Carta de Aceptación</title>
  <style>${styles}</style>
</head>
<body>
  <div class="page">
    <div class="p" style="text-align:right;">${esc(p.fecha)}</div>
    <div class="title">Carta de Aceptación de Tutoría</div>
    <div class="body">
      <p class="p">Yo, __________________________ acepto la designación como tutor(a) del Trabajo de Grado del estudiante __________________________.</p>
      <p class="p">Título tentativo del proyecto: ________________________________________________.</p>
      <p class="p">Me comprometo a realizar el seguimiento y orientación correspondiente conforme a la normativa vigente.</p>
    </div>
    <div class="firma">
      Tutor(a)<br/>
      __________________________
    </div>
  </div>
</body>
</html>`

export const renderCartaAceptacion = (p: CartaAceptacionParams) => {
  const html = buildHtml(p)
  const w = window.open("", "_blank", "width=850,height=1100")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
}

export type { CartaAceptacionParams }
