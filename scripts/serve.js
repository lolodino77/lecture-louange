#!/usr/bin/env node
// Petit serveur statique local pour consulter le site : node scripts/serve.js [dossier] [port]
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'site'));
const port = parseInt(process.argv[3] || process.env.PORT || '8123', 10);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };

const url = `http://localhost:${port}/`;
const wantOpen = process.argv.includes('--open');

// Ouvre le navigateur par défaut du système sur le site.
function openBrowser() {
  const { exec } = require('child_process');
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd);
}

const server = http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(root, p);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Introuvable');
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  })
  .listen(port, () => {
    console.log(`Site servi sur ${url} (dossier ${root})`);
    if (wantOpen) openBrowser();
  });

// Port déjà pris : le site tourne sans doute déjà (autre fenêtre) ; on ouvre simplement le navigateur dessus.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Le port ${port} est déjà utilisé : le site tourne probablement déjà sur ${url}`);
    if (wantOpen) openBrowser();
    setTimeout(() => process.exit(0), 500);
  } else {
    throw err;
  }
});
