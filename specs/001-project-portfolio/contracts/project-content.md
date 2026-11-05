# Contrato: archivo de un proyecto

Es la interfaz con la que el dueño agrega proyectos. Reglas completas en
[data-model.md](../data-model.md).

## Ubicación

Rutas relativas a `Portfolio/web/`.

```text
src/content/projects/<id>/index.md     # datos + descripción
src/content/projects/<id>/*.png|jpg    # portada y galería
public/videos/<id>/*.mp4               # clips propios (opcional, máx. 10 MB c/u)
```

`<id>` en minúsculas y con guiones (ej. `trading-panel`); es la URL del detalle.

## Ejemplo: proyecto personal

```markdown
---
kind: personal
title: Panel de Trading
summary: Centro de mando para bots de trading en paper: backtests, estrategias y datos.
stack: [React, FastAPI, Freqtrade, Docker]
cover: { src: ./cover.png, alt: Vista general del panel con los bots activos }
images:
  - { src: ./backtest.png, alt: Resultado de un backtest con su curva de capital }
videos:
  - { source: file, title: Recorrido por el panel, path: /videos/trading-panel/tour.mp4 }
links:
  - { type: repo, url: https://github.com/TODO-github-user/trading-panel }
order: 1
---

Descripción completa en Markdown: problema, qué hace, decisiones técnicas.
```

## Ejemplo: proyecto profesional

```markdown
---
kind: professional
company: Rendering
period: 2024 – actualidad
title: Agente de IA para WhatsApp
summary: Agente conversacional que automatiza la atención y el seguimiento de servicios.
stack: [Kapso, AWS Lambda, AWS SQS, Python]
cover: { src: ./diagram.png, alt: Diagrama de arquitectura del agente }
videos:
  - { source: youtube, title: Demo de una conversación, videoId: XXXXXXXXXXX }
order: 10
---

Descripción del proyecto, avances y resultados. Sin código ni datos de clientes.
```

## Errores esperados al compilar

| Situación | Resultado |
|---|---|
| Falta un campo obligatorio | Build falla nombrando el archivo y el campo |
| Imagen o video referenciado no existe | Build falla nombrando la ruta |
| `personal` sin enlace `repo` | Build falla |
| `professional` con enlace `repo` | Build falla |
| URL con `TODO-` en build de producción | Build falla |
