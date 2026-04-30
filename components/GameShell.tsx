'use client';

import { useEffect, useRef } from 'react';

export function GameShell() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import('phaser').Game | undefined;

    const boot = async () => {
      const Phaser = (await import('phaser')).default;
      const { ArenaScene } = await import('@/game/core/ArenaScene');
      if (!mountRef.current) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: mountRef.current,
        width: 1200,
        height: 760,
        physics: { default: 'arcade', arcade: { debug: false } },
        scene: [ArenaScene],
      });
    };

    void boot();
    return () => game?.destroy(true);
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <h1 className="text-3xl font-extrabold uppercase text-hazard">/play — Magazzino della Vergogna</h1>
        <p className="text-sm text-zinc-300">WASD muovi, click sinistro lanci verso mouse, Space auto-lancio, 1/2 cambia oggetto.</p>
        <div ref={mountRef} className="overflow-hidden rounded-lg border-2 border-hazard/60" />
      </div>
    </main>
  );
}
