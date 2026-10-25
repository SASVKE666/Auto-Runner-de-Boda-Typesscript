/**
 * Constantes globales de "Novio en Fuga".
 * Resolución lógica fija 960x540 (16:9); el canvas se escala por CSS.
 */

export const W = 960;
export const H = 540;

/** Borde inferior del techo y borde superior del piso (zona jugable entre ambos) */
export const CEIL_Y = 64;
export const FLOOR_Y = 470;

/** Posición horizontal fija del novio en pantalla */
export const GROOM_X = 250;
/** Rango del centro del novio (la cabeza roza el techo / los pies pisan el suelo) */
export const GROOM_MIN_Y = CEIL_Y + 46;
export const GROOM_MAX_Y = FLOOR_Y - 36;

/** Distancia máxima entre la novia y el novio (px). 0 = te atrapó */
export const MAX_GAP = 230;
export const START_GAP = 190;
export const HIT_PENALTY = 90;

export const PX_PER_M = 30;
export const ZONE_LENGTH_M = 700;

export const COLORS = {
  ink: '#2a1420',
  cream: '#fff4e0',
  white: '#ffffff',
  blush: '#f9c5d3',
  rose: '#e63e6d',
  roseDark: '#b92453',
  burgundy: '#7a1f3d',
  wine: '#4a1230',
  gold: '#f6c453',
  goldDark: '#c8932a',
  skin: '#f3c9a1',
  skinShade: '#e0a97d',
  hair: '#5a3220',
  tux: '#2b2233',
  tuxLight: '#46394f',
  green: '#3f8f5a',
  greenDark: '#2c6b43',
  bottle: '#2f6b4f',
  sky: '#bfe8ff',
} as const;

export const ZONES = [
  { name: 'Salón de Fiestas' },
  { name: 'Jardín de Rosas' },
  { name: 'La Catedral' },
] as const;

export type PickupType = 'shield' | 'magnet' | 'turbo';

export const POWERUP = {
  magnetDuration: 8,
  magnetRadius: 250,
  turboDuration: 5,
  turboSpeedBonus: 260,
} as const;

export const BRIDE_LINES = [
  '¡VEN AQUÍ, MI AMOR!',
  '¡YA PAGUÉ EL BANQUETE!',
  '¡NO TE ESCAPAS DE MÍ!',
  '¡300 INVITADOS TE ESPERAN!',
  '¡EL PASTEL NO TIENE REEMBOLSO!',
  '¡YA ESTÁN LAS FLORES!',
  '¡MI MAMÁ YA LLEGÓ!',
  '¡TE DIJE QUE SÍ... Y TÚ TAMBIÉN!',
];

export const MILESTONE_LINES = [
  '¡La novia ya se quitó los tacones!',
  '¡Corre, que el cura ya está listo!',
  '¡El DJ ya puso la marcha nupcial!',
  '¡Tu suegra tomó el micrófono!',
  '¡Ni el pastel te va a salvar!',
];
