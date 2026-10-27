import it from './it.js';

// Lingua unica per ora. Per l'inglese: import en from './en.js' e scegli in base a un parametro o alla preferenza salvata.
export const lingua = 'it';
export const testi = it;

export const euro = (n) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
