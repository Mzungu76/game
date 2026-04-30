export type EffectType = 'direct' | 'bounce' | 'area' | 'disturb' | 'trap' | 'heavy' | 'chaos';

export type ThrowableObject = {
  id: string;
  name: string;
  damage: number;
  knockback: number;
  speed: number;
  effect: EffectType;
  radius?: number;
  bounces?: number;
};

export const OBJECTS: ThrowableObject[] = [
  { id: 'mattone', name: 'Mattone Bucato', damage: 22, knockback: 140, speed: 320, effect: 'heavy' },
  { id: 'scarpa', name: 'Scarpa Spaiata', damage: 16, knockback: 180, speed: 430, effect: 'direct' },
  { id: 'forchetta', name: 'Forchetta Gigante', damage: 14, knockback: 90, speed: 470, effect: 'direct' },
  { id: 'pentola', name: 'Coperchio Pentola', damage: 12, knockback: 100, speed: 350, effect: 'bounce', bounces: 2 },
  { id: 'telecomando', name: 'Telecomando Rotto', damage: 10, knockback: 70, speed: 520, effect: 'disturb' },
  { id: 'molla', name: 'Molla Compressa', damage: 8, knockback: 120, speed: 560, effect: 'bounce', bounces: 3 },
  { id: 'saponetta', name: 'Saponetta Viscida', damage: 11, knockback: 110, speed: 460, effect: 'trap' },
  { id: 'barattolo', name: 'Barattolo Acido', damage: 18, knockback: 90, speed: 300, effect: 'area', radius: 80 },
  { id: 'ventosa', name: 'Ventosa Ribelle', damage: 9, knockback: 60, speed: 400, effect: 'disturb' },
  { id: 'lampada', name: 'Lampada da Banco', damage: 20, knockback: 150, speed: 330, effect: 'heavy' },
  { id: 'sveglia', name: 'Sveglia Urlante', damage: 13, knockback: 65, speed: 440, effect: 'chaos' },
  { id: 'secchio', name: 'Secchio Ammaccato', damage: 17, knockback: 130, speed: 340, effect: 'area', radius: 60 },
  { id: 'fischietto', name: 'Fischietto Tossico', damage: 7, knockback: 40, speed: 500, effect: 'disturb' },
  { id: 'fune', name: 'Fune Ingrovigliata', damage: 10, knockback: 80, speed: 360, effect: 'trap' },
  { id: 'walkman', name: 'Walkman Esploso', damage: 15, knockback: 100, speed: 410, effect: 'chaos' },
  { id: 'lattina', name: 'Lattina Pressata', damage: 12, knockback: 95, speed: 480, effect: 'bounce', bounces: 1 },
  { id: 'totem', name: 'Totem Cartonato', damage: 19, knockback: 160, speed: 290, effect: 'heavy' },
  { id: 'pistola-colla', name: 'Pistola Colla Fusa', damage: 14, knockback: 75, speed: 430, effect: 'trap' },
  { id: 'pallina', name: 'Pallina Pazza', damage: 9, knockback: 130, speed: 550, effect: 'bounce', bounces: 4 },
  { id: 'gnomo', name: 'Gnomo da Cantiere', damage: 23, knockback: 170, speed: 280, effect: 'heavy' },
];

export const getRandomPackage = () => {
  const pool = [...OBJECTS].sort(() => Math.random() - 0.5);
  return [pool[0], pool[1]] as const;
};
