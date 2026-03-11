# Preguntador

Aplicacion de quiz en vivo tipo Kahoot, sin backend propio, construida con React + Vite y conexion entre host y jugadores mediante PeerJS/WebRTC.

## Que hace

- Crear y editar quizzes en el navegador.
- Guardar quizzes en `localStorage`.
- Importar y exportar quizzes en JSON.
- Crear una sala y compartirla con codigo o QR.
- Jugar en tiempo real desde moviles u otros navegadores.
- Interfaz en espanol, galego e ingles.

## Stack

- React 19
- Vite 7
- PeerJS
- QRCode React

## Requisitos

- Node.js 20 o superior recomendado
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

La app arranca con Vite y expone el servidor en red local para facilitar que otros dispositivos se unan a la partida.

## Produccion

```bash
npm run build
```

La build se genera en `dist/`.

Este proyecto esta configurado para publicarse bajo la ruta:

```text
/preguntador/
```

Eso ya esta fijado en `vite.config.js`.

## Despliegue

Sirve el contenido de `dist/` desde la ruta `/preguntador/` de tu servidor web.

Ejemplos de URL validas:

- `https://tu-dominio.com/preguntador/`
- `https://tu-dominio.com/preguntador/?code=ABC123`

Importante:

- Si publicas en otra subruta, cambia `base` en `vite.config.js`.
- El QR y los enlaces de invitacion usan esa base para construir la URL de entrada.

## Como se usa

### Host

1. Crea o edita un quiz.
2. Inicia una sala.
3. Comparte el codigo o el QR.
4. Cuando entren jugadores, inicia la partida.

### Jugadores

1. Abren la URL de la app o escanean el QR.
2. Introducen codigo y nombre.
3. Esperan confirmacion del host.
4. Responden desde su dispositivo.

## Estructura

```text
src/
  game/        Logica del quiz y validacion
  network/     Conexion host/jugador con PeerJS
  screens/     Pantallas de la SPA
  styles/      Estilos globales
```

## Notas

- Los quizzes se almacenan en `localStorage`, no en una base de datos.
- La conexion depende de WebRTC/PeerJS y de que los dispositivos puedan alcanzar el host publicado.
- La app valida y normaliza quizzes importados para evitar JSONs rotos.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Repositorio

https://github.com/gafapa/preguntador
