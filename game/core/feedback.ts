import * as Phaser from 'phaser';

export const playBeep = (scene: Phaser.Scene, type: 'throw' | 'impact' | 'pick' | 'ko') => {
  const ctx = (scene.sound.context as AudioContext | undefined);
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const map = { throw: 320, impact: 190, pick: 520, ko: 130 };
  osc.frequency.value = map[type];
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
};

export const materialColor = (effect: string) => {
  if (effect === 'heavy' || effect === 'bounce') return 0x94a3b8; // metallo
  if (effect === 'trap') return 0xf5e6b3; // carta
  if (effect === 'area') return 0xb0f2ff; // ghiaccio
  if (effect === 'disturb') return 0xe4c1ff; // crema
  return 0x7dd3fc; // elettricità
};
