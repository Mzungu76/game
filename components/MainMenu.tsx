import Link from 'next/link';

export function MainMenu() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="junk-panel w-full max-w-3xl p-8">
        <span className="hazard-label">Toy Junkpunk Diorama</span>
        <h1 className="mt-4 text-5xl font-black uppercase tracking-tight text-amber-400">Robaccia</h1>
        <p className="mt-3 text-lg text-zinc-200">
          Arena giocattolo fatta di cartone, metallo ammaccato e plastica rattoppata. Scegli robaccia e lanciala.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="junk-card">⚙️ Metallo</span>
          <span className="junk-card">📦 Cartone</span>
          <span className="junk-card">🧪 Pasticci</span>
        </div>
        <div className="mt-8">
          <Link href="/play" className="junk-btn">Entra nel Magazzino</Link>
        </div>
      </div>
    </main>
  );
}
