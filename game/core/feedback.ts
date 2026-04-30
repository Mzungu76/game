import * as Phaser from 'phaser';

type BeepType = 'throw' | 'impact' | 'pick' | 'ko';

const getAudioContext = (sound: Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager) => {
  if ('context' in sound) return sound.context as AudioContext;
  return null;
};

export const playBeep = (scene: Phaser.Scene, type: BeepType) => {
  const ctx = getAudioContext(scene.sound);
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const map: Record<BeepType, number> = { throw: 320, impact: 190, pick: 520, ko: 130 };
  osc.frequency.value = map[type];
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
};

export const materialColor = (effect: string) => {
  if (effect === 'heavy' || effect === 'bounce') return 0x94a3b8;
  if (effect === 'trap') return 0xf5e6b3;
  if (effect === 'area') return 0xb0f2ff;
  if (effect === 'disturb') return 0xe4c1ff;
  return 0x7dd3fc;
};
