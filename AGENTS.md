# AGENTS.md

## Architettura
- Logica di gioco solo in `/game`.
- UI React solo in `/app` e `/components`.
- Dati centralizzati in `/game/data`.

## Qualità
- Evitare hardcode degli effetti dentro `ArenaScene`.
- Preferire commit piccoli e descrittivi.
- Prima di chiudere: `npm run build` deve passare.
