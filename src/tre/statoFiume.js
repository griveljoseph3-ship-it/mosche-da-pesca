// Stato condiviso tra la pagina (scroll) e la scena 3D, senza passare da React a ogni frame.
export const statoFiume = {
  p: 0, // avanzamento nel fiume 0..1 (hero -> streamer)
  pLiscio: 0,
  uscita: 0, // 0 = scena visibile, 1 = scena coperta dalle sezioni successive
  visibile: true,
  mouseX: 0,
  mouseY: 0,
  pronta: false,
};

// Tappe del viaggio: avanzamento in cui ogni livello è centrato.
export const TAPPE = [0, 0.25, 0.5, 0.74, 1];
