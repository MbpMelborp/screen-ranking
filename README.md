# Dashboard StartCo 2026 - Pantalla Gigante

Este proyecto es una visualización en tiempo real para una pantalla gigante, implementada con tecnologías web estándar sin empaquetadores (No Build).

## Estructura del Proyecto

- `index.html`: Estructura principal y maquetación con Tailwind CSS v4 (CDN).
- `app.js`: Lógica de negocio (Gráficas, Rotación de Ranking, Contador).
- `mock-data.json`: Simulación de la respuesta del API.

## Tecnologías Usadas

- **HTML5 & CSS3**: Uso de unidades relativas al viewport (`vw`, `vh`) para escalar en pantallas de cualquier tamaño.
- **Tailwind CSS v4 (Alpha/Beta)**: Estilos utilitarios modernos vía CDN.
- **ApexCharts**: Librería de visualización de datos para la gráfica de inversión.
- **Vanilla JS**: Lógica limpia sin dependencias complejas.

## Cómo Ejecutar

Debido a que el proyecto carga datos desde un archivo JSON local (`fetch`), necesitas servirlo a través de un servidor HTTP local para evitar errores de CORS.

### Opción 1: Python (Recomendada)
Si tienes Python instalado:

```bash
python3 -m http.server 8000
```
Luego abre `http://localhost:8000` en tu navegador.

### Opción 2: VS Code Live Server
Si usas VS Code, instala la extensión "Live Server" y haz clic en "Go Live" en la barra inferior.

## Personalización

- **Intervalo de Rotación**: Modifica `rotationInterval` en `app.js` (por defecto 20 segundos).
- **Datos**: Edita `mock-data.json` o apunta la función `fetchData` a tu endpoint real.
