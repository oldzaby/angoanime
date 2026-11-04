// IRADU stream server: torrent (infoHash) -> HTTP com suporte a Range
// Uso: npm i webtorrent && node server.js   (Node 18+)
import http from 'node:http';
import WebTorrent from 'webtorrent';

const PORT = process.env.PORT || 11471;
const client = new WebTorrent();
const cache = new Map();
const MIME = { mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska', avi: 'video/x-msvideo' };

const getTorrent = (hash, trackers) => {
  if (!cache.has(hash)) {
    const magnet = `magnet:?xt=urn:btih:${hash}` + trackers.map(t => '&tr=' + encodeURIComponent(t)).join('');
    cache.set(hash, new Promise(res => client.add(magnet, {}, res)));
  }
  return cache.get(hash);
};

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const u = new URL(req.url, 'http://localhost');
  const m = u.pathname.match(/^\/stream\/([a-f0-9]{40})(?:\/(\d+))?$/i);
  if (!m) { res.writeHead(404); return res.end(); }

  const t = await getTorrent(m[1].toLowerCase(), u.searchParams.getAll('tr'));
  const file = m[2] != null
    ? t.files[+m[2]]
    : t.files.filter(f => /\.(mp4|m4v|webm|mkv|avi)$/i.test(f.name)).sort((a, b) => b.length - a.length)[0];
  if (!file) { res.writeHead(404); return res.end(); }

  let start = 0, end = file.length - 1;
  const range = req.headers.range;
  if (range) {
    const [a, b] = range.replace('bytes=', '').split('-');
    start = parseInt(a, 10) || 0;
    if (b) end = Math.min(parseInt(b, 10), end);
  }
  const ext = file.name.split('.').pop().toLowerCase();
  res.writeHead(range ? 206 : 200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    ...(range && { 'Content-Range': `bytes ${start}-${end}/${file.length}` }),
  });
  const stream = file.createReadStream({ start, end });
  stream.pipe(res);
  res.on('close', () => stream.destroy());
}).listen(PORT, '127.0.0.1', () => console.log(`IRADU stream server em http://127.0.0.1:${PORT}`));
