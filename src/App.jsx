import { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import andreaBg from "./assets/andrea.webp";

// ─── CONFIGURA AQUÍ TU IMAGEN INTERIOR ───────────────────────────────────────
const INNER_IMAGE_URL = andreaBg;
// ─────────────────────────────────────────────────────────────────────────────

const FINISH_PERCENT = 80;

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: linear-gradient(145deg, #fff0f5 0%, #ffd6e7 50%, #fff5f8 100%);
    min-height: 100vh;
  }

  #root { all: unset; display: block; }

  .app {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(16px, 4vw, 48px);
    gap: clamp(20px, 3vw, 32px);
    font-family: Georgia, 'Times New Roman', serif;
  }

  .header { text-align: center; }

  .header h1 {
    font-size: clamp(26px, 6vw, 42px);
    font-weight: bold;
    color: #be185d;
    letter-spacing: -0.5px;
    line-height: 1.1;
    margin-bottom: 8px;
  }

  .header p {
    color: #9d8a8a;
    font-style: italic;
    font-size: clamp(13px, 2.5vw, 16px);
  }

  .card-wrapper {
    position: relative;
    width: min(90vw, 480px);
    aspect-ratio: 3 / 4;
    border-radius: clamp(16px, 3vw, 28px);
    overflow: hidden;
    box-shadow:
      0 24px 80px rgba(190, 24, 93, 0.22),
      0 4px 20px rgba(0, 0, 0, 0.08);
    border: 4px solid white;
    background: #fff; /* Fondo base por si la imagen tarda en cargar */
  }

  .card-inner {
    position: absolute;
    inset: 0;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .card-inner img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }

  /* Contenedor de texto totalmente limpio */
  .card-inner .content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: clamp(20px, 5vw, 40px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(12px, 2vw, 18px); /* Un poco más de espacio entre elementos */
    width: 100%;
    height: 100%;
    justify-content: center; /* Centrado vertical */
  }

  .card-inner .content .emoji { 
    font-size: clamp(32px, 7vw, 52px);
    /* Sombra dura para que el emoji no se pierda */
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
  }

  /* TÍTULO LIMPIO Y LEGIBLE */
  .card-inner .content h2 {
    color: #ffffff; 
    font-size: clamp(22px, 5vw, 30px);
    font-weight: 800; /* Letra más gruesa para que destaque */
    line-height: 1.1;
    margin: 0;
    /* Sombra negra estilo subtítulo: garantiza lectura en fondo claro y oscuro */
    text-shadow: 
      0 2px 4px rgba(0,0,0,0.7),
      0 0 10px rgba(0,0,0,0.3);
  }

  /* PÁRRAFO LIMPIO */
  .card-inner .content p {
    color: #fce7f3; /* Blanco casi puro con un tinte rosa imperceptible */
    font-size: clamp(15px, 3.5vw, 18px);
    line-height: 1.5;
    max-width: 320px;
    font-weight: 600; /* Semi-bold para legibilidad */
    /* Sombra negra sólida detrás de las letras */
    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
  }

  .btn-accept {
    margin-top: 10px;
    display: inline-block;
    background: linear-gradient(135deg, #f43f7a, #be185d);
    color: #fff;
    font-family: Georgia, serif;
    font-weight: bold;
    padding: clamp(12px, 2.5vw, 16px) clamp(24px, 5vw, 36px);
    border-radius: 50px;
    text-decoration: none;
    font-size: clamp(14px, 3vw, 17px);
    /* Sombra más fuerte al botón para separarlo de la foto */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); 
    transition: transform 0.15s, box-shadow 0.15s;
    border: 2px solid rgba(255,255,255,0.2); /* Borde sutil */
    cursor: pointer;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .btn-accept:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  /* --- El resto del CSS (Rasca y UI externa) se mantiene igual --- */

  .scratch-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    cursor: crosshair;
    touch-action: none;
    border-radius: inherit;
  }

  .scratch-hint {
    position: absolute;
    bottom: clamp(18px, 4vw, 32px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    pointer-events: none;
    animation: bounce 1.2s ease-in-out infinite;
  }

  .scratch-hint .hint-icon { font-size: clamp(26px, 6vw, 40px); }
  .scratch-hint .hint-text {
    color: rgba(255,255,255,0.85);
    font-size: clamp(11px, 2.2vw, 14px);
    font-family: Georgia, serif;
    letter-spacing: 1px;
    white-space: nowrap;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }

  .done-banner {
    background: linear-gradient(135deg, #f43f7a, #be185d);
    color: #fff;
    border-radius: 50px;
    padding: clamp(10px, 2vw, 14px) clamp(24px, 5vw, 40px);
    font-size: clamp(13px, 2.8vw, 17px);
    font-weight: bold;
    font-family: Georgia, serif;
    box-shadow: 0 4px 22px rgba(244, 63, 122, 0.42);
    animation: popIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    letter-spacing: 0.4px;
    text-align: center;
  }

  footer {
    color: #f9a8c9;
    font-size: 11px;
    letter-spacing: 1px;
    font-family: Georgia, serif;
  }

  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(-10px); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
`;

function ScratchLayer({ onComplete }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const done = useRef(false);
  const [hidden, setHidden] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    const step = Math.round(H / 13);
    const fontSize = Math.max(10, Math.round(W / 28));
    ctx.font = `bold ${fontSize}px serif`;
    for (let y = step; y < H; y += step) {
      for (let x = 0; x < W; x += 110) {
        ctx.fillText("✦  RASCA  ✦", x, y);
      }
    }

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, W - 28, H - 28);

    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(W / 11)}px Georgia, serif`;
    ctx.fillText("Rasca aquí", W / 2, H / 2 - 8);
    ctx.font = `${Math.round(W / 17)}px Georgia, serif`;
    ctx.fillText("para descubrir ✨", W / 2, H / 2 + Math.round(H / 18));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      if (!done.current) paint();
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [paint]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const scratch = (e) => {
    if (!isDrawing.current || done.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);
    const W = canvas.width;
    const H = canvas.height;

    const radius = Math.round(Math.min(W, H) / 5.5);
    ctx.globalCompositeOperation = "destination-out";
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0,   "rgba(0,0,0,1)");
    grad.addColorStop(0.65,"rgba(0,0,0,0.85)");
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    const data = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0, total = 0;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] === 0) cleared++;
      total++;
    }

    if (cleared / total >= FINISH_PERCENT / 100 && !done.current) {
      done.current = true;
      let alpha = 1;
      const fade = setInterval(() => {
        alpha -= 0.02;
        ctx.clearRect(0, 0, W, H);
        if (alpha <= 0) {
          clearInterval(fade);
          setHidden(true);
          onComplete();
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(26,26,26,${alpha})`;
          ctx.fillRect(0, 0, W, H);
        }
      }, 16);
    }
  };

  if (hidden) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        onMouseDown={() => (isDrawing.current = true)}
        onMouseUp={  () => (isDrawing.current = false)}
        onMouseLeave={() => (isDrawing.current = false)}
        onMouseMove={scratch}
        onTouchStart={(e) => { isDrawing.current = true; scratch(e); }}
        onTouchEnd={  () => (isDrawing.current = false)}
        onTouchMove={scratch}
      />
      <div className="scratch-hint">
        <span className="hint-icon">👆</span>
        <span className="hint-text">¡Rasca aquí!</span>
      </div>
    </>
  );
}

export default function App() {
  const [isDone, setIsDone] = useState(false);

  const handleComplete = () => {
    setIsDone(true);
    confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 },
      colors: ["#ff69b4", "#ff1493", "#fff", "#ffb6c1"] });
    setTimeout(() =>
      confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0 },
        colors: ["#ff69b4", "#fff"] }), 400);
    setTimeout(() =>
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 },
        colors: ["#ff1493", "#fff"] }), 650);
  };

  const hasImage = Boolean(INNER_IMAGE_URL);

  return (
    <>
      <style>{styles}</style>

      <div className="app">
        <div className="header">
          <h1>{isDone ? "¡Sorpresa! 🍦" : "Hola Andrea..."}</h1>
          <p>{isDone ? "Espero que te guste el plan" : "Rasca la tarjeta para ver el mensaje"}</p>
        </div>

        <div className="card-wrapper">
          <div className="card-inner">
            {hasImage && <img src={INNER_IMAGE_URL} alt="sorpresa" />}

            <div className="content">
              <span className="emoji">✨</span>
              <h2>¿Sobrevivimos a San Valentín?</h2>
              <p>
                Me encantaria invitarte a ir a por sushi o por un cafe(cuando no estes coja)
                para celebrar que ya pasó el día más cursi del año.
              </p>
              <a
                className="btn-accept"
                href="https://wa.me/603629822?text=¡Oye! He rascado la tarjeta y acepto ese helado 🍦"
                target="_blank"
                rel="noreferrer"
              >
                Aceptar invitación 🍦
              </a>
            </div>
          </div>

          {!isDone && <ScratchLayer onComplete={handleComplete} />}
        </div>

        {isDone && (
          <div className="done-banner">
            🎉 ¡Lo lograste! Ya puedes leer el mensaje
          </div>
        )}

        <footer>Con un poco de código y mucha antencion al detalle</footer>
      </div>
    </>
  );
}