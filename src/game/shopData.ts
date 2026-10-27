/**
 * Catálogo de la tienda: vehículos y atuendo del novio. Todo se paga con los anillos
 * que se guardan al terminar cada partida (la "cartera").
 * Los artículos con precio 0 son los de serie: siempre están disponibles.
 */
import type { VehicleKind } from './constants';

export type Slot = 'hat' | 'suit' | 'tie' | 'face' | 'pack';
export const SLOTS: { slot: Slot; label: string; icon: string }[] = [
  { slot: 'hat', label: 'Sombrero', icon: '🎩' },
  { slot: 'suit', label: 'Traje', icon: '🤵' },
  { slot: 'tie', label: 'Corbata', icon: '🎀' },
  { slot: 'face', label: 'Rostro', icon: '🕶️' },
  { slot: 'pack', label: 'Jetpack', icon: '🍾' },
];

/** Qué tiene puesto el novio en cada ranura (id del artículo sin el prefijo de la ranura) */
export type Outfit = Record<Slot, string>;
export const DEFAULT_OUTFIT: Outfit = { hat: 'none', suit: 'classic', tie: 'bow', face: 'none', pack: 'green' };

export interface ShopItem {
  /** id único; los de atuendo son `ranura:nombre`, los vehículos `veh:tipo` */
  id: string;
  name: string;
  desc: string;
  price: number;
  slot?: Slot;
  /** id corto dentro de la ranura */
  key?: string;
  vehicle?: VehicleKind;
}

const o = (slot: Slot, key: string, name: string, price: number, desc: string): ShopItem => ({
  id: `${slot}:${key}`,
  slot,
  key,
  name,
  price,
  desc,
});

export const OUTFIT_ITEMS: ShopItem[] = [
  o('hat', 'none', 'Sin sombrero', 0, 'Pelo al viento.'),
  o('hat', 'cap', 'Gorra de recién casado', 150, 'Para huir con estilo deportivo.'),
  o('hat', 'flowers', 'Corona de flores', 200, 'Por si la novia se ablanda.'),
  o('hat', 'tophat', 'Sombrero de copa', 250, 'Elegancia de boda de gala.'),
  o('hat', 'charro', 'Sombrero charro', 400, '¡Ay, ay, ay! Que suene el mariachi.'),
  o('hat', 'crown', 'Corona de rey', 1200, 'El rey de la fuga.'),

  o('suit', 'classic', 'Frac clásico', 0, 'El traje de siempre.'),
  o('suit', 'navy', 'Azul marino', 200, 'Sobrio y elegante.'),
  o('suit', 'white', 'Blanco playero', 300, 'Boda en la playa (de emergencia).'),
  o('suit', 'wine', 'Burdeos', 300, 'Color vino de la casa.'),
  o('suit', 'pink', 'Rosa chicle', 350, 'Valiente y muy visible.'),
  o('suit', 'gold', 'Dorado de gala', 1000, 'Brilla más que los anillos.'),

  o('tie', 'bow', 'Moño rosa', 0, 'El de serie.'),
  o('tie', 'bowblue', 'Moño azul', 100, 'Algo azul, como manda la tradición.'),
  o('tie', 'tie', 'Corbata roja', 150, 'Larga y ondeando al viento.'),
  o('tie', 'bowgold', 'Moño dorado', 250, 'Con un toque de lujo.'),

  o('face', 'none', 'Sin accesorio', 0, 'A cara descubierta.'),
  o('face', 'mustache', 'Bigote', 200, 'Nadie reconocerá al novio.'),
  o('face', 'shades', 'Gafas de sol', 300, 'Huir con actitud.'),
  o('face', 'monocle', 'Monóculo', 350, 'Muy fino, muy sospechoso.'),

  o('pack', 'green', 'Champaña brut', 0, 'Las botellas de siempre.'),
  o('pack', 'rose', 'Champaña rosé', 200, 'Burbujas rosadas.'),
  o('pack', 'ice', 'Champaña helada', 300, 'Botellas azul hielo.'),
  o('pack', 'gold', 'Champaña de oro', 600, 'Reserva especial.'),
];

export const VEHICLE_ITEMS: ShopItem[] = [
  { id: 'veh:swan', vehicle: 'swan', name: 'Cisne Inflable', price: 400, desc: '' },
  { id: 'veh:limo', vehicle: 'limo', name: 'Limusina Recién Casados', price: 900, desc: '' },
  { id: 'veh:cupid', vehicle: 'cupid', name: 'Carroza de Cupido', price: 1500, desc: '' },
];

export const SHOP_ITEMS: ShopItem[] = [...VEHICLE_ITEMS, ...OUTFIT_ITEMS];
export const ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));

export const itemsOfSlot = (slot: Slot) => OUTFIT_ITEMS.filter((i) => i.slot === slot);
export const vehicleItem = (k: VehicleKind) => ITEM_BY_ID[`veh:${k}`];

/** ¿Es válido este valor para esa ranura? (para sanear datos guardados) */
export const validKey = (slot: Slot, key: unknown): key is string =>
  typeof key === 'string' && OUTFIT_ITEMS.some((i) => i.slot === slot && i.key === key);

/** Colores de cada traje */
export const SUIT_COLORS: Record<string, { main: string; sash: string }> = {
  classic: { main: '#2b2233', sash: '#e63e6d' },
  navy: { main: '#24407a', sash: '#f6c453' },
  white: { main: '#f4efe4', sash: '#7fb6e8' },
  wine: { main: '#6d1f3b', sash: '#f6c453' },
  pink: { main: '#f08bb5', sash: '#ffffff' },
  gold: { main: '#d9a62b', sash: '#7a1f3d' },
};

/** Colores de las botellas del jetpack: cuerpo y papel/boquilla */
export const PACK_COLORS: Record<string, { body: string; foil: string }> = {
  green: { body: '#2f6b4f', foil: '#f6c453' },
  rose: { body: '#d85a8a', foil: '#ffe3ee' },
  ice: { body: '#4aa3d8', foil: '#e9f7ff' },
  gold: { body: '#d9a62b', foil: '#fff3b8' },
};
