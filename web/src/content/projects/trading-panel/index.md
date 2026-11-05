---
kind: personal
title: Panel de Trading
summary: Centro de mando para trading algorítmico con Freqtrade, con varios bots en paper trading, backtesting y gestión de estrategias y datos desde el navegador.
stack: [React, Vite, FastAPI, Freqtrade, Docker, nginx]
cover: { src: ./cover.svg, alt: Portada provisoria del Panel de Trading }
links:
  - { type: repo, url: https://github.com/consultoriabmieres/trading-panel }
order: 1
featured: true
---

Interfaz propia para operar Freqtrade sin tocar la línea de comandos. Desde el navegador se
lanzan varios bots en paper trading a la vez, se corren backtests, se administran las estrategias
y se descargan los datos de mercado.

El backend en FastAPI habla con la API de Freqtrade y crea o destruye cada bot como un contenedor
Docker independiente. El frontend en React + Vite se sirve con nginx, y todo se levanta con
`docker compose`.
