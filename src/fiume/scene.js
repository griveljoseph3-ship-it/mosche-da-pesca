// Le cinque tappe del fiume: foto vere del repository.
// acqua: [inizio, fine] della zona d'acqua in altezza (0 = alto, 1 = basso), forza dell'effetto corrente.
// flusso: direzione della corrente nella foto (x verso destra, y verso il basso).
// sotto: 1 se la foto è sott'acqua (ondeggiamento e bolle).
export const SCENE = [
  { foto: 'fiumi-ambientazioni/torrente-bosco-oirase', alt: 'Un torrente di montagna che scorre veloce nel bosco, tra sassi coperti di muschio', acqua: [0.4, 1.02], forza: 1, flusso: [0.75, 0.35], sotto: 0 },
  { foto: 'fiumi-ambientazioni/pescatore-soca', alt: 'Un pescatore a mosca lancia nel fiume Soča, con le Alpi sullo sfondo', acqua: [0.84, 1.02], forza: 0.7, flusso: [-1, 0.1], sotto: 0 },
  { foto: 'fiumi-ambientazioni/pescatore-savinja', alt: 'Un pescatore nell’acqua limpida della Savinja, i ciottoli si vedono sul fondo', acqua: [0.2, 1.02], forza: 0.75, flusso: [-0.8, 0.35], sotto: 0 },
  { foto: 'fiumi-ambientazioni/torrente-alpino-nz', alt: 'Un torrente alpino che corre tra grandi sassi e massi coperti di muschio', acqua: [0.42, 1.02], forza: 0.9, flusso: [-0.6, 0.5], sotto: 0 },
  { foto: 'fiumi-ambientazioni/trota-fario-sott-acqua', alt: 'Una grande trota fario ripresa sott’acqua, tra le alghe del fondo', acqua: [-0.02, 1.02], forza: 0.45, flusso: [0.4, -0.1], sotto: 1 },
];
