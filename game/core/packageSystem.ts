import { OBJECTS, ThrowableObject } from '../data/objects';

export type Rarity = 'common' | 'weird' | 'rare' | 'absurd';

export type PackageOption = ThrowableObject & { rarity: Rarity; functionType: ThrowableObject['effect'] };

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 65,
  weird: 22,
  rare: 10,
  absurd: 3,
};

const rarityByDamage = (damage: number): Rarity => {
  if (damage >= 21) return 'absurd';
  if (damage >= 17) return 'rare';
  if (damage >= 13) return 'weird';
  return 'common';
};

const weightedRarity = (rng = Math.random): Rarity => {
  const roll = rng() * 100;
  let cursor = 0;
  for (const rarity of ['common', 'weird', 'rare', 'absurd'] as const) {
    cursor += RARITY_WEIGHTS[rarity];
    if (roll <= cursor) return rarity;
  }
  return 'common';
};

export const buildPackagePool = () =>
  OBJECTS.map((obj) => ({ ...obj, rarity: rarityByDamage(obj.damage), functionType: obj.effect }));

export const createRandomPackage = (rng = Math.random): readonly [PackageOption, PackageOption] => {
  const pool = buildPackagePool();
  const pick = () => {
    const targetRarity = weightedRarity(rng);
    const preferred = pool.filter((o) => o.rarity === targetRarity);
    const source = preferred.length ? preferred : pool;
    return source[Math.floor(rng() * source.length)];
  };

  const first = pick();
  let second = pick();
  let safety = 0;
  while ((second.id === first.id || second.functionType === first.functionType) && safety < 20) {
    second = pick();
    safety += 1;
  }
  if (second.id === first.id) {
    second = pool.find((o) => o.id !== first.id) ?? first;
  }
  return [first, second];
};

export const chooseOrTimeout = (
  options: readonly [PackageOption, PackageOption],
  choice: 0 | 1 | null,
  rng = Math.random,
) => {
  if (choice === 0 || choice === 1) return options[choice];
  return options[Math.floor(rng() * 2) as 0 | 1];
};
