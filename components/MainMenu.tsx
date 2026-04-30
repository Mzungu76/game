import Link from 'next/link';

export function MainMenu() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="rounded-full border border-hazard/80 bg-hazard/20 px-3 py-1 text-sm font-semibold uppercase tracking-wider">
        Toy Junkpunk Diorama
      </span>
      <h1 className="text-5xl font-black uppercase tracking-tight text-hazard">Robaccia</h1>
      <p className="max-w-2xl text-lg text-zinc-300">
        Arena shooter caotico: scegli una delle due robacce del pacchetto e lanciala contro il bot nel
        <strong> Magazzino della Vergogna</strong>.
      </p>
      <Link href="/play" className="rounded-md bg-hazard px-6 py-3 font-bold text-zinc-900 hover:bg-orange-400">
        Gioca Ora
      </Link>
    </main>
  );
}
