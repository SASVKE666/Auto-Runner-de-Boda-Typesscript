/**
 * Progreso guardado (localStorage): mejor distancia, totales de por vida,
 * récords por partida y logros desbloqueados. Funciona también sin localStorage
 * (modo privado, pruebas en Node): en ese caso vive solo en memoria.
 */
import type { VehicleKind } from './constants';

const KEY = 'novio_en_fuga_save_v1';
const OLD_BEST_KEY = 'novio_en_fuga_best'; // versión anterior: solo guardaba la mejor distancia

export interface Totals {
  games: number;
  caught: number;
  distance: number;
  rings: number;
  hits: number;
  dodged: number;
  gifts: number;
  vehicleMeters: number;
  towersCrushed: number;
  flips: number;
  flaps: number;
  shieldsUsed: number;
  /** Veces que se ha usado cada vehículo */
  kinds: Record<VehicleKind, number>;
}

/** Mejor valor alcanzado en UNA sola partida */
export interface Records {
  distance: number;
  rings: number;
  maxClean: number;
  maxCeil: number;
  dodged: number;
  smashTurbo: number;
  ringsMagnet: number;
  giftsRun: number;
  closeCall: number;
}

export interface SaveData {
  version: 1;
  best: number;
  totals: Totals;
  records: Records;
  /** id de logro -> fecha (ms) en que se desbloqueó */
  unlocked: Record<string, number>;
}

export function blankTotals(): Totals {
  return {
    games: 0, caught: 0, distance: 0, rings: 0, hits: 0, dodged: 0, gifts: 0,
    vehicleMeters: 0, towersCrushed: 0, flips: 0, flaps: 0, shieldsUsed: 0,
    kinds: { swan: 0, limo: 0, cupid: 0 },
  };
}

export function blankRecords(): Records {
  return { distance: 0, rings: 0, maxClean: 0, maxCeil: 0, dodged: 0, smashTurbo: 0, ringsMagnet: 0, giftsRun: 0, closeCall: 0 };
}

export function blankSave(): SaveData {
  return { version: 1, best: 0, totals: blankTotals(), records: blankRecords(), unlocked: {} };
}

const num = (v: unknown) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);

/** Fusiona lo leído con los valores por defecto (tolera datos viejos, incompletos o corruptos) */
function sanitize(raw: unknown): SaveData {
  const out = blankSave();
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Partial<SaveData>;
  out.best = num(r.best);
  for (const k of Object.keys(out.totals) as (keyof Totals)[]) {
    if (k === 'kinds') continue;
    out.totals[k] = num((r.totals as Partial<Totals> | undefined)?.[k]);
  }
  for (const k of Object.keys(out.totals.kinds) as VehicleKind[]) {
    out.totals.kinds[k] = num(r.totals?.kinds?.[k]);
  }
  for (const k of Object.keys(out.records) as (keyof Records)[]) {
    out.records[k] = num((r.records as Partial<Records> | undefined)?.[k]);
  }
  if (r.unlocked && typeof r.unlocked === 'object') {
    for (const [id, when] of Object.entries(r.unlocked)) {
      if (typeof when === 'number' && isFinite(when)) out.unlocked[id] = when;
    }
  }
  return out;
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function load(): SaveData {
  const st = storage();
  let data = blankSave();
  try {
    const txt = st?.getItem(KEY);
    if (txt) data = sanitize(JSON.parse(txt));
    else {
      // migración: antes solo se guardaba la mejor distancia
      const old = Number(st?.getItem(OLD_BEST_KEY) || 0);
      if (old > 0) {
        data.best = old;
        data.records.distance = old;
      }
    }
  } catch {
    /* datos ilegibles: se empieza de cero */
  }
  return data;
}

let data: SaveData = load();
const listeners = new Set<() => void>();

/** Instantánea actual; la referencia cambia solo cuando algo se guarda (útil para useSyncExternalStore) */
export function getSave(): SaveData {
  return data;
}

export function subscribeSave(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function persist() {
  try {
    storage()?.setItem(KEY, JSON.stringify(data));
  } catch {
    /* sin espacio o bloqueado: se mantiene en memoria */
  }
}

/** Modifica una copia del guardado, la persiste y avisa a los suscriptores */
export function updateSave(fn: (d: SaveData) => void) {
  const next: SaveData = JSON.parse(JSON.stringify(data));
  fn(next);
  data = sanitize(next);
  persist();
  listeners.forEach((l) => l());
}

export function resetSave() {
  data = blankSave();
  persist();
  listeners.forEach((l) => l());
}

/** Recarga desde el almacenamiento (por si otra pestaña lo cambió) */
export function reloadSave() {
  data = load();
  listeners.forEach((l) => l());
}
