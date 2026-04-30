import { ThrowableObject } from '../data/objects';

export const applyEffectMultiplier = (obj: ThrowableObject) => {
  switch (obj.effect) {
    case 'heavy': return { damage: 1.2, knockback: 1.2 };
    case 'disturb': return { damage: 0.8, knockback: 1.1 };
    case 'trap': return { damage: 0.95, knockback: 0.8 };
    case 'area': return { damage: 1, knockback: 0.9 };
    case 'chaos': return { damage: 0.7 + Math.random() * 0.9, knockback: 0.7 + Math.random() * 1.2 };
    default: return { damage: 1, knockback: 1 };
  }
};
