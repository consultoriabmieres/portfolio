# Contrato: direcciones públicas

| Dirección | Contenido | Requisitos |
|---|---|---|
| `/` | Presentación + listado de proyectos publicados, ordenados por `order` | FR-001, FR-002, FR-008, FR-016 |
| `/projects/<id>/` | Detalle del proyecto | FR-003, FR-005, FR-006, FR-019 |
| `/404` (y cualquier dirección inexistente) | Página "no encontrado" con enlace a `/` | FR-012 |

- Las direcciones de detalle son estables: dependen solo del nombre de la carpeta del proyecto.
- Los proyectos en borrador no generan dirección.
- Todos los enlaces externos llevan `target="_blank" rel="noopener noreferrer"`.
