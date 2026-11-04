# IRADU Filmes & Séries (desktop)

Requisitos: Node 18+ (recomendado 20+).

## Desenvolvimento
```bash
npm install
npm start          # abre a app com o servidor de torrents embutido
npm run server     # opcional: só o servidor, para usar index.html no navegador
```

## Gerar instaladores
```bash
npm run dist       # cria instalador para o sistema onde corre (dist/)
```
Windows → `.exe` (NSIS) · macOS → `.dmg` · Linux → `.AppImage`.
Cada sistema deve ser compilado no próprio sistema.

## Estrutura
- `index.html`  interface e cliente do protocolo de addons
- `server.js`   torrent → HTTP com suporte a Range
- `main.js`     janela Electron + arranque do servidor
- `package.json` scripts e configuração de empacotamento

## Notas
- Os dados (biblioteca, addons, progresso) ficam no armazenamento local da app.
- Ícone: coloque `build/icon.png` (512×512) para personalizar o instalador.
- O Chromium do Electron não decodifica HEVC/H.265 nem alguns áudios (AC3/DTS).
  Próximo passo para cobrir isso: transcodificação com ffmpeg no `server.js`.
- Instale apenas addons de fontes que tem direito a utilizar.
